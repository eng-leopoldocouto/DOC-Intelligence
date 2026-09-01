# Quarta auditoria — 89,5/100, dez achados e o conserto estrutural

> Rodou depois de uma auditoria EXTERNA ao repositório. Confirmou por comando que as guardas seguram (hook, gen:api, linter, contrato), e ainda assim achou dez divergências texto x código — entre elas a quarta ocorrência do mesmo defeito no registro de tempo, desta vez pelo número que faltou escrever. Recomendou o passo de CI que compara as contagens do README com a realidade.

> Transcrição do subagente auditor, gerada por `scripts/exportar-auditorias.py`. **Não editada à mão.**

> O auditor roda em **contexto frio**, sem memória do que o autor quis dizer, com uma instrução no centro: *não acreditar na narrativa do repositório sobre si mesmo*. Os comandos abaixo aparecem **na íntegra**, porque são a evidência — é neles que se vê a verificação acontecendo.

---
**102 chamadas de ferramenta.**


## A instrução dada ao auditor

> Audite a entrega do DOC Intelligence que está neste repositório, contra `docs/enunciado.md`, seguindo integralmente as instruções da sua definição de agente.
> 
> Esta é a QUARTA rodada de auditoria. As três anteriores estão em `docs/ia/transcricao/auditorias/`. NÃO as leia antes de formar seu próprio juízo — leia-as, se quiser, apenas no fim, para conferir se algum achado seu já havia sido apontado e supostamente corrigido.
> 
> Contexto mínimo do que mudou nesta rodada (e que é justamente o que você deve desconfiar, não aceitar):
> 
> - criada `src/app/FronteiraDeErro.tsx`, montada em `App.tsx`
> - criado `src/shared/ui/Dialogo.tsx`; `ConflitoDialog` e `RejeitarDialog` passaram a usá-lo
> - região `aria-live` em `PaginaAcompanhamento`
> - texto sobre "busca" corrigido em README, `07-nao-feito.md`, `08-divergencias.md` e carta
> - responsividade a 360 px em envio e acompanhamento; ADR-014
> - `src/entities/documento/validacao-de-campo.ts` (segundo portão); ADR-015
> - `src/entities/documento/fila.ts` (pressão da fila no cabeçalho da fila)
> - `.github/workflows/ci.yml`, `.claude/hooks/guarda-regras.mjs`, `.oxlintrc.json`, `.gitattributes`
> - `docs/img/` com duas capturas; `docs/spec/exemplos.http`
> - D-10 e D-11 novas; D-08 e D-09 declaradas fechadas
> 
> ATENÇÃO ESPECIAL, porque é o padrão que você mesmo já encontrou três vezes: **o defeito não costuma estar no item corrigido, e sim no vizinho aritmético dele, ou no outro documento que o cita.** Nesta rodada mudaram muitos números e contagens — número de testes, número de ADRs, número de divergências, totais de tempo, contagens no README e na carta. Procure pelo NÚMERO, não pelo assunto.
> 
> Verifique também, rodando de fato:
> - `npm run lint`, `npm run typecheck`, `npm test` — cole a saída
> - se o hook `PreToolUse` realmente bloqueia (o contrato é JSON na entrada padrão, saída 2 bloqueia)
> - se o passo de CI que regenera os tipos passaria: `npm run gen:api` e depois `git diff --exit-code -- src/shared/api/types.gen.ts`
> - se as afirmações do README sobre as capturas correspondem ao que as imagens mostram
> 
> Escreva o relatório em `auditoria/relatorio-final.md` como manda a sua definição, e emita o veredito.

---

## O que ele fez

I'll start by reading the source of truth and then verify everything against the actual code.

`Read` · `C:\Users\SEINFRA\Documents\LEOPOLDO\Documents\LEOPOLDO\Claude coisas\Projetos\DOC-Intelligence\.claude\worktrees\auditoria-defeitos-criticos-cf0f4a\docs\enunciado.md`

**List repository structure**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && ls -la && echo "---" && find . -path ./node_modules -prune -o -type f -print | head -200
```

`Read` · `docs\enunciado.md`

Now let me run the build commands in parallel while I read the docs.

**Read package.json**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat package.json
```

`Read` · `README.md`

Immediate contradictions visible. Let me run the actual commands now.

**Run lint**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && npm run lint 2>&1 | tail -40
```

**Run typecheck**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && npm run typecheck 2>&1 | tail -40
```

**Run oxlint directly with exit code**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && npx oxlint --deny-warnings; echo "EXIT=$?"; echo "---oxlintrc---"; cat .oxlintrc.json
```

**Run tests**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && npm test 2>&1 | tail -60
```

**Regenerate API types and check diff**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && npm run gen:api 2>&1 | tail -10; echo "=== DIFF ==="; git diff --exit-code -- src/shared/api/types.gen.ts; echo "EXIT=$?"
```

**Read CI workflow**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat .github/workflows/ci.yml
```

**Read gitattributes, settings, hook rules**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat .gitattributes; echo "=== settings ==="; cat .claude/settings.json; echo "=== regras ==="; cat .claude/hooks/regras-do-projeto.json
```

`Read` · `.claude\hooks\guarda-regras.mjs`

**Test the PreToolUse hook behavior**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && \
echo '--- CASO 1: fetch fora de shared/api ---' && \
echo '{"tool_name":"Write","tool_input":{"file_path":"C:\\\\repo\\\\src\\\\features\\\\upload\\\\X.tsx","content":"const r = await fetch(\"/api\")"}}' | node .claude/hooks/guarda-regras.mjs; echo "EXIT=$?"; \
echo '--- CASO 2: tipo de documento hardcoded ---' && \
echo '{"tool_name":"Write","tool_input":{"file_path":"src/features/review/Y.tsx","content":"if (t === \"RG\") return 1"}}' | node .claude/hooks/guarda-regras.mjs; echo "EXIT=$?"; \
echo '--- CASO 3: fetch DENTRO de shared/api (deve passar) ---' && \
echo '{"tool_name":"Write","tool_input":{"file_path":"src/shared/api/http.ts","content":"const r = await fetch(u)"}}' | node .claude/hooks/guarda-regras.mjs; echo "EXIT=$?"; \
echo '--- CASO 4: RG em mocks (deve passar) ---' && \
echo '{"tool_name":"Write","tool_input":{"file_path":"src/mocks/dados.ts","content":"const t = \"RG\""}}' | node .claude/hooks/guarda-regras.mjs; echo "EXIT=$?"; \
echo '--- CASO 5: Edit com new_string ---' && \
echo '{"tool_name":"Edit","tool_input":{"file_path":"src/pages/Z.tsx","content":null,"new_string":"contracheque"}}' | node .claude/hooks/guarda-regras.mjs; echo "EXIT=$?"; \
echo '--- CASO 6: doc fora de src (deve passar) ---' && \
echo '{"tool_name":"Write","tool_input":{"file_path":"docs/spec/00.md","content":"RG e fetch("}}' | node .claude/hooks/guarda-regras.mjs; echo "EXIT=$?"
```

The hook genuinely blocks. Now the git history and the `spec-v1` tag claim.

**Check git history and tags**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && git log --all --oneline | wc -l && echo "=== TAGS ===" && git tag -l && echo "=== spec-v1 ===" && git log -1 --format='%H %ci %s' spec-v1 2>&1 && echo "=== primeiro commit com src/ ===" && git log --reverse --format='%h %ci %s' --diff-filter=A -- 'src/*' | head -3
```

**Full commit log with dates**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && git log --format='%h|%ci|%s' | cat
```

`Read` · `docs\spec\08-divergencias.md`

`Read` · `docs\carta-de-fechamento.md`

`Read` · `docs\ia\registro-de-tempo.md`

**Check remote, PDF, and busca wording**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== remote ===" && git remote -v && echo "=== PDF ===" && ls -la docs/carta-de-fechamento.pdf && echo "=== log carta ===" && git log --format='%h %ci %s' -- docs/carta-de-fechamento.md docs/carta-de-fechamento.pdf | cat && echo "=== busca 'servida pelo mock' ===" && grep -rn "servida pelo mock\|servido pelo mock\|Projetada e servida" --include=*.md . | grep -v node_modules | grep -v transcricao
```

`Read` · `docs\spec\07-nao-feito.md`

**Read requisitos around line 287**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && sed -n '275,300p' docs/spec/01-requisitos.md
```

**Check which spec docs changed after spec-v1**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== commits que tocaram cada doc de spec depois de spec-v1 ===" && for f in docs/spec/*.md; do n=$(git log --oneline spec-v1..HEAD -- "$f" | wc -l); echo "$n  $f"; done && echo "=== RF-06 hoje ===" && grep -n "RF-06" -A 14 docs/spec/01-requisitos.md | head -30
```

**Diff of 05-fatos since spec-v1**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && git log --oneline spec-v1..HEAD -- docs/spec/05-fatos-do-ambiente.md && echo "=== DIFF ===" && git diff spec-v1..HEAD -- docs/spec/05-fatos-do-ambiente.md | head -60
```

`Read` · `docs\spec\05-fatos-do-ambiente.md`

