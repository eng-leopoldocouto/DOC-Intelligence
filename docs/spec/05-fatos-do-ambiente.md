# 05 — Os fatos do ambiente e o que fizemos com cada um

> O enunciado avisa: *"NENHUM DESSES FATOS PEDE UMA FUNCIONALIDADE — E É POR ISSO
> QUE ESTÃO AQUI. […] TRATAR UM FATO PODE SER RESOLVÊ-LO OU APENAS REGISTRÁ-LO
> COMO RISCO CONHECIDO, EXPLICANDO POR QUE FICOU PARA DEPOIS: AS DUAS COISAS
> CONTAM."*

Este documento é a resposta a esse convite. Sete fatos, cada um com: a
consequência que enxergamos, a decisão tomada, onde ela vive no código, e o
**risco residual** — porque nenhuma decisão fecha o assunto por completo.

---

## (a) O modelo leva 5–40 s, é cobrado por documento e às vezes falha

### Consequência

Três, e as três atacam a interface:

1. **5 a 40 segundos é um intervalo de oito vezes.** Não existe *spinner* honesto
   para isso. Qualquer UI que bloqueie esperando resposta está quebrada por
   projeto, não por implementação.
2. **Cobrado por documento** significa que retry automático é uma torneira de
   dinheiro aberta. O padrão reflexo do front-end — "falhou? tenta de novo" —
   aqui é um defeito.
3. **"De vez em quando devolve erro ou simplesmente não responde"** são dois
   modos de falha distintos. Erro tem resposta; não-responder tem silêncio. A UI
   precisa distinguir, porque a ação humana é diferente: erro do modelo pode ser
   reprocessado, silêncio pode significar que o processamento ainda está vivo.

### Decisão

- **Nenhuma chamada síncrona.** `POST /documentos` devolve **202 Accepted** e o
  documento nasce em `RECEBIDO`. O envio termina quando o servidor aceita o
  arquivo, não quando o modelo responde.
- **Estados de falha são de primeira classe**, não caso de erro genérico:
  `FALHOU` (o modelo respondeu erro) e `EXPIRADO` (estourou o prazo sem
  resposta). A UI mostra o motivo e a ação cabível para cada um.
- **Zero retry automático de processamento.** `POST /{id}/reprocessar` é ação
  explícita, com confirmação que informa o custo. O `HttpClient` faz retry
  apenas em `GET` idempotente e apenas em falha de rede — nunca em operação que
  dispara o modelo.
- A tela de acompanhamento mostra **tempo decorrido**, não barra de progresso
  falsa. Não sabemos a porcentagem; fingir que sabemos é mentir para o operador.

### Acrescentado em 01/09 — um segundo sinal, que não é do fornecedor

O portão de confiança tinha uma perna só, e ela era **autodeclarada**: a
pontuação que o próprio produtor do resultado atribui ao próprio resultado.
Consequência concreta: um **CPF inválido pelo dígito verificador, com confiança
0,97, entrava como `PRONTO`** e o erro só aparecia semanas depois, num sistema
que rejeitasse o número.

`entities/documento/validacao-de-campo.ts` acrescenta uma verificação que **não
depende do fornecedor** — CPF e CNPJ por dígito verificador, DATA por
plausibilidade — dirigida por `tipoDeDado`, nunca por tipo de documento
([ADR-015](../adr/015-segundo-sinal-de-confianca.md)). Um campo que reprova vai
para conferência mesmo com confiança alta, e o painel diz por quê.

Isto também é tratamento do fato (f): quando o fornecedor for trocado, a escala
da confiança muda; o dígito verificador continua valendo.

### Onde vive

`shared/api/http.ts` (política de retry) · `features/processing/` ·
`entities/documento/estado.ts` · `entities/documento/validacao-de-campo.ts`

### Risco residual

Se a taxa de falha do fornecedor subir muito, a fila de `FALHOU` cresce sem que
ninguém seja avisado. **Não implementamos alerta de taxa de falha** — só o
estado individual. Gatilho para tratar: primeira semana com mais de 5% de
`FALHOU`.

