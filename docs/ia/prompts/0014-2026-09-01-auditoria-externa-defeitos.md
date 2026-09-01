---
ordem: 14
data: 2026-09-01, manhã (carimbo exato: `git log -- <este arquivo>`)
canal: Claude Code (Opus 5) — sessão interativa, worktree `auditoria-defeitos-criticos`
autor: candidato
nota: transcrito na íntegra, exatamente como foi escrito. Não houve reescrita posterior.
contexto: uma auditoria externa (fora deste repositório) leu a entrega e devolveu uma
  lista de defeitos e oportunidades, organizada em quatro blocos com estimativa de tempo.
  O candidato repassou a lista ao agente, com a proibição explícita de ampliar o escopo
  funcional e com as regras de processo do CLAUDE.md reafirmadas dentro do próprio prompt.
---

Você está no repositório do DOC Intelligence (Trilha B). Leia primeiro docs/enunciado.md,
CLAUDE.md e docs/spec/05-fatos-do-ambiente.md.

Uma auditoria externa e encontrou os itens abaixo. Trate-os na ordem. NÃO acrescente funcionalidade
nova: nada de tela de busca, dashboard, cadastro de clientes ou tema escuro. O argumento
central da entrega é a fatia estreita e honesta, e ampliá-la agora o destrói.

REGRAS DE PROCESSO (as minhas, do CLAUDE.md — valem aqui):
- Este prompt vai íntegro para docs/ia/prompts/0014-*.md antes de qualquer alteração.
- Toda divergência nova entra em docs/spec/08-divergencias.md com número (D-10 em diante).
- Toda decisão com alternativa descartada vira ADR em docs/adr/.
- Nada é declarado pronto sem rodar o comando e colar a saída.
- Não invente requisito: se algo aqui exigir decisão minha, pare e pergunte.

──────────────────────────────────────────────────────────────
BLOCO 1 — DEFEITOS (obrigatório; ~1h30)
──────────────────────────────────────────────────────────────

1.1 ErrorBoundary
    CLAUDE.md §4 diz que app/ tem error boundary. Não tem. Crie
    src/app/FronteiraDeErro.tsx e monte-o em App.tsx, envolvendo as rotas.
    A tela de falha deve: dizer o que aconteceu em linguagem de atendimento
    (não stack trace), oferecer recarregar e oferecer voltar à fila — porque
    quem vê isso está com um documento aberto no meio da conferência.
    Escreva um teste que renderiza um filho que lança e verifica que a
    fronteira segura, que a mensagem aparece, e que o resto do app segue vivo.

1.2 Diálogos que declaram aria-modal e não cumprem
    ConflitoDialog e RejeitarDialog têm role="dialog" e aria-modal="true" sem
    foco inicial, sem Escape, sem retorno de foco e sem contenção de Tab.
    Extraia um único componente Dialogo em src/shared/ui/ que resolva os quatro
    pontos, e faça os dois diálogos usarem-no. Teste com @testing-library/user-event:
    ao abrir, o foco vai para dentro; Escape fecha; ao fechar, o foco volta ao
    elemento que abriu.

1.3 aria-live na tela de acompanhamento
    O estado muda sozinho por polling de 5 a 40 s e nada é anunciado. Acrescente
    uma região aria-live="polite" que anuncie transições de estado de forma
    resumida e sem dado pessoal (regra 4 do CLAUDE.md: nada de dado pessoal em
    log, URL ou anúncio). Não anuncie a cada tick — só quando o estado muda.

1.4 A afirmação sobre busca
    README.md ("Sem busca. Projetada e servida pelo mock") e docs/spec/07-nao-feito.md
    ("Especificado e servido pelo mock") dão a entender que existe busca no contrato.
    Não existe: openapi.yaml não tem parâmetro de termo e handlers.ts lê apenas
    estado, limite e cursor.
    Escolha UMA e me diga qual escolheu:
      (a) corrigir o texto para "listagem filtrada por estado, servida pelo mock;
          busca por termo não especificada" — 5 min, e volta a ser verdade;
      (b) acrescentar o parâmetro q ao openapi.yaml e ao mock, regerar os tipos
          com npm run gen:api e testar o filtro — 20 min, e a frase vira verdade.
    Se escolher (b), a tela continua não existindo e isso continua declarado.

──────────────────────────────────────────────────────────────
BLOCO 2 — FATOS DO AMBIENTE (alto retorno; ~2h)
──────────────────────────────────────────────────────────────

2.1 Fato (b): a pessoa está no celular, não só o arquivo
    O tratamento de (b) hoje cobre o arquivo (whitelist, redução, EXIF, hash) e
    não cobre a interface. Há uma única media query em estilos.css, e a
    conferência usa minmax(360px, .9fr), que estoura num aparelho de 360px.
    Faça as telas de ENVIO e ACOMPANHAMENTO funcionarem a 360px de largura:
    alvos de toque de 44px, sem rolagem horizontal, sem tabela que estoura.
    Deixe a CONFERÊNCIA como desktop, por decisão, e escreva a ADR:
    "enviar é móvel, conferir é desktop" — com a alternativa descartada
    (conferência responsiva completa) e o motivo real (o documento original ao
    lado dos campos é a razão de ser da tela; empilhado no celular ela deixa de
    cumprir a função). Atualize a linha do fato (b) em 05-fatos-do-ambiente.md
    com o risco residual.

