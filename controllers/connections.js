import { connectionValidation } from '../db/pg.js'
import { Router } from 'express'

const connectionsRoutes = Router()

connectionsRoutes.post('/validate', async (req, res) => {
    const { host, user, password, port } = req.body.payload
    const credentials = { host, user, password, port }

    await connectionValidation(credentials)
    res.status(200).send({ success: true })
})

export default connectionsRoutes