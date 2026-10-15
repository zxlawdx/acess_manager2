"""Human support report. Full Wi-Fi values are read only from dedicated events."""

LABELS = {'optical':'FIBRA','wifi':'WI-FI','ethernet':'LAN','wan':'WAN','dhcp':'DHCP','dns':'DNS','resources':'EQUIPAMENTO',
          'rx_dbm':'Recepção RX (dBm)','tx_dbm':'Transmissão TX (dBm)','temperature_c':'Temperatura (°C)',
          'rssi':'RSSI (dBm)','rssi_dbm':'RSSI (dBm)','snr':'SNR (dB)','quality':'Qualidade','speed_display':'Velocidade negociada',
          'pool_start':'Início do pool','pool_end':'Fim do pool','lease_seconds':'Lease (segundos)',
          'old_password':'Senha anterior','new_password':'Senha nova','unsupported':'Não aplicável',
          'resolved':'Resolvido','partially_resolved':'Parcialmente resolvido','visit_referral':'Encaminhado para visita',
          'no_fault':'Sem falha identificada','followup':'Necessita acompanhamento','normal':'Normal','attention':'Atenção necessária',
          'problems':'Problemas encontrados','partial':'Dados parciais','excellent':'Excelente','good':'Bom','weak':'Fraco','critical':'Crítico','unknown':'Não informado'}


def lines(value, indent=''):
    if isinstance(value, dict):
        result=[]
        if value.get('capability')=='UNSUPPORTED': return [indent+'Não aplicável a este equipamento.']
        for key,item in value.items():
            if key in {'password','password_hidden','captured_at','updated_at','visit_suggestion'} or item in (None,'',[],{}):continue
            label=LABELS.get(key,key)
            if isinstance(item,(dict,list)):result.append(indent+label+':');result.extend(lines(item,indent+'  '))
            else:result.append(indent+label+': '+('Sim' if item is True else 'Não' if item is False else LABELS.get(str(item),str(item))))
        return result
    if isinstance(value,list):
        result=[]
        for item in value:result.extend(lines(item,indent));result.append('')
        return result
    return [indent+str(value)]


def text_report(report):
    out=['RELATÓRIO DE ATENDIMENTO — ACCESS MANAGER','',f'Equipamento: {report.get("model") or "Não informado"}',
         f'IP: {report["device_ip"]}',f'Firmware: {report.get("firmware") or "Não informado"}',
         f'Atendente: {report.get("attendant") or "Não informado"}',f'Início: {report["started_at"]}',f'Fim: {report.get("finished_at") or "Em atendimento"}']
    def section(title):out.extend(['','='*50,title,'='*50,''])
    section('TRIAGEM INICIAL');out.extend(lines(report['initial_snapshot']))
    section('PROBLEMAS IDENTIFICADOS');out.extend(lines(report['findings']) or ['Nenhum alerta registrado nas medições disponíveis.'])
    section('DIAGNÓSTICOS E ALTERAÇÕES')
    for event in report['events']:
        if event['type']=='wifi_password_change':continue
        out.append(event['timestamp']+' — '+event.get('summary',event['type']))
        out.extend(lines({k:event[k] for k in ('status','before','requested','after','verified','result') if k in event}))
    section('CREDENCIAIS WI-FI ALTERADAS')
    for event in report['events']:
        if event['type']!='wifi_password_change':continue
        out.extend([event['timestamp'],f'SSID: {event.get("ssid") or event.get("ssid_id")}',f'Banda: {event.get("band") or "Não informada"}',
                    f'Senha anterior: {event.get("old_password") or "Não disponível"}',f'Senha nova: {event.get("new_password") or "Não confirmada"}',
                    f'Read-back: {event["verification_note"]}',''])
    section('TRIAGEM FINAL' if report.get('final_snapshot') else 'ESTADO ATUAL');out.extend(lines(report.get('final_snapshot') or report['current_snapshot']))
    section('COMPARAÇÃO INICIAL / FINAL');out.append('Medições em momentos distintos; não indicam causalidade automaticamente.');out.extend(lines(report.get('comparison',[])))
    section('OBSERVAÇÕES DO ATENDENTE');out.extend(lines(report['notes']) or ['Nenhuma observação manual.'])
    section('RESULTADO E PENDÊNCIAS');out.append(LABELS.get(report.get('result'),'Resultado ainda não definido pelo atendente.'))
    out.extend(lines(report.get('findings',[])));out.extend(lines(report['current_snapshot'].get('unavailable',{})))
    return '\n'.join(out)
