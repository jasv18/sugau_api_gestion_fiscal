import { createServer } from 'node:http'
import logger from './utils/logger.js'
import { PORT } from './utils/config.js'
import { createApp } from './app.js'
import { PgModel } from './models/postgresql/pg.js'

const app = createApp({ model: PgModel })

const server = createServer(app)

server.listen(PORT, () => {
    logger.info('Sever running on port -> ', PORT)
})