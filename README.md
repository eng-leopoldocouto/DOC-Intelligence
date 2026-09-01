# DOC Intelligence — interface do atendimento

Serviço de inteligência documental do escritório LAMARCK. Documentos chegam por
WhatsApp, e-mail e balcão; um modelo multimodal classifica e extrai campos;
quando a máquina não tem confiança, uma pessoa confere.

**Trilha B — front-end.** Esta entrega é a interface do atendimento **e o
contrato da API**, que ainda não existe e é servido por mock.

> **Leia primeiro:** [o que NÃO foi feito](docs/spec/07-nao-feito.md).
> É a parte da entrega que mais diz sobre as decisões tomadas.

---

## Como subir

```bash
npm install
cp .env.example .env
npm run dev
```

Abre em <http://localhost:5173> com o mock ligado. O catálogo já vem semeado com
dez documentos, seis deles aguardando conferência — sem isso a tela principal
não teria o que mostrar.

### Outros comandos

| Comando | O que faz |
|---|---|
| `npm test` | 64 testes |
| `npm run typecheck` | TypeScript estrito |
| `npm run build` | Build de produção |
| `npm run mock` | Serve o contrato em `http://localhost:8787/api/v1` |
| `npm run gen:api` | Regenera os tipos a partir de `docs/spec/openapi.yaml` |
| `npm run fixtures` | Regera os documentos fictícios (requer Python e Pillow) |

O contrato pode ser exercitado por fora, sem a interface:

```bash
curl -s http://localhost:8787/api/v1/tipos-documento
```

---

## Roteiro de demonstração

Os documentos fictícios estão em `fixtures/documentos-ficticios/`. Nenhum dado
real de pessoa — todos gerados por script, com marca d'água.

1. **Envio.** Arraste os **seis** arquivos de uma vez. Cinco sobem; a
   `copia de WhatsApp Image...` é barrada como duplicata **antes de qualquer
   requisição** — o hash do conteúdo é calculado no cliente.
2. **Reenvie os mesmos arquivos.** Agora a resposta vem do servidor:
   *"já enviado em ..."*, sem disparar processamento novo. São as duas camadas
   de deduplicação.
3. **Acompanhamento.** A latência é sorteada entre 5 e 40 s e cerca de 8% falham.
   Um documento em `FALHOU` oferece **Reprocessar**, com confirmação que informa
   o custo.
4. **Conferência.** O primeiro da fila é uma foto **torta** — gire e amplie. Os
   campos vêm do schema da API, cada um com sua confiança.
5. **Conflito (o mais importante).** Abra o mesmo documento em duas abas, salve
   na primeira e depois tente salvar na segunda.

---

## Como está organizado

```
docs/spec/     a especificação, escrita ANTES do código      ← tag spec-v1
docs/adr/      13 decisões, com as alternativas descartadas
docs/plano/    o plano de implementação em 16 tarefas
docs/ia/       prompts íntegros, verificações e tempo real
fixtures/      documentos fictícios e como regerá-los
src/           a fatia vertical
```

```
src/
  app/        composição: router, providers
  pages/      telas de rota
  features/   upload · processing · review
  entities/   domínio puro — sem React, sem fetch, sem window
  shared/
    api/      ÚNICA costura de rede + tipos gerados do OpenAPI
    lib/      hash, imagem/EXIF, máscara, formatação
    ui/       estilos
  mocks/      handlers MSW — navegador, testes e HTTP
```

Regra de dependência `app → pages → features → entities → shared`, **verificada
por teste** em `tests/arquitetura/`.

---

## Por onde começar a ler

| Se você quer saber… | Leia |
|---|---|
| o que ficou de fora e por quê | [`07-nao-feito.md`](docs/spec/07-nao-feito.md) |
| como cada fato do ambiente foi tratado | [`05-fatos-do-ambiente.md`](docs/spec/05-fatos-do-ambiente.md) |
| o que acontece quando uma peça é trocada | [`04-arquitetura.md`](docs/spec/04-arquitetura.md) |
| por que cada decisão, e o que foi descartado | [`docs/adr/`](docs/adr/) |
| onde a implementação divergiu da spec | [`08-divergencias.md`](docs/spec/08-divergencias.md) |
| como a IA foi conduzida e onde errou | [`docs/ia/`](docs/ia/) |

---

## O que escolhi testar, e por quê

> *(rascunho a partir de [`06-plano-de-testes.md`](docs/spec/06-plano-de-testes.md) —
> a redigir na primeira pessoa do candidato antes do envio)*

São 64 testes, e o critério para escrevê-los não foi cobertura: foi **o que
quebraria em silêncio**. Um botão que some é descoberto em cinco minutos de uso;
uma correção de campo sobrescrita por outra pessoa não é descoberta nunca — vira
dado errado numa planilha e reaparece semanas depois dentro de um processo. Por
isso o teste mais importante da entrega verifica quatro coisas ao mesmo tempo no
conflito de gravação: que o sistema avisa, que **nomeia quem** alterou, que não
descarta a edição de quem chegou depois e que não sobrescreve a de quem chegou
antes. Pela mesma lógica testei o que **não deve acontecer** — duplicata não
vira segunda chamada paga, falha não reprocessa sozinha —, porque efeito
colateral ausente só se garante contando as chamadas que não foram feitas. Um
teste renderiza um tipo de documento que o front-end nunca viu, e é ele que
sustenta a promessa central da arquitetura: se falhar, a especificação inteira é
conversa fiada. E cinco testes de arquitetura verificam por máquina as regras
que, escritas apenas no `CLAUDE.md`, seriam sugestões. Deixei de fora
deliberadamente aparência, virtualização com 800 itens e decodificação de imagem
com EXIF: em jsdom eles passariam sem provar nada, e teste que passa sem provar
nada é pior que teste ausente, porque dá falsa segurança.

---

## Limitações conhecidas desta demonstração

- **O estado do mock vive em memória.** Recarregar a página zera o que você
  enviou e restaura os dez documentos semeados. Ele é um dublê, não um banco.
- **Sem autenticação.** A identidade vem do host interno por cabeçalho
  ([ADR-011](docs/adr/011-identidade-delegada-ao-host.md)); em desenvolvimento
  ela sai do `.env`. Apague `VITE_USUARIO_ID` para ver a degradação anônima.
- **Sem busca.** Projetada e servida pelo mock, sem tela — decisão registrada
  em [`07-nao-feito.md`](docs/spec/07-nao-feito.md).
- **HEIC do iPhone é recusado**, com instrução de como contornar. Risco
  conhecido e não resolvido.
