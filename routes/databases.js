import { PgController } from '../controllers/pg.js'
import { Router } from 'express'

export function createDatabaseManagerRouter({ model }) {
    const dbManagerRouter = Router()

    const pgController = new PgController({ model })
    
    dbManagerRouter.get('/', pgController.getAllDatabases)
    
    dbManagerRouter.get('/:srcdatabase/payrolls', pgController.getPayrollsFromDatabase)
    
    dbManagerRouter.post('/:srcdatabase/generate', pgController.generateDb)

    return dbManagerRouter
}