from apps.access_manager.domain.capabilities import CapabilitySet
class DeploymentProvider:
    vendor='deployment'
    def __init__(self): self._connected=False; self._observations=[]
    @property
    def connected(self): return self._connected
    @property
    def capabilities(self): return CapabilitySet()
    def connect(self, host, username, password, **kwargs): self._connected=True; return {'vendor':'deployment','model':kwargs.get('model_hint'),'protocol_family':'unknown'}
    def disconnect(self): self._connected=False
    def get_device_info(self): return {'deployment':True,'observations':list(self._observations)}
