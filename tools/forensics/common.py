from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlsplit

TEXT_EXTENSIONS = {
    '.py', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.html', '.htm', '.css', '.md',
    '.txt', '.json', '.xml', '.asp', '.cgi', '.lua', '.yml', '.yaml', '.ini', '.cfg',
    '.toml', '.bat', '.ps1', '.sh', '.csv', '.sql', '.env', '.conf'
}
SKIP_DIRS = {'.git', '.pytest_cache', '__pycache__', '.venv', 'venv', 'node_modules', 'staticfiles', 'artifacts', 'forensics'}
ENDPOINT_RE = re.compile(
    r'''(?P<url>https?://[^\s\"'<>]+)|(?P<path>/(?:api|asp|html|cgi-bin|cgi|thinklua|web|goform|boaform|Forms|form|HNAP1)[^\s\"'<>)]*)''',
    re.I,
)
MODEL_RE = re.compile(r'\b(?:(?:EG|HG|HN|HS)\d{4}[A-Z0-9]{0,6}(?:-\d{1,3})?|F\d{3,5}[A-Z]{0,2}|ZXHN\s*[A-Z]?\d{3,5}[A-Z0-9]{0,3}|ZXA10\s*[A-Z]?\d{3,5}[A-Z0-9]{0,3})\b', re.I)
SECRET_NAME_RE = re.compile(r'(?:pass(word)?|secret|token|credential|api[_-]?key|authorization|cookie)', re.I)
AUTH_TERMS = re.compile(r'RandCount|RandString|SessionToken|SesTokenInfo|ASP_CONFIG|csrf|token|cookie|Authorization|GetRand|login\.cgi|user_login', re.I)
PARSER_TERMS = re.compile(r'parse|parser|decode|regex|regexp|BeautifulSoup|ElementTree|lxml|json\.loads|xml|html', re.I)
HTTP_METHODS = {'get', 'post', 'put', 'delete', 'patch', 'request', 'post_read', 'post_write'}

FEATURE_TERMS: dict[str, tuple[str, ...]] = {
    'device_info': ('device', 'device_info', 'device_status', 'firmware', 'hardware', 'uptime'),
    'clients': ('client', 'station', 'associateddevice', 'userdev', 'host'),
    'wifi': ('wifi', 'wlan', 'ssid', 'radio', 'wps'),
    'wan': ('wan', 'pppoe', 'vlan', 'nat'),
    'lan': ('lan', 'ethernet', 'layer3'),
    'dhcp': ('dhcp',),
    'dns': ('dns', 'nslookup'),
    'traffic': ('traffic', 'bytesreceived', 'bytessent', 'rx_bytes', 'tx_bytes', 'packets'),
    'optical': ('optic', 'optical', 'pon', 'rxpower', 'txpower'),
    'diagnostics': ('diagnostic', 'ping', 'traceroute', 'trace_route', 'nslookup'),
    'reboot': ('reboot', 'restart'),
    'tr069': ('tr069', 'cwmp', 'acs'),
    'firewall': ('firewall', 'acl', 'filter'),
    'dmz': ('dmz',),
    'upnp': ('upnp',),
    'backup_restore': ('backup', 'restore', 'config_backup'),
    'firmware': ('firmware', 'softwareversion', 'upgrade'),
    'profiles': ('profile', 'provision'),
}

READ_PREFIXES = ('get_', 'read_', 'list_', 'load_', 'fetch_', 'status', 'probe_', 'detect_', 'resolve_', 'wifi_', 'wan_', 'lan_', 'dhcp_', 'dns_', 'optical_')
WRITE_PREFIXES = ('set_', 'create_', 'update_', 'delete_', 'apply_', 'write_', 'reboot', 'restart', 'factory_', 'restore_', 'upgrade_', 'enable_', 'disable_')

@dataclass
class FileRecord:
    path: str
    size: int
    sha256: str
    extension: str
    kind: str


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def iter_files(root: Path) -> Iterable[Path]:
    for path in root.rglob('*'):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        yield path


