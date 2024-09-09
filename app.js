import 'express-async-errors'
import cors from 'cors'
import express, { json, text } from 'express'
import databasesRouter from './routes/databases.js'
import decryptBody from './middleware/decryptBody.js'
import errorHandler from './middleware/errorHandler.js'
import requestLogger from './middleware/requestLogger.js'
import unknownEndpoint from './middleware/unknownEndpoint.js'
import connectionsRouter from './routes/connections.js'
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