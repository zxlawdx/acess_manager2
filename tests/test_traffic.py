from apps.access_manager.domain.models import TrafficSample
from apps.access_manager.domain.traffic import calculate_rate
def test_rate():
    r=calculate_rate(TrafficSample(0,1_000_000,200),TrafficSample(2,1_500_000,600)); assert r.rx_bytes_per_second==250_000; assert r.tx_bytes_per_second==200
def test_counter_reset_is_not_negative():
    r=calculate_rate(TrafficSample(0,1000,1000),TrafficSample(1,10,20)); assert r.counter_reset; assert r.rx_bytes_per_second is None
