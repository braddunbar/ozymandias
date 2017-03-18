'use strict'

const test = require('./test')

test('all requests include vary header', async (t, {app, client}) => {
  app.use(async (_) => { _.body = {} })

  const response = await client.get('/').send()
  response.assert('vary', /(,|^)\s*accept\s*(,|$)/)
  response.assert(200)
})
