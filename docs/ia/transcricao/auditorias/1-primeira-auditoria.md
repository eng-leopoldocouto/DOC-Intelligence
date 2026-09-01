# Primeira auditoria — APROVADO COM RESSALVAS, 84/100

> Encontrou três achados graves, entre eles um registro de tempo com horários estimados para a frente e uma lista virtualizada afirmada em três lugares e inexistente no código.

> Transcrição do subagente auditor, gerada por `scripts/exportar-auditorias.py`. **Não editada à mão.**

> O auditor roda em **contexto frio**, sem memória do que o autor quis dizer, com uma instrução no centro: *não acreditar na narrativa do repositório sobre si mesmo*. Os comandos abaixo aparecem **na íntegra**, porque são a evidência — é neles que se vê a verificação acontecendo.

---
**50 chamadas de ferramenta.**


## A instrução dada ao auditor

> Você é o auditor de entrega deste repositório. Diretório: C:\Users\LAMARCK\Documents\LDC\CLAUDE CODE\DOC-Intelligence
> 
> Leia PRIMEIRO `.claude/agents/auditor-de-entrega.md` — é a sua definição — e depois `docs/enunciado.md`, que é a ÚNICA fonte de verdade sobre o que foi pedido. Trilha escolhida pelo candidato: B (front-end).
> 
> REGRA CENTRAL: não acredite na narrativa do repositório sobre si mesmo. README, spec e ADRs são afirmações, não evidências. Quando texto e código divergirem, o código vence e a divergência é achado.
> 
> Trabalhe com ECONOMIA DE CHAMADAS — agrupe comandos numa só invocação de shell sempre que puder. Uma sessão anterior sua foi interrompida por limite de uso.
> 
> ## Verificações obrigatórias (agrupe-as em poucos comandos e cole a saída no relatório)
> 
> ```
> npm test 2>&1 | tail -5
> npx tsc --noEmit 2>&1 | head -5
> npx vite build 2>&1 | tail -3
> git log --oneline --graph | head -25
> git tag
> ```
> 
> E estas buscas, que testam afirmações centrais do repositório:
> - nome de tipo de documento (RG, contracheque, procuracao, comprovante) em `src/` FORA de `src/mocks/` — o `CLAUDE.md` regra 2 e a ADR-008 afirmam que não existe nenhum. ATENÇÃO: CPF e CNPJ são tipos de DADO, não de documento; não são violação.
> - `fetch(` em `src/` fora de `src/shared/api/` — o `CLAUDE.md` regra 3 afirma que não existe nenhum.
> - dado que pareça real de pessoa em `fixtures/` — o enunciado proíbe.
> 
> Confira ainda: a tag `spec-v1` é anterior aos commits de implementação? Os prompts em `docs/ia/prompts/` parecem íntegros (erros de digitação preservados) ou reescritos depois? A carta em `docs/carta-de-fechamento.pdf` tem no máximo 2 páginas e responde às quatro perguntas?
> 
> ## Produza
> 
> Relatório completo em `auditoria/relatorio-final.md`, no formato da sua definição: veredito no topo, resumo, conferência dos cinco entregáveis da seção II, nota por critério de pontuação (30/20/20/15/15) com evidência citada, tabela dos sete fatos (a)-(g) classificando cada um como resolvido / registrado como risco / ignorado, achados do mais grave ao mais leve, e o que corrigir antes de enviar.
> 
> Responda nesta conversa com: VEREDITO, os três achados mais graves e o que corrigiria antes de enviar. Seja duro — o custo de um elogio errado aqui é uma vaga perdida.

---

## O que ele fez

I'll start by reading my definition and the source of truth.

`Read` · `.claude\agents\auditor-de-entrega.md`

`Read` · `docs\enunciado.md`

**List repository file tree**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== TREE (no node_modules/.git) ===" && find . -type d \( -name node_modules -o -name .git -o -name dist -o -name coverage \) -prune -o -type f -print | head -200 && echo && echo "=== COUNTS ===" && find . -type d \( -name node_modules -o -name .git -o -name dist \) -prune -o -type f -print | wc -l
```

**Run tests, typecheck and build**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== NPM TEST =====" && npm test 2>&1 | tail -20 ; echo "===== TSC =====" && npx tsc --noEmit 2>&1 | head -10 ; echo "exit=$?" ; echo "===== VITE BUILD =====" && npx vite build 2>&1 | tail -6
```

