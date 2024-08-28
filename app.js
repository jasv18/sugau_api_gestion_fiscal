import 'express-async-errors'
import cors from 'cors'
import express, { json, text } from 'express'
import databasesRouter from './controllers/databases.js'
import decryptBody from './utils/middleware/decryptBody.js'
import errorHandler from './utils/middleware/errorHandler.js'
import requestLogger from './utils/middleware/requestLogger.js'
import unknownEndpoint from './utils/middleware/unknownEndpoint.js'
import connectionsRouter from './controllers/connections.js'
const app = express()

app.use(cors())
//app.use(static('dist'))
app.use(json())
app.use(text())
app.use(requestLogger)
app.use(decryptBody)

app.set('x-powered-by', false)

app.use('/api/auth', connectionsRouter)

app.use('/api/databases', databasesRouter)

app.use(unknownEndpoint)

app.use(errorHandler)

export default app