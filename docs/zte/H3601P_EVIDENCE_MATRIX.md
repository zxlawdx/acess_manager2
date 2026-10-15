# Evidências por firmware

| Feature | P1_MUL | P2_VN1 | P3_MUL | Implementação deste patch |
|---|---|---|---|---|
| Identificação H3601P/V9 | UI informada pelo proprietário | Identificação pública | Referência no briefing não revalidada | AUTOMATED_TESTED com entradas sintéticas |
| ThinkLua login | PHYSICALLY OBSERVED / log do proprietário | SOURCE_CONFIRMED no código público | Não testado | Login existente preservado, teste refresh/lifecycle |
| localNetStatus e listas accessdev | Não alcançados no log físico / RESEARCH_ONLY | SOURCE_CONFIRMED | Não testado | FIXTURE_VALIDATED / AUTOMATED_TESTED |
| statusMgr menuView | PHYSICALLY OBSERVED / 404 no log do proprietário | Sem nova medição | Não testado | Bootstrap trata como view opcional ausente |
| Fragmentação e roots alternativos | Payload não capturado | Padrões do parser público | Não testado | Fixtures estruturais sintéticas, sem alegar captura de wire |
| IPv6 link-local | UI relatada | Alias não garante firmware P1 | Não testado | AUTOMATED_TESTED, campo e lista preservados |
| WAN/LAN ports/SSIDs/radios | RESEARCH_ONLY | Tags ThinkLua não confirmadas por este estudo para P2 | Não testado | Candidatos legados, prova apenas após shape da sessão |
| topo_lua | Não testado | 404 descrito em código público | Não testado | Não é dependência do runtime H3601P |
| PPPoE/Wi-Fi/Band Steering writes | Não testado | GUI H3601P sem prova de request por firmware | Não testado | UNKNOWN; nenhum writer promovido |
| Optical | Não se aplica ao papel Ethernet documentado | Não se aplica | Não se aplica | UNSUPPORTED, sem consulta |
| Mesh | EasyMesh da ficha não prova endpoint | Topologia pode usar access devices | Não testado | PARTIAL, sem enlaces inventados |

Não há PHYSICALLY_VALIDATED neste patch. SUPPORTED em sessão significa resposta estruturada validada para a leitura; o enum de evidência do código continua AUTOMATED_TESTED, não validação física. Model hint só seleciona candidatos, mantém identidade PARTIAL e modo deployment até existir identificação confiável. A evidência de P3 é mais fraca que a de P2 e não foi promovida.

O log físico confirmou autenticação e ausência de statusMgr; não confirmou nenhum endpoint de clientes. AUTHENTICATED, IDENTIFIED, PROFILE_SELECTED e FEATURES_VALIDATED são estados separados. Assinatura sem modelo não permite alegar H3601P ou firmware, nem liberar writers.
