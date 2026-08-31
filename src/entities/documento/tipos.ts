/**
 * Tipos de domínio.
 *
 * NÃO escrevemos estes tipos à mão (G3, ADR-003): eles são reexportados dos
 * tipos gerados de `docs/spec/openapi.yaml`. Uma mudança no contrato vira
 * erro de compilação aqui, e não bug em produção.
 *
 * Este arquivo existe só para dar nomes de domínio ao que o gerador chama de
 * `components['schemas'][...]`, poupando o resto do código de conhecer a
 * forma do arquivo gerado.
 */
import type { components } from '@/shared/api/types.gen'

type S = components['schemas']

export type Documento = S['Documento']
export type CampoExtraido = S['CampoExtraido']
export type EstadoDocumento = S['EstadoDocumento']
export type Reserva = NonNullable<S['Reserva']>
export type Procedencia = S['Procedencia']
export type StatusResumido = S['StatusResumido']
export type RespostaEnvio = S['RespostaEnvio']
export type PaginaDeDocumentos = S['PaginaDeDocumentos']
export type Problema = S['Problema']
export type ProblemaDeConflito = S['ProblemaDeConflito']
