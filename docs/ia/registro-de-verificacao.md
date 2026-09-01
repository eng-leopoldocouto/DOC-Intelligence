# Registro de verificação do agente

O enunciado pontua "não 'usou ou não usou', mas **com que grau de controle**:
instrução do agente, estruturação dos prompts, **verificação do que voltou**".

Este arquivo é a prova da terceira parte. Cada entrada registra o que o agente
produziu, o que foi conferido, o que estava errado e o que foi feito.

Escrito no momento em que aconteceu, não reconstruído no fim.

---

## V-001 — 31/08/2026, 19:36 · Plano subdimensionou os artefatos de autoria

**O que o agente produziu:** um desenho de solução com cronograma de 8 fases,
orientado a artefato técnico (spec, contrato, código, testes), com o registro de
uso de IA e a carta de fechamento comprimidos numa única fase de 30 minutos no
final.

**O que eu conferi:** reli a seção II do enunciado item por item contra o
cronograma proposto.

**O que estava errado:** os itens II.4 (registro de IA) e II.5 (carta de
fechamento) valem, somados, boa parte da nota — o item II.4 sozinho é 20% do
critério de pontuação. Eles exigem autoria em primeira pessoa e material
acumulado ao longo do trabalho (prompts íntegros, erros percebidos, tempo real).
Tratá-los como tarefa final significaria reconstruí-los de memória, que é
exatamente o que o enunciado proíbe ao dizer "como foram escritos, não
reescritos depois para ficarem bonitos".

**O que eu fiz:** interrompi o agente antes da escrita da spec e exigi a
separação entre o que é competência minha e o que é produção dele. O plano foi
reaberto com uma trilha de autoria paralela à trilha técnica, e o registro
passou a ser contínuo: prompts capturados no ato, log de tempo com relógio real,
e este arquivo.

**Efeito colateral positivo:** os prompts 0001 a 0003 foram gravados
retroativamente na mesma sessão, ainda íntegros. Se a correção tivesse vindo
depois, teriam sido perdidos ou reconstruídos.

---

## V-002 — 31/08/2026, 19:42 · Alavanca de pontuação ignorada pelo agente

**O que o agente produziu:** ao ser cobrado, o próprio agente identificou que
havia ignorado uma instrução explícita e repetida do enunciado — "você pode e
deve perguntar: perguntas boas contam a favor, não contra" — e propôs seis
dúvidas para envio ao avaliador.

**O que eu conferi:** a viabilidade no prazo.

**O que decidi:** não há tempo hábil para enviar e-mail e aguardar resposta.
Converti as seis dúvidas em decisões minhas, documentadas como premissas na
spec. Duas de baixo impacto no front-end ficaram a cargo do agente; quatro que
mudam a interface decidi pessoalmente (ver `prompts/0005`).

**Observação sobre o controle:** o agente só encontrou essa alavanca depois de
ser cobrado sobre o item II.4. Ele não lê o enunciado procurando pontuação — ele
lê procurando tarefa. Quem precisa manter o critério de avaliação em vista sou
eu.

---

## V-003 — 31/08/2026, 20:52 · O agente escreveu um teste que sabia demais

**O que o agente produziu:** um teste de contrato que assumia a existência de um
campo chamado `nome` no documento.

**Como percebi:** o teste falhou de forma intermitente. Como o mock sorteia o
tipo do documento, ele quebrava quando saía comprovante de residência, que tem
`titular` em vez de `nome`.

**O que estava errado:** o teste cometia, no teste, exatamente o pecado que a
ADR-008 proíbe no front-end — saber de antemão o que a API vai devolver.

**O que fiz:** corrigi o **teste**, não o código. Ele passou a pegar a primeira
chave do schema recebido, sem conhecer nome de campo algum.

**O agente repetiu o mesmo erro depois**, na tela de conferência, usando
`findByLabelText(/Nome/i)`. Que voltasse a acontecer é o dado interessante: o
agente aplica o princípio no código de produção, onde a regra está escrita no
`CLAUDE.md`, mas não o transporta sozinho para o código de teste. **A regra
precisava valer para os dois, e eu é que precisei notar isso.**

