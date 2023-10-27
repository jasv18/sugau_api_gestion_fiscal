const { v4: uuidv4 } = require('uuid')

const uniqueId = () => uuidv4()

module.exports = uniqueId