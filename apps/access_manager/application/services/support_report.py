"""Support workflow. No credential-bearing domain objects have a revealing repr."""
from contextlib import nullcontext
from copy import deepcopy
from datetime import datetime, timezone
from html import escape
import json
from uuid import uuid4
from apps.access_manager.domain.triage import evaluate, compare, rows
from apps.access_manager.infrastructure.support_reports import sanitize


def now(): return datetime.now(timezone.utc).isoformat()


class TriageService:
    def __init__(self, sessions, queries, thresholds=None):
        self.sessions, self.queries, self.thresholds = sessions, queries, thresholds or {}

    def collect(self):
        with self.sessions.operation_lock:
            session, provider = self.sessions.session, self.sessions.provider
            if session is None: raise ValueError('Conecte um equipamento para executar a triagem')
            data = {'captured_at': now(), 'device': {'host': session.host, 'vendor': session.vendor.value,
                    'model': session.model, 'firmware': session.firmware}, 'unavailable': {}}
            def read(key, feature, method):
                capability = provider.capabilities.get(feature)
                if not capability.readable:
                    data[key] = {'capability': capability.read.value}
                    if capability.read.value != 'UNSUPPORTED': data['unavailable'][key] = capability.read.value
                    return
                try: data[key] = sanitize(method())
                except Exception:
                    data[key] = {'capability': 'PARTIAL'}
                    data['unavailable'][key] = 'Leitura indisponível nesta coleta'
            if session.vendor.value == 'juniper':
                data['kind'] = 'bng'
                for key in ('optical', 'wifi', 'ethernet', 'wan', 'dhcp', 'dns'):
                    data[key] = {'capability': 'UNSUPPORTED'}
                for key, feature, method in [('resources','device',provider.get_juniper_system), ('interfaces','juniper_interfaces',provider.get_juniper_interfaces)]:
                    read(key, feature, method)
                data['subscriber_context'] = sanitize(getattr(self.sessions, 'context', None))
                data['scope_note'] = 'BNG: assinantes, PPPoE, AAA/RADIUS, rotas, shaping e policer devem ser consultados no contexto do assinante. Sem medições de ONT inferidas.'
            else:
                data['kind'] = 'cpe'
                for key, feature, method in [('optical','optical',self.queries.optical), ('wifi','clients',self.queries.clients), ('ethernet','lan',self.queries.lan), ('wan','wan',self.queries.wan), ('dhcp','dhcp',self.queries.dhcp), ('dns','dns',self.queries.dns), ('resources','device',self.queries.device)]:
                    read(key, feature, method)
                if isinstance(data.get('wifi'), list):
                    data['wifi'] = {'clients': [r for r in data['wifi'] if str(r.get('connection_type')).lower() in {'wi-fi','wifi'} or r.get('rssi') is not None or r.get('rssi_dbm') is not None]}
            return evaluate(data, self.thresholds)


