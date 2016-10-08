#!/usr/bin/env node

const path = require('path')
const {execSync} = require('child_process')

const args = process.argv.slice(3)
const file = path.join(__dirname, `ozy-${process.argv[2]}`)
let command = `${file} ${args.join(' ')}`

if (process.env.NODE_ENV !== 'production') {
  command = `env $(cat .env | xargs) ${command}`
}

execSync(command, {stdio: 'inherit'})
