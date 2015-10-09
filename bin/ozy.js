#!/usr/bin/env node

'use strict'

let minimist = require('minimist')
let argv = minimist(process.argv.slice(2))

switch (argv._[0]) {

  case 'fingerprint':
    require('./fingerprint')
    break

}
