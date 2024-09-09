import logger from "../utils/logger.js"

const requestLogger = (req, res, next) => {
    logger.info('------------------------')
    logger.info('Method: ', req.method)
    logger.info('Path: ', req.path)
    logger.info('Body: ', req.body)
    logger.info('------------------------')
    next()
}

export default requestLogger