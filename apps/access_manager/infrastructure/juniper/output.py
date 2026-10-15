"""In-memory command result and conservative terminal framing detection."""
from dataclasses import dataclass, field
import re
from .errors import JuniperError


@dataclass(frozen=True)
class JunosCommandResult:
    transport: str
    raw: str = field(repr=False)
    output_format: str = 'unknown'
    command_id: str | None = None
    elapsed_ms: int = 0
    exit_status: int | None = None


def normalize(raw, command=None):
    text = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', raw).replace('\r', '')
    while '\b' in text:
        text = re.sub(r'[^\n]\x08', '', text).replace('\b', '')
    if re.search(r'---\s*\(more(?:\s+\d+%)?\)\s*---|---\s*more\s*---', text, re.I):
        raise JuniperError('PAGINATED_INCOMPLETE')
    lines = text.splitlines()
    # Only remove recognizable framing. Never salvage arbitrary malformed XML.
    framing=lambda line:bool(re.fullmatch(r'\{(?:master|backup)(?::[0-9]+)?\}',line.strip()) or re.match(r'^(?:Last login:|--- JUNOS [A-Za-z0-9_.-]+)',line))
    while lines and (framing(lines[0]) or not lines[0].strip() or re.fullmatch(r'\S+@\S+[>#%$]\s*', lines[0])
                     or (command and lines[0].strip().endswith(command))):
        lines.pop(0)
    while lines and (framing(lines[-1]) or not lines[-1].strip() or re.fullmatch(r'\S+@\S+[>#%$]\s*', lines[-1])):
        lines.pop()
    return '\n'.join(lines).strip()


def detect(text):
    if not text: return 'empty'
    if text.startswith('<'): return 'xml'
    if re.search(r'^(?:error:|syntax error|unknown command|permission denied|No such subscriber)', text, re.I | re.M):
        return 'error_text'
    if re.search(r'^(?:User [Nn]ame|Username|Interface|Type|Access [Tt]ype|Session ID):', text, re.M):
        return 'cli_text'
    if re.search(r'password:|login:|unauthorized access', text, re.I): return 'auth_banner'
    return 'unknown'


def unpack(payload):
    if isinstance(payload, JunosCommandResult):
        text = normalize(payload.raw)
        kind = detect(text)
        if payload.transport == 'netconf' and kind != 'xml':
            raise JuniperError('EMPTY_RESPONSE' if kind=='empty' else 'XML_SHAPE_UNSUPPORTED')
        return text, kind
    if isinstance(payload, bytes): payload = payload.decode('utf-8', 'replace')
    text = normalize(payload) if isinstance(payload, str) else ''
    return text, detect(text)
