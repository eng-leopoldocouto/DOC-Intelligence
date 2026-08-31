import { describe, it, expect } from 'vitest'
import { sha256 } from '@/shared/lib/hash'

describe('identidade do documento é o conteúdo, não o nome (fato b)', () => {
  it('produz SHA-256 em 64 hex minúsculos', async () => {
    const a = new File(['conteudo do documento'], 'scan0001.pdf')
    expect(await sha256(a)).toMatch(/^[a-f0-9]{64}$/)
  })

  it('o nome do arquivo NÃO influencia o hash', async () => {
    // Os dois nomes vêm literalmente do enunciado, fato (b).
    const a = new File(['conteudo do documento'], 'scan0001.pdf')
    const b = new File(['conteudo do documento'], 'WhatsApp Image 2026-08-11 at 09.12.33.jpeg')
    expect(await sha256(a)).toBe(await sha256(b))
  })

  it('conteúdos diferentes produzem hashes diferentes', async () => {
    const a = new File(['documento A'], 'x.pdf')
    const b = new File(['documento B'], 'x.pdf')
    expect(await sha256(a)).not.toBe(await sha256(b))
  })

  it('dois arquivos com o MESMO nome e conteúdos diferentes não colidem', async () => {
    // scan0001.pdf é nome de scanner: chega repetido para documentos distintos.
    // Deduplicar por nome apagaria documento legítimo (ADR-007).
    const a = new File(['comprovante de residencia'], 'scan0001.pdf')
    const b = new File(['contracheque'], 'scan0001.pdf')
    expect(await sha256(a)).not.toBe(await sha256(b))
  })
})
