/**
 * Reserva do documento para conferência (RF-07).
 *
 * Fato (g), parte 1 — contra o DESPERDÍCIO: evita que duas pessoas confiram o
 * mesmo documento e uma delas descubra no fim que trabalhou à toa. Num dia de
 * 800 documentos com duas conferentes, trabalho humano é o recurso mais caro.
 *
 * A parte 2 (contra a PERDA) é a trava otimista, em useGravarCampos.
 */
import { useEffect, useRef, useState } from 'react'
import { client } from '@/shared/api/client'
import { ErroDeApi } from '@/shared/api/http'
import type { Reserva } from '@/entities/documento/tipos'

/** TTL do servidor é 5 min; renovamos a 2 para ter folga contra rede instável. */
const INTERVALO_RENOVACAO_MS = 2 * 60 * 1000

export type EstadoDoClaim =
  | { situacao: 'reservando' }
  | { situacao: 'minha'; reserva: Reserva }
  | { situacao: 'de-outro'; deQuem: string }
  | { situacao: 'erro'; mensagem: string }

export function useClaim(id: string | undefined): EstadoDoClaim {
  const [estado, setEstado] = useState<EstadoDoClaim>({ situacao: 'reservando' })
  const liberado = useRef(false)

  useEffect(() => {
    if (!id) return
    liberado.current = false
    let vivo = true

    const reservar = async () => {
      try {
        const reserva = await client.reservar(id)
        if (vivo) setEstado({ situacao: 'minha', reserva })
      } catch (erro) {
        if (!vivo) return
        if (erro instanceof ErroDeApi && erro.status === 409) {
          setEstado({
            situacao: 'de-outro',
            // Sem identidade do host, degrada para "outra sessão": ainda evita
            // o trabalho duplicado, mas perde a quem recorrer (ADR-011).
            deQuem: erro.problema.detail?.replace(/^Reservado por /, '').replace(/\.$/, '')
              ?? 'outra sessão',
          })
          return
        }
        setEstado({ situacao: 'erro', mensagem: 'Não foi possível reservar este documento.' })
      }
    }

    void reservar()
    const renovacao = setInterval(() => void reservar(), INTERVALO_RENOVACAO_MS)

    // A aba fechada sem aviso é o caso NORMAL, não a exceção.
    const aoFechar = () => {
      if (!liberado.current) {
        liberado.current = true
        void client.liberar(id, true).catch(() => undefined)
      }
    }
    window.addEventListener('beforeunload', aoFechar)

    return () => {
      vivo = false
      clearInterval(renovacao)
      window.removeEventListener('beforeunload', aoFechar)
      if (!liberado.current) {
        liberado.current = true
        void client.liberar(id).catch(() => undefined)
      }
    }
  }, [id])

  return estado
}
