const { pgDump, pgRestore, FormatEnum } = require('pg-dump-restore');
const { prepareForDump, createDatabase, afterDump, afterRestore } = require('../db/pg')
const { getSchemaSpecifics } = require('./getSchemaSpecifics')
const uniqueId = require('./uniqueId')
const { unlink } = require('node:fs')


async function dumpDb({ host, port, user, password, database, filePath, dataTableToExclude }) {
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
      excludeTableDataPattern: dataTableToExclude.length !== 0 ? [...dataTableToExclude] : undefined
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

const generateDb = async ({ credentials, srcDatabase, dstDatabase, payrolls }) => {
  const tempId = uniqueId()
  const filePath = `${srcDatabase}${tempId}.dump`
  const { dataTableToExclude, tableDataToInclude } = getSchemaSpecifics(payrolls)
  await prepareForDump({ ...credentials, database: srcDatabase, tableDataToInclude })
  await dumpDb({ ...credentials, filePath, database: srcDatabase, dataTableToExclude })
  await afterDump({ ...credentials, database: srcDatabase, tableDataToInclude })
  const tableDataIncluded = JSON.parse(JSON.stringify(tableDataToInclude))
  await createDatabase({ ...credentials, databasename: dstDatabase })
  await restoreDb({ ...credentials, filePath, database: dstDatabase })
  await afterRestore({ ...credentials, database: dstDatabase, tableDataIncluded })
  unlink(`./${filePath}`, (err) => {
    if (err) console.error(err)
  })
}

module.exports = { generateDb }