# ADR-015 — Um segundo portão de confiança, independente do modelo

**Status:** aceita · **Data:** 01/09/2026 · **Trata os fatos (a) e (f)**

## Contexto

Até esta rodada, **o único portão desta interface era a confiança que o próprio
modelo declara sobre si mesmo.** `precisaConferencia(confianca, limiar)` compara
um número do fornecedor com um limiar do servidor, e é isso.

O buraco tem tamanho conhecido e é fácil de nomear: **um CPF inválido pelo
dígito verificador, com confiança 0,97, entra como `PRONTO`.** Vai para a
planilha, e o erro aparece semanas depois, quando alguém tenta usar o número num
sistema que o rejeita — longe do documento, longe de quem o digitou, e sem que
ninguém saiba de qual extração ele veio.

Duas coisas tornam isso mais grave do que parece:

1. **A confiança é autodeclarada.** É uma pontuação que o produtor do resultado
   atribui ao próprio resultado. Não há nada a verificar nela.
2. **O fato (f) diz que o fornecedor será trocado** e que os prompts vão mudar
   mais de uma vez no primeiro ano. A escala dessa pontuação vai mudar debaixo
   de nós, e sem aviso. Um portão só, calibrado nessa escala, é um portão
   apoiado em areia — o limiar vir do servidor ajuda a recalibrar, mas não
   resolve, porque alguém ainda precisa **perceber** que é hora de recalibrar.

O dígito verificador do CPF não tem nenhum desses problemas: é aritmética
fechada, definida em norma, e vale igual com qualquer fornecedor.

## Decisão

**Um segundo portão, em `entities/documento/validacao-de-campo.ts`, dirigido por
`tipoDeDado`** — o mesmo eixo do registry de componentes (ADR-008), e nunca por
tipo de documento:

| Tipo de dado | Verificação |
|---|---|
| `CPF`, `CNPJ` | dígito verificador; sequência de dígitos repetidos recusada |
| `DATA` | data de calendário real, entre 1900 e vinte anos à frente |
| qualquer outro | **passa** — o desconhecido nunca reprova |

**Um campo que falha na validação pede olho humano mesmo com confiança alta**, e
o painel diz por quê: *"O modelo confia (97%), o formato não fecha — confira
dígito por dígito"*. São dois avisos distintos porque a ação da pessoa é
distinta: no primeiro ela compara com a imagem; no segundo ela **já sabe** que
há um erro, ainda que a imagem pareça concordar.

*Detalhe que só apareceu rodando a tela:* os dois portões podem acusar ao mesmo
tempo, e a primeira versão do aviso escrevia **"O modelo confia (60%)"** — a
própria contradição, num campo que reprovava nos dois. Quando a confiança
também está abaixo do limiar, o texto passa a ser *"Confiança baixa (60%) e o
formato não fecha"*. A frase de efeito só é usada onde ela é verdadeira.

Três decisões menores que carregam peso:

- **Formato antes de confiança.** Quando os dois portões acusam, o motivo
  exibido é o formato: é o verificável, e é o que diz o que fazer.
- **Campo corrigido por pessoa sai da dúvida por confiança, e não da inválida.**
  A opinião do modelo perdeu a relevância quando alguém conferiu — mas quem
  digitou o CPF errado agora foi a pessoa, e nenhum outro mecanismo desta
  interface pega esse erro.
- **Vazio não é formato inválido.** Ausência é assunto de `obrigatorio`.
  Confundir os dois faria todo campo opcional em branco parecer erro, e alarme
  falso ensina a ignorar o alarme.

## O limite que esta decisão NÃO ultrapassa

**O cliente não muda o estado do documento.** Reprovar o formato **não** move um
documento de `PRONTO` para `AGUARDANDO_CONFERENCIA` — essa transição é do
servidor, e inventá-la aqui criaria duas máquinas de estado divergentes, que é
exatamente o que a ADR-005 e o `entities/documento/estado.ts` existem para
evitar.

O que o cliente faz é **marcar o campo e dizer por quê**, na conferência e na
fila. Um documento já `PRONTO`, com CPF inválido, continua `PRONTO`, e **esta
interface não o traz de volta**. Fechar isso é trabalho da Trilha A: rodar a
mesma validação no servidor, antes do portão de estado. Está declarado em
`07-nao-feito.md`.

## Alternativas descartadas

**Baixar o limiar de confiança.** Custo zero, e foi a primeira ideia. Descartada
porque troca um erro por outro: um limiar mais alto joga na fila humana
documentos corretos — e a fila humana é o gargalo do fato (e). Além disso não
resolve o caso, que é justamente **alta confiança com valor errado**; nenhum
limiar pega isso, por definição.

**Validar no `HttpClient`, ao receber a resposta.** Tentador porque centraliza.
Descartada por violar a fronteira: `shared/api/` traduz transporte, e regra de
domínio ali some do lugar onde alguém iria procurá-la. E a validação depende do
`tipoDeDado`, que vem do catálogo — o cliente HTTP passaria a precisar do
catálogo para traduzir uma resposta.

**Máscara de entrada que impede digitar um CPF inválido.** Descartada por uma
consequência ruim conhecida: o modelo extraiu `111.444.777-36` e o documento
**diz** `111.444.777-36`, porque está borrado. Impedir a digitação não faz o
número certo aparecer — faz a pessoa preencher outra coisa para desbloquear a
fila, que é exatamente o modo de falha que a ADR-012 descreve para a rejeição.

**Um validador por tipo de DOCUMENTO** (regras específicas de identidade, de
contracheque). Descartada por quebrar a regra 2 do `CLAUDE.md` e o fato (f):
seriam N validadores contra 6 tipos de dado, e cada troca de prompt viraria um
ciclo de desenvolvimento.

## Consequências

**Boas.** O portão passa a ter uma perna que não depende do fornecedor. Quando o
modelo for trocado, esta metade continua valendo sem recalibração. E a interface
passa a distinguir "não tenho certeza" de "está errado", que são coisas
diferentes e pedem ações diferentes — inclusive para leitor de tela, onde só o
segundo vira `aria-invalid`.

**Ruins, e assumidas.** Só três tipos de dado têm regra. Nome, endereço, órgão
emissor e valor líquido continuam com um portão só. E a validação de data é
grosseira de propósito: pega `1087` e o 31 de fevereiro, não pega uma data de
nascimento trocada por outra data plausível.

**Efeito colateral visível na demonstração:** os documentos semeados usam
`000.000.000-00`, inválido por construção — era propositalmente inválido desde o
começo, para não parecer dado real. Com esta ADR, todos passam a exibir o aviso
do segundo portão. Isso é o comportamento correto, e não um defeito da semeadura.

## Como saberemos que erramos

- O aviso de formato aparecer em campo cujo documento **realmente** traz aquele
  valor, com frequência — sinal de que a validação virou ruído.
- Alguém pedir para desligar o aviso, em vez de corrigir o campo.
- A taxa de `FORMATO_INVALIDO` não cair depois de uma troca de prompt que
  deveria ter melhorado a extração — sinal de que estamos medindo a coisa errada.
