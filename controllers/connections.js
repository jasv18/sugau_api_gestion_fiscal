const db = require('../db/pg')

const connectionsRoutes = require('express').Router()

connectionsRoutes.post('/validate', async (req, res) => {
    const { host, user, password, port } = req.body.payload
    const credentials = { host, user, password, port }

    await db.connectionValidation(credentials)
    res.status(200).send({ success: true })
})

module.exports = connectionsRoutes