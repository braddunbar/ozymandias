'use strict'

const test = require('./test')
const {html, raw} = require('../html')

test('html escape values, not literals', async (assert) => {
  assert.is(html`<p>${'&<>"\'`'}</p>`, '<p>&amp;&lt;&gt;&quot;&#x27;&#x60;</p>')
})

test('do not escape RAW values', async (assert) => {
  assert.is(html`<p>${raw('&<>"\'`')}</p>`, '<p>&<>"\'`</p>')
})

test('trim it up', async (assert) => {
  assert.is(html` x `, 'x')
})
