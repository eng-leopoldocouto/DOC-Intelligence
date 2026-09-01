/**
 * Intervalo de consulta de estado (RF-04, fatos a e e).
 *
 * A curva casa com a distribuição real do fato (a): a maioria responde em
 * 5-40 s, então consultamos de perto no começo e afrouxamos depois. Documento
 * que já passou de dois minutos provavelmente vai demorar mais — insistir nele
 * a cada 2 s é requisição jogada fora, e no pico de 800 isso importa.
 */
export const intervaloDeBackoff = (msDecorridos: number): number =>
  msDecorridos < 30_000 ? 2_000 : msDecorridos < 120_000 ? 5_000 : 15_000

/** O intervalo do LOTE é o do documento mais recente: ele é o mais impaciente. */
export const intervaloDoLote = (recebidosEm: string[], agora: Date = new Date()): number => {
  if (recebidosEm.length === 0) return 0 // nada a acompanhar: não consulta
  const maisNovo = Math.min(
    ...recebidosEm.map((iso) => agora.getTime() - new Date(iso).getTime()),
  )
  return intervaloDeBackoff(Math.max(0, maisNovo))
}