def read_text(path: Path) -> str | None:
    if path.suffix.lower() not in TEXT_EXTENSIONS and path.name not in {'Dockerfile', 'Makefile'}:
        return None
    try:
        return path.read_text(encoding='utf-8', errors='replace')
    except OSError:
        return None


def rel(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def file_inventory(root: Path) -> list[dict[str, Any]]:
    rows = []
    for path in iter_files(root):
        text = read_text(path)
        ext = path.suffix.lower()
        if ext == '.py': kind = 'python'
        elif ext in {'.js', '.mjs', '.cjs', '.ts', '.tsx'}: kind = 'frontend'
        elif 'test' in path.parts or path.name.startswith('test_'): kind = 'test'
        elif 'fixture' in path.parts or 'fixtures' in path.parts: kind = 'fixture'
        elif text is not None: kind = 'text'
        else: kind = 'binary'
        rows.append(asdict(FileRecord(rel(root, path), path.stat().st_size, sha256(path), ext, kind)))
    return sorted(rows, key=lambda x: x['path'])


def _decorator_name(node: ast.AST) -> str:
    try:
        return ast.unparse(node)
    except Exception:
        return ''


def python_symbols(root: Path) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for path in iter_files(root):
        if path.suffix != '.py':
            continue
        text = read_text(path)
        if text is None:
            continue
        try:
            tree = ast.parse(text, str(path))
        except SyntaxError:
            continue
        parent: list[str] = []
        def walk(body: list[ast.stmt], parents: list[str]) -> None:
            for node in body:
                if isinstance(node, ast.ClassDef):
                    q = '.'.join([*parents, node.name])
                    out.append({'file': rel(root,path), 'line': node.lineno, 'kind':'class', 'name':node.name, 'qualified':q, 'decorators':[_decorator_name(x) for x in node.decorator_list]})
                    walk(node.body, [*parents, node.name])
                elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    q = '.'.join([*parents, node.name])
                    out.append({'file': rel(root,path), 'line': node.lineno, 'kind':'method' if parents else 'function', 'name':node.name, 'qualified':q, 'decorators':[_decorator_name(x) for x in node.decorator_list]})
                    walk(node.body, [*parents, node.name])
        walk(tree.body, [])
    return sorted(out, key=lambda x:(x['file'], x['line']))


def _const_string(node: ast.AST | None) -> str | None:
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    if isinstance(node, ast.JoinedStr):
        parts=[]
        for value in node.values:
            if isinstance(value, ast.Constant) and isinstance(value.value,str): parts.append(value.value)
            else: parts.append('{...}')
        return ''.join(parts)
    return None


def http_calls(root: Path) -> list[dict[str, Any]]:
    out=[]
    for path in iter_files(root):
        if path.suffix != '.py': continue
        text=read_text(path)
        if text is None: continue
        try: tree=ast.parse(text,str(path))
        except SyntaxError: continue
        class Visitor(ast.NodeVisitor):
            def __init__(self): self.scope=[]
            def visit_ClassDef(self,node):
                self.scope.append(node.name); self.generic_visit(node); self.scope.pop()
            def visit_FunctionDef(self,node):
                self.scope.append(node.name); self.generic_visit(node); self.scope.pop()
            visit_AsyncFunctionDef=visit_FunctionDef
            def visit_Call(self,node):
                name=''
                if isinstance(node.func,ast.Attribute): name=node.func.attr
                elif isinstance(node.func,ast.Name): name=node.func.id
                if name.lower() in HTTP_METHODS:
                    candidate=_const_string(node.args[0]) if node.args else None
                    if candidate and ('/' in candidate or candidate.startswith('http')):
                        kwargs={kw.arg:_const_string(kw.value) for kw in node.keywords if kw.arg}
                        out.append({
                            'file':rel(root,path),'line':node.lineno,'symbol':'.'.join(self.scope),
                            'call':name,'method':('POST' if name.lower().startswith('post') else name.upper()),
                            'endpoint':candidate,'headers':kwargs.get('headers'),'data':kwargs.get('data'),
                            'json':kwargs.get('json'),'timeout':kwargs.get('timeout'),'verify':kwargs.get('verify'),
                            'allow_redirects':kwargs.get('allow_redirects'),
                        })
                self.generic_visit(node)
        Visitor().visit(tree)
    return sorted(out,key=lambda x:(x['file'],x['line']))


def endpoint_literals(root: Path) -> list[dict[str, Any]]:
    rows=[]; seen=set()
    for path in iter_files(root):
        text=read_text(path)
        if text is None: continue
        for i,line in enumerate(text.splitlines(),1):
            for m in ENDPOINT_RE.finditer(line):
                ep=(m.group('url') or m.group('path') or '').rstrip(';,')
                key=(rel(root,path),i,ep)
                if key in seen: continue
                seen.add(key)
                rows.append({'file':key[0],'line':i,'endpoint':ep,'context':line.strip()[:300]})
    return rows


def models(root: Path) -> list[dict[str, Any]]:
    found=defaultdict(list)
    for path in iter_files(root):
        text=read_text(path)
        if text is None: continue
        for i,line in enumerate(text.splitlines(),1):
            for m in MODEL_RE.finditer(line):
                model=m.group(0).upper().strip('.,;:()[]{}\"\'')
                found[model].append({'file':rel(root,path),'line':i})
    return [{'model':k,'occurrences':v[:50],'count':len(v)} for k,v in sorted(found.items())]


def keyword_hits(root: Path, pattern: re.Pattern[str], category: str) -> list[dict[str, Any]]:
    rows=[]
    for path in iter_files(root):
        text=read_text(path)
        if text is None: continue
        for i,line in enumerate(text.splitlines(),1):
            if pattern.search(line):
                rows.append({'file':rel(root,path),'line':i,'category':category,'context':line.strip()[:320]})
    return rows


def read_write_symbols(symbols: list[dict[str, Any]]) -> tuple[list[dict[str,Any]],list[dict[str,Any]]]:
    reads=[]; writes=[]
    for row in symbols:
        n=row['name'].lower()
        if n.startswith(READ_PREFIXES) or any(token in n for token in ('status','info','clients','networks','channels','telemetry')):
            reads.append(row)
        if n.startswith(WRITE_PREFIXES) or n in {'reboot','restart','factory_reset'}:
            writes.append(row)
    return reads,writes


def feature_evidence(root: Path, symbols: list[dict[str,Any]], endpoints: list[dict[str,Any]]) -> dict[str,list[dict[str,Any]]]:
    evidence=defaultdict(list)
    for row in symbols:
        blob=f"{row['file']} {row['qualified']}".lower()
        for feature,terms in FEATURE_TERMS.items():
            if any(term in blob for term in terms):
                evidence[feature].append({'kind':'symbol','file':row['file'],'line':row['line'],'symbol':row['qualified']})
    for row in endpoints:
        blob=f"{row['file']} {row['endpoint']}".lower()
        for feature,terms in FEATURE_TERMS.items():
            if any(term in blob for term in terms):
                evidence[feature].append({'kind':'endpoint','file':row['file'],'line':row['line'],'endpoint':row['endpoint']})
    return {k:v[:80] for k,v in sorted(evidence.items())}


def test_inventory(root: Path) -> list[dict[str,Any]]:
    rows=[]
    for path in iter_files(root):
        rp=rel(root,path)
        if not (path.name.startswith('test_') or '/tests/' in f'/{rp}' or rp.startswith('tests/')): continue
        text=read_text(path) or ''
        tests=[]
        if path.suffix=='.py':
            try:
                tree=ast.parse(text,str(path))
                tests=[n.name for n in ast.walk(tree) if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef)) and n.name.startswith('test_')]
            except SyntaxError: pass
        else:
            tests=re.findall(r'\b(?:test|it)\s*\(\s*[\"\']([^\"\']+)',text)
        classes=[]
        lower=rp.lower()
        for name in ('unit','integration','fixture','regression','hardware','frontend','protocol','auth','parser','mutation'):
            if name in lower or name in text[:4000].lower(): classes.append(name)
        rows.append({'file':rp,'tests':tests,'test_count':len(tests),'classification':classes or ['unclassified']})
    return rows