**Grep for rule violations and virtualization claims**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== fetch( em src fora de shared/api ===" && grep -rn "fetch(" src/ --include=*.ts --include=*.tsx | grep -v "src/shared/api/" && echo "=== tipos de documento hardcoded em src ===" && grep -rniE "\b(RG|contracheque|procuracao|procuração|laudo|carteira_de_identidade|comprovante)\b" src/ | grep -v "src/mocks/" && echo "=== virtualiz ===" && grep -rni "virtualiz" src/ tests/ ; echo "=== ListaVirtualizada ===" && grep -rn "ListaVirtualizada" . --include=*.md --include=*.ts --include=*.tsx | grep -v node_modules
```

`Read` · `tests\arquitetura\fronteiras.test.ts`

`Read` · `src\app\FronteiraDeErro.tsx`

`Read` · `src\app\App.tsx`

`Read` · `src\shared\ui\Dialogo.tsx`

`Read` · `src\entities\documento\fila.ts`

`Read` · `src\entities\documento\validacao-de-campo.ts`

`Read` · `docs\img\conferencia.png`

`Read` · `docs\img\conflito.png`

**Inspect mock seeding**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== semear ===" && grep -n "semear" -A 60 src/mocks/dados.ts | head -90
```

**Count requests in exemplos.http**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== exemplos.http: contagem de requisicoes ===" && grep -nE "^(GET|POST|PATCH|DELETE|PUT) " docs/spec/exemplos.http && echo "--- total ---" && grep -cE "^(GET|POST|PATCH|DELETE|PUT) " docs/spec/exemplos.http && echo "=== ###  blocos ===" && grep -cE "^### " docs/spec/exemplos.http
```

**Check aria-live, media queries, touch targets**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== aria-live ===" && grep -rn "aria-live\|role=\"status\"\|role='status'" src/ && echo "=== media queries ===" && grep -n "@media" src/shared/ui/estilos.css && echo "=== 44px ===" && grep -n "44px\|min-height" src/shared/ui/estilos.css | head -30 && echo "=== font-size nos campos ===" && grep -n "font-size" src/shared/ui/estilos.css | head -30
```

`Read` · `docs\adr\README.md`

**Read responsive CSS blocks**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && sed -n '100,112p;225,300p' src/shared/ui/estilos.css
```

`Read` · `docs\ia\registro-de-verificacao.md`

**Check PDF vs MD sync**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== log do PDF ===" && git log --format='%h %ci %s' -- docs/carta-de-fechamento.pdf | cat && echo "=== log do MD ===" && git log --format='%h %ci %s' -- docs/carta-de-fechamento.md | cat && echo "=== diff do md no ultimo commit que o tocou ===" && git show 4f88de3 --stat | cat
```

**Diff of carta in last two commits**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== diff carta em 4f88de3 ===" && git show 4f88de3 -- docs/carta-de-fechamento.md | cat && echo "=== diff carta em babbde1 ===" && git show babbde1 -- docs/carta-de-fechamento.md | cat | head -40
```

**Extract text from carta PDF**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && python -c "
import re,zlib,sys
d=open('docs/carta-de-fechamento.pdf','rb').read()
print('bytes:', len(d))
# count pages
print('page objects:', d.count(b'/Type /Page') , d.count(b'/Type/Page'))
out=[]
for m in re.finditer(rb'stream\r?\n(.*?)endstream', d, re.S):
    s=m.group(1)
    try: out.append(zlib.decompress(s))
    except Exception: pass
txt=b'\n'.join(out).decode('latin-1')
# extract text in parentheses of Tj/TJ
frags=re.findall(r'\((?:\\.|[^\\()])*\)', txt)
s=''.join(f[1:-1] for f in frags)
s=s.replace('\\\\(','(').replace('\\\\)',')')
print(len(s))
open('/tmp/carta.txt','w',encoding='utf-8',errors='replace').write(s)
" 2>&1 | head -20
```

`Read` · `docs\carta-de-fechamento.pdf`

**Inspect PDF structure and fonts**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && python -c "
import re,zlib
d=open('docs/carta-de-fechamento.pdf','rb').read()
print('Pages nodes:', len(re.findall(rb'/Type\s*/Pages', d)))
print('Page nodes :', len(re.findall(rb'/Type\s*/Page[^s]', d)))
print('Count key  :', re.findall(rb'/Count\s+\d+', d))
print('Producer   :', re.findall(rb'/Producer\s*\(([^)]*)\)', d))
print('CreationDate:', re.findall(rb'/CreationDate\s*\(([^)]*)\)', d))
print('Fonts:', set(re.findall(rb'/BaseFont\s*/([A-Za-z0-9+#-]+)', d)))
"
```

**Verify PDF matches HEAD and list fonts**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && git status --porcelain && echo "--- hash worktree ---" && git hash-object docs/carta-de-fechamento.pdf && echo "--- hash HEAD ---" && git rev-parse HEAD:docs/carta-de-fechamento.pdf && echo "--- fonts full ---" && python -c "
import re
d=open('docs/carta-de-fechamento.pdf','rb').read()
print(sorted(set(x.decode() for x in re.findall(rb'/BaseFont\s*/([!-~]+?)[\s/>]', d))))
print('FontFile subsets:', len(re.findall(rb'/FontFile2', d)))
"
```

The working tree is dirty — uncommitted changes exist. Let me inspect them.

**Show uncommitted diff**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && git diff -- README.md docs/carta-de-fechamento.md package.json | cat
```

The tree is being edited concurrently. Let me snapshot the current state and re-verify.

**Snapshot current state and grep numbers in README**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "AGORA: $(date -Is)" && ls -la --time-style=full-iso README.md docs/carta-de-fechamento.md docs/carta-de-fechamento.pdf docs/ia/registro-de-verificacao.md package.json scripts/gerar-carta-pdf.py && echo "=== NUMEROS NO README ATUAL ===" && grep -nE "testes-[0-9]+|[0-9]+ testes|[0-9]+ decis|[0-9]+ prompts|Os [0-9]+ |nove|onze|treze|quinze|doze|quatorze|catorze|sete entradas|cinco testes|três vezes|quatro rodadas|110 comandos|16 tarefas|64|95" README.md
```

`Read` · `docs\carta-de-fechamento.md`

**Count prompts, tasks, seams, premises, commands**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== prompts ===" && ls docs/ia/prompts/ | wc -l && echo "=== tarefas no plano ===" && grep -cE "^## T[0-9]+|^### T[0-9]+" docs/plano/2026-08-31-fatia-vertical.md && grep -oE "^#+ T[0-9]+" docs/plano/2026-08-31-fatia-vertical.md | sort -u | tr '\n' ' ' && echo && echo "=== costuras em 04-arquitetura ===" && grep -nE "^#+ .*[Cc]ostura|costuras" docs/spec/04-arquitetura.md | head -20 && echo "=== premissas em 00-visao ===" && grep -nE "^\| \*\*P[0-9]|P[0-9] —|### P[0-9]" docs/spec/00-visao-e-escopo.md | head -20 && echo "=== comandos nas transcricoes de auditoria ===" && grep -c '^cd "' docs/ia/transcricao/auditorias/*.md
```

**Count tasks in the plan**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== tarefas no plano ===" && grep -oE "^#{1,4} +T[0-9]+" docs/plano/2026-08-31-fatia-vertical.md | sort -uV | tr '\n' ' '; echo; grep -oE "\bT1?[0-9]\b" docs/plano/2026-08-31-fatia-vertical.md | sort -uV | tr '\n' ' '; echo; echo "=== headings do plano ===" && grep -nE "^#{1,3} " docs/plano/2026-08-31-fatia-vertical.md | head -40
```

**Count seams, premises, and check PDF**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== costuras ===" && grep -niE "costura" docs/spec/04-arquitetura.md | head -20 && echo "=== premissas ===" && grep -nE "P[1-9]\b" docs/spec/00-visao-e-escopo.md | head -20 && echo "=== PDF paginas agora ===" && python -c "
import re
d=open('docs/carta-de-fechamento.pdf','rb').read()
print('Count:', re.findall(rb'/Count\s+\d+', d), 'Created:', re.findall(rb'/CreationDate\s*\(([^)]*)\)', d))
print('fonts:', sorted(set(x.decode() for x in re.findall(rb'/BaseFont\s*/([!-~]+?)[\s/>]', d))))
"
```

**Dump PDF font objects**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && python -c "
import re,zlib
d=open('docs/carta-de-fechamento.pdf','rb').read()
for pat in [rb'/Subtype\s*/(\w+)', rb'/BaseFont\s*/([!-~]+?)[\s/>\]]', rb'/FontFamily\s*\(([^)]*)\)']:
    print(pat, sorted(set(x.decode() for x in re.findall(pat,d))))
print()
# dump all font objects
for m in re.finditer(rb'\d+ 0 obj\s*<<(.{0,400}?)>>\s*(stream|endobj)', d, re.S):
    body=m.group(1)
    if b'/Font' in body or b'/BaseFont' in body:
        print(body.decode('latin-1')[:300]); print('---')
" 2>&1 | head -60
```

**Check PDF script formatting and code claims**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== script carta pdf: fonte/espacamento ===" && grep -nE "11pt|11px|1\.15|6pt|justify|Roboto|font-size|line-height|margin" scripts/gerar-carta-pdf.py | head -30 && echo "=== localStorage/sessionStorage/indexedDB em src ===" && grep -rniE "localstorage|sessionstorage|indexeddb" src/ | head && echo "(fim)" && echo "=== retry ===" && grep -n "retry\|tentativa\|RETRY" src/shared/api/http.ts | head -20 && echo "=== concorrencia upload ===" && grep -n "CONCORR\|concorr\|= 3" src/features/upload/filaDeEnvio.ts | head
```

**Compare README testing paragraph with actual test**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== README paragrafo de testes atual (linhas 197-216) ===" && sed -n '197,216p' README.md && echo "=== RF-12 no teste ===" && grep -n "RF-12" -A 45 tests/features/conferencia.test.tsx
```

`Read` · `docs\ia\README.md`

`Read` · `docs\ia\onde-o-agente-errou.md`

**Inspect prompt files headers**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== tamanhos e cabecalhos dos prompts ===" && for f in docs/ia/prompts/*.md; do echo "--- $f ($(wc -l < $f) linhas)"; head -8 "$f"; done 2>&1 | head -140
```

**Spot-check prompt bodies for preserved typos**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== 0001 ===" && sed -n '8,25p' docs/ia/prompts/0001-2026-08-31T19-17-abertura-e-diretrizes.md && echo "=== 0003 ===" && sed -n '9,15p' docs/ia/prompts/0003-2026-08-31T19-35-cobranca-artefatos-do-candidato.md && echo "=== 0007 ===" && sed -n '9,12p' docs/ia/prompts/0007-2026-08-31T20-36-push-e-branches.md
```

**Inspect audit transcripts**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== linhas por transcricao de auditoria ===" && wc -l docs/ia/transcricao/auditorias/*.md docs/ia/transcricao/sessao-completa.md && echo "=== contagem de comandos (heuristica) ===" && grep -c '^\$ \|^cd \|^```bash' docs/ia/transcricao/auditorias/*.md && echo "=== headers dos arquivos de auditoria ===" && head -25 docs/ia/transcricao/auditorias/3-terceira-auditoria.md
```

**Count commands in audit transcripts**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== chamadas declaradas ===" && grep -hn "chamadas de ferramenta" docs/ia/transcricao/auditorias/*.md && echo "=== blocos de comando por arquivo ===" && for f in docs/ia/transcricao/auditorias/*.md; do echo -n "$f: "; grep -c '^```bash$' "$f"; done && echo "=== total ===" && cat docs/ia/transcricao/auditorias/*.md | grep -c '^```bash$' && echo "=== script exportador ===" && head -40 scripts/exportar-auditorias.py
```

**Read architecture seams and ADR-015**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== 04-arquitetura: as seis costuras ===" && sed -n '38,80p' docs/spec/04-arquitetura.md && echo "=== ADR-015 alternativas ===" && grep -n "Alternativa" -A 12 docs/adr/015-segundo-sinal-de-confianca.md | head -50
```

`Read` · `src\features\processing\useAnuncioDeTransicoes.ts`

**Check gitignore, CLAUDE.md staleness, routes**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== .gitignore ===" && cat .gitignore && echo "=== CLAUDE.md linter ===" && grep -n "lint\|D-08\|typecheck" CLAUDE.md && echo "=== CLAUDE.md estrutura app/ ===" && grep -n "app/" CLAUDE.md && echo "=== rotas ===" && grep -n "path" src/app/router.tsx
```

`Read` · `tests\app\fronteira-de-erro.test.tsx`

**Verify second gate and queue pressure are wired into UI**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== motivoDeConferencia usado na UI ===" && grep -rn "motivoDeConferencia\|FORMATO_INVALIDO" src/ | grep -v "validacao-de-campo.ts" && echo "=== pressaoDaFila na UI ===" && grep -n "pressaoDaFila\|pressao" src/pages/PaginaFilaConferencia.tsx | head
```

**Run production build**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && npm run build 2>&1 | tail -15
```

**Numeric sweep across docs**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== varredura numerica em docs (fora transcricao/prompts) ===" && grep -rnE "\b(6[0-9]|7[0-9]|8[0-9]|9[0-9]) testes|treze|nove |onze |doze |quinze |13 ADR|15 ADR|13 dec|15 dec|seis asser|sete asser|cinco testes|3h[0-9]{2}|duas rodadas|três rodadas|quatro rodadas|três vezes" docs/*.md docs/spec/*.md docs/adr/*.md docs/ia/*.md README.md CLAUDE.md | grep -v transcricao
```

The candidate is editing live. Let me take a final timestamped snapshot.

**Freeze snapshot with checksums**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "SNAPSHOT: $(date -Is)" && git status --porcelain && md5sum README.md docs/carta-de-fechamento.md docs/carta-de-fechamento.pdf docs/ia/registro-de-tempo.md docs/ia/registro-de-verificacao.md docs/spec/08-divergencias.md src/shared/ui/Dialogo.tsx CLAUDE.md docs/spec/05-fatos-do-ambiente.md docs/ia/onde-o-agente-errou.md
```

**Check new HEAD and tsbuildinfo ignore status**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== HEAD agora ===" && git log --format='%h %ci %s' -3 | cat && echo "=== tsbuildinfo ignorado? ===" && git check-ignore -v tsconfig.tsbuildinfo; echo "check-ignore exit=$?" && rm -f tsconfig.tsbuildinfo && echo "removido" && echo "=== PDF vs MD sincronizados? ===" && git log --format='%h %ci' -1 -- docs/carta-de-fechamento.md | cat && git log --format='%h %ci' -1 -- docs/carta-de-fechamento.pdf | cat
```

`Read` · `docs\carta-de-fechamento.md`

`Read` · `docs\ia\registro-de-tempo.md`

**Final verification pass on current HEAD**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== PDF paginas ===" && python -c "
import re
d=open('docs/carta-de-fechamento.pdf','rb').read()
print('Count:', re.findall(rb'/Count\s+\d+', d), 'Created:', re.findall(rb'/CreationDate\s*\(([^)]*)\)', d), 'bytes', len(d))
" && echo "=== README numeros agora ===" && grep -nE "testes-[0-9]+|[0-9]+ testes|[0-9]+ decis|Os [0-9]+ prompts|cinco testes|três vezes|quatro |110 comandos|sete entradas|64" README.md && echo "=== CLAUDE.md linter ===" && grep -n "D-08\|linter" CLAUDE.md && echo "=== Dialogo D-10 ===" && grep -n "D-1[01]" src/shared/ui/Dialogo.tsx && echo "=== 05-fatos virtualizada ===" && grep -n "Lista virtualizada\|ListaVirtualizada" docs/spec/05-fatos-do-ambiente.md && echo "=== registro-de-tempo fase 9? ===" && grep -n "Fase 9\|01/09\|manhã" docs/ia/registro-de-tempo.md | head
```

**Start mock server and exercise contract**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && (npm run mock > /tmp/mock.log 2>&1 &) ; sleep 6; echo "=== tipos-documento ===" && curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8787/api/v1/tipos-documento && curl -s http://localhost:8787/api/v1/tipos-documento | head -c 300 && echo && echo "=== lista ===" && curl -s "http://localhost:8787/api/v1/documentos?estado=AGUARDANDO_CONFERENCIA&limite=3" -o /dev/null -w "HTTP %{http_code}\n" && curl -s "http://localhost:8787/api/v1/documentos?estado=AGUARDANDO_CONFERENCIA&limite=3" | python -c "import sys,json; d=json.load(sys.stdin); print('itens:',len(d['itens']), 'ids:',[i['id'] for i in d['itens']])"
```

Interesting — the queue order looks wrong. Let me verify.

**Check queue ordering from mock**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && curl -s "http://localhost:8787/api/v1/documentos?estado=AGUARDANDO_CONFERENCIA&limite=20" | python -c "
import sys,json,datetime
d=json.load(sys.stdin)
print('total itens:', len(d['itens']))
for i in d['itens']:
    print(i['id'], i['recebidoEm'])
print('proximoCursor:', d.get('proximoCursor'))
"; echo "=== handlers: ordenacao ==="; grep -n "sort\|recebidoEm" src/mocks/handlers.ts | head -20
```

**Check mock log and server port config**

```bash
cat /tmp/mock.log 2>/dev/null | head -20; echo "=== retry em porta limpa ==="; cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && grep -n "PORTA\|8787\|listen" src/mocks/servidor.ts
```

**Exercise contract on clean port**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && (PORTA=8799 npm run mock > /tmp/mock2.log 2>&1 &) ; sleep 6; B=http://localhost:8799/api/v1; curl -s "$B/documentos?estado=AGUARDANDO_CONFERENCIA&limite=20" | python -c "
import sys,json
d=json.load(sys.stdin); print('itens:',len(d['itens']))
for i in d['itens'][:8]: print(' ', i['id'], i['recebidoEm'], i.get('tipoDocumentoId'))
"; echo "=== claim + patch com If-Match velho ==="; ID=$(curl -s "$B/documentos?estado=AGUARDANDO_CONFERENCIA&limite=1" | python -c "import sys,json;print(json.load(sys.stdin)['itens'][0]['id'])"); echo "id=$ID"; curl -s -X POST "$B/documentos/$ID/conferencia/claim" -H "X-Usuario-Id: ana" -o /dev/null -w "claim HTTP %{http_code}\n"; curl -s -X PATCH "$B/documentos/$ID/campos" -H "Content-Type: application/json" -H "If-Match: 999" -H "X-Usuario-Id: ana" -d '{"campos":[]}' -w "\npatch If-Match velho HTTP %{http_code}\n" | tail -3
```

**Final checks and cleanup**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== costuras numeradas ===" && grep -nE "^### [0-9]+\." docs/spec/04-arquitetura.md && echo "=== 04-arq linha 119 ===" && sed -n '115,125p' docs/spec/04-arquitetura.md && echo "=== D-09 seis assercoes ===" && sed -n '205,215p' docs/spec/08-divergencias.md && echo "=== README 60-64 ===" && sed -n '57,64p' README.md; pkill -f "tsx src/mocks/servidor.ts" 2>/dev/null; echo "mock encerrado"
```

Verification complete. Let me write the report file the task requires, then report findings directly.

**Write final audit report**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && mkdir -p auditoria && cat > auditoria/relatorio-final.md <<'RELATORIO'
# Auditoria de entrega — DOC Intelligence (Trilha B)

**Quarta rodada** · auditor em contexto frio · 01/09/2026, 11h05 -03:00
**Estado auditado:** HEAD `93f7d80` ("docs: registros, carta e o PDF que passa a ser derivado"), árvore limpa.

> **Nota de método.** O repositório foi editado *durante* esta auditoria: entre o
> início e o fim, o HEAD andou de `ab6afef` para `78058bf` e depois para
> `93f7d80`, e a carta de fechamento foi reescrita duas vezes. Todos os achados
> abaixo foram **re-verificados contra `93f7d80`**. Os que a última reescrita
> corrigiu foram removidos do relatório; os que sobreviveram estão aqui com
> arquivo e linha do estado final.

---

## 1. Veredito

# APROVADO COM RESSALVAS

A entrega cumpre os cinco entregáveis obrigatórios e a arquitetura **não é
narrativa**: eu rodei as guardas e elas seguram. O hook `PreToolUse` bloqueia de
verdade (saída 2), o `gen:api` produz diff vazio, 95 testes passam, o linter
passa, o build passa, o contrato responde 409 no `If-Match` velho. Isso é raro e
vale dizer.

O que custa pontos é de outra natureza, e é sempre a mesma: **a contabilidade dos
próprios documentos.** O registro de tempo — que é a resposta a uma das quatro
perguntas obrigatórias da carta — está desatualizado e subdeclara o trabalho; o
README se contradiz sobre o número de testes dentro do parágrafo que o enunciado
exige em II.3; um documento da spec afirma uma lista virtualizada que não existe
e aponta um arquivo que não existe; e o `CLAUDE.md` ainda declara que "não há
linter neste projeto" depois de o linter existir, rodar e ser passo de CI.

Não é reprovação porque nenhuma capacidade foi fabricada. É ressalva porque o
repositório inteiro se apresenta como um exercício de "o texto corresponde ao
código", e ainda há quatro lugares em que não corresponde.

---

## 2. Resumo em cinco linhas

1. Arquitetura excelente e **verificável por comando** — costura única de rede,
   tipos gerados do contrato, registry por tipo de dado, hook que bloqueia antes
   da escrita: rodei os quatro e os quatro seguram.
2. Rastreabilidade de primeira linha: 15 ADRs com alternativas descartadas pelo
   motivo real, e 11 divergências assumidas, incluindo *"não foi decisão — foi
   omissão"*.
3. Uso de IA é o ponto mais forte: 14 prompts crus com erros de digitação
   preservados, lacunas declaradas, fronteira com plugin de terceiro declarada,
   110 comandos de auditoria exportados por script.
4. **O registro de tempo parou na madrugada de 01/09** e a carta diz "3h20 …
   terminou na madrugada" — enquanto o último commit é 10h59 do mesmo dia, depois
   de +1590 linhas, 2 ADRs, CI, hook, linter e 31 testes novos.
5. Sobram quatro divergências texto×código; nenhuma é grave isoladamente, todas
   são do tipo que este repositório se propôs a não ter.

---

## 3. Conferência dos cinco entregáveis

| # | Entregável | Estado | Evidência |
|---|---|---|---|
| II.1 | Repositório Git com histórico real | **Presente** | 31 commits, de `43688ea` (31/08 19:57) a `93f7d80` (01/09 10:59). Mensagens longas e explicativas, merges por branch, nenhum "initial" único. |
| II.2 | Spec antes do código + ADRs com alternativas | **Presente** | Tag `spec-v1` = `add134d`, 31/08 **20:14:09**; primeiro arquivo em `src/` = `eba0889`, **20:42:10** → 28 min de diferença, exatamente como o README afirma. 9 documentos de spec, 15 ADRs, 11 divergências. |
| II.3 | Fatia vertical rodando + README + parágrafo de testes | **Presente, com defeito** | `npm test` → 95/95; `npm run build` → ok; `npm run mock` + `curl` → 200/409 reais. **Mas o parágrafo exigido (`README.md:199`) diz "São 64 testes"** contra o badge e a tabela que dizem 95. |
| II.4 | Registro do uso de IA | **Presente, o melhor da entrega** | `CLAUDE.md` versionado e escrito antes; `.claude/agents/auditor-de-entrega.md`; `.claude/hooks/guarda-regras.mjs` + `settings.json`; 14 prompts íntegros; `registro-de-verificacao.md` com 8 entradas; `onde-o-agente-errou.md`. Ressalva em 6.6. |
| II.5 | Carta de fechamento, ≤ 2 páginas, 4 perguntas | **Presente, com defeito** | PDF A4, `/Count 2`, Roboto embutida (Regular/Bold/Italic), 11pt, entrelinha 1,15, 6pt entre parágrafos, justificado — confere com o enunciado. As quatro perguntas são respondidas. **A quarta resposta está errada** (ver A-01). |

---

## 4. Nota por critério de pontuação

### 30% — Arquitetura e modularidade → **27 / 30**

O que eu verifiquei, e não apenas li:

- **Costura única de rede.** `grep -rn "fetch(" src/ | grep -v shared/api/`
  devolve uma única linha, `PaginaConferencia.tsx:171`, que é
  `documento.refetch()` do TanStack Query — não é rede. A regra vale.
- **Nenhum tipo de documento no front-end.** A varredura de
  `tests/arquitetura/fronteiras.test.ts:63` passa; as três ocorrências de "RG" /
  "contracheque" em `src/` estão em comentário (`shared/api/http.ts:55`) ou em
  `types.gen.ts` gerado — e o teste remove comentários antes de varrer, o que é
  a decisão certa e está justificada em V-004.
- **A promessa central é testada.** `tests/features/conferencia.test.tsx`, caso
  "T-03 — o front-end renderiza um tipo de documento que NUNCA viu", passa. É o
  teste que sustenta "adicionar um tipo custa zero linhas de front-end".
- **Tipos gerados, não escritos.** `npm run gen:api && git diff --exit-code --
  src/shared/api/types.gen.ts` → **saída 0, diff vazio**. E há passo de CI que
  falha se não for assim (`.github/workflows/ci.yml`, "Os tipos correspondem ao
  contrato").
- **Seis costuras nomeadas** existem de fato em `04-arquitetura.md:40–92`, cada
  uma com o custo da troca.

Desconto: ver A-03 (afirmação de lista virtualizada apontando arquivo
inexistente, num documento que foi editado nesta rodada).

### 20% — Rastreabilidade das decisões → **17,5 / 20**

15 ADRs, todas com "Alternativas descartadas" pelo motivo real e "Como saberemos
que erramos". A ADR-015 descarta "baixar o limiar" com o argumento certo (*"não
resolve o caso, que é alta confiança com valor errado; nenhum limiar pega isso,
por definição"*). A D-10 é o ponto alto do documento inteiro: havia a saída fácil
de acrescentar `q` ao contrato para tornar a frase verdadeira, e o candidato
recusou por escrito, nomeando o motivo. Isso é exatamente o que o enunciado quer
ler.

Descontos: A-04 (`Dialogo.tsx:24` cita a divergência errada), A-05
(`CLAUDE.md:102` contradiz a D-08 fechada), A-08 (D-09 diz "seis asserções",
são sete).

### 20% — Uso de IA como ferramenta de engenharia → **18 / 20**

Grau de controle alto e demonstrável:

- O `CLAUDE.md` foi escrito antes e tem **oito regras derivadas dos fatos do
  ambiente**, cada uma com o fato entre parênteses. Não é estilo, é projeto.
- **O hook não é decorativo.** Exercitei o contrato (JSON na entrada padrão)
  com seis casos: `fetch(` em `src/features/` → **saída 2**; `fetch(` em
  `src/shared/api/` → 0; `"RG"` em `src/features/` → **2**; `"RG"` em
  `src/mocks/` → 0; `Edit` com `new_string: "contracheque"` → **2**; documento
  fora de `src/` → 0. Funciona como está escrito.
- **A lista de termos não está duplicada**, e há um teste
  (`fronteiras.test.ts:79`) que falha se o hook passar a guardar cópia própria.
  Essa é uma decisão de engenharia de verdade, não enfeite.
- **Prompts crus.** `0007` traz "produzirdo"; `0001` traz "ficticios",
  "analise", "RESALVAS"; `0003` traz "raciocinio". Não foram reescritos.
- **Lacunas declaradas.** `docs/ia/README.md:29-41` assume que os prompts 0010 e
  0012 foram recriados, e que recriar não é o mesmo que gravar no ato.
- **Fronteira com terceiros declarada.** `docs/ia/README.md:52-64` separa
  Superpowers/ECC (pré-instalados, "ferramenta, como o editor") do que foi
  autorado para a prova. Não há reivindicação indevida.
- **V-008 admite que o agente fabricou evidência** (a medição `od -c | grep -c
  '\r'` que virou busca pela letra "r"). Registrar um achado inventado do próprio
  agente é o tipo de honestidade que não se simula.

Desconto: A-06 (o parágrafo obrigatório `onde-o-agente-errou.md` não incorporou
os três erros da última rodada, incluindo o mais instrutivo de todos) e A-07
("Os 12 prompts" no README, são 14).

### 15% — Especificação e método → **13 / 15**

A ordem está provada por `git log`, não afirmada: `spec-v1` 28 minutos antes do
primeiro `src/`. Os documentos 00–04 e 06 continuam **byte a byte como estavam na
tag** (`git log spec-v1..HEAD -- <arquivo>` devolve zero commits para cada um),
que é literalmente o que o enunciado pede: "entregue a especificação como estava
e diga onde divergiu". O plano em 16 tarefas existe e é anterior ao código.

Desconto: `05-fatos-do-ambiente.md` **foi editado depois da tag** (commit
`78058bf`). As adições estão marcadas "Acrescentado em 01/09", o que é honesto —
mas o documento deixou de ser "a spec como estava", e a edição passou ao lado de
uma afirmação falsa que estava na mesma seção (A-03). Também deixou a referência
de linha da D-06 obsoleta (`08-divergencias.md:115` aponta
`05-fatos-do-ambiente.md:204`; hoje é a linha 252).

### 15% — Atenção e proatividade → **14 / 15**

Os sete fatos são tratados, com risco residual em cada um — e os riscos residuais
são específicos, não genéricos ("o zoom do iOS ao focar campo com fonte menor que
16 px — este é um defeito conhecido do nosso CSS, que usa 14 px nos campos";
confirmei: `estilos.css:135` usa `font-size: 14px` e o bloco de 760 px não o
sobrepõe). O segundo portão (ADR-015) e a pressão da fila (fato e) são adições
proativas legítimas, derivadas dos números do próprio enunciado, e estão ligadas
à interface — não são código órfão: `PainelDeCampos.tsx:40`,
`PaginaFilaConferencia.tsx:61,111`.

Desconto: A-09 (o próprio README erra a contagem do tratamento dos fatos).

### **Total: 89,5 / 100**

---

## 5. Os sete fatos do ambiente

| Fato | Situação | Evidência verificada |
|---|---|---|
| **(a)** modelo lento, cobrado, instável | **Resolvido + risco registrado** | `shared/api/http.ts:95` — `const tentativas = metodo === 'GET' ? 3 : 1`: retry **só** em GET, nunca no que dispara o modelo. Estados `FALHOU` e `EXPIRADO` de primeira classe (`mocks/dados.ts:379-380` semeia os dois). Reprocessar exige confirmação com custo. **Segundo portão** independente do fornecedor: `entities/documento/validacao-de-campo.ts` (dígito verificador de CPF/CNPJ, plausibilidade de data). Risco: sem alerta de taxa de falha; só 3 dos 6 tipos de dado têm regra — declarado em `05-fatos:75-79`. |
| **(b)** foto de celular, nome lixo | **Resolvido + risco registrado** | Whitelist e teto em `features/upload/validacao.ts`; redução e EXIF em `shared/lib/imagem.ts`; identidade por hash em `shared/lib/hash.ts`. Responsividade a 360 px em `estilos.css:231-290` com alvos de 44 px. Risco **HEIC** assumido e explicado; risco novo "verificado no navegador, não em aparelho" e o zoom do iOS declarados em `05-fatos:141-148`. |
| **(c)** duplicatas | **Resolvido + risco registrado** | Duas camadas: cliente (`features/upload/deduplicacao.ts`) e servidor (`200` com `duplicado: true`). Risco de duplicata perceptual declarado em `05-fatos:180-185`. |
| **(d)** dado pessoal sensível | **Resolvido + risco registrado** | `grep -rniE "localstorage\|sessionstorage\|indexeddb" src/` → **vazio**. Rotas só com ID opaco (`router.tsx:21`, `conferencia/:id`). Sanitização de PII em `http.ts`. `FronteiraDeErro.tsx:55-61` **não mostra e não envia** `erro.message`, com o motivo escrito — e há teste que verifica isso (`fronteira-de-erro.test.tsx:63`). Risco: sem trilha de auditoria de leitura. |
| **(e)** pico de 800 | **Tratado + risco registrado** | Polling em lote (`usePollingLote.ts`), backoff (`backoff.ts`, 6 testes), concorrência 3 (`filaDeEnvio.ts:7`), paginação por cursor. Pressão da fila no cabeçalho, com os limites derivados por escrito em `entities/documento/fila.ts:13-32`. **Ressalva:** a lista **não é virtualizada** — assumido em D-06, mas ainda afirmado como feito em `05-fatos:252` (ver A-03). |
| **(f)** troca de modelo e prompts | **Resolvido** | Schema vindo de `GET /tipos-documento`, registry por `TipoDeDado`, `modelo` e `versaoPrompt` por documento (confirmei na resposta do mock: `"modelo":"fornecedor-vision-2.1","versaoPrompt":"rg-v4"`). Guardado por teste **e** por hook **e** por CI. Este é o fato mais bem tratado da entrega. |
| **(g)** dois conferentes | **Resolvido + risco registrado** | Dois mecanismos distintos para dois problemas distintos: claim com TTL e trava otimista. Verifiquei contra o mock: `POST /{id}/conferencia/claim` → 200; `PATCH` com `If-Match: 999` → **409** com `documentoAtual` e `alteradoPor`. Teste T-01 verifica as quatro propriedades. Risco de degradação anônima declarado. |

**Nenhum fato ignorado.** Três "resolvidos" e quatro "com risco" é como o README
descreve, mas não é o que a tabela do próprio `05-fatos` mostra — ver A-09.

---

## 6. Achados, do mais grave ao mais leve

### A-01 — GRAVE. O registro de tempo não cobre a última rodada, e a carta responde errado a uma pergunta obrigatória

**Arquivos:** `docs/ia/registro-de-tempo.md:23,25` · `docs/carta-de-fechamento.md:89-92`

A tabela termina na **Fase 8 — auditoria e correções**, `21:55 → ver último
commit`, `~0h50`, com a observação *"duas rodadas de auditoria e as correções"*.
O total declarado é **3h20** (a soma da coluna, aliás, está correta: 200 min).
A carta repete: *"3h20 de trabalho efetivo … terminou na madrugada do dia
seguinte"*.

O que o `git log` mostra depois da madrugada:

```
c37136c 2026-09-01 09:16:24  docs: registra o prompt 0014
4f88de3 2026-09-01 09:39:21  fix: fecha os defeitos do Bloco 1 e os fatos (a),(b),(e)
78058bf 2026-09-01 10:48:11  feat: CI, hook PreToolUse, linter, capturas, contrato exercitavel
93f7d80 2026-09-01 10:59:27  docs: registros, carta e o PDF que passa a ser derivado
```

Só o `4f88de3` são **+1590 / −100 linhas**, 29 arquivos, 2 ADRs novas, 5 arquivos
novos em `src/` e 17 testes novos. O `78058bf` acrescentou CI, hook, linter,
`.gitattributes`, `exemplos.http` e duas capturas. A suíte foi de 64 para 95
testes. Nada disso está no registro de tempo, e a fase 8 continua dizendo "duas
rodadas de auditoria" quando houve três internas mais uma externa.

**Por que importa mais do que parece.** "Quanto tempo isso tudo levou" é uma das
quatro perguntas que o enunciado obriga a carta a responder, e a carta manda o
avaliador conferir o arquivo (*"somando a coluna de duração de
`docs/ia/registro-de-tempo.md`"*). O avaliador que somar vai encontrar 3h20 e
vai encontrar, ao lado, um `git log` de dez horas de calendário. E o parágrafo
imediatamente abaixo é o que explica, por três vezes, por que esse arquivo não
pode conter número desatualizado — *"um documento que se apresenta como relógio
real não pode conter estimativa disfarçada"*.

É a **quarta ocorrência do mesmo defeito no mesmo arquivo**, e a primeira em que
o erro não é o número escrito e sim o número **não escrito**. O padrão que o
próprio candidato nomeou ("o defeito está no vizinho aritmético, ou no outro
documento que o cita") se aplica exatamente: a carta foi reescrita às 10h54 e o
registro de tempo que ela cita não foi tocado.

---

### A-02 — GRAVE (barato). O README se contradiz sobre o número de testes, dentro do parágrafo exigido pelo enunciado

**Arquivos:** `README.md:4` · `README.md:71` · `README.md:122` · `README.md:173` · `README.md:199`

```
  4: ![Testes](…/badge/testes-95-brightgreen)
 71: npm test                    # 64 testes, inclusive as guardas de arquitetura
122: | `npm test` | 95 testes, incluindo as guardas de arquitetura |
173: tests/           95 testes, incluindo guardas de arquitetura
199: São 64 testes, e o critério para escrevê-los não foi cobertura: …
```

Saída real, colada:

```
 Test Files  16 passed (16)
      Tests  95 passed (95)
```

Duas agravantes. A primeira: a linha 71 está dentro do bloco intitulado
**"Confira que o texto corresponde ao código"**, precedido de *"Não acredite;
rode:"*. Um avaliador que aceitar o convite roda `npm test`, vê 95 e descobre
que o convite estava errado — na linha que o fazia. A segunda: a linha 199 abre
**o parágrafo que o item II.3 do enunciado exige explicitamente** ("um parágrafo
dizendo o que você escolheu testar, e por quê"). É o pior lugar possível para um
número errado.

*(No mesmo parágrafo: `README.md:211` diz "cinco testes de arquitetura";
`tests/arquitetura/fronteiras.test.ts` tem **sete**, conforme a saída do vitest.
E `README.md:167` ainda diz "13 decisões" enquanto `README.md:83`, corrigido nesta
rodada, já diz 15 — o vizinho de novo.)*

**Restante do parágrafo: verificado e verdadeiro.** A afirmação sobre "contar as
chamadas que não foram feitas" tem lastro em `conferencia.test.tsx:166-184`
(`expect(reprocessamentos).toBe(0)`), e o teste do tipo de documento inédito
existe e passa. Só os números estão errados.

---

### A-03 — MÉDIO-GRAVE. A lista virtualizada continua afirmada como feita, apontando um arquivo que não existe — num documento editado nesta rodada

**Arquivo:** `docs/spec/05-fatos-do-ambiente.md:252` e `:257`

```
252: - **Lista virtualizada** e paginação por cursor. O DOM não cresce com a fila.
257: `features/review/ListaVirtualizada.tsx`
```

`grep -rni "virtualiz" src/ tests/` → **zero ocorrências**.
`src/features/review/ListaVirtualizada.tsx` → **não existe**.

A defesa natural é "a spec está congelada e a divergência está na D-06". Ela não
se sustenta aqui, por duas razões:

1. **Este arquivo não está congelado.** `git log spec-v1..HEAD --
   docs/spec/05-fatos-do-ambiente.md` devolve o commit `78058bf`, **desta
   rodada**. Os outros seis documentos da spec devolvem zero — este foi editado.
2. **A edição foi na mesma seção.** O bloco "Acrescentado em 01/09 — a fila diz
   o próprio tamanho" foi inserido em `:259`, sete linhas abaixo da afirmação
   falsa, na seção do mesmo fato (e). O autor releu, escreveu ao lado e não viu.

Efeito colateral: a D-06 cita *"`05-fatos-do-ambiente.md:204`"*
(`08-divergencias.md:115`); com a edição, a linha virou 252. A referência que
existe para permitir a conferência não confere mais.

---

### A-04 — MÉDIO. `Dialogo.tsx` aponta a divergência errada

**Arquivo:** `src/shared/ui/Dialogo.tsx:24`

```
 * Por que não `<dialog>` nativo: o jsdom não implementa `showModal()` …
 * ~40 linhas de foco não compensa aqui. Registrado em D-10.
```

D-10 é *"o texto afirmava busca especificada; o contrato não tem parâmetro de
termo"*. A divergência do `aria-modal` é a **D-11**, e é lá que a alternativa
`<dialog>` nativo está de fato registrada (`08-divergencias.md:308-314`).

Importa porque a rastreabilidade é 20% da nota e depende de o ponteiro apontar
para o lugar certo. Quem seguir o ponteiro cai num texto sobre busca e conclui
que o comentário é enfeite.

---

### A-05 — MÉDIO. O `CLAUDE.md` ainda diz que o projeto não tem linter

**Arquivo:** `CLAUDE.md:102`

```
- [ ] `npm run typecheck` passa (não há linter neste projeto — ver D-08)
```

Mas: `npm run lint` existe (`package.json:14`), roda, **passa com saída 0**, e é
passo obrigatório de CI (`.github/workflows/ci.yml`, "Linter (fecha a D-08)"). A
própria D-08 está marcada **"### FECHADA em 01/09/2026"**
(`08-divergencias.md:183`).

O `CLAUDE.md` é entregável explícito do item II.4 e é a "definição de pronto" que
governa o trabalho. Ele agora subdeclara o rigor do próprio projeto e aponta para
uma divergência que foi fechada. É o caso mais limpo de "o outro documento que
cita o item corrigido" desta rodada: fecharam a D-08 e não voltaram ao arquivo
que a referenciava.

*(Menor, no mesmo arquivo: `CLAUDE.md:82` descreve `app/` como "router,
providers, error boundary" — esta parte, ao contrário, está certa desde
`FronteiraDeErro.tsx`.)*

---

### A-06 — MÉDIO. O parágrafo obrigatório sobre os erros do agente não inclui os erros desta rodada — inclusive o mais instrutivo

**Arquivo:** `docs/ia/onde-o-agente-errou.md` (integral) · comparar com `docs/ia/registro-de-verificacao.md:244-271`

O enunciado (II.4, terceiro travessão) pede "um parágrafo sobre onde o agente
errou, como você percebeu e o que fez a respeito". O arquivo existe, é bom, e
termina em `:44-51` com "A quarta correção não foi minha" — a primeira auditoria.

A V-008 registra **três erros novos do agente**, e o terceiro é o mais valioso da
entrega inteira:

> *"O agente afirmou ter encontrado um defeito que não existia. … A medição que
> sustentava a afirmação era `od -c | grep -c '\r'` — que, depois de passar pelo
> shell, virou uma busca pela letra 'r'. … é o **oposto** dos anteriores: não foi
> omissão, foi um achado inventado com aparência de evidência."*

Um agente que fabrica evidência é a falha mais difícil de perceber e a mais cara
de confiar — e ela está apenas no registro de verificação, não no parágrafo que o
enunciado manda ler. O parágrafo, hoje, ainda afirma "As três correções de rumo
desta entrega foram todas minhas", o que a última rodada já contradiz.

Não é omissão desonesta (o fato está registrado dois arquivos ao lado). É ponto
perdido por não estar onde o avaliador vai procurar.

---

### A-07 — LEVE. Contagens residuais no README

**Arquivo:** `README.md`

| Linha | Diz | É | Verificação |
|---|---|---|---|
| 167 | `docs/adr/  13 decisões` | **15** | `ls docs/adr/0*.md` = 15; `docs/adr/README.md:19-33` indexa 15 |
| 199 | "São 64 testes" | **95** | saída do vitest |
| 211 | "cinco testes de arquitetura" | **7** | `fronteiras.test.ts (7 tests)` |
| 226 | "Os 12 prompts" | **14** | `ls docs/ia/prompts/ \| wc -l` = 14 |
| 242 | "Rodei três vezes." | contradiz `:230` e `:248` ("as quatro rodadas") | 4 arquivos em `transcricao/auditorias/`, um deles interrompido |

A linha 242 é defensável (três rodadas *completas*, quatro *tentativas*), mas
convive a seis linhas de "quatro rodadas" e a carta agora diz "quatro vezes". Ou
se alinha, ou se explica no lugar.

**Contagens que eu conferi e que estão certas** — registro porque a maioria está:
"seis costuras" (`04-arquitetura.md:40-92`), "seis premissas"
(`00-visao-e-escopo.md:65-70`), "16 tarefas" (T1–T16 no plano), "nove
requisições" (`exemplos.http`, 9 verbos HTTP), "dez documentos — seis
aguardando, um FALHOU, um EXPIRADO" (`mocks/dados.ts:362-381`, e o `curl`
devolveu exatamente 6 na fila), "110 comandos" (5+44+24+37 blocos ```bash = 110,
exato), "28 minutos" antes do primeiro `src/`.

---

### A-08 — LEVE. D-09 diz "seis asserções"; são sete

**Arquivo:** `docs/spec/08-divergencias.md:211`

`tests/arquitetura/fronteiras.test.ts` reporta `(7 tests)`. A sétima é a que
verifica que o hook não guarda cópia própria da lista de termos — acrescentada
nesta rodada, e das mais interessantes. Contar a menos subvende o trabalho.

---

### A-09 — LEVE. O README erra a contagem do tratamento dos próprios fatos

**Arquivo:** `README.md:62-63`

> "Três foram resolvidos, quatro foram tratados *e* deixaram risco registrado."

A tabela-resumo de `05-fatos-do-ambiente.md:387-395` tem **as duas colunas
preenchidas nos sete fatos**. Não há três "só resolvidos": todos os sete têm
risco residual declarado. A frase subvende — o correto e mais forte seria "os
sete foram tratados, e os sete deixaram risco residual escrito", que é
exatamente o que o enunciado diz que conta.

---

### A-10 — COSMÉTICO. `npm run build` suja a árvore

**Arquivo:** `.gitignore`

`npm run build` (`tsc -b && vite build`) gera `tsconfig.tsbuildinfo` na raiz.
`git check-ignore -v tsconfig.tsbuildinfo` → **saída 1** (não ignorado). Quem
seguir o README e rodar o build fica com `?? tsconfig.tsbuildinfo` no `git
status`. `dist/` está ignorado; o `tsbuildinfo` escapou.

---

## 7. O que eu corrigiria antes de enviar, por retorno sobre esforço

| # | Correção | Esforço | Por que primeiro |
|---|---|---|---|
| 1 | **Fechar o registro de tempo (A-01).** Acrescentar as fases de 01/09 manhã com os carimbos de `c37136c`, `4f88de3`, `78058bf`, `93f7d80`; renomear a fase 8 para "três rodadas + auditoria externa"; refazer a soma; atualizar a carta e **regerar o PDF**. | 15 min | É resposta a pergunta obrigatória, está errada, e é o quarto tropeço no mesmo arquivo. É o único achado que um avaliador atento **vai** encontrar, porque a própria carta manda ele conferir. |
| 2 | **`grep -n "64 testes\|64 \| 13 decis\|12 prompts\|cinco testes" README.md` e corrigir tudo (A-02, A-07).** Trocar os números fixos por uma frase que não envelhece ("a suíte tem 95 testes hoje; o critério, não o número, é o que importa") ou aceitar que precisa ser revisto a cada rodada. | 10 min | Cinco números errados num documento que se vende como verificável. Custo quase zero, dano desproporcional: é o primeiro arquivo que o avaliador abre. |
| 3 | **Corrigir `05-fatos:252,257` (A-03)** — trocar "Lista virtualizada e paginação por cursor" por "paginação por cursor; a virtualização foi projetada e **não** implementada (D-06)" e remover o caminho `ListaVirtualizada.tsx`. Atualizar a referência de linha na D-06. | 5 min | O arquivo já não está congelado, então não há custo de princípio. É a última afirmação de capacidade inexistente que restou no repositório. |
| 4 | **`CLAUDE.md:102` (A-05)** — trocar por "`npm run typecheck` e `npm run lint` passam (D-08 fechada)". | 1 min | Um minuto para o arquivo-instrução parar de contradizer a CI. |
| 5 | **`Dialogo.tsx:24`: D-10 → D-11 (A-04).** | 1 min | Um caractere. |
| 6 | **Acrescentar ao `onde-o-agente-errou.md` o erro do `.gitattributes` (A-06)** — três linhas: o agente afirmou um defeito inexistente sustentado por uma medição quebrada, e você percebeu refazendo a medição. | 10 min | É o melhor material do arquivo e está no arquivo errado. Ganha mais ponto do que qualquer correção numérica desta lista. |
| 7 | `D-09`: "seis" → "sete asserções" (A-08); `README:62`: acertar a contagem dos fatos (A-09); `.gitignore`: `tsconfig.tsbuildinfo` (A-10). | 5 min | Varredura final. |

**Depois de corrigir, rode a verificação que o próprio repositório ensinou:**

```bash
grep -rn "3h20\|3h[0-9][0-9]" docs/ README.md
grep -rnE "\b(6[0-9]|9[0-9]) testes|1[0-9] decis|1[0-9] prompts|D-1[01]" docs/ README.md CLAUDE.md src/
```

Procurar pelo número, não pelo assunto — e desta vez incluir `src/` e
`CLAUDE.md` na varredura, que é onde os dois números errados desta rodada
sobreviveram.

---

## Apêndice — saída dos comandos, na íntegra

```
$ npm run lint
> oxlint --deny-warnings
EXIT=0

$ npm run typecheck
> tsc --noEmit
(sem saída)

$ npm test
 ✓ tests/features/anuncio-de-transicoes.test.tsx (4 tests) 63ms
 ✓ tests/features/segundo-portao.test.tsx (4 tests) 95ms
 ✓ tests/app/fronteira-de-erro.test.tsx (3 tests) 352ms
 ✓ tests/features/dialogo.test.tsx (2 tests) 1109ms
 ✓ tests/shared/hash.test.ts (4 tests) 10ms
 ✓ tests/entities/validacao-de-campo.test.ts (12 tests) 10ms
 ✓ tests/features/conferencia.test.tsx (4 tests) 1967ms
 ✓ tests/entities/fila.test.ts (5 tests) 6ms
 ✓ tests/entities/nome.test.ts (5 tests) 8ms
 ✓ tests/entities/estado.test.ts (10 tests) 7ms
 ✓ tests/shared/mascara.test.ts (5 tests) 7ms
 ✓ tests/shared/formato.test.ts (5 tests) 5ms
 ✓ tests/features/envio-logica.test.ts (11 tests) 133ms
 ✓ tests/features/backoff.test.ts (6 tests) 7ms
 ✓ tests/arquitetura/fronteiras.test.ts (7 tests) 75ms
 ✓ tests/mocks/contrato.test.ts (8 tests) 134ms

 Test Files  16 passed (16)
      Tests  95 passed (95)

$ npm run gen:api && git diff --exit-code -- src/shared/api/types.gen.ts
🚀 docs/spec/openapi.yaml → src/shared/api/types.gen.ts [146.5ms]
EXIT=0            (diff vazio — o passo de CI passaria)

$ npm run build
✓ 360 modules transformed.
dist/assets/index-D8ArXjAc.js   368.60 kB │ gzip: 117.67 kB
✓ built in 2.74s

$ hook PreToolUse (JSON na entrada padrão)
  fetch( em src/features/upload/X.tsx          → EXIT=2  (bloqueou)
  fetch( em src/shared/api/http.ts             → EXIT=0
  "RG" em src/features/review/Y.tsx            → EXIT=2  (bloqueou)
  "RG" em src/mocks/dados.ts                   → EXIT=0
  Edit new_string:"contracheque" em src/pages/ → EXIT=2  (bloqueou)
  "RG"+fetch( em docs/spec/00.md               → EXIT=0

$ PORTA=8799 npm run mock  +  curl
  GET  /tipos-documento                        → 200
  GET  /documentos?estado=AGUARDANDO_CONFERENCIA → 200, 6 itens, ordem doc-1…doc-6
                                                  (mais antigo primeiro, confere
                                                   com entities/documento/fila.ts)
  POST /documentos/doc-1/conferencia/claim     → 200
  PATCH /documentos/doc-1/campos  If-Match:999 → 409, com documentoAtual e alteradoPor

$ git log -1 --format='%H %ci' spec-v1
  add134dddd9d816f7a034edb60e46a0992353887  2026-08-31 20:14:09 -0300
$ git log --reverse --diff-filter=A --format='%h %ci' -- 'src/*' | head -1
  eba0889 2026-08-31 20:42:10 -0300          (28 min depois — confere)

$ python — docs/carta-de-fechamento.pdf
  /Count 2 · MediaBox A4 · Roboto (Regular/Bold/Italic) + Roboto Mono embutidas
  scripts/gerar-carta-pdf.py: font-size 11pt · line-height 1.15 · margin 0 0 6pt
  · text-align justify   → confere com o pedido do enunciado
```
RELATORIO
echo "OK - relatorio escrito ($(wc -l < auditoria/relatorio-final.md) linhas)" && git check-ignore -v auditoria/relatorio-final.md
```

**Test heredoc handling**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && mkdir -p auditoria && cat > auditoria/_teste.md <<'FIM'
linha com 'aspas simples' e `crase`
outra com \r e "aspas"
FIM
cat auditoria/_teste.md && rm auditoria/_teste.md && echo OK
```

**Write report part 1**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && mkdir -p auditoria && cat > auditoria/relatorio-final.md <<'PARTE1'
# Auditoria de entrega — DOC Intelligence (Trilha B)

**Quarta rodada** · auditor em contexto frio · 01/09/2026, 11h05 -03:00
**Estado auditado:** HEAD `93f7d80` ("docs: registros, carta e o PDF que passa a ser derivado"), árvore limpa.

> **Nota de método.** O repositório foi editado *durante* esta auditoria: entre o
> início e o fim, o HEAD andou de `ab6afef` para `78058bf` e depois para
> `93f7d80`, e a carta de fechamento foi reescrita duas vezes. Todos os achados
> abaixo foram **re-verificados contra `93f7d80`**. Os que a última reescrita
> corrigiu foram removidos do relatório; os que sobreviveram estão aqui com
> arquivo e linha do estado final.

---

## 1. Veredito

# APROVADO COM RESSALVAS

A entrega cumpre os cinco entregáveis obrigatórios e a arquitetura **não é
narrativa**: eu rodei as guardas e elas seguram. O hook `PreToolUse` bloqueia de
verdade (saída 2), o `gen:api` produz diff vazio, 95 testes passam, o linter
passa, o build passa, o contrato responde 409 no `If-Match` velho. Isso é raro e
vale dizer.

O que custa pontos é de outra natureza, e é sempre a mesma: **a contabilidade dos
próprios documentos.** O registro de tempo — que é a resposta a uma das quatro
perguntas obrigatórias da carta — está desatualizado e subdeclara o trabalho; o
README se contradiz sobre o número de testes dentro do parágrafo que o enunciado
exige em II.3; um documento da spec afirma uma lista virtualizada que não existe
e aponta um arquivo que não existe; e o `CLAUDE.md` ainda declara que "não há
linter neste projeto" depois de o linter existir, rodar e ser passo de CI.

Não é reprovação porque nenhuma capacidade foi fabricada. É ressalva porque o
repositório inteiro se apresenta como um exercício de "o texto corresponde ao
código", e ainda há quatro lugares em que não corresponde.

---

## 2. Resumo em cinco linhas

1. Arquitetura excelente e **verificável por comando** — costura única de rede,
   tipos gerados do contrato, registry por tipo de dado, hook que bloqueia antes
   da escrita: rodei os quatro e os quatro seguram.
2. Rastreabilidade de primeira linha: 15 ADRs com alternativas descartadas pelo
   motivo real, e 11 divergências assumidas, incluindo *"não foi decisão — foi
   omissão"*.
3. Uso de IA é o ponto mais forte: 14 prompts crus com erros de digitação
   preservados, lacunas declaradas, fronteira com plugin de terceiro declarada,
   110 comandos de auditoria exportados por script.
4. **O registro de tempo parou na madrugada de 01/09** e a carta diz "3h20 …
   terminou na madrugada" — enquanto o último commit é 10h59 do mesmo dia, depois
   de +1590 linhas, 2 ADRs, CI, hook, linter e 31 testes novos.
5. Sobram quatro divergências texto×código; nenhuma é grave isoladamente, todas
   são do tipo que este repositório se propôs a não ter.

---

## 3. Conferência dos cinco entregáveis

| # | Entregável | Estado | Evidência |
|---|---|---|---|
| II.1 | Repositório Git com histórico real | **Presente** | 31 commits, de `43688ea` (31/08 19:57) a `93f7d80` (01/09 10:59). Mensagens longas e explicativas, merges por branch, nenhum "initial" único. |
| II.2 | Spec antes do código + ADRs com alternativas | **Presente** | Tag `spec-v1` = `add134d`, 31/08 **20:14:09**; primeiro arquivo em `src/` = `eba0889`, **20:42:10** → 28 min de diferença, exatamente como o README afirma. 9 documentos de spec, 15 ADRs, 11 divergências. |
| II.3 | Fatia vertical rodando + README + parágrafo de testes | **Presente, com defeito** | `npm test` → 95/95; `npm run build` → ok; `npm run mock` + `curl` → 200/409 reais. **Mas o parágrafo exigido (`README.md:199`) diz "São 64 testes"** contra o badge e a tabela que dizem 95. |
| II.4 | Registro do uso de IA | **Presente, o melhor da entrega** | `CLAUDE.md` versionado e escrito antes; `.claude/agents/auditor-de-entrega.md`; `.claude/hooks/guarda-regras.mjs` + `settings.json`; 14 prompts íntegros; `registro-de-verificacao.md` com 8 entradas; `onde-o-agente-errou.md`. Ressalva em A-06. |
| II.5 | Carta de fechamento, ≤ 2 páginas, 4 perguntas | **Presente, com defeito** | PDF A4, `/Count 2`, Roboto embutida (Regular/Bold/Italic), 11pt, entrelinha 1,15, 6pt entre parágrafos, justificado — confere com o enunciado. As quatro perguntas são respondidas. **A quarta resposta está errada** (ver A-01). |

---
PARTE1
echo "parte1 ok: $(wc -l < auditoria/relatorio-final.md) linhas"
```

**Write report part 2**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'PARTE2'

## 4. Nota por critério de pontuação

### 30% — Arquitetura e modularidade → **27 / 30**

O que eu verifiquei, e não apenas li:

- **Costura única de rede.** `grep -rn "fetch(" src/ | grep -v shared/api/`
  devolve uma única linha, `PaginaConferencia.tsx:171`, que é
  `documento.refetch()` do TanStack Query — não é rede. A regra vale.
- **Nenhum tipo de documento no front-end.** A varredura de
  `tests/arquitetura/fronteiras.test.ts:63` passa; as ocorrências de "RG" e
  "contracheque" em `src/` estão em comentário (`shared/api/http.ts:55`) ou em
  `types.gen.ts` gerado — e o teste remove comentários antes de varrer, o que é
  a decisão certa e está justificada em V-004.
- **A promessa central é testada.** `tests/features/conferencia.test.tsx`, caso
  "T-03 — o front-end renderiza um tipo de documento que NUNCA viu", passa. É o
  teste que sustenta "adicionar um tipo custa zero linhas de front-end".
- **Tipos gerados, não escritos.** `npm run gen:api` seguido de
  `git diff --exit-code -- src/shared/api/types.gen.ts` → **saída 0, diff
  vazio**. E há passo de CI que falha se não for assim
  (`.github/workflows/ci.yml`, "Os tipos correspondem ao contrato").
- **Seis costuras nomeadas** existem de fato em `04-arquitetura.md:40–92`, cada
  uma com o custo da troca.

Desconto: ver A-03 (afirmação de lista virtualizada apontando arquivo
inexistente, num documento que foi editado nesta rodada).

### 20% — Rastreabilidade das decisões → **17,5 / 20**

15 ADRs, todas com "Alternativas descartadas" pelo motivo real e "Como saberemos
que erramos". A ADR-015 descarta "baixar o limiar" com o argumento certo — *"não
resolve o caso, que é justamente alta confiança com valor errado; nenhum limiar
pega isso, por definição"*. A D-10 é o ponto alto do documento inteiro: havia a
saída fácil de acrescentar um parâmetro ao contrato para tornar a frase
verdadeira, e o candidato recusou por escrito, nomeando o motivo. É exatamente o
que o enunciado quer ler quando diz "queremos ler sobretudo o que você não fez".

Descontos: A-04 (`Dialogo.tsx:24` cita a divergência errada), A-05
(`CLAUDE.md:102` contradiz a D-08 fechada), A-08 (D-09 diz "seis asserções",
são sete).

### 20% — Uso de IA como ferramenta de engenharia → **18 / 20**

Grau de controle alto e demonstrável:

- O `CLAUDE.md` foi escrito antes e tem **oito regras derivadas dos fatos do
  ambiente**, cada uma com o fato entre parênteses. Não é estilo, é projeto.
- **O hook não é decorativo.** Exercitei o contrato (JSON na entrada padrão)
  com seis casos: `fetch(` em `src/features/` → **saída 2**; `fetch(` em
  `src/shared/api/` → 0; nome de tipo em `src/features/` → **2**; o mesmo em
  `src/mocks/` → 0; `Edit` com `new_string` contendo nome de tipo → **2**;
  documento fora de `src/` → 0. Funciona exatamente como está escrito.
- **A lista de termos não está duplicada**, e há um teste
  (`fronteiras.test.ts:79`) que falha se o hook passar a guardar cópia própria.
  Essa é uma decisão de engenharia de verdade, não enfeite.
- **Prompts crus.** `0007` traz "produzirdo"; `0001` traz "ficticios",
  "analise", "RESALVAS"; `0003` traz "raciocinio". Não foram reescritos.
- **Lacunas declaradas.** `docs/ia/README.md:29-41` assume que os prompts 0010 e
  0012 foram recriados, e que recriar não é o mesmo que ter gravado no ato.
- **Fronteira com terceiros declarada.** `docs/ia/README.md:52-64` separa
  Superpowers/ECC (pré-instalados, "ferramenta, como o editor") do que foi
  autorado para a prova. Não há reivindicação indevida de plugin de terceiro.
- **V-008 admite que o agente fabricou evidência** — a medição que virou uma
  busca pela letra "r". Registrar um achado inventado do próprio agente é o tipo
  de honestidade que não se simula.

Desconto: A-06 (o parágrafo obrigatório `onde-o-agente-errou.md` não incorporou
os três erros da última rodada, incluindo o mais instrutivo de todos) e A-07
("Os 12 prompts" no README; são 14).

### 15% — Especificação e método → **13 / 15**

A ordem está provada por `git log`, não afirmada: `spec-v1` 28 minutos antes do
primeiro `src/`. Os documentos 00–04 e 06 continuam **byte a byte como estavam na
tag** (`git log spec-v1..HEAD -- <arquivo>` devolve zero commits para cada um),
que é literalmente o que o enunciado pede: "entregue a especificação como estava
e diga onde divergiu". O plano em 16 tarefas existe e é anterior ao código.

Desconto: `05-fatos-do-ambiente.md` **foi editado depois da tag** (commit
`78058bf`). As adições estão marcadas "Acrescentado em 01/09", o que é honesto —
mas o documento deixou de ser "a spec como estava", e a edição passou ao lado de
uma afirmação falsa que estava na mesma seção (A-03). Também deixou obsoleta a
referência de linha da D-06 (`08-divergencias.md:115` aponta
`05-fatos-do-ambiente.md:204`; hoje é a linha 252).

### 15% — Atenção e proatividade → **14 / 15**

Os sete fatos são tratados, com risco residual em cada um — e os riscos residuais
são específicos, não genéricos. Exemplo que confirmei: *"o zoom automático do iOS
ao focar um campo com fonte menor que 16 px — este é um defeito conhecido do
nosso CSS, que usa 14 px nos campos"*; de fato `estilos.css:135` usa
`font-size: 14px` e o bloco de 760 px (`:231`) não o sobrepõe. Declarar um
defeito próprio com a linha do CSS junto é o oposto de esconder.

O segundo portão (ADR-015) e a pressão da fila (fato e) são adições proativas
legítimas, derivadas dos números do próprio enunciado, e estão ligadas à
interface — não são código órfão: `PainelDeCampos.tsx:40`,
`PaginaFilaConferencia.tsx:61,111`.

Desconto: A-09 (o próprio README erra a contagem do tratamento dos fatos).

### **Total: 89,5 / 100**

---
PARTE2
echo "parte2 ok: $(wc -l < auditoria/relatorio-final.md) linhas"
```

**Write report part 3**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'PARTE3'

## 5. Os sete fatos do ambiente

| Fato | Situação | Evidência verificada |
|---|---|---|
| **(a)** modelo lento, cobrado, instável | **Resolvido + risco registrado** | `shared/api/http.ts:95` — `const tentativas = metodo === 'GET' ? 3 : 1`: retry **só** em GET, nunca no que dispara o modelo. Estados `FALHOU` e `EXPIRADO` de primeira classe (`mocks/dados.ts:379-380` semeia os dois). Reprocessar exige confirmação que informa o custo. **Segundo portão** independente do fornecedor em `entities/documento/validacao-de-campo.ts`. Risco: sem alerta de taxa de falha; só 3 dos 6 tipos de dado têm regra — declarado em `05-fatos:75-79`. |
| **(b)** foto de celular, nome lixo | **Resolvido + risco registrado** | Whitelist e teto em `features/upload/validacao.ts`; redução e EXIF em `shared/lib/imagem.ts`; identidade por hash em `shared/lib/hash.ts`. Responsividade a 360 px em `estilos.css:231-290`, alvos de 44 px. Risco **HEIC** assumido e explicado; riscos novos "verificado no navegador, não em aparelho" e zoom do iOS declarados em `05-fatos:141-148`. |
| **(c)** duplicatas | **Resolvido + risco registrado** | Duas camadas: cliente (`features/upload/deduplicacao.ts`) e servidor (`200` com `duplicado: true`). Risco de duplicata perceptual declarado em `05-fatos:180-185`. |
| **(d)** dado pessoal sensível | **Resolvido + risco registrado** | `grep -rniE "localstorage|sessionstorage|indexeddb" src/` → **vazio**. Rotas só com ID opaco (`router.tsx:21`). Sanitização de PII em `http.ts`. `FronteiraDeErro.tsx:55-61` **não mostra e não envia** `erro.message`, com o motivo escrito — e há teste que verifica (`fronteira-de-erro.test.tsx:63`). Risco: sem trilha de auditoria de leitura. |
| **(e)** pico de 800 | **Tratado + risco registrado** | Polling em lote (`usePollingLote.ts`), backoff (`backoff.ts`, 6 testes), concorrência 3 (`filaDeEnvio.ts:7`), paginação por cursor. Pressão da fila no cabeçalho, com os limites derivados por escrito em `entities/documento/fila.ts:13-32`. **Ressalva:** a lista **não é virtualizada** — assumido em D-06, mas ainda afirmado como feito em `05-fatos:252` (ver A-03). |
| **(f)** troca de modelo e prompts | **Resolvido** | Schema vindo de `GET /tipos-documento`, registry por `TipoDeDado`, `modelo` e `versaoPrompt` por documento (confirmei na resposta do mock: `"modelo":"fornecedor-vision-2.1","versaoPrompt":"rg-v4"`). Guardado por teste **e** por hook **e** por CI. É o fato mais bem tratado da entrega. |
| **(g)** dois conferentes | **Resolvido + risco registrado** | Dois mecanismos para dois problemas distintos: claim com TTL e trava otimista. Verifiquei contra o mock: `POST /{id}/conferencia/claim` → 200; `PATCH` com `If-Match: 999` → **409** com `documentoAtual` e `alteradoPor`. O teste T-01 verifica as quatro propriedades ao mesmo tempo. Risco de degradação anônima declarado. |

**Nenhum fato foi ignorado.** Os sete estão tratados e os sete têm risco residual
escrito — que é mais do que o README declara sobre si mesmo (ver A-09).

---

## 6. Achados, do mais grave ao mais leve

### A-01 — GRAVE. O registro de tempo não cobre a última rodada, e a carta responde errado a uma pergunta obrigatória

**Arquivos:** `docs/ia/registro-de-tempo.md:23,25` · `docs/carta-de-fechamento.md:89-92`

A tabela termina na **Fase 8 — auditoria e correções**, `21:55 → ver último
commit`, `~0h50`, com a observação *"duas rodadas de auditoria e as correções"*.
O total declarado é **3h20** — e a soma da coluna, aliás, está correta (200 min).
A carta repete: *"3h20 de trabalho efetivo … terminou na madrugada do dia
seguinte"*.

O que o `git log` mostra depois da madrugada:

```
c37136c 2026-09-01 09:16:24  docs: registra o prompt 0014
4f88de3 2026-09-01 09:39:21  fix: fecha os defeitos do Bloco 1 e os fatos (a),(b),(e)
78058bf 2026-09-01 10:48:11  feat: CI, hook PreToolUse, linter, capturas, contrato exercitavel
93f7d80 2026-09-01 10:59:27  docs: registros, carta e o PDF que passa a ser derivado
```

Só o `4f88de3` são **+1590 / −100 linhas** em 29 arquivos, com 2 ADRs novas, 5
arquivos novos em `src/` e 17 testes novos. O `78058bf` acrescentou CI, hook,
linter, `.gitattributes`, `exemplos.http` e duas capturas. A suíte foi de 64 para
95 testes. Nada disso está no registro de tempo, e a fase 8 continua dizendo
"duas rodadas de auditoria" quando houve três internas mais uma externa.

**Por que importa mais do que parece.** "Quanto tempo isso tudo levou" é uma das
quatro perguntas que o enunciado obriga a carta a responder, e a carta manda o
avaliador conferir o arquivo — *"somando a coluna de duração de
`docs/ia/registro-de-tempo.md`"*. Quem somar encontra 3h20 e encontra, ao lado,
um `git log` de dez horas de calendário. E o parágrafo imediatamente abaixo é o
que explica, por três vezes, por que esse arquivo não pode conter número
desatualizado: *"um documento que se apresenta como relógio real não pode conter
estimativa disfarçada"*.

É a **quarta ocorrência do mesmo defeito no mesmo arquivo**, e a primeira em que
o erro não é o número escrito e sim o número **não escrito**. O padrão que o
próprio candidato nomeou — "o defeito está no vizinho aritmético, ou no outro
documento que o cita" — se aplica com precisão: a carta foi reescrita às 10h54 e
o registro de tempo que ela cita não foi tocado.

---

### A-02 — GRAVE (e barato). O README se contradiz sobre o número de testes, dentro do parágrafo exigido pelo enunciado

**Arquivos:** `README.md:4` · `README.md:71` · `README.md:122` · `README.md:173` · `README.md:199`

```
  4: ![Testes](.../badge/testes-95-brightgreen)
 71: npm test                    # 64 testes, inclusive as guardas de arquitetura
122: | `npm test` | 95 testes, incluindo as guardas de arquitetura |
173: tests/           95 testes, incluindo guardas de arquitetura
199: São 64 testes, e o critério para escrevê-los não foi cobertura: ...
```

Saída real:

```
 Test Files  16 passed (16)
      Tests  95 passed (95)
```

Duas agravantes. A primeira: a linha 71 está dentro do bloco intitulado
**"Confira que o texto corresponde ao código"**, precedido de *"Não acredite;
rode:"*. O avaliador que aceitar o convite roda `npm test`, vê 95, e descobre que
o convite estava errado — na linha que o fazia. A segunda: a linha 199 abre **o
parágrafo que o item II.3 do enunciado exige explicitamente** ("um parágrafo
dizendo o que você escolheu testar, e por quê"). É o pior lugar possível para um
número errado.

No mesmo parágrafo, `README.md:211` diz "cinco testes de arquitetura";
`tests/arquitetura/fronteiras.test.ts` reporta **sete**. E `README.md:167` ainda
diz "13 decisões" enquanto `README.md:83`, corrigido nesta rodada, já diz 15 — o
vizinho outra vez.

**Registro o que é verdade no mesmo parágrafo**, porque o conteúdo é bom: a
afirmação sobre "contar as chamadas que *não* foram feitas" tem lastro em
`conferencia.test.tsx:166-184` (`expect(reprocessamentos).toBe(0)`), e o teste do
tipo de documento inédito existe e passa. Só os números estão errados.

---

### A-03 — MÉDIO-GRAVE. A lista virtualizada continua afirmada como feita, apontando um arquivo que não existe — num documento editado nesta rodada

**Arquivo:** `docs/spec/05-fatos-do-ambiente.md:252` e `:257`

```
252: - **Lista virtualizada** e paginação por cursor. O DOM não cresce com a fila.
257: `features/review/ListaVirtualizada.tsx`
```

`grep -rni "virtualiz" src/ tests/` → **zero ocorrências**.
`src/features/review/ListaVirtualizada.tsx` → **não existe**.

A defesa natural é "a spec está congelada e a divergência está na D-06". Ela não
se sustenta aqui, por duas razões:

1. **Este arquivo não está congelado.** `git log spec-v1..HEAD --
   docs/spec/05-fatos-do-ambiente.md` devolve o commit `78058bf`, **desta
   rodada**. Os outros seis documentos da spec devolvem zero: este foi o único
   editado.
2. **A edição foi na mesma seção.** O bloco "Acrescentado em 01/09 — a fila diz
   o próprio tamanho" foi inserido em `:259`, sete linhas abaixo da afirmação
   falsa, dentro do mesmo fato (e). O autor releu a vizinhança, escreveu ao lado
   e não viu.

Efeito colateral: a D-06 cita *"`05-fatos-do-ambiente.md:204`"*
(`08-divergencias.md:115`); com a edição, virou a linha 252. A referência que
existe justamente para permitir a conferência não confere mais.

---

### A-04 — MÉDIO. `Dialogo.tsx` aponta a divergência errada

**Arquivo:** `src/shared/ui/Dialogo.tsx:24`

```
 * Por que não `<dialog>` nativo: o jsdom não implementa `showModal()`, e a
 * conferência é a tela mais testada da entrega. Trocar cobertura de teste por
 * ~40 linhas de foco não compensa aqui. Registrado em D-10.
```

D-10 é *"o texto afirmava busca especificada; o contrato não tem parâmetro de
termo"*. A divergência do `aria-modal` é a **D-11**, e é lá que a alternativa
`<dialog>` nativo está de fato registrada (`08-divergencias.md:308-314`).

Importa porque rastreabilidade vale 20% e depende de o ponteiro apontar para o
lugar certo. Quem seguir o ponteiro cai num texto sobre busca e conclui que o
comentário é enfeite.

---

### A-05 — MÉDIO. O `CLAUDE.md` ainda diz que o projeto não tem linter

**Arquivo:** `CLAUDE.md:102`

```
- [ ] `npm run typecheck` passa (não há linter neste projeto — ver D-08)
```

Mas `npm run lint` existe (`package.json:14`), roda, **passa com saída 0**, e é
passo obrigatório de CI (`.github/workflows/ci.yml`, "Linter (fecha a D-08)"). A
própria D-08 está marcada **"### FECHADA em 01/09/2026"**
(`08-divergencias.md:183`).

O `CLAUDE.md` é entregável explícito do item II.4 e é a "definição de pronto" que
governa o trabalho. Ele agora subdeclara o rigor do próprio projeto e aponta para
uma divergência fechada. É o caso mais limpo de "o outro documento que cita o
item corrigido": fecharam a D-08 e não voltaram ao arquivo que a referenciava.

---

### A-06 — MÉDIO. O parágrafo obrigatório sobre os erros do agente não inclui os erros desta rodada — inclusive o mais instrutivo

**Arquivos:** `docs/ia/onde-o-agente-errou.md` (integral) · `docs/ia/registro-de-verificacao.md:244-271`

O enunciado (II.4, terceiro travessão) pede "um parágrafo sobre onde o agente
errou, como você percebeu e o que fez a respeito". O arquivo existe, é bom, e
termina em `:44-51` com "A quarta correção não foi minha" — a primeira auditoria.

A V-008 registra **três erros novos do agente**, e o terceiro é o mais valioso da
entrega inteira:

> *"O agente afirmou ter encontrado um defeito que não existia. … A medição que
> sustentava a afirmação era uma contagem que, depois de passar pelo shell, virou
> uma busca pela letra 'r'. … é o **oposto** dos anteriores: não foi omissão, foi
> um achado inventado com aparência de evidência."*

Um agente que fabrica evidência é a falha mais difícil de perceber e a mais cara
de confiar — e ela está só no registro de verificação, não no parágrafo que o
enunciado manda ler. O parágrafo, hoje, ainda afirma "As três correções de rumo
desta entrega foram todas minhas", o que a última rodada contradiz.

Não é desonestidade (o fato está registrado dois arquivos ao lado). É ponto
perdido por não estar onde o avaliador vai procurar.

---

### A-07 — LEVE. Contagens residuais no README

| Linha | Diz | É | Verificação |
|---|---|---|---|
| 167 | `docs/adr/  13 decisões` | **15** | 15 arquivos `0NN-*.md`; `docs/adr/README.md:19-33` indexa 15 |
| 199 | "São 64 testes" | **95** | saída do vitest |
| 211 | "cinco testes de arquitetura" | **7** | `fronteiras.test.ts (7 tests)` |
| 226 | "Os 12 prompts" | **14** | `ls docs/ia/prompts/` = 14 arquivos, 0001–0014 |
| 242 | "Rodei três vezes." | contradiz `:230` e `:248` ("as quatro rodadas") | 4 arquivos em `transcricao/auditorias/`, um deles interrompido |

A linha 242 é defensável (três rodadas *completas*, quatro *tentativas*), mas
convive a seis linhas de "quatro rodadas" e a carta agora diz "quatro vezes". Ou
se alinha, ou se explica no lugar.

**Contagens que conferi e que estão certas** — registro porque a maioria está:
"seis costuras" (`04-arquitetura.md:40-92`), "seis premissas"
(`00-visao-e-escopo.md:65-70`), "16 tarefas" (T1–T16 no plano), "nove
requisições" (`exemplos.http`, 9 verbos HTTP), "dez documentos — seis
aguardando, um FALHOU, um EXPIRADO" (`mocks/dados.ts:362-381`; o `curl` devolveu
exatamente 6 na fila), "110 comandos" (5+44+24+37 blocos = 110, exato), "28
minutos" antes do primeiro `src/`.

---

### A-08 — LEVE. D-09 diz "seis asserções"; são sete

**Arquivo:** `docs/spec/08-divergencias.md:211`

`tests/arquitetura/fronteiras.test.ts` reporta `(7 tests)`. A sétima é a que
verifica que o hook não guarda cópia própria da lista de termos — acrescentada
nesta rodada e das mais interessantes do repositório. Contar a menos subvende o
próprio trabalho.

---

### A-09 — LEVE. O README erra a contagem do tratamento dos próprios fatos

**Arquivo:** `README.md:62-63`

> "Três foram resolvidos, quatro foram tratados *e* deixaram risco registrado."

A tabela-resumo de `05-fatos-do-ambiente.md:387-395` tem **as duas colunas
preenchidas nos sete fatos**. Não há três "só resolvidos". A frase subvende: o
correto — e mais forte diante do critério de 15% — seria "os sete foram tratados,
e os sete deixaram risco residual escrito".

---

### A-10 — COSMÉTICO. `npm run build` suja a árvore

**Arquivo:** `.gitignore`

`npm run build` (`tsc -b && vite build`) gera `tsconfig.tsbuildinfo` na raiz.
`git check-ignore -v tsconfig.tsbuildinfo` → **saída 1** (não ignorado). Quem
seguir o README e rodar o build fica com `?? tsconfig.tsbuildinfo` no `git
status`. `dist/` está ignorado; o `tsbuildinfo` escapou.

---
PARTE3
echo "parte3 ok: $(wc -l < auditoria/relatorio-final.md) linhas"
```

**Write facts section**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'PARTE3A'

## 5. Os sete fatos do ambiente

Legenda: **R** = resolvido · **RR** = tratado e com risco residual declarado ·
**I** = ignorado. Nenhum fato ficou em **I**.

### (a) O modelo leva 5–40 s, é cobrado por documento e às vezes falha — **R + RR**

- `shared/api/http.ts:95` — o número de tentativas é 3 apenas quando o método é
  GET, e 1 em qualquer outro. Retry nunca toca no que dispara o modelo.
- `FALHOU` e `EXPIRADO` são estados de primeira classe, e o mock semeia os dois
  (`mocks/dados.ts:379-380`) para que apareçam sem depender de sorte.
- Reprocessar exige confirmação que informa o custo.
- Segundo portão independente do fornecedor:
  `entities/documento/validacao-de-campo.ts`.
- **Risco declarado** (`05-fatos:75-79`): sem alerta de taxa de falha; só 3 dos
  6 tipos de dado têm regra de formato.

### (b) Foto de celular, nome de arquivo arbitrário — **R + RR**

- Whitelist e teto em `features/upload/validacao.ts`; redução e EXIF em
  `shared/lib/imagem.ts`; identidade pelo hash em `shared/lib/hash.ts`.
- Responsividade a 360 px em `estilos.css:231-290`, com alvos de 44 px.
- **Risco declarado** (`05-fatos:128-148`): HEIC recusado; verificação feita no
  navegador e não em aparelho; zoom do iOS com fonte de 14 px — confirmei que
  `estilos.css:135` usa mesmo 14 px e o bloco de 760 px não o sobrepõe.

### (c) O mesmo documento chega mais de uma vez — **R + RR**

- Duas camadas: cliente (`features/upload/deduplicacao.ts`) e servidor
  (resposta 200 com `duplicado: true`, sem disparar processamento).
- **Risco declarado** (`05-fatos:180-185`): duplicata perceptual do mesmo papel.

### (d) Dado pessoal, parte dele sensível — **R + RR**

- Busca por localStorage, sessionStorage e indexedDB em `src/` devolve **vazio**.
- Rotas só com ID opaco (`router.tsx:21`). Sanitização de PII em `http.ts`.
- `FronteiraDeErro.tsx:55-61` não mostra e não envia `erro.message`, com o motivo
  escrito no cabeçalho do arquivo — e `fronteira-de-erro.test.tsx:63` verifica
  que o valor sensível não chega à tela.
- **Risco declarado**: sem trilha de auditoria de leitura.

### (e) 150/dia, mais de 800 no pico — **R + RR**

- Polling em lote (`usePollingLote.ts`), backoff (`backoff.ts`, 6 testes),
  concorrência de upload em 3 (`filaDeEnvio.ts:7`), paginação por cursor.
- Pressão da fila no cabeçalho, com os dois limites derivados por escrito em
  `entities/documento/fila.ts:13-32` a partir dos números do enunciado.
- **Risco declarado**: sem priorização; os limites moram no cliente e deveriam
  vir do contrato.
- **Ressalva minha:** a lista **não é virtualizada** — assumido na D-06, mas
  ainda afirmado como feito em `05-fatos:252`. Ver A-03.

### (f) O modelo será trocado e os prompts vão mudar — **R**

- Schema vindo de `GET /tipos-documento`; registry por tipo de dado; `modelo` e
  `versaoPrompt` por documento — confirmei na resposta real do mock:
  `fornecedor-vision-2.1` / `rg-v4`.
- Guardado por teste (T-03), por hook e por CI. É o fato mais bem tratado.

### (g) Duas pessoas abrem a fila ao mesmo tempo — **R + RR**

- Dois mecanismos para dois problemas distintos: claim com TTL de 5 min contra o
  desperdício, trava otimista contra a perda.
- Verifiquei contra o mock: `POST /documentos/doc-1/conferencia/claim` → **200**;
  `PATCH /documentos/doc-1/campos` com `If-Match: 999` → **409**, com
  `documentoAtual` e `alteradoPor` no corpo.
- O teste T-01 verifica as quatro propriedades ao mesmo tempo.
- **Risco declarado**: degradação anônima se o host não enviar identidade.

> **Nenhum fato foi ignorado.** Os sete estão tratados e os sete têm risco
> residual escrito — que é *mais* do que o README declara sobre si mesmo (A-09).

---
PARTE3A
echo "3a ok: $(wc -l < auditoria/relatorio-final.md)"
```

**Write findings A-01 to A-06**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'PARTE4'

## 6. Achados, do mais grave ao mais leve

### A-01 — GRAVE. O registro de tempo não cobre a última rodada, e a carta responde errado a uma das quatro perguntas obrigatórias

**Arquivos:** `docs/ia/registro-de-tempo.md:23,25` ·
`docs/carta-de-fechamento.md:89-92`

A tabela termina na **Fase 8 — auditoria e correções**,
`21:55 → ver último commit`, `~0h50`, com a observação
*"duas rodadas de auditoria e as correções"*. O total declarado é **3h20** — e a
soma da coluna, aliás, está correta: 200 minutos. A carta repete:
*"3h20 de trabalho efetivo … terminou na madrugada do dia seguinte"*.

O que o `git log` mostra **depois** dessa madrugada:

```
c37136c 2026-09-01 09:16:24  docs: registra o prompt 0014
4f88de3 2026-09-01 09:39:21  fix: fecha os defeitos do Bloco 1 e os fatos (a),(b),(e)
78058bf 2026-09-01 10:48:11  feat: CI, hook PreToolUse, linter, capturas, contrato
93f7d80 2026-09-01 10:59:27  docs: registros, carta e o PDF que passa a ser derivado
```

Só o `4f88de3` são **+1590 / −100 linhas** em 29 arquivos, com 2 ADRs novas, 5
arquivos novos em `src/` e 17 testes novos. O `78058bf` acrescentou CI, hook,
linter, `.gitattributes`, `exemplos.http` e duas capturas de tela. A suíte foi de
64 para 95 testes. **Nada disso está no registro de tempo**, e a fase 8 continua
dizendo "duas rodadas de auditoria" quando houve três internas mais uma externa.

**Por que importa mais do que parece.** "Quanto tempo isso tudo levou" é uma das
quatro perguntas que o enunciado obriga a carta a responder, e a carta manda o
avaliador conferir o arquivo — *"somando a coluna de duração de
docs/ia/registro-de-tempo.md"*. Quem somar encontra 3h20, e encontra ao lado um
`git log` de dez horas de calendário. O parágrafo imediatamente abaixo é
justamente o que explica, por três vezes, por que esse arquivo não pode conter
número desatualizado: *"um documento que se apresenta como relógio real não pode
conter estimativa disfarçada"*.

É a **quarta ocorrência do mesmo defeito no mesmo arquivo** — e a primeira em que
o erro não é o número escrito, e sim o número **não escrito**. O padrão que o
próprio candidato nomeou (o defeito está no vizinho aritmético, ou no outro
documento que o cita) se aplica com precisão: a carta foi reescrita às 10h54, e o
registro de tempo que ela manda conferir não foi tocado.

---

### A-02 — GRAVE (e barato). O README se contradiz sobre o número de testes, dentro do parágrafo exigido pelo enunciado

**Arquivos:** `README.md:4`, `:71`, `:122`, `:173`, `:199`

```
  4: ![Testes](.../badge/testes-95-brightgreen)
 71: npm test                    # 64 testes, inclusive as guardas de arquitetura
122: | npm test | 95 testes, incluindo as guardas de arquitetura |
173: tests/           95 testes, incluindo guardas de arquitetura
199: São 64 testes, e o critério para escrevê-los não foi cobertura: ...
```

Saída real, colada:

```
 Test Files  16 passed (16)
      Tests  95 passed (95)
```

Duas agravantes.

**Primeira:** a linha 71 está dentro do bloco intitulado *"Confira que o texto
corresponde ao código"*, precedido de *"Não acredite; rode:"*. O avaliador que
aceitar o convite roda `npm test`, vê 95, e descobre que o convite estava errado
— na própria linha que o fazia. Num repositório cujo argumento central é
"verifique, não confie", errar aqui custa mais do que o número.

**Segunda:** a linha 199 abre **o parágrafo que o item II.3 exige
explicitamente** ("um parágrafo dizendo o que você escolheu testar, e por quê").
É o pior lugar possível para um número errado.

No mesmo parágrafo, `README.md:211` diz "cinco testes de arquitetura";
`tests/arquitetura/fronteiras.test.ts` reporta **sete**. E `README.md:167` ainda
diz "13 decisões" enquanto `README.md:83`, corrigido nesta mesma rodada, já diz
15 — o vizinho outra vez.

**Registro o que é verdade no mesmo parágrafo**, porque o conteúdo é bom: a
afirmação sobre contar as chamadas que *não* foram feitas tem lastro em
`conferencia.test.tsx:166-184`, onde há um contador de requisições e um
`expect(reprocessamentos).toBe(0)`. O teste do tipo de documento inédito existe e
passa. Só os números estão errados.

---

### A-03 — MÉDIO-GRAVE. A lista virtualizada continua afirmada como feita, apontando arquivo inexistente, num documento editado nesta rodada

**Arquivo:** `docs/spec/05-fatos-do-ambiente.md:252` e `:257`

```
252: - **Lista virtualizada** e paginação por cursor. O DOM não cresce com a fila.
257: `features/review/ListaVirtualizada.tsx`
```

Busca por `virtualiz` em `src/` e `tests/`: **zero ocorrências**.
`src/features/review/ListaVirtualizada.tsx`: **não existe**.

A defesa natural — "a spec está congelada e a divergência está na D-06" — não se
sustenta aqui, por duas razões:

1. **Este arquivo não está congelado.** `git log spec-v1..HEAD` para cada
   documento da spec devolve **zero** commits em 00, 01, 02, 03, 04 e 06, e
   devolve `78058bf` — **desta rodada** — para o 05. Foi o único editado.
2. **A edição foi na mesma seção.** O bloco "Acrescentado em 01/09 — a fila diz
   o próprio tamanho" entrou em `:259`, sete linhas abaixo da afirmação falsa,
   dentro do mesmo fato (e). O autor releu a vizinhança, escreveu ao lado, e não
   viu.

Efeito colateral: a D-06 cita *"05-fatos-do-ambiente.md:204"*
(`08-divergencias.md:115`); depois da edição, virou linha 252. A referência que
existe justamente para permitir a conferência já não confere.

---

### A-04 — MÉDIO. `Dialogo.tsx` aponta a divergência errada

**Arquivo:** `src/shared/ui/Dialogo.tsx:24`

O comentário que justifica não usar o elemento `dialog` nativo termina com
*"Registrado em D-10."*. D-10 é a divergência sobre **busca**. A divergência do
`aria-modal` é a **D-11**, e é lá que essa alternativa está de fato registrada
(`08-divergencias.md:308-314`).

Importa porque rastreabilidade vale 20% e depende de o ponteiro apontar para o
lugar certo. Quem seguir o ponteiro cai num texto sobre busca e conclui que o
comentário é enfeite. É, de novo, o vizinho: D-10 e D-11 nasceram no mesmo
commit.

---

### A-05 — MÉDIO. O `CLAUDE.md` ainda diz que o projeto não tem linter

**Arquivo:** `CLAUDE.md:102`

```
- [ ] npm run typecheck passa (não há linter neste projeto — ver D-08)
```

Mas `npm run lint` existe (`package.json:14`), roda, **passa com saída 0**, e é
passo obrigatório de CI (`.github/workflows/ci.yml`, passo "Linter (fecha a
D-08)"). A própria D-08 está marcada **FECHADA em 01/09/2026**
(`08-divergencias.md:183`).

O `CLAUDE.md` é entregável explícito do item II.4 e é a definição de pronto que
governa o trabalho. Hoje ele **subdeclara o rigor do próprio projeto** e aponta
para uma divergência que já foi fechada. É o caso mais limpo do padrão: fecharam
a D-08 e não voltaram ao arquivo que a citava.

---

### A-06 — MÉDIO. O parágrafo obrigatório sobre os erros do agente não inclui os erros da última rodada — inclusive o mais instrutivo de todos

**Arquivos:** `docs/ia/onde-o-agente-errou.md` ·
`docs/ia/registro-de-verificacao.md:244-271`

O enunciado (II.4, terceiro travessão) pede "um parágrafo sobre onde o agente
errou, como você percebeu e o que fez a respeito". O arquivo existe, é bom, e
termina em `:44-51` com "A quarta correção não foi minha" — a primeira auditoria.

A entrada V-008 registra **três erros novos do agente**, e o terceiro é o mais
valioso da entrega inteira: o agente **afirmou ter encontrado um defeito que não
existia**, sustentado por uma medição que, depois de passar pelo shell, virou uma
busca pela letra "r". O próprio registro classifica o caso como *"o oposto dos
anteriores: não foi omissão, foi um achado inventado com aparência de
evidência"*.

Um agente que fabrica evidência é a falha mais difícil de perceber e a mais cara
de confiar. Ela está no registro de verificação, e **não** no parágrafo que o
enunciado manda ler — que ainda afirma "As três correções de rumo desta entrega
foram todas minhas".

Não é desonestidade: o fato está registrado dois arquivos ao lado. É ponto
perdido por não estar onde o avaliador vai procurar.

---
PARTE4
echo "4 ok: $(wc -l < auditoria/relatorio-final.md)"
```

**Isolate the problematic content**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat > auditoria/_t1.md <<'FIM'
  4: ![Testes](.../badge/testes-95-brightgreen)
FIM
echo "t1 ok"; cat > auditoria/_t2.md <<'FIM'
*"3h20 de trabalho efetivo … terminou na madrugada"*
FIM
echo "t2 ok"; cat > auditoria/_t3.md <<'FIM'
busca pela letra "r". O próprio registro classifica o caso como *"o oposto"*.
FIM
echo "t3 ok"; rm -f auditoria/_t*.md
```

Let me re-verify each finding against the new commits before writing sections 6 and 7.

**Check new HEAD and re-verify A-01**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== HEAD ===" && git log --format='%h %ci %s' -4 | cat && echo && echo "=== status ===" && git status --porcelain && echo && echo "=== A-01 registro-de-tempo ===" && grep -n "Fase 8\|Fase 9\|Total:" docs/ia/registro-de-tempo.md && echo "--- carta tempo ---" && grep -n "3h20\|3h[0-9][0-9]\|madrugada" docs/carta-de-fechamento.md
```

**Re-verify all findings at new HEAD**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== A-02/A-07 README numeros ===" && grep -nE "testes-[0-9]+|[0-9]+ testes|[0-9]+ decis|[0-9]+ prompts|cinco testes|sete testes|três vezes|quatro vezes|quatro rodadas|Três foram resolvidos" README.md && echo && echo "=== A-03 virtualizada ===" && grep -n "Lista virtualizada\|ListaVirtualizada" docs/spec/05-fatos-do-ambiente.md docs/spec/08-divergencias.md && echo && echo "=== A-04 Dialogo ===" && grep -n "D-1[01]" src/shared/ui/Dialogo.tsx && echo && echo "=== A-05 CLAUDE.md ===" && grep -n "linter\|D-08" CLAUDE.md && echo && echo "=== A-06 onde-o-agente-errou ===" && grep -nc "gitattributes\|inventado\|letra" docs/ia/onde-o-agente-errou.md && echo && echo "=== A-08 D-09 assercoes ===" && grep -n "asserções" docs/spec/08-divergencias.md && echo && echo "=== A-10 gitignore ===" && grep -n "tsbuildinfo" .gitignore; echo "exit=$?"
```

**Verify remaining findings and test counts**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && echo "=== A-08 D-09 ===" ; grep -n "asser" docs/spec/08-divergencias.md ; echo "=== A-09 README 60-64 ===" ; sed -n '60,64p' README.md ; echo "=== A-10 tsbuildinfo no gitignore? ===" ; grep -n "tsbuildinfo" .gitignore || echo "NAO IGNORADO" ; echo "=== teste count atual ===" ; npx vitest run 2>&1 | tail -5 ; echo "=== fronteiras tests ===" ; npx vitest run tests/arquitetura 2>&1 | grep -E "fronteiras|Tests"
```

**Inspect uncommitted work in progress**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && git diff --stat && echo "=== diff Dialogo ===" && git diff src/shared/ui/Dialogo.tsx | head -40 && echo "=== novos testes ===" && git diff tests/features/dialogo.test.tsx | grep -E "^\+.*(it\(|describe\()"
```

**Inspect uncommitted doc fixes**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && git diff CLAUDE.md README.md docs/spec/05-fatos-do-ambiente.md docs/spec/08-divergencias.md docs/spec/04-arquitetura.md | cat
```

Found the cause — long commands get truncated. Writing in smaller chunks.

**Write findings summary table**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C1'

## 6. Achados, do mais grave ao mais leve

> **Estado de cada achado.** A auditoria foi feita contra o HEAD `93f7d80`. Enquanto
> eu escrevia, entraram `1640bcd` (11:03) e `19ec9a9` (11:06), e há trabalho não
> commitado na árvore. Cada achado abaixo traz o **estado em que o encontrei** e o
> **estado em 19ec9a9 + árvore de trabalho**, verificado de novo às 11h12. Nenhum
> foi retirado: os corrigidos ficam marcados como corrigidos, com o commit.

| # | Achado | Onde | Estado em 19ec9a9 |
|---|---|---|---|
| A-01 | Registro de tempo não cobre a última rodada | `registro-de-tempo.md:23,25` | **ABERTO** |
| A-02 | README dizia 64 testes contra 95 reais | `README.md:71,199` | corrigido em `1640bcd` |
| A-03 | Lista virtualizada afirmada, arquivo inexistente | `05-fatos:252,257` | em correção (árvore) |
| A-04 | `Dialogo.tsx` cita D-10 em vez de D-11 | `Dialogo.tsx:24` | em correção (árvore) |
| A-05 | `CLAUDE.md` diz que não há linter | `CLAUDE.md:102` | em correção (árvore) |
| A-06 | Parágrafo dos erros do agente não tem os da última rodada | `onde-o-agente-errou.md` | **ABERTO** |
| A-07 | Contagens residuais no README | `README.md:211,226` | **PARCIAL** |
| A-08 | D-09 diz seis asserções; são sete | `08-divergencias.md:211` | em correção (árvore) |
| A-09 | README erra a contagem do tratamento dos fatos | `README.md:62` | em correção (árvore) |
| A-10 | `npm run build` sujava a árvore | `.gitignore` | corrigido em `1640bcd` |

---
C1
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write A-01**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C2'

### A-01 — GRAVE, ABERTO. O registro de tempo parou na madrugada, e a carta responde errado a uma das quatro perguntas obrigatórias

**Arquivos e linhas:** `docs/ia/registro-de-tempo.md:23` e `:25` ·
`docs/carta-de-fechamento.md:89-92`

**O que o texto afirma.** A última linha da tabela é
`| Fase 8 — auditoria e correções | 21:55 | ver último commit | ~0h50* |`, com a
nota *"duas rodadas de auditoria e as correções"*. A linha 25 conclui
**"Total: 3h20"**. A carta repete, em `:89-92`: *"3h20 de trabalho efetivo,
somando a coluna de duração de docs/ia/registro-de-tempo.md … terminou na
madrugada do dia seguinte"*.

**O que o repositório mostra.** A soma da coluna está certa (200 min = 3h20). O
problema é o que a coluna não tem. Depois da madrugada:

```
c37136c 2026-09-01 09:16:24  docs: registra o prompt 0014
4f88de3 2026-09-01 09:39:21  fix: fecha os defeitos do Bloco 1 e os fatos (a),(b),(e)
78058bf 2026-09-01 10:48:11  feat: CI, hook PreToolUse, linter, capturas, contrato
93f7d80 2026-09-01 10:59:27  docs: registros, carta e o PDF que passa a ser derivado
1640bcd 2026-09-01 11:03:03  docs: corrige as contagens vencidas
19ec9a9 2026-09-01 11:06:27  docs: acentos nos artefatos novos
```

`git show 4f88de3 --stat` sozinho dá **+1590 / −100 linhas em 29 arquivos**, com
2 ADRs novas, 5 arquivos novos em `src/` e 17 testes novos. O `78058bf`
acrescentou CI, hook, linter, `.gitattributes`, `exemplos.http` e duas capturas.
A suíte foi de 64 para 95 testes. Nenhuma fase cobre isso, e a fase 8 ainda diz
"duas rodadas" quando houve três internas mais uma externa.

**Por que importa.** "Quanto tempo isso tudo levou" é uma das quatro perguntas
que o enunciado obriga a carta a responder, e a carta manda o avaliador conferir
o arquivo. Quem somar encontra 3h20 ao lado de um `git log` de dez horas de
calendário. Pior: o parágrafo imediatamente abaixo, na mesma página, é o que
explica por três vezes que *"um documento que se apresenta como relógio real não
pode conter estimativa disfarçada"*. É a **quarta ocorrência do mesmo defeito no
mesmo arquivo** — e a primeira em que o erro não é o número escrito, e sim o
número que faltou escrever. O padrão que o próprio candidato nomeou se aplica
com precisão: a carta foi reescrita às 10h54 e o arquivo que ela manda conferir
não foi tocado.

**Conserto.** Acrescentar as fases de 01/09 manhã com os carimbos dos quatro
commits, corrigir a nota da fase 8 para "três rodadas internas e uma auditoria
externa", refazer a soma, e atualizar a carta **e o PDF**.

---
C2
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write A-02**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C3'

### A-02 — GRAVE. O README se contradizia sobre o número de testes, dentro do parágrafo exigido pelo enunciado — **já corrigido em `1640bcd`**

**Arquivos e linhas, no estado auditado (`93f7d80`):**
`README.md:4`, `:71`, `:122`, `:173`, `:199`

**O que o texto afirmava.** Cinco lugares, dois números:

```
  4: badge testes-95
 71: npm test                    # 64 testes, inclusive as guardas de arquitetura
122: | npm test | 95 testes, incluindo as guardas de arquitetura |
173: tests/           95 testes, incluindo guardas de arquitetura
199: São 64 testes, e o critério para escrevê-los não foi cobertura: ...
```

**O que o código mostrava.** Saída real de `npm test`:

```
 Test Files  16 passed (16)
      Tests  95 passed (95)
```

**Por que importava.** Duas agravantes. A linha 71 estava dentro do bloco
*"Confira que o texto corresponde ao código"*, precedido de *"Não acredite;
rode:"* — o avaliador que aceitasse o convite rodaria o comando e descobriria
que o convite estava errado na própria linha que o fazia. E a linha 199 abre **o
parágrafo que o item II.3 exige explicitamente** ("um parágrafo dizendo o que
você escolheu testar, e por quê"): o pior lugar possível para um número errado.

**Estado agora.** `1640bcd` corrigiu `:71` e `:199` para 95. **Verificado.**

**Ressalva que sobrevive** (ver A-07): `README.md:211`, no mesmo parágrafo, ainda
diz "cinco testes de arquitetura", e `npx vitest run tests/arquitetura` reporta
**7 tests**.

**Aviso, não achado — o mesmo defeito está prestes a voltar.** A árvore de
trabalho já tem um teste novo em `tests/features/dialogo.test.tsx`, e
`npx vitest run` agora devolve **96**, não 95. No instante em que esse teste for
commitado, o badge da linha 4 e as linhas 71, 122, 173 e 199 ficam erradas de
novo, todas as cinco. É o quinto ciclo do mesmo padrão. **O conserto durável não
é trocar 95 por 96: é parar de escrever o número.**

**Conserto.** Trocar as cinco ocorrências por uma frase que não envelhece — "a
suíte roda em `npm test`; o critério, não o número, é o que importa" — ou gerar o
badge pela CI.

**Registro de crédito:** o restante do parágrafo é verdadeiro e eu conferi. A
afirmação de "contar as chamadas que não foram feitas" tem lastro em
`tests/features/conferencia.test.tsx:166-184`, que instala um contador em
`request:start` e afirma `expect(reprocessamentos).toBe(0)`. O teste do tipo de
documento inédito (T-03) existe e passa.

---
C3
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write A-03 and A-04**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C4'

### A-03 — MÉDIO-GRAVE. Lista virtualizada afirmada como feita, apontando arquivo que não existe, num documento editado nesta rodada

**Arquivos e linhas:** `docs/spec/05-fatos-do-ambiente.md:252` e `:257` ·
referência cruzada em `docs/spec/08-divergencias.md:115`

**O que o texto afirma.**

```
252: - **Lista virtualizada** e paginação por cursor. O DOM não cresce com a fila.
257: `features/review/ListaVirtualizada.tsx`
```

**O que o código mostra.** Busca por `virtualiz` em `src/` e `tests/`: **zero
ocorrências**. `src/features/review/ListaVirtualizada.tsx`: **não existe** — a
pasta tem `useFilaDeConferencia.ts`, que é paginação por cursor, e a lista é um
`itens.map(...)`.

**Por que importa, e por que a defesa óbvia não funciona.** A resposta natural
seria "a spec está congelada e a divergência está na D-06". Ela não vale aqui:

1. **Este arquivo não está congelado.** Rodei `git log spec-v1..HEAD` para cada
   documento da spec: devolve **zero** commits em 00, 01, 02, 03, 04 e 06, e
   devolve `78058bf` para o 05. Foi o único dos sete editado depois da tag.
2. **A edição foi dentro da mesma seção.** O bloco novo "Acrescentado em 01/09 —
   a fila diz o próprio tamanho" entrou em `:259`, **sete linhas abaixo** da
   afirmação falsa, no mesmo fato (e). O autor releu a vizinhança, escreveu ao
   lado e não viu.

**Efeito colateral.** `08-divergencias.md:115` cita
*"05-fatos-do-ambiente.md:204"*; com a edição a linha virou 252. A referência
que existe para permitir a conferência deixou de conferir.

**Estado agora.** A árvore de trabalho já traz a correção: a frase foi riscada
com `~~`, com a nota de que a spec é entregue como estava, e o caminho
inexistente foi marcado como tal, com `useFilaDeConferencia.ts` ao lado.
`04-arquitetura.md:119` também recebeu a ressalva. **Falta ainda acertar a
referência de linha na D-06.**

**Conserto.** Já aplicado na árvore; resta trocar `05-fatos-do-ambiente.md:204`
por `:252` em `08-divergencias.md:115`.

---

### A-04 — MÉDIO. `Dialogo.tsx` aponta a divergência errada

**Arquivo e linha:** `src/shared/ui/Dialogo.tsx:24`

**O que o texto afirma.** O comentário que justifica não usar o elemento
`dialog` nativo termina com *"Registrado em D-10."*

**O que o repositório mostra.** D-10 é *"o texto afirmava busca especificada; o
contrato não tem parâmetro de termo"*. A divergência do `aria-modal` é a
**D-11**, e é lá — `08-divergencias.md:308-314` — que a alternativa do `dialog`
nativo está de fato registrada, com o motivo do jsdom.

**Por que importa.** Rastreabilidade vale 20% e depende de o ponteiro apontar
para o lugar certo. Quem seguir o ponteiro cai num texto sobre busca e conclui
que o comentário é enfeite. É o padrão de novo: D-10 e D-11 nasceram no mesmo
commit, e o vizinho levou a referência.

**Estado agora.** Corrigido na árvore de trabalho para D-11. **Verificado.**

**Conserto.** Já aplicado.

---
C4
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write A-05 and A-06**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C5'

### A-05 — MÉDIO. O `CLAUDE.md` ainda dizia que o projeto não tem linter

**Arquivo e linha:** `CLAUDE.md:102`

**O que o texto afirmava.** Na definição de pronto:
`- [ ] npm run typecheck passa (não há linter neste projeto — ver D-08)`

**O que o repositório mostra.** `npm run lint` existe (`package.json:14`,
`oxlint --deny-warnings`), roda e **passa com saída 0** — colei a saída. É passo
obrigatório de CI (`.github/workflows/ci.yml`, passo "Linter (fecha a D-08)"). E
a própria D-08 está marcada **FECHADA em 01/09/2026**
(`docs/spec/08-divergencias.md:183`).

**Por que importa.** O `CLAUDE.md` é entregável explícito do item II.4 e é a
definição de pronto que governa o trabalho do agente. Ele passou a **subdeclarar
o rigor do próprio projeto** e a apontar para uma divergência já fechada. É o
caso mais limpo do padrão nesta rodada: fecharam a D-08 e não voltaram ao
arquivo que a citava — e esse arquivo é justamente o que o avaliador lê para
julgar o critério de 20% de uso de IA.

**Estado agora.** Corrigido na árvore de trabalho: as duas verificações passaram
a constar, com a nota de que são passo de CI e de que a D-08 está fechada.

**Conserto.** Já aplicado.

---

### A-06 — MÉDIO, ABERTO. O parágrafo obrigatório sobre os erros do agente não inclui os da última rodada — inclusive o mais instrutivo de todos

**Arquivos:** `docs/ia/onde-o-agente-errou.md` (integral, 58 linhas) ·
comparar com `docs/ia/registro-de-verificacao.md:244-271`

**O que o texto afirma.** O arquivo termina em `:44-51` com *"A quarta correção
não foi minha, e é a mais interessante"* — a primeira auditoria — e afirma em
`:41-42` que *"As três correções de rumo desta entrega foram todas minhas, e
nenhuma delas era técnica"*.

**O que o repositório mostra.** A entrada V-008, escrita horas depois, registra
**três erros novos do agente**, e o terceiro não tem paralelo no arquivo: o
agente **afirmou ter encontrado um defeito que não existia** ao escrever o
`.gitattributes`, sustentado por uma medição que, depois de passar pelo shell,
virou uma busca pela letra "r". O próprio registro classifica o caso como *"o
oposto dos anteriores: não foi omissão, foi um achado inventado com aparência de
evidência"*. Busca por `gitattributes`, `inventado` ou `letra` em
`onde-o-agente-errou.md`: **zero ocorrências**.

**Por que importa.** O enunciado (II.4, terceiro travessão) pede "um parágrafo
sobre onde o agente errou, como você percebeu e o que fez a respeito", e é esse
o arquivo que o avaliador vai abrir. Um agente que fabrica evidência é a falha
mais difícil de perceber e a mais cara de confiar — é o melhor material da
entrega inteira sobre conduzir agente, e está no arquivo errado. Não é
desonestidade: o fato está registrado dois arquivos ao lado. É ponto perdido por
não estar onde o critério manda procurar.

**Conserto.** Acrescentar três a cinco linhas ao final do parágrafo: o agente
afirmou um defeito inexistente com aparência de evidência, você percebeu
refazendo a medição, manteve o artefato por outro motivo e reescreveu a
justificativa. E corrigir "as três correções de rumo foram todas minhas".

---
C5
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write A-07 to A-10**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C6'

### A-07 — LEVE, PARCIAL. Contagens residuais no README

**Arquivo:** `README.md`. Estado auditado em `93f7d80`, revisto em `19ec9a9`.

| Linha | Dizia | É | Como verifiquei | Estado |
|---|---|---|---|---|
| 167 | `docs/adr/  13 decisões` | **15** | 15 arquivos `0NN-*.md`; `docs/adr/README.md:19-33` indexa 15 | corrigido em `1640bcd` |
| 242 | "Rodei três vezes" contra `:230` e `:250` ("quatro rodadas") | — | 4 arquivos em `transcricao/auditorias/` | corrigido em `1640bcd` |
| 211 | "cinco testes de arquitetura" | **7** | `npx vitest run tests/arquitetura` → `7 tests` | **ABERTO** |
| 226 | "Os 12 prompts" | **14** | `ls docs/ia/prompts/` → 0001 a 0014 | **ABERTO** |

**Por que importa.** As duas que sobram estão nos parágrafos dos critérios de
15% (o que escolhi testar) e de 20% (uso de IA). A do prompt é a mais infeliz das
duas: o repositório tem **14 prompts íntegros com erros de digitação
preservados** — que é o item mais forte do II.4 — e o README subvende dois deles.
Os dois que faltam na conta são justamente o 0013 e o 0014, os da auditoria.

**Conserto.** `README.md:211` → "sete testes de arquitetura";
`README.md:226` → "Os 14 prompts".

---

### A-08 — LEVE. D-09 dizia seis asserções; são sete

**Arquivo e linha:** `docs/spec/08-divergencias.md:211`

**O que o texto afirmava.** *"a guarda existe e funciona —
tests/arquitetura/fronteiras.test.ts, seis asserções, todas passando"*.

**O que o código mostra.** `npx vitest run tests/arquitetura` →
`fronteiras.test.ts (7 tests)`.

**Por que importa.** A sétima é a que verifica que o hook **não guarda cópia
própria** da lista de termos — acrescentada nesta rodada, e das decisões mais
interessantes do repositório. Contar a menos subvende o próprio trabalho, e num
documento cuja função é ser a contabilidade honesta da entrega.

**Estado agora.** Corrigido na árvore de trabalho para "sete asserções".

**Conserto.** Já aplicado.

---

### A-09 — LEVE. O README errava a contagem do tratamento dos próprios fatos

**Arquivo e linhas:** `README.md:62-63`

**O que o texto afirmava.** *"Três foram resolvidos, quatro foram tratados e
deixaram risco registrado."*

**O que o repositório mostra.** A tabela-resumo de
`docs/spec/05-fatos-do-ambiente.md:387-395` tem **as duas colunas preenchidas nos
sete fatos**. Não existem três "só resolvidos".

**Por que importa.** A frase **subvende** contra o critério de 15% de atenção e
proatividade. O enunciado diz que registrar risco conscientemente conta tanto
quanto resolver; a versão verdadeira — os sete tratados, os sete com risco
residual escrito — é mais forte do que a que estava lá.

**Estado agora.** Corrigido na árvore de trabalho, e com a justificativa certa
("nenhuma decisão fecha o assunto por completo").

**Conserto.** Já aplicado.

---

### A-10 — COSMÉTICO. `npm run build` sujava a árvore — **já corrigido em `1640bcd`**

**Arquivo:** `.gitignore`

**O que eu encontrei.** `npm run build` (`tsc -b && vite build`) gera
`tsconfig.tsbuildinfo` na raiz, e `git check-ignore -v tsconfig.tsbuildinfo`
devolvia **saída 1** — não ignorado. Quem seguisse o README e rodasse o build
ficava com `?? tsconfig.tsbuildinfo` no `git status`. `dist/` estava ignorado; o
`tsbuildinfo` escapara.

**Por que importava.** Pequeno, mas é atrito para a primeira pessoa que clona e
segue o README — que é exatamente o que o item II.3 pede que funcione.

**Estado agora.** `.gitignore:13` traz `tsconfig.tsbuildinfo`. **Verificado.**

---
C6
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write the counter-verification section**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C7'

### Não é achado: o que eu tentei derrubar e não consegui

Registro porque auditoria que só lista defeito não informa o peso deles.

- **"Nenhuma chamada de rede fora de `shared/api/`."** Busca por `fetch(` em
  `src/` fora de `shared/api/` devolve **uma** linha,
  `PaginaConferencia.tsx:171`, e ela é `documento.refetch()` do TanStack Query.
  Não é rede. A regra vale.
- **"Nenhum tipo de documento hardcoded."** As três ocorrências em `src/` estão
  em comentário (`shared/api/http.ts:55`) ou em `types.gen.ts`, que é gerado. O
  teste remove comentários antes de varrer, com o motivo escrito — decisão certa.
- **"Os tipos são gerados, nunca escritos à mão."** `npm run gen:api` seguido de
  `git diff --exit-code -- src/shared/api/types.gen.ts` → **saída 0**. O passo de
  CI passaria.
- **"O hook bloqueia."** Seis casos pelo contrato real (JSON na entrada padrão):
  bloqueou nos três que deviam bloquear (saída **2**) e deixou passar nos três
  que deviam passar (saída **0**), inclusive o comentário que cita `fetch(`.
- **"A spec foi escrita antes."** `spec-v1` = `add134d`, 31/08 **20:14:09**;
  primeiro arquivo em `src/` = `eba0889`, **20:42:10**. 28 minutos, como afirmado.
- **"Prompts íntegros, sem reescrita."** `0007` traz "produzirdo"; `0001` traz
  "ficticios", "analise", "RESALVAS"; `0003` traz "raciocinio". Nenhum foi
  higienizado.
- **"110 comandos nas transcrições."** 5 + 44 + 24 + 37 blocos de comando = 110.
  Exato.
- **"Dez documentos semeados, seis na fila."** `curl` contra `npm run mock`
  devolveu 6 itens em `AGUARDANDO_CONFERENCIA`, ordenados do mais antigo para o
  mais novo, como `entities/documento/fila.ts` pressupõe.
- **As duas capturas em `docs/img/`** mostram exatamente o que os textos
  alternativos descrevem, inclusive o aviso do segundo portão no CPF e a tabela
  de três colunas do conflito com o nome de quem alterou. Não são maquete.
- **A carta em PDF** tem `/Count 2`, A4, Roboto embutida, 11pt, entrelinha 1,15,
  6pt entre parágrafos e texto justificado — confere com o pedido do enunciado.
- **O plugin de terceiro não é reivindicado.** `docs/ia/README.md:52-64` separa
  Superpowers e ECC do que foi autorado, com a frase certa: "ferramenta, como o
  editor".

---
C7
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write section 7**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C8'

## 7. O que eu corrigiria antes de enviar, em ordem de retorno pelo esforço

| # | Correção | Achado | Esforço | Por que nesta ordem |
|---|---|---|---|---|
| 1 | Fechar o registro de tempo e refazer a carta e o PDF | A-01 | 15 min | É resposta a pergunta obrigatória, está errada, e é o quarto tropeço no mesmo arquivo. É o único achado que o avaliador **vai** encontrar, porque a própria carta manda conferir. |
| 2 | Parar de escrever o número de testes no README | A-02 | 10 min | Já vai quebrar de novo: a árvore tem 96 testes e o README diz 95 em cinco lugares. Trocar o número é remendo; tirar o número resolve. |
| 3 | Acrescentar o erro do `.gitattributes` ao parágrafo dos erros do agente | A-06 | 10 min | É o melhor material da entrega sobre conduzir agente, e está no arquivo que o avaliador não abre para julgar esse item. Ganha mais ponto que qualquer correção numérica. |
| 4 | `README.md:211` sete testes de arquitetura; `:226` os 14 prompts | A-07 | 2 min | Dois números, nos parágrafos dos critérios de 15% e 20%. |
| 5 | `08-divergencias.md:115`: trocar `05-fatos:204` por `:252` | A-03 | 1 min | O resto da A-03 já está corrigido na árvore; falta a referência que permite conferir. |
| 6 | Commitar o que está na árvore (A-03, A-04, A-05, A-08, A-09) | — | 2 min | Correção não commitada não conta. |
| 7 | Rodar a varredura final abaixo | todos | 5 min | O padrão desta entrega é reincidir na vizinhança do que se acabou de corrigir. |

### A varredura que eu rodaria por último

O próprio repositório ensinou a regra — *procurar pelo número, não pelo assunto*
— mas as quatro rodadas anteriores só a aplicaram em `docs/`. Os dois números
errados desta rodada estavam em `CLAUDE.md` e em `src/`. A varredura precisa
incluir os dois:

```bash
grep -rnE "3h[0-9]{2}|[0-9]+ testes|[0-9]+ prompts|[0-9]+ decis|[0-9]+ asser" \
  README.md CLAUDE.md docs/ src/ --include=*.md --include=*.ts --include=*.tsx
grep -rn "D-0[0-9]\|D-1[0-9]" src/          # ponteiros de divergência no código
npm test && npm run lint && npm run typecheck && npm run build
npm run gen:api && git diff --exit-code -- src/shared/api/types.gen.ts
```

### O conserto estrutural, se sobrar tempo

Quatro rodadas de auditoria acharam a mesma classe de defeito quatro vezes, e a
quinta já está armada (A-02). O problema não é desatenção: é que **o número mora
em dois lugares**. Duas saídas, em ordem de custo:

1. **Parar de escrever números derivados no texto.** "95 testes" vira "a suíte
   roda em `npm test`"; "15 decisões" vira "o índice está em `docs/adr/`".
2. **Fazer a CI falhar quando o texto mente.** Um passo que compara o número no
   README com a saída do vitest custa dez linhas de shell — e seria a
   demonstração mais forte que esta entrega poderia dar do próprio argumento:
   que a única afirmação confiável é a que uma máquina verifica.

A segunda é a que eu recomendaria, e ela pertence à mesma família da decisão que
já está no `ci.yml` — o passo que regenera os tipos e falha se o diff não vier
vazio. Aquilo tirou a regra 1 da dependência de disciplina. Isto tiraria a
contabilidade do texto.

---

*Fim do relatório. Auditoria conduzida em contexto frio contra `docs/enunciado.md`,
com verificação por comando de toda afirmação que sustenta nota. As saídas
completas estão no apêndice.*
C8
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write appendix part 1**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C9'

---

## Apêndice — saída dos comandos, na íntegra

```
$ npm run lint
> oxlint --deny-warnings
EXIT=0

$ npm run typecheck
> tsc --noEmit
(sem saída, sem erro)

$ npm test
 ✓ tests/features/anuncio-de-transicoes.test.tsx (4 tests) 63ms
 ✓ tests/features/segundo-portao.test.tsx (4 tests) 95ms
 ✓ tests/app/fronteira-de-erro.test.tsx (3 tests) 352ms
 ✓ tests/features/dialogo.test.tsx (2 tests) 1109ms
 ✓ tests/shared/hash.test.ts (4 tests) 10ms
 ✓ tests/entities/validacao-de-campo.test.ts (12 tests) 10ms
 ✓ tests/features/conferencia.test.tsx (4 tests) 1967ms
 ✓ tests/entities/fila.test.ts (5 tests) 6ms
 ✓ tests/entities/nome.test.ts (5 tests) 8ms
 ✓ tests/entities/estado.test.ts (10 tests) 7ms
 ✓ tests/shared/mascara.test.ts (5 tests) 7ms
 ✓ tests/shared/formato.test.ts (5 tests) 5ms
 ✓ tests/features/envio-logica.test.ts (11 tests) 133ms
 ✓ tests/features/backoff.test.ts (6 tests) 7ms
 ✓ tests/arquitetura/fronteiras.test.ts (7 tests) 75ms
 ✓ tests/mocks/contrato.test.ts (8 tests) 134ms

 Test Files  16 passed (16)
      Tests  95 passed (95)

(revisto as 11h12, com a arvore de trabalho: 96 passed (96) — ver A-02)

$ npm run gen:api && git diff --exit-code -- src/shared/api/types.gen.ts
openapi-typescript 7.13.0
docs/spec/openapi.yaml -> src/shared/api/types.gen.ts [146.5ms]
EXIT=0            (diff vazio: o passo de CI passaria)

$ npm run build
tsc -b && vite build
360 modules transformed.
dist/assets/index-D8ArXjAc.js   368.60 kB | gzip: 117.67 kB
built in 2.74s
```
C9
echo "ok $(wc -l < auditoria/relatorio-final.md)"
```

**Write appendix part 2 and confirm gitignore**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && cat >> auditoria/relatorio-final.md <<'C10'

```
$ hook PreToolUse — contrato real: JSON na entrada padrao, saida 2 bloqueia

  fetch( em src/features/upload/X.tsx          -> EXIT=2   BLOQUEOU
  fetch( em src/shared/api/http.ts             -> EXIT=0
  nome de tipo em src/features/review/Y.tsx    -> EXIT=2   BLOQUEOU
  nome de tipo em src/mocks/dados.ts           -> EXIT=0
  Edit new_string com nome de tipo, src/pages/ -> EXIT=2   BLOQUEOU
  nome de tipo + fetch( em docs/spec/00.md     -> EXIT=0

  Texto devolvido no bloqueio (trecho): "REGRA 3 do CLAUDE.md — nenhuma chamada
  de rede fora de src/shared/api/. ... Escreva a chamada em
  src/shared/api/client.ts e consuma-a por um hook."

$ PORTA=8799 npm run mock   +   curl

  GET   /api/v1/tipos-documento                      -> 200
  GET   /api/v1/documentos?estado=AGUARDANDO_CONFERENCIA
        -> 200, 6 itens: doc-1 .. doc-6, do mais antigo para o mais novo
           (confere com o pressuposto de entities/documento/fila.ts)
  POST  /api/v1/documentos/doc-1/conferencia/claim   -> 200
  PATCH /api/v1/documentos/doc-1/campos  If-Match:999 -> 409
        corpo: {"title":"Conflito de versão","status":409,
                "documentoAtual":{...,"versao":1,...},"alteradoPor":null}
        procedencia: {"modelo":"fornecedor-vision-2.1","versaoPrompt":"rg-v4"}

$ git log -1 --format='%H %ci' spec-v1
  add134dddd9d816f7a034edb60e46a0992353887   2026-08-31 20:14:09 -0300
$ git log --reverse --diff-filter=A --format='%h %ci' -- 'src/*' | head -1
  eba0889   2026-08-31 20:42:10 -0300        (28 minutos depois — confere)

$ for f in docs/spec/*.md; do git log --oneline spec-v1..HEAD -- "$f"; done
  00, 01, 02, 03, 04, 06 -> zero commits (congelados, como o enunciado pede)
  05                     -> 78058bf        (editado nesta rodada — ver A-03)
  07                     -> 2 commits       (documento vivo, por desenho)
  08                     -> 7 commits       (documento vivo, por desenho)

$ python — docs/carta-de-fechamento.pdf
  /Count 2 · MediaBox 594.96 x 841.92 (A4)
  fontes embutidas: Roboto (Regular/Bold/Italic) + Roboto Mono, como subsets
  scripts/gerar-carta-pdf.py: font-size 11pt · line-height 1.15
                              · p { margin: 0 0 6pt } · text-align justify
  -> confere com o formato pedido no enunciado

$ grep -rn "fetch(" src/ | grep -v shared/api/
  src/pages/PaginaConferencia.tsx:171:  ... void documento.refetch() ...
  (unica ocorrencia; e metodo do TanStack Query, nao rede)

$ grep -rniE "localstorage|sessionstorage|indexeddb" src/
  (vazio)

$ grep -rni "virtualiz" src/ tests/
  (vazio — contra a afirmacao de 05-fatos:252; ver A-03)

$ git check-ignore -v tsconfig.tsbuildinfo
  antes de 1640bcd: EXIT=1 (nao ignorado)
  em 19ec9a9:       .gitignore:13:tsconfig.tsbuildinfo   (corrigido)
```
C10
echo "FIM: $(wc -l < auditoria/relatorio-final.md) linhas"; git check-ignore -v auditoria/relatorio-final.md
```

**Verify report structure**

```bash
cd "C:/Users/SEINFRA/Documents/LEOPOLDO/Claude coisas/Projetos/DOC-Intelligence/.claude/worktrees/auditoria-defeitos-criticos-cf0f4a" && grep -nE "^#{1,3} " auditoria/relatorio-final.md && echo "---" && ls auditoria/
```

Audit complete. Report at `C:\Users\SEINFRA\Documents\LEOPOLDO\Claude coisas\Projetos\DOC-Intelligence\.claude\worktrees\auditoria-defeitos-criticos-cf0f4a\auditoria\relatorio-final.md` (777 linhas, confirmado ignorado por `.gitignore:39`).

## Veredito: APROVADO COM RESSALVAS — 89,5/100

Notas: arquitetura 27/30 · rastreabilidade 17,5/20 · uso de IA 18/20 · spec e método 13/15 · atenção 14/15.

## O que rodei, e o que deu

Tudo passou: `lint` saída 0, `typecheck` limpo, **95 testes** (16 arquivos), `build` ok, `gen:api` + `git diff --exit-code` → **diff vazio** (o passo de CI passaria). O hook `PreToolUse` **bloqueia de verdade** — exercitei os seis casos pelo contrato real (JSON no stdin): saída **2** para `fetch(` em `src/features/`, para nome de tipo em `src/features/` e para `Edit` com `new_string`; saída **0** dentro de `shared/api/`, dentro de `mocks/` e para comentário. `npm run mock` + `curl`: claim 200, `PATCH` com `If-Match: 999` → **409** com `documentoAtual` e `alteradoPor`. `spec-v1` = 31/08 20:14:09, primeiro `src/` = 20:42:10 — os 28 minutos conferem. As duas capturas em `docs/img/` mostram exatamente o que o README descreve.

## Achados abertos (o resto está no relatório, A-01 a A-10)

**A-01 — GRAVE, ABERTO.** `docs/ia/registro-de-tempo.md:23,25` para na Fase 8 ("~0h50", "duas rodadas de auditoria") e declara **Total: 3h20**; `docs/carta-de-fechamento.md:89-92` repete e diz "terminou na madrugada do dia seguinte". Mas há seis commits depois disso, até 11:06 de 01/09 — só o `4f88de3` são +1590/−100 linhas em 29 arquivos, 2 ADRs, 17 testes; o `78058bf` trouxe CI, hook, linter, capturas. É resposta a uma das quatro perguntas obrigatórias, a carta manda o avaliador conferir o arquivo, e é a **quarta ocorrência do mesmo defeito no mesmo arquivo** — desta vez o erro é o número que faltou escrever.

**A-06 — MÉDIO, ABERTO.** `docs/ia/onde-o-agente-errou.md` — o parágrafo que o item II.4 exige — não tem os três erros da última rodada. Falta o melhor material da entrega: o agente **afirmou ter encontrado um defeito inexistente**, sustentado por uma medição que virou busca pela letra "r" (só em `registro-de-verificacao.md:261-271`). O arquivo ainda diz "As três correções de rumo desta entrega foram todas minhas".

**A-07 — PARCIAL.** `README.md:211` diz "cinco testes de arquitetura" (são **7**); `README.md:226` diz "Os 12 prompts" (são **14** — faltam justamente o 0013 e o 0014).

**Aviso de reincidência iminente:** a árvore de trabalho já tem um teste novo e `npx vitest run` devolve **96**. No instante em que for commitado, o badge e as linhas 71, 122, 173 e 199 do README ficam erradas de novo — quinto ciclo. O conserto durável não é trocar 95 por 96, é parar de escrever o número.

## Encontrados e já corrigidos enquanto eu auditava

`1640bcd` fechou A-02 (64→95 em `:71` e `:199`), parte de A-07 (`:167` 13→15, `:242` "quatro vezes") e A-10 (`tsconfig.tsbuildinfo` no `.gitignore`). Na árvore não commitada estão A-03 (`05-fatos:252,257`, virtualização riscada e caminho inexistente marcado), A-04 (`Dialogo.tsx:24` D-10→**D-11**), A-05 (`CLAUDE.md:102` deixou de dizer que não há linter), A-08 ("seis"→"sete asserções") e A-09. Falta ainda trocar `05-fatos-do-ambiente.md:204` por `:252` em `08-divergencias.md:115`.

## Dois pontos que merecem registro separado

**A-03 é o achado conceitualmente mais interessante.** A defesa "a spec está congelada" não valia: rodei `git log spec-v1..HEAD` para os sete documentos — 00, 01, 02, 03, 04 e 06 devolvem **zero** commits; o 05 devolve `78058bf`, desta rodada. E a edição entrou **sete linhas abaixo** da afirmação falsa, no mesmo fato (e).

**O diagnóstico estrutural.** Quatro rodadas acharam a mesma classe de defeito quatro vezes porque o número mora em dois lugares. As rodadas anteriores aplicaram "procurar pelo número, não pelo assunto" só em `docs/` — e os dois números errados desta rodada estavam em `CLAUDE.md` e em `src/`. Recomendei um passo de CI que compara o número do README com a saída do vitest: dez linhas de shell, e é da mesma família da decisão que já está no `ci.yml` regenerando os tipos.

Os sete fatos do ambiente: **nenhum ignorado** — os sete tratados, os sete com risco residual escrito (o que é *mais* do que o README declarava sobre si mesmo). Nenhuma capacidade foi fabricada, nenhum plugin de terceiro reivindicado, e os prompts são demonstravelmente crus ("produzirdo", "RESALVAS", "raciocinio"). É por isso que é ressalva e não reprovação.
