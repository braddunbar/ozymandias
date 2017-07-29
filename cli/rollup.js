'use strict'

const rollup = require('../rollup')

module.exports = async function (file) {
  console.log(await rollup(file))
}
