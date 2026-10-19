# Auditoria de configuração e UX

Data: 2026-10-19. Base: `main` em `aeb676e`. Branch: `feat/configuration-ux-wifi-standard`.

A aplicação continua em Vela → API → query/command bus → provider → protocolo. Nenhum endpoint de firmware foi criado, nenhum SupportStatus foi promovido e nenhum writer de anti-DoS/IGMP foi inferido. Evidência de código/fixture não equivale a homologação em ONT física.

## Matriz

| Feature | Leitura | Escrita | UI atual | Problema | Melhoria | Evidência | Teste |
|---|---|---|---|---|---|---|---|
| WAN | NativeWan / formulários capturados F6201B | Writer existente, nonce de uso único e readback | Rede → WAN | Backend editável ficava no catálogo genérico | Editor por conexão, campos por família, prévia, confirmação APLICAR, apply/readback | `_WAN_API_MAP`, `wan_configurations`, `OperationalConfigurations`, F6201B FormSpec | `test_configuration_ux.py`, frontend runtime, visual configuration-ux |
| PPPoE | Campos retornados na conexão | `update_wan` existente / F6201B capturado | Editor WAN | Senha não podia ser tratada como campo comum | Password vazio/sem seleção preserva por omissão; nova senha temporária; máscaras bloqueadas antes do POST; readback não confirma segredo | `_decrypt_wan_secrets`, `_encrypt_wan_post_secrets`, formulário capturado | Segredo mascarado, nonce, readback manual, ausência no JSON de profiles |
| DNS | Leitor atual | Provider existente | DHCP/DNS + presets | Sem presets cadastráveis nem distinção operacional clara | Categorias operadora, filtro adulto, IPTV/operacional e personalizado; cadastro explícito sem IP inventado; prévia por campo e resultado/readback | `ProfileService`, `set_dns` | DNS v4/v6 válido/inválido, frontend e visual |
| DHCP | Leitor atual | Apenas capability habilitada | Tela e profiles | Toolbar longa podia não quebrar linha | Mantida separação do DNS upstream; toolbar de profile quebra linha | Contratos existentes | Suíte de profiles, frontend e smoke Terminal |
| Firewall | `get_firewall` | `set_firewall` existente | Gerenciamento + profiles | Level era TextInput | Select Low/Middle/High com labels pt-BR e estado atual; booleano; confirmação antes do write | Writer ZTE valida exatamente estes três valores | UI real verifica SELECT, Middle selecionado, POST High; suites do writer |
| Anti-DoS | Referências legadas; sem superfície operacional completa neste runtime | Nenhuma nova | Não há ação automática | Screenshot com limite 150 não prova payload | Mantido bloqueio: faltam objeto, campos, Apply e readback correspondentes ao login/firmware ativo | Forense legado + catálogo atual; nenhum contrato íntegro adicional encontrado | Catálogo/fixtures existentes; nenhuma capability alterada |
| Multicast/IPTV | Sem leitor/writer operacional IGMP no catálogo atual | Nenhuma nova | Seção em DHCP/DNS | “Otimizar IPTV” genérico enviaria ajustes especulativos | Mensagem “Não disponível neste firmware/login.”; DNS operacional cadastrado; VLAN/serviço revisados explicitamente na WAN | Catálogo, F6201B FormSpec e referências abaixo | Visual verifica indisponibilidade; não há botão de ajuste arbitrário |
| Wi-Fi radio | Leitores e opções atuais | Writers anteriores | Editor e profiles | Controles genéricos duplicados | FieldSpec compartilhado; enum sem opções continua desabilitado | Contratos RF atuais | Testes de rádio e frontend existentes |
| Wi-Fi clients | Parser nativo e runtime por perfil | Não se aplica | Tabela, cards, topologia e drawer | CurrentMode não chegava consistentemente à UI | Campos canônicos, filtro por geração, badge N/AC/AX/BE, telemetria e observações conservadoras | CurrentMode/sta_mode; LuCI HT/VHT/HE/EHT | Aliases, desconhecido, H3601P CurrentMode antes de Mode, tabela/drawer/atendimento |
| Profiles | Capture por capability + superfície atual | Command bus / mesmos writers | Editor, prévia e resultado | WAN/firewall eram apenas extensões sem operações | Intenções first-class; captura sem credenciais; WAN atual identificada por id; senha PPPoE só no apply; unsupported pulado | `NetworkProfile`, BaseProfileTranslator, interfaces existentes | Roundtrip, legado, capture, secrets e operação independente |
| Mundos 3D | Estado local | Nenhuma operação de equipamento pelo combate | Aero, Network Ops, Router Rumble; Voxel/Field Ops mantidos | Câmera sem preferência por cenário; listeners globais sobreviviam ao dispose | Indicador discreto, V preservado, arena terceira pessoa por padrão, preferência por cenário; AbortController na experiência | Renderers existentes e smoke nativo | Smoke Chromium e Vela/Qt; V alterna primeira/terceira |
| TV/YouTube | Busca já integrada na main | Player oficial no CSS3D da TV | Painel de busca e televisão modelada | Resposta de busca podia chegar após fechar/sair | Preservado player na TV; busca cancelada ao fechar/sair/desmontar | `media.js`, `experience.js`, CSS3DRenderer já existentes | Smoke com fronteira externa simulada; não certifica rede/YouTube ao vivo |
| Combate | Simulação local | Apenas estado local | J/K/B/Q/T/R e botões | Risco de regressão ao mexer na câmera/lifecycle | Controles e isolamento de API preservados | CombatSystem e listeners existentes | Dano, bloqueio/esquiva, revanche, ausência de mutações remotas |
| Clipboard | Backend desktop existente | Python/pyperclip | Atendimento/Wi-Fi | Não reintroduzir navigator.clipboard em Qt | Mantida implementação desktop | `shared/clipboard.js`, backend Python | Suítes de clipboard anteriores continuam ativas |

