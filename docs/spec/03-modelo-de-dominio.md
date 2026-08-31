# 03 — Modelo de domínio

Vocabulário e regras que valem independentemente de haver tela. Este modelo vive
em `src/entities/`: **sem React, sem `fetch`, sem `window`** — testável em
isolamento.

---

## Entidades

### Documento

A unidade de trabalho. Nasce de um arquivo enviado e morre pronto ou rejeitado.

| Campo | Tipo | Nota |
|---|---|---|
| `id` | `string` | Opaco. É o que aparece em rota — nunca um dado pessoal |
| `contentHash` | `string` | SHA-256 do conteúdo. **A identidade real** |
| `nomeOrigem` | `string` | Como chegou. Metadado, nunca identificador |
| `nomePadronizado` | `string \| null` | Proposto pela máquina, editável na conferência |
| `tipoDocumentoId` | `string \| null` | Chave para o schema; o front não interpreta o valor |
| `estado` | `EstadoDocumento` | Ver máquina de estados |
| `confianca` | `number \| null` | 0–1, do documento como um todo |
| `campos` | `CampoExtraido[]` | Vazio até a extração terminar |
| `versao` | `number` | Trava otimista. Vai no `If-Match` |
| `reserva` | `Reserva \| null` | Quem está conferindo agora |
| `procedencia` | `Procedencia` | Modelo e versão do prompt que produziram isto |
| `recebidoEm` | `string` | ISO 8601 com fuso |
| `motivoFalha` | `string \| null` | Preenchido em `FALHOU`, `EXPIRADO`, `REJEITADO` |

> `contentHash` e `nomeOrigem` são campos distintos de propósito. O primeiro
> identifica; o segundo apenas informa de onde veio. Confundi-los é o erro que o
> fato (b) pune.

### CampoExtraido

| Campo | Tipo | Nota |
|---|---|---|
| `chave` | `string` | Casa com o schema do tipo de documento |
| `valor` | `string \| null` | Sempre string; a formatação é do componente |
| `confianca` | `number` | 0–1, **por campo** |
| `origem` | `'MODELO' \| 'HUMANO'` | Muda para `HUMANO` quando corrigido |

> Confiança por campo, e não só por documento, é o que permite destacar
> exatamente o que precisa de olho humano. Um documento com 90% de confiança
> geral pode ter um campo a 30%.

### TipoDocumento — **o front-end não conhece nenhum**

Vem inteiro de `GET /tipos-documento`. Contém a lista ordenada de
`DescritorDeCampo`:

| Campo | Tipo | Nota |
|---|---|---|
| `chave` | `string` | Casa com `CampoExtraido.chave` |
| `rotulo` | `string` | Texto exibido. **Vem da API** — o front não traduz nada |
| `tipoDeDado` | `TipoDeDado` | Determina o componente pelo registry |
| `obrigatorio` | `boolean` | |
| `mascara` | `string \| null` | |
| `ordem` | `number` | Ordem de exibição |
| `sensivel` | `boolean` | Se `true`, mascarado na listagem (LGPD) |

`TipoDeDado` = `TEXTO | DATA | CPF | CNPJ | NUMERO | SELECAO`.

**Seis tipos de dado contra N tipos de documento.** É essa razão que torna o
fato (f) barato: os tipos de dado mudam devagar, os tipos de documento mudam
sempre.

### Reserva

`usuarioId`, `usuarioNome`, `expiraEm`. `usuarioNome` pode ser nulo quando o host
não envia identidade — a UI degrada para "outra sessão".

### Procedencia

`modelo` (ex.: `fornecedor-vision-2.1`), `versaoPrompt` (ex.: `rg-v4`),
`processadoEm`.

> Sem isto, "a extração piorou depois da atualização" é uma frase sem
> investigação possível. Com isto, é uma consulta. Custa dois campos.

---

## Máquina de estados

```
                    ┌──────────────┐
                    │  RECEBIDO    │  202 aceito, ainda não processado
                    └──────┬───────┘
                           │
                    ┌──────▼─────────────┐
                    │ EM_PROCESSAMENTO   │  5–40 s (fato a)
                    └──────┬─────────────┘
        ┌──────────────────┼──────────────────┬─────────────┐
        │                  │                  │             │
 confiança ≥ limiar  confiança < limiar   erro do modelo  sem resposta
        │                  │                  │             │
   ┌────▼────┐   ┌─────────▼─────────────┐ ┌──▼─────┐  ┌────▼─────┐
   │ PRONTO  │   │ AGUARDANDO_CONFERENCIA│ │ FALHOU │  │ EXPIRADO │
   └─────────┘   └─────────┬─────────────┘ └──┬─────┘  └────┬─────┘
                           │ claim            │             │
                  ┌────────▼────────┐         └──── reprocessar (explícito,
                  │ EM_CONFERENCIA  │                 confirmado, pago) ──┐
                  └────┬───────┬────┘                                     │
                 salva │       │ rejeita                                  │
                  ┌────▼───┐ ┌─▼──────────┐                               │
                  │ PRONTO │ │ REJEITADO  │                               │
                  └────────┘ └────────────┘                               │
                                                                          │
        EM_PROCESSAMENTO ◄────────────────────────────────────────────────┘

     DUPLICADO: não é estado — é resposta do envio. 200 + duplicado: true,
                apontando o documento que já existe. Nunca cria documento novo.
```

### Invariantes

1. **Nada chega a `PRONTO` sem passar pelo portão de confiança.** Ou a máquina
   teve confiança suficiente, ou uma pessoa conferiu. Não há terceiro caminho.
   *(comportamento 4 do produto)*
2. **`EM_CONFERENCIA` exige reserva válida.** Sem reserva ativa, o estado é
   inconsistente.
3. **`versao` incrementa a cada gravação.** É o que a trava otimista compara.
4. **Transição para `EM_PROCESSAMENTO` a partir de falha só por ação humana
   explícita.** Nunca automática — cada transição custa dinheiro. *(fato a)*
5. **`REJEITADO` é terminal.** Documento ilegível não volta sozinho; precisa de
   novo envio, que gera novo `contentHash`.

---

## O portão de confiança

O limiar **vem da API**, não do front-end. Duas razões, ambas do fato (f):

1. Ele será calibrado com dados de uso — e calibração não pode exigir deploy do
   front-end.
2. O limiar razoável difere por tipo de documento. Um RG bem fotografado extrai
   melhor que um contracheque amassado.

O front-end apenas **compara e destaca**. Ele nunca decide o valor do limiar.

---

## Vocabulário

Termos em português porque o domínio é jurídico brasileiro. "Conferência" não é
*review*: é o ato de uma pessoa checar o que a máquina produziu, com
responsabilidade profissional sobre o resultado. Traduzir perderia isso.
