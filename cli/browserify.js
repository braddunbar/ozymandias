'use strict'

const {execSync} = require('child_process')

module.exports = async function (file) {
  let command = `ozy rollup ${file} | browserify -`

  if (process.env.NODE_ENV === 'production') {
    command += ' | uglifyjs -m -c warnings=false'
  }

  execSync(command, {stdio: 'inherit'})
}
