"""Real Vela runapp/API, with only the router transport replaced for QA.

No browser fetch interception; isolated app data preserves user profiles.
"""
import os
from pathlib import Path
import runpy
import sys
import tempfile
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from requests import Response,HTTPError
from tests.h3601p_support import Client


class BootstrapDevice(Client):
    authenticated_root_html='<html><main>Authenticated shell</main></html>'
    def __init__(self,address,username,password,**kwargs):
        super().__init__(address,username,password,**kwargs)
        self.qa_username=username
        if username=='unknown':self.responses={}
    def login(self):return False if self.qa_username=='rejected' else super().login()
    def device_status(self):
        self.calls.append(('view','statusMgr'))
        response=Response();response.status_code=404
        response.url='http://example.invalid/?_type=menuView&_tag=statusMgr'
        raise HTTPError(response=response)


if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='access-manager-bootstrap-') as directory:
        os.environ['ACCESS_MANAGER_DATA_DIR']=directory
        import apps.access_manager.composition as composition
        composition.zte_provider.client_factory=BootstrapDevice
        composition.router._huawei_probe=lambda *a,**kw:False
        runpy.run_path('tests/visual/native_driver.py',run_name='__main__')
