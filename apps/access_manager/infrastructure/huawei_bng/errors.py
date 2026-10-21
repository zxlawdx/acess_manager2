"""Safe BNG failures: only static codes and stages cross the API boundary."""
import re


class BngError(RuntimeError):
    def __init__(self, code, *, stage=None):
        self.code = code if isinstance(code,str) and re.fullmatch(r'[A-Z_]{1,64}',code) else 'BNG_ERROR'
        self.stage = stage if isinstance(stage,str) and re.fullmatch(r'[a-z_]{1,40}',stage) else None
        self.public_message = 'Consulta BNG indisponível: ' + self.code
        if self.stage: self.public_message += ' (etapa: ' + self.stage + ')'
        super().__init__(self.public_message)
