const credentialsExtractor = (req, res, next) => {
    console.log(req.body)
    const { host, user, password, port } = req.body.payload
    req.body.credentials = { host, user, password, port }
    next()
}

const payrollsExtractor = (req, res, next) => {
    const { payrolls } = req.body.payload
    req.body.payrolls = payrolls
    next()
}

module.exports = { credentialsExtractor, payrollsExtractor }