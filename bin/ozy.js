#!/usr/bin/env node

const path = require('path')
const {execSync} = require('child_process')

const args = process.argv.slice(3)
const file = path.join(__dirname, `ozy-${process.argv[2]}`)

execSync(`env $(cat .env | xargs) ${file} ${args.join(' ')}`, {stdio: 'inherit'})
