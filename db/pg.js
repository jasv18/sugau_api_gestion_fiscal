const { Pool } = require('pg')

const getNewPool = ( credentials ) => new Pool({ ...credentials, connectionTimeoutMillis: 4000 })

const connectionValidation = async ({ host, user, password, port }) => {
    if (!host || !user || !password) {
        throw new Error('missing required credentials properties: host, user, password')
    }
    const credentials = { host, user, password, port }
    const pool = getNewPool(credentials)
    const client = await pool.connect()
    await client.release(true)
    await pool.end()
}

const getDatabases = async ({ host, user, password, port }) => {
    if (!host || !user || !password) {
        throw new Error('missing required credentials properties: host, user, password')
    }
    const credentials = { host, user, password, port }
    const pool = getNewPool(credentials)
    const client = await pool.connect()    
    try {
        const { rows } = await client.query('select datname, encoding, datctype from pg_database where datallowconn = true and datistemplate = false')
        return rows
    } catch (e) {
        throw e
    } finally {
        await client.release(true)
        await pool.end()
    }
}

const getPayrollsFromDatabase = async ({ host, user, password, port, database }) => {
    if (!host || !user || !password) {
        throw new Error('missing required credentials properties: host, user, password')
    }
    const credentials = { host, user, password, port, database }
    const pool = getNewPool(credentials)
    const client = await pool.connect()
    try {
        const { rows } = await client.query('select codemp, codnom, desnom, despernom, anocurnom, fecininom from sno_nomina;')
        return rows
    } catch (e) {
        throw e
    } finally {
        await client.release(true)
        await pool.end()        
    }
}

const prepareForDump = async ({ host, port, user, password, database, tableDataToInclude = [] } = { tableDataToInclude: [] }) => {    
    if (tableDataToInclude.length === 0) return
    if (!database) { throw new Error('missing argument') }
    const stringTableData = tableDataToInclude.map(value => `tmp_${value.table_name}`).join(',')
    const pool = getNewPool({ host, port, user, password, database })
    const client = await pool.connect()
    try {
        await client.query('begin')
        await client.query(`drop table if exists ${stringTableData}`)
        tableDataToInclude
            .map( value => `create table tmp_${value.table_name} as select * from ${value.table_name} where ${value.where_clause}`)
            .forEach(async statement =>  await client.query(statement))
        await client.query('commit')
    } catch (e) {
        await client.query('rollback')
        throw e
    } finally {
        await client.release(true)
        await pool.end()
    }
}

const afterDump = async ({ host, port, user, password, database, tableDataToInclude = [] } = { tableDataToInclude: [] }) => {    
    if (tableDataToInclude.length === 0) return
    if (!database) { throw new Error('missing argument') }
    const stringTableData = tableDataToInclude.map(value => `tmp_${value.table_name}`).join(',')
    const pool = getNewPool({ host, port, user, password, database })
    const client = await pool.connect()
    try {
        await client.query('begin')
        await client.query(`drop table if exists ${stringTableData}`)
        await client.query('commit')
    } catch (e) {
        await client.query('rollback')
        throw e
    } finally {
        await client.release(true)
        await pool.end()
    }
}

const createDatabase = async ({ databasename = '', host, port, user, password } = { databasename: '' }) => {
    if (!databasename) { throw new Error('new database name missing') }
    const pool = getNewPool({ host, port, user, password })
    const client = await pool.connect()
    try {
        await client.query(`drop database if exists ${databasename}`)
        await client.query(`create database ${databasename} with template template0`)
        await client.query(`update pg_database set encoding=16 where datname='${databasename}'`)
    } catch (e) {
        throw e
    } finally {
        await client.release(true)
        await pool.end()
    }
}

const afterRestore = async ({ host, port, user, password, database, tableDataIncluded } = { tableDataIncluded: [] }) => {
    if (!database) { throw new Error('missing database') }
    if (tableDataIncluded.length === 0) return
    const stringTableData = tableDataIncluded.map(value => `tmp_${value.table_name}`).join(',')
    const pool = getNewPool({ host, port, user, password, database })
    const client = await pool.connect()
    try {
        await client.query('begin')
        await client.query('SET session_replication_role = replica')
        tableDataIncluded
            .map( value => `insert into ${value.table_name} select * from tmp_${value.table_name}`)
            .forEach(async statement =>  await client.query(statement))
        await client.query(`drop table if exists ${stringTableData}`)
        await client.query('SET session_replication_role = DEFAULT')
        await client.query('commit')
    } catch (e) {
        await client.query('rollback')
        throw e
    } finally {
        await client.release(true)
        await pool.end()
    }
}

module.exports = { 
    connectionValidation,
    getDatabases,
    getPayrollsFromDatabase,
    prepareForDump,
    createDatabase,
    afterDump,
    afterRestore
}