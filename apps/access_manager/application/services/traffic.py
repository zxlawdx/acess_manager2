"""Session-scoped counter samples. Never sum WAN and LAN observations."""
import time
from apps.access_manager.domain.models import TrafficSample
from apps.access_manager.domain.traffic import calculate_rate


class TrafficSampler:
    def __init__(self, clock=time.monotonic):
        self.clock = clock
        self.session = None
        self.previous = {}

    def sample(self, session, data):
        if session != self.session:
            self.session, self.previous = session, {}
        now = self.clock()
        rows = []
        for source in data.get('sources') or []:
            row = dict(source)
            counters = source.get('counters') or {}
            def counter(name):
                try:
                    v = counters.get(name)
                    return int(v) if v is not None and str(v).strip() else None
                except (TypeError, ValueError):
                    return None
            sample = TrafficSample(now, counter('rx_bytes'), counter('tx_bytes'))
            key = (source.get('source'), str(source.get('identity') or ''))
            prev = self.previous.get(key)
            row['rx_mbps'] = row['tx_mbps'] = None
            if prev and now > prev.timestamp:
                rate = calculate_rate(prev, sample)
                row.update(rx_mbps=None if rate.rx_bytes_per_second is None else rate.rx_bytes_per_second*8/1e6,
                           tx_mbps=None if rate.tx_bytes_per_second is None else rate.tx_bytes_per_second*8/1e6,
                           counter_reset=rate.counter_reset)
            self.previous[key] = sample
            rows.append(row)
        self.previous = {k:v for k,v in self.previous.items() if k in {(r.get('source'),str(r.get('identity') or '')) for r in rows}}
        return {**data, 'sources': rows}
