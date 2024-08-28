import { objectDecryption } from '../encryption.js'

const decryptBody = (req, res, next) => {
    if (req.is('text/*') && req.body) {
        const decryptedBody = objectDecryption(req.body.toString())
        req.body = { payload: decryptedBody }
    }
    next()
}

export default decryptBody