#!/usr/bin/env node

const {spawn} = require('child_process')
const {Readable} = require('stream')

switch (process.argv[2]) {

  case 'manifest':
    require('../manifest')('public')
    break

  case 'rollup':
    require('./rollup')(process.argv[3]).then((code) => console.log(code))
    break

  case 'browserify':
    require('./rollup')(process.argv[3]).then((code) => {
      const input = new Readable()

      const browserify = spawn('browserify', ['-'])
      input.pipe(browserify.stdin)

      if (process.env.NODE_ENV === 'production') {
        const uglify = spawn('uglifyjs', ['-m', '-c', 'warnings=false'])
        browserify.stdout.pipe(uglify.stdin)
        uglify.stdout.pipe(process.stdout)
      } else {
        browserify.stdout.pipe(process.stdout)
      }

      input.push(code)
      input.push(null)
    })
    break

  case 'sass':
    console.log(require('./sass')(process.argv[3]))
    break

}
