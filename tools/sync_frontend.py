"""Build the classic Vela runtime from modules before collecting static assets."""
from pathlib import Path
import os
import subprocess

ROOT=Path(__file__).resolve().parents[1]

def build(check=False):
    executable=ROOT/'node_modules'/'.bin'/('esbuild.cmd' if os.name=='nt' else 'esbuild')
    if not executable.exists():
        raise SystemExit('Execute npm ci antes de python tools/sync_frontend.py.')
    base=ROOT/'apps/access_manager/static/js'
    result=subprocess.run([str(executable),str(base/'entry.js'),'--bundle','--format=iife','--target=es2020','--charset=utf8'],capture_output=True,text=True,check=True,cwd=ROOT)
    output=base/'runtime.js'
    if check:
        if output.read_text(encoding='utf-8')!=result.stdout:
            raise SystemExit('runtime.js desatualizado; execute tools/sync_frontend.py.')
    else:
        output.write_text(result.stdout,encoding='utf-8')
    print('Frontend sincronizado.' if not check else 'Frontend está atualizado.')

if __name__=='__main__':
    import sys
    build('--check' in sys.argv)
