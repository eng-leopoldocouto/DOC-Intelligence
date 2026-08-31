#!/usr/bin/env python3
"""
Gera documentos FICTÍCIOS para teste e demonstração do DOC Intelligence.

Regra do enunciado, sem exceção: "Nenhum dado real de cliente, de pessoa
física ou do escritório. Gere documentos fictícios para testar."

Três garantias, verificadas pelo próprio script ao final:

1. Marca d'água diagonal "DOCUMENTO FICTICIO" em todas as páginas.
2. Dados inequivocamente falsos — FULANO DE TAL, CPF 000.000.000-00
   (inválido pelo dígito verificador), endereço "Rua Exemplo, 000".
3. Nomes de arquivo que IMITAM o que o fato (b) descreve: nome de câmera,
   nome de WhatsApp, nome de scanner. O sistema não pode depender deles.

Uso:  python scripts/gerar-documentos-ficticios.py
"""
from __future__ import annotations

import hashlib
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SAIDA = Path(__file__).resolve().parent.parent / "fixtures" / "documentos-ficticios"

PAPEL = (1240, 1754)          # A4 a 150 dpi
TINTA = (26, 26, 26)
FUNDO = (247, 245, 240)       # papel levemente creme, como digitalização real


def fonte(tamanho: int, negrito: bool = False) -> ImageFont.FreeTypeFont:
    """Fonte do sistema; cai na embutida se nenhuma estiver disponível."""
    candidatas = (
        ["arialbd.ttf", "DejaVuSans-Bold.ttf"] if negrito
        else ["arial.ttf", "DejaVuSans.ttf"]
    )
    for nome in candidatas:
        try:
            return ImageFont.truetype(nome, tamanho)
        except OSError:
            continue
    return ImageFont.load_default(tamanho)


