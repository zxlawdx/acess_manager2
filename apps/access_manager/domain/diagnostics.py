"""Provider-neutral results, preserving the native response in advanced."""
import re


def number(value):
    try:
        return float(str(value).replace(',', '.'))
    except (ValueError, TypeError):
        return None


def normalize_diagnostic(kind, result):
    data = dict(result or {})
    out = {'kind': kind, 'target': data.get('target') or data.get('host'),
           'interface': data.get('interface'), 'protocol': data.get('protocol') or data.get('ip_version'),
           'status': data.get('diagnostics_state') or ('Concluído' if data.get('verified') is True else 'Resultado recebido'),
           'advanced': data}
    text = str(data.get('resultado') or data.get('output') or '')
    if kind == 'ping':
        received = number(data.get('sucesso', data.get('received')))
        failed = number(data.get('falha'))
        sent = number(data.get('sent'))
        if sent is None and received is not None and failed is not None:
            sent = received + failed
        m = re.search(r'(\d+)\s+packets? transmitted.*?(\d+)\s+(?:packets? )?received', text, re.I | re.S)
        if m:
            sent, received = map(float, m.groups())
        loss = number(data.get('perda_percentual', data.get('loss_percent')))
        if loss is None and sent:
            loss = 100 * (sent - received) / sent if received is not None else None
        out.update(sent=sent, received=received, loss_percent=loss,
                   min_ms=number(data.get('minimo_ms', data.get('min_ms'))),
                   avg_ms=number(data.get('medio_ms', data.get('avg_ms'))),
                   max_ms=number(data.get('maximo_ms', data.get('max_ms'))))
    else:
        hops = data.get('hops')
        if not isinstance(hops, list):
            hops = []
            for line in text.splitlines():
                m = re.match(r'^\s*(\d+)\s+(.+)', line)
                if not m:
                    continue
                body = m.group(2)
                address = re.search(r'(?:\d{1,3}\.){3}\d{1,3}|[0-9a-fA-F]*:[0-9a-fA-F:]+', body)
                timings = [number(x) for x in re.findall(r'([\d.,]+)\s*ms', body)]
                hops.append({'number': int(m.group(1)), 'host': address.group(0) if address else None,
                             'latencies_ms': timings, 'timeout': '*' in body and not timings})
        out['hops'] = [{'number': h.get('number', h.get('numero')), 'host': h.get('host') or h.get('ip'),
                        'latencies_ms': h.get('latencies_ms', h.get('latencias_ms', [])),
                        'timeout': h.get('timeout')} for h in hops]
    return out
