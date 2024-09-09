
import CryptoJS from 'crypto-js'
import { SECRET_KEY_1 } from './config.js'

export const objectEncryption = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY_1).toString()
}

export const objectDecryption = (cipherTextData) => {
    const bytes = CryptoJS.AES.decrypt(cipherTextData, SECRET_KEY_1)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

export const textEncryption = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY_1).toString()
}

export const textDecryption = (cypherText) => {
    const bytes = CryptoJS.AES.decrypt(cypherText, SECRET_KEY_1)
    return bytes.toString(CryptoJS.enc.Utf8)
}