**Inspect git history, tags, status**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== GIT LOG =====" && git log --oneline --graph | head -40 && echo && echo "===== GIT TAG =====" && git tag && echo && echo "===== TAG DETAIL =====" && git for-each-ref --format='%(refname:short) %(objectname:short) %(taggerdate:iso8601) %(creatordate:iso8601)' refs/tags && echo && echo "===== GIT STATUS =====" && git status --short && echo && echo "===== BRANCHES =====" && git branch -a && echo && echo "===== TRACKED SRC? =====" && git ls-files src | head -5 && echo "count tracked src: $(git ls-files src | wc -l)"
```

**Check tag ordering vs implementation**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== TAG POINTS TO =====" && git rev-list -n1 spec-v1 && git log -1 --format='%h %ad %s' --date=iso $(git rev-list -n1 spec-v1) && echo && echo "===== COMMITS COM DATA =====" && git log --format='%h %ad %ae %s' --date=iso | tail -30 && echo && echo "===== spec-v1 é ancestral de main? =====" && git merge-base --is-ancestor spec-v1 main && echo "SIM ancestral" || echo "NAO ancestral" && echo && echo "===== o que veio DEPOIS da tag =====" && git log --oneline spec-v1..main | wc -l && echo "===== src existia na tag? =====" && git ls-tree -r --name-only spec-v1 | grep -c "^src/" ; echo "arquivos na tag:" && git ls-tree -r --name-only spec-v1 | wc -l
```

**Grep hardcoded document types outside mocks**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== A) TIPOS DE DOCUMENTO EM src/ FORA DE src/mocks/ =====" && grep -rniE "rg|identidade|contracheque|procurac|comprovante|carteira|laudo|contrato|cnh" src --include=*.ts --include=*.tsx | grep -v "^src/mocks/" | head -40 ; echo "--- total ---" ; grep -rniE "\b(rg|identidade|contracheque|procuracao|procuração|comprovante_residencia|comprovante|carteira_trabalho|laudo|contrato)\b" src --include=*.ts --include=*.tsx | grep -v "^src/mocks/" | wc -l
```

**Read CLAUDE.md and ADR-008**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== CLAUDE.md =====" && cat CLAUDE.md && echo && echo "===== ADR-008 =====" && cat docs/adr/008-campos-dirigidos-por-schema.md
```

**Read architecture boundary test**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && cat tests/arquitetura/fronteiras.test.ts
```

**Check package scripts and network seams**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== package.json =====" && cat package.json && echo && echo "===== B) fetch fora de shared/api =====" && grep -rn "fetch\s*(" src --include=*.ts --include=*.tsx | grep -v "^src/shared/api/" ; echo "(fim)" && echo && echo "===== fetch em TODO src =====" && grep -rn "fetch\s*(" src --include=*.ts --include=*.tsx | wc -l && echo && echo "===== XHR / axios / WebSocket / EventSource =====" && grep -rniE "XMLHttpRequest|axios|new WebSocket|EventSource|navigator.sendBeacon" src tests | head
```

**Check lint/CI config, gitignore and env files**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== fetch em shared/api =====" && grep -rn "fetch" src/shared/api/ && echo && echo "===== existe lint config? =====" && ls -a | head -30 && find . -maxdepth 2 -name ".eslintrc*" -o -maxdepth 2 -name "eslint.config*" -o -maxdepth 2 -name ".github" | head && echo "(fim busca lint/CI)" && echo && echo "===== .gitignore =====" && cat .gitignore && echo && echo "===== .env tracked? =====" && git ls-files | grep -i env ; echo "---" && cat .env && echo "--- .env.example ---" && cat .env.example
```

**Inspect fixtures and generator**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== fixtures/README =====" && cat fixtures/README.md && echo && echo "===== fixtures listing =====" && ls -la fixtures/documentos-ficticios/ && echo && echo "===== gerador (head 80) =====" && sed -n '1,90p' scripts/gerar-documentos-ficticios.py
```

**Hash fixtures and read rest of generator**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== hashes fixtures =====" && sha256sum fixtures/documentos-ficticios/* && echo && echo "===== gerador restante =====" && sed -n '90,240p' scripts/gerar-documentos-ficticios.py
```

**Read network seam**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "########## http.ts ##########" && cat -n src/shared/api/http.ts && echo && echo "########## identidade.ts ##########" && cat -n src/shared/api/identidade.ts
```

