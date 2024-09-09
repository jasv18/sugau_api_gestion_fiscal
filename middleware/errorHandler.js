import logger from '../utils/logger.js'

const errorHandler = (err, req, res, next) => {
    logger.error(err)
    return res.status(500).json({
        error_code: err.code,
        error_name: err.name,
        error_msg: err.message,
        success: false
    })
}

export default errorHandler