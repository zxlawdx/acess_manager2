"""QA driver: runs the real manage.py runapp, with native window controls.

Only this test process exposes a localhost control port. No production bridge
or router is replaced. Requires Qt/pywebview and a graphical or offscreen Qt host.
"""
import json
import runpy
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import webview

class Control(BaseHTTPRequestHandler):
    def do_POST(self):
        values=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        window=webview.windows[0]
        if self.path=='/resize':
            window.restore()
            window.resize(values['width'],values['height'])
        elif self.path=='/maximize':
            window.maximize()
        elif self.path=='/close':
            window.destroy()
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{}')
    def log_message(self,*args):
        pass

if __name__=='__main__':
    server=HTTPServer(('127.0.0.1',9223),Control)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    sys.argv=['manage.py','runapp']
    sys.path.insert(0,str(Path.cwd()))
    runpy.run_path('manage.py',run_name='__main__')
