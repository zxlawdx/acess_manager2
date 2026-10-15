# H3601P P1_MUL — evidência física e pendências

## Log físico fornecido pelo proprietário

Fonte: prompt corretivo `PROMPT_CORRIGIR_H3601P_STATUSMGR_404_ACCESS_MANAGER`, recebido nesta rodada. O log veio do ambiente Windows do proprietário; não representa teste físico executado neste host de desenvolvimento. Não foram gravados host, IP, porta, usuário, senha, cookies ou tokens.

Modelo/firmware observados no GUI: ZXHN H3601P / V9.0.0P1_MUL.

| Etapa | Resultado físico relatado | Estado |
|---|---|---|
| login_entry GET | HTTP 200, token recebido | PHYSICALLY OBSERVED / owner log |
| login_token GET | HTTP 200, challenge recebido | PHYSICALLY OBSERVED / owner log |
| login_entry POST | HTTP 200, sem erro de login | PHYSICALLY OBSERVED / success |
| root refresh | HTTP 200, contexto recebido | PHYSICALLY OBSERVED |
| menuView statusMgr | HTTP 404 | PHYSICALLY OBSERVED / view ausente |
| menuData devmgr_statusmgr_lua.lua direto | Não testado no aparelho | Pendente |
| localNetStatus | Não alcançado no teste físico relatado | Pendente |
| accessdev_ssiddev_lua.lua | Não alcançado no teste físico relatado | Pendente |
| accessdev_landevs_lua.lua | Não alcançado no teste físico relatado | Pendente |

O patch anterior abortava após o 404 se não encontrasse footer/model_hint. A correção preserva a autenticação, tenta o device-info direto uma vez e permite assinatura limitada ou modo deployment autenticado. Nenhuma capability de clientes P1 recebeu evidência física nova.

## Reteste após esta correção

1. Feche o app e atualize a branch existente: `git pull --ff-only origin fix/zte-h3601p-v9`.
2. Preserve `data/profiles.json`. Não recrie/reset a branch. Este patch não altera esse arquivo.
3. Use o Python já funcional: `python manage.py collectstatic --no-tailwind`, depois `python manage.py runapp`.
4. Conecte no aparelho, sem exigir model_hint. Se só a assinatura for reconhecida, a identidade mostrada deve ser ZTE, não H3601P inventado.
5. Verifique `GET /api/device/runtime/diagnostic` ou execute, separadamente, `python tools/zte_probe_h3601p.py --host <endereco>`: senha sem echo; saída estrutural sanitizada, sem hint H3601P forçado.
6. Compare Clientes com o GUI localmente. Não publique nomes, IPs, MACs ou credenciais reais.

Não é necessário ativar `.venv` inexistente, instalar Node/npm ou reconstruir frontend: nenhum source frontend mudou. Se outra branch exigir build, siga seus requisitos próprios.

Log esperado: login OK → statusMgr 404 → tentativa menuData devmgr_statusmgr uma vez → resultado classificado → localNetStatus → primários accessdev LAN/WLAN quando identidade continuar ausente → sessão conectada. Se localNetStatus também falhar, sessão continua em deployment; tags anunciadas seguras aparecem no diagnóstico sem serem automaticamente chamadas.

## Histórico anterior ao log do proprietário

O registro abaixo documenta o estado inicial, antes desta nova evidência; as pendências de payload/clients P1 continuam válidas.

# Registro inicial: validação física ainda não executada

Device
- Model alvo: ZXHN H3601P.
- Firmware alvo: V9.0.0P1_MUL.
- Hardware: não fornecido por captura real.
- Access mode: não fornecido; sem endereço/sessão alcançável nesta execução.

Login / WLAN / LAN / WAN / Wi-Fi / LAN ports
- result: NOT TESTED on physical P1_MUL.
- endpoint/root/client count: não medidos.
- matches GUI: não comparado.
- evidence: somente testes automatizados com XML sintético e fontes públicas P2.

Optical: UNSUPPORTED por papel Ethernet. Writes: não testados e não habilitados pelo perfil.

## Executar no computador que alcança o roteador

```powershell
python tools/zte_probe_h3601p.py --host <endereco-do-roteador>
# acrescente --https somente se este for o transporte usado pelo GUI
```

Usuário pode ser digitado; senha é solicitada sem echo. Não existe argumento de senha. `--output estrutura.json` grava somente o relatório sanitizado. O probe usa login existente, somente os três grupos de listas conhecidos, sem POST de configuração. Não exporta IP, MAC, hostname, SSID, serial, senha, token ou cookie.

Para validar contagem e conteúdo, compare localmente Clientes no Access Manager com as listas WLAN/LAN da Home: mesmas MACs/IPv4/IPv6/classificação; aparelhos de nome igual com MAC diferente permanecem separados. Lease DHCP offline não deve aparecer como online. Não publique dados reais no relatório.

Se não corresponder: DevTools → Network → Preserve log → Fetch/XHR; navegar Home/listas LAN/WLAN/Internet/Rede local. Registrar apenas método, _type, _tag, view anterior, status, content-type, roots e nomes de campos não sensíveis. Não commitar HAR/XML cru. `probe` exporta estrutura, não fixture de dados; a criação futura de fixture P1 exige anonimização explícita e revisão de tokens/credenciais/clientes antes de salvar.

Se scripts reais estiverem disponíveis, inventariar somente strings de rotas conhecidas. Não foram fornecidos assets P1; nenhum endpoint adicional por banda foi inventado.
