#!/usr/bin/env node

'use strict'

const dir = process.cwd()
const {join} = require('path')
const dotenv = require('dotenv')
const {NODE_ENV} = process.env

if (!NODE_ENV || NODE_ENV === 'development') {
  const config = dotenv.config()
  if (config.error) throw config.error
}

const app = require(join(dir, require(join(dir, 'package.json')).main))
app().cli()
