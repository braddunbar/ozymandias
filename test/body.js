'use strict'

const test = require('./test')
const {post} = require('koa-route')

test('parse json bodies', (t) => {
  t.app.use(post('/json', function *() {
    this.body = this.request.body
  }))

  const values = {x: 1, y: 2, z: 3}

  t.agent
  .post('/json')
  .set('Content-Type', 'application/json')
  .send(JSON.stringify(values))
  .expect(values)
  .end(t.end)
})

test('parse urlencoded bodies', (t) => {
  t.app.use(post('/urlencoded', function *() {
    this.body = this.request.body
  }))

  t.agent
  .post('/urlencoded')
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send('x=1&y=2&z=3')
  .expect({x: 1, y: 2, z: 3})
  .end(t.end)
})
