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

---

## V-007 — 01/09/2026 · Três rodadas de auditoria, três vezes o mesmo padrão

**O que o agente produziu:** rodei o auditor mais duas vezes. Segunda rodada:
86/100, seis achados novos — **quatro deles criados pela correção da primeira**.
Terceira: 85/100, oito achados, e desta vez ele nomeou o padrão.

**O padrão:**

> *o defeito não está no item apontado — está no vizinho aritmético do item
> apontado, ou no outro documento que cita o item apontado.*

Três exemplos, um por rodada:

1. Corrigi as fases 6 e 7 do registro de tempo. **Errei a fase 8**, escrevendo um
   término dezoito minutos à frente do commit — dentro do parágrafo que acabara
   de explicar por que isso é inaceitável.
2. Consertei a fase 8 estruturalmente. **Errei a soma**: mudei dois valores da
   coluna e, no mesmo diff, repeti o total antigo (3h08 quando já era 3h20). O
   número errado foi para a carta e para o PDF, numa frase que manda o avaliador
   conferir o arquivo.
3. Registrei a divergência da lista virtualizada citando três lugares. **Eram
   cinco** — e os dois que faltavam eram justamente os que afirmavam *ter
   verificado*.

**O que fiz:** além de corrigir, mudei o método. Passei a **procurar pelo número,
não pelo assunto**. `grep -rn "3h08" docs/` teria pego o segundo caso em quinze
segundos; reler o parágrafo não pegou nenhuma das três vezes. E a carta passou a
ser o **último** artefato regerado, nunca o primeiro — nas duas primeiras rodadas
o PDF saiu antes de o repositório estabilizar, e por isso foi o único lugar onde
o erro sobreviveu.

**O que isto diz sobre trabalhar com agentes, e é a conclusão da entrega:** o
agente não erra por incompetência, erra por **escopo de atenção**. Ele corrige o
que foi apontado, com precisão, e não olha ao lado. Eu também não — a diferença é
que eu achava que estava olhando. Foram necessárias três passagens de um leitor
sem memória da minha intenção para que a contabilidade da entrega ficasse de pé.

**Ressalva honesta sobre este próprio arquivo:** a auditoria apontou que a
correção anterior não o atualizou, violando a regra 6 do `CLAUDE.md` — a que diz
que estes registros "não podem ser reconstruídos no fim". Ela tinha razão. Esta
entrada foi escrita depois dos fatos que descreve, e não no momento deles. Fica
declarado.

---

## V-008 — 01/09/2026, manhã · Auditoria externa: quatro defeitos meus, nenhum pego por teste

Uma auditoria **externa a este repositório** devolveu uma lista em quatro blocos.
O prompt está íntegro em
[`prompts/0014`](prompts/0014-2026-09-01-auditoria-externa-defeitos.md).

### O que verifiquei, rodando

| Verificação | Comando | Resultado |
|---|---|---|
| Base antes de mexer | `npm run typecheck && npm test` | limpo, **64 testes** |
| Depois de tudo | `npm run typecheck && npm run lint && npm test` | limpo, **0 avisos**, **96 testes** |
| O linter não é vácuo | violação deliberada em `fila.ts` | saída **1**; removida, saída **0** |
| O passo de CI dos tipos | `npm run gen:api && git diff --exit-code` | diff **vazio** |
| O hook bloqueia | JSON na entrada padrão, cinco casos | `fetch(` fora de `shared/api/` → **2**; dentro → 0; tipo de documento em `features/` → **2**; em `mocks/` → 0; **em comentário → 0** |
| A fatia continua de pé | `exemplos.http` inteiro contra `npm run mock` | 202 no envio, 200 `duplicado:true` no reenvio, 409 no claim do segundo, 409 no `If-Match` velho com `alteradoPor` |
| 360 px | navegador em 360 × 800, medindo | sem rolagem horizontal, **0** elementos ultrapassando a largura, **0** alvos de toque abaixo de 44 px |

### O hook disparou? Sim — e o interessante é *quando*

**Disparou nos testes que fiz de propósito, e não durante o desenvolvimento.**
Isso é informação, não decepção: nesta rodada eu não escrevi nada que quebrasse
as regras 2 ou 3, porque o trabalho foi de acessibilidade, CSS e validação de
formato — nenhum deles pede rede nova nem nome de tipo de documento.

O caso que mais me interessou foi o **quinto**: um arquivo cujo comentário cita
`fetch(` e `RG`, que **passa**. Se ele não passasse, o hook estaria ensinando a
apagar explicação — e o teste de arquitetura já tinha aprendido essa lição do
jeito difícil (V-004). Um hook que repete um erro que o repositório já corrigiu
uma vez é pior que hook nenhum.

