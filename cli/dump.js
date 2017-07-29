'use strict'

const {execSync} = require('child_process')

module.exports = async function () {
  execSync(`pg_dump --clean --create --no-owner --no-privileges $DATABASE_URL > schema.sql`, {stdio: 'inherit'})
}
