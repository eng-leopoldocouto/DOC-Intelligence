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
que mais vale?" — ele pergunta "como faço isto bem?". As três correções de rumo
desta entrega foram todas minhas, e nenhuma delas era técnica.
