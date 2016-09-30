#!/usr/bin/env node

switch (process.argv[2]) {

  case 'manifest':
    require('../manifest')('public')
    break

  case 'rollup':
    require('./rollup')(process.argv[3]).then((code) => console.log(code))
    break

  case 'sass':
    console.log(require('./sass')(process.argv[3]))
    break

}
