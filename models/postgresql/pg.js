import pg from 'pg'
import { pgDump, pgRestore, FormatEnum } from 'pg-dump-restore'
import { getSchemaSpecifics } from './dbUtils/getSchemaSpecifics.js'
import { uniqueId } from '../../utils/uniqueId.js'
import { unlink } from 'node:fs/promises';
import { isRegExp } from 'node:util/types';

const regexA = /^[a-zA-Z_][a-zA-Z0-9_]*$/

const isRegexValid = (regex) => isRegExp(regex)

const isValueValid = (regex, value) => isRegexValid(regex) && regex.test(value)

const { Pool } = pg

const requiredPropsCredentials = ['host', 'user', 'password']

const getNewPool = ( credentials ) => new Pool({ ...credentials, connectionTimeoutMillis: 4000 })

const connectToDatabase = async ( credentials ) => {
    const pool = getNewPool( credentials )
    const client = await pool.connect()
    return { pool, client }
}

const ensuresRequiredPropsCredentials = ( obj, requiredProps ) => {
    requiredProps.forEach( prop => {
        if ( !obj[prop] ) {
            throw new Error(`missing required property: ${prop}`)
        }
    })
}

export class PgModel {

    static async validateConnection ( credentials ) {
        ensuresRequiredPropsCredentials( credentials, requiredPropsCredentials )
        const { pool, client } = await connectToDatabase( credentials )
        await client.release(true)
        await pool.end()
    }
    
    static async getAllDatabases ( credentials ) {
        ensuresRequiredPropsCredentials( credentials, requiredPropsCredentials )
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
    
    static async getDatabaseByName ( credentials, databasename ) {
        if (!databasename) { throw new Error('new database name missing') }
        if (!isValueValid(regexA, databasename)) { throw new Error('invalid databasename') }
        ensuresRequiredPropsCredentials( credentials, requiredPropsCredentials )
        const { pool, client } = await connectToDatabase( credentials )
        try {
            const { rows } = await client.query("SELECT * FROM pg_database WHERE UPPER(datname) = UPPER('$1');",[databasename])
            return rows
        } catch (e) {
            throw e
        } finally {
            await client.release(true)
            await pool.end()
        }
    }
    
    static async getPayrollsFromDatabase ( credentials ) {
        ensuresRequiredPropsCredentials( credentials, [...requiredPropsCredentials, 'database'] )
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
    
    static async prepareForDump ( credentials, tableDataToInclude ) {
        if (!tableDataToInclude || !Array.isArray(tableDataToInclude) || tableDataToInclude.length === 0) {
            return
        }
        ensuresRequiredPropsCredentials( credentials, [...requiredPropsCredentials, 'database'] )
        const { pool, client } = await connectToDatabase( credentials )
        const stringTableData = tableDataToInclude.map(value => `tmp_${value.table_name}`).join(',')
        try {
            await client.query('begin')
            await client.query(`drop table if exists ${stringTableData}`)
            await Promise.all(tableDataToInclude
                .map( async value => await client.query(`create table tmp_${value.table_name} as select * from ${value.table_name} where ${value.where_clause}`))
            )   
            await client.query('commit')
        } catch (e) {
            await client.query('rollback')
            throw e
        } finally {
            await client.release(true)
            await pool.end()
        }
    }
    
    static async afterDump ( credentials, tableDataToInclude ) {    
        if (!tableDataToInclude || !Array.isArray(tableDataToInclude) || tableDataToInclude.length === 0) {
            return
        }
        ensuresRequiredPropsCredentials( credentials, [...requiredPropsCredentials, 'database'] )
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
    
    static async createDatabase ( credentials, databasename) {
        if (!databasename) { throw new Error('new database name missing') }
        if (!isValueValid(regexA, databasename)) { throw new Error('invalid databasename') }
        ensuresRequiredPropsCredentials( credentials, [...requiredPropsCredentials] )
        const { pool, client } = await connectToDatabase( credentials )
        try {
            // await client.query(`drop database if exists ${databasename}`)
            await client.query(`create database ${databasename} with template template0;`)
            await client.query(`update pg_database set encoding=16 where datname='${databasename}';`)
        } catch (e) {
            throw e
        } finally {
            await client.release(true)
            await pool.end()
        }
    }
    
    static async afterRestore (credentials, tableDataIncluded) {
        if (!tableDataIncluded || !Array.isArray(tableDataIncluded) || tableDataIncluded.length === 0) {
            return
        }
        ensuresRequiredPropsCredentials( credentials, [...requiredPropsCredentials, 'database'] )
        const { pool, client } = await connectToDatabase( credentials )
        const stringTableData = tableDataIncluded.map(value => `tmp_${value.table_name}`).join(',')
        try {
            await client.query('begin')
            await client.query('SET session_replication_role = replica')
            await Promise.all(tableDataIncluded
                .map( async value => await client.query(`insert into ${value.table_name} select * from tmp_${value.table_name}`))
            )
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
      
    static async generateDb ({ host, user, password, port, srcDatabase, dstDatabase, payrolls }) {
        const credentials = { host, user, password, port }
    
        const rows = await this.getAllDatabases(credentials)
    
    
        const datNames = rows.map(({ datname }) => datname)
        if (datNames.includes(dstDatabase)) throw new Error('Database already exists')
        const tempId = uniqueId()
        const filePath = `${srcDatabase}_${tempId}.dump`
        const { dataTableToExclude, tableDataToInclude } = getSchemaSpecifics(payrolls)
        await this.prepareForDump({ ...credentials, database: srcDatabase }, tableDataToInclude)
        // await dumpDb({ ...credentials, filePath, database: srcDatabase, dataTableToExclude })
        await pgDump(
            {
                port,
                host,
                database: srcDatabase,
                username: user,
                password,
            },
            {
                format: FormatEnum.Custom,
                filePath,
                excludeTableDataPattern: dataTableToExclude
            }
        )
        await this.afterDump({ ...credentials, database: srcDatabase }, tableDataToInclude)
        const tableDataIncluded = JSON.parse(JSON.stringify(tableDataToInclude))
        await this.createDatabase(credentials, dstDatabase)
        // await restoreDb({ ...credentials, filePath, database: dstDatabase })
        await pgRestore(
            {
                port,
                host,
                database: dstDatabase,
                username: user,
                password,
            },
            { 
                filePath
            }
        )
        await this.afterRestore({ ...credentials, database: dstDatabase }, tableDataIncluded)
        unlink(`./${filePath}`, (err) => {
            if (err) console.error(err)
        })
    }
}