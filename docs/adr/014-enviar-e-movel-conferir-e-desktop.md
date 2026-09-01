# ADR-014 — Enviar é móvel; conferir é desktop

**Status:** aceita · **Data:** 01/09/2026 · **Trata o fato (b)**

## Contexto

O fato (b) diz: *"Quem envia é o atendimento, **do próprio celular**, quase
sempre com a foto original da câmera."*

Até esta rodada, o tratamento que demos ao fato (b) cobria **o arquivo** —
whitelist de tipo, redução no cliente, correção de EXIF, hash como identidade —
e **não cobria a pessoa**. A interface tinha uma única media query, para a
conferência, e as telas de envio e acompanhamento estouravam num aparelho de
360 px: barra de navegação transbordando, linha de item com botões saindo pela
direita, alvos de toque de 35 px de altura.

Havia aí uma incoerência que a auditoria externa nomeou bem: **o fato (b) fala
de um celular, e nós tínhamos lido só o JPEG que sai dele.**

Mas as três telas não têm a mesma relação com o aparelho:

| Tela | Quem usa | Onde |
|---|---|---|
| Enviar | atendimento | **celular**, no balcão ou no WhatsApp |
| Acompanhamento | atendimento | celular ou computador |
| Conferência | conferente | mesa, com tempo e com o documento na tela |

## Decisão

**Envio e acompanhamento funcionam a 360 px.** Alvos de toque de 44 px, sem
rolagem horizontal, linha de item que quebra em duas em vez de estourar, barra
de navegação que empilha.

**A conferência permanece uma tela de computador, por decisão declarada** — e a
declaração aparece na própria tela, num aviso que só existe abaixo de 760 px,
dizendo que ali se confere mais devagar e com mais erro.

## Alternativas descartadas

**Conferência responsiva completa — o documento acima, os campos abaixo.**
Descartada, e este é o ponto inteiro desta ADR: **o documento original AO LADO
dos campos extraídos é a razão de ser dessa tela.** É o que a Trilha B nomeia
literalmente no enunciado — *"trabalhar a fila de conferência com o documento
original ao lado dos campos extraídos"*.

Empilhado num aparelho de 360 px, o trabalho vira: ler o campo, rolar para cima,
achar a linha correspondente na foto, rolar para baixo, digitar, e repetir seis
vezes por documento — sem nunca ver os dois ao mesmo tempo. A tela continua
"funcionando" e **deixa de cumprir a função**. Uma interface que atrapalha em
silêncio é pior que uma que avisa: a segunda a pessoa pode contornar.

O motivo real, sem diplomacia: fazer a conferência responsiva daria uma tela que
passa em qualquer teste de largura e **produz conferência pior**. Não é economia
de tempo — é recusa.

**Aplicativo separado para o celular.** Custo desproporcional para uma fatia
vertical, e duplicaria a costura de rede e o registry de campos, que são
justamente as peças que a ADR-008 existe para manter únicas.

**Deixar tudo como estava e declarar em 07-nao-feito.md.** Seria defensável
como registro de risco — o enunciado aceita registrar. Descartada porque o custo
era baixo (CSS, sem lógica nova) e porque **o fato (b) é o único dos sete que
descreve onde a pessoa está com o corpo**. Ignorar isso e escrever "risco
conhecido" seria usar a permissão do enunciado como desculpa.

## Consequências

**Boas.** A tela que o atendimento usa no balcão passa a caber na mão. O custo
foi CSS e substituição de estilo inline por classe — nenhuma lógica nova, nenhum
componente novo, nenhum teste invalidado.

**Ruins, e assumidas.** A conferência num celular continua desconfortável, e o
aviso não a conserta — ele informa. Se o escritório passar a conferir do
aparelho por necessidade (uma pessoa a menos, um pico às onze da manhã), esta
decisão vira dívida imediata, e a saída não é "tornar responsiva": é reprojetar
a tela para uma interação de um campo por vez, com a região correspondente da
imagem recortada ao lado. Isso é trabalho de produto, não de CSS.

**Não verificado em aparelho real.** Verifiquei com o navegador emulando
360 x 812 px, e a saída está no registro de verificação. Toque, teclado virtual
cobrindo o campo e o zoom do iOS ao focar um campo com fonte menor que 16 px são
coisas que só aparecem no aparelho — e a terceira é um defeito conhecido que
**não** tratei.

## Como saberemos que erramos

- Alguém conferir do celular por hábito, e não por emergência.
- Aparecer no registro de rejeições um padrão de campo corrigido errado vindo de
  sessão de tela estreita.
- O atendimento pedir "a tela de conferência no celular" — o que significaria
  que a separação entre quem envia e quem confere não existe na prática, e a
  ADR estaria apoiada numa premissa organizacional falsa.
