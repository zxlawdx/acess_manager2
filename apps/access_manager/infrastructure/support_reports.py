"""Dedicated report storage: Wi-Fi credentials never enter generic operation history."""
import json
from apps.access_manager.domain.triage import SupportSession
from apps.access_manager.domain.redaction import redact_sensitive


def sanitize(value):
    if isinstance(value, dict):
        return {str(k): sanitize(v) for k, v in redact_sensitive(value).items()
                if str(k).lower() not in {'csrf', 'session', 'headers', 'advanced', 'output', 'stdout', 'stderr'}
                and not str(k).startswith('_') and (k != 'raw' or 'speed_bps' in value)}
    if isinstance(value, (list, tuple)): return [sanitize(v) for v in value]
    return value if isinstance(value, (str, int, float, bool, type(None))) else None


class SupportReportRepository:
    def __init__(self, history):
        self.history = history
        with history._lock, history._connection() as db:
            db.execute('CREATE TABLE IF NOT EXISTS support_report (id TEXT PRIMARY KEY, app_session_id TEXT NOT NULL, updated_at TEXT NOT NULL, payload TEXT NOT NULL)')
            db.execute('CREATE INDEX IF NOT EXISTS support_session ON support_report(app_session_id)')

    def save(self, report):
        # Allow ONLY these two credentials in the explicit, server-created event.
        payload = sanitize(report)
        for source, event in zip(report['events'], payload['events']):
            if source.get('type') == 'wifi_password_change':
                for key in ('old_password', 'new_password', 'old_password_status'):
                    event[key] = source.get(key)
        with self.history._lock, self.history._connection() as db:
            db.execute('INSERT INTO support_report VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET updated_at=excluded.updated_at,payload=excluded.payload',
                       (report['id'], report['app_session_id'], report['updated_at'], json.dumps(payload, ensure_ascii=False)))

    def get(self, report_id=None, app_session_id=None):
        with self.history._lock, self.history._connection() as db:
            row = db.execute('SELECT payload FROM support_report WHERE id=?', (report_id,)).fetchone() if report_id else db.execute('SELECT payload FROM support_report WHERE app_session_id=? ORDER BY updated_at DESC LIMIT 1', (app_session_id,)).fetchone()
        return SupportSession(json.loads(row[0])) if row else None

    def recent(self):
        with self.history._lock, self.history._connection() as db:
            # Extract metadata in SQLite; credentials are not loaded by this path.
            rows = db.execute("SELECT id, json_extract(payload,'$.device_ip'), json_extract(payload,'$.model'), json_extract(payload,'$.attendant'), json_extract(payload,'$.started_at'), json_extract(payload,'$.status'), json_extract(payload,'$.result'), json_array_length(json_extract(payload,'$.findings')) FROM support_report ORDER BY updated_at DESC LIMIT 100").fetchall()
        return [dict(zip(('id','device_ip','model','attendant','started_at','status','result','finding_count'), row)) for row in rows]
