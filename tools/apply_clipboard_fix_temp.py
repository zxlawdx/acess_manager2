from pathlib import Path

root = Path('.')

(root / 'apps/access_manager/infrastructure/clipboard.py').write_text('''from __future__ import annotations

import ctypes
import os
import time
from ctypes import wintypes

CF_UNICODETEXT = 13
GMEM_MOVEABLE = 0x0002
MAX_CLIPBOARD_BYTES = 2 * 1024 * 1024


class ClipboardError(RuntimeError):
    pass


def _last_error(message: str) -> ClipboardError:
    code = ctypes.get_last_error()
    return ClipboardError(f"{message} (Win32 {code})" if code else message)


def copy_text(value: object, *, retries: int = 8, delay: float = 0.025) -> None:
    """Copy Unicode text using the native Windows clipboard API."""
    if os.name != 'nt':
        raise ClipboardError('Clipboard nativo indisponível nesta plataforma.')
    text = '' if value is None else str(value)
    size = (len(text) + 1) * ctypes.sizeof(ctypes.c_wchar)
    if size > MAX_CLIPBOARD_BYTES:
        raise ClipboardError('Texto grande demais para copiar com segurança.')

    user32 = ctypes.WinDLL('user32', use_last_error=True)
    kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)
    user32.OpenClipboard.argtypes = [wintypes.HWND]
    user32.OpenClipboard.restype = wintypes.BOOL
    user32.EmptyClipboard.argtypes = []
    user32.EmptyClipboard.restype = wintypes.BOOL
    user32.SetClipboardData.argtypes = [wintypes.UINT, wintypes.HANDLE]
    user32.SetClipboardData.restype = wintypes.HANDLE
    user32.CloseClipboard.argtypes = []
    user32.CloseClipboard.restype = wintypes.BOOL
    kernel32.GlobalAlloc.argtypes = [wintypes.UINT, ctypes.c_size_t]
    kernel32.GlobalAlloc.restype = wintypes.HGLOBAL
    kernel32.GlobalLock.argtypes = [wintypes.HGLOBAL]
    kernel32.GlobalLock.restype = wintypes.LPVOID
    kernel32.GlobalUnlock.argtypes = [wintypes.HGLOBAL]
    kernel32.GlobalUnlock.restype = wintypes.BOOL
    kernel32.GlobalFree.argtypes = [wintypes.HGLOBAL]
    kernel32.GlobalFree.restype = wintypes.HGLOBAL

    opened = False
    for attempt in range(max(1, retries)):
        if user32.OpenClipboard(None):
            opened = True
            break
        if attempt + 1 < retries:
            time.sleep(delay)
    if not opened:
        raise _last_error('Não foi possível abrir a área de transferência.')

    handle = None
    transferred = False
    try:
        if not user32.EmptyClipboard():
            raise _last_error('Não foi possível limpar a área de transferência.')
        handle = kernel32.GlobalAlloc(GMEM_MOVEABLE, size)
        if not handle:
            raise _last_error('Não foi possível alocar memória para a cópia.')
        pointer = kernel32.GlobalLock(handle)
        if not pointer:
            raise _last_error('Não foi possível preparar a cópia.')
        try:
            buffer = ctypes.create_unicode_buffer(text)
            ctypes.memmove(pointer, ctypes.addressof(buffer), size)
        finally:
            kernel32.GlobalUnlock(handle)
        if not user32.SetClipboardData(CF_UNICODETEXT, handle):
            raise _last_error('Não foi possível gravar na área de transferência.')
        transferred = True
    finally:
        user32.CloseClipboard()
        if handle and not transferred:
            kernel32.GlobalFree(handle)
''', encoding='utf-8')

