import pytest
from apps.access_manager.infrastructure.zte.discovery.profiles import select_profile,fingerprint
from apps.access_manager.infrastructure.zte.discovery.multimodel import find_family,catalog
@pytest.mark.parametrize('model',['ZXHN H3601P','H3601P','zxhn-h3601p','ZXHNH3601P'])
@pytest.mark.parametrize('firmware',['V9.0.0P1_MUL','V9.0.0P2_VN1','V9.0.0P3_MUL'])
def test_identity(model,firmware):
 assert select_profile(model,firmware).name=='h3601p_v9'
 assert find_family(model)==('H3601P','h3601p_v9')
 assert fingerprint(model,firmware)['firmware']==firmware
@pytest.mark.parametrize('model',['H3600P','H3601PE','H3610','H3601P9','F670L','F6600P'])
def test_no_collision(model):assert select_profile(model) is None

def test_existing_families_and_catalog():
 assert find_family('H3600P')==('H3600P','h288a')
 assert find_family('F6600P')==('F6600P','f6640')
 assert next(r for r in catalog()['models'] if r['model']=='H3601P')['evidence']=='Sentinel_P2_VN1_public_candidates'
