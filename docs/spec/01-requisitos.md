# 01 — Requisitos

> Escopo: **Trilha B — front-end do atendimento**. Requisitos do serviço
> (classificação, extração, persistência) pertencem à Trilha A e aparecem aqui
> apenas como obrigação do contrato.

**Legenda de estado:** ✅ implementado na fatia · 📐 especificado, não
implementado (ver [`07-nao-feito.md`](07-nao-feito.md))

---

## 1. Requisitos funcionais

### RF-01 — Envio de vários documentos de uma vez ✅

A pessoa do atendimento seleciona ou arrasta N arquivos e envia todos numa
operação, acompanhando cada um individualmente.

**Critérios de aceite**

```gherkin
Dado que estou na tela de envio
Quando eu solto 5 arquivos válidos na área de envio
Então vejo 5 itens listados, cada um com nome de origem, tamanho e miniatura
E cada item exibe seu próprio estado de envio
E no máximo 3 uploads acontecem simultaneamente          # fato (e)
E os demais aguardam em fila local
```

```gherkin
Dado que 5 arquivos estão sendo enviados
Quando o envio do arquivo 2 falha por erro de rede
Então o arquivo 2 fica em estado de falha com ação "tentar novamente"
E os arquivos 1, 3, 4 e 5 seguem normalmente
```

> Falha de um não derruba o lote. Em dia de pico, um lote inteiro reenviado por
> causa de um arquivo é custo multiplicado.

---

### RF-02 — Validação local antes do envio ✅

Nenhum arquivo inválido consome requisição, banda ou chamada paga ao modelo.

**Critérios de aceite**

```gherkin
Dado um arquivo de tipo não suportado (por exemplo .docx ou .heic)
Quando eu o incluo no lote
Então ele é recusado antes de qualquer requisição
E a mensagem diz o que fazer, não apenas que falhou
```

```gherkin
Dado um arquivo acima do teto de tamanho
Quando ele é uma imagem
Então ele é reduzido no cliente e passa a caber        # fato (b)
Mas quando é um PDF acima do teto
Então é recusado, porque não reamostramos PDF
```

**Regras:** tipos aceitos `image/jpeg`, `image/png`, `image/webp`,
`application/pdf`. Teto de 20 MB por arquivo antes da redução; imagens são
reamostradas para o lado maior de 2000 px.

---

### RF-03 — Deduplicação por conteúdo ✅

O mesmo documento enviado duas vezes não vira dois documentos, nem duas chamadas
pagas ao modelo.

**Critérios de aceite**

```gherkin
Dado que selecionei o mesmo arquivo duas vezes no mesmo lote
Quando o lote é montado
Então apenas um item aparece
E vejo a informação de que uma duplicata foi descartada
```

```gherkin
Dado um arquivo cujo SHA-256 já existe no servidor
Quando eu o envio
Então a API responde 200 com duplicado: true
E a UI mostra "já enviado em <data> · ver documento"
E nenhum processamento novo é disparado            # fatos (a) e (c)
```

---

### RF-04 — Acompanhamento do processamento ✅

A pessoa vê o que está acontecendo com cada documento sem recarregar a página.

**Critérios de aceite**

```gherkin
Dado que tenho N documentos em processamento
Quando o acompanhamento está ativo
Então é feita UMA requisição de status para todos os N     # fato (e)
E o intervalo entre requisições cresce com o tempo decorrido
E o acompanhamento pausa quando a aba fica oculta
```

```gherkin
Dado um documento em processamento há 25 segundos
Quando eu observo seu item
Então vejo o tempo decorrido, não uma barra de progresso
```

> Não sabemos a porcentagem concluída. Uma barra de progresso aqui seria
> invenção — e o operador aprende rápido a não confiar nela.

---

### RF-05 — Falha, expiração e reprocessamento explícito ✅

**Critérios de aceite**

```gherkin
Dado um documento em estado FALHOU
Quando eu aciono "reprocessar"
Então recebo uma confirmação que informa que haverá novo custo
E o reprocessamento só ocorre após minha confirmação      # fato (a)
```

```gherkin
Dado qualquer documento
Quando o processamento falha
Então o sistema NUNCA reprocessa por conta própria
```

---

### RF-06 — Fila de conferência ✅

Documentos em que a máquina não teve confiança suficiente não entram como
prontos: ficam numa fila para conferência humana.

**Critérios de aceite**

```gherkin
Dado que o documento tem confiança abaixo do limiar
Quando o processamento termina
Então ele vai para AGUARDANDO_CONFERENCIA, não para PRONTO
E o limiar vem da API, não do código do front-end        # fato (f)
```

```gherkin
Dado que a fila tem 800 documentos
Quando eu rolo a lista
Então a rolagem permanece fluida
E o número de nós no DOM não cresce com o tamanho da fila  # fato (e)
```

**Ordenação:** por data de chegada, mais antigo primeiro. Sem priorização
(premissa P2).

---

### RF-07 — Reserva do documento na conferência (claim) ✅

**Critérios de aceite**

```gherkin
Dado que Ana abriu o documento D para conferência
Quando Bruno carrega a fila
Então D aparece marcado como "em conferência por Ana Souza"
E D não é oferecido a Bruno como próximo item          # fato (g)
```

```gherkin
Dado que Ana abriu D e fechou a aba sem liberar
Quando o TTL de 5 minutos expira
Então D volta a ficar disponível na fila
```

```gherkin
Dado que o host não enviou identidade de usuário
Quando alguém reserva um documento
Então a fila mostra "em conferência por outra sessão"
E o mecanismo continua evitando trabalho duplicado
```

---

### RF-08 — Tela de conferência com o original ao lado dos campos ✅

**Critérios de aceite**

```gherkin
Dado que abri um documento para conferência
Então vejo o arquivo original e os campos extraídos lado a lado
E consigo dar zoom e girar a imagem sem sair da tela
E a imagem respeita a orientação EXIF do original       # fato (b)
E vejo o nome como chegou E o nome padronizado proposto
```

```gherkin
Dado um campo com confiança abaixo do limiar
Então ele é visualmente destacado como necessitando atenção
E a confiança é exibida por campo, não só do documento
```

---

### RF-09 — Renderização de campos dirigida por schema ✅

**Este é o requisito que sustenta o fato (f).**

**Critérios de aceite**

```gherkin
Dado que a API passa a devolver um tipo de documento novo,
     com campos que o front-end nunca viu
Quando abro esse documento na conferência
Então todos os campos são renderizados corretamente
E NENHUMA linha do front-end precisou mudar             # fato (f)
```

```gherkin
Dado o código-fonte do front-end
Quando eu procuro por nomes de tipos de documento
Então não encontro nenhum em constante, enum, switch ou condicional
```

> O segundo critério é verificável por busca no código, e por isso vira teste.

---

### RF-10 — Correção de campo e gravação com trava otimista ✅

**Critérios de aceite**

```gherkin
Dado que corrigi o valor de um campo
Quando eu salvo
Então a requisição envia If-Match com a versão que eu carreguei
E, em sucesso, o documento vai para PRONTO
```

```gherkin
Dado que Bruno salvou alterações depois que eu carreguei o documento
Quando eu tento salvar
Então recebo 409 e a UI me mostra o que mudou e quem mudou
E minha edição NÃO é descartada automaticamente
E minha edição NÃO sobrescreve a dele automaticamente     # fato (g)
```

---

### RF-11 — Nome padronizado como campo conferível ✅

**Critérios de aceite**

```gherkin
Dado um documento em conferência
Então o nome padronizado proposto é exibido e é editável   # premissa P4
E, ao corrigir um campo que compõe o nome, a proposta é recalculada
Mas se eu já editei o nome manualmente
Então minha edição prevalece sobre o recálculo
```

---

### RF-12 — Rejeição do documento pelo conferente ✅

Derivado do fato (b): uma foto ilegível precisa ter saída do sistema.

**Critérios de aceite**

```gherkin
Dado um documento ilegível ou do tipo errado
Quando eu o rejeito informando o motivo
Então ele vai para REJEITADO e sai da fila de conferência
E o motivo fica registrado para quem enviou           # premissa P3
E rejeitar NÃO dispara reprocessamento
```

---

### RF-13 — Busca e listagem do que já foi processado 📐

**Especificado, não implementado.** O contrato existe
(`GET /documentos` com filtros e cursor) e é servido pelo mock, mas não há tela.
Justificativa em [`07-nao-feito.md`](07-nao-feito.md).

---

## 2. Requisitos não funcionais

| ID | Requisito | Verificação |
|---|---|---|
| **RNF-01** | Trocar o transporte HTTP afeta um único arquivo | Busca por `fetch(` fora de `shared/api/` retorna vazio |
| **RNF-02** | Tipos são gerados do OpenAPI, nunca escritos à mão | `npm run gen:api` regenera; diff limpo |
| **RNF-03** | Nenhum dado pessoal em URL, `localStorage`, IndexedDB ou telemetria | Teste + revisão; ver [ADR-010](../adr/010-lgpd-no-cliente.md) |
| **RNF-04** | Fila usável com 800 itens | Teste com fixture de 800 |
| **RNF-05** | API indisponível degrada com mensagem, não com tela branca | Handler de erro no mock |
| **RNF-06** | Identidade vem do host; o front não implementa login | [ADR-011](../adr/011-identidade-delegada-ao-host.md) |
| **RNF-07** | Erros reportados sem valor de campo | Sanitização em `http.ts` |
| **RNF-08** | Navegação por teclado e rótulos associados na conferência | Parcial — ver `07-nao-feito.md` |

---

## 3. Rastreabilidade — requisito × fato do ambiente

| Fato | Requisitos que o tratam |
|---|---|
| (a) modelo lento, caro, instável | RF-04, RF-05 |
| (b) foto de celular, nome lixo | RF-02, RF-08, RF-12 |
| (c) duplicatas | RF-03 |
| (d) dado pessoal sensível | RNF-03, RNF-07 |
| (e) pico de 800 | RF-01, RF-04, RF-06, RNF-04 |
| (f) troca de modelo e prompt | RF-06, RF-09, RNF-02 |
| (g) dois conferentes | RF-07, RF-10 |

**Nenhum fato ficou sem requisito.** Os que foram tratados apenas como risco
registrado estão em [`05-fatos-do-ambiente.md`](05-fatos-do-ambiente.md).