(root / 'apps/access_manager/static/js/shared/clipboard.js').write_text('''export async function copyText(value){
 const text=String(value??'');
 try{
  const response=await fetch(new URL('/api/system/clipboard',window.location.origin),{
   method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})
  });
  const data=await response.json().catch(()=>({}));
  return Boolean(response.ok&&data?.success!==false);
 }catch{return false}
}

export function selectTextForManualCopy(element,text){
 if(!element)return false;
 if(text!==undefined)element.textContent=String(text??'');
 try{element.focus?.({preventScroll:true})}catch{try{element.focus?.()}catch{}}
 try{
  const selection=window.getSelection?.();if(!selection||!document.createRange)return false;
  const range=document.createRange();range.selectNodeContents(element);selection.removeAllRanges();selection.addRange(range);return true;
 }catch{return false}
}
''', encoding='utf-8')

common = root / 'apps/access_manager/presentation/api/common.py'
s = common.read_text(encoding='utf-8')
if '/system/clipboard' not in s:
    s += "\n\n@api.post('/system/clipboard')\ndef copy_to_clipboard(context=None):\n    from apps.access_manager.infrastructure.clipboard import ClipboardError, copy_text\n    d=body(context)\n    try:\n        copy_text(d.get('text',''))\n        return {'success':True}\n    except ClipboardError as exc:\n        return {'success':False,'error':{'code':'CLIPBOARD_UNAVAILABLE','message':str(exc),'type':'clipboard','retryable':True}}\n"
common.write_text(s, encoding='utf-8')

panel = root / 'apps/access_manager/static/js/service/panel.js'
s = panel.read_text(encoding='utf-8')
if "../shared/clipboard.js" not in s:
    s = s.replace("import {service,startService,clearService,detachService,subscribeService,setServiceNotes,formatService,observeOperation} from './model.js';", "import {service,startService,clearService,detachService,subscribeService,setServiceNotes,formatService,observeOperation} from './model.js';\nimport {copyText,selectTextForManualCopy} from '../shared/clipboard.js';")
start = s.find('// Qt WebEngine / pywebview builds')
end = s.find('\nexport function mountServicePanel', start)
if start != -1 and end != -1:
    s = s[:start] + "// Clipboard writes are delegated to the native Windows backend.\n// Browser clipboard and execCommand fallbacks are intentionally avoided in Vela.\n" + s[end:]
old = """ panel.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{\n  const text=formatService({secrets,mode:b.dataset.copy==='technical'?'technical':panel.querySelector('[data-mode]').value,markdown:b.dataset.copy==='markdown'});\n  if(safeCopyText(text)){status('Registro copiado.');return}\n  selectRecordForManualCopy(panel);status('Cópia automática indisponível. O registro foi selecionado; pressione Ctrl+C.');\n });"""
new = """ panel.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{\n  const text=formatService({secrets,mode:b.dataset.copy==='technical'?'technical':panel.querySelector('[data-mode]').value,markdown:b.dataset.copy==='markdown'});\n  if(await copyText(text)){status('Registro copiado.');return}\n  selectTextForManualCopy(panel.querySelector('[data-record]'),text);status('Cópia automática indisponível. O registro foi selecionado; pressione Ctrl+C.');\n });"""
if old not in s:
    raise RuntimeError('service copy block not found')
panel.write_text(s.replace(old, new), encoding='utf-8')

wifi = root / 'apps/access_manager/static/js/workspaces/views/wifi.js'
s = wifi.read_text(encoding='utf-8')
if "../../shared/clipboard.js" not in s:
    s = s.replace("import {editConfig} from '../../shared/forms.js';", "import {editConfig} from '../../shared/forms.js';\nimport {copyText} from '../../shared/clipboard.js';")
old = "modal.querySelector('[data-copy-wifi-password]').onclick=async()=>{try{await navigator.clipboard.writeText(password.value);toast('Senha copiada.')}catch{toast('Não foi possível copiar.')}};"
new = "modal.querySelector('[data-copy-wifi-password]').onclick=async()=>{if(await copyText(password.value))toast('Senha copiada.');else toast('Não foi possível copiar. Mostre a senha e use Ctrl+C.')};"
if old not in s:
    raise RuntimeError('wifi copy block not found')
wifi.write_text(s.replace(old, new), encoding='utf-8')