class SupportReportService:
    RESULTS = {'resolved', 'partially_resolved', 'visit_referral', 'no_fault', 'followup'}
    def __init__(self, sessions, queries, repository, thresholds=None):
        self.sessions, self.queries, self.repository = sessions, queries, repository
        self.triage = TriageService(sessions, queries, thresholds)
        self._collecting = False

    def __repr__(self): return '<SupportReportService>'
    def active(self):
        session = self.sessions.session
        report = self.repository.get(app_session_id=session.session_id) if session else None
        return report if report and report['status'] == 'active' else None

    def start(self, config):
        with self.sessions.operation_lock:
            if self.active(): raise ValueError('Já existe atendimento ativo para este equipamento')
            s = self.sessions.session
            if not s: raise ValueError('Conecte um equipamento')
            snapshot = self.collect()
            report = dict(id=uuid4().hex, app_session_id=s.session_id, device=deepcopy(snapshot['device']), device_ip=s.host,
                          vendor=s.vendor.value, model=s.model, firmware=s.firmware, attendant=str(config.get('attendant') or s.attendant or ''),
                          started_at=now(), updated_at=now(), finished_at=None, status='active', initial_snapshot=deepcopy(snapshot),
                          current_snapshot=deepcopy(snapshot), final_snapshot=None, events=[], findings=snapshot['findings'], notes=[], result=None)
            self.event(report, 'support_started', 'support', 'Atendimento iniciado')
            return self.public(report)

    def collect(self):
        self._collecting = True
        try: return self.triage.collect()
        finally: self._collecting = False

    def event(self, report, event_type, feature, summary, **fields):
        report['events'].append(dict(id=uuid4().hex, timestamp=now(), type=event_type, feature=feature, summary=summary, **sanitize(fields)))
        report['updated_at'] = now()
        self.repository.save(report)

    def refresh(self):
        with self.sessions.operation_lock:
            report = self.active()
            if not report: return self.collect()
            snapshot = self.collect()
            report['current_snapshot'], report['findings'] = snapshot, snapshot['findings']
            self.event(report, 'triage', 'triage', 'Triagem executada')
            return self.public(report)

    @staticmethod
    def public(report):
        result = deepcopy(report)
        for event in result['events']:
            if event.get('type') == 'wifi_password_change':
                for key in ('old_password', 'new_password'):
                    event[key + '_present'] = event.get(key) is not None
                    event.pop(key, None)
        return result

    def detail(self, report_id=None):
        report = self.repository.get(report_id=report_id) if report_id else self.active()
        if not report: return None
        return self.public(report)

    def note(self, config):
        with self.sessions.operation_lock:
            report = self.active()
            if not report: raise ValueError('Inicie um atendimento')
            if config.get('id') and config['id'] != report['id']: raise ValueError('Atendimento pertence a outra sessão')
            text = str(config.get('text') or '').strip()
            if not text or len(text) > 5000: raise ValueError('Observação deve conter entre 1 e 5000 caracteres')
            report['notes'].append({'timestamp': now(), 'source': 'attendant', 'text': text})
            self.event(report, 'note', 'support', 'Observação do atendente adicionada')
            return self.public(report)

    def finish(self, config):
        with self.sessions.operation_lock:
            if config.get('result') not in self.RESULTS: raise ValueError('Escolha o resultado do atendimento')
            report = self.active()
            if not report: raise ValueError('Inicie um atendimento')
            if config.get('id') and config['id'] != report['id']: raise ValueError('Atendimento pertence a outra sessão')
            report['final_snapshot'] = self.collect()
            report['current_snapshot'] = deepcopy(report['final_snapshot'])
            report['findings'] = report['final_snapshot']['findings']
            report['comparison'] = compare(report['initial_snapshot'], report['final_snapshot'])
            report.update(status='finished', finished_at=now(), result=config['result'])
            self.event(report, 'support_finished', 'support', 'Atendimento finalizado pelo atendente')
            return self.public(report)

    def record_read(self, feature, result):
        if self._collecting or feature not in {'device','clients','optical','wan','lan','dhcp','dns','wifi_radio','wifi','runtime_diagnostic'}: return
        report = self.active()
        if not report: return
        key = {'device':'resources','clients':'wifi','lan':'ethernet','wifi':'ssids','wifi_radio':'radios'}.get(feature, feature)
        from apps.access_manager.domain.presentation import device_view, wan_view, dhcp_view
        from apps.access_manager.domain.optical import normalize_optical
        if feature == 'optical': result = normalize_optical(result)
        elif feature == 'device': result = device_view(result)
        elif feature == 'wan': result = [wan_view(r) for r in rows(result)]
        elif feature == 'dhcp': result = dhcp_view(result)
        value = sanitize(result)
        if feature == 'clients': value = {'clients': [r for r in rows(value) if str(r.get('connection_type')).lower() in {'wifi','wi-fi'} or r.get('rssi') is not None]}
        candidate = deepcopy(report['current_snapshot'])
        candidate[key] = value
        candidate = evaluate(candidate, self.triage.thresholds)
        if report['current_snapshot'].get(key) == candidate.get(key): return
        report['current_snapshot'] = candidate
        report['findings'] = report['current_snapshot']['findings']
        self.event(report, 'diagnostic' if feature=='runtime_diagnostic' else 'measurement', feature, 'Compatibilidade coletada' if feature=='runtime_diagnostic' else 'Medição atualizada')

    def before_command(self, feature, method, args):
        if not self.active(): return None
        before = None
        reader = {'wifi':'wifi_ssids','wifi_radio':'wifi_radios','dns':'dns','dhcp':'dhcp','dhcp_reservations':'dhcp','dns_hosts':'dns','dns_hosts_delete':'dns','dmz':'dmz','upnp':'upnp','tr069':'tr069','firewall':'firewall'}.get(feature)
        if reader:
            try: before = getattr(self.queries, reader)()
            except Exception: pass
        context = {'before': sanitize(before), 'reader': reader, 'passwords': []}
        if method == 'set_ssid_config' and len(args) >= 2 and args[1].get('password') not in (None, ''):
            networks = rows(before, 'networks')
            target = next((r for r in networks if str(r.get('id')) == str(args[0])), {})
            # The existing reveal reader is the only credential source. Unsupported/unknown
            # models return no value or reject; never read client/cookie internals.
            old, status = None, 'UNAVAILABLE'
            try:
                if getattr(self.sessions.provider, 'wifi_password_read_status', 'UNKNOWN') not in {'SUPPORTED', 'PARTIAL'}:
                    raise ValueError('Reader não comprovado')
                current = self.queries.wifi_reveal()['networks']
                row = next((r for r in current if str(r.get('id')) == str(args[0])), {})
                value = row.get('password')
                if value and set(str(value)) <= {'*', '•', '●'}: status = 'MASKED_BY_DEVICE'
                elif value and not row.get('password_hidden'):
                    old, status = str(value), 'SUPPORTED'
            except Exception: pass
            context['passwords'].append({'ssid_id': str(args[0]), 'ssid': args[1].get('ssid', target.get('ssid', target.get('nome'))), 'band': target.get('band', target.get('banda')), 'old_password': old, 'old_password_status': status, 'new_password': str(args[1]['password'])})
        return context

    def after_command(self, feature, method, args, result, context, failed=False):
        report = self.active()
        if not report or context is None: return
        diagnostic = feature in {'diagnostics','dns_lookup','speedtest','speedtest_discovery'}
        after = None
        if not failed and context.get('reader'):
            try: after = getattr(self.queries, context['reader'])()
            except Exception: pass
        success = not failed and not (isinstance(result, dict) and (result.get('success') is False or result.get('uncertain')))
        references = []
        for credential in context['passwords']:
            verified = False
            if success:
                try:
                    if getattr(self.sessions.provider, 'wifi_password_read_status', 'UNKNOWN') not in {'SUPPORTED', 'PARTIAL'}:
                        raise ValueError('Reader não comprovado')
                    row = next((r for r in self.queries.wifi_reveal()['networks'] if str(r.get('id')) == credential['ssid_id']), {})
                    verified = bool(row.get('password')) and not set(str(row['password'])) <= {'*','•','●'} and not row.get('password_hidden') and row.get('password') == credential['new_password']
                except Exception: pass
            event = dict(id=uuid4().hex, timestamp=now(), type='wifi_password_change', feature='wifi', summary='Alteração de senha Wi-Fi' if success else 'Alteração de senha Wi-Fi não confirmada',
                         **credential, verified=bool(success and verified), status='accepted' if success else 'failed',
                         verification_note='Confirmado' if success and verified else 'Não verificável pelo firmware' if success else 'Escrita falhou ou resultado incerto; aplicação não confirmada')
            if not success: event['new_password'] = None
            report['events'].append(event)
            references.append(event['id'])
        if diagnostic:
            report['current_snapshot'].setdefault('diagnostics', {})[method] = sanitize(result)
        # Generic event carries no full passwords. Domain exceptions only record type.
        if after is not None:
            key = {'wifi':'ssids','wifi_radio':'radios', 'dhcp_reservations':'dhcp', 'dns_hosts':'dns', 'dns_hosts_delete':'dns'}.get(feature, feature)
            report['current_snapshot'][key] = sanitize(after)
        report['current_snapshot']['updated_at'] = now()
        self.event(report, 'diagnostic' if diagnostic else 'configuration_change', feature, {'set_ssid_config':'Configuração Wi-Fi alterada','set_wifi_radio':'Rádio Wi-Fi alterado','set_dns':'DNS alterado','set_dhcp':'DHCP alterado','save_dhcp_reservation':'Reserva DHCP salva','delete_dhcp_reservation':'Reserva DHCP removida','save_dns_host':'Host DNS salvo','delete_dns_host':'Host DNS removido','ping':'Ping executado','traceroute':'Traceroute executado','dns_lookup':'Consulta DNS executada','reboot':'Reboot solicitado'}.get(method,method),
                   status='failed' if not success else 'success', before=context['before'], requested=args,
                   after=after, result=result, verified=bool(success and isinstance(result, dict) and result.get('verified') is True), wifi_change_ids=references)

    def credentials(self, report_id, event_id):
        report = self.repository.get(report_id=report_id)
        if not report: raise ValueError('Relatório não encontrado')
        event = next((e for e in report['events'] if e['id'] == event_id and e['type'] == 'wifi_password_change'), None)
        if not event: raise ValueError('Alteração não encontrada')
        return {k: event.get(k) for k in ('old_password','new_password','old_password_status','verified','verification_note')}

    def export(self, config):
        report = self.repository.get(report_id=config.get('id'))
        if not report: raise ValueError('Relatório não encontrado')
        fmt = config.get('format', 'json')
        if fmt not in {'json','txt','html'}: raise ValueError('Formato não suportado')
        content = json.dumps(report, ensure_ascii=False, indent=2)
        if fmt in {'txt','html'}:
            from apps.access_manager.domain.support_export import text_report
            content = text_report(report)
        if fmt == 'html': content = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Relatório de atendimento — Access Manager</title><body><h1>Relatório de atendimento</h1><pre style="white-space:pre-wrap;overflow-wrap:anywhere">' + escape(content) + '</pre></body></html>'
        return {'filename': f'access-manager-support-{report["id"]}.{fmt}', 'content': content}
