import pg from 'pg'
import { pgDump, pgRestore, FormatEnum } from 'pg-dump-restore'
import { getSchemaSpecifics } from './dbUtils/getSchemaSpecifics'
import { uniqueId } from '../../utils/uniqueId'
import { unlink } from 'node:fs';

const { Pool } = pg

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

export const connectionValidation = async ( credentials ) => {
    ensuresRequiredProps( credentials, requiredPropsCredentials )
    const { pool, client } = await connectToDatabase( credentials )
    await client.release(true)
    await pool.end()
}

export const getDatabases = async ( credentials ) => {
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

export const getPayrollsFromDatabase = async ( credentials ) => {
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

export const prepareForDump = async ( credentials, tableDataToInclude ) => {
    if (!tableDataToInclude || !Array.isArray(tableDataToInclude) || tableDataToInclude.length === 0) {
        return
    }
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

export const afterDump = async ( credentials, tableDataToInclude ) => {    
    if (!tableDataToInclude || !Array.isArray(tableDataToInclude) || tableDataToInclude.length === 0) {
        return
    }
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

export const createDatabase = async ( credentials, databasename) => {
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

export const afterRestore = async (credentials, tableDataIncluded) => {
    if (!tableDataIncluded || !Array.isArray(tableDataIncluded) || tableDataIncluded.length === 0) {
        return
    }
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

async function dumpDb({ host, port, user, password, database, filePath, dataTableToExclude = [] }) {
    const { stdout, stderr } = await pgDump(
      {
        port, // defaults to 5432
        host,
        database,
        username: user,
        password,
      },
      {
        format: FormatEnum.Custom,
        filePath,
        excludeTableDataPattern: dataTableToExclude
      },
    )
  }
  
  async function restoreDb({ host, port, user, password, database, filePath }) {
    const { stdout, stderr } = await pgRestore(
      {
        port, // defaults to 5432
        host,
        database,
        username: user,
        password,
      },
      { filePath }
    )
  }
  
  export const generateDb = async ({ host, user, password, port, srcDatabase, dstDatabase, payrolls }) => {
    const credentials = { host, user, password, port }
    const rows = await getDatabases(credentials)
    const datNames = rows.map(({ datname }) => datname)
    if (datNames.includes(dstDatabase)) throw new Error('Database already exists')
    const tempId = uniqueId()
    const filePath = `${srcDatabase}${tempId}.dump`
    const { dataTableToExclude, tableDataToInclude } = getSchemaSpecifics(payrolls)
    await prepareForDump({ ...credentials, database: srcDatabase }, tableDataToInclude)
    await dumpDb({ ...credentials, filePath, database: srcDatabase, dataTableToExclude })
    await afterDump({ ...credentials, database: srcDatabase }, tableDataToInclude)
    const tableDataIncluded = JSON.parse(JSON.stringify(tableDataToInclude))
    await createDatabase(credentials, dstDatabase)
    await restoreDb({ ...credentials, filePath, database: dstDatabase })
    await afterRestore({ ...credentials, database: dstDatabase }, tableDataIncluded)
    unlink(`./${filePath}`, (err) => {
      if (err) console.error(err)
    })
  }
