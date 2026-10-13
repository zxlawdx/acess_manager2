"""Recognized node fields only. No inferred parents from roles or names."""

def normalize_mesh(data):
 result={'available':bool(data.get('available')),'enabled':data.get('enabled') if data.get('available') else None,'steering_enabled':data.get('band_steering'),'roaming_enabled':data.get('legacy_station_roaming'),'rssi_limit_24g':data.get('rssi_limit_24g'),'rssi_limit_5g':data.get('rssi_limit_5g'),'nodes':[]}
 records=data.get('nodes') or []
 # ZTE's source already separates these recognized tables. Other objects
 # (controller settings, station lists) are not relabeled as Mesh nodes.
 for r in records:
  identity=r.get('node_id') or r.get('NodeID')
  if not identity:continue
  result['nodes'].append({'id':identity,'parent':r.get('parent') or r.get('ParentID'),'backhaul':r.get('backhaul') or r.get('BackhaulType'),'band':r.get('band') or r.get('Band'),'rssi':r.get('rssi') or r.get('RSSI'),'clients':r.get('clients')})
 return result