**Risco residual do segundo portão:** ele **marca o campo, e não muda o estado
do documento**. Um documento já `PRONTO` com CPF inválido continua `PRONTO` —
mover estado é do servidor, e inventar essa transição no cliente criaria duas
máquinas de estado divergentes. Só três dos seis tipos de dado têm regra.
**Registrado, não resolvido.**

---

## (b) Foto de celular, nome de arquivo arbitrário, zero validação no remetente

### Consequência

O front-end é a **primeira e única barreira de validação** antes de gastar uma
chamada paga. Isso inverte o papel usual da validação no cliente: normalmente ela
é conveniência (o servidor revalida); aqui ela é **controle de custo**.

Além disso: foto de celular moderna tem 4–12 MB e vem com orientação em metadado
EXIF. Um navegador que ignora EXIF exibe o documento deitado — e o conferente
recusa um documento perfeitamente legível porque não consegue lê-lo.

### Decisão

- **Whitelist de tipo** (`image/jpeg`, `image/png`, `image/webp`,
  `application/pdf`) e teto de tamanho, verificados antes de qualquer upload.
- **Redução no cliente** antes do envio: reamostragem para o lado maior de
  2000 px, preservando legibilidade de texto impresso. Um documento de 8 MB vira
  cerca de 600 KB. Em dia de pico, isso é a diferença entre a rede do escritório
  aguentar e não aguentar.
- **Correção de orientação EXIF** na normalização e no visualizador.
- **O nome do arquivo nunca identifica nada.** Ele é exibido como metadado de
  origem ("como chegou"), lado a lado com o nome padronizado proposto. A
  identidade do documento é o hash do conteúdo.

### Decisão sobre a INTERFACE — acrescentada em 01/09

Até 01/09 o tratamento deste fato cobria **o arquivo** e não cobria **a pessoa**.
Havia uma única *media query* em toda a folha de estilos, e as telas de envio e
acompanhamento estouravam num aparelho de 360 px: barra transbordando, botões
saindo pela direita, alvos de toque de 35 px de altura. O fato (b) fala de um
celular, e nós tínhamos lido só o JPEG que sai dele.

- **Enviar e acompanhar funcionam a 360 px**: alvos de 44 px, sem rolagem
  horizontal, linha de item que quebra em duas em vez de estourar.
- **A conferência permanece uma tela de computador, por decisão declarada**
  ([ADR-014](../adr/014-enviar-e-movel-conferir-e-desktop.md)) — o documento ao
  lado dos campos é a razão de ser dela, e empilhado ela deixa de cumprir a
  função. Abaixo de 760 px a própria tela diz isso, em vez de degradar calada.

### Onde vive

`shared/lib/imagem.ts` · `features/upload/validacao.ts` ·
`shared/ui/estilos.css` (faixa de 760 px)

### Risco residual — **assumido conscientemente**

**HEIC/HEIF do iPhone não é decodificado por todos os navegadores.** É o formato
padrão de câmera do iOS, e "quase sempre com a foto original da câmera" torna
isso provável, não hipotético. Não tratamos: a conversão exigiria um
decodificador WebAssembly de cerca de 1,5 MB, ou conversão no servidor.

**Decisão explícita:** rejeitamos HEIC no envio com mensagem que instrui o
atendimento a ajustar a câmera para "Mais compatível" nos ajustes do iPhone.
É uma solução organizacional para um problema técnico — funciona, mas depende
de treinamento, e treinamento se perde na rotatividade. **Primeiro candidato a
tratar depois da entrega.**

**Segundo risco residual, novo: a responsividade foi verificada no navegador, e
não em aparelho.** Redimensionei para 360 × 800 e conferi por medição — sem
rolagem horizontal, nenhum elemento ultrapassando a largura, nenhum alvo de
toque abaixo de 44 px. Três coisas só aparecem no aparelho de verdade e **não
foram verificadas**: o teclado virtual cobrindo o campo em foco, o gesto de
toque em alvos próximos, e o **zoom automático do iOS ao focar um campo com
fonte menor que 16 px** — este último é um defeito conhecido do nosso CSS, que
usa 14 px nos campos. Registrado, não resolvido.

---

## (c) O mesmo documento chega mais de uma vez

### Consequência

