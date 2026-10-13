import base64
from types import SimpleNamespace
from threading import RLock
from pathlib import Path
import pytest
from apps.access_manager.infrastructure.artifacts import ArtifactRepository,ManagementArtifacts

@pytest.fixture
def setup(tmp_path):
    repository=ArtifactRepository(tmp_path/'artifacts')
    session=SimpleNamespace(vendor=SimpleNamespace(value='zte'),model='F670L',firmware='v1',host='router',metadata={'device_identity':'device1'})
    calls=[]
    commands=SimpleNamespace(execute=lambda *a:(calls.append(a) or {'success':True}))
    service=ManagementArtifacts(SimpleNamespace(session=session,operation_lock=RLock()),commands,repository)
    return repository,service,calls

def upload(service,kind='backup'):
    return service.upload({'kind':kind,'filename':'../../config.bin','device':{'vendor':'zte','model':'F670L','firmware':'v1'},'content_base64':base64.b64encode(b'synthetic-config').decode()})

def test_artifact_ids_and_hashes_are_immutable_and_paths_not_accepted(setup):
    repo,service,calls=setup;meta=upload(service);assert meta['filename']=='config.bin';assert len(meta['sha256'])==64;assert 'path' not in meta
    assert repo.download(meta['id'])['content_base64']==base64.b64encode(b'synthetic-config').decode()
    assert repo.list()==[meta]
    with pytest.raises(ValueError):repo.read('../../etc/passwd')
    _,path,_=repo.read(meta['id']);path.write_bytes(b'altered')
    with pytest.raises(ValueError):repo.read(meta['id'])
    assert calls==[]

@pytest.mark.parametrize('kind,word,feature,method',[('backup','RESTAURAR','restore','restore_backup'),('firmware','ATUALIZAR','firmware','upload_firmware')])
def test_critical_apply_requires_confirmation_integrity_and_compatibility_ack(setup,kind,word,feature,method):
    repo,service,calls=setup;meta=upload(service,kind)
    for config in [{'id':meta['id'],'confirmation':'wrong','compatibility_ack':True},{'id':meta['id'],'confirmation':word,'compatibility_ack':False}]:
        with pytest.raises(ValueError):service.apply(config)
    assert calls==[]
    result=service.apply({'id':meta['id'],'confirmation':word,'compatibility_ack':True});assert result['success'];assert len(calls)==1;assert calls[0][:2]==(feature,method)

@pytest.mark.parametrize('field,value',[('vendor','huawei'),('model','different')])
def test_mismatched_metadata_is_rejected_before_upload(setup,field,value):
    _,service,calls=setup;device={'vendor':'zte','model':'F670L'};device[field]=value
    with pytest.raises(ValueError):service.upload({'kind':'firmware','device':device,'content_base64':'eA=='})
    assert calls==[]

def test_serial_mismatch_is_rejected_before_restore(setup):
    repo,service,calls=setup;meta=repo.add(b'config',name='backup.bin',kind='backup',device={**service.identity(),'identifier':'other'},provenance='authenticated_device_export')
    with pytest.raises(ValueError):service.apply({'id':meta['id'],'confirmation':'RESTAURAR','compatibility_ack':True})
    assert calls==[]

@pytest.mark.parametrize('content',[b'',b'<html>login</html>',b'<!DOCTYPE html><form>login</form>'])
def test_invalid_exports_never_become_backups(tmp_path,content):
    with pytest.raises(ValueError):ArtifactRepository(tmp_path).add(content,name='file',kind='backup',device={},provenance='test')

def test_upload_failure_never_retries(setup):
    _,service,calls=setup;meta=upload(service,'firmware')
    def fail(*args):calls.append(args);raise TimeoutError()
    service.commands.execute=fail
    with pytest.raises(TimeoutError):service.apply({'id':meta['id'],'confirmation':'ATUALIZAR','compatibility_ack':True})
    assert len(calls)==1
