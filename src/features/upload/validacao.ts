/**
 * Validação local, ANTES de qualquer requisição (RF-02).
 *
 * Aqui a validação no cliente não é conveniência — é CONTROLE DE CUSTO. O fato
 * (b) diz que não há validação alguma do lado de quem envia, e o fato (a) diz
 * que cada documento processado é cobrado. Este arquivo é a única barreira
 * entre um .docx arrastado por engano e uma chamada paga ao modelo.
 */
import { TAMANHO_MAXIMO, TIPOS_ACEITOS, ehHeic, ehImagem } from '@/shared/lib/imagem'
import { formatarTamanho } from '@/shared/lib/formato'

export type Recusa = { ok: false; motivo: string; comoResolver: string }
export type Aprovacao = { ok: true }
export type ResultadoValidacao = Aprovacao | Recusa

const aceito = (tipo: string): boolean =>
  (TIPOS_ACEITOS as readonly string[]).includes(tipo)

/**
 * Toda recusa diz O QUE FAZER, não apenas o que falhou.
 * Mensagem de erro sem saída treina a pessoa a ignorar mensagens.
 */
export function validar(arquivo: File): ResultadoValidacao {
  if (ehHeic(arquivo)) {
    // Risco conhecido e NÃO resolvido (fato b, 05-fatos-do-ambiente.md).
    // Solução organizacional para um problema técnico: funciona, mas depende
    // de treinamento — e treinamento se perde na rotatividade.
    return {
      ok: false,
      motivo: 'Formato HEIC não é lido pelo navegador',
      comoResolver:
        'No iPhone: Ajustes › Câmera › Formatos › "Mais compatível". ' +
        'Para este arquivo agora, tire uma captura de tela da foto e envie a captura.',
    }
  }

  if (!aceito(arquivo.type)) {
    return {
      ok: false,
      motivo: `Formato não suportado${arquivo.type ? ` (${arquivo.type})` : ''}`,
      comoResolver: 'Envie foto (JPEG, PNG, WEBP) ou PDF.',
    }
  }

  if (arquivo.size === 0) {
    return {
      ok: false,
      motivo: 'Arquivo vazio',
      comoResolver: 'O arquivo pode ter falhado ao ser copiado. Tente enviar novamente.',
    }
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    // Imagem grande é reduzida no cliente e passa; PDF não reamostramos.
    if (ehImagem(arquivo)) return { ok: true }
    return {
      ok: false,
      motivo: `PDF acima do limite (${formatarTamanho(arquivo.size)})`,
      comoResolver: `O limite é ${formatarTamanho(TAMANHO_MAXIMO)}. Envie as páginas separadamente.`,
    }
  }

  return { ok: true }
}
