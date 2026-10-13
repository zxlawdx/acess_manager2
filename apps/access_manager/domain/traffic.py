from __future__ import annotations
from .models import TrafficRate, TrafficSample

def calculate_rate(previous: TrafficSample, current: TrafficSample) -> TrafficRate:
    dt = current.timestamp - previous.timestamp
    if dt <= 0: raise ValueError("timestamp must increase")
    reset = False
    def rate(a, b):
        nonlocal reset
        if a is None or b is None: return None
        if b < a:
            reset = True
            return None
        return (b-a)/dt
    return TrafficRate(rate(previous.rx_bytes,current.rx_bytes), rate(previous.tx_bytes,current.tx_bytes), reset)
