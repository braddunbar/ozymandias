'use strict'

const db = require('./db/instance')
const fs = require('fs')
const glob = require('glob')
const path = require('path')

module.exports = async (dir) => {
  await db.query(`
    create table if not exists migrations ( id varchar(255) primary key )
  `)

  return db.query(glob.sync(path.join(dir, '*.sql')).map((file) => {
    const id = path.parse(file).name
    return `
      do $$begin
        if not exists(select 1 from migrations where id = '${id}') then
          insert into migrations (id) values ('${id}');
          ${fs.readFileSync(file)}
        end if;
      end$$;
    `
  }).join('\n'))
}