**Check logging, storage, and API client**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== console.* em src =====" && grep -rn "console\." src | head -20 ; echo "(fim)" && echo && echo "===== localStorage/sessionStorage =====" && grep -rn "localStorage\|sessionStorage\|document.cookie" src tests | head ; echo "(fim)" && echo && echo "===== uso de .corpo =====" && grep -rn "\.corpo" src | head && echo && echo "########## client.ts ##########" && cat -n src/shared/api/client.ts
```

**Check generated vs handwritten types**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "########## entities/documento/tipos.ts ##########" && cat -n src/entities/documento/tipos.ts && echo && echo "########## entities/tipo-documento/tipos.ts ##########" && cat -n src/entities/tipo-documento/tipos.ts && echo && echo "===== MotivoRejeicao no openapi/types.gen =====" && grep -n "MotivoRejeicao\|ILEGIVEL\|TIPO_INCORRETO" docs/spec/openapi.yaml src/shared/api/types.gen.ts | head -20 && echo && echo "===== tamanho types.gen.ts =====" && wc -l src/shared/api/types.gen.ts docs/spec/openapi.yaml
```

**Verify generated types are in sync with OpenAPI**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== regenerar tipos e comparar =====" && cp src/shared/api/types.gen.ts /tmp/types.antes.ts 2>/dev/null || cp src/shared/api/types.gen.ts "$TEMP/types.antes.ts"; npx openapi-typescript docs/spec/openapi.yaml -o src/shared/api/types.gen.ts 2>&1 | tail -3 ; git diff --stat src/shared/api/types.gen.ts ; echo "DIFF (vazio = em sincronia):" ; git diff src/shared/api/types.gen.ts | head -30 ; git checkout -- src/shared/api/types.gen.ts ; echo "--- restaurado ---" && echo && echo "===== /tipos-documento no openapi =====" && grep -n "tipos-documento" -A 25 docs/spec/openapi.yaml | sed -n '1,40p'
```

**Regenerate types into scratchpad and diff (no repo files touched)**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && SP="C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad" && mkdir -p "$SP" && npx openapi-typescript docs/spec/openapi.yaml -o "$SP/types.regen.ts" 2>&1 | tail -2 ; echo "=== DIFF gerado x commitado (vazio = em sincronia) ===" ; diff "$SP/types.regen.ts" src/shared/api/types.gen.ts && echo "IDENTICOS" ; echo && echo "===== /tipos-documento no openapi =====" && grep -n "tipos-documento" -A 22 docs/spec/openapi.yaml | head -35
```

**Diff ignoring line endings**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && SP="C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad" && echo "=== diff ignorando CR (vazio = em sincronia) ===" && diff --strip-trailing-cr "$SP/types.regen.ts" src/shared/api/types.gen.ts && echo "IDENTICOS (contrato e tipos em sincronia)" ; echo "=== finais de linha ===" ; file "$SP/types.regen.ts" src/shared/api/types.gen.ts
```

**Read review feature core**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && for f in src/features/review/fields/registry.ts src/features/review/fields/tipos.ts src/features/review/useClaim.ts src/features/review/useGravarCampos.ts; do echo "########## $f ##########"; cat -n "$f"; echo; done
```

**Read review page**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && cat -n src/pages/PaginaConferencia.tsx
```

**Line counts per file**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "===== LOC por arquivo src =====" && find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -25 && echo && echo "===== LOC tests =====" && find tests -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn
```

**Read the review integration test**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && cat -n tests/features/conferencia.test.tsx
```

**Read README**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && cat -n README.md
```

**Start mock HTTP server and exercise the contract**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && (npx tsx src/mocks/servidor.ts > "$TEMP/mock.log" 2>&1 &) ; sleep 6 ; echo "=== /tipos-documento ===" ; curl -s --max-time 8 http://localhost:8787/api/v1/tipos-documento | head -c 900 ; echo ; echo "=== /documentos?estado=AGUARDANDO_CONFERENCIA ===" ; curl -s --max-time 8 "http://localhost:8787/api/v1/documentos?estado=AGUARDANDO_CONFERENCIA" | head -c 700 ; echo ; echo "=== log ===" ; cat "$TEMP/mock.log" 2>/dev/null | head -5
```

**Check mock seeding behavior**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== /documentos (sem filtro) ===" && curl -s --max-time 8 "http://localhost:8787/api/v1/documentos" | head -c 600 ; echo ; echo "=== contagem por estado ===" ; curl -s --max-time 8 "http://localhost:8787/api/v1/documentos?limite=50" | grep -o '"estado":"[A-Z_]*"' | sort | uniq -c ; echo ; echo "=== semear/seed em dados.ts ===" ; grep -n "semea\|seed\|SEMENTE\|configurarParaTeste\|export function" src/mocks/dados.ts | head -30 ; echo ; echo "=== servidor.ts ===" ; cat -n src/mocks/servidor.ts
```

