'use strict'

const test = require('./test')
const {get} = require('koa-route')

test('/admin returns 401 when signed out', async ({app, client}) => {
  app.use(get('/admin/test', async (_) => {
    _.body = 'test'
  }))

  const response = await client.get('/admin/test').send()

  response.assert(401)
})

test('/admin returns 403 for non-admins', async ({app, client}) => {
  app.use(get('/admin/test', async (_) => {
    _.body = 'test'
  }))

  await client.signIn('jd@example.com')

  const response = await client.get('/admin/test').send()

  response.assert(403)
})

test('/admin returns 200 for admins', async ({app, client}) => {
  app.use(get('/admin/test', async (_) => {
    _.body = 'test'
  }))

  await client.signIn('brad@example.com')

  const response = await client.get('/admin/test').send()

  response.assert(200, 'test')
})
