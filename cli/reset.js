'use strict'

const {execSync} = require('child_process')

module.exports = async function () {
  execSync(`psql postgres://localhost/postgres < schema.sql`, {stdio: 'inherit'})
}
