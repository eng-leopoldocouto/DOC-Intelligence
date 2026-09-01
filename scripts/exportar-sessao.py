#!/usr/bin/env python3
"""
Exporta a sessão do Claude Code para um documento legível.

Por que existe: o item II.4 do enunciado pede o registro do uso de IA. Os
prompts íntegros já estão em `docs/ia/prompts/`, mas eles mostram só um lado da
conversa. Este script produz o diálogo inteiro — o que foi pedido E o que foi
respondido — para quem quiser auditar a condução, e não apenas o resultado.

O que ENTRA: mensagens do candidato, respostas visíveis do agente, e um resumo
de cada uso de ferramenta (nome e alvo).

O que NÃO entra, e por quê:
  - blocos de raciocínio interno do modelo: não são parte da conversa, e
    incluí-los transformaria o documento em ruído;
  - conteúdo integral de arquivos lidos e escritos: está tudo no repositório,
    versionado, e repetir aqui multiplicaria o tamanho por dez.

Uso:
    python scripts/exportar-sessao.py            # gera Markdown e HTML
    python scripts/exportar-sessao.py --md-only
"""
from __future__ import annotations

import json
import sys
from datetime import datetime
from html import escape
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PROJETOS = Path.home() / ".claude" / "projects"
SAIDA = RAIZ / "docs" / "ia" / "transcricao"

# Ferramentas cujo alvo vale registrar (as demais viram só o nome)
ALVO = {
    "Read": "file_path", "Write": "file_path", "Edit": "file_path",
    "Bash": "description", "Glob": "pattern", "Grep": "pattern",
    "Agent": "description", "Skill": "skill", "Task": "description",
}


def encontrar_sessao() -> Path:
    """A sessão principal é o .jsonl na raiz da pasta do projeto (não em subagents/)."""
    pasta = PROJETOS / "C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence"
    candidatos = sorted(pasta.glob("*.jsonl"), key=lambda p: p.stat().st_size, reverse=True)
    if not candidatos:
        sys.exit(f"Nenhuma transcrição encontrada em {pasta}")
    return candidatos[0]


def texto_de(conteudo) -> str:
    """Extrai só os blocos de texto — descarta raciocínio interno e payloads."""
    if isinstance(conteudo, str):
        return conteudo
    partes = []
    for bloco in conteudo or []:
        if isinstance(bloco, dict) and bloco.get("type") == "text":
            partes.append(bloco.get("text", ""))
    return "\n".join(p for p in partes if p.strip())


def ferramentas_de(conteudo) -> list[str]:
    usos = []
    for bloco in conteudo or []:
        if isinstance(bloco, dict) and bloco.get("type") == "tool_use":
            nome = bloco.get("name", "?")
            campo = ALVO.get(nome)
            entrada = bloco.get("input") or {}
            alvo = entrada.get(campo) if campo else None
            if isinstance(alvo, str) and alvo:
                alvo = alvo.replace(str(RAIZ), "").lstrip("\/")
                usos.append(f"{nome} · {alvo[:110]}")
            else:
                usos.append(nome)
    return usos


def carregar(caminho: Path) -> list[dict]:
    turnos: list[dict] = []
    with caminho.open(encoding="utf-8") as f:
        for linha in f:
            linha = linha.strip()
            if not linha:
                continue
            try:
                reg = json.loads(linha)
            except json.JSONDecodeError:
                continue

            msg = reg.get("message") or {}
            papel = msg.get("role") or reg.get("type")
            conteudo = msg.get("content")
            carimbo = reg.get("timestamp", "")

            if papel == "user":
                txt = texto_de(conteudo)
                # Descarta ecos de resultado de ferramenta e lembretes do sistema
                if not txt or "<system-reminder>" in txt or txt.startswith("Caveat:"):
                    continue
                turnos.append({"papel": "candidato", "texto": txt, "quando": carimbo})

            elif papel == "assistant":
                txt = texto_de(conteudo)
                usos = ferramentas_de(conteudo)
                if txt or usos:
                    turnos.append({"papel": "agente", "texto": txt,
                                   "ferramentas": usos, "quando": carimbo})
    return turnos


