"""Closed command grammar; no arbitrary command or privileged mode."""
from dataclasses import dataclass
import re
from apps.access_manager.domain.subscribers import SubscriberQuery


@dataclass(frozen=True)
class ReadCommand:
    feature: str
    command: str


def request(feature, value=None):
    if feature == 'system' and value is None:
        return ReadCommand(feature, 'display version')
    if feature == 'subscriber_detail':
        if not re.fullmatch(r'[0-9]{1,12}', str(value or '')):
            raise ValueError('User ID inválido.')
        return ReadCommand(feature, 'display access-user user-id ' + str(value))
    if feature == 'subscriber_lookup':
        query = SubscriberQuery.parse(value)
        if query.kind != 'PPPOE_USERNAME':
            raise ValueError('Consulta Huawei requer usuário PPPoE ou User ID explícito.')
        return ReadCommand(feature, 'display access-user username ' + query.value)
    raise ValueError('Consulta não permitida.')


def validate(item):
    if not isinstance(item, ReadCommand): raise ValueError('Consulta não permitida.')
    if item.feature == 'system': expected = request('system')
    else:
        prefix = 'display access-user user-id ' if item.feature == 'subscriber_detail' else 'display access-user username '
        if not item.command.startswith(prefix): raise ValueError('Consulta não permitida.')
        expected = request(item.feature, item.command[len(prefix):])
    if item != expected: raise ValueError('Consulta não permitida.')
