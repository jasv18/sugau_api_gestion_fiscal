const { Pool } = require('pg')

const requiredPropsCredentials = ['host', 'user', 'password']

const getNewPool = ( credentials ) => new Pool({ ...credentials, connectionTimeoutMillis: 4000 })

const connectToDatabase = async ( credentials ) => {
    const pool = getNewPool( credentials )
    const client = await pool.connect()
    return { pool, client }
}

const ensuresRequiredProps = ( obj, requiredProps ) => {
    requiredProps.forEach( prop => {
        if ( !obj[prop] ) {
            throw new Error(`missing required property: ${prop}`)
        }
    })
}

const connectionValidation = async ( credentials ) => {
    ensuresRequiredProps( credentials, requiredPropsCredentials )
    const { pool, client } = await connectToDatabase( credentials )
    await client.release(true)
    await pool.end()
}

const getDatabases = async ( credentials ) => {
    ensuresRequiredProps( credentials, requiredPropsCredentials )
    const { pool, client } = await connectToDatabase( credentials )
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

const getPayrollsFromDatabase = async ( credentials ) => {
    ensuresRequiredProps( credentials, [...requiredPropsCredentials, 'database'] )
    const { pool, client } = await connectToDatabase( credentials )
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

const prepareForDump = async ( credentials, tableDataToInclude ) => {
    if (!tableDataToInclude || !Array.isArray(tableDataToInclude) || tableDataToInclude.length === 0) return
    ensuresRequiredProps( credentials, [...requiredPropsCredentials, 'database'] )
    const { pool, client } = await connectToDatabase( credentials )
    const stringTableData = tableDataToInclude.map(value => `tmp_${value.table_name}`).join(',')
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

const afterDump = async ( credentials, tableDataToInclude ) => {    
    if (!tableDataToInclude || !Array.isArray(tableDataToInclude) || tableDataToInclude.length === 0) return
    ensuresRequiredProps( credentials, [...requiredPropsCredentials, 'database'] )
    const { pool, client } = await connectToDatabase( credentials )
    const stringTableData = tableDataToInclude.map(value => `tmp_${value.table_name}`).join(',')
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

const createDatabase = async ( credentials, databasename) => {
    if (!databasename) { throw new Error('new database name missing') }
    ensuresRequiredProps( credentials, [...requiredPropsCredentials] )
    const { pool, client } = await connectToDatabase( credentials )
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

const afterRestore = async (credentials, tableDataIncluded) => {
    if (!tableDataIncluded || !Array.isArray(tableDataIncluded) || tableDataIncluded.length === 0) return
    ensuresRequiredProps( credentials, [...requiredPropsCredentials, 'database'] )
    const { pool, client } = await connectToDatabase( credentials )
    const stringTableData = tableDataIncluded.map(value => `tmp_${value.table_name}`).join(',')
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