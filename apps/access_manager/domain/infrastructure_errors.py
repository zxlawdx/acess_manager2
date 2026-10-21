"""Shared error boundary for infrastructure adapters and session identity."""
class InfrastructureError(RuntimeError):
    pass


class InfrastructureSessionError(InfrastructureError):
    code = 'STALE_SESSION'
    public_message = 'A sessão mudou desde a última consulta. Atualize os dados.'
    def __init__(self): super().__init__(self.public_message)


class SshTrustError(InfrastructureError):
    def __init__(self, code):
        self.code = code
        self.public_message = 'Identidade SSH não confirmada: ' + code
        super().__init__(self.public_message)
