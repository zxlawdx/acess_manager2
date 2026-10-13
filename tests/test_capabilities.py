import pytest
from apps.access_manager.domain.capabilities import *
def test_supported_write_is_enabled_without_second_gate():
    c=Capability('wifi',SupportStatus.SUPPORTED,SupportStatus.SUPPORTED,EvidenceLevel.AUTOMATED_TESTED)
    data=c.public(); assert data['enabled']['write'] is True
def test_unsupported_write_is_unavailable():
    caps=CapabilitySet([Capability('x')])
    with pytest.raises(CapabilityUnavailable): caps.require_write('x')

def test_partial_write_is_visible_but_not_executable():
    c=Capability('wifi',write=SupportStatus.PARTIAL,evidence=EvidenceLevel.FIXTURE_VALIDATED)
    assert c.public()['enabled']['write'] is False
    assert c.writable is False
    caps=CapabilitySet([c])
    with pytest.raises(CapabilityUnavailable):
        caps.require_write('wifi')
