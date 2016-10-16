'use strict'

const test = require('./test')
const {html, raw} = require('../html')

test('html escape values, not literals', function *(t) {
  t.is(html`<p>${'&<>"\'`'}</p>`, '<p>&amp;&lt;&gt;&quot;&#x27;&#x60;</p>')
})

test('do not escape RAW values', function *(t) {
  t.is(html`<p>${raw('&<>"\'`')}</p>`, '<p>&<>"\'`</p>')
})

test('trim it up', function *(t) {
  t.is(html` x `, 'x')
})
