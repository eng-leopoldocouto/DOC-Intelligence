# 07 — O que não foi feito, e por quê

> *"Queremos ler sobretudo o que você não fez."*
> *"O que não foi feito deve estar escrito como não feito, e não escondido."*

Este é o documento que o enunciado diz querer ler primeiro. Cada item traz **o
que**, **por que ficou de fora**, e **o que custaria fazer** — porque "não fiz"
sem estimativa é opinião, e com estimativa é decisão.

---

## 1. Fora do escopo por definição da trilha

### A Trilha A inteira
O serviço — recepção, chamada ao modelo multimodal, extração, persistência,
autenticação real. **Escolhi a Trilha B.** O que atravessa a fronteira é o
contrato, e esse foi entregue.

### Deploy
O enunciado dispensa explicitamente. Roda local com dois comandos.

---

## 2. Cortado pelo recorte da fatia vertical

### Busca por termo — parte do comportamento 3 do produto
**Não especificada e não implementada.**

O que existe no contrato é **listagem filtrada por estado**, com `limite` e
`cursor` — `GET /documentos?estado=&limite=&cursor=`, servida pelo mock e
consumida pela fila de conferência. **Não há parâmetro de termo** no
`openapi.yaml`, e portanto não há busca por nome, CPF ou número de documento.

*Por quê:* a fatia vertical nomeada pelo enunciado é "do envio até a correção de
um campo". Busca é uma segunda fatia, não a continuação desta. Construí-la pela
metade produziria exatamente o que o enunciado penaliza — "cinco funcionalidades
pela metade".

*Custo para fazer:* cerca de 3 h — e **mais do que o contrato de hoje entrega**:
seria preciso acrescentar o parâmetro de termo ao `openapi.yaml`, regerar os
tipos, servir o filtro no mock e só então construir a tela com o estado vazio.
Até a rodada de 01/09 este parágrafo dizia que o contrato "já existe"; não
existia. Corrigido em [D-10](08-divergencias.md).

### Upload retomável
Um arquivo de 8 MB que falha aos 90% recomeça do zero.

*Por quê:* exige upload em partes no contrato e coordenação de estado no
cliente. A redução no cliente (fato b) baixa o arquivo típico para ~600 KB, o
que reduz muito a exposição ao problema. **Trocamos robustez por tempo,
conscientemente.**

*Custo:* cerca de 4 h, mais mudança de contrato.

---

## 3. Riscos conhecidos, deixados em aberto

### HEIC/HEIF do iPhone — **o primeiro a tratar**
Recusado no envio com mensagem orientando a mudar o ajuste da câmera.

*Por quê:* decodificar exigiria um módulo WebAssembly de cerca de 1,5 MB. É uma
solução organizacional para um problema técnico — funciona, mas depende de
treinamento, e treinamento se perde na rotatividade.

*Custo:* cerca de 2 h com biblioteca pronta, mais o peso no bundle.

### Priorização e contrapressão na fila
Fila por ordem de chegada. Se 800 documentos entram entre 9h e 11h e duas
pessoas conferem, a fila não drena no mesmo dia — **e nada na interface avisa
disso**.

*Por quê:* depende da dúvida P2, não respondida: existe SLA de mesmo dia? Sem a
resposta, qualquer critério de prioridade seria invenção.

*Custo:* cerca de 3 h, depois de definido o critério.

### Deduplicação perceptual
Detectamos o reenvio do mesmo arquivo, não duas fotos do mesmo papel.

*Por quê:* exige comparação perceptual ou por campos extraídos — decisão de
back-end, depois da extração. Fora da nossa fronteira.

### Trilha de auditoria de leitura
Não registramos quem abriu qual documento. Para dado sensível isso costuma ser
exigência.

*Por quê:* é responsabilidade do back-end; o front precisaria apenas enviar
contexto. Depende da Trilha A.

### Alerta de taxa de falha
Estado individual de falha existe; agregação e alerta, não.

*Gatilho para tratar:* primeira semana com mais de 5% de `FALHOU`.

---

## 4. Reduzido de propósito

### Acessibilidade
Feito: navegação por teclado na conferência, rótulos associados, foco visível,
consultas de teste por papel, **modal que cumpre o que declara** (foco inicial,
Escape, retorno de foco e contenção de Tab — `shared/ui/Dialogo.tsx`) e
**anúncio das transições de estado** por região `aria-live` no acompanhamento,
agregado para não ler dado pessoal em voz alta.
**Não feito:** auditoria WCAG, leitor de tela no visualizador de imagem,
contraste verificado sistematicamente.

*Os dois primeiros itens entraram tarde, e por correção: até 01/09 os diálogos
declaravam `aria-modal="true"` sem cumprir nenhuma das quatro obrigações, e o
acompanhamento mudava de estado sozinho sem anunciar nada. Ver
[D-11](08-divergencias.md).*

*Por quê:* o enunciado dispensa interface polida. O básico entrou porque é mais
barato fazer certo agora do que retrofitar depois.

### Internacionalização
Interface só em português. O escritório é brasileiro e o domínio é jurídico
brasileiro. **YAGNI deliberado** — e as strings de domínio vêm da API de
qualquer forma (fato f), então o custo futuro é menor do que parece.

### Autenticação real
Identidade vem do host por cabeçalho; não há login. Dispensado pelo enunciado e
coerente com "consumido por sistemas internos" (premissa P1, ADR-011).

### Salvar rascunho de conferência
Interromper no meio perde o trabalho.

*Por quê:* rascunho num documento reservado por TTL cria um estado ambíguo
quando o TTL expira. Preferi não ter a funcionalidade a ter uma que confunde.

### Testes de imagem, EXIF e virtualização
Verificados à mão. jsdom não decodifica imagem real nem mede rolagem —
o teste passaria sem provar nada. Ver [`06-plano-de-testes.md`](06-plano-de-testes.md).

---

## Resumo — ordem de ataque depois desta entrega

| Prioridade | Item | Custo | Gatilho |
|---|---|---|---|
| 1 | HEIC do iPhone | 2 h | Primeiro relato do atendimento |
| 2 | Busca e listagem | 3 h | Volume acumulado tornar a fila insuficiente |
| 3 | Priorização da fila | 3 h | Confirmação de SLA de mesmo dia |
| 4 | Upload retomável | 4 h | Falhas de envio recorrentes |
| 5 | Auditoria de leitura | — | Exigência de conformidade |
