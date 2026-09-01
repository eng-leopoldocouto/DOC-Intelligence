import { useRef, useState, type DragEvent } from 'react'
import { TIPOS_ACEITOS } from '@/shared/lib/imagem'

export function AreaDeEnvio({
  onArquivos,
  ocupado,
}: {
  onArquivos: (arquivos: File[]) => void
  ocupado: boolean
}) {
  const [sobre, setSobre] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const soltar = (e: DragEvent) => {
    e.preventDefault()
    setSobre(false)
    onArquivos(Array.from(e.dataTransfer.files))
  }

  return (
    <div
      className={`zona-envio ${sobre ? 'sobre' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setSobre(true) }}
      onDragLeave={() => setSobre(false)}
      onDrop={soltar}
    >
      <button
        type="button"
        className="botao primario"
        disabled={ocupado}
        onClick={() => input.current?.click()}
      >
        Escolher documentos
      </button>

      <p>ou arraste vários arquivos para cá</p>
      <p style={{ fontSize: 12 }}>
        Fotos (JPEG, PNG, WEBP) e PDF. Fotos grandes são reduzidas antes do envio.
      </p>

      <input
        ref={input}
        type="file"
        multiple
        aria-label="Documentos para envio"
        accept={TIPOS_ACEITOS.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => {
          onArquivos(Array.from(e.target.files ?? []))
          e.target.value = '' // permite reenviar o mesmo arquivo, para exercitar o fato (c)
        }}
      />
    </div>
  )
}