Duplicata não é só sujeira de dados — combinada com o fato (a), **cada duplicata
é uma chamada paga desperdiçada e um item a mais na fila de conferência**, que já
é o gargalo humano. Deduplicar no front resolve dois fatos ao mesmo tempo.

### Decisão

- **SHA-256 do conteúdo, calculado no cliente** (`crypto.subtle.digest`, nativo,
  sem dependência), enviado como `content_hash` no envio.
- **Deduplicação em duas camadas:**
  1. *Dentro do lote selecionado* — a pessoa arrastou o mesmo arquivo duas vezes.
     Resolvido antes de qualquer requisição.
  2. *Contra o histórico* — a API responde `200 OK` com `duplicado: true` e o
     documento existente, em vez de `201 Created`. **Nenhuma chamada ao modelo é
     disparada.**
- A UI mostra "já enviado em 11/08 às 09:12 · ver documento" em vez de erro.
  Reenviar por precaução é comportamento razoável do atendimento; punir com
  mensagem de erro treina a pessoa a ignorar mensagens.

### Onde vive

`shared/lib/hash.ts` · `features/upload/deduplicacao.ts` · `mocks/handlers.ts`

### Risco residual

Hash de conteúdo pega **byte a byte**. Duas fotos do *mesmo papel* tiradas com
meio segundo de diferença são bytes diferentes e passam como documentos
distintos — e esse é justamente o caso "o cliente reenviou por insegurança".
Deduplicação perceptual (pHash) ou por campos extraídos resolveria, mas é decisão
de back-end, depois da extração. **Registrado, não resolvido.** O que capturamos
é o reenvio do *mesmo arquivo*, que é o caso mais frequente.

---

## (d) O conteúdo é dado pessoal, e parte dele é sensível

### Consequência

Laudos médicos e filiação são dado sensível na LGPD (art. 5º, II). O front-end é
onde esse dado fica mais exposto: renderizado na tela, no cache do navegador, na
URL, no relatório de erro, no *screenshot* que alguém tira para pedir ajuda.

A pergunta certa aqui não é "o que vamos proteger", é **"o que decidimos não
guardar"**.

### Decisão — a lista do que NÃO fazemos

| Não fazemos | Por quê |
|---|---|
| Cache de imagem em `localStorage`, IndexedDB ou service worker | Sobrevive ao logout e ao fechamento do navegador |
| PII em query string | Vaza para histórico, log de proxy e `Referer`. Só ID opaco em rota |
| URL de arquivo permanente | Imagem servida por URL **assinada e curta**; expirada, não abre |
| Telemetria com valor de campo | Um relatório de erro com o CPF dentro é vazamento |
| Persistência de rascunho de correção | O que não foi salvo morre com a aba |
| CPF/RG visíveis na listagem | Mascarados por padrão, revelação sob demanda e pontual |

Some-se: bloqueio de sessão por inatividade na tela de conferência, que é onde o
documento fica aberto na tela enquanto a pessoa atende o balcão.

### Onde vive

`shared/lib/mascara.ts` · `shared/api/http.ts` (sanitização de erro) ·
ausência deliberada de camada de persistência local

### Risco residual

Não temos **trilha de auditoria de leitura** — quem abriu qual documento, quando.
Para dado sensível isso costuma ser exigência, não luxo. É responsabilidade
natural do back-end (Trilha A), mas o front precisa enviar o contexto para que
ela exista. **Não feito, registrado.**

---

## (e) 150 documentos/dia, mais de 800 no pico entre 9h e 11h

### Consequência

800 documentos em 2 horas é cerca de 6,7 por minuto de chegada — trivial para a
rede, **brutal para a interface**, em três pontos:

1. Se cada documento em acompanhamento fizer seu próprio *polling*, 800
   documentos a cada 3 s são 267 requisições por segundo vindas de **um
   navegador**. O gargalo somos nós.
2. Uma lista de conferência com 800 linhas em DOM trava a rolagem.
3. Enviar 40 arquivos de uma vez, em paralelo, satura o *uplink* do escritório e
   faz todos falharem juntos.

### Decisão

