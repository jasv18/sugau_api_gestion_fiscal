import { Router } from 'express'

export function createDatabaseManagerRouter({ controller }) {
    const dbManagerRouter = Router()
    
    dbManagerRouter.get('/', controller.getAllDatabases)
    
    dbManagerRouter.get('/:srcdatabase/payrolls', controller.getPayrollsFromDatabase)
    
    dbManagerRouter.post('/:srcdatabase/generate', controller.generateDb)

    return dbManagerRouter
}