juniper = root / 'apps/access_manager/static/js/workspaces/views/juniper.js'
s = juniper.read_text(encoding='utf-8')
if "../../shared/clipboard.js" not in s:
    s = s.replace("import {fields,uptime} from '../../shared/presentation.js';", "import {fields,uptime} from '../../shared/presentation.js';\nimport {copyText} from '../../shared/clipboard.js';")
old = "function wireCopy(root=document){root.querySelectorAll('[data-copy-juniper]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copyJuniper);toast('Copiado.')}catch{toast('Não foi possível copiar.')}})}"
new = "function wireCopy(root=document){root.querySelectorAll('[data-copy-juniper]').forEach(b=>b.onclick=async()=>{if(await copyText(b.dataset.copyJuniper))toast('Copiado.');else toast('Não foi possível copiar.')}})}"
if old not in s:
    raise RuntimeError('juniper copy block not found')
juniper.write_text(s.replace(old, new), encoding='utf-8')

human = root / 'tests/frontend/human-service.test.cjs'
s = human.read_text(encoding='utf-8')
s = s.replace("assert.doesNotMatch(source,/navigator\\.clipboard|clipboard\\.writeText/);assert.match(source,/document\\.execCommand\\('copy'\\)/)", "assert.doesNotMatch(source,/navigator\\.clipboard|clipboard\\.writeText|execCommand/);assert.match(source,/copyText/)")
human.write_text(s, encoding='utf-8')

runtime = root / 'tests/frontend/runtime.test.cjs'
s = runtime.read_text(encoding='utf-8')
s = s.replace("'/api/management/artifacts':[],", "'/api/management/artifacts':[], '/api/system/clipboard':{success:true},")
old = "test('Wi-Fi password modal masks by default, copies on demand and clears its input on close',async()=>{const x=await boot();await x.click('wifi');let copied;x.w.navigator.clipboard={writeText:async value=>{copied=value}};x.w.document.querySelector('[data-reveal-wifi]').click();await x.wait();const input=x.w.document.querySelector('#wifi-revealed-password');assert.equal(input.type,'password');x.w.document.querySelector('[data-copy-wifi-password]').click();await x.wait();assert.equal(copied,'secret123');x.w.document.querySelector('[data-dismiss-wifi-password]').click();assert.equal(input.value,'');assert.equal(x.w.document.querySelector('#wifi-revealed-password'),null);x.w.close()});"
new = "test('Wi-Fi password modal masks by default, copies through native endpoint and clears its input on close',async()=>{const x=await boot();await x.click('wifi');x.w.document.querySelector('[data-reveal-wifi]').click();await x.wait();const input=x.w.document.querySelector('#wifi-revealed-password');assert.equal(input.type,'password');x.w.document.querySelector('[data-copy-wifi-password]').click();await x.wait();const copied=x.calls.find(c=>c[0]==='/api/system/clipboard');assert.equal(JSON.parse(copied[1].body).text,'secret123');x.w.document.querySelector('[data-dismiss-wifi-password]').click();assert.equal(input.value,'');assert.equal(x.w.document.querySelector('#wifi-revealed-password'),null);x.w.close()});"
if old not in s:
    raise RuntimeError('runtime wifi test not found')
runtime.write_text(s.replace(old, new), encoding='utf-8')

(root / 'tests/test_clipboard.py').write_text('''import os
from unittest.mock import patch

from apps.access_manager.infrastructure.clipboard import ClipboardError, copy_text


def test_native_clipboard_fails_closed_off_windows():
    with patch.object(os, 'name', 'posix'):
        try:
            copy_text('hello')
        except ClipboardError as exc:
            assert 'indisponível' in str(exc)
        else:
            raise AssertionError('non-Windows clipboard must fail closed')


def test_clipboard_rejects_oversized_text_before_native_call():
    with patch.object(os, 'name', 'nt'):
        try:
            copy_text('x' * (2 * 1024 * 1024))
        except ClipboardError as exc:
            assert 'grande demais' in str(exc)
        else:
            raise AssertionError('oversized clipboard payload must be rejected')
''', encoding='utf-8')

print('clipboard patch applied')
