'use strict'

const test = require('./test')

test('requests disallow caching by default', async (assert, {app, client}) => {
  app.use(async (_) => { _.body = {} })

  const response = await client.get('/').send()
  response.assert('cache-control', 'private, no-store, no-cache, max-age=0, must-revalidate')
  response.assert(200)
})
