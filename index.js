const app = require('./app')
const http= require('node:http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(config.PORT, () => {
    logger.info('Sever running on port -> ', config.PORT)
})