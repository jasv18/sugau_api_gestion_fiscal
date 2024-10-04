export class PgController {
    constructor ({ model }) {
        this.model = model
    }

    validateConnection = async (req, res) => {
        const { host, user, password, port } = req.body.payload
        const credentials = { host, user, password, port }
    
        await this.model.validateConnection(credentials)
        res.status(200).send({ success: true })
    }

    getAllDatabases = async (req, res) => {
        const { host, user, password, port } = req.body.payload
        const credentials = { host, user, password, port }
    
        const rows = await this.model.getAllDatabases(credentials)
        res.status(200).send({ data: rows, success: true })
    }

    getPayrollsFromDatabase = async (req, res) => {
        const database = req.params.srcdatabase
        const { host, user, password, port } = req.body.payload
        const credentials = { host, user, password, port }
        const rows = await this.model.getPayrollsFromDatabase({ ...credentials, database})
        res.status(200).send({ data: rows, success: true })
    }

    generateDb = async (req, res) => {
        const srcDatabase = req.params.srcdatabase
        const { host, user, password, port, database: dstDatabase, payrolls } = req.body.payload
        const credentials = { host, user, password, port }
        await this.model.generateDb({
            ... credentials,
            srcDatabase,
            dstDatabase,
            payrolls
        })
        res.status(200).send({ success: true })
    }
}