## Contratos e segurança

- `FieldSpec` compartilhado rende text/password/number/select/boolean/ip/vlan, opções, limites, placeholder, help, disabled e visibleWhen. Campos PPP são condicionados ao link PPP quando o controlador foi retornado. Mantém compatibilidade com `type: bool` e opções dos editores anteriores. A UI de superfícies usa os campos realmente retornados pelo firmware; nenhum campo IPv6 ausente é fabricado.
- O editor WAN só permite alterar instâncias existentes. Add/Delete continuam no catálogo anterior; a nova UX não inventa defaults para criar conexão. NativeWan expõe somente campos observados, e rejeita propostas para campos ausentes. F6201B reutiliza sua superfície capturada.
- VLAN 1–4094 quando habilitada; VLAN 0/vazia pode ser preservada quando desabilitada. Priority 0–7. MTU/MRU 576–1500. IPs são validados com `ipaddress` e família IPv4/IPv6 correspondente.
- “Sugerir configuração padrão” preenche somente os controles atuais compatíveis: internet_tr069, Routing (`route`), INTERNET_TR069, MTU 1492, PPP/PPPoE, Auto, AlwaysOn, NAT e VLAN 2000/0. Valores ficam visíveis/editáveis e só são enviados depois da prévia/confirmacão. Usuário/senha PPPoE não fazem parte do preset. IpMode e variantes IPv6CP/Auto/PD/GUA/SLAAC não recebem códigos presumidos; continuam dependentes do formulário atual.
- Profile contém `wan.connections[{id, config}]` e `firewall{enabled, level?}` além de wifi/dns/dhcp. Perfis antigos continuam carregando e retendo extensões. Uma conexão pertence à instância atual; ids não são portáveis entre equipamentos sem revisão do operador.
- Captura de WAN omite usuário e senha. O save rejeita credenciais PPPoE e chaves sensíveis aninhadas (password/psk/token/cookie/senha etc.). Segredo PPPoE é enviado separadamente em `secrets['wan:<id>']`, somente no apply, sem salvar o perfil. Um segredo ilegível/mascarado não é confirmação de preservação: se o writer não puder preservar, a operação exige credencial real ou falha sem POST especulativo.
- NativeWan aplica por `surface_preview`/`surface_apply`: mesmo snapshot, nonce, proteção de estado obsoleto e um único write. Resultado incerto não provoca retry. Senha alterada exige confirmação por autenticação; nenhuma leitura mascarada é apresentada como “senha verificada”.
- Perfis aplicam WAN em ZTE nativo/F6201B quando superfície e instância são legíveis. H3601P depende do contrato realmente observado. Huawei/Juniper não recebem esse writer ZTE. Firewall com enum ZTE permanece restrito à capability ZTE; níveis próprios Huawei não são substituídos por Low/Middle/High. Captura de enum não portável conserva apenas enabled, e o editor permite preservar nível.
- DNS presets persistem apenas nome, descrição, categoria e endereços no repositório de perfis do atendente. Aplicação usa apenas a intenção DNS do preset; não aplica outras partes de um perfil. DHCP DNS e Static DNS Hosts continuam separados.