def fixture_inventory(root: Path) -> list[dict[str,Any]]:
    rows=[]
    for path in iter_files(root):
        rp=rel(root,path)
        if 'fixture' not in rp.lower(): continue
        text=read_text(path)
        rows.append({'file':rp,'size':path.stat().st_size,'sha256':sha256(path),'response_shape':('text' if text is not None else 'binary'),'models':sorted(set(m.group(0).upper() for m in MODEL_RE.finditer(text or '')))})
    return rows


def frontend_routes(root: Path) -> list[dict[str,Any]]:
    rows=[]
    for path in iter_files(root):
        if path.suffix.lower() not in {'.py','.js','.mjs','.cjs','.html'}: continue
        text=read_text(path) or ''
        rp=rel(root,path)
        for i,line in enumerate(text.splitlines(),1):
            m=re.search(r'@api\.(get|post|put|delete|patch)\(\s*[\"\']([^\"\']+)',line,re.I)
            if m: rows.append({'file':rp,'line':i,'side':'backend','method':m.group(1).upper(),'route':m.group(2)})
            for mm in re.finditer(r'(?:request|fetch)\(\s*[\"\']([^\"\']+)',line):
                rows.append({'file':rp,'line':i,'side':'frontend','method':'UNKNOWN','route':mm.group(1)})
    return rows