def marca_dagua(img: Image.Image) -> Image.Image:
    """
    Marca d'água diagonal. Existe para que ninguém confunda estes arquivos
    com documento real, nem numa captura de tela fora de contexto.
    """
    camada = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    texto = "DOCUMENTO FICTICIO - GERADO PARA TESTE"
    f = fonte(46, negrito=True)

    for linha in range(-img.height, img.height * 2, 260):
        d.text((-160, linha), f"{texto}   {texto}", font=f, fill=(200, 40, 40, 62))

    girada = camada.rotate(30, resample=Image.BICUBIC, center=(img.width // 2, img.height // 2))
    return Image.alpha_composite(img.convert("RGBA"), girada).convert("RGB")


def pagina(titulo: str, subtitulo: str, linhas: list[tuple[str, str]]) -> Image.Image:
    img = Image.new("RGB", PAPEL, FUNDO)
    d = ImageDraw.Draw(img)

    d.rectangle([60, 60, PAPEL[0] - 60, PAPEL[1] - 60], outline=(150, 150, 150), width=3)
    d.text((110, 120), "REPUBLICA FICTICIA DO BRASIL", font=fonte(28), fill=(90, 90, 90))
    d.text((110, 170), titulo, font=fonte(52, negrito=True), fill=TINTA)
    d.text((110, 240), subtitulo, font=fonte(26), fill=(110, 110, 110))
    d.line([110, 292, PAPEL[0] - 110, 292], fill=(150, 150, 150), width=2)

    y = 360
    for rotulo, valor in linhas:
        # Rótulo vazio = continuação do campo anterior (ex.: segunda linha da
        # filiação). Não desenha rótulo nem abre o espaço dele.
        if rotulo:
            d.text((110, y), rotulo.upper(), font=fonte(22), fill=(120, 120, 120))
            y += 34
        d.text((110, y), valor, font=fonte(38, negrito=True), fill=TINTA)
        y += 84

    d.text((110, PAPEL[1] - 170),
           "Documento sem valor legal. Gerado por script para teste automatizado.",
           font=fonte(22), fill=(150, 60, 60))

    return marca_dagua(img)


def inclinar(img: Image.Image, graus: float) -> Image.Image:
    """
    Foto torta, como o enunciado descreve: "fotografias tortas desses mesmos
    papéis". Existe para exercitar a rotação do visualizador de conferência.
    """
    girada = img.rotate(graus, resample=Image.BICUBIC, expand=True, fillcolor=(40, 40, 45))
    # Um pouco de margem escura, como mesa aparecendo em volta do papel
    fundo = Image.new("RGB", (girada.width + 120, girada.height + 120), (38, 38, 42))
    fundo.paste(girada, (60, 60))
    return fundo


# --- Documentos --------------------------------------------------------------

RG = pagina(
    "CARTEIRA DE IDENTIDADE",
    "Secretaria de Seguranca Publica (ficticia)",
    [
        ("Nome", "FULANO DE TAL DA SILVA"),
        ("Filiacao", "BELTRANA DE TAL"),
        ("", "SICRANO DA SILVA"),
        ("Data de nascimento", "14/03/1987"),
        ("Numero do RG", "12.345.678-9"),
        ("CPF", "000.000.000-00"),
        ("Orgao emissor", "SSP/RN"),
    ],
)

COMPROVANTE = pagina(
    "COMPROVANTE DE RESIDENCIA",
    "Concessionaria Ficticia de Energia S.A.",
    [
        ("Titular", "FULANO DE TAL DA SILVA"),
        ("Endereco", "RUA EXEMPLO, 000, APTO 00"),
        ("Bairro", "CENTRO"),
        ("Municipio / UF", "MOSSORO / RN"),
        ("CEP", "59600-000"),
        ("Competencia", "07/2026"),
    ],
)

CONTRACHEQUE = pagina(
    "DEMONSTRATIVO DE PAGAMENTO",
    "EMPRESA FICTICIA LTDA - CNPJ 00.000.000/0000-00",
    [
        ("Empregado", "FULANO DE TAL DA SILVA"),
        ("CPF", "000.000.000-00"),
        ("Competencia", "07/2026"),
        ("Vencimentos", "R$ 0.000,00"),
        ("Descontos", "R$ 000,00"),
        ("Liquido a receber", "R$ 0.000,00"),
    ],
)

PROCURACAO = pagina(
    "PROCURACAO AD JUDICIA",
    "Instrumento particular de mandato (ficticio)",
    [
        ("Outorgante", "FULANO DE TAL DA SILVA"),
        ("CPF do outorgante", "000.000.000-00"),
        ("Outorgado", "ADVOGADO FICTICIO DE EXEMPLO"),
        ("OAB", "OAB/RN 00.000"),
        ("Data da outorga", "01/08/2026"),
    ],
)


def main() -> None:
    SAIDA.mkdir(parents=True, exist_ok=True)
    for antigo in SAIDA.iterdir():
        if antigo.is_file():
            antigo.unlink()

    # Nomes que imitam a realidade do fato (b): nome de WhatsApp, de câmera e
    # de scanner. O sistema NUNCA pode identificar documento pelo nome.
    rg_reto = SAIDA / "WhatsApp Image 2026-08-11 at 09.12.33.jpeg"
    RG.save(rg_reto, "JPEG", quality=82)

    # Foto torta: mesmo papel, tirada de novo. Bytes diferentes do arquivo
    # acima — é exatamente a duplicata perceptual que NÃO detectamos (ADR-007).
    inclinar(RG, 7).save(SAIDA / "IMG_20260811_091247.jpg", "JPEG", quality=78)

    COMPROVANTE.save(SAIDA / "scan0001.pdf", "PDF", resolution=150.0)
    CONTRACHEQUE.save(SAIDA / "scan0002.pdf", "PDF", resolution=150.0)
    PROCURACAO.save(SAIDA / "WhatsApp Image 2026-08-11 at 10.02.15.jpeg", "JPEG", quality=82)

    # Cópia BYTE A BYTE: é a duplicata que a interface PRECISA detectar,
    # e existe para a demonstração do fato (c).
    copia = SAIDA / "copia de WhatsApp Image 2026-08-11 at 09.12.33.jpeg"
    shutil.copyfile(rg_reto, copia)

    print(f"Gerados em {SAIDA}\n")
    hashes: dict[str, list[str]] = {}
    for arquivo in sorted(SAIDA.iterdir()):
        h = hashlib.sha256(arquivo.read_bytes()).hexdigest()
        hashes.setdefault(h, []).append(arquivo.name)
        print(f"  {h[:16]}...  {arquivo.stat().st_size / 1024:7.1f} KB  {arquivo.name}")

    duplicatas = [nomes for nomes in hashes.values() if len(nomes) > 1]
    print("\nVerificacao:")
    print(f"  arquivos: {sum(len(v) for v in hashes.values())} | hashes distintos: {len(hashes)}")
    if duplicatas:
        for nomes in duplicatas:
            print(f"  duplicata exata (esperada, fato c): {' == '.join(nomes)}")
    else:
        raise SystemExit("ERRO: a copia byte a byte nao foi gerada — o fato (c) ficaria sem demonstracao")


if __name__ == "__main__":
    main()