---

## V-004 — 31/08/2026, 21:41 · Falso positivo no teste de arquitetura

**O que o agente produziu:** o teste que varre `src/` procurando nome de tipo de
documento acusou dois arquivos.

**O que eu conferi:** abri os dois. `http.ts` "conhecia RG" dentro de um
comentário que identifica o formato do número num regex de sanitização de PII.
E `estado.ts` foi acusado de tocar em `window` porque a própria docstring dele
diz "sem React, sem fetch, sem window".

**O que estava errado:** o teste lia comentário como se fosse código. Pior que o
falso positivo é o incentivo: um teste assim ensina a apagar comentário para
passar, que é o contrário do que este repositório quer.

**O que fiz:** o teste passou a remover comentários antes de varrer. As regras
valem para código.

---

## V-005 — 31/08/2026, 21:47 · Vazamento entre testes escondendo a causa

**O que o agente produziu:** testes de conferência que passavam isoladamente e
falhavam em conjunto.

**Como percebi:** rodei o arquivo inteiro e dois casos quebraram com "painel de
campos ainda não renderizou" — uma mensagem que não tinha relação com o que
falhava.

**O que estava errado:** faltava `servidorDeTeste.resetHandlers()`. O tipo de
documento **inventado** pelo teste T-03 vazava para os casos seguintes, que
passavam a carregar um catálogo sem o tipo dos seus próprios documentos.

**O que fiz:** exigi `resetHandlers()` e `removeAllListeners()` no `afterEach`, e
que a suíte fosse rodada **três vezes seguidas** antes de eu aceitar o resultado.
Teste que passa uma vez não prova nada quando há sorteio envolvido.

---

## V-006 — 01/09/2026, 00:30 · O auditor achou o que eu não achei

**O que o agente produziu:** o subagente auditor, rodando em contexto frio contra
`docs/enunciado.md`, emitiu **APROVADO COM RESSALVAS** (~84/100) e listou três
achados graves.

**O que eu conferi:** não aceitei nenhum pela palavra dele. Rodei as buscas eu
mesmo (`grep -rn "irtualiz" src/`, `git log --diff-filter=A`, `grep -n rascunho
README.md`) antes de mudar qualquer linha. **Os três procedem.**

**O que estava errado — e por que passou por mim:**

1. **A lista virtualizada era afirmada em três lugares e não existia.** Eu
   escrevi na spec "lista virtualizada e paginação por cursor", implementei só a
   paginação, e o README passou a tratar as duas como feitas. É exatamente a
   divergência entre texto e código que este repositório inteiro se propõe a não
   ter — e eu não a vi porque **li o meu próprio texto como se fosse evidência**,
   que é o erro contra o qual instruí o auditor.

2. **O registro de tempo tinha três linhas datadas para o futuro.** A tabela
   dizia "22:00–22:10" num commit carimbado às 21:54:31. Eram estimativas
   prospectivas dentro de um arquivo que se apresenta como "relógio real,
   carimbado no momento" — e a carta de fechamento se apoia nele. Este é o pior
   dos três: não é omissão, é um documento afirmando um método que ele próprio
   não seguiu.

3. **O README entregava um marcador de rascunho** dentro do parágrafo que o item
   II.3 exige, dizendo que o texto ainda seria redigido pelo candidato.

**O que fiz:** corrigi os horários e **registrei a correção em vez de apagar o
erro**; abri D-06, D-07 e D-08 em `08-divergencias.md`; assumi o parágrafo do
README em primeira pessoa; fiz `npm run mock` semear a base (o README oferecia
um `curl` que devolvia lista vazia); e derivei `MotivoRejeicao` do contrato, em
vez de mantê-lo escrito à mão contra a minha própria regra 1.

**O que aprendi, e é o ponto:** eu instruí o auditor a *"não acreditar na
narrativa do repositório sobre si mesmo"* — e era eu quem estava acreditando na
minha. Um autor não consegue auditar o próprio texto contra o próprio código,
porque lê o texto e lembra da intenção em vez de ver o que ficou. **O valor do
subagente não foi capacidade técnica: foi não ter memória do que eu quis dizer.**
