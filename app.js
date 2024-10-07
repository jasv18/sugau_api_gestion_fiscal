import 'express-async-errors'
import cors from 'cors'
import express, { json, text } from 'express'
import { createDatabaseManagerRouter } from './routes/databases.js'
import decryptBody from './middleware/decryptBody.js'
import errorHandler from './middleware/errorHandler.js'
import requestLogger from './middleware/requestLogger.js'
import unknownEndpoint from './middleware/unknownEndpoint.js'
import { createConnectionRouter } from './routes/connections.js'
import { PgController } from './controllers/pg.js'


export function createApp({ model }) {
    const app = express()

    const pgController = new PgController({ model })
    
    app.use(cors())
    //app.use(static('dist'))
    app.use(json())
    app.use(text())
    app.use(requestLogger)
    app.use(decryptBody)
    
    app.set('x-powered-by', false)
    
    app.use('/api/auth', createConnectionRouter({ controller: pgController }))
    
    app.use('/api/databases', createDatabaseManagerRouter({ controller: pgController }))
    
    app.use(unknownEndpoint)
    
    app.use(errorHandler)

    return app
}