'use strict'

const db = require('../db/instance')
const path = require('path')
const migrate = require('../migrate')

module.exports = async function () {
  db.log = () => {}

  const transaction = db.transaction()
  db.query = transaction.query.bind(transaction)

  await migrate(path.resolve(__dirname, '../migrate'))
  await migrate('./migrate')
  await transaction.commit()

  db.close()
}
