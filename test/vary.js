'use strict'

const test = require('./test')

test('all requests include vary header', (t) => {
  t.app.use(function *() { this.body = {} })

  t.agent.get('/')
  .expect('vary', /Accept(,|$)/)
  .expect(200)
  .end(t.end)
})
