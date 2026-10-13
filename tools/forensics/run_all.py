from __future__ import annotations
import argparse, json, sys
from pathlib import Path

HERE=Path(__file__).resolve().parent
if str(HERE) not in sys.path: sys.path.insert(0,str(HERE))
from common import build_dataset, build_parity, counts, evidence_ref, json_dump, md_table


def refs(rows, limit=80):
    return [(r.get('file',''),r.get('line',''),r.get('qualified') or r.get('name') or r.get('endpoint') or r.get('context','')[:120]) for r in rows[:limit]]


def write_docs(out: Path, legacy, nxt, parity):
    docs=out/'docs'/'forensics'; docs.mkdir(parents=True,exist_ok=True)
    artifacts=out/'artifacts'; artifacts.mkdir(parents=True,exist_ok=True)

    lc, nc=counts(legacy), counts(nxt)
    (docs/'LEGACY_FILE_INVENTORY.md').write_text('# Legacy file inventory\n\n'+md_table(['Path','Size','SHA-256'],((x['path'],x['size'],x['sha256']) for x in legacy['files'])),encoding='utf-8')
    (docs/'LEGACY_SYMBOL_INVENTORY.md').write_text('# Legacy Python symbol inventory\n\n'+md_table(['File','Line','Kind','Symbol'],((x['file'],x['line'],x['kind'],x['qualified']) for x in legacy['symbols'])),encoding='utf-8')
    (docs/'LEGACY_HTTP_ENDPOINTS.md').write_text('# Legacy HTTP call inventory\n\n'+md_table(['File','Line','Symbol','Call','Endpoint'],((x['file'],x['line'],x['symbol'],x['call'],x['endpoint']) for x in legacy['http_calls'])),encoding='utf-8')
    endpoint_rows = legacy['device_endpoint_catalogue']
    (docs/'LEGACY_DEVICE_ENDPOINTS.md').write_text(
        '# Legacy device endpoint catalogue\n\n'
        '> Mechanical catalogue. Fields that cannot be proven statically remain `UNKNOWN_*`; no protocol values are invented.\n\n'
        + md_table(
            ['Vendor','Model/family','Feature','R/W','Method','Scheme','Port','Path','Query','Source','Tests/fixtures'],
            ((x['vendor'], ', '.join(x['model_family']) or 'UNKNOWN', x['feature'], x['read_write'], x['http_method'], x['scheme'], x['port'], x['path'], x['query_string'], f"{x['source_file']}:{x['source_line']}", '; '.join((x['tests']+x['fixtures'])[:4])) for x in endpoint_rows)
        ),
        encoding='utf-8'
    )
    (docs/'LEGACY_AUTH_FAMILIES.md').write_text('# Legacy authentication evidence\n\n## Protocol/auth families\n\n'+md_table(['Family','Occurrences','Evidence'],((x['family'],x['occurrences'],', '.join(evidence_ref(e) for e in x['evidence'][:6])) for x in legacy['protocol_families']))+'\n\n## Auth hits\n\n'+md_table(['File','Line','Context'],((x['file'],x['line'],x['context']) for x in legacy['auth'])),encoding='utf-8')
    (docs/'LEGACY_PROTOCOL_FAMILIES.md').write_text('# Legacy protocol families\n\n'+md_table(['Family','Occurrences','Evidence'],((x['family'],x['occurrences'],', '.join(evidence_ref(e) for e in x['evidence'][:10])) for x in legacy['protocol_families'])),encoding='utf-8')
    (docs/'LEGACY_MODEL_MATRIX.md').write_text('# Legacy model matrix\n\n'+md_table(['Model','Count','First evidence'],((x['model'],x['count'],evidence_ref(x['occurrences'][0]) if x['occurrences'] else '') for x in legacy['models'])),encoding='utf-8')
    feature_rows=[]
    for f,ev in legacy['features'].items(): feature_rows.append((f,len(ev),', '.join(evidence_ref(x) for x in ev[:8])))
    (docs/'LEGACY_FEATURE_MATRIX.md').write_text('# Legacy feature evidence matrix\n\n'+md_table(['Feature','Evidence count','Examples'],feature_rows),encoding='utf-8')
    (docs/'LEGACY_WRITES.md').write_text('# Legacy write/mutation symbols\n\n'+md_table(['File','Line','Symbol'],refs(legacy['writes'],100000)),encoding='utf-8')
    (docs/'LEGACY_READS.md').write_text('# Legacy read/query symbols\n\n'+md_table(['File','Line','Symbol'],refs(legacy['reads'],100000)),encoding='utf-8')
    (docs/'LEGACY_PARSERS.md').write_text('# Legacy parser evidence\n\n'+md_table(['File','Line','Context'],((x['file'],x['line'],x['context']) for x in legacy['parsers'])),encoding='utf-8')
    transport=[x for x in legacy['http_calls'] if any(k in json.dumps(x).lower() for k in ('verify','timeout','redirect','http','https'))]
    (docs/'LEGACY_TRANSPORTS.md').write_text('# Legacy transports\n\n'+md_table(['File','Line','Call','Endpoint','Timeout','Verify','Redirects'],((x['file'],x['line'],x['call'],x['endpoint'],x.get('timeout'),x.get('verify'),x.get('allow_redirects')) for x in transport)),encoding='utf-8')
    (docs/'LEGACY_FIXTURES.md').write_text('# Legacy fixtures\n\n'+md_table(['File','Size','Models','SHA-256'],((x['file'],x['size'],', '.join(x['models']),x['sha256']) for x in legacy['fixtures'])),encoding='utf-8')
    (docs/'LEGACY_TESTS.md').write_text('# Legacy tests\n\n'+md_table(['File','Count','Classification','Tests'],((x['file'],x['test_count'],', '.join(x['classification']),', '.join(x['tests'][:12])) for x in legacy['tests'])),encoding='utf-8')
    (docs/'LEGACY_FRONTEND_BEHAVIOR.md').write_text('# Legacy frontend/API route evidence\n\n'+md_table(['Side','Method','Route','File','Line'],((x['side'],x['method'],x['route'],x['file'],x['line']) for x in legacy['frontend'])),encoding='utf-8')
    quirks=[]
    for term in ('verify=False','https://','SSLPort','allow_redirects','timeout=','RequestFile','Referer','Origin','single_write','TUNNELED'):
        matches=[e for e in legacy['endpoints'] if term.lower() in e['context'].lower()]
        if matches: quirks.append((term,len(matches),', '.join(evidence_ref(x) for x in matches[:8])))
    (docs/'LEGACY_QUIRKS.md').write_text('# Legacy quirks / transport workarounds\n\n'+md_table(['Marker','Occurrences','Evidence'],quirks),encoding='utf-8')
    (docs/'LEGACY_SECRETS_AUDIT.md').write_text('# Legacy secrets audit\n\nValues are intentionally redacted.\n\n'+md_table(['File','Line','Name','Value','Fingerprint'],((x['file'],x['line'],x['name'],x['value'],x['fingerprint']) for x in legacy['secrets'])),encoding='utf-8')

    parity_rows=[]
    for p in parity:
        le=p['legacy_evidence']; ne=p['next_evidence']
        parity_rows.append((p['feature'],'YES' if p['legacy'] else 'NO','YES' if p['next'] else 'NO',p['model'],', '.join(evidence_ref(x) for x in le),', '.join(evidence_ref(x) for x in ne),p['status']))
    (out/'docs'/'PARITY_MATRIX.md').write_text('# Automated evidence parity matrix\n\n> Mechanical evidence matrix. `EVIDENCE_BOTH_REVIEW_REQUIRED` is not a functional parity claim; tests/runtime evidence decide final status.\n\n'+md_table(['Feature','Legacy','Next','Model','Legacy Evidence','Next Evidence','Status'],parity_rows),encoding='utf-8')

    snapshot={'legacy':{'root':legacy['root'],'counts':lc,'file_hashes':{x['path']:x['sha256'] for x in legacy['files']}},'next':{'root':nxt['root'],'counts':nc,'file_hashes':{x['path']:x['sha256'] for x in nxt['files']}}}
    json_dump(artifacts/'snapshot.json',snapshot)
    json_dump(artifacts/'legacy_files.json',legacy['files'])
    json_dump(artifacts/'legacy_symbols.json',legacy['symbols'])
    json_dump(artifacts/'legacy_http_endpoints.json',legacy['http_calls'])
    json_dump(artifacts/'legacy_device_endpoints.json',legacy['device_endpoint_catalogue'])
    json_dump(artifacts/'legacy_endpoint_literals.json',legacy['endpoints'])
    json_dump(artifacts/'legacy_features.json',legacy['features'])
    json_dump(artifacts/'legacy_models.json',legacy['models'])
    json_dump(artifacts/'legacy_auth.json',{'hits':legacy['auth'],'families':legacy['protocol_families']})
    json_dump(artifacts/'legacy_writes.json',legacy['writes'])
    json_dump(artifacts/'legacy_reads.json',legacy['reads'])
    json_dump(artifacts/'legacy_parsers.json',legacy['parsers'])
    json_dump(artifacts/'legacy_tests.json',legacy['tests'])
    json_dump(artifacts/'parity_matrix.json',parity)
    json_dump(artifacts/'next_inventory.json',nxt)


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--legacy-root',type=Path,required=True); ap.add_argument('--next-root',type=Path,required=True); ap.add_argument('--output-root',type=Path)
    a=ap.parse_args(); out=a.output_root or a.next_root
    legacy=build_dataset(a.legacy_root.resolve()); nxt=build_dataset(a.next_root.resolve()); parity=build_parity(legacy,nxt); write_docs(out,legacy,nxt,parity)
    print(json.dumps({'legacy':counts(legacy),'next':counts(nxt),'parity_rows':len(parity)},indent=2,ensure_ascii=False))
if __name__=='__main__': main()
