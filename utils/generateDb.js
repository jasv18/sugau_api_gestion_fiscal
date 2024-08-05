const { pgDump, pgRestore, FormatEnum } = require('pg-dump-restore');
const { prepareForDump, createDatabase, afterDump, afterRestore } = require('../db/pg')
const { getSchemaSpecifics } = require('./getSchemaSpecifics')
const uniqueId = require('./uniqueId')
const { unlink } = require('node:fs')
const { getDatabases } = require('./../db/pg')


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

const generateDb = async ({ host, user, password, port, srcDatabase, dstDatabase, payrolls }) => {
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

module.exports = { generateDb }