- **Polling em lote**: um único `GET /documentos/status?ids=…` para todos os
  documentos em acompanhamento. 800 documentos = 1 requisição, não 800.
- **Backoff progressivo**: 2 s nos primeiros 30 s, 5 s até 2 min, 15 s depois.
  Casa com a distribuição real de 5–40 s do fato (a) sem desperdiçar requisição
  em documento que já está demorando.
- **Polling pausa com a aba oculta** (`visibilitychange`). O atendimento deixa a
  aba aberta o dia todo.
- **Concorrência de upload limitada a 3**, com fila local. O restante espera.
- ~~**Lista virtualizada**~~ e paginação por cursor. **A virtualização NÃO foi
  implementada** — a paginação, sim. A frase riscada ficou aqui, e não apagada,
  porque a spec é entregue como estava; o que ela deixou de ser verdade está em
  [D-06](08-divergencias.md). O DOM cresce se alguém pedir "carregar mais"
  muitas vezes seguidas.

### Onde vive

`features/processing/usePollingLote.ts` · `features/upload/filaDeEnvio.ts` ·
~~`features/review/ListaVirtualizada.tsx`~~ (**este arquivo não existe** — D-06)
· `features/review/useFilaDeConferencia.ts` (a paginação, que existe)

### Acrescentado em 01/09 — a fila diz o próprio tamanho

O cabeçalho da fila de conferência mostra **quantos aguardam** e **há quanto
tempo espera o mais antigo**, com destaque visual acima de um limite. Os dois
limites saem dos números do próprio enunciado: quatro minutos por documento e
duas pessoas conferindo dão cerca de **30 documentos por hora** de vazão — daí
`LIMITE_DE_ITENS = 30` e `LIMITE_DE_ESPERA_MIN = 60` em
`entities/documento/fila.ts`, que traz a derivação por escrito.

A contagem é honesta sobre o que sabe: com paginação por cursor, a interface
conhece o que foi carregado, e por isso escreve **"50+"** e não "50". Já a
espera do mais antigo é exata, porque a fila chega ordenada por chegada.

### Risco residual

**Continua não havendo priorização, e a interface continua não sabendo drenar
fila.** O que ela faz agora é parar de esconder o problema — que é diferente de
resolvê-lo, e é o máximo que um front-end pode fazer aqui: a fila drena
contratando gente ou baixando o volume que entra, e as duas são decisões de
gestão. Contrapressão e priorização (por tipo, por urgência, por cliente)
exigiriam saber se há SLA de mesmo dia, que é a **dúvida P2 não respondida**.
Assumimos que não há. **Se houver, esta é a primeira coisa a construir.**

**Risco residual do próprio aviso:** os dois limites estão no código do
front-end, e deveriam vir do servidor ao lado de `limiarConfiancaPadrao`, pelo
mesmo motivo do fato (f) — o escritório vai contratar mais gente, ou menos, e
recalibrar isso não pode custar um deploy. Não os movi para o contrato nesta
rodada. **Registrado, não resolvido.**

---

## (f) O modelo será trocado e os prompts vão mudar mais de uma vez no primeiro ano

### Consequência

**Este é o fato mais estruturante dos sete**, e o único que fala diretamente com
o critério de 30% ("o que acontece quando uma peça precisa ser trocada").

Se o front-end souber que existe um tipo chamado `RG` com os campos `nome`,
`filiação`, `nascimento`, `número` e `órgão emissor`, então **toda mudança de
prompt vira uma alteração no front-end, um code review, um build e um deploy** —
para um sistema cuja premissa declarada é mudar de prompt várias vezes por ano.

O erro aqui não custa um bug. Custa a viabilidade do produto.

### Decisão

**O front-end não conhece nenhum tipo de documento.** Nenhum. Nem em constante,
nem em `enum`, nem em `switch`, nem em arquivo de tradução.

- `GET /tipos-documento` devolve o **schema de campos** de cada tipo: chave,
  rótulo, tipo de dado, máscara, obrigatoriedade e ordem de exibição.
- A tela de conferência renderiza por **registry** `tipo de dado → componente`.
  Existem cerca de 6 tipos de dado (texto, data, CPF, CNPJ, número, seleção)
  contra N tipos de documento, e os tipos de *dado* mudam devagar.
