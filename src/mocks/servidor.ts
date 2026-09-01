/**
 * Serve o contrato numa porta HTTP real: `npm run mock`.
 *
 * Existe porque o enunciado pede o contrato "servido por mock". São os MESMOS
 * handlers do navegador e dos testes — nenhuma implementação paralela.
 */
import { createMiddleware } from '@mswjs/http-middleware'
import express from 'express'
import { handlers } from './handlers'
import { semear } from './dados'

const PORTA = Number(process.env['PORTA'] ?? 8787)

// Sem isto, `npm run mock` sobe com a base vazia — e o README oferece
// justamente um curl neste servidor como forma de exercitar o contrato.
semear()

const app = express()
app.use(express.json())
app.use(createMiddleware(...handlers))

app.listen(PORTA, () => {
  console.log(`DOC Intelligence — contrato servido em http://localhost:${PORTA}/api/v1`)
  console.log(`Experimente: curl -s http://localhost:${PORTA}/api/v1/tipos-documento`)
})
