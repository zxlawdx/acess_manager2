"""Verify or re-ingest only the four catalogued CC0 GLBs. No whole-pack downloads."""
from pathlib import Path
import argparse
import hashlib
import json
import struct
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1] / 'apps/access_manager/static/models/world3d'

def inspect_glb(data):
    if len(data) < 20 or data[:4] != b'glTF':
        raise ValueError('Expected binary glTF')
    version, total, size = struct.unpack_from('<III', data, 4)
    if version != 2 or total != len(data) or size > len(data)-20:
        raise ValueError('Invalid GLB length or version')
    document = json.loads(data[20:20+size])
    # A single self-contained GLB must not fetch untracked remote resources.
    for record in document.get('buffers', []) + document.get('images', []):
        if 'uri' in record and not record['uri'].startswith('data:'):
            raise ValueError('External dependencies are not permitted')
    return sum(document['accessors'][primitive['indices']]['count'] // 3
               for mesh in document.get('meshes', [])
               for primitive in mesh['primitives'] if 'indices' in primitive)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ingest', action='store_true', help='Download the exact catalogued bytes')
    args = parser.parse_args()
    catalog = json.loads((ROOT / 'catalog.json').read_text())
    for asset in catalog['assets']:
        path = ROOT / asset['file']
        if path.parent != ROOT or path.suffix != '.glb' or asset['license'] != 'CC0-1.0':
            raise ValueError('Invalid catalog entry')
        if args.ingest:
            if not asset['source'].startswith('https://raw.githubusercontent.com/'):
                raise ValueError('Unapproved source')
            with urlopen(asset['source'], timeout=30) as response:
                data = response.read(2_000_001)
        else:
            data = path.read_bytes()
        if len(data) != asset['size'] or hashlib.sha256(data).hexdigest() != asset['sha256']:
            raise ValueError(f'Integrity failure: {asset["id"]}')
        if inspect_glb(data) != asset['triangles']:
            raise ValueError('Triangle metadata changed')
        if args.ingest:
            path.write_bytes(data)
        print(f'{asset["id"]}: {len(data)} bytes, {asset["triangles"]} triangles, CC0 verified')

if __name__ == '__main__':
    main()
