"""Optical quantities and alarms, without vendor-wide defaults/thresholds."""
import math

def normalize_optical(data):
 d=dict(data or {})
 aliases={'rx_dbm':('rx_dbm','rx','rx_power','rx_power_dbm'),'tx_dbm':('tx_dbm','tx','tx_power','tx_power_dbm'), 'temperature_c':('temperature_c','temperature','temperatura'), 'voltage_v':('voltage_v',), 'bias_ma':('bias_ma','current_ma','bias','bias_current'), 'pon':('pon','pon_status'),'registration_status':('registration_status','onu_registration'), 'olt_state':('olt_state',),'onu_id':('onu_id',),'serial':('serial',),'loid':('loid',), 'fec_corrected':('fec_corrected',),'fec_uncorrectable':('fec_uncorrectable',),'ber':('ber',),'los':('los',),'lof':('lof',),'alarm_state':('alarm_state',)}
 result={}
 for target,names in aliases.items():
  value=next((d[k] for k in names if d.get(k) not in (None,'')),None)
  if target in {'rx_dbm','tx_dbm','temperature_c','voltage_v','bias_ma','fec_corrected','fec_uncorrectable','ber'}:
   try:value=float(value);value=value if math.isfinite(value) else None
   except (TypeError,ValueError):value=None
  result[target]=value
 return {**d,**result}
