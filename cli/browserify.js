'use strict'

const rollup = require('../rollup')
const browserify = require('../browserify')

module.exports = async function (file) {
  console.log(await browserify(await rollup(file)))
}