def secret_audit(root: Path) -> list[dict[str,Any]]:
    rows=[]
    assign_re=re.compile(r'''(?i)\b([A-Za-z_][A-Za-z0-9_]*(?:pass(?:word)?|secret|token|api[_-]?key|authorization|cookie)[A-Za-z0-9_]*)\b\s*[:=]\s*([\"'])([^\"']+)\2''')
    for path in iter_files(root):
        text=read_text(path)
        if text is None: continue
        for i,line in enumerate(text.splitlines(),1):
            for m in assign_re.finditer(line):
                value=m.group(3)
                if value.lower() in {'password','token','secret','none','true','false',''} or '{' in value: continue
                digest=hashlib.sha256(value.encode()).hexdigest()[:12]
                rows.append({'file':rel(root,path),'line':i,'name':m.group(1),'value':'<REDACTED>','fingerprint':digest})
    return rows


def classify_protocol_families(root: Path) -> list[dict[str,Any]]:
    patterns={
        'rand_count':re.compile(r'RandCount|GetRandCount',re.I),
        'rand_string':re.compile(r'RandString|GetRandString',re.I),
        'session_token':re.compile(r'SessionToken|GetRandToken',re.I),
        'api_sestoken':re.compile(r'SesTokenInfo|/api/system/user_login',re.I),
        'asp_config':re.compile(r'ASP_CONFIG',re.I),
        'thinklua':re.compile(r'ThinkLua|_lua\.lua|goform',re.I),
        'amp_bbsp':re.compile(r'/html/(?:amp|bbsp)/',re.I),
    }
    out=[]
    for name,pat in patterns.items():
        hits=keyword_hits(root,pat,'protocol')
        if hits: out.append({'family':name,'occurrences':len(hits),'evidence':hits[:30]})
    return out


