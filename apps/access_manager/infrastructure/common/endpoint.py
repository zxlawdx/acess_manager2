"""Normalize a remote SSH endpoint without credentials or CLI fragments."""
import ipaddress
from urllib.parse import urlsplit


def normalize_ssh_target(host, port=None, default_port=None):
    text=str(host or '').strip()
    if not text or len(text)>253 or any(c in text for c in '\r\n /@;|&<>`$'):
        raise ValueError('Host SSH inválido.')
    try:
        ipaddress.ip_address(text)
        hostname=text
    except ValueError:
        parsed=urlsplit('ssh://'+text)
        hostname=parsed.hostname
        if not hostname: raise ValueError('Host SSH inválido.')
        if parsed.port is not None:
            if port not in (None,''): raise ValueError('Informe a porta em apenas um campo.')
            port=parsed.port
    if port in (None,''): port=default_port
    if port is not None:
        if isinstance(port,bool): raise ValueError('Porta inválida.')
        try: port=int(port)
        except (TypeError,ValueError): raise ValueError('Porta inválida.') from None
        if not 1<=port<=65535: raise ValueError('Porta inválida.')
    return hostname,port