**Trace mock seeding call sites**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== quem chama semear() ===" && grep -rn "semear" src tests && echo && echo "=== browser.ts ===" && cat -n src/mocks/browser.ts && echo && echo "=== node.ts ===" && cat -n src/mocks/node.ts && echo && echo "=== main.tsx ===" && cat -n src/main.tsx
```

**Check vite config and file-serving handler**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== vite.config.ts ===" && cat -n vite.config.ts && echo && echo "=== handler /arquivo ===" && grep -n "arquivo" -B3 -A 20 src/mocks/handlers.ts | head -60
```

**Read launch config and viewer**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && cat .claude/launch.json && echo "=== VisualizadorDocumento ===" && cat -n src/features/review/VisualizadorDocumento.tsx
```

`mcp__Claude_Browser__preview_start`

`mcp__Claude_Browser__browser_batch`

`mcp__Claude_Browser__browser_batch`

**Inspect closing letter PDF**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== PDF info ===" && ls -la docs/carta-de-fechamento.pdf && strings docs/carta-de-fechamento.pdf | grep -o "/Count [0-9]*" | head -3 ; strings docs/carta-de-fechamento.pdf | grep -c "/Type /Page[^s]" ; echo "--- fontes embutidas ---" ; strings docs/carta-de-fechamento.pdf | grep -oiE "Roboto[A-Za-z-]*" | sort -u | head
```

**Read closing letter**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && cat docs/carta-de-fechamento.md
```

**Check remote sync and read facts doc**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== remote ===" && git remote -v && git rev-parse HEAD origin/main && echo "ahead/behind:" && git rev-list --left-right --count origin/main...main && echo && echo "=== 05-fatos-do-ambiente.md ===" && cat docs/spec/05-fatos-do-ambiente.md
```

**Verify spec claims against code**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== ListaVirtualizada existe? ===" && ls src/features/review/ && echo && echo "=== virtualiz* em src ===" && grep -rni "virtualiz" src | head ; echo "(fim)" && echo && echo "=== inatividade / idle ===" && grep -rni "inatividade|idle|bloqueio de sessao" -E src | head ; grep -rniE "inatividade|idle" src | head ; echo "(fim)" && echo && echo "=== visibilitychange ===" && grep -rn "visibilitychange\|hidden" src | head && echo && echo "=== EXIF ===" && grep -rni "exif\|orienta" src/shared/lib/imagem.ts | head && echo && echo "=== concorrencia upload ===" && grep -rn "3\|CONCORR\|limite" src/features/upload/filaDeEnvio.ts | head -20
```

**Read divergences doc**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== 08-divergencias.md ===" && cat docs/spec/08-divergencias.md
```

**Read not-done doc**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== 07-nao-feito.md ===" && cat docs/spec/07-nao-feito.md
```

**Check queue list implementation**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && cat -n src/features/review/useFilaDeConferencia.ts && echo "=== PaginaFilaConferencia (trechos de lista) ===" && sed -n '1,60p' src/pages/PaginaFilaConferencia.tsx
```

**Read AI registry README and first prompt**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== docs/ia/README.md ===" && cat docs/ia/README.md && echo && echo "=== prompt 0001 ===" && cat docs/ia/prompts/0001-2026-08-31T19-17-abertura-e-diretrizes.md
```

**Read more prompts and agent-error paragraph**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== prompt 0003 ===" && cat docs/ia/prompts/0003-2026-08-31T19-35-cobranca-artefatos-do-candidato.md && echo && echo "=== prompt 0008 ===" && cat docs/ia/prompts/0008-2026-08-31T21-12-seguir-para-conferencia.md && echo && echo "=== onde-o-agente-errou.md ===" && cat docs/ia/onde-o-agente-errou.md
```

