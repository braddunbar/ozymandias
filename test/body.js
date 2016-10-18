'use strict'

const test = require('./test')
const {post} = require('koa-route')

test('parse json bodies', function *(t, {app, client}) {
  app.use(post('/json', function *() {
    this.body = this.request.body
  }))

  const values = {x: 1, y: 2, z: 3}
  const response = yield client
    .post('/json')
    .set('content-type', 'application/json')
    .send(values)

  response.expect(200, values)
})

test('parse urlencoded bodies', function *(t, {app, client}) {
  app.use(post('/urlencoded', function *() {
    this.body = this.request.body
  }))

  const response = yield client
    .post('/urlencoded')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send('x=1&y=2&z=3')

  response.expect(200, {x: '1', y: '2', z: '3'})
})
