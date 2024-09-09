import { getDatabases, getPayrollsFromDatabase } from '../models/postgresql/pg.js'
import { generateDb } from '../utils/generateDb.js'
import { Router } from 'express'

const databasesRouter = Router()

databasesRouter.get('/', async (req, res) => {
    const { host, user, password, port } = req.body.payload
    const credentials = { host, user, password, port }

    const rows = await getDatabases(credentials)
    res.status(200).send({ data: rows, success: true })
})

databasesRouter.get('/:srcdatabase/payrolls', async (req, res) => {
    const database = req.params.srcdatabase
    const { host, user, password, port } = req.body.payload
    const credentials = { host, user, password, port }
    const rows = await getPayrollsFromDatabase({ ...credentials, database})
    res.status(200).send({ data: rows, success: true })
})

databasesRouter.post('/:srcdatabase/generate', async(req, res) => {
    const srcDatabase = req.params.srcdatabase
    const { host, user, password, port, database: dstDatabase, payrolls } = req.body.payload
    const credentials = { host, user, password, port }
    await generateDb({
        ... credentials,
        srcDatabase,
        dstDatabase,
        payrolls
    })
    res.status(200).send({ success: true })
})

export default databasesRouter

