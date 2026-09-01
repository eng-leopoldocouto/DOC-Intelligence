# Carta de fechamento

**DOC Intelligence — Trilha B (front-end)**
Leopoldo Couto · 31 de agosto de 2026
Repositório: <https://github.com/eng-leopoldocouto/DOC-Intelligence>

---

## O que ficou de fora, e por quê

A busca do que já foi processado — o quinto comportamento do produto — está
projetada, servida pelo mock e **sem tela**. A fatia que o enunciado nomeia vai
"do envio até a correção de um campo"; busca é uma segunda fatia, não a
continuação desta, e construí-la pela metade produziria exatamente o que o
enunciado penaliza. Ficaram também de fora o upload retomável, a priorização da
fila, a deduplicação perceptual e a trilha de auditoria de leitura. Cada uma
está em `07-nao-feito.md` com custo estimado e o **gatilho** que a tornaria
necessária, porque "não fiz" sem estimativa é opinião.

Duas ausências me incomodam mais que as outras. O **HEIC do iPhone** é recusado
com uma mensagem que ensina a mudar o ajuste da câmera: é solução organizacional
para problema técnico, funciona, e depende de treinamento — que se perde na
rotatividade. E a **priorização da fila** ficou de fora porque depende de uma
pergunta que não tive tempo hábil de enviar ao senhor: existe SLA de mesmo dia?
Assumi que não, documentei a premissa, e ela é a primeira coisa a mudar se eu
estiver errado.

## O que quebra primeiro se o volume for multiplicado por dez

**Não é a interface — é a fila de conferência, e nenhuma decisão de front-end
resolve isso.**

A 1.500 documentos por dia e 8.000 no pico, os gargalos técnicos que tratei
seguem de pé: o polling continua sendo uma requisição para N documentos, a fila
continua paginada por cursor, o upload continua limitado a três simultâneos. O que
quebra é aritmética. Duas pessoas do atendimento, aos quatro minutos por
documento que o enunciado cita, conferem cerca de 240 por dia. Com 8.000
chegando entre 9h e 11h e uma fração relevante caindo na conferência por baixa
confiança, **a fila não drena — ela acumula indefinidamente**, e hoje nada na
minha interface avisa o gestor de que isso está acontecendo.

Esse é o achado que eu levaria para a primeira reunião depois de entregar: o
próximo investimento não é técnico, é elevar o limiar de confiança que dispensa
conferência, ou aceitar amostragem em vez de conferência integral. Ambas são
decisões do escritório, não do desenvolvedor — mas é o desenvolvedor que precisa
mostrar a conta.

## Qual das minhas decisões eu menos defenderia hoje

O `PATCH` que grava e **conclui** a conferência na mesma operação, sem permitir
salvar rascunho.

Meu argumento foi legítimo: rascunho num documento reservado por TTL cria um
estado que ninguém sabe interpretar quando a reserva expira, e preferi não ter a
funcionalidade a ter uma que confunde. Mas o custo real cai sobre quem usa. A
pessoa que está conferindo um contracheque com seis campos, é chamada no balcão
e volta dez minutos depois, **perde tudo**. Otimizei para a limpeza do meu
modelo de estados em vez de otimizar para o operador — e num sistema que existe
para poupar quatro minutos por documento, fazer alguém repetir dez é o tipo de
troca que eu não faria de novo.

A correção não é difícil: rascunho local que expira junto com a reserva, com
aviso explícito de que não está salvo no servidor. Não a fiz por prazo, e é a
primeira coisa que eu mudaria.

## Quanto tempo isso tudo levou

**3h08 de trabalho efetivo**, somando a coluna de duração de
`docs/ia/registro-de-tempo.md`. Começou às 19h17 de 31 de agosto de 2026 e
terminou na madrugada do dia seguinte, com uma interrupção de cerca de duas
horas por limite de uso da ferramenta, não contabilizada.

Devo uma ressalva sobre esse arquivo, e ela é a coisa mais útil que aprendi
nesta entrega. Três linhas dele traziam horários **estimados para a frente** — o
commit que as gravou é anterior ao horário que elas declaravam como início. O
agente auditor apontou, comparando a tabela com o `git log`. Corrigi. **E
reincidi na correção**: ao consertar duas linhas, escrevi na terceira um término
dezoito minutos à frente do commit que a gravava, dentro do parágrafo que
acabara de explicar por que isso é inaceitável. A segunda auditoria pegou.

O conserto definitivo não foi um número melhor: foi tirar do arquivo a
possibilidade de errar. A coluna "fim" da fase em andamento passou a dizer *"ver
último commit"* — não se data prospectivamente um campo que aponta para o
histórico. **Registrei as duas correções em vez de apagar os erros**, porque um
documento que se apresenta como relógio real não pode conter estimativa
disfarçada, e porque a segunda queda diz mais sobre como eu trabalho do que a
primeira.

A distribuição diz mais que o total: **por volta de 40% do tempo foi spec, ADRs
e registro de decisão, antes de existir uma linha de código.** A especificação
inteira e as treze ADRs saíram em vinte e dois minutos de escrita; o plano de
implementação, em vinte e um. Foi o melhor investimento da entrega — a fatia
vertical foi construída sem uma única decisão de arquitetura tomada no meio do
código, e as **nove** divergências que apareceram estão registradas contra uma
spec que ficou congelada numa tag desde antes do primeiro commit de
implementação. Quatro delas só existem porque um subagente auditor, rodando em
contexto frio, encontrou o que eu não tinha encontrado no meu próprio texto.

Trabalhei com o Claude Opus 5 em sessão interativa. O prazo foi comprimido de
três dias para menos de um por decisão minha, o que tornou o recorte mais
importante que a execução — e é por isso que a maior parte do que entrego é
texto, e não código.

Se houver uma única coisa a levar desta entrega sobre trabalhar com agentes, é
esta: **o autor não consegue auditar o próprio texto contra o próprio código**,
porque lê o texto e lembra da intenção em vez de ver o que ficou. O valor do
subagente auditor não foi capacidade técnica — foi não ter memória do que eu quis
dizer. Rodei-o duas vezes; na segunda ele encontrou erros que a primeira rodada
de correções tinha introduzido.
