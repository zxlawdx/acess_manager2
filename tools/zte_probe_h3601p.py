"""Read-only H3601P shape probe. Auth POSTs only; never configuration writes."""
import argparse
import contextlib
import getpass
import io
import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from apps.access_manager.infrastructure.zte.discovery.profile_runtime import read_feature, ReadFailure


def collect(provider):
    client=provider._need()
    if not getattr(client,'read_profile',None):
        return provider.runtime_diagnostic()
    for feature in ('wifi_clients','lan_clients','dhcp_leases'):
        try:read_feature(client,feature)
        except ReadFailure:pass
    return provider.runtime_diagnostic()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host',required=True)
    parser.add_argument('--username',default=None)
    parser.add_argument('--https',action='store_true')
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    username=args.username or input('Usuário: ')
    password=getpass.getpass('Senha: ')
    provider=ZTEProvider()
    try:
        # Legacy protocol stdout is never exported or included in failures.
        with contextlib.redirect_stdout(io.StringIO()):
            provider.connect(args.host,username,password,https=args.https)
            report=collect(provider)
        text=json.dumps(report,ensure_ascii=False,indent=2)
        if args.output:args.output.write_text(text,encoding='utf-8')
        print(text)
    except Exception as error:
        print(json.dumps({'error_type':type(error).__name__,'result':'probe_failed_no_payload_exported'}))
        return 1
    finally:
        with contextlib.redirect_stdout(io.StringIO()):provider.disconnect()
    return 0


if __name__=='__main__':raise SystemExit(main())
