const encryption = require('../encryption')

const decryptBody = (req, res, next) => {
    if (req.is('text/*') && req.body) {
        const decryptedBody = encryption.objectDecryption(req.body.toString())
        req.body = { payload: decryptedBody }
    }
    next()
}

module.exports = decryptBody