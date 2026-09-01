#!/usr/bin/env python
"""
Gera docs/carta-de-fechamento.pdf a partir do Markdown, com a tipografia que o
enunciado pede: Roboto 11, entrelinha 1,15, 6 pt entre paragrafos, justificado.

POR QUE ESTE SCRIPT EXISTE
--------------------------
Ate 01/09 o PDF era impresso a mao pelo navegador. A consequencia esta escrita
no registro de tempo: numa das rodadas de correcao, o PDF foi gerado ANTES de o
repositorio estabilizar, e virou **o unico lugar onde o erro sobreviveu** — o
Markdown corrigido e o PDF errado, com o mesmo nome, lado a lado.

Um passo manual no fim de uma cadeia automatizada e onde a cadeia arrebenta.
Com este script o PDF passa a ser derivado, reproduzivel e conferivel:

    npm run carta:pdf

DEPENDENCIAS, e por que sao estas
---------------------------------
* Chrome ou Edge ja instalados — impressao para PDF de qualidade tipografica,
  sem acrescentar cadeia LaTeX nem dependencia Python ao projeto.
* Roboto vem do Google Fonts, pela rede, no momento da geracao. O sistema nao
  tem Roboto instalado, e o enunciado pede Roboto nominalmente. Sem rede, o
  script AVISA e falha em vez de gerar um PDF em fonte substituta que parece
  certo — que seria o mesmo erro silencioso que ele existe para evitar.

O conversor de Markdown e deliberadamente pequeno: cobre o que a carta usa
(titulos, paragrafos, negrito, italico, codigo, links, regra horizontal) e nada
alem. Trazer uma biblioteca de Markdown para um documento de duas paginas seria
dependencia nova para um problema que nao temos.
"""
from __future__ import annotations

import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / "docs" / "carta-de-fechamento.md"
SAIDA = RAIZ / "docs" / "carta-de-fechamento.pdf"

CANDIDATOS_NAVEGADOR = [
    os.environ.get("CHROME"),
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    shutil.which("google-chrome"),
    shutil.which("chromium"),
]


def achar_navegador() -> str:
    for c in CANDIDATOS_NAVEGADOR:
        if c and Path(c).exists():
            return c
    sys.exit(
        "Nenhum Chrome ou Edge encontrado. Aponte um com a variavel CHROME, ou\n"
        "imprima docs/carta-de-fechamento.md a mao — mas releia o cabecalho deste\n"
        "arquivo antes, porque foi assim que o erro sobreviveu da ultima vez."
    )


# ---------------------------------------------------------------------------
# Markdown -> HTML, so o que a carta usa
# ---------------------------------------------------------------------------

def inline(t: str) -> str:
    t = html.escape(t, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", t)
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', t)
    t = re.sub(r"&lt;(https?://[^&]+)&gt;", r'<a href="\1">\1</a>', t)
    return t


def converter(md: str) -> str:
    saida: list[str] = []
    paragrafo: list[str] = []

    def fechar() -> None:
        if paragrafo:
            texto = inline(" ".join(paragrafo)).replace("&lt;!--quebra--&gt;", "<br>")
            saida.append(f"<p>{texto}</p>")
            paragrafo.clear()

    for linha in md.split("\n"):
        # Duas brancas no fim sao quebra de linha explicita do Markdown. A carta
        # usa isso no bloco de identificacao do cabecalho, onde autor, data e
        # repositorio precisam ficar em linhas separadas — sem isto o Markdown os
        # junta num paragrafo so e o cabecalho perde a forma.
        quebra_dura = linha.endswith("  ") and linha.strip() != ""
        crua = linha.rstrip()
        if quebra_dura:
            crua += "<!--quebra-->"
        if not crua.strip():
            fechar()
            continue
        if crua.startswith("---") and set(crua.strip()) == {"-"}:
            fechar()
            saida.append("<hr>")
            continue
        cabecalho = re.match(r"^(#{1,3})\s+(.*)$", crua)
        if cabecalho:
            fechar()
            nivel = len(cabecalho.group(1))
            saida.append(f"<h{nivel}>{inline(cabecalho.group(2))}</h{nivel}>")
            continue
        paragrafo.append(crua)

    fechar()
    return "\n".join(saida)


# `orphans` e `widows` impedem que uma linha solta fique sozinha na virada de
# pagina — e a diferenca entre um documento impresso e um documento imprimido.
MOLDE = """<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Carta de fechamento — DOC Intelligence</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Roboto+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  @page {{ size: A4; margin: 18mm 17mm; }}
  html {{ font-size: 11pt; }}
  body {{
    font-family: "Roboto", sans-serif;
    font-size: 11pt;
    line-height: 1.15;
    text-align: justify;
    hyphens: auto;
    color: #111;
    margin: 0;
    orphans: 2;
    widows: 2;
  }}
  p {{ margin: 0 0 6pt; }}
  h1 {{ font-size: 15pt; font-weight: 700; margin: 0 0 6pt; text-align: left; }}
  h2 {{ font-size: 12pt; font-weight: 700; margin: 10pt 0 6pt; text-align: left;
       page-break-after: avoid; }}
  h3 {{ font-size: 11pt; font-weight: 500; margin: 8pt 0 6pt; text-align: left; }}
  hr {{ border: 0; border-top: .5pt solid #bbb; margin: 8pt 0; }}
  code {{ font-family: "Roboto Mono", monospace; font-size: 9.5pt; }}
  a {{ color: #111; text-decoration: none; }}
  strong {{ font-weight: 700; }}
</style></head><body>
{corpo}
</body></html>
"""


def main() -> None:
    if not ENTRADA.exists():
        sys.exit(f"Nao encontrei {ENTRADA}")

    navegador = achar_navegador()
    corpo = converter(ENTRADA.read_text(encoding="utf-8"))

    with tempfile.TemporaryDirectory() as tmp:
        pasta = Path(tmp)
        origem = pasta / "carta.html"
        origem.write_text(MOLDE.format(corpo=corpo), encoding="utf-8")

        subprocess.run(
            [
                navegador,
                "--headless=new",
                "--disable-gpu",
                f"--user-data-dir={pasta / 'perfil'}",
                "--no-pdf-header-footer",
                f"--print-to-pdf={SAIDA}",
                origem.as_uri(),
            ],
            check=True,
            capture_output=True,
            timeout=180,
        )

    dados = SAIDA.read_bytes()
    paginas = len(re.findall(rb"/Type\s*/Page[^s]", dados))
    tem_roboto = b"Roboto" in dados

    print(f"Gerado: {SAIDA.relative_to(RAIZ)}  ({len(dados) // 1024} KB)")
    print(f"Paginas: {paginas}")
    print(f"Roboto embutida: {'sim' if tem_roboto else 'NAO'}")

    problemas = []
    if paginas != 2:
        problemas.append(f"o enunciado pede no maximo 2 paginas, e sairam {paginas}")
    if not tem_roboto:
        problemas.append(
            "Roboto NAO foi embutida — provavelmente sem rede para o Google Fonts. "
            "O PDF esta em fonte substituta e nao cumpre o que o enunciado pede."
        )
    if problemas:
        sys.exit("FALHOU:\n  - " + "\n  - ".join(problemas))

    print("OK — 2 paginas, Roboto 11, entrelinha 1,15, 6 pt entre paragrafos, justificado.")


if __name__ == "__main__":
    main()