### Onde o agente errou desta vez — quatro vezes, e nenhuma foi pega por teste

**1. O aviso do segundo portão mentia.** O agente escreveu o texto *"O modelo
confia (X%), o formato não fecha"* para todo campo reprovado no formato. Abri a
tela: o CPF do primeiro documento tinha confiança **60%**, e a interface exibia
**"O modelo confia (60%)"** — a própria contradição. O motivo de formato tem
precedência sobre o de confiança, e o texto assumia que só o primeiro estava
ativo. Nenhum teste pegava, porque todos os testes usavam confiança alta.
Corrigido, com teste de regressão para o caso dos **dois** portões acusando.

**2. Duas coisas ficaram indemonstráveis.** A fila semeada esperava 55 minutos
contra um limite de 60, e as confianças semeadas eram todas baixas. Resultado: o
destaque de fila tensa e o caso principal da ADR-015 existiam no código e
**nunca apareciam na tela**. Não é defeito de lógica — é pior, é recurso que
ninguém vê. Ajustei a semeadura, com o porquê escrito dentro do próprio mock,
pelo mesmo argumento da D-03.

**3. O agente afirmou ter encontrado um defeito que não existia.** Ao escrever o
`.gitattributes`, ele justificou o arquivo dizendo que a CI falharia sempre no
Linux por causa de CRLF no blob commitado. A medição que sustentava a afirmação
era `od -c | grep -c '\\r'` — que, depois de passar pelo shell, virou uma busca
pela **letra "r"**, e contava linhas quaisquer. O arquivo sempre esteve em LF.

Este é o erro mais instrutivo dos três, porque é o **oposto** dos anteriores:
não foi omissão, foi um achado inventado com aparência de evidência. Mantive o
`.gitattributes` — ele é defensável por outro motivo, e está escrito nele qual —
mas reescrevi a justificativa e registro aqui, porque *"encontrei um problema"*
sem lastro é a mesma falha das D-06 e D-09, apenas com o sinal trocado.

**4. O foco pulava para outro campo enquanto a pessoa digitava.** Encontrado
relendo o `Dialogo.tsx` enquanto o auditor rodava, e é o mais sutil dos quatro. O
efeito que instala a contenção de foco dependia de `aoFechar` — e quem monta o
diálogo passa `onCancelar={() => setRejeitando(false)}`, uma closure **nova a
cada render do pai**. O pai re-renderiza sozinho: `useClaim` renova a reserva por
`setInterval` enquanto a tela está aberta. A cada renovação o efeito era
desmontado e remontado, e o foco saltava do campo de observação de volta para o
seletor de motivo. Quem estivesse escrevendo a justificativa de uma rejeição
perderia o cursor de tempos em tempos, sem entender por quê.

Corrigido com `aoFechar` numa ref e o efeito rodando uma vez. **E o teste de
regressão errou antes de acertar:** a primeira versão dele passava com e sem o
defeito, porque no harness que escrevi o campo digitado já era o primeiro
focável — não havia para onde o foco saltar. Só ficou claro depois de eu forçar
a falha removendo a correção. Um teste que passa dos dois lados é pior que teste
nenhum: compra tranquilidade sem entregar nada.

### A lição que muda o método, de novo

As três rodadas anteriores ensinaram **procurar pelo número, não pelo assunto**.
Esta acrescenta duas coisas.

**Abrir a tela.** Os quatro erros acima passaram por `typecheck`, por `lint`, por
96 testes e pela minha leitura. Dois deles morreram em menos de um minuto de
navegador aberto — e nenhum teste os pegaria, porque teste verifica o que alguém
pensou em verificar.

**Forçar o teste a falhar antes de confiar nele.** Fiz isso três vezes nesta
rodada, e nas três valeu: no linter (violação deliberada → saída 1), no teste que
compara a lista do hook com a do teste de arquitetura (cópia deliberada →
falhou), e no teste de foco — que **passava com e sem o defeito** até eu tentar.
Sem essa tentativa, eu teria entregado um teste decorativo dentro da mesma
rodada em que fechei a D-08 justamente por causa de listas de verificação
decorativas.

**Ressalva sobre este arquivo, de novo:** esta entrada também foi escrita ao
final da rodada, e não no momento de cada fato. A diferença para a anterior é
que agora existe registro intermediário — os commits `c37136c`, `4f88de3` e
`78058bf` carimbam cada bloco, e as saídas coladas acima são as reais.
