# ADR-013 — O nome padronizado é um campo conferível, não uma regra imposta

**Status:** aceita · **Data:** 31/08/2026 · **Resolve a premissa P4**

## Contexto

O comportamento 2 do produto pede *"**propor** um nome padronizado para o
arquivo"*. O verbo é *propor*, não *definir*.

O comportamento 4 diz que, sem confiança, *"a pessoa conferente corrige o que a
máquina errou"*.

O nome padronizado é **derivado dos campos extraídos** — algo como
`RG_JOAO_DA_SILVA_1234567.jpg`. Se os campos que o compõem são incertos a ponto
de exigir conferência, **o nome herda essa incerteza.**

## Decisão

**O nome padronizado é mais um campo sujeito a conferência.**

- A API devolve `nomePadronizado` como proposta e `padraoDeNome` no tipo (por
  exemplo `{tipo}_{nome}_{numero}`).
- A tela de conferência exibe o nome **editável**, ao lado do `nomeOrigem`
  ("como chegou"), para que a pessoa veja os dois.
- Corrigir um campo que compõe o nome **recalcula a proposta**.
- **Mas se a pessoa já editou o nome manualmente, a edição dela prevalece** e o
  recálculo não a sobrescreve.

Essa última regra é a única parte não óbvia, e é onde estaria o defeito: nada
irrita mais do que o sistema desfazer o que você acabou de digitar.

## Alternativas descartadas

**Regra determinística no servidor, somente leitura.** Garante padrão uniforme,
que é justamente o que o escritório quer — hoje uma pessoa "renomeia num padrão
interno". Descartada porque, se o nome nasce de um campo que a pessoa acabou de
corrigir, ele fica **inconsistente até algum reprocessamento**. E "propor"
viraria "impor" num campo derivado de dado incerto.

**Nome somente leitura, recalculado ao salvar.** Meio-termo econômico e
tentador. Descartada porque não cobre o caso em que o padrão simplesmente não se
aplica — documento com dois titulares, nome composto que estoura o limite do
sistema de arquivos, homônimo que precisa de desambiguação. Sem escape manual, a
pessoa não tem saída.

**Nome livre, sem proposta.** Descartada por jogar fora o ganho principal: o
sistema existe para eliminar os quatro minutos de trabalho manual, e digitar o
nome do zero é parte desses quatro minutos.

## Consequências

**Boas:** o nome participa do portão de confiança como qualquer outro dado
derivado; a pessoa tem escape para os casos que o padrão não previu; o
recálculo automático cobre o caso comum.

**Ruins:** uniformidade do padrão deixa de ser garantida — alguém pode digitar
um nome fora do formato. **Trocamos garantia por escape**, conscientemente. Uma
validação de formato com aviso não bloqueante seria o próximo passo natural, e
ficou de fora do prazo.

## Como saberemos que erramos

Se, em uso real, muitos nomes editados à mão saírem do padrão, a liberdade custou
mais do que rendeu — e a validação com aviso passa a valer a pena.