## Padrão negociado e diagnóstico

`CurrentMode` precede Mode no runtime por perfil. O parser nativo conserva aliases reais da estação. A normalização publica `wifi_standard_raw`, `wifi_standard`, `wifi_generation`, `wifi_mode_family` na API de clientes. N/HT → 4, AC/VHT → 5, AX/HE → 6, BE/EHT → 7; b/g não ganham uma geração artificial. Modo misto de rádio, desconhecido ou ausente permanece “Não informado”. Nunca se infere AX pela capacidade da ONT.

Tabela, filtro, cards/topologia e drawer usam os campos canônicos. Diagnóstico e atendimento incluem padrão, banda, SSID, RSSI, SNR, ruído, MCS, largura, taxas, canal do rádio relacionado e tempo quando disponíveis. Wi-Fi 5 não é classificado como defeito. Taxa baixa com sinal bom sugere investigar largura/MCS/interferência/congestionamento; N/2.4 GHz com RSSI fraco e baixa taxa é apenas possível gargalo.

## Estilos e eficiência

Revisados `tokens.css`, `app.css`, `professional.css`, `aero.css`, `vela-integration.css`, `regressions.css`, `world.css`, `juniper.css`, `field-ops.css`, `login-experiences.css`. As camadas históricas Professional/Aero/Vela ainda têm muitas regras !important; uma reescrita ampla alteraria identidade/cascata sem benefício comprovado nesta mudança.

As correções foram colocadas no componente base: form grid com minmax, inputs/selects limitados à largura disponível, valores técnicos com wrap, toolbar de profiles com wrap e scroll local de tabela. O dialog de profiles/superfícies mantém header/footer fora da área rolável. Nenhum arquivo CSS “fix” foi criado. O indicador da câmera só atualiza texto quando muda, evitando mutações de DOM em cada frame. Resize agrupado, `setSize(..., false)`, GPU high-performance, qualidade e contextlost foram preservados.

Não foi adicionado polling. Catálogo/leituras continuam vinculados ao scope da view/dialog. Fechar o dialog aborta requests; editar o formulário descarta a prévia visível. A experiência 3D remove listeners globais ao desmontar, restaura callback de áudio e destrói o player ao sair. Busca de TV é abortada quando deixa de ser relevante.

## Referências revisadas

Consulta em 2026-10-19; código foi usado como evidência e nomenclatura, sem copiar endpoints entre modelos:

- [Legado zte_management.py](https://github.com/zxlawdx/acess_manager/blob/main/apps/zte_manager/model/zte_configuration/zte_management.py), blob `e3973c5e181228177e6fc96c4319bc54895379f9`: enum firewall, ID_WAN_COMFIG e fluxo de credenciais WAN.
- [Legado F6201B full forms](https://github.com/zxlawdx/acess_manager/blob/main/apps/zte_manager/services/f6201b_full_forms.py), blob `0c14e6bf21321702cb024b1ea45c4688a34cf484`; [workbench](https://github.com/zxlawdx/acess_manager/blob/main/apps/zte_manager/services/f6201b_workbench.py), blob `0436c2ba0fa6adfe718d6c0651d3581266dcc067`: campos condicionais e preservação de formulário. Nenhuma autorização genérica para outros firmwares.
- [zte-f609-manager zte_client.py](https://github.com/YudaKusumaID/zte-f609-manager/blob/main/client/zte_client.py), blob `43dbf3453a939947a5eb87d7d536d0b1f3e3a3c6`; [models.py](https://github.com/YudaKusumaID/zte-f609-manager/blob/main/client/models.py), blob `49a5ad2b13a651eacec0aa9a755742b4e6e91dfa`: CurrentMode → sta_mode, RSSI, TXRate, RXRate e MCS.
- [LuCI network.js](https://github.com/openwrt/luci/blob/master/modules/luci-base/htdocs/luci-static/resources/network.js), blob `b5e4c2b13da7cbc3d26063615e552424ff4eba30`; [60_wifi.js](https://github.com/openwrt/luci/blob/master/modules/luci-mod-status/htdocs/luci-static/resources/view/status/include/60_wifi.js), blob `8406a1a59d7d0b17ac4e8bd3297b11c837cc0905`; [wireless.js](https://github.com/openwrt/luci/blob/master/modules/luci-mod-network/htdocs/luci-static/resources/view/network/wireless.js): HT/VHT/HE/EHT, MCS/NSS, MHz e taxas são telemetria, não diagnóstico de falha.
- [langit7/zte-f670L](https://github.com/langit7/zte-f670L), f670-iphunt.py blob `592a5a4eb76396d1abd47e532565d01d002ec5ae`: fluxo limitado a versões F670L específicas; não prova novo writer anti-DoS.
- [MichaelJorky/Firmware-Default-Router-ZTE-F670L](https://github.com/MichaelJorky/Firmware-Default-Router-ZTE-F670L): coleção binária/recovery, não um contrato completo de Apply/readback. Nenhum firmware foi instalado/modificado.
- [IgorKowalczyk/prometheus-zte-F670L](https://github.com/IgorKowalczyk/prometheus-zte-F670L): telemetria, explicitamente testado em V9.0.11P1N2; não autoriza escrita em outro modelo/login.
- [byGOG/ZTE-H3601P](https://github.com/byGOG/ZTE-H3601P): automação Selenium de reboot/IP; não fornece prova de WAN/IGMP no runtime por perfil. Selenium não foi introduzido.

## Validação

Resultado local: **598 testes Python + 30 subtests**, **125 testes frontend**, bundles, assets e collectstatic aprovados. Smokes Terminal, mundo 3D e configuração aprovados nas três resoluções; configuração em Terminal/Aero. O CI também passa a executar o novo smoke de configuração. Comandos reproduzíveis:

```sh
python tools/sync_frontend.py --check
python tools/world3d_assets.py
python -m pytest -q
npm test
node tests/visual/terminal-theme.cjs
node tests/visual/world-interactions.cjs
node tests/visual/configuration-ux.cjs
python manage.py collectstatic --no-tailwind
```

O smoke de configurações cobre Terminal/Aero nas três resoluções, firewall, WAN, padrão Wi-Fi/diagnóstico, DNS sem IPs pré-preenchidos e rodapé de profiles. O smoke 3D cobre teclado, combate, playlist, TV modelada, resize e perda de contexto. A janela real Vela + Qt6 WebEngine (não congelada), com respostas sintéticas apenas de equipamento, foi executada em 1366×768, 1600×900 e 1920×1080, Low/Medium/High, troca de cena e saída. Windows físico/frozen, maximizar/restaurar em desktop Windows e DPI 125/150% não foram certificados. Não houve escrita em equipamento físico nem teste de autenticação PPPoE real.
