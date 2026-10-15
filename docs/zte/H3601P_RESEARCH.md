# H3601P V9 — pesquisa e decisões

Baseline: `feat/direct-visual-references`, `740638e1ba215246c16c77f7f91a5468e15c2a8b`, working tree limpo. Branch de implementação: `fix/zte-h3601p-v9`, sem derivar das variantes visuais e sem merge. Produto Access Manager, Vela 0.2.2.

Alvo informado pelo proprietário: ZXHN H3601P, V9.0.0P1_MUL. A Home expõe listas LAN/WLAN com nome, MAC, IPv4 e IPv6. Não recebemos captura HTTP P1 nem endereço/sessão acessível ao equipamento nesta execução.

## Fontes reabertas

| Fonte | Revisão consultada | Uso | Licença verificada | Código copiado |
|---|---|---|---|---|
| [Sentinel](https://github.com/kientran1507/Sentinel) | `920c4c6419711d527c55bc1e619bfe516180b49f` | `services/discovery/zte_h3601p_client.py` e parser: P2_VN1, menuView, candidatos e formatos XML | MIT, LICENSE lida | Não; implementação independente |
| [config-router](https://github.com/Kaduh15/config-router) | `d77f0d50301eb919776e5c4ac7466eaf8f70e89a` | README e main.py: GUI H3601P, PPPoE/Wi-Fi/Band Steering | Sem LICENSE na árvore consultada | Não |
| [wmemcmp/h3601p](https://github.com/wmemcmp/h3601p) | `7c52168e46e5ef652d6a6fb9be15193896c88f52` | README: hardware Ethernet, duas LAN + WAN | Sem licença única na raiz; fontes upstream diversas | Não; nenhum endpoint OpenWrt/LuCI usado |
| [zte_tracker](https://github.com/juacas/zte_tracker) | `f1911857e2dc2b5da8dc5b891d4ffd67d6e5c832` | Referência histórica do discovery já existente | GPL-3.0, LICENSE lida | Nenhum código novo copiado |

[ZTE oficial](https://www.zte.com.cn/global/home_and_enterprise/smart_home/zxhn_h3601p.html) e [ficha alternativa](https://www.zte.com.cn/global/product_index/smart_home_en/home_router/zxhn-h3601p/zxhn-h3601p.html): AX3000 Wi-Fi 6, uplink GE, EasyMesh. [Manual Claro H3601P V9](https://www.claro.com.br/files/104379/x/b5fa363d0f/manual-de-usuario-h3601p-v9-antenas-internas-pt.pdf), painel traseiro: LAN1–LAN2 e WAN RJ45. SHA256 do PDF consultado: `0f50fdb462b1a6b97d6e0a8244651e5560a0c6a6489925a8ee61d8bb10f1ecf0`. O PDF não foi incluído no repositório.

## Separação de evidências

P1_MUL: identificação/GUI informadas pelo proprietário; endpoints ainda não testados fisicamente. P2_VN1: implementação pública específica, não prova de equivalência do P1. P3_MUL: referência de GUI no briefing, sem fonte pública identificada para confirmação independente. Nenhuma destas fontes autoriza writes do P1.

O ThinkLua existente permanece: token/challenge, hash, login POST e refresh quando solicitado. Login/logout invalidam cache. O perfil prepara `localNetStatus` antes de menuData, guarda o candidato validado e 404 na sessão, reabre view após mudança de contexto e permite uma reautenticação por READ. Nenhum WRITE é repetido.

Parser próprio aceita namespaces e roots explicitamente permitidos, ParaName/ParaValue, registros completos e fragmentados. Qualificadores de campo e diferenças de caixa são resolvidos no lookup sem apagar os nomes internos. Campos repetidos delimitam clientes fragmentados, evitando sobrescrever o segundo cliente. Roots com sufixos não comprovados são rejeitados; não há substring em XML bruto para validar suporte.

WAN, LAN-port status, SSIDs e rádios usam tags já documentadas no catálogo legado como candidatos com validação de shape. Não são endpoints P1 confirmados. Topologia usa somente a classificação real dos clientes existente na UI; nenhuma consulta a topo_lua e nenhum vínculo Mesh fabricado. Relações Mesh permanecem pendentes.

Questões abertas: payloads e conta real P1, possíveis tags por banda, sufixos de objetos realmente presentes, associação SSID/banda/RSSI quando exposta, writers/token/Check/read-back, papel AP versus gateway e fonte Mesh. Capturas do firmware ativo vencem estas hipóteses.
