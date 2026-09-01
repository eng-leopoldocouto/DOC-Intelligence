# Terceira auditoria — 85/100, o padrão nomeado

> Encontrou oito achados e nomeou o padrão que as duas anteriores não viram: o defeito não está no item apontado, está no vizinho aritmético dele ou no outro documento que o cita.

> Transcrição do subagente auditor, gerada por `scripts/exportar-auditorias.py`. **Não editada à mão.**

> O auditor roda em **contexto frio**, sem memória do que o autor quis dizer, com uma instrução no centro: *não acreditar na narrativa do repositório sobre si mesmo*. Os comandos abaixo aparecem **na íntegra**, porque são a evidência — é neles que se vê a verificação acontecendo.

---
**40 chamadas de ferramenta.**


## A instrução dada ao auditor

> Você é o auditor de entrega deste repositório. Diretório: C:\Users\LAMARCK\Documents\LDC\CLAUDE CODE\DOC-Intelligence
> 
> Leia PRIMEIRO `.claude/agents/auditor-de-entrega.md` — sua definição — e `docs/enunciado.md`, a ÚNICA fonte de verdade. Trilha: B (front-end).
> 
> ## Contexto (AFIRMAÇÃO A VERIFICAR, não fato)
> 
> Esta é a **terceira** auditoria. As duas anteriores estão em `auditoria/relatorio-final.md` (a segunda no topo, a primeira como anexo histórico). A segunda deu 86/100 e apontou seis problemas novos, quatro deles **introduzidos pela rodada de correção da primeira auditoria**. O candidato afirma tê-los corrigido no commit `7f968bb`.
> 
> O padrão observado nas duas rodadas anteriores é o mais importante para esta: **cada rodada de correção introduziu erros novos.** Sua principal hipótese de trabalho deve ser que isso voltou a acontecer.
> 
> ## Sua tarefa
> 
> Auditoria nova e independente. Três frentes, nesta ordem de prioridade:
> 
> 1. **As correções do commit `7f968bb` estão corretas?** Não basta o erro ter sumido — a correção pode estar errada, imprecisa, ou ter contradito outro documento. Confira em especial: o registro de tempo (a soma bate com a coluna? "ver último commit" é coerente?), a carta e seu PDF (o número de divergências bate com `grep -c "^## D-" docs/spec/08-divergencias.md`? o texto contradiz algum outro documento?), o prompt 0010 recriado, e a nova seção de `docs/ia/README.md`.
> 
> 2. **O PDF.** É o único artefato que viaja fora do repositório. Extraia o texto do binário (decodificando os CMaps `ToUnicode`) e confira contra o Markdown e contra o repositório — foi ali que a rodada anterior deixou o erro sobreviver. Continua com no máximo 2 páginas, Roboto embutida, quatro perguntas respondidas?
> 
> 3. **O que nenhuma das duas rodadas anteriores olhou.** Não repita o roteiro delas. Procure onde ninguém procurou: consistência entre ADRs e código, requisitos de `01-requisitos.md` sem implementação correspondente, critérios de aceite em Gherkin que nenhum teste cobre, afirmações do `CLAUDE.md` violadas, números citados em qualquer documento que não batam com a realidade.
> 
> REGRA CENTRAL: não acredite na narrativa do repositório sobre si mesmo. Quando texto e código divergirem, o código vence.
> 
> ECONOMIA DE CHAMADAS: agrupe comandos numa só invocação de shell. Uma sessão sua já foi interrompida por limite de uso.
> 
> Verificações mínimas obrigatórias (agrupe e cole a saída): `npm test`, `npx tsc --noEmit`, `npx vite build`, `git log --oneline | head -8`, `git status --porcelain`, `grep -c "^## D-" docs/spec/08-divergencias.md`, e a comparação das datas dos prompts contra `git log --diff-filter=A`.
> 
> ## Produza
> 
> Atualize `auditoria/relatorio-final.md` com a terceira auditoria no topo, preservando as duas anteriores.
> 
> Responda aqui com: VEREDITO, nota por critério, o que caiu, o que permanece, o que é NOVO, e — explicitamente — **se a rodada de correção anterior introduziu erros, como as duas antes dela**. Seja duro. Se a entrega estiver pronta para enviar, diga; se não estiver, diga o que falta.

---

## O que ele fez

I'll start by reading my definition, the source of truth, and the prior audit report.

`Read` · `.claude\agents\auditor-de-entrega.md`

`Read` · `docs\enunciado.md`

**List repo files, status, log, tags**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== TREE ===" && git ls-files | head -200 && echo "=== UNTRACKED/STATUS ===" && git status --porcelain && echo "=== LOG ===" && git log --oneline | head -20 && echo "=== TAGS ===" && git tag -l && echo "=== AUDITORIA DIR ===" && ls -la auditoria/ 2>/dev/null
```

**Inspect the fix commit**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== SHOW 7f968bb ===" && git show --stat 7f968bb && echo "=== DIFF 7f968bb ===" && git show 7f968bb -- . | head -600
```

**Read top of prior audit report**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && head -260 auditoria/relatorio-final.md
```

**Run mandatory verifications**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== npm test ===" && npm test 2>&1 | tail -15 && echo "=== tsc ===" && npx tsc --noEmit 2>&1 | tail -10 && echo "tsc exit: $?" && echo "=== vite build ===" && npx vite build 2>&1 | tail -8 && echo "=== git log ===" && git log --oneline | head -8 && echo "=== status ===" && git status --porcelain && echo "(fim status)" && echo "=== D- count ===" && grep -c "^## D-" docs/spec/08-divergencias.md && echo "=== D- list ===" && grep -n "^## D-" docs/spec/08-divergencias.md
```

**Read rest of second audit**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && sed -n '260,420p' auditoria/relatorio-final.md
```

**Show fix commit stat and time log**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== FILES CHANGED IN 7f968bb ===" && git show --stat --format="" 7f968bb && echo && echo "=== REGISTRO DE TEMPO (atual) ===" && cat docs/ia/registro-de-tempo.md
```

**Read closing letter markdown**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== CARTA MD ===" && cat -n docs/carta-de-fechamento.md
```

**Diff of time log in fix commit**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== DIFF registro-de-tempo em 7f968bb ===" && git show 7f968bb -- docs/ia/registro-de-tempo.md && echo && echo "=== VERSAO ANTERIOR (e5ab5d9) tabela ===" && git show e5ab5d9:docs/ia/registro-de-tempo.md | sed -n '1,30p'
```

**Read prompts and diffs of IA docs**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== PROMPT 0010 ===" && cat docs/ia/prompts/0010-2026-09-01-retomada-da-auditoria.md && echo && echo "=== PROMPT 0011 ===" && cat docs/ia/prompts/0011-2026-09-01-nova-auditoria.md && echo && echo "=== DIFF ia/README em 7f968bb ===" && git show 7f968bb -- docs/ia/README.md && echo "=== DIFF onde-o-agente-errou ===" && git show 7f968bb -- docs/ia/onde-o-agente-errou.md && echo "=== DIFF 08-divergencias ===" && git show 7f968bb -- docs/spec/08-divergencias.md
```

**Check python and PDF files**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && python --version 2>&1; python -c "import zlib; print('zlib ok')" 2>&1; ls -la docs/carta-de-fechamento.*; echo "=== git log carta ==="; git log --format='%h %ad %s' --date=format:'%d/%m %H:%M:%S' -- docs/carta-de-fechamento.pdf; echo "=== html existe? ==="; ls docs/*.html 2>&1
```

**Check gitignore and html tracking**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && cat .gitignore && echo "=== html tracked? ===" && git ls-files docs/ | grep -i html; echo "(exit $?)"; echo "=== check-ignore ===" && git check-ignore -v docs/carta-de-fechamento.html
```

**Extract PDF text via ToUnicode CMaps**

```bash
mkdir -p "C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad" && cat > "C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad/pdfx.py" << 'EOF'
import re, sys, zlib

path = sys.argv[1]
data = open(path,'rb').read()
print("== size:", len(data), "bytes")
print("== header:", data[:16])

# objects
objs = {}
for m in re.finditer(rb'(\d+)\s+(\d+)\s+obj(.*?)endobj', data, re.S):
    objs[int(m.group(1))] = m.group(3)
print("== objects:", len(objs))

def getstream(body):
    m = re.search(rb'stream\r?\n', body)
    if not m: return None
    start = m.end()
    e = body.rfind(b'endstream')
    raw = body[start:e]
    if b'FlateDecode' in body[:m.start()]:
        try: return zlib.decompress(raw)
        except Exception:
            try: return zlib.decompressobj().decompress(raw)
            except Exception: return None
    return raw

# ToUnicode CMaps: map font resource -> cmap
cmaps = {}   # objnum -> dict(code->unicode)
for num, body in objs.items():
    head = body[:body.find(b'stream')] if b'stream' in body else body
    s = getstream(body)
    if not s: continue
    if b'beginbfchar' in s or b'beginbfrange' in s:
        d = {}
        for blk in re.findall(rb'beginbfchar(.*?)endbfchar', s, re.S):
            for a,b in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
                d[int(a,16)] = ''.join(chr(int(b[i:i+4],16)) for i in range(0,len(b),4))
        for blk in re.findall(rb'beginbfrange(.*?)endbfrange', s, re.S):
            for a,b,c in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
                lo,hi,st = int(a,16), int(b,16), int(c,16)
                for i in range(lo,hi+1):
                    d[i] = chr(st + (i-lo))
        cmaps[num] = d
