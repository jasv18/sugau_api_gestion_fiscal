const db = require('../db/pg')

const connectionsRoutes = require('express').Router()

connectionsRoutes.post('/validate', async (req, res) => {
    await db.connectionValidation(req.body)
    res.status(200).send({ success: true })
})

connectionsRoutes.post('/databases', async (req, res) => {
    const rows = await db.getDatabases(req.body)
    res.status(200).send({ data: rows, success: true })
})

module.exports = connectionsRoutes