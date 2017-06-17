'use strict'

const db = require('./db/instance')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const Migration = require('./migration')

module.exports = async (dir) => {
  await db.query(`
    create table if not exists migrations ( id varchar(255) primary key )
  `)

  const ids = await Migration.pluck('id')

  for (const file of glob.sync(path.join(dir, '*.sql'))) {
    const id = path.parse(file).name
    if (ids.includes(id)) continue
    await db.query(`insert into migrations (id) values ('${id}')`)
    await db.query(fs.readFileSync(file).toString())
  }
}
