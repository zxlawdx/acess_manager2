"""Typed, sanitized failures at the ZTE provider boundary."""


class ZTEAuthenticationError(RuntimeError):
    def __init__(self):
        super().__init__('O equipamento ZTE rejeitou a autenticação.')
