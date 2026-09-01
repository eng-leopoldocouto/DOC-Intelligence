# Onde o agente errou, como percebi e o que fiz

> Item II.4 do enunciado. Escrito a partir de
> [`registro-de-verificacao.md`](registro-de-verificacao.md), que foi preenchido
> no momento em que cada coisa aconteceu — não reconstruído no fim.

O erro mais caro do agente não foi de código: foi de **prioridade**. O primeiro
plano que ele me apresentou tinha oito fases bem organizadas e comprimia o
registro do uso de IA e a carta de fechamento numa única fase de trinta minutos
no final — dois itens que, somados, valem boa parte da nota e que **não podem
ser reconstruídos de memória**, porque o enunciado pede os prompts "como foram
escritos, não reescritos depois para ficarem bonitos". Percebi relendo a seção
II contra o cronograma proposto. Interrompi antes da escrita da spec e exigi a
separação entre o que é competência minha e o que é produção dele; o plano foi
reaberto com uma trilha de autoria paralela e o registro passou a ser contínuo.
Os prompts 0001 a 0003 foram salvos ainda na mesma sessão — se a correção
tivesse vindo depois, teriam se perdido. **Na mesma conversa o agente admitiu
ter ignorado uma instrução explícita e repetida do enunciado**, a de que
perguntas contam a favor; ele só a encontrou depois de eu cobrar. Ficou claro
ali que o agente lê o enunciado procurando *tarefa*, não procurando *critério de
avaliação* — manter o critério à vista é trabalho meu.

Nos erros de código, o padrão mais revelador foi a **reincidência**: duas vezes
o agente escreveu um teste que assumia a existência de um campo chamado `nome`,
num sistema cuja decisão central de arquitetura é que o front-end **não pode
conhecer nenhum campo de antemão**. Os dois testes quebraram de forma
intermitente, porque o mock sorteia o tipo do documento e comprovante de
residência tem `titular`. Corrigi o teste, nunca o código: quem estava errado
era quem sabia demais. O agente aplica o princípio onde a regra está escrita no
`CLAUDE.md` e não a transporta sozinho para o código de teste. Houve ainda um
teste de arquitetura que acusou dois arquivos inocentes porque lia comentário
como se fosse código — um deles foi acusado de tocar em `window` por dizer, na
própria docstring, "sem React, sem fetch, sem window" —, e uma suíte que passava
isolada e falhava em conjunto por falta de `resetHandlers()`, com a mensagem de
erro aparecendo longe da causa. Desde então passei a exigir a suíte rodada
**três vezes seguidas** antes de aceitar qualquer resultado, e a pedir a saída
do comando colada em vez da afirmação de que passou.

O que aprendi conduzindo: o agente é excelente executando uma decisão e
péssimo percebendo que a decisão está mal enquadrada. Ele não pergunta "isto é o
que mais vale?" — ele pergunta "como faço isto bem?". As correções de rumo desta
entrega foram minhas, e nenhuma delas era técnica — com **uma exceção, que só
apareceu na última rodada** e está no fim deste documento: quem enxergou que eu
vinha tratando um padrão como descuido, e não como defeito de processo, foi o
agente auditor.

**A quarta correção não foi minha, e é a mais interessante.** Ao final, pus um
subagente auditor para conferir a entrega contra o enunciado, em contexto frio.
Ele encontrou três coisas que passaram por mim, sendo a pior um registro de tempo
com horários estimados para a frente num arquivo que se apresenta como relógio
real. Corrigi — e **reincidi no mesmo defeito dentro da própria correção**, o que
só apareceu porque rodei o auditor uma segunda vez. Ele também achou um prompt
faltando na sequência: o comando que o gravaria foi barrado por um hook e eu não
repeti a operação.

O padrão que fecha este parágrafo: eu instruí o auditor a *"não acreditar na
narrativa do repositório sobre si mesmo"* — e era eu quem estava acreditando na
minha. Um autor não consegue auditar o próprio texto contra o próprio código,
porque lê o texto e lembra da intenção em vez de ver o que ficou. **O valor do
subagente não foi capacidade técnica: foi não ter memória do que eu quis dizer.**

**A rodada seguinte trouxe o erro que eu não sabia procurar: o agente afirmou ter
encontrado um defeito que não existia.** Uma auditoria externa ao repositório
devolveu uma lista de correções e, ao trabalhá-la, o agente criou um
`.gitattributes` justificando-o com a descoberta de que a integração contínua
quebraria sempre no Linux por causa de quebras de linha gravadas em CRLF. A
justificativa vinha com medição — um comando contando ocorrências. O comando
estava errado: depois de passar pelo shell, procurava a **letra "r"** em vez do
caractere de retorno, e contava linhas quaisquer. O arquivo sempre esteve em LF,
e não havia defeito nenhum. Percebi refazendo a medição, e só a refiz porque ela
estava escrita. Um número num comentário é conferível; uma impressão não é.

Este é o oposto de tudo que está acima, e por isso o mais instrutivo. Os erros
anteriores eram omissões — o agente não via o que não tinha sido apontado. Este
foi um **achado fabricado com aparência de evidência**, na mesma rodada em que o
repositório inteiro estava sendo corrigido por afirmar coisas sem lastro. Um
agente que erra por omissão é caro; um que erra por excesso de confiança na
própria verificação é perigoso, porque produz justamente o formato de texto que
a gente aprende a confiar: o que traz o comando junto.

Os outros três da mesma rodada dizem menos, e ainda assim **nenhum foi pego por
teste**. O aviso do segundo portão de confiança exibia *"o modelo confia (60%)"*
num campo cuja confiança era baixa — contradição que só aparece com um documento
na tela. A semeadura do mock deixava dois recursos novos invisíveis: a fila só
destacava pressão acima de sessenta minutos, e o documento mais antigo esperava
cinquenta e cinco. E o foco saltava do campo que a pessoa estava digitando de
volta para o primeiro do formulário, a cada renovação da reserva, porque um
efeito dependia de uma função recriada a cada render. Os quatro passaram por tipo
estrito, por linter, por noventa e seis testes e pela minha leitura. Dois
morreram em menos de um minuto de navegador aberto; um, refazendo uma conta; o
último, relendo código.

E o teste de regressão que escrevi para o quarto **passava com e sem o defeito** —
no cenário que montei, o foco não tinha para onde saltar. Só descobri porque
removi a correção de propósito, para ver o teste falhar. Passei a fazer isso
sempre: nesta rodada forcei três verificações a falhar antes de confiar nelas, e
a terceira era essa. Um teste que passa dos dois lados é pior que teste nenhum,
porque compra tranquilidade sem entregar nada — e eu quase o entreguei dentro da
mesma rodada em que fechei a D-08 justamente por causa de listas de verificação
decorativas.

O que mudou no método é a única conclusão que eu levaria daqui: **parei de
responder a esse padrão com disciplina.** Quatro rodadas de auditoria encontraram
a mesma classe de defeito quatro vezes — um número escrito num documento e
desmentido pelo repositório —, e nas três primeiras a minha resposta foi uma
regra melhor para mim mesmo. Na quarta, o auditor deixou de listar ocorrências e
apontou a causa: *o número mora em dois lugares*. A resposta virou um comando na
integração contínua, que compara o que o README afirma com o que o repositório
tem — e que encontrou um erro meu no minuto em que passou a existir. Disciplina
funciona até a vez em que não funciona, e essa vez chegou quatro vezes seguidas.
