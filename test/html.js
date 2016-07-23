'use strict'

const test = require('tape')
const {html, raw} = require('../html')

test('html escape values, not literals', (t) => {
  t.is(html`<p>${'&<>"\'`'}</p>`, '<p>&amp;&lt;&gt;&quot;&#x27;&#x60;</p>')
  t.end()
})

test('do not escape RAW values', (t) => {
  t.is(html`<p>${raw('&<>"\'`')}</p>`, '<p>&<>"\'`</p>')
  t.end()
})

test('trim it up', (t) => {
  t.is(html` x `, 'x')
  t.end()
})
