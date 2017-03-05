'use strict'

// Find and replace characters to be escaped.
const escaper = /[&<>"'`]/g

// Map characters to escaped entities.
const escapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
}

// HTML escape a value.
const escape = (value) => {
  if (value == null) return ''
  return value.toString().replace(escaper, (match) => escapes[match])
}

// Raw Values
class Raw {
  constructor (value) {
    this.value = value
  }

  toString () {
    return this.value
  }
}

exports.raw = value => new Raw(value)

exports.html = (literals, ...values) => {
  let i = 0
  let result = ''

  for (const value of values) {
    result += literals.raw[i++]
    result += value instanceof Raw ? value : escape(value)
  }
  return (result + literals.raw[i]).trim()
}
