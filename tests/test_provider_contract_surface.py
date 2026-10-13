from apps.access_manager.infrastructure.providers.zte import ZTEProvider


class FakeSession:
    def post(self,*a,**k): return None


class FakeZTE:
    def __init__(self,*a,**k): self.session=FakeSession(); self.calls=[]
    def login(self): pass
    def logout(self): pass
    def device_status(self): return {'modelo':'F670L','firmware':'V1'}
    def lan_ports(self): return [{'port':'LAN1'}]
    def dhcp_status(self): return {'enabled':True}
    def dns_status(self): return {'primary':'1.1.1.1'}
    def optical_status(self): return {'rx':-20}
    def set_radio_config(self,band,config): self.calls.append(('radio',band,config)); return {'verified':True}
    def set_wps(self,band,mode): self.calls.append(('wps',band,mode)); return {'verified':True}
    def set_radio_power(self,band,enabled): self.calls.append(('power',band,enabled)); return {'verified':True}


def test_normalized_read_surface_and_mutation_signatures():
    p=ZTEProvider(client_factory=FakeZTE); p.connect('x','u','p')
    assert p.get_lan()[0]['port']=='LAN1'
    assert p.get_dhcp()['enabled'] is True
    assert p.get_dns()['primary']=='1.1.1.1'
    assert p.get_optical()['rx']==-20
    p.set_wifi_radio({'band':'5GHz','channel':36})
    p.set_wps({'band':'2.4GHz','mode':'PBC'})
    p.set_radio_power({'band':'5GHz','enabled':False})
    assert p.client.calls == [
        ('radio','5GHz',{'channel':36}),
        ('wps','2.4GHz','PBC'),
        ('power','5GHz',False),
    ]
