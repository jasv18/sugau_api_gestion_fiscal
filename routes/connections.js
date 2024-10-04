import { PgController } from '../controllers/pg.js'
import { Router } from 'express'

export function createConnectionRouter({ model }) {
    const connectionsRouter = Router()

    const pgController = new PgController({ model })

    connectionsRouter.post('/validate', pgController.validateConnection)

    return connectionsRouter
}