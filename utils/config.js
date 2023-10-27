require('dotenv').config()

const PORT = process.env.PORT || 3001
const SECRET_KEY_1 = process.env.SECRET_KEY_1

module.exports = {
    PORT, SECRET_KEY_1
}