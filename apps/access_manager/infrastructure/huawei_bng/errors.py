class BngError(RuntimeError):
    def __init__(self, code):
        self.code = code
        self.public_message = 'Consulta BNG indisponível: ' + code
        super().__init__(self.public_message)
