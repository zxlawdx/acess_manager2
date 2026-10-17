from .common import *
from apps.access_manager.domain.triage import evaluate_snapshot


@api.post('/triage')
def triage_snapshot(context=None):
    snapshot = body(context)

    def run():
        session = sessions.session
        if session is None:
            raise RuntimeError('Sem sessão conectada')
        requested = snapshot.get('session_id')
        if requested and str(requested) != str(session.session_id):
            raise ValueError('O snapshot pertence a outra sessão do equipamento')
        capabilities = sessions.provider.capabilities.public()
        return evaluate_snapshot(
            snapshot,
            capabilities=capabilities,
            source_revision=snapshot.get('source_revision') or str(session.session_id),
        ).public()

    return safe(run)
