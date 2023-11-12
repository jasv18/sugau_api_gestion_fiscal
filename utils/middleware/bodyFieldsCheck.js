const credentialsExtractor = (req, res, next) => {
    try {
        const { host, user, password, port } = req.body.payload
        req.body.credentials = { host, user, password, port }
    } catch {
        throw new Error('payload missing')
    }
    next()
}

const payrollsExtractor = (req, res, next) => {
    try {
        const { payrolls } = req.body.payload
        req.body.payrolls = payrolls
    } catch {
        throw new Error('payroll payload missing')
    }
    next()
}

module.exports = { credentialsExtractor, payrollsExtractor }