def build_dataset(root: Path) -> dict[str,Any]:
    files=file_inventory(root)
    symbols=python_symbols(root)
    calls=http_calls(root)
    endpoints=endpoint_literals(root)
    reads,writes=read_write_symbols(symbols)
    dataset = {
        'root':str(root),
        'files':files,
        'symbols':symbols,
        'http_calls':calls,
        'endpoints':endpoints,
        'auth':keyword_hits(root,AUTH_TERMS,'auth'),
        'parsers':keyword_hits(root,PARSER_TERMS,'parser'),
        'models':models(root),
        'reads':reads,
        'writes':writes,
        'tests':test_inventory(root),
        'fixtures':fixture_inventory(root),
        'frontend':frontend_routes(root),
        'features':feature_evidence(root,symbols,endpoints),
        'protocol_families':classify_protocol_families(root),
        'secrets':secret_audit(root),
    }
    dataset['device_endpoint_catalogue'] = enrich_device_endpoints(dataset)
    return dataset



def enrich_device_endpoints(data: dict[str, Any]) -> list[dict[str, Any]]:
    """Build a non-invented endpoint catalogue from literal + AST call evidence.

    Unknown fields stay explicitly UNKNOWN rather than being guessed.
    """
    calls_by_key: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for call in data.get("http_calls", []):
        calls_by_key[(call.get("file", ""), call.get("endpoint", ""))].append(call)

    models_by_file: dict[str, set[str]] = defaultdict(set)
    for model in data.get("models", []):
        for occ in model.get("occurrences", []):
            models_by_file[occ.get("file", "")].add(model.get("model", ""))

    endpoint_occurrences: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in data.get("endpoints", []):
        endpoint_occurrences[row.get("endpoint", "")].append(row)

    result: list[dict[str, Any]] = []
    for row in data.get("endpoints", []):
        endpoint = row.get("endpoint", "")
        file = row.get("file", "")
        context = row.get("context", "")
        matches = calls_by_key.get((file, endpoint), [])
        call = min(matches, key=lambda x: abs(int(x.get("line", 0)) - int(row.get("line", 0)))) if matches else {}
        blob = f"{file} {endpoint} {context}".lower()
        if "huawei" in blob or "/html/amp/" in blob or "/html/bbsp/" in blob or "/asp/" in blob:
            vendor = "Huawei"
        elif "zte" in blob or "thinklua" in blob or "goform" in blob or "zxhn" in blob or "zxa10" in blob:
            vendor = "ZTE"
        else:
            vendor = "UNKNOWN"
        feature = "UNKNOWN"
        for name, terms in FEATURE_TERMS.items():
            if any(term in blob for term in terms):
                feature = name
                break
        method = call.get("method") or "UNKNOWN"
        lower_ep = endpoint.lower()
        write_markers = ("set.cgi", "complex.cgi", "reboot", "restart", "upgrade", "restore", "delete", "remove", "add", "apply", "submit")
        if method in {"PUT", "DELETE", "PATCH"} or any(x in lower_ep for x in write_markers):
            rw = "WRITE"
        elif method == "GET" or any(x in lower_ep for x in ("info", "status", "list", "get", "query")):
            rw = "READ"
        elif method == "POST":
            rw = "UNKNOWN_POST_SEMANTICS"
        else:
            rw = "UNKNOWN"
        try:
            parsed = urlsplit(endpoint if endpoint.startswith(("http://", "https://")) else "http://runtime.invalid" + endpoint)
            scheme = parsed.scheme if endpoint.startswith(("http://", "https://")) else "RUNTIME_SESSION"
            port = parsed.port if endpoint.startswith(("http://", "https://")) else "RUNTIME_SESSION"
            path = parsed.path
            query = parsed.query
        except ValueError:
            scheme, port, path, query = "UNKNOWN", "UNKNOWN", endpoint.split("?", 1)[0], endpoint.split("?", 1)[1] if "?" in endpoint else ""
        siblings = endpoint_occurrences.get(endpoint, [])
        test_refs = [f"{x.get('file')}:{x.get('line')}" for x in siblings if "test" in x.get("file", "").lower()][:20]
        fixture_refs = [f"{x.get('file')}:{x.get('line')}" for x in siblings if "fixture" in x.get("file", "").lower()][:20]
        result.append({
            "vendor": vendor,
            "model_family": sorted(x for x in models_by_file.get(file, set()) if x),
            "firmware_family": "UNKNOWN",
            "feature": feature,
            "operation": (call.get("symbol") or context[:120] or "UNKNOWN"),
            "read_write": rw,
            "http_method": method,
            "scheme": scheme,
            "port": port,
            "path": path,
            "query_string": query,
            "headers": call.get("headers") or "UNKNOWN_STATIC",
            "content_type": "UNKNOWN_STATIC",
            "payload": call.get("json") or call.get("data") or "UNKNOWN_STATIC",
            "token": "AUTH_RUNTIME_OR_UNKNOWN",
            "cookie": "SESSION_RUNTIME_OR_UNKNOWN",
            "csrf": "RUNTIME_OR_UNKNOWN",
            "referer": "RUNTIME_OR_UNKNOWN",
            "origin": "RUNTIME_OR_UNKNOWN",
            "timeout": call.get("timeout") or "UNKNOWN_STATIC",
            "verify_ssl": call.get("verify") or "UNKNOWN_STATIC",
            "redirect_behavior": call.get("allow_redirects") or "UNKNOWN_STATIC",
            "expected_status": "UNKNOWN_STATIC",
            "response_type": "UNKNOWN_STATIC",
            "parser": "SEE_LEGACY_PARSERS",
            "read_back": "SEE_SOURCE_SYMBOL",
            "retry_behavior": "SEE_TRANSPORT",
            "failure_modes": "SEE_SOURCE_TESTS",
            "source_file": file,
            "source_line": row.get("line"),
            "source_symbol": call.get("symbol") or "UNKNOWN_STATIC",
            "tests": test_refs,
            "fixtures": fixture_refs,
            "evidence": context,
            "endpoint_literal": endpoint,
        })
    return result