**Find phantom file references in docs**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== caminhos citados nos docs que NAO existem ===" && grep -rhoE "(src|tests|docs|fixtures|scripts)/[A-Za-z0-9_./-]+\.(ts|tsx|md|yaml|css|py)" docs README.md CLAUDE.md | sort -u | while read p; do [ -e "$p" ] || echo "AUSENTE: $p"; done && echo "(fim)" && echo && echo "=== caminhos sem prefixo (features/..., shared/..., entities/...) ===" && grep -rhoE "\b(features|shared|entities|pages|app|mocks)/[A-Za-z0-9_./-]+\.(ts|tsx)" docs README.md CLAUDE.md | sort -u | while read p; do [ -e "src/$p" ] || echo "AUSENTE: src/$p"; done && echo "(fim)"
```

**Locate phantom references**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && for p in "ListaVirtualizada" "ListaDeAcompanhamento" "envio.test" "fila.test" "gravacao.test" "rejeicao.test" "acompanhamento.test"; do echo "### $p"; grep -rn "$p" docs README.md CLAUDE.md | head -5; echo; done
```

**Read time and verification logs**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== registro-de-tempo.md ===" && cat docs/ia/registro-de-tempo.md && echo && echo "=== registro-de-verificacao (head 60) ===" && sed -n '1,55p' docs/ia/registro-de-verificacao.md
```

**Correlate artifacts with commit timestamps**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== quando cada artefato entrou no historico ===" && for f in docs/carta-de-fechamento.pdf docs/carta-de-fechamento.md README.md .claude/agents/auditor-de-entrega.md docs/ia/registro-de-tempo.md; do printf "%-45s " "$f"; git log --diff-filter=A --format='%h %ad' --date=iso -1 -- "$f"; done && echo && echo "=== ultimo commit que tocou registro-de-tempo ===" && git log --format='%h %ad %s' --date=iso -3 -- docs/ia/registro-de-tempo.md
```

**Check contract and logic tests**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && sed -n '1,80p' tests/mocks/contrato.test.ts && echo "..." && grep -n "it(\|describe(" tests/mocks/contrato.test.ts tests/features/envio-logica.test.ts tests/entities/estado.test.ts tests/shared/hash.test.ts
```

**Verify spec was frozen at the tag**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== docs/spec mudou depois da tag spec-v1? ===" && git diff --stat spec-v1 HEAD -- docs/spec/ ; echo "(vazio = congelada)" && echo && echo "=== docs/adr mudou depois da tag? ===" && git diff --stat spec-v1 HEAD -- docs/adr/ ; echo "(vazio = congelada)" && echo && echo "=== o que a tag ja continha ===" && git ls-tree -r --name-only spec-v1 | sed 's/^/  /'
```

**Read ADR index and architecture doc**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== adr/README ===" && cat docs/adr/README.md && echo && echo "=== 04-arquitetura: secao 'peca trocada' ===" && grep -n "trocad\|substitu\|Trocar" docs/spec/04-arquitetura.md | head -20
```

Now I have everything I need. Let me write the report.

`Write` · `auditoria\relatorio-final.md`

**Confirm repo untouched and report background server**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && curl -s --max-time 3 localhost:8787/api/v1/tipos-documento > /dev/null 2>&1 && echo "mock ainda no ar na 8787 (processo tsx em background desta auditoria)" || echo "8787 livre" ; echo "--- git status (nada tocado no repo) ---" ; git status --short ; echo "(vazio = repositório intacto; auditoria/ está no .gitignore)"
```

Relatório completo em `C:\Users\LAMARCK\Documents\LDC\CLAUDE CODE\DOC-Intelligence\auditoria\relatorio-final.md`. Repositório intacto (nada foi modificado). Ficou um `npm run mock` meu na porta 8787 — pode matar.

## VEREDITO: APROVADO COM RESSALVAS

Nota agregada ≈ **84/100** (arquitetura 26/30 · rastreabilidade 15/20 · uso de IA 18/20 · spec e método 13/15 · atenção aos fatos 12/15).

