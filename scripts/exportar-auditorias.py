#!/usr/bin/env python3
"""
Exporta as transcricoes dos SUBAGENTES auditores.

Por que num script proprio: aqui o que importa nao e o texto do agente — sao os
COMANDOS que ele rodou. E neles que se ve a ferramenta conferindo as afirmacoes
do repositorio em vez de acreditar nelas. Por isso os comandos saem na integra,
e nao resumidos como na transcricao da sessao principal.

Uso:
    python scripts/exportar-auditorias.py
"""
from __future__ import annotations

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SESSAO = "44b09d0e-9734-446d-9283-e4803cfd3aa7"
PASTA = (Path.home() / ".claude" / "projects"
         / "C--Users-LAMARCK-Documents-LDC-CLAUDE-CODE-DOC-Intelligence"
         / SESSAO / "subagents")
SAIDA = RAIZ / "docs" / "ia" / "transcricao" / "auditorias"

AUDITORIAS = [
    ("a1cdacab10798cd2a", "0-primeira-tentativa-interrompida",
     "Primeira tentativa — interrompida por limite de uso da sessão",
     "Não chegou a emitir veredito: parou após seis chamadas de ferramenta. "
     "Fica registrada porque a interrupção é parte honesta do que aconteceu."),
    ("a9a05ca0bff8e2ad0", "1-primeira-auditoria",
     "Primeira auditoria — APROVADO COM RESSALVAS, 84/100",
     "Encontrou três achados graves, entre eles um registro de tempo com horários "
     "estimados para a frente e uma lista virtualizada afirmada em três lugares e "
     "inexistente no código."),
    ("a8ae6b30f4f77ba43", "2-segunda-auditoria",
     "Segunda auditoria — 86/100, seis achados novos",
     "As ressalvas anteriores caíram, mas quatro dos seis achados novos foram "
     "INTRODUZIDOS pela própria rodada de correção."),
    ("a850b3732dbf9b99b", "3-terceira-auditoria",
     "Terceira auditoria — 85/100, o padrão nomeado",
     "Encontrou oito achados e nomeou o padrão que as duas anteriores não viram: "
     "o defeito não está no item apontado, está no vizinho aritmético dele ou no "
     "outro documento que o cita."),
]

NA_INTEGRA = {"Grep": "pattern", "Glob": "pattern", "Read": "file_path", "Write": "file_path"}


def texto_de(conteudo) -> str:
    if isinstance(conteudo, str):
        return conteudo
    partes = []
    for bloco in conteudo or []:
        if isinstance(bloco, dict) and bloco.get("type") == "text":
            partes.append(bloco.get("text", ""))
    return "\n".join(p for p in partes if p.strip())


def detalhar(bloco: dict) -> str:
    nome = bloco.get("name", "?")
    entrada = bloco.get("input") or {}

    if nome == "Bash":
        comando = (entrada.get("command") or "").strip()
        desc = entrada.get("description", "")
        cabeca = "**" + desc + "**\n\n" if desc else ""
        return cabeca + "```bash\n" + comando + "\n```"

    campo = NA_INTEGRA.get(nome)
    if campo and isinstance(entrada.get(campo), str):
        valor = entrada[campo].replace(str(RAIZ), "")
        return "`" + nome + "` · `" + valor.lstrip("/").lstrip("\\")[:200] + "`"

    return "`" + nome + "`"


def exportar(ident, arquivo, titulo, resumo):
    origem = PASTA / ("agent-" + ident + ".jsonl")
    if not origem.exists():
        return None

    partes = [
        "# " + titulo, "",
        "> " + resumo, "",
        "> Transcrição do subagente auditor, gerada por "
        "`scripts/exportar-auditorias.py`. **Não editada à mão.**", "",
        "> O auditor roda em **contexto frio**, sem memória do que o autor quis dizer, "
        "com uma instrução no centro: *não acreditar na narrativa do repositório sobre "
        "si mesmo*. Os comandos abaixo aparecem **na íntegra**, porque são a evidência "
        "— é neles que se vê a verificação acontecendo.", "",
        "---", "",
    ]

    primeira = True
    ferramentas = 0

    with origem.open(encoding="utf-8") as f:
        for linha in f:
            linha = linha.strip()
            if not linha:
                continue
            try:
                reg = json.loads(linha)
            except json.JSONDecodeError:
                continue
            if reg.get("type") == "attachment":
                continue

            msg = reg.get("message") or {}
            papel = msg.get("role")
            conteudo = msg.get("content")

            if papel == "user" and primeira:
                primeira = False
                partes += ["## A instrução dada ao auditor", "",
                           "> " + texto_de(conteudo).replace("\n", "\n> "),
                           "", "---", "", "## O que ele fez", ""]
            elif papel == "assistant":
                txt = texto_de(conteudo)
                if txt:
                    partes += [txt, ""]
                for bloco in conteudo or []:
                    if isinstance(bloco, dict) and bloco.get("type") == "tool_use":
                        ferramentas += 1
                        partes += [detalhar(bloco), ""]

    partes.insert(9, "**" + str(ferramentas) + " chamadas de ferramenta.**\n")

    SAIDA.mkdir(parents=True, exist_ok=True)
    alvo = SAIDA / (arquivo + ".md")
    alvo.write_text("\n".join(partes), encoding="utf-8")
    return alvo.name, alvo.stat().st_size // 1024


def main() -> None:
    if not PASTA.is_dir():
        raise SystemExit("Pasta de subagentes nao encontrada: " + str(PASTA))
    print("Exportando as auditorias\n")
    for ident, arquivo, titulo, resumo in AUDITORIAS:
        r = exportar(ident, arquivo, titulo, resumo)
        print("  {:42s} {:>4d} KB".format(r[0], r[1]) if r else "  (ausente) " + ident)


if __name__ == "__main__":
    main()