def json_dump(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,indent=2,ensure_ascii=False,sort_keys=False),encoding='utf-8')


def md_table(headers: list[str], rows: Iterable[Iterable[Any]]) -> str:
    def esc(v: Any) -> str:
        return str(v if v is not None else '').replace('|','\\|').replace('\n',' ')
    lines=['| '+' | '.join(headers)+' |','| '+' | '.join('---' for _ in headers)+' |']
    lines += ['| '+' | '.join(esc(v) for v in row)+' |' for row in rows]
    return '\n'.join(lines)


def evidence_ref(row: dict[str,Any]) -> str:
    return f"`{row.get('file')}:{row.get('line','')}`"


def build_parity(legacy: dict[str,Any], nxt: dict[str,Any]) -> list[dict[str,Any]]:
    rows=[]
    all_features=sorted(set(legacy['features'])|set(nxt['features']))
    for feature in all_features:
        le=legacy['features'].get(feature,[]); ne=nxt['features'].get(feature,[])
        if le and ne: status='EVIDENCE_BOTH_REVIEW_REQUIRED'
        elif le and not ne: status='REGRESSION'
        elif ne and not le: status='NEXT_ONLY'
        else: status='UNKNOWN'
        rows.append({
            'feature':feature,'legacy':bool(le),'next':bool(ne),'model':'ALL',
            'legacy_evidence':le[:5],'next_evidence':ne[:5],'status':status,
        })
    return rows


def counts(data: dict[str,Any]) -> dict[str,int]:
    return {
        'files':len(data['files']), 'python_symbols':len(data['symbols']),
        'device_endpoint_occurrences':len(data['endpoints']), 'unique_device_endpoints':len({x.get('endpoint') for x in data['endpoints']}), 'http_calls':len(data['http_calls']),
        'auth_hits':len(data['auth']), 'protocol_families':len(data['protocol_families']),
        'models':len(data['models']), 'reads':len(data['reads']), 'writes':len(data['writes']),
        'parsers':len(data['parsers']), 'fixtures':len(data['fixtures']),
        'test_files':len(data['tests']), 'tests':sum(x['test_count'] for x in data['tests']),
    }
