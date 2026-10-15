"""Public errors never contain transport exception text or router payloads."""
MESSAGES={
 'XML_PARSE_ERROR':'O Juniper retornou XML malformado. A leitura não foi aplicada.',
 'XML_SHAPE_UNSUPPORTED':'A resposta XML do Juniper possui uma estrutura ainda não reconhecida.',
 'EMPTY_RESPONSE':'O Juniper retornou uma resposta vazia.',
 'CLI_COMMAND_ERROR':'O Juniper retornou um erro ao executar a consulta.',
 'SSH_COMMAND_FAILED':'O canal SSH retornou falha na execução desta consulta.',
 'RESPONSE_TOO_LARGE':'A resposta do Juniper excedeu o limite seguro. Refine o escopo ou utilize uma leitura específica.',

 'HOST_KEY_UNKNOWN':'Chave SSH desconhecida. Verifique a identidade do servidor nas configurações avançadas.',
 'HOST_KEY_CHANGED':'A chave SSH mudou. A conexão foi bloqueada; revalide a identidade do servidor.',
 'PAGINATED_INCOMPLETE':'Resposta paginada incompleta. Nenhum inventário parcial foi aplicado.',
 'COMMAND_UNSUPPORTED':'O equipamento não reconheceu esta consulta.',
 'REMOTE_ERROR':'O equipamento recusou esta leitura.',
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
    def __init__(self,code,**diagnostics):
        self.code=code
        self.diagnostics={k:v for k,v in diagnostics.items() if k in {'response_bytes','output_format','xml_root','exit_status'}}
        self.request_id=None
        self.public_message=MESSAGES.get(code,'Não foi possível concluir esta operação Juniper.')
        super().__init__(self.public_message)

RETRYABLE={'CONNECTION_TIMEOUT','DEVICE_BUSY','SSH_UNAVAILABLE','NETCONF_UNAVAILABLE'}
TRANSPORT_ERRORS={'SSH_UNAVAILABLE','NETCONF_UNAVAILABLE','CONNECTION_TIMEOUT'}
