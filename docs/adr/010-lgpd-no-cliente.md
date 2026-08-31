# ADR-010 — LGPD no cliente: a lista do que decidimos não guardar

**Status:** aceita · **Data:** 31/08/2026

## Contexto

Fato (d): *"O conteúdo desses documentos é dado pessoal, e parte dele é dado
pessoal sensível."* Laudos médicos e filiação são sensíveis pela LGPD (art. 5º,
II).

O front-end é onde esse dado fica **mais exposto**: renderizado na tela, no cache
do navegador, na URL, no relatório de erro, no *screenshot* que alguém tira para
pedir ajuda no grupo do WhatsApp.

A pergunta produtiva não é "o que vamos proteger". É **"o que decidimos não
guardar"** — porque dado que não existe no cliente não vaza do cliente.

## Decisão

Uma lista explícita de **ausências deliberadas**:

| Não fazemos | Por quê |
|---|---|
| Cache de imagem em `localStorage`, IndexedDB ou service worker | Sobrevive ao logout e ao fechamento do navegador |
| PII em query string | Vaza para histórico, log de proxy e cabeçalho `Referer`. Só ID opaco em rota |
| URL de arquivo permanente | Imagem por URL **assinada e curta**; link vazado expira sozinho |
| Telemetria com valor de campo | Relatório de erro com CPF dentro é vazamento por outro nome |
| Persistência de rascunho de correção | O que não foi salvo morre com a aba |
| CPF e RG visíveis na listagem | Mascarados por padrão; revelação sob demanda e pontual |

Mais: bloqueio de sessão por inatividade na conferência — que é onde o documento
fica aberto na tela enquanto a pessoa atende alguém no balcão.

A sanitização de erro vive em `shared/api/http.ts`, o **último ponto por onde
todo erro passa**. Espalhada pelos componentes, seria esquecida no primeiro
`catch` novo.

## Alternativas descartadas

**Cachear a imagem para navegação mais rápida na fila.** Melhoraria bastante a
experiência de quem confere 50 documentos seguidos. Descartada: cache de imagem
de documento pessoal é cópia não controlada em máquina compartilhada de balcão,
que sobrevive ao logout. **Trocamos desempenho por não guardar.**

**Salvar rascunho de correção localmente.** Protegeria contra fechar a aba sem
querer. Descartada pelo mesmo motivo — e agrava, porque rascunho é dado
*editado*, potencialmente mais correto e mais sensível que o original.

**Mascarar tudo, sempre.** Descartada por inviabilizar o trabalho: a pessoa
precisa **ler** o CPF para conferi-lo contra a imagem. Mascaramento é na
listagem, onde o dado é contexto; na conferência, onde é o objeto do trabalho, o
dado aparece.

**Não tratar e registrar como risco.** Legítimo pelo enunciado, e foi o caminho
escolhido para outros itens. Descartado aqui porque **quase tudo nesta lista é
uma ausência, não uma construção** — custa decisão, não tempo. Não guardar é
mais barato que guardar.

## Consequências

**Boas:** superfície de vazamento pequena por projeto; a lista é auditável, e
cada item pode ser verificado por revisão; nenhuma decisão depende de o
desenvolvedor "lembrar".

**Ruins:** navegação na fila fica mais lenta sem cache de imagem; fechar a aba
por engano perde a correção não salva. **As duas são o preço, e foram pagas com
os olhos abertos.**

## Como saberemos que erramos

Se o atendimento reclamar de lentidão ao percorrer a fila, cabe reavaliar um
cache **em memória** — que morre com a aba —, nunca em disco.