Tudo o que é obrigatório está lá e é real: 64/64 testes passam, `tsc --noEmit` limpo, `vite build` limpo, e a fatia roda de verdade — abri `localhost:5173/conferencia`, cliquei em Conferir e vi o documento torto com marca d'água à esquerda e os campos vindos do schema à direita, com procedência `fornecedor-vision-2.1 / rg-v4` no cabeçalho. As afirmações centrais resistiram à verificação: `git diff spec-v1 HEAD -- docs/spec/ docs/adr/` só mostra o `08-divergencias.md` crescendo (a spec é byte a byte a de antes do código, e a tag não contém um arquivo em `src/`); regenerei `types.gen.ts` do OpenAPI e é idêntico ao commitado; zero tipo de documento em código fora de `mocks/`; um único `fetch`, em `http.ts:106`; fixtures com marca d'água e a duplicata byte a byte confirmada por `sha256sum`; prompts com os erros de digitação preservados. A carta tem 2 páginas em Roboto e responde às quatro perguntas.

## Os três achados mais graves

**1. A lista virtualizada é afirmada três vezes e não existe.** `05-fatos-do-ambiente.md` a lista como decisão do fato (e) e aponta o caminho `features/review/ListaVirtualizada.tsx`; `07-nao-feito.md` diz "que já existe na fila, reaproveitável"; o `README:127` a trata como implementada-porém-não-testada. Busca por `virtualiz` em `src/`: **zero ocorrências**. O que existe é `useInfiniteQuery` com cursor e `itens.map(...)` — o DOM cresce. E não está em `08-divergencias.md`, que é o documento criado exatamente para isso. Atenuante: os dois docs da spec estão congelados na tag, então ali era plano; o agravante é o README, escrito depois do código.

**2. O registro de tempo tem três linhas datadas para o futuro.** No commit `eafc56b` (21:54:31) a tabela afirma "Fase 6 — README e auditor: 22:00→22:10" e "Fase 7 — carta: 22:10→22:25". Mas `git log --diff-filter=A` mostra README e auditor entrando às **21:47:52** e a carta às **21:54:31** — 12 e 16 minutos *antes* do início declarado, e o próprio arquivo que diz "22:10" foi escrito às 21:54. As dez primeiras linhas batem com o histórico; só as três últimas são estimativas prospectivas vendidas sob o selo "relógio real, carimbado no momento" — e a carta se apoia nesse arquivo. É a única afirmação da entrega que o `git log` desmente.

**3. O README entrega um marcador de rascunho dentro de um item obrigatório.** `README.md:111` — *"(rascunho… a redigir na primeira pessoa do candidato antes do envio)"* — encabeça justamente o parágrafo que o item II.3 exige. O texto abaixo é excelente; chega ao avaliador com um bilhete dizendo que não está pronto e que não foi o candidato que o escreveu. O próprio `CLAUDE.md` seção 7 listava esse parágrafo entre o que o agente não decide sozinho: a regra estava certa, o passo final não foi dado.

## O que eu corrigiria antes de enviar (< 40 min para os quatro primeiros)

1. Corrigir as três linhas da tabela de tempo para os horários reais dos commits, ou marcá-las como estimadas — 5 min.
2. Acrescentar `D-06` (virtualização) e `D-07` (bloqueio por inatividade, também afirmado em `05-fatos` e ausente) ao `08-divergencias.md` — 10 min. Isso transforma o pior achado numa demonstração da disciplina que a entrega prega.
3. Ajustar a frase do README que trata a virtualização como implementada — 2 min.
4. Apagar o marcador de rascunho e assumir o parágrafo em primeira pessoa — 10 min.
5. Chamar `semear()` em `src/mocks/servidor.ts`: hoje `npm run mock` sobe com a base vazia (`curl /api/v1/documentos` → `{"itens":[]}`), embora o README venda esse curl como a forma de exercitar o contrato.
6. Menores: `MotivoRejeicao` escrito à mão em `client.ts:16` viola a regra 1 do próprio `CLAUDE.md`; a "definição de pronto" exige `npm run lint`, que não existe (nem ESLint no repo, apesar de um `eslint-disable-line` em `PaginaConferencia.tsx:50`); a ADR-008 diz que a guarda "falha o build", mas `build` é só `tsc -b && vite build` e não há CI; e a lista negra da guarda G1 omite "identidade" e "contrato" sem explicar a colisão de vocabulário.

Duas coisas que merecem ser ditas porque resistiram ao teste: o T-03 (inventa um tipo "Certidão de Nascimento" e prova que renderiza sem código novo) é a melhor peça da entrega, e o `onde-o-agente-errou.md` é honesto e *checável* — as três histórias que conta deixaram rastro em arquivos que não foram escritos para sustentá-las.
