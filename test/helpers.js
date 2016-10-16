'use strict'

const test = require('./test')

test('500', function *(t, {app, client}) {
  app.use(function *() { this.error(new Error('test')) })
  const response = yield client.get('/').send()
  response.expect(500)
  t.end()
})

test('422', function *(t, {app, client}) {
  app.use(function *() {
    const error = new Error('invalid')
    error.model = {errors: {x: 1}}
    this.error(error)
  })

  const response = yield client.get('/422').send()
  response.expect(422, {x: 1})
  t.end()
})

test('permit', function *(t, {app, client}) {
  app.use(function *() {
    t.deepEqual(this.permit('name', 'count', 'missing'), {
      name: 'test',
      count: 25
    })
    this.status = 200
  })

  const response = yield client
    .post('/')
    .set('accept', 'application/json')
    .send({id: 1, name: 'test', count: 25})
  response.expect(200)
  t.end()
})

test('permit allows explicitly null values', function *(t, {app, client}) {
  app.use(function *() {
    t.deepEqual(this.permit('street'), {street: null})
    this.status = 200
  })

  const response = yield client
    .post('/')
    .set('accept', 'application/json')
    .send({street: null})
  response.expect(200)
  t.end()
})

test('json', function *(t, {app, client}) {
  app.use(function *() {
    this.body = this.json('id', '</<!-<!--</script<!--</script')
  })
  const response = yield client.get('/').send()
  response.expect(200, `<script type='application/json' id='id'>"</<!-<\\u0021--<\\/script<\\u0021--<\\/script"</script>`)
  t.end()
})

test('json handles undefined', function *(t, {app, client}) {
  app.use(function *() {
    this.body = this.json('id', null)
  })
  const response = yield client.get('/').send()
  response.expect(200, `<script type='application/json' id='id'>null</script>`)
  t.end()
})

test('signIn/signOut', function *(t, {app, client}) {
  app.use(function *() {
    this.signIn(null)
    t.is(this.session.userId, undefined)
    this.signIn({id: 1})
    t.is(this.session.userId, 1)
    this.signOut()
    t.is(this.session, null)
    this.status = 200
  })
  const response = yield client.get('/').send()
  response.expect(200)
  t.end()
})