- Cada documento carrega `modelo` e `versao_prompt`. Quando a extração piorar
  depois de uma troca, dá para saber **qual versão produziu qual resultado** —
  sem isso, a investigação é impossível.

**Consequência prática: adicionar "Certidão de Nascimento" ao produto é mudança
de zero linhas no front-end.**

### Onde vive

`features/review/fields/registry.ts` · `entities/tipo-documento/` ·
regra 2 do `CLAUDE.md`

### Risco residual

Um tipo de dado genuinamente novo (assinatura em imagem, tabela de verbas de um
contracheque) **exige** um componente novo. Não é falha do desenho — é a
fronteira dele. O custo cai de "mudar N formulários" para "registrar 1
componente".

---

## (g) Duas pessoas do atendimento podem abrir a fila ao mesmo tempo

### Consequência

Sem tratamento, o cenário concreto é: Ana e Bruno abrem o mesmo documento às
9h03. Ana corrige a filiação, Bruno corrige o número do RG. Bruno salva por
último. **A correção da Ana desaparece sem aviso** — e ninguém percebe, porque o
documento fica com aparência de conferido e entra na planilha como pronto.

O fato (d) piora isso: é dado pessoal indo errado para um processo.

Note que há dois problemas distintos, e um só mecanismo não resolve os dois:
**desperdício** (os dois conferem o mesmo documento) e **perda** (a gravação de
um apaga a do outro).

### Decisão — dois mecanismos, um para cada problema

**1. Claim com lease — contra o desperdício.**
`POST /{id}/conferencia/claim` reserva o documento por TTL de 5 minutos,
renovado enquanto a tela estiver ativa. A fila mostra "em conferência por Ana
Souza" e o item não é oferecido a Bruno. Liberação no `beforeunload` e por
expiração do TTL — porque a aba que fecha sem avisar é o caso normal, não a
exceção.

*O TTL é o que evita o pior modo de falha do locking: a pessoa que abriu o
documento, foi almoçar, e travou o item para sempre.*

**2. Trava otimista — contra a perda.**
`PATCH /{id}/campos` exige `If-Match: <versao>`. Se a versão mudou, a API
responde **409** e a UI mostra explicitamente *"Bruno alterou este documento
enquanto você editava"*, com o que mudou, e deixa a pessoa decidir. **Nunca
sobrescrevemos em silêncio.**

O claim sozinho não bastaria: leases expiram, abas ficam abertas, e o TTL é uma
aposta. A trava otimista é a rede de segurança que não depende de aposta nenhuma.

### Onde vive

`features/review/useClaim.ts` · `shared/api/http.ts` (`If-Match` e 409) ·
`features/review/ConflitoDialog.tsx`

### Risco residual

O claim depende da identidade vinda do host (premissa P1). Se o host não enviar
identidade, o claim degrada para anônimo — a fila mostra "em conferência por
outra sessão", o que ainda evita o desperdício, mas perde a informação de *quem*
procurar. Comportamento de degradação documentado, não acidental.

---

## Resumo

| Fato | Resolvido | Registrado como risco |
|---|---|---|
| (a) modelo lento, caro, instável | Assíncrono, estados de falha, sem retry automático, **segundo portão independente do modelo** | Alerta de taxa de falha; só 3 tipos de dado validados |
| (b) foto de celular, nome lixo | Validação, redução, EXIF, hash como identidade, **envio e acompanhamento a 360 px** | **HEIC do iPhone**; zoom do iOS; não verificado em aparelho real |
| (c) duplicatas | Hash SHA-256 em duas camadas | Duplicata perceptual do mesmo papel |
| (d) dado sensível | Lista do que não guardamos, mascaramento | Trilha de auditoria de leitura |
| (e) pico de 800 | Polling em lote, backoff, concorrência, **pressão da fila visível no cabeçalho** | **Priorização e contrapressão**; limites no cliente, não no contrato |
| (f) troca de modelo/prompt | Schema vindo da API, registry de campos | Tipo de dado novo exige componente |
| (g) dois conferentes | Claim com TTL **e** trava otimista | Degradação sem identidade do host |
