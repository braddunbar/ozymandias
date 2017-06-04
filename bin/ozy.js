#!/usr/bin/env node

'use strict'

const path = require('path')
const {execSync} = require('child_process')

const args = process.argv.slice(3)
const file = path.join(__dirname, `ozy-${process.argv[2]}`)
let command = `${file} ${args.join(' ')}`

if (!['production', 'test'].includes(process.env.NODE_ENV)) {
  command = `env $(cat .env | xargs) ${command}`
}

try {
  execSync(command, {stdio: 'inherit'})
} catch (error) {
  process.exit(1)
}
