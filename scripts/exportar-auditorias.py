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
SAIDA = RAIZ / "docs" / "ia" / "transcricao" / "auditorias"

# A pasta de transcricoes e DESCOBERTA, e nao fixa.
#
# A primeira versao deste script trazia o caminho de uma sessao especifica,
# numa maquina especifica, escrito a mao. Funcionou uma vez e quebrou na
# rodada seguinte — a quarta auditoria rodou noutra sessao, noutro diretorio
# de trabalho (um worktree), e o script apontava para um caminho que nao
# existia mais. Um exportador que so exporta o passado nao serve para nada.
PROJETOS = Path.home() / ".claude" / "projects"


def pastas_de_subagentes() -> list[Path]:
    """Todas as pastas de subagentes de qualquer sessao deste projeto."""
    if not PROJETOS.is_dir():
        return []
    encontradas = []
    for projeto in PROJETOS.iterdir():
        if "DOC-Intelligence" not in projeto.name:
            continue
        encontradas.extend(sorted(projeto.glob("*/subagents")))
    return encontradas


def achar_transcricao(ident: str) -> Path | None:
    for pasta in pastas_de_subagentes():
        caminho = pasta / ("agent-" + ident + ".jsonl")
        if caminho.exists():
            return caminho
    return None

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
    ("a6e307fd6c4bed077", "4-quarta-auditoria",
     "Quarta auditoria — 89,5/100, dez achados e o conserto estrutural",
     "Rodou depois de uma auditoria EXTERNA ao repositório. Confirmou por comando que "
     "as guardas seguram (hook, gen:api, linter, contrato), e ainda assim achou dez "
     "divergências texto x código — entre elas a quarta ocorrência do mesmo defeito no "
     "registro de tempo, desta vez pelo número que faltou escrever. Recomendou o passo "
     "de CI que compara as contagens do README com a realidade."),
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
    origem = achar_transcricao(ident)
    if origem is None:
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
    pastas = pastas_de_subagentes()
    if not pastas:
        raise SystemExit("Nenhuma pasta de subagentes encontrada em " + str(PROJETOS))
    print("Exportando as auditorias\n")
    for ident, arquivo, titulo, resumo in AUDITORIAS:
        r = exportar(ident, arquivo, titulo, resumo)
        print("  {:42s} {:>4d} KB".format(r[0], r[1]) if r else "  (ausente) " + ident)


if __name__ == "__main__":
    main()
