'use strict'

const test = require('./test')
const {post} = require('koa-route')

test('parse json bodies', async ({assert, app, client}) => {
  const values = {x: 1, y: 2, z: 3}

  app.use(post('/json', async (_) => {
    assert.deepEqual(_.request.body, values)
    _.body = _.request.body
  }))

  const response = await client
    .post('/json')
    .set('content-type', 'application/json')
    .send(values)

  response.assert(200, values)
})

test('parse urlencoded bodies', async ({assert, app, client}) => {
  app.use(post('/urlencoded', async (_) => {
    _.body = _.request.body
  }))

  const response = await client
    .post('/urlencoded')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send('x=1&y=2&z=3')

  response.assert(200, {x: '1', y: '2', z: '3'})
})
