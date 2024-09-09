import { createServer } from 'node:http'
import logger from './utils/logger.js'
import { PORT } from './utils/config.js'
import app from './app.js'

const server = createServer(app)

server.listen(PORT, () => {
    logger.info('Sever running on port -> ', PORT)
})