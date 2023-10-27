const CryptoJS = require('crypto-js')
const config = require('./config')

const objectEncryption = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), config.SECRET_KEY_1).toString()
}

const objectDecryption = (cipherTextData) => {
    const bytes = CryptoJS.AES.decrypt(cipherTextData, config.SECRET_KEY_1)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

const textEncryption = (text) => {
    return CryptoJS.AES.encrypt(text, config.SECRET_KEY_1).toString()
}

const textDecryption = (cypherText) => {
    const bytes = CryptoJS.AES.decrypt(cypherText, config.SECRET_KEY_1)
    return bytes.toString(CryptoJS.enc.Utf8)
}

const encryption = { objectEncryption, objectDecryption, textEncryption, textDecryption }

module.exports = encryption