def compactar(turnos: list[dict]) -> list[dict]:
    """Funde turnos consecutivos do agente: um turno lógico vira vários registros."""
    saida: list[dict] = []
    for t in turnos:
        if saida and t["papel"] == "agente" and saida[-1]["papel"] == "agente":
            anterior = saida[-1]
            if t.get("texto"):
                anterior["texto"] = (anterior.get("texto", "") + "\n\n" + t["texto"]).strip()
            anterior.setdefault("ferramentas", []).extend(t.get("ferramentas", []))
        else:
            saida.append(dict(t))
    return saida


def hora(carimbo: str) -> str:
    try:
        return datetime.fromisoformat(carimbo.replace("Z", "+00:00")).astimezone().strftime("%d/%m %H:%M")
    except Exception:
        return ""


CABECALHO = """# Transcrição da sessão

> Gerada por `scripts/exportar-sessao.py` a partir do registro local do Claude
> Code. **Não foi editada à mão** — se algo aqui parece desfavorável, ficou.

Este documento existe para o item II.4 do enunciado. Os prompts íntegros já
estão em [`../prompts/`](../prompts/); aqui está o **diálogo inteiro**, para
quem quiser auditar a condução do agente e não apenas o resultado dela.

**O que não está aqui:** o raciocínio interno do modelo, que não é parte da
conversa, e o conteúdo dos arquivos lidos e escritos, que está no repositório
versionado. As chamadas de ferramenta aparecem como resumo — nome e alvo.

| | |
|---|---|
| Turnos do candidato | {n_cand} |
| Turnos do agente | {n_ag} |
| Chamadas de ferramenta | {n_tool} |
| Início | {inicio} |
| Fim | {fim} |

---

"""


def gerar_markdown(turnos: list[dict]) -> str:
    n_cand = sum(1 for t in turnos if t["papel"] == "candidato")
    n_ag = sum(1 for t in turnos if t["papel"] == "agente")
    n_tool = sum(len(t.get("ferramentas", [])) for t in turnos)
    carimbos = [t["quando"] for t in turnos if t.get("quando")]

    partes = [CABECALHO.format(
        n_cand=n_cand, n_ag=n_ag, n_tool=n_tool,
        inicio=hora(carimbos[0]) if carimbos else "—",
        fim=hora(carimbos[-1]) if carimbos else "—",
    )]

    contador = 0
    for t in turnos:
        if t["papel"] == "candidato":
            contador += 1
            partes.append(f"## {contador}. Candidato · {hora(t['quando'])}\n")
            partes.append("> " + t["texto"].replace("\n", "\n> ") + "\n")
        else:
            if t.get("texto"):
                partes.append(t["texto"] + "\n")
            usos = t.get("ferramentas", [])
            if usos:
                linhas = "\n".join(f"- `{u}`" for u in usos)
                partes.append(
                    f"<details><summary>{len(usos)} chamada(s) de ferramenta</summary>\n\n{linhas}\n\n</details>\n"
                )
        partes.append("\n---\n")
    return "\n".join(partes)


def main() -> None:
    origem = encontrar_sessao()
    turnos = compactar(carregar(origem))
    SAIDA.mkdir(parents=True, exist_ok=True)

    md = gerar_markdown(turnos)
    (SAIDA / "sessao-completa.md").write_text(md, encoding="utf-8")

    tamanho = (SAIDA / "sessao-completa.md").stat().st_size / 1024
    print(f"origem : {origem.name} ({origem.stat().st_size / 1048576:.1f} MB)")
    print(f"turnos : {len(turnos)}")
    print(f"saida  : {SAIDA / 'sessao-completa.md'} ({tamanho:.0f} KB)")


if __name__ == "__main__":
    main()
