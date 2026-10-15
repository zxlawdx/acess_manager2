"""Canonical legacy channel_status fields, with unknown booleans preserved."""

def number(value):
    try:return int(value)
    except (TypeError,ValueError):return value


def radios(objects):
    fields = {'band':'Band','channel':'Channel','bandwidth':'BandWidth','standard':'Standard',
              'tx_power':'TxPower','country':'CountryCode','sideband':'SideBand',
              'beacon_interval':'BeaconInterval','qos_type':'QosType','work_mode':'WorkMode',
              'rts_cts':'RtsCts','dtim':'DTIM','preamble_type':'PreambleType'}
    flags = {'auto_channel':'AutoChannelEnabled','enabled':'RadioStatus','sgi':'SGIEnabled',
             'ssid_isolation':'SSIDIsolationEnable','mu_mimo':'MUMIMOEnable',
             'uplink_mu_mimo':'UPLinkMUMIMO','downlink_mu_mimo':'DownLinkMUMIMO',
             'uplink_ofdma':'UPLinkOFDMA','downlink_ofdma':'DownLinkOFDMA',
             'twt':'TWTSupport','spatial_reuse':'SpatialReuse'}
    result=[]
    for raw in objects.get('OBJ_WLANSETTING_ID',[]):
        row={'id':raw.get('_InstID'),**{key:raw.get(source) for key,source in fields.items()},
             **{key:None if raw.get(source) is None else str(raw[source]).lower() in {'1','true'} for key,source in flags.items()}}
        for key in ('channel','beacon_interval','rts_cts','dtim'):row[key]=number(row[key])
        aliases={'banda':'band','canal':'channel','canal_automatico':'auto_channel','largura':'bandwidth','padrao':'standard','potencia':'tx_power','pais':'country','radio_ativo':'enabled'}
        row.update({alias:row[key] for alias,key in aliases.items()})
        groups=channels(objects,band=row['band'],bandwidth=row['bandwidth'],country=row['country'])
        row['available_channels']=groups
        row['options']={'channel':[{'value':str(n),'label':str(n)} for group in groups for n in group['channels']]}
        for key,source in (('bandwidth','BandWidth'),('country','CountryCode')):
            values=list(dict.fromkeys(r[source] for r in objects.get('OBJ_CHANNEL_ID',[]) if r.get(source) and r.get('Band')==row['band'] and (key=='country' or r.get('CountryCode')==row['country'])))
            row['options'][key]=[{'value':v,'label':v} for v in values]
        result.append(row)
    return result


def channels(objects, *, band=None, bandwidth=None, country=None):
    result=[]
    for raw in objects.get('OBJ_CHANNEL_ID',[]):
        if any(value is not None and str(raw.get(key)) != str(value) for key,value in (('Band',band),('BandWidth',bandwidth),('CountryCode',country))):continue
        values=[]
        for entry in str(raw.get('ChannelList') or '').split(','):
            try:n=int(entry.strip())
            except ValueError:continue
            if n>0 and n not in values:values.append(n)
        result.append({'band':raw.get('Band'),'bandwidth':raw.get('BandWidth'),'country':raw.get('CountryCode'),'channels':values})
    return result
