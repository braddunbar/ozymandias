'use strict'

const {execSync} = require('child_process')
const mkdirp = require('mkdirp')

module.exports = async function (name) {
  if (!name) throw new Error('Please supply a migration name.')
  mkdirp.sync('migrate')
  execSync(`touch migrate/$(date +'%Y-%m-%d-%H%M')-${name}.sql`, {stdio: 'inherit'})
}
