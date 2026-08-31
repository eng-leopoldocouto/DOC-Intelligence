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
