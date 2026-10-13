"""Operations recognized from the pinned ThinkLua firmware handler/template."""
import secrets
import time
from .protocol.zte_configuration.zte_post import post_menu
from .protocol.zte_configuration.zte_security import extract_session_tmp_token


def conntrack_status(client):
    xml = client.get_menu('firewall_conntrack_lua.lua')
    client._validar_resposta(xml)
    records = client._parse_instances(xml).get('OBJ_CONNTRACK_ID', [])
    if len(records) != 1:
        raise RuntimeError('Contadores NAT não reconhecidos nesta sessão')
    values = {}
    for field, public in [('ConntrackMax', 'capacity'), ('ConntrackUsed', 'active')]:
        value = str(records[0].get(field, ''))
        if not value.isdigit():
            raise RuntimeError('Contador NAT inválido ou ausente')
        values[public] = int(value)
    return {**values, 'entries_available': False, 'entries': []}


class FactoryReset:
    def __init__(self, clock=time.monotonic):
        self.clock = clock
        self.clear()

    def clear(self):
        self.pending = None

    def _recognize(self, client):
        html = client.get_view('rebootAndReset', Menu3Location=0)
        if not all(marker in html for marker in ('db_resetmgr_lua.lua', 'template_ResetManag', 'Btn_reset')):
            raise RuntimeError('Formulário de restauração de fábrica não reconhecido')
        token = extract_session_tmp_token(html)
        if not token:
            raise RuntimeError('Token da restauração ausente')
        client.session_tmp_token = token
        if client.integrity_check is True and not client.public_key_pem:
            raise RuntimeError('Chave de integridade não disponível')
        client._validar_resposta(client.get_menu('db_resetmgr_lua.lua'))

    def preview(self, client, host):
        self.clear()
        self._recognize(client)
        nonce = secrets.token_urlsafe(24)
        self.pending = {'nonce': nonce, 'host': host, 'created': self.clock()}
        return {'nonce': nonce, 'confirmation': 'RESETAR', 'impact': 'Apaga a configuração do equipamento e encerra a sessão. Faça backup antes de aplicar.'}

    def apply(self, client, host, nonce, confirmation):
        proposal, self.pending = self.pending, None
        if not proposal or proposal['nonce'] != nonce or proposal['host'] != host or self.clock()-proposal['created'] > 120:
            raise ValueError('Preview de restauração inválido ou expirado')
        if confirmation != 'RESETAR':
            raise ValueError('Digite RESETAR para confirmar')
        self._recognize(client)
        try:
            response = post_menu(client, 'db_resetmgr_lua.lua', [('IF_ACTION', 'Reset'), ('Btn_reset', '')])
            client._validar_resposta(response)
        except Exception:
            return {'verified': False, 'uncertain': True, 'expected_session_loss': True, 'message': 'Resposta não confirmada. Não repetir a restauração automaticamente.'}
        return {'success': True, 'verified': False, 'uncertain': True, 'expected_session_loss': True, 'message': 'Comando aceito; confirme o estado após reconectar. Não repetir automaticamente.'}
