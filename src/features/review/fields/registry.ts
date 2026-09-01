/**
 * O registry — o coração do tratamento do fato (f).
 *
 * A tela de conferência percorre o schema vindo da API e resolve cada campo
 * aqui. Adicionar um TIPO DE DOCUMENTO novo ao produto custa ZERO linhas de
 * front-end; adicionar um TIPO DE DADO novo custa um componente e uma linha.
 */
import type { TipoDeDado } from '@/entities/tipo-documento/tipos'
import {
  CampoCnpj, CampoCpf, CampoData, CampoNumero, CampoSelecao, CampoTexto,
} from './componentes'
import type { ComponenteDeCampo } from './tipos'

export const registry: Record<TipoDeDado, ComponenteDeCampo> = {
  TEXTO: CampoTexto,
  DATA: CampoData,
  CPF: CampoCpf,
  CNPJ: CampoCnpj,
  NUMERO: CampoNumero,
  SELECAO: CampoSelecao,
}

/**
 * Tipo desconhecido cai em TEXTO. NUNCA quebra a tela.
 *
 * O fornecedor vai mudar de modelo e de prompt (fato f). Se ele introduzir um
 * tipo de dado que ainda não conhecemos, o atendimento precisa continuar
 * trabalhando — em texto livre, com menos ajuda, mas trabalhando. Tela branca
 * seria a pior resposta possível a uma mudança que sabemos que virá.
 */
export const resolverComponente = (tipo: TipoDeDado): ComponenteDeCampo =>
  registry[tipo] ?? CampoTexto
