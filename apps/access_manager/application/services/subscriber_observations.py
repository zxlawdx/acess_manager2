"""Bounded, process-local observations; correlation never confirms an outage."""
from collections import deque
from threading import RLock
import time


class SubscriberObservations:
    def __init__(self,clock=time.time):
        self.clock=clock
        self.rows=deque(maxlen=1000)
        self.lock=RLock()

    def observe(self, row, *, source):
        identity=row.get('username')
        state=row.get('state')
        if not identity or state not in {'ONLINE','OFFLINE'}: return {'history':[],'incident':None}
        current=self.clock()
        with self.lock:
            previous=next((r for r in reversed(self.rows) if r['source']==source and r['identity']==identity),None)
            # Repeated reads must not manufacture session transitions.
            if previous is None or previous['state']!=state:
                self.rows.append({'source':source,'identity':identity,'state':state,'timestamp':current,
                    'outer_vlan':row.get('outer_vlan'),'interface':row.get('interface')})
            history=[dict(r) for r in self.rows if r['source']==source and r['identity']==identity and r['timestamp']>=current-900]
            vlan=row.get('outer_vlan')
            incident=None
            if vlan is not None and state=='OFFLINE':
                latest={}
                for r in self.rows:
                    if r['source']==source and r['timestamp']>=current-300: latest[r['identity']]=r
                related={k for k,r in latest.items() if r['outer_vlan']==vlan and r['state']=='OFFLINE'}
                if len(related)>=3:
                    incident={'kind':'INFERENCE','code':'POSSIBLE_COLLECTIVE_INCIDENT',
                        'count':len(related),'window_seconds':300,'confidence':'medium',
                        'source':source,'outer_vlan':vlan,'timestamp':current}
            return {'history':history,'incident':incident}
