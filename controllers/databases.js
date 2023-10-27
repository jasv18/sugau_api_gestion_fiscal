const db = require('../db/pg')
const { generateDb } = require('../utils/generateDb')
const { payrollsExtractor } = require('../utils/middleware/bodyFieldsCheck')

const databasesRouter = require('express').Router()

databasesRouter.post('/:srcdatabase/payrolls', async (req, res) => {
    const database = req.params.srcdatabase
    const { credentials } = req.body
    const rows = await db.getPayrollsFromDatabase({ ...credentials, database})
    res.status(200).send({ data: rows, success: true })
})

databasesRouter.post('/:srcdatabase/generate/:dstdatabase', payrollsExtractor, async(req, res) => {
    const srcDatabase = req.params.srcdatabase
    const dstDatabase = req.params.dstdatabase
    const { credentials, payrolls } = req.body
    await generateDb({
        credentials,
        srcDatabase,
        dstDatabase,
        payrolls
    })
    res.status(200).send({ success: true })
})

module.exports = databasesRouter

