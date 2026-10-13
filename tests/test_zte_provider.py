from apps.access_manager.infrastructure.providers.zte import ZTEProvider
class FakeSession:
    def post(self,*a,**k): return None
class FakeZTE:
    def __init__(self,*a,**k): self.session=FakeSession(); self.logged=False
    def login(self): self.logged=True
    def logout(self): pass
    def device_status(self): return {'modelo':'F670L','firmware':'V1'}
    def wifi_networks(self): return []
    def channel_status(self): return {}
    def wifi_clients(self): return []
    def lan_clients(self): return []
    def wan_status(self): return {'status':'online'}
    def reboot(self): return {'success':True}
def test_reboot_supported_without_global_gate():
    p=ZTEProvider(client_factory=FakeZTE); p.connect('x','u','p'); assert p.capabilities.get('reboot').writable; assert p.reboot()['success']

class FakeF6201B(FakeZTE):
    def device_status(self): return {'modelo':'F6201B','firmware':'V9.3.10P7N7'}

def test_f6201b_only_promotes_wired_captured_writes():
    p=ZTEProvider(client_factory=FakeF6201B); p.connect('x','u','p')
    assert p.capabilities.get('wifi').write.value == 'SUPPORTED'
    assert p.capabilities.get('dns').write.value == 'SUPPORTED'
    assert p.capabilities.get('dhcp').write.value == 'PARTIAL'
    assert p.capabilities.get('dhcp').public()['enabled']['write'] is False
    assert p.capabilities.get('reboot').write.value == 'UNKNOWN'

def test_known_zte_diagnostics_are_command_capable_not_read_only():
    p=ZTEProvider(client_factory=FakeZTE); p.connect('x','u','p')
    assert p.capabilities.get('diagnostics').write.value == 'SUPPORTED'