print("== ToUnicode CMaps found:", list(cmaps.keys()), [len(v) for v in cmaps.values()])

# font obj -> tounicode obj, and basefont name
font_tou = {}
fontinfo = {}
for num, body in objs.items():
    if b'/Font' in body and b'/ToUnicode' in body:
        m = re.search(rb'/ToUnicode\s+(\d+)\s+0\s+R', body)
        bf = re.search(rb'/BaseFont\s*/([#\w+\-,\.]+)', body)
        if m:
            font_tou[num] = int(m.group(1))
            fontinfo[num] = bf.group(1).decode('latin1') if bf else '?'
print("== fonts with ToUnicode:", fontinfo)

# embedded font files
emb = []
for num, body in objs.items():
    if b'/FontFile' in body:
        emb.append((num, re.findall(rb'/FontFile\d?', body)))
    if b'/FontDescriptor' in body:
        bf = re.search(rb'/FontName\s*/([#\w+\-,\.]+)', body)
        ff = re.findall(rb'/FontFile\d?\s+(\d+)\s+0\s+R', body)
        if bf: print("== FontDescriptor obj", num, bf.group(1).decode('latin1'), "FontFile refs:", ff)

# pages
pages = re.findall(rb'/Type\s*/Page[^s]', data)
mcount = re.search(rb'/Type\s*/Pages.*?/Count\s+(\d+)', data, re.S)
print("== /Type /Page occurrences:", len(pages), " /Pages Count:", mcount.group(1) if mcount else '?')

# content streams: find page objects and their /Contents + /Resources /Font map
pageobjs = [n for n,b in objs.items() if re.search(rb'/Type\s*/Page[^s]', b)]
print("== page objects:", pageobjs)

def decode_content(content, fontmap):
    out=[]
    cur=None
    # tokenise Tf and text showing ops
    for m in re.finditer(rb'/(\w+)\s+[\d\.]+\s+Tf|\((?:\\.|[^\\()])*\)\s*Tj|\[(?:[^\[\]]|\\.)*\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*Tj|T\*|\bTd\b|\bTD\b|\bTJ\b', content, re.S):
        tok = m.group(0)
        if tok.endswith(b'Tf'):
            name = m.group(1).decode('latin1')
            cur = fontmap.get(name)
        elif tok.endswith(b'Tj') or tok.endswith(b'TJ'):
            hexes = re.findall(rb'<([0-9A-Fa-f\s]+)>', tok)
            s=''
            for h in hexes:
                h = re.sub(rb'\s',b'',h)
                for i in range(0,len(h),4):
                    code = int(h[i:i+4],16)
                    s += (cur or {}).get(code, '\ufffd')
            if s: out.append(s)
    return out

for pn in pageobjs:
    body = objs[pn]
    fm = {}
    fres = re.search(rb'/Font\s*<<(.*?)>>', body, re.S)
    res_ref = re.search(rb'/Resources\s+(\d+)\s+0\s+R', body)
    src = fres.group(1) if fres else (re.search(rb'/Font\s*<<(.*?)>>', objs.get(int(res_ref.group(1)),b''), re.S).group(1) if res_ref and re.search(rb'/Font\s*<<(.*?)>>', objs.get(int(res_ref.group(1)),b''), re.S) else b'')
    for name, ref in re.findall(rb'/(\w+)\s+(\d+)\s+0\s+R', src):
        ref=int(ref)
        tou = font_tou.get(ref)
        fm[name.decode('latin1')] = cmaps.get(tou, {})
    cont = re.findall(rb'/Contents\s+(\d+)\s+0\s+R', body)
    print("\n########## PAGE obj", pn, "fonts:", {k:len(v) for k,v in fm.items()}, "contents:", cont)
    for c in cont:
        s = getstream(objs[int(c)])
        if s is None: 
            print("  (no stream)"); continue
        parts = decode_content(s, fm)
        print(' '.join(parts))
EOF
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && python "C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad/pdfx.py" docs/carta-de-fechamento.pdf 2>&1 | head -120
```

**Inspect PDF fonts and embedding**

```bash
cat > "C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad/fonts.py" << 'EOF'
import re, sys, zlib
data = open(sys.argv[1],'rb').read()
objs = {}
for m in re.finditer(rb'(\d+)\s+(\d+)\s+obj(.*?)endobj', data, re.S):
    objs[int(m.group(1))] = m.group(3)

print("### All /Font objects")
for n,b in sorted(objs.items()):
    if b'/Type' in b and b'/Font' in b:
        head = b[:b.find(b'stream')] if b'stream' in b else b
        print(f"--- obj {n} ---")
        print(head[:900].decode('latin1').replace('\n',' ')[:900])
        print()

print("### All /FontDescriptor objects")
for n,b in sorted(objs.items()):
    if b'/FontDescriptor' in b:
        print(f"--- obj {n} ---")
        print(b[:900].decode('latin1').replace('\n',' ')[:900])
        print()

print("### Objects containing FontFile")
for n,b in sorted(objs.items()):
    if re.search(rb'/FontFile', b):
        print(n, re.findall(rb'/FontFile\d?[^/\]]{0,40}', b)[:5])

print("### Font programs (streams with /Length1 or /Subtype /Type1C or CIDFontType0C)")
for n,b in sorted(objs.items()):
    if b'/Length1' in b or b'Type1C' in b or b'CIDFontType' in b or b'OpenType' in b:
        print(n, b[:200].decode('latin1').replace('\n',' '))

print("### text state: Tf sizes and TL leading on page content")
pageobjs=[n for n,bb in objs.items() if re.search(rb'/Type\s*/Page[^s]', bb)]
for pn in pageobjs:
    cont = re.findall(rb'/Contents\s+(\d+)\s+0\s+R', objs[pn])
    for c in cont:
        body = objs[int(c)]
        m = re.search(rb'stream\r?\n', body); start=m.end(); e=body.rfind(b'endstream')
        raw=body[start:e]
        try: s = zlib.decompress(raw)
        except Exception: s = raw
        print("page obj",pn,"content",c,"len",len(s))
        print("  Tf:", sorted(set(re.findall(rb'/\w+\s+[\d\.]+\s+Tf', s))))
        print("  TL:", sorted(set(re.findall(rb'[\d\.]+\s+TL', s)))[:10])
        print("  Td/TD sample:", re.findall(rb'[-\d\.]+\s+[-\d\.]+\s+T[dD]', s)[:12])
        print("  first 400:", s[:400].decode('latin1').replace('\n',' '))
EOF
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && python "C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad/fonts.py" docs/carta-de-fechamento.pdf 2>&1 | head -100
```

**Analyze PDF text state, size, leading**

```bash
cat > "C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad/ts.py" << 'PYEOF'
import re, sys, zlib
data = open(sys.argv[1],'rb').read()
objs = {}
for m in re.finditer(rb'(\d+)\s+(\d+)\s+obj(.*?)endobj', data, re.S):
    objs[int(m.group(1))] = m.group(3)
# metadata
for k in [b'/Producer', b'/Creator', b'/CreationDate', b'/ModDate', b'/Title']:
    for mm in re.finditer(re.escape(k)+rb'\s*(\([^)]*\)|<[^>]*>)', data):
        print("META", k.decode(), mm.group(1)[:120].decode('latin1','replace'))
print("MediaBox:", set(re.findall(rb'/MediaBox\s*\[([^\]]*)\]', data)))
# a CharProc sample
cp = re.search(rb'/CharProcs\s*<<(.*?)>>', objs[6], re.S)
if cp:
    first = re.findall(rb'/(\w+)\s+(\d+)\s+0\s+R', cp.group(1))[:3]
    print("CharProcs sample refs:", first)
    for name, ref in first:
        b = objs[int(ref)]
        m = re.search(rb'stream\r?\n', b); s=b[m.end():b.rfind(b'endstream')]
        try: s = zlib.decompress(s)
        except Exception: pass
        print("  glyph", name.decode(), "->", s[:160].decode('latin1','replace').replace('\n',' '))
pageobjs=[n for n,bb in objs.items() if re.search(rb'/Type\s*/Page[^s]', bb)]
for pn in sorted(pageobjs):
    cont = re.findall(rb'/Contents\s+(\d+)\s+0\s+R', objs[pn])
    for c in cont:
        b = objs[int(c)]
        m = re.search(rb'stream\r?\n', b); raw=b[m.end():b.rfind(b'endstream')]
        try: s = zlib.decompress(raw)
        except Exception: s = raw
        print("=== page obj", pn, "content len", len(s))
        print("  Tf set:", sorted(set(x.decode() for x in re.findall(rb'/\w+\s+[\d\.]+\s+Tf', s))))
        tds = re.findall(rb'([-\d\.]+)\s+([-\d\.]+)\s+Td', s)
        print("  Td count:", len(tds), "first 8:", tds[:8])
        ys = [float(y) for x,y in tds]
        print("  distinct y-steps (leading):", sorted(set(round(v,2) for v in ys))[:15])
        xs = sorted(set(round(float(x),2) for x,y in tds))
        print("  distinct x (line starts):", xs[:15])
        # word-spacing / Tz / TJ kerning presence
        print("  Tw:", sorted(set(x.decode() for x in re.findall(rb'[-\d\.]+\s+Tw', s)))[:10])
        print("  Tz:", sorted(set(x.decode() for x in re.findall(rb'[\d\.]+\s+Tz', s)))[:10])
        print("  TJ arrays:", len(re.findall(rb'\]\s*TJ', s)), " Tj:", len(re.findall(rb'>\s*Tj', s)))
