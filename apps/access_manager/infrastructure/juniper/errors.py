"""Public errors never contain transport exception text or router payloads."""
MESSAGES={
 'AUTHENTICATION_FAILED':'O Juniper rejeitou a autenticação.',
 'CONNECTION_TIMEOUT':'O Juniper não respondeu no tempo esperado.',
 'NETCONF_UNAVAILABLE':'NETCONF indisponível. Verifique a porta ou selecione SSH/XML.',
 'SSH_UNAVAILABLE':'Não foi possível estabelecer a conexão SSH.',
 'HOST_KEY_UNTRUSTED':'Chave SSH não reconhecida ou alterada. Valide o equipamento no known_hosts do usuário antes de conectar.',
 'PERMISSION_DENIED':'A conta conectada não possui permissão para esta leitura.',
 'UNSUPPORTED_PLATFORM':'A resposta não confirmou um equipamento Junos compatível.',
 'RPC_ERROR':'O Juniper recusou a consulta operacional.',
 'COMMAND_ERROR':'A resposta da consulta não possui a estrutura XML esperada.',
 'DEVICE_BUSY':'O equipamento não conseguiu atender à consulta agora.',
 'STALE_SESSION':'A sessão mudou desde a última consulta. Atualize os dados.',
 'SUBSCRIBER_NOT_FOUND':'Nenhuma sessão ativa encontrada nesta consulta.',
}
class JuniperError(RuntimeError):
    def __init__(self,code):
        self.code=code
        self.public_message=MESSAGES.get(code,'Não foi possível concluir esta operação Juniper.')
        super().__init__(self.public_message)