2.2 Fato (a): um segundo sinal de confiança, independente do modelo
    Hoje o único portão é a confiança que o próprio modelo declara. Um CPF
    inválido pelo dígito verificador com confiança 0,97 entra como PRONTO.
    Crie src/entities/documento/validacao-de-campo.ts (puro, sem React, sem
    fetch — a regra do CLAUDE.md sobre entities vale) com validação dirigida
    por tipoDeDado, que o DescritorDeCampo já carrega: CPF e CNPJ por dígito
    verificador, DATA por plausibilidade. Um campo que falha na validação vai
    para conferência MESMO com confiança alta, e o painel diz por que está ali
    ("o modelo confia, o formato não fecha").
    Teste os dois casos que importam: alta confiança + formato inválido → vai
    para conferência; baixa confiança + formato válido → continua indo, pelo
    motivo antigo. Registre como ADR, citando que o sinal do fornecedor é
    autodeclarado e será trocado (fato f).

2.3 Fato (e): a fila que não drena
    Minha carta diz que a 10x "a fila não drena e nada na minha interface avisa
    o gestor". Feche isso: no cabeçalho de PaginaFilaConferencia, mostre
    quantos aguardam e há quanto tempo espera o mais antigo, com destaque visual
    acima de um limite. Os dados já existem; não invente endpoint novo.
    Depois AJUSTE A CARTA: a frase deixa de ser "não tratei" e passa a ser
    "tratei o que a interface pode tratar; o resto é aritmética de pessoal, e
    é decisão de gestão, não de front-end". Mantenha a honestidade — não
    transforme em vitória o que continua sendo um limite real.

──────────────────────────────────────────────────────────────
BLOCO 3 — ARTEFATOS (barato e muito visível; ~1h30)
──────────────────────────────────────────────────────────────

3.1 CI — nenhum dos 8 concorrentes tem
    .github/workflows/ci.yml rodando em push e PR: npm ci, npm run typecheck,
    npm test e uma etapa que roda npm run gen:api e FALHA se o diff não vier
    vazio (o README afirma isso; a CI passa a provar). Ponha os selos no topo
    do README. Fecha a D-09 — atualize 08-divergencias.md dizendo que fechou.

3.2 Hook do agente — item II.4, o de maior retorno
    O enunciado pede "skills, subagentes, comandos, hooks ou servidores MCP" e
    hoje entrego CLAUDE.md e um subagente. Crie um hook PreToolUse em
    .claude/settings.json que BLOQUEIE a escrita quando o conteúdo introduzir
    (i) fetch( fora de src/shared/api/ ou (ii) um tipo de documento hardcoded
    ("RG", "contracheque", "procuração"…) em src/ fora de mocks/. As regras 2 e
    3 do CLAUDE.md deixam de depender de boa vontade e passam a ser mecânicas.
    Documente em docs/ia/README.md o que o hook impede e por quê, e registre no
    registro-de-verificacao.md se ele chegou a disparar.

3.3 Linter — fecha a D-08
    oxlint como devDependency, script "lint", zero avisos, e na CI. Se algum
    aviso exigir mudar código de verdade, PARE e me mostre antes de mudar.

3.4 Capturas no README
    Não há uma imagem na entrega. Duas, em docs/img/: (1) a conferência com o
    documento torto ao lado dos campos; (2) o diálogo de conflito nomeando quem
    alterou — é a melhor coisa do projeto e hoje ninguém a vê sem clonar.
    Use os documentos fictícios; confirme que nenhuma tela tem dado que pareça
    real antes de commitar.

3.5 docs/spec/exemplos.http
    Meia dúzia de requisições prontas contra npm run mock: envio, envio
    duplicado, status em lote, claim, PATCH com If-Match correto e PATCH com
    If-Match velho (o 409). Torna o contrato exercitável sem abrir a interface.

──────────────────────────────────────────────────────────────
BLOCO 4 — FECHAMENTO (obrigatório se qualquer bloco acima rodou)
──────────────────────────────────────────────────────────────

4.1 Rode o subagente auditor-de-entrega mais uma vez, em contexto frio, com a
    instrução de sempre: não acreditar na narrativa do repositório sobre si
    mesmo. Ele já encontrou, três vezes, o defeito no vizinho do item corrigido —
    conte com isso. Exporte a transcrição para docs/ia/transcricao/auditorias/.

4.2 Atualize: README (limitações e a tabela de critérios), 07-nao-feito.md,
    08-divergencias.md, registro-de-verificacao.md e registro-de-tempo.md com
    relógio real desta rodada. A carta de fechamento só muda no ponto 2.3 e na
    pergunta "qual decisão eu menos defenderia hoje", se esta rodada mudou a
    resposta. Regere o PDF e confira: 2 páginas, Roboto 11, entrelinha 1,15,
    6 pt entre parágrafos, justificado.

4.3 Ao final, me diga em uma tabela: o que foi feito, o que ficou de fora e por
    quê, e quanto tempo cada bloco levou de relógio.