PYEOF
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && python "C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad/ts.py" docs/carta-de-fechamento.pdf 2>&1 | head -60
```

**Read HTML CSS and count words**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== HTML CSS ===" && sed -n '1,60p' docs/carta-de-fechamento.html && echo "..." && echo "=== word count MD ===" && python -c "
import re,io
t=open('docs/carta-de-fechamento.md',encoding='utf-8').read()
print('md words:',len(t.split()))
h=open('docs/carta-de-fechamento.html',encoding='utf-8').read()
body=re.sub(r'<script.*?</script>','',h,flags=re.S)
body=re.sub(r'<style.*?</style>','',body,flags=re.S)
body=re.sub(r'<[^>]+>',' ',body)
import html as H
body=H.unescape(body)
print('html words:',len(body.split()))
"
```

**Verify PDF scale and document numbers**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && python -c "
import re,zlib
d=open('docs/carta-de-fechamento.pdf','rb').read()
objs={}
for m in re.finditer(rb'(\d+)\s+(\d+)\s+obj(.*?)endobj', d, re.S): objs[int(m.group(1))]=m.group(3)
b=objs[8]; m=re.search(rb'stream\r?\n',b); s=zlib.decompress(b[m.end():b.rfind(b'endstream')])
print(repr(s[:300]))
print('--- cm ops:', sorted(set(x.decode() for x in re.findall(rb'[\d\.\- ]+cm', s)))[:6])
tms=re.findall(rb'([-\d\.]+) ([-\d\.]+) ([-\d\.]+) ([-\d\.]+) ([-\d\.]+) ([-\d\.]+) Tm', s)
print('Tm count',len(tms)); print('first 6 Tm:',tms[:6])
ys=[float(t[5]) for t in tms]; import collections
diffs=collections.Counter(round(ys[i]-ys[i+1],3) for i in range(len(ys)-1))
print('y deltas (most common):', diffs.most_common(8))
xs=sorted(set(round(float(t[4]),2) for t in tms)); print('x starts:', xs[:12])
"
echo "=== NUMEROS: spec/ADR linhas ==="
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "docs de spec:" && ls docs/spec/*.md | wc -l && ls docs/spec/ && echo "ADRs (sem README):" && ls docs/adr/*.md | grep -v README | wc -l && echo "linhas spec+adr (na tag spec-v1):" && git show spec-v1 --stat --format="" | tail -3 && echo "--- wc atual ---" && cat docs/spec/*.md docs/adr/*.md | wc -l && echo "--- plano linhas ---" && wc -l docs/plano/*.md && echo "--- fixtures ---" && ls fixtures/documentos-ficticios/ | wc -l
```

**Read CLAUDE.md**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "########## CLAUDE.md ##########" && cat -n CLAUDE.md
```

**Read requirements spec**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "########## 01-requisitos.md ##########" && cat -n docs/spec/01-requisitos.md
```

**Check scripts, deps, rule violations**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== package.json scripts ===" && python -c "import json;print(json.dumps(json.load(open('package.json'))['scripts'],indent=1,ensure_ascii=False))" && echo "=== deps ===" && python -c "
import json;p=json.load(open('package.json'));print('deps',list(p.get('dependencies',{}).keys()));print('dev',list(p.get('devDependencies',{}).keys()))" && echo
echo "=== fetch fora de shared/api ===" && grep -rn "fetch(" src/ --include=*.ts --include=*.tsx | grep -v "src/shared/api/" ; echo "(fim)"
echo "=== localStorage/sessionStorage/indexedDB ===" && grep -rn "localStorage\|sessionStorage\|indexedDB" src/ ; echo "(fim)"
echo "=== visibilitychange ===" && grep -rn "visibilitychange\|document.hidden\|visibilityState" src/ ; echo "(fim)"
echo "=== 800 / 2000px / 20MB ===" && grep -rn "800\|2000\|20 \* 1024\|MAX" src/features/upload/validacao.ts src/shared/lib/imagem.ts | head -30
echo "=== tests mencionando 800 ===" && grep -rn "800" tests/ ; echo "(fim)"
echo "=== gen:api existe? ===" && grep -rn "gen:api\|openapi-typescript" package.json README.md CLAUDE.md docs/spec/01-requisitos.md | head
```

**Verify gen:api determinism and boundary tests**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== gen:api regenera limpo? ===" && cp src/shared/api/types.gen.ts /tmp/types.bak 2>/dev/null; npm run gen:api 2>&1 | tail -3; echo "--- git diff types.gen.ts ---"; git diff --stat src/shared/api/types.gen.ts; echo "(diff acima; vazio = limpo)"; git checkout -- src/shared/api/types.gen.ts 2>/dev/null; echo
echo "=== fronteiras.test.ts ===" && cat -n tests/arquitetura/fronteiras.test.ts
```

**Read test plan spec**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== 06-plano-de-testes.md ===" && cat -n docs/spec/06-plano-de-testes.md
```

**Regenerate API types to scratchpad and diff**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && SCRATCH="C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad" && npx openapi-typescript docs/spec/openapi.yaml -o "$SCRATCH/types.regen.ts" 2>&1 | tail -2 && echo "--- diff regenerado x commitado ---" && diff "$SCRATCH/types.regen.ts" src/shared/api/types.gen.ts && echo "IDENTICO (RNF-02 confirmado)"
```

**List all test titles**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== TITULOS DE TESTE ===" && grep -rn "describe(\|  it(\|	it(\|it('" tests/ --include=*.ts --include=*.tsx | sed 's/^/  /' | head -90
```

**Compare regenerated types ignoring line endings**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && SCRATCH="C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad" && echo "=== diff ignorando CRLF ===" && diff --strip-trailing-cr "$SCRATCH/types.regen.ts" src/shared/api/types.gen.ts > "$SCRATCH/d.txt" 2>&1; echo "linhas de diff: $(wc -l < "$SCRATCH/d.txt")" && head -20 "$SCRATCH/d.txt"; echo "--- line endings ---"; python -c "
a=open(r'$SCRATCH/types.regen.ts','rb').read(); b=open('src/shared/api/types.gen.ts','rb').read()
print('regen CRLF:',a.count(b'\r\n'),'LF:',a.count(b'\n'))
print('repo  CRLF:',b.count(b'\r\n'),'LF:',b.count(b'\n'))
print('iguais apos normalizar:', a.replace(b'\r\n',b'\n')==b.replace(b'\r\n',b'\n'))
"
```

**Inspect T-05 and RF-12 tests**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== T-05 teste ===" && sed -n '115,135p' tests/mocks/contrato.test.ts && echo && echo "=== RF-12 teste (conta chamadas?) ===" && sed -n '155,200p' tests/features/conferencia.test.tsx && echo && echo "=== handlers.ts linhas ===" && wc -l src/mocks/handlers.ts && sed -n '100,112p' tests/arquitetura/fronteiras.test.ts
```

**Read D-06 and all virtualization mentions**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== D-06 completo ===" && sed -n '105,180p' docs/spec/08-divergencias.md && echo && echo "=== onde a spec fala de virtualiz ===" && grep -rn "irtualiz" docs/ README.md | grep -v "08-divergencias"
```

**Check RF-11, RF-07, RNF-07 implementations**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== nome padronizado: recalculo e edicao manual ===" && grep -rn "nomePadronizado\|manualmente\|editouNome\|nomeEditado" src/ | head -20 && echo && echo "=== identidade.ts ===" && cat -n src/shared/api/identidade.ts && echo && echo "=== 'outra sessao' ===" && grep -rn "outra sess\|outra sessão" src/ && echo && echo "=== sanitizacao http.ts ===" && grep -n "saniti\|redigir\|valor\|campo" src/shared/api/http.ts | head -20
```

**Compare prompt dates with git add dates; check spec freeze**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== PROMPTS: data no nome/cabecalho x git --diff-filter=A ===" && git log --diff-filter=A --format='%ad|%h' --date=format:'%d/%m %H:%M:%S' --name-only -- docs/ia/prompts/ | awk 'BEGIN{FS="|"} /\|/{d=$1; h=$2; next} /prompts\//{printf "%-28s  add=%s %s\n", substr($0,17), d, h}' | sort
echo
echo "=== cabecalho data: de cada prompt ===" && for f in docs/ia/prompts/*.md; do printf "%-52s " "$(basename $f)"; grep -m1 "^data:" "$f"; done
echo
echo "=== spec congelada? commits que tocaram cada doc de spec ===" && for f in docs/spec/*.md docs/spec/openapi.yaml; do printf "%-40s " "$(basename $f)"; git log --format='%h %ad' --date=format:'%d/%m %H:%M' -- "$f" | tr '\n' ' '; echo; done
echo
echo "=== tag spec-v1 ===" && git log -1 --format='%h %ad %s' --date=format:'%d/%m %H:%M:%S' spec-v1 && echo "primeiro commit com src/:" && git log --diff-filter=A --format='%h %ad' --date=format:'%d/%m %H:%M:%S' --reverse -- src/ | head -1
```

**Read README**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "########## README.md ##########" && cat -n README.md
```

**Read verification log tail**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== registro-de-verificacao V-006 e fim ===" && sed -n '120,200p' docs/ia/registro-de-verificacao.md && echo "=== total linhas ===" && wc -l docs/ia/registro-de-verificacao.md
```

**Check reprocess tests and seed counts**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== reprocessar em testes ===" && grep -rn "reprocess" tests/ && echo && echo "=== semear: quantos docs / quantos aguardando ===" && grep -n "export function semear\|AGUARDANDO_CONFERENCIA\|SEMENTES\|push(" src/mocks/dados.ts | head -30 && echo "--- contagem por execucao ---" && npx tsx -e "
import('./src/mocks/dados.ts').then(async m=>{ (m as any).semear(); const d=(m as any); const chaves=Object.keys(d); console.log('exports:',chaves.join(',')); })
" 2>&1 | tail -5
```

**Read risk register and ADR index**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== 05-fatos: riscos registrados ===" && sed -n '300,340p' docs/spec/05-fatos-do-ambiente.md && echo && echo "=== 07-nao-feito linha 30-45 ===" && sed -n '28,45p' docs/spec/07-nao-feito.md && echo && echo "=== ADR README lista 13? ===" && grep -c "^| *\[*ADR\|^| *0" docs/adr/README.md; grep -n "ADR-0" docs/adr/README.md | head -20
```

**Verify seed count and T-02 test**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== semear array ===" && sed -n '348,385p' src/mocks/dados.ts && echo && echo "=== T-02 teste conta chamadas? ===" && sed -n '25,50p' tests/mocks/contrato.test.ts
```

**Check ADR index and ADR-009/005 vs code**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "=== ADR README ===" && head -40 docs/adr/README.md && echo && echo "=== ADR-009 TTL 5min x codigo ===" && grep -rn "TTL\|5 min\|300\|reserva" docs/adr/009-concorrencia-na-fila.md | head -8 && grep -rn "5 \* 60\|300_000\|300000\|TTL" src/mocks/handlers.ts src/features/review/useClaim.ts | head -8 && echo && echo "=== ADR-005 polling intervalos x backoff.ts ===" && grep -n "s\b\|segundo\|intervalo" docs/adr/005-processamento-assincrono-por-polling.md | head -12 && echo "--- backoff.ts ---" && cat -n src/features/processing/backoff.ts
```

Tenho evidência suficiente. Vou escrever o relatório da terceira auditoria e prependê-lo ao arquivo, preservando as duas anteriores.

**Write third audit and prepend to report**

```bash
SCRATCH="C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad" && cat > "$SCRATCH/terceira.md" << 'FIMDOC'
# Relatório de auditoria — DOC Intelligence (Trilha B)

## TERCEIRA AUDITORIA — 01/09/2026

**Auditor:** subagente `auditor-de-entrega`, contexto frio
**Commit auditado:** `7f968bb` (main, árvore limpa)
**Auditorias anteriores:** `eafc56b` ≈84/100 · `e5ab5d9` ≈86/100 (ambas preservadas abaixo)
**Fonte de verdade:** `docs/enunciado.md`

> Hipótese de trabalho declarada na abertura: **cada rodada de correção desta
> entrega introduziu erros novos**. Auditei para derrubá-la. Não consegui.
> Nenhuma afirmação do repositório sobre si mesmo foi aceita como evidência;
> onde texto e código divergiram, ganhou o código.

---

## 1. Veredito

# APROVADO COM RESSALVAS

**≈ 85 / 100** (era 86).

**A resposta direta à pergunta que motivou esta auditoria: sim — a rodada de
correção anterior introduziu erros novos, como as duas antes dela. É a terceira
vez seguida. E, pela terceira vez, o erro atravessou para o PDF.**

Seis dos nove achados da segunda auditoria caíram, alguns muito bem: a lista
virtualizada saiu da carta *e do PDF*; "cinco divergências" virou "nove" (e são
nove); a Fase 8 do registro de tempo recebeu um conserto **estrutural** — a
coluna "fim" passou a dizer *"ver último commit"* —, que é a resposta certa e a
melhor decisão da rodada; o prompt 0010 foi recriado com a falha declarada no
cabeçalho; e o parágrafo do item II.4 finalmente incorporou a quarta correção de
rumo, que é a página mais forte da entrega inteira.

**E então a mesma coisa aconteceu de novo, no mesmo arquivo, no mesmo parágrafo.**
Ao corrigir a soma do registro de tempo, o candidato escreveu **"Total: 3h08"** —
que é a soma da tabela **antes** das duas alterações que o próprio commit fez na
tabela. A coluna, depois da correção, soma **3h20**. O número errado está no
`registro-de-tempo.md`, está na carta e **está impresso na página 1 do PDF**,
dentro da frase *"3h08 de trabalho efetivo, **somando a coluna de duração** de
`docs/ia/registro-de-tempo.md`"* — uma afirmação que cita o arquivo pelo nome e
erra a conta que diz estar fazendo.

O padrão não é descuido aleatório: é sempre **o dado auxiliar do conserto**. Na
1ª rodada corrigiram-se duas linhas e criou-se a terceira. Na 2ª corrigiu-se a
terceira e errou-se a soma. Em ambas, a correção foi aplicada num documento e
não no outro que o cita.

---

## 2. Resumo em cinco linhas

1. **Tudo o que é verificável por comando passa**, e verifiquei duas coisas que
   ninguém tinha verificado: a spec está genuinamente congelada (`spec-v1` toca
   todos os 9 docs e nada mais os tocou) e `npm run gen:api` **reproduz**
   `types.gen.ts` byte a byte. A promessa "contrato primeiro" é real.
2. **O PDF melhorou onde a 2ª auditoria mandou e piorou onde ninguém olhou:**
   caíram "lista virtualizada" e "cinco divergências"; entraram um total de horas
   errado e uma contradição direta com o registro de tempo ("vinte e um" × 0h18).
3. **A correção do D-06 subdeclarou de novo.** Diz "três lugares"; são pelo
   menos **cinco** — e os dois que faltam são justamente os que afirmam que a
   virtualização foi **verificada**.
4. **A regra 6 do próprio `CLAUDE.md` foi violada pelo commit de correção:** não
   existe V-007. O registro de verificação para em V-006, antes da 2ª auditoria.
5. **O registro de prompts continua parando um prompt antes do commit auditado** —
   e a correção escolhida foi apagar a palavra "Todos" do `docs/ia/README.md`.

---

## 3. As verificações obrigatórias, coladas

```
$ npm test 2>&1 | tail -4
 Test Files  10 passed (10)
      Tests  64 passed (64)
   Start at  04:31:20
   Duration  6.70s

$ npx tsc --noEmit
(sem saída — exit 0)

$ npx vite build 2>&1 | tail -3
dist/assets/browser-k3570hf9.js  305.13 kB │ gzip: 100.79 kB
dist/assets/index-CYkyPvIa.js    362.59 kB │ gzip: 115.38 kB
✓ built in 2.61s

$ git log --oneline | head -8
7f968bb fix: corrige o que a SEGUNDA auditoria encontrou
e5ab5d9 docs: registra o prompt 0011 (nova auditoria após as correções)
5068268 docs: registra D-09 — a guarda de arquitetura não falha o build, falha o teste
06309a7 docs: carta reflete a interrupção e assume a correção do registro de tempo
a70d6a9 fix: corrige o que a auditoria encontrou
eafc56b docs: carta de fechamento e parágrafo sobre os erros do agente
66b21f1 merge: README e agente auditor (T14, T16)
8e95cd3 docs: README, agente auditor e fechamento do registro

$ git status --porcelain
(vazio)

$ grep -c "^## D-" docs/spec/08-divergencias.md
9                          # D-01 … D-09; a carta diz "nove" — CONFERE

$ git log --diff-filter=A --format='%ad|%h' --date=format:'%d/%m %H:%M:%S' --name-only -- docs/ia/prompts/
0001 … 0005   add=31/08 19:57:35 (43688ea)   declarados ~19:17…~19:45   OK
0006          add=31/08 20:32:31 (bc273f2)   declarado  ~20:15          OK  ← a 2ª auditoria
                                                                            errou aqui: atribuiu
                                                                            o add a add134d
0007          add=31/08 20:37:14 (4a1cc25)   declarado  ~20:36          OK
0008          add=31/08 21:45:55 (4c7235f)   declarado  ~21:12          OK
0009          add=31/08 21:54:31 (eafc56b)   declarado  ~22:00          +5,5 min no futuro
0010          add=01/09 00:49:41 (7f968bb)   declarado  ~00h10          OK (recriação declarada)
0011          add=01/09 00:34:54 (e5ab5d9)   declarado  "madrugada"     OK (corrigido)
```

Verificações que a 2ª auditoria não fez e eu fiz:

```
$ npx openapi-typescript docs/spec/openapi.yaml -o <tmp>/types.regen.ts
$ diff --strip-trailing-cr <tmp>/types.regen.ts src/shared/api/types.gen.ts
(0 linhas de diferença — RNF-02 CONFIRMADO)

$ for f in docs/spec/*; do git log --format='%h %ad' -- $f; done
00-visao … 07-nao-feito, openapi.yaml → add134d 31/08 20:14 (e mais nada)
08-divergencias.md → add134d, 4c7235f, a70d6a9, 5068268, 7f968bb
$ git log --diff-filter=A --reverse --format='%h %ad' -- src/ | head -1
eba0889 31/08 20:42:10        # spec congelada 28 min ANTES da primeira linha de src/

$ grep -rn "fetch(" src/ | grep -v shared/api/
src/pages/PaginaConferencia.tsx:162:  ... void documento.refetch() ...   # TanStack Query, não rede

$ grep -rn "localStorage\|sessionStorage\|indexedDB" src/
(nada — regra 4 do CLAUDE.md holds)
```

---

## 4. As correções de `7f968bb`, uma por uma

| Achado da 2ª auditoria | Estado | Evidência |
|---|---|---|
| **N-01** "a lista continua virtualizada" na carta | **CAIU** | `carta-de-fechamento.md:35` e **PDF pág. 1** (texto extraído dos CMaps `ToUnicode`): *"a fila continua paginada por cursor"* |
| **N-02** "as cinco divergências" | **CAIU** | `carta:94` e **PDF pág. 2**: *"as **nove** divergências"*; `grep -c "^## D-"` = 9 |
| **N-03** Fase 8 com carimbo prospectivo | **CAIU, e caiu bem** | `registro-de-tempo.md:24` → coluna "fim" = *"ver último commit"*. É conserto **estrutural**: o campo deixou de admitir o erro. A melhor decisão da rodada |
| **N-04** "duas linhas" × "três linhas" | **CAIU** | `registro-de-tempo.md:30` → *"As linhas das fases 6, **7 e 8**"* |
| **N-05** prompt 0010 ausente | **CAIU em parte** | `0010-2026-09-01-retomada-da-auditoria.md` recriado, com `lacuna:` no cabeçalho declarando que faltou e por quê. Boa resposta — mas ver **T-05** |
| **N-06** prompts datados à frente do commit | **CAIU (mitigado)** | `docs/ia/README.md` declara a convenção *"o carimbo confiável é o do git"*. Sobra só 0009 (~22:00 × add 21:54:31), agora coberto pela declaração. **E: o item 0006 da 2ª auditoria era falso positivo** — o add é `bc273f2` 20:32:31, não `add134d` |
| **N-07** contas do tempo não fecham | **NÃO CAIU — PIOROU** | ver **T-01** e **T-02** |
| **N-08** `onde-o-agente-errou.md` sem a 4ª correção de rumo | **CAIU, e caiu bem** | +15 linhas, terminando em *"O valor do subagente não foi capacidade técnica: foi não ter memória do que eu quis dizer"* |
| **N-09** D-06 não mapeia todas as ocorrências | **NÃO CAIU** | passou de 1 para 3 endereços; **são pelo menos 5** — ver **T-03** |

---

## 5. O PDF, conferido contra o binário

Extraí o texto decodificando os CMaps `ToUnicode` de cada subconjunto de fonte,
sem depender do Markdown.

**O que confere:**

- **2 páginas.** `/Type /Pages … /Count 2`, objetos de página 2 e 9. ✔
- **As quatro perguntas respondidas**, nesta ordem: *"O que ficou de fora, e por
  quê"* · *"O que quebra primeiro se o volume for multiplicado por dez"* ·
  *"Qual das minhas decisões eu menos defenderia hoje"* · *"Quanto tempo isso
  tudo levou"*. ✔
- **Roboto, 11 pt, 1,15, 6 pt entre parágrafos, justificado** — os quatro
  pedidos do enunciado, verificados no binário e não no CSS:
  `MediaBox [0 0 594.96 841.92]` (A4); CTM do fluxo `.24 × 3.1249285 = 0,75`;
  corpo em `/F5 14.66 Tf` e `/F6 14.66 Tf` → **14,66 × 0,75 = 10,995 pt ≈ 11**;
  título `17.33 Tf` → 13 pt; código `12.66 Tf` → 9,5 pt; passo de linha
  predominante entre matrizes `Tm` = **17 px = 12,75 pt = 11 × 1,15**;
  `p { margin:0 0 6pt }` e `text-align:justify` no fonte;
  descritores de fonte com as métricas reais da Roboto (upem 2048, `CapHeight
  1456`, `XHeight 1082`) — não são de fonte substituta. ✔
- **`/CreationDate D:20260901034847+00'00'`** = 01/09 00:48:47 −03:00, um minuto
  antes de `7f968bb` (00:49:41): **o PDF foi mesmo regerado nesta rodada.** ✔
- **1.033 palavras** no Markdown — exatamente o que a mensagem de commit declara. ✔

**O que não confere:** ver **T-01**, **T-02**, **T-07** e **T-08**. Os dois
primeiros são novos e são graves; os dois últimos são baratos.

---

## 6. Achados NOVOS

### T-01 · GRAVE — "3h08" é a soma da tabela **anterior** à correção. A coluna soma **3h20**.

`docs/ia/registro-de-tempo.md:26` · `carta-de-fechamento.md:68` · **PDF pág. 1**

O commit `7f968bb` fez duas alterações na coluna de duração:

```
- | Fase 1b — plano de implementação | 20:14 | 20:32 | 0h21 |
+ | Fase 1b — plano de implementação | 20:14 | 20:32 | 0h18 |          (−3 min)
- | Fase 8 — auditoria e correções | 21:55 | 00:45 | 0h35* |
+ | Fase 8 — auditoria e correções | 21:55 | ver último commit | ~0h50* | (+15 min)
```

e, no mesmo diff, escreveu:

```
- **Total acumulado: aproximadamente 3h00**
+ **Total: 3h08**, somando a coluna de duração.
```

**3h08 = 188 min é a soma da tabela como ela era antes deste commit**
(19+9+7+22+**21**+5+5+14+8+29+7+7+**35**). Depois das duas alterações a coluna é
19+9+7+22+**18**+5+5+14+8+29+7+7+**50** = **200 min = 3h20**. O número nasceu
obsoleto dentro do próprio commit que o introduziu como correção. Nem sequer é
alcançável por arredondamento: as doze primeiras linhas já somam 2h30, e a Fase 8
precisaria de 38 min para fechar 3h08, quando 21:55 → 00:49 menos as ~2 h de
interrupção dá ~54 min.

**Por que importa mais do que parece.** É a resposta à quarta pergunta que o
enunciado exige na carta; está no artefato que viaja fora do repositório; e a
frase que a carrega — *"somando a coluna de duração de
`docs/ia/registro-de-tempo.md`"* — **manda o avaliador conferir**. É um erro que
se auto-denuncia para quem aceitar o convite, no parágrafo que o candidato
dedicou inteiro a explicar por que os números daquele arquivo agora são
confiáveis.

**Correção: 1 minuto.** Trocar "3h08" por "3h20" nos dois arquivos e regerar o PDF.

---

### T-02 · GRAVE — a carta e o registro de tempo agora se contradizem sobre a Fase 1b

`carta-de-fechamento.md:91-92` e **PDF pág. 2**: *"A especificação inteira e as
treze ADRs saíram em vinte e dois minutos de escrita; **o plano de
implementação, em vinte e um**."*
`registro-de-tempo.md:16` (após `7f968bb`): Fase 1b = **0h18**.

A 2ª auditoria apontou este número nos **dois** documentos (N-07: *"a Fase 1b
marca 0h21 num intervalo de 18 min, repetida na carta como 'vinte e um'"*). O
commit corrigiu a tabela e **não tocou na carta**. Antes de `7f968bb` os dois
documentos diziam 21 — errado, porém coerente. Depois, discordam entre si, e a
metade errada é a que está impressa no PDF.

Este é exatamente o mecanismo das três rodadas: **a correção é aplicada no
documento onde o erro foi apontado, e não no documento que o cita.** Foi assim
com a lista virtualizada (corrigida no README em `a70d6a9`, sobrevivente na carta
até `7f968bb`) e é assim de novo agora.

**Correção: 1 minuto** — "em dezoito" — mais o PDF.

---

### T-03 · MODERADO/GRAVE — D-06 diz "três lugares"; são pelo menos cinco, e os dois que faltam são os que afirmam **verificação**

`docs/spec/08-divergencias.md:109-115` cita `05-fatos-do-ambiente.md`,
`04-arquitetura.md` e `07-nao-feito.md`. `grep -rn "irtualiz" docs/` mostra que
faltam, no mínimo:

1. **`docs/spec/06-plano-de-testes.md:94`** — tabela "O que deliberadamente NÃO
   testamos": *"Virtualização com 800 itens | **Verificado à mão com fixture**;
   automatizar em jsdom mede pouco"*. **Afirma que a funcionalidade inexistente
   foi verificada manualmente.** É a pior das cinco: as outras prometem, esta
   atesta.
2. **`docs/spec/01-requisitos.md`** — **RF-06 está marcado `✅` ("implementado na
   fatia", pela legenda da linha 7)** e o seu segundo critério de aceite é
   literalmente *"E o número de nós no DOM não cresce com o tamanho da fila"*.
   Na mesma página, **RNF-04**: *"Fila usável com 800 itens | **Teste com
   fixture de 800**"* — e `grep -rn "800" tests/` **não devolve nada**. Uma
   coluna "Verificação" nomeando um teste que não existe.
3. **`docs/spec/05-fatos-do-ambiente.md:325`** — a tabela "Resumo" lista
   *"virtualização"* na coluna **Resolvido** do fato (e). D-06 cita este arquivo,
   mas pela seção do fato (e) (:204/:209), não pela linha do resumo.

Também segue desatualizado `docs/ia/registro-de-verificacao.md:137`
(*"afirmada em três lugares"*).

**Por que isto é o achado mais interessante da rodada:** é a **mesma espécie** do
N-04, que esta rodada corrigiu. O N-04 era *"o registro de tempo subdeclara o
próprio erro (2 linhas × 3)"*. Ao consertar aquela subdeclaração, o candidato
criou outra — *"três lugares" × cinco* — no documento que existe para não
subdeclarar nada. A spec está corretamente congelada e **não deve** ser editada;
o conserto é D-06 listar os cinco endereços e destacar que dois deles afirmam
verificação.

**Correção: 5 minutos.**

---

### T-04 · MODERADO — a regra 6 do `CLAUDE.md` foi violada pelo próprio commit de correção

`CLAUDE.md:108-119` — *"Obrigações de registro (item II.4). **Estas não são
opcionais e não podem ser reconstruídas no fim**: … **Toda verificação do
candidato** sobre o que o agente devolveu vai para
`docs/ia/registro-de-verificacao.md`. **Todo erro do agente** percebido pelo
candidato vai para o mesmo registro."*

```
$ git show --stat 7f968bb
 docs/carta-de-fechamento.md | docs/carta-de-fechamento.pdf | docs/ia/README.md
 docs/ia/onde-o-agente-errou.md | prompts/0010… | prompts/0011… |
 docs/ia/registro-de-tempo.md | docs/spec/08-divergencias.md
 (8 arquivos — registro-de-verificacao.md NÃO está entre eles)
```

O arquivo termina em **V-006, 01/09/2026, 00:30**, que narra a **primeira**
auditoria. A segunda auditoria aconteceu, produziu nove achados, seis foram
aceitos e corrigidos — e **não existe V-007**. O registro que o `CLAUDE.md`
declara não-reconstruível-no-fim parou exatamente antes do episódio mais
instrutivo da entrega: o momento em que o candidato descobriu que a própria
correção tinha reincidido.

Não é falsidade — é a evidência do critério de 20% que a rodada produziu e não
guardou. E é literalmente o item que a seção "Procure ativamente por" da minha
definição chama de *"regra declarada no `CLAUDE.md` e violada"*.

**Correção: 10 minutos.** Um V-007 curto: o que o auditor achou, o que o
candidato reconferiu à mão, o que mudou, e que a soma saiu errada na correção da
soma — o que, escrito, vira ponto a favor em vez de achado.

---

### T-05 · MODERADO — o registro de prompts continua parando **um prompt antes** do commit auditado

`ls docs/ia/prompts/` vai de `0001` a `0011`. `0011` é *"rode o auditor de novo"*
— a instrução que **pediu a 2ª auditoria**. A instrução que **mandou aplicar as
correções**, e que produziu `7f968bb` (o commit sob auditoria), não está no
repositório. Não há `0012`.

É precisamente o buraco que `0010` foi recriado para tapar: o prompt ausente na
rodada anterior era o que mandara aplicar as correções de `a70d6a9`. O mesmo tipo
de prompt tornou a faltar, uma rodada depois, no commit que existia para
consertar a falta.

E a outra metade da correção incomoda mais do que a lacuna:

```
- | `prompts/` | **Todos** os prompts do candidato, íntegros, numerados e em ordem…
+ | `prompts/` | Os prompts do candidato, íntegros, numerados e em ordem…
```

**A palavra "Todos" foi apagada.** A frase ficou verdadeira sem que o registro
ficasse completo. Vale contrastar com a **D-08**, onde a mesma manobra foi a
resposta certa — lá não havia linter, e *"uma regra que ninguém pode executar é
pior que a ausência da regra"*. Aqui o artefato **existe**: o prompt foi digitado,
o commit prova que alguém o digitou. Mudar a afirmação em vez de completar o
registro é o inverso do que D-08 fez, e o enunciado pede *"os prompts, na íntegra
e em ordem"*, não "alguns prompts".

**Correção: 3 minutos.** Gravar `0012` com a instrução real e devolver o "Todos"
— ou, se ele não for recuperável, dizer isso em uma linha, como o `0010` fez.

---

### T-06 · MENOR — o parágrafo exigido pelo item II.3 descreve um teste que não existe assim

`README.md:118-120` — *"Pela mesma lógica testei o que **não deve acontecer** —
duplicata não vira segunda chamada paga, falha não reprocessa sozinha —, porque
efeito colateral ausente só se garante **contando as chamadas** que não foram
feitas."*

Nenhum dos dois testes nomeados conta chamadas:

- `tests/mocks/contrato.test.ts:31` (**T-02**) afirma `duplicado === true` e
  mesmo `id`. Prova o efeito, não conta chamada.
- `tests/mocks/contrato.test.ts:120` (**T-05**) afirma **409 ao reprocessar um
  documento que NÃO falhou** — cenário diferente do que o
  `06-plano-de-testes.md:62-65` descreve (*"Documento em `FALHOU` não dispara
  reprocessamento por conta própria … **Verificado por contagem de chamadas**"*).

O único teste que conta chamadas é `tests/features/conferencia.test.tsx:166-184`,
e ele é sobre **rejeição** (`expect(reprocessamentos).toBe(0)`). O comportamento
não está desguarnecido — `tests/entities/estado.test.ts:28` cobre a invariante 4
no domínio puro — mas o parágrafo que o enunciado **exige** descreve uma técnica
que os dois exemplos que ele cita não usam.

**Correção: 2 minutos** de redação, ou 10 para fazer o T-05 contar chamadas de
verdade num documento em `FALHOU` — o que seria melhor, porque fecharia também a
divergência com o plano de testes congelado.

---

### T-07 · MENOR — a carta é datada de 31 de agosto e narra a madrugada de 1º de setembro

`carta-de-fechamento.md:4` e **PDF pág. 1**: *"Leopoldo Couto · 31 de agosto de
2026"*. A mesma carta diz que o trabalho *"terminou na madrugada do dia
seguinte"* e que *"a segunda auditoria pegou"* o erro do registro de tempo. O
PDF carrega `/CreationDate D:20260901034847+00'00'` = **01/09 00:48:47 −03:00**.

O artefato que vai por e-mail está datado antes dos fatos que ele próprio narra.
Num documento cujo argumento central é que carimbo de tempo tem de bater com a
realidade, é uma ironia cara por dois caracteres.

**Correção: 30 segundos** + regerar o PDF.

---

### T-08 · COSMÉTICO — a Roboto viaja como Type3 (desenhos), não como programa de fonte

Os descritores `AAAAAA+Roboto-Bold` (obj 129), `BAAAAA+Roboto-Bold` (187) e
`CAAAAA+Roboto` (262) declaram `/FontFamily (Roboto)` **sem nenhum
`/FontFile`**; os glifos viajam como `/Subtype /Type3` com `/CharProcs`
(procedimentos vetoriais — conferi: `908 0 100 -1456 808 0 d1 777 -1456 m …`).
O único programa de fonte realmente embutido no arquivo é
`DAAAAA+Consolas` (`/FontFile2 263 0 R`), usado nos trechos em `code`.

**Não é defeito:** os contornos da Roboto vão dentro do PDF, o texto renderiza em
Roboto em qualquer máquina e extrai corretamente (os `ToUnicode` estão lá — foi
como li o arquivo). Registro por três motivos: o produtor foi
`Skia/PDF m152` (impressão do navegador), o arquivo pesa **119 KB para 1.033
palavras**, e um validador de PDF/A reportará as fontes como não embutidas. Se
algum dia a carta precisar passar por um sistema que exige embutimento, é aqui
que ela tropeça.

---

## 7. O que verifiquei e **não** achei defeito — porque também é resultado

| Verificação | Resultado |
|---|---|
| **RNF-02 — "tipos gerados, nunca escritos à mão; `gen:api` regenera; diff limpo"** | `npx openapi-typescript docs/spec/openapi.yaml` reproduz `types.gen.ts` **byte a byte** (0 linhas de diff com `--strip-trailing-cr`). Nunca tinha sido testado nas duas auditorias anteriores. **A promessa é real.** |
| **Spec escrita antes do código** | Os 8 `.md` de spec + `openapi.yaml` foram tocados **apenas** por `add134d` (`spec-v1`, 20:14:09). Primeiro commit com `src/`: `eba0889`, 20:42:10. Só `08-divergencias.md` cresce, que é o desenho correto. |
| **Regra 3 do `CLAUDE.md`** (nenhuma rede fora de `shared/api/`) | Único acerto do grep é `documento.refetch()` — método do TanStack Query, não rede. ✔ |
| **Regra 4** (nada de dado pessoal em `localStorage`) | zero ocorrências de `localStorage`/`sessionStorage`/`indexedDB` em `src/`. ✔ |
| **RF-04 "o acompanhamento pausa quando a aba fica oculta"** | `usePollingLote.ts:19-24`, `visibilitychange`. ✔ |
| **RF-07, 3º critério** (sem identidade do host → "outra sessão") | `identidade.ts:20-35`, `useClaim.ts:42-45`, `PaginaFilaConferencia.tsx:103`. ✔ |
| **RF-11** (recálculo do nome, mas edição manual prevalece) | `PaginaConferencia.tsx:33,66-67` — `nomeEditadoManualmente`. ✔ |
| **RNF-07** (erro reportado sem valor de campo) | `http.ts:58-71,120,124` — `sanitizarErro` no último ponto de saída. ✔ |
| **ADR-005 × código** | ADR promete "2 s / 5 s / 15 s"; `backoff.ts:9-10` entrega exatamente isso. ✔ |
| **ADR-009 × código** | ADR promete TTL de 5 min; `handlers.ts:116` = `5 * 60_000`, `useClaim.ts:15` renova aos 2 min. ✔ |
| **T-01 … T-08 do plano de testes** | todos têm teste correspondente (T-05 com a ressalva do **T-06** acima). |
| **Números citados** | 13 ADRs ✔ · `spec-v1` = "24 files, **2.728** insertions" ✔ · plano 1.188 linhas ✔ · 6 fixtures ✔ · 10 documentos semeados, 6 em conferência ✔ · 64 testes ✔ · carta 1.033 palavras ✔ · 9 divergências ✔ |

---

## 8. Nota por critério

| Peso | Critério | 1ª | 2ª | **3ª** |
|---|---|---|---|---|
| 30% | Arquitetura e modularidade | 26 | 27 | **27** |
| 20% | Rastreabilidade das decisões | 15 | 17 | **16** |
| 20% | Uso de IA como ferramenta de engenharia | 18 | 17 | **17** |
| 15% | Especificação e método | 13 | 13 | **13** |
| 15% | Atenção e proatividade | 12 | 12 | **12** |
| | **Total** | 84 | 86 | **85 / 100** |

### 30% — Arquitetura → **27/30** (=)

Nada no código mudou nesta rodada e nada regrediu. Reconferi as costuras e todas
seguem reais: `fetch` num arquivo só, `entities/` puro, dependência
`app → pages → features → entities → shared` verificada por teste, tipo de
documento novo renderizando sem uma linha nova. **Somei uma evidência que
faltava:** `gen:api` reproduz os tipos byte a byte, o que transforma "contrato
primeiro" de afirmação em fato verificável. Continuam pesando os mesmos dois
descontos assumidos: sem CI (D-09) e sem virtualização (D-06).

### 20% — Rastreabilidade → **16/20** (−1)

**Caiu um ponto, e o motivo é preciso.** As duas travas da rodada anterior
sumiram (N-01, N-02) — isso valia subir. Mas entraram três defeitos de
rastreabilidade piores do que os que saíram: a carta afirma um total que **cita o
arquivo pelo nome e erra a soma dele** (T-01); a carta e o registro de tempo
**se contradizem** onde antes concordavam (T-02); e o documento que existe para
não subdeclarar divergência **subdeclarou de novo** (T-03) — e as duas
ocorrências que faltam são as que dizem *"Verificado à mão"* e *"Teste com
fixture de 800"*.

`08-divergencias.md` continua sendo o melhor documento da entrega e D-08/D-09
seguem exemplares. Mas rastreabilidade se mede pela pior peça que atravessa a
fronteira do repositório, e a carta atravessou com uma conta errada pela terceira
rodada seguida.

### 20% — Uso de IA → **17/20** (=)

**Sobe:** o `0010` recriado com `lacuna:` no cabeçalho é a resposta certa e
generosa; a ressalva sobre as datas no `docs/ia/README.md` (*"o carimbo confiável
é o do git"*, com o comando colado) é honestidade operacional de verdade; e os
quatro parágrafos acrescentados a `onde-o-agente-errou.md` finalmente colocam a
melhor evidência da entrega no arquivo que o enunciado exige — *"eu instruí o
auditor a não acreditar na narrativa do repositório sobre si mesmo, e era eu quem
estava acreditando na minha"*. Isso é grau de controle.

**Desce, na mesma medida:** o commit que consertou o registro **não se
registrou** (T-04, e é uma regra "inviolável" do próprio `CLAUDE.md`), e a lacuna
de prompts foi fechada de um lado e reaberta do outro, com "Todos" apagado do
README (T-05). O enunciado é explícito: *"o uso é livre, o registro é
obrigatório"*.

### 15% — Especificação e método → **13/15** (=)

Congelamento verificado de novo e agora de forma exaustiva: nenhum dos 9
documentos de spec foi tocado depois de `spec-v1`, 28 minutos antes da primeira
linha de `src/`. O plano de 16 tarefas com guardas G1–G10 é método real, e o
`gen:api` determinístico prova o "contrato primeiro".

Não sobe porque apareceram **três promessas de verificação na spec sem
verificação correspondente** e nenhuma registrada: RNF-04 nomeia um "teste com
fixture de 800" que não existe; `06-plano-de-testes.md:94` diz que a
virtualização foi "verificada à mão"; T-02 e T-05 dizem "conta as chamadas" e não
contam. A spec congelada está certa em não mudar — o que falta é
`08-divergencias.md` nomeá-las. Continua também sem nenhuma pergunta enviada ao
autor do enunciado, que diz duas vezes que perguntas contam a favor.

### 15% — Atenção e proatividade (fatos a–g) → **12/15** (=)

Nenhum fato mudou de situação. Reconferi os sete no código, um por um; o quadro
está na seção 9. O desconto continua vindo de **(e)** — virtualização ausente e
priorização de fila fora, ambas assumidas — e nada nesta rodada tocou nisso.

---

## 9. Tabela dos sete fatos — situação em `7f968bb`

| Fato | Situação | Evidência reconferida nesta rodada |
|---|---|---|
| (a) modelo 5–40 s, caro, instável | **Resolvido**, risco residual | `202` + `RECEBIDO`; `FALHOU`/`EXPIRADO` de 1ª classe em `entities/documento/estado.ts`; retry só em GET (`http.ts`); backoff 2/5/15 s exatamente como a ADR-005 promete |
| (b) foto torta, nome lixo | **Resolvido**, HEIC como risco | `shared/lib/imagem.ts` (`TAMANHO_MAXIMO` 20 MB, `LADO_MAXIMO` 2000 px — batem com RF-02); primeiro item semeado é o torto de propósito (`dados.ts:365`) |
| (c) duplicatas | **Resolvido**, duas camadas | hash antes de qualquer requisição (`upload/deduplicacao.ts`) + `duplicado: true` do servidor |
| (d) dado pessoal sensível | **Resolvido** no escopo do cliente | zero `localStorage`; só ID opaco na rota; `sanitizarErro` em `http.ts`; máscara em `shared/lib/mascara.ts`. Bloqueio por inatividade continua ausente → **D-07** |
| (e) 150/dia, 800 no pico | **Parcial** | polling em lote + backoff; cursor 50/pág.; **virtualização ausente (D-06, e agora com dois endereços a mais)**; priorização fora, com gatilho declarado |
| (f) modelo e prompts vão mudar | **Resolvido** — é a espinha | ADR-008; `gen:api` determinístico; o teste que inventa "Certidão de Nascimento" segue sendo o melhor da entrega |
| (g) dois conferentes | **Resolvido** | claim TTL 5 min (`handlers.ts:116`) + `If-Match`; degradação anônima implementada (`identidade.ts`); T-01 verifica as quatro propriedades |

---

## 10. O que eu corrigiria antes de enviar, por retorno sobre esforço

1. **(1 min + PDF) "3h08" → "3h20"** em `registro-de-tempo.md:26` e
   `carta-de-fechamento.md:68`. É o erro mais barato e o mais caro de deixar: está
   no PDF, responde a uma das quatro perguntas obrigatórias e convida a conferência.
2. **(1 min + PDF) "em vinte e um" → "em dezoito"** em `carta-de-fechamento.md:92`.
   Enquanto ficar, dois documentos entregues discordam.
3. **(30 s + PDF) A data da carta** → 1º de setembro de 2026.
4. **(5 min) D-06 passa a listar os cinco endereços**, com uma frase dizendo que
   dois deles (`06-plano-de-testes.md:94` e `01-requisitos.md` RNF-04) **afirmam
   verificação**, não só promessa. E corrigir `registro-de-verificacao.md:137`.
5. **(10 min) Escrever V-007** em `registro-de-verificacao.md`. É obrigação do
   `CLAUDE.md` e é, de longe, o item de maior retorno da lista para o critério de
   20%: o episódio "corrigi a soma e a soma saiu errada" é melhor material do que
   qualquer coisa que se possa acrescentar de propósito.
6. **(3 min) Gravar o prompt `0012`** (a instrução que produziu `7f968bb`) e
   devolver o **"Todos"** ao `docs/ia/README.md`.
7. **(2 min) Ajustar a frase do README sobre "contar as chamadas"** — ou (10 min,
   melhor) fazer o T-05 contar chamadas num documento em `FALHOU`, o que fecha
   também a divergência com o plano de testes.
8. *(opcional, 20 min)* CI mínimo com `typecheck` + `test`, que encerra D-09.

**Somado: menos de 25 minutos** para os itens 1 a 7. É a terceira vez que esta
frase aparece neste relatório em rodadas diferentes, e é o achado de método que
sobrevive a todos os outros.

---

## 11. Recomendação de processo — porque o padrão importa mais que os itens

Três rodadas, três reincidências, sempre com a mesma assinatura:

| Rodada | O que consertou | O que criou |
|---|---|---|
| `a70d6a9` | fases 6 e 7 datadas para o futuro | fase 8 datada para o futuro; e a carta ficou com "virtualizada" e "cinco divergências" |
| `7f968bb` | fase 8 (conserto **estrutural** — certo) | **soma errada** na mesma linha do conserto; carta em desacordo com a tabela; D-06 subdeclarando de novo |

O erro nunca está no item apontado — está no **vizinho aritmético do item
apontado**, ou no **outro documento que cita o item apontado**. É diagnóstico e
tem conserto de processo, não de texto:

- **Antes de fechar qualquer rodada, refazer as contas que a rodada tocou.** Se
  uma célula da tabela mudou, o total mudou. Se o total está escrito em dois
  arquivos, os dois mudaram.
- **`grep` do número, não do assunto.** `grep -rn "3h08\|vinte e um\|três lugares" docs/`
  teria pego T-01, T-02 e T-03 em quinze segundos.
- **A carta é a última coisa a ser regerada, nunca a primeira.** Nas duas
  rodadas, o PDF saiu antes de o repositório estabilizar.

Isso dito, e para ser justo com o tamanho do que está sendo auditado: **esta é uma
entrega forte.** A arquitetura sustenta a promessa central, a spec é
demonstravelmente anterior ao código, o contrato regenera byte a byte, os testes
testam o que quebra em silêncio, e o `08-divergencias.md` é um documento que a
maior parte dos candidatos não saberia escrever. O que a segura em 85 é
contabilidade — e contabilidade é justamente o que a entrega escolheu como
argumento sobre si mesma. É por isso que custa.

---
---

FIMDOC
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && python -c "
import io
novo=open(r'$SCRATCH/terceira.md',encoding='utf-8').read()
antigo=open('auditoria/relatorio-final.md',encoding='utf-8').read()
# remove o titulo H1 duplicado do arquivo antigo
linhas=antigo.split('\n')
if linhas and linhas[0].startswith('# Relatório de auditoria'):
    antigo='\n'.join(linhas[1:]).lstrip('\n')
open('auditoria/relatorio-final.md','w',encoding='utf-8').write(novo+antigo)
print('OK — novo tamanho:', len(novo+antigo), 'bytes')
"
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && echo "--- cabeçalhos do relatório ---" && grep -n "^## \(TERCEIRA\|SEGUNDA\|PRIMEIRA\|ANEXO\)\|^# Relatório" auditoria/relatorio-final.md | head
```

`Write` · `C:\Users\LAMARCK\AppData\Local\Temp\claude\C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence\44b09d0e-9734-446d-9283-e4803cfd3aa7\scratchpad\terceira.md`

**Prepend third audit to report**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && python "C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad/prepend.py" 2>/dev/null || python -c "
p=r'C:/Users/LAMARCK/AppData/Local/Temp/claude/C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence/44b09d0e-9734-446d-9283-e4803cfd3aa7/scratchpad/terceira.md'
novo=open(p,encoding='utf-8').read()
antigo=open('auditoria/relatorio-final.md',encoding='utf-8').read()
ls=antigo.split('\n')
if ls and ls[0].startswith('# Relatório de auditoria'):
    antigo='\n'.join(ls[1:]).lstrip('\n')
open('auditoria/relatorio-final.md','w',encoding='utf-8').write(novo+antigo)
print('gravado, bytes =', len(novo+antigo))
"
```

**Verify report structure preserved**

```bash
cd "C:/Users/LAMARCK/Documents/LDC/CLAUDE CODE/DOC-Intelligence" && grep -n "^# Relatório\|^## TERCEIRA\|^## SEGUNDA\|^## ANEXO\|^## PRIMEIRA\|^# APROVADO\|^# REPROVADO" auditoria/relatorio-final.md && echo "--- linhas totais ---" && wc -l auditoria/relatorio-final.md && echo "--- git status (auditoria/ deve estar ignorada) ---" && git status --porcelain && echo "(vazio = ok)"
```

Terceira auditoria concluída. `auditoria/relatorio-final.md` atualizado com ela no topo; as duas anteriores estão preservadas (segunda a partir da linha 597, primeira no anexo a partir da 1033).

# VEREDITO: APROVADO COM RESSALVAS — ≈ 85/100 (era 86)

## Sim: a rodada de correção introduziu erros novos, como as duas antes dela

É a terceira vez seguida, e pela terceira vez o erro atravessou para o PDF. A assinatura é sempre a mesma: **o defeito não está no item apontado — está no vizinho aritmético do item apontado, ou no outro documento que cita o item apontado.**

| Rodada | Consertou | Criou |
|---|---|---|
| `a70d6a9` | fases 6 e 7 datadas para o futuro | fase 8 datada para o futuro; carta ficou com "virtualizada" e "cinco divergências" |
| `7f968bb` | fase 8 (conserto estrutural — correto) | **soma errada na própria linha do conserto**; carta em desacordo com a tabela; D-06 subdeclarando de novo |

## Nota por critério

| Peso | Critério | 1ª | 2ª | **3ª** |
|---|---|---|---|---|
| 30% | Arquitetura e modularidade | 26 | 27 | **27** |
| 20% | Rastreabilidade das decisões | 15 | 17 | **16** ↓ |
| 20% | Uso de IA | 18 | 17 | **17** |
| 15% | Especificação e método | 13 | 13 | **13** |
| 15% | Atenção e proatividade | 12 | 12 | **12** |
| | | 84 | 86 | **85** |

## O que caiu (6 de 9)

"Lista virtualizada" e "cinco divergências" saíram da carta **e do PDF** (extraí o binário: agora lê "a fila continua paginada por cursor" e "as **nove** divergências", e `grep -c "^## D-"` = 9). A Fase 8 recebeu conserto **estrutural** — a coluna "fim" diz "ver último commit" — que é a resposta certa. "Duas linhas" virou "fases 6, 7 e 8". Prompt 0010 recriado com a lacuna declarada no cabeçalho. `onde-o-agente-errou.md` finalmente incorporou a quarta correção de rumo. Um item da 2ª auditoria, aliás, era **falso positivo**: o prompt 0006 foi adicionado em `bc273f2` 20:32:31, não em `add134d`.

## O que é NOVO (e grave)

**T-01 — "3h08" é a soma da tabela ANTERIOR à correção. A coluna soma 3h20.** O commit mudou a Fase 1b de 0h21→0h18 (−3) e a Fase 8 de 0h35→~0h50 (+15) e, no mesmo diff, escreveu "Total: 3h08, somando a coluna de duração". 188 min era a soma de antes; a de agora é 200 = 3h20. O número está em `registro-de-tempo.md:26`, na carta e **na página 1 do PDF**, numa frase que cita o arquivo pelo nome e manda o avaliador conferir. É a resposta à quarta pergunta obrigatória do enunciado.

**T-02 — a carta e o registro de tempo agora se contradizem.** A carta (`:92`, PDF pág. 2) mantém "o plano de implementação, em vinte e um"; a tabela diz 0h18. Antes de `7f968bb` os dois diziam 21 — errado, porém coerente. A correção foi aplicada só onde o erro foi apontado.

**T-03 — D-06 diz "três lugares"; são pelo menos cinco, e os dois que faltam são os que afirmam VERIFICAÇÃO.** Faltam `06-plano-de-testes.md:94` ("Virtualização com 800 itens | **Verificado à mão com fixture**") e `01-requisitos.md` (RF-06 marcado **✅ implementado**, cujo critério é literalmente "o número de nós no DOM não cresce"; e RNF-04, "**Teste com fixture de 800**" — `grep -rn "800" tests/` não devolve nada). É a mesma espécie do N-04 que esta rodada corrigiu.

**T-04 — a regra 6 do próprio `CLAUDE.md` foi violada pelo commit de correção.** `git show --stat 7f968bb` não toca `registro-de-verificacao.md`, que para em V-006 (antes da 2ª auditoria). Não existe V-007. A regra diz, textualmente, que essas obrigações "não podem ser reconstruídas no fim".

**T-05 — o registro de prompts continua parando um prompt antes do commit auditado.** Não há `0012`: a instrução que produziu `7f968bb` não está no repositório — exatamente o buraco que o `0010` foi recriado para tapar. E a outra metade da "correção" foi **apagar a palavra "Todos"** de `docs/ia/README.md`, tornando a frase verdadeira sem completar o registro.

**T-06 (menor)** — o parágrafo que o item II.3 exige (`README.md:118-120`) diz que testou contando chamadas; nenhum dos dois testes que ele nomeia conta chamadas, e o T-05 testa cenário diferente do descrito no plano. **T-07 (menor)** — a carta é datada de 31/08 e narra a madrugada de 01/09. **T-08 (cosmético)** — a Roboto vai como Type3 (desenhos), sem `/FontFile`; renderiza certo, mas um validador PDF/A reclamará; e o `.html` que gera o PDF está no `.gitignore`.

## O que permanece verificado (e é bom)

`npm test` 64/64 · `tsc --noEmit` limpo · `vite build` limpo · árvore limpa. **Duas verificações inéditas passaram:** `npx openapi-typescript` reproduz `types.gen.ts` **byte a byte** (RNF-02 é fato, não afirmação), e os 9 documentos de spec foram tocados **só** por `add134d` (spec-v1, 20:14:09), 28 min antes do primeiro `src/` (`eba0889`, 20:42:10). Regras 3 e 4 do `CLAUDE.md` holds (zero `fetch` fora de `shared/api/`, zero `localStorage`). ADR-005 (2/5/15 s) e ADR-009 (TTL 5 min) batem com o código linha a linha. O PDF cumpre os quatro pedidos de forma: 2 páginas, 11 pt (`14.66 Tf × 0,75` de CTM = 10,995), 1,15 (passo de 17 px), 6 pt entre parágrafos, justificado.

## Está pronta para enviar?

**Não ainda — falta menos de 25 minutos.** Em ordem: (1) 3h08 → 3h20 nos dois arquivos + PDF; (2) "vinte e um" → "em dezoito" + PDF; (3) data da carta → 1º de setembro; (4) D-06 listar os cinco endereços; (5) escrever o V-007 — é o item de maior retorno da lista, porque "corrigi a soma e a soma saiu errada" é melhor material do que qualquer coisa acrescentada de propósito; (6) gravar o prompt 0012 e devolver o "Todos".

E uma recomendação de processo, que vale mais que os itens: **`grep` do número, não do assunto.** `grep -rn "3h08\|vinte e um\|três lugares" docs/` teria pego T-01, T-02 e T-03 em quinze segundos. A carta deve ser a última coisa regerada, nunca a primeira — nas duas rodadas o PDF saiu antes de o repositório estabilizar.

Dito isso: a entrega é forte. O que a segura em 85 é contabilidade — e contabilidade é justamente o que ela escolheu como argumento sobre si mesma. É por isso que custa caro.
