# Transcrições

Gerado por script a partir do registro local do Claude Code. **Nada aqui foi
editado à mão** — se algum trecho parece desfavorável, ficou.

| Arquivo | O que é | Tamanho |
|---|---|---|
| [`sessao-completa.md`](sessao-completa.md) | O diálogo inteiro: 12 turnos do candidato, as respostas do agente e um resumo das 235 chamadas de ferramenta | 82 KB |
| [`auditorias/`](auditorias/) | As transcrições dos subagentes auditores, com os comandos **na íntegra** | 124 KB |

Regenerar:

```bash
python scripts/exportar-sessao.py       # a sessão principal
python scripts/exportar-auditorias.py   # as auditorias
```

## Por que as auditorias vêm num formato diferente

Na sessão principal, as chamadas de ferramenta aparecem **resumidas** — nome e
alvo. Nas auditorias elas aparecem **na íntegra**, com o comando completo.

A diferença não é capricho. Na sessão principal o que importa é a conversa: o
que foi pedido e o que foi respondido. Nas auditorias, o que importa é **o
comando** — é nele que se vê a ferramenta conferindo as afirmações do
repositório em vez de acreditar nelas. O texto do auditor é conclusão; o `grep`
é a prova.

## As quatro rodadas

| Rodada | Resultado | Comandos |
|---|---|---|
| [Tentativa interrompida](auditorias/0-primeira-tentativa-interrompida.md) | Parou por limite de uso da sessão, sem veredito | 5 |
| [Primeira](auditorias/1-primeira-auditoria.md) | **84/100** — registro de tempo datado para o futuro; lista virtualizada afirmada e inexistente | 44 |
| [Segunda](auditorias/2-segunda-auditoria.md) | **86/100** — quatro dos seis achados novos foram criados pela correção anterior | 24 |
| [Terceira](auditorias/3-terceira-auditoria.md) | **85/100** — nomeou o padrão que as duas anteriores não viram | 37 |

A tentativa interrompida fica aqui porque a interrupção é parte honesta do que
aconteceu, e porque uma pasta com só os resultados bem-sucedidos contaria uma
história mais limpa do que a verdadeira.

## O que ler primeiro, se for ler só um

A [terceira auditoria](auditorias/3-terceira-auditoria.md). É onde o auditor
compara a tabela de tempo com `git log --diff-filter=A`, extrai o texto de
dentro do PDF para conferir contra o Markdown, e conclui:

> *o defeito não está no item apontado — está no vizinho aritmético do item
> apontado, ou no outro documento que cita o item apontado.*
