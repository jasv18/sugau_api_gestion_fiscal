import app from './app.js'
import { createServer } from 'node:http'
import config from './utils/config.js'
import logger from './utils/logger.js'

const server = createServer(app)

server.listen(config.PORT, () => {
    logger.info('Sever running on port -> ', config.PORT)
})