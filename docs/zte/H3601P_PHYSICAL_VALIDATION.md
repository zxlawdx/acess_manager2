# Validação física — NÃO EXECUTADA

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
