'use strict'

const test = require('./test')

test('all requests include vary header', function *(t, {app, client}) {
  app.use(function *() { this.body = {} })

  const response = yield client.get('/').send()
  response.assert('vary', /Accept(,|$)/)
  response.assert(200)
})
