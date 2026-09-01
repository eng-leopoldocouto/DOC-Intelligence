/**
 * O documento original, ao lado dos campos extraídos.
 *
 * A URL é assinada e de curta duração, obtida a cada abertura e NUNCA
 * cacheada (fato d, ADR-010). A rotação existe porque o fato (b) promete
 * "fotografias tortas desses mesmos papéis".
 */
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { client } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'

export function VisualizadorDocumento({ id, nomeOrigem }: { id: string; nomeOrigem: string }) {
  const [giro, setGiro] = useState(0)
  const [zoom, setZoom] = useState(1)

  const arquivo = useQuery({
    queryKey: queryKeys.arquivo(id),
    queryFn: () => client.urlDoArquivo(id),
    // A URL expira; não a guardamos além do necessário para exibi-la.
    gcTime: 0,
    staleTime: 0,
  })

  const ehPdf = nomeOrigem.toLowerCase().endsWith('.pdf')

  return (
    <div className="visualizador">
      <div className="visualizador-barra">
        <button type="button" className="botao" onClick={() => setGiro((g) => (g + 270) % 360)}>
          ↺ Girar
        </button>
        <button type="button" className="botao" onClick={() => setGiro((g) => (g + 90) % 360)}>
          ↻ Girar
        </button>
        <button type="button" className="botao" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
          − Zoom
        </button>
        <button type="button" className="botao" onClick={() => setZoom((z) => Math.min(4, z + 0.25))}>
          + Zoom
        </button>
        <span className="dica-campo" style={{ marginLeft: 'auto' }}>
          {Math.round(zoom * 100)}% · {giro}°
        </span>
      </div>

      <div className="visualizador-palco">
        {arquivo.isPending && <p className="vazio">Carregando documento…</p>}
        {arquivo.isError && (
          <p className="vazio">
            Não foi possível abrir o arquivo. O link assinado pode ter expirado — recarregue a página.
          </p>
        )}
        {arquivo.data && (ehPdf ? (
          <object data={arquivo.data.url} type="application/pdf" className="visualizador-pdf">
            <p className="vazio">Seu navegador não exibe PDF embutido.</p>
          </object>
        ) : (
          <img
            src={arquivo.data.url}
            alt={`Documento original enviado como ${nomeOrigem}`}
            style={{ transform: `rotate(${giro}deg) scale(${zoom})` }}
          />
        ))}
      </div>
    </div>
  )
}
