import { Router } from 'express'

export function createConnectionRouter({ controller }) {
    const connectionsRouter = Router()

    connectionsRouter.post('/validate', controller.validateConnection)

    return connectionsRouter
}