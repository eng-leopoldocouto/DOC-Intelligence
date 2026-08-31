# Documentos fictícios

> **Nenhum arquivo aqui contém dado real de pessoa, de cliente ou do
> escritório.** Todos são gerados por script, com marca d'água, e não têm
> valor legal algum.

Atende à regra do enunciado: *"Nenhum dado real de cliente, de pessoa física ou
do escritório. Gere documentos fictícios para testar."*

## Regenerar

```bash
python scripts/gerar-documentos-ficticios.py
```

Requer Python 3.13 e Pillow. O script apaga e recria a pasta, e verifica ao
final que a duplicata exata foi produzida — se não tiver sido, ele falha, porque
o fato (c) ficaria sem demonstração.

## O que tem aqui, e por que cada um existe

| Arquivo | Documento | Existe para |
|---|---|---|
| `WhatsApp Image 2026-08-11 at 09.12.33.jpeg` | RG, foto reta | Caminho normal de envio |
| `copia de WhatsApp Image 2026-08-11 at 09.12.33.jpeg` | **cópia byte a byte** do anterior | **Fato (c)**: hash idêntico, a interface precisa dizer "já enviado" sem gastar chamada paga |
| `IMG_20260811_091247.jpg` | RG, **inclinado 7°**, com margem de mesa | **Fato (b)**: "fotografias tortas desses mesmos papéis". Exercita a rotação no visualizador. Bytes diferentes do primeiro — é a duplicata perceptual que **não** detectamos (ADR-007) |
| `scan0001.pdf` | Comprovante de residência | Nome de scanner, e PDF em vez de imagem |
| `scan0002.pdf` | Contracheque | **Dois `scanNNNN.pdf` diferentes**: prova por que deduplicar por nome apagaria documento legítimo |
| `WhatsApp Image 2026-08-11 at 10.02.15.jpeg` | Procuração | Quarto tipo do catálogo |

## Dados usados

Todos deliberadamente falsos e reconhecíveis como tal:

- **Nome:** `FULANO DE TAL DA SILVA`, filiação `BELTRANA DE TAL` e `SICRANO DA SILVA`
- **CPF:** `000.000.000-00` — inválido pelo dígito verificador
- **CNPJ:** `00.000.000/0000-00` — idem
- **Endereço:** `Rua Exemplo, 000` — logradouro inexistente
- **Valores:** `R$ 0.000,00`
- **Emissor:** "República Fictícia do Brasil", "Empresa Fictícia Ltda"

## Roteiro de demonstração

1. Envie os **seis** arquivos de uma vez. Cinco sobem; a cópia é barrada como
   duplicata **antes** de qualquer requisição.
2. Acompanhe o processamento: a latência é sorteada entre 5 e 40 s, e ~8% caem
   em `FALHOU` ou `EXPIRADO`.
3. Abra a fila de conferência. O `IMG_20260811_091247.jpg` está torto — use a
   rotação do visualizador.
4. Corrija um campo e salve.
5. Para ver o conflito do fato (g): abra o mesmo documento em duas abas, salve
   na primeira, depois tente salvar na segunda.
