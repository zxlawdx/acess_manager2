# Comparação das variantes de UI

Ambas partem diretamente de `740638e1ba215246c16c77f7f91a5468e15c2a8b`. Nenhuma deriva da outra. Não há merge na principal nem PR automático.

| Critério | dark-cohesive | human-motion-experiment |
|---|---|---|
| Fidelidade | Geometria e agrupamentos do baseline | Mesma geometria; cabeçalhos e agrupamentos com acabamento adicional |
| Claro/escuro | Mesmos papéis semânticos, violeta existente | Mesmos temas e preferência persistente |
| Densidade | Preservada | Preservada; não adiciona grandes cards |
| Legibilidade | Estados explícitos, foco e contraste | Mesmo tratamento, mais contexto de foco em linhas |
| Motion | Apenas transição de link e pulso com delta real | Também destaca valores alterados, novas linhas e abertura de diálogos |
| Portas LAN | RJ45, link, velocidade, cliente e tabela original | Mesmos dados, transição coordenada do LED, velocidade e cliente |
| Tabelas | Hover e cabeçalhos sem zebra forte | Foco de linha e entrada breve de novos registros |
| Formulários | Tokens para dark, autofill, readonly/disabled/erro | Mesmos controles e contratos; abertura mais suave |
| Performance | CSS/SVG, sem dependência nova | Observer limitado a mudanças de texto/linhas; timers curtos, sem biblioteca |
| Risco adicional | Novo tema e componente LAN | Mesmo risco mais observação visual de mutações; nenhum writer novo |
| Acessibilidade | Texto de estado e reduced motion | Idem; reduced motion também cancela feedback em andamento |

As métricas ópticas conservam valores reais, sem percentual fabricado. Gerenciamento apresenta histórico existente, sem criar streaming de logs. Não há animação de tráfego sem contadores por porta.

QA: consulte `docs/UI_VARIANT_REPORT.md` e `docs/screenshots/variants/<variante>/qa.json` em cada branch. As capturas usam dados sintéticos somente no teste, em janela Vela/Qt real. Não substituem teste físico no Windows ou em roteador.

## Alternar

```powershell
git switch ui/dark-cohesive
# ou: git switch ui/human-motion-experiment
.\.venv\Scripts\Activate.ps1
python tools\sync_frontend.py
python manage.py collectstatic --no-tailwind
python manage.py runapp
```

Feche a aplicação antes de alternar. Os temas podem ser selecionados tanto no login quanto na topbar. A preferência é compartilhada localmente entre as variantes.
