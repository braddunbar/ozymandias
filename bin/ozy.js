#!/usr/bin/env node

'use strict'

const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))

switch (argv._[0]) {

  case 'manifest':
    require('../manifest')('public')
    break

}
