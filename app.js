require('express-async-errors')
const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const databasesRouter = require('./controllers/databases')
const decryptBody = require('./utils/middleware/decryptBody')
const errorHandler = require('./utils/middleware/errorHandler')
const requestLogger = require('./utils/middleware/requestLogger')
const unknownEndpoint = require('./utils/middleware/unknownEndpoint')
const connectionsRouter = require('./controllers/connections')
const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(bodyParser.text())
app.use(requestLogger)
app.use(decryptBody)

app.set('x-powered-by', false)

app.use('/api/auth', connectionsRouter)

app.use('/api/databases', databasesRouter)

app.use(unknownEndpoint)

app.use(errorHandler)

module.exports = app