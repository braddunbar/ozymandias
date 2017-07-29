'use strict'

const sass = require('../sass')

module.exports = async function (file) {
  console.log(await sass(file))
}
