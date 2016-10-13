'use strict'

const test = require('./test')

test('500', (t) => {
  t.app.use(function *() { this.error(new Error('test')) })
  t.agent.get('/').expect(500).end(t.end)
})

test('422', (t) => {
  t.app.use(function *() {
    const error = new Error('invalid')
    error.model = {errors: {x: 1}}
    this.error(error)
  })

  t.agent.get('/422').expect(422, {x: 1}).end(t.end)
})

test('permit', (t) => {
  t.app.use(function *() {
    t.deepEqual(this.permit('name', 'count', 'missing'), {
      name: 'test',
      count: 25
    })
    this.status = 200
  })

  t.agent.post('/')
  .set('accept', 'application/json')
  .send({id: 1, name: 'test', count: 25})
  .expect(200)
  .end(t.end)
})

test('permit allows explicitly null values', (t) => {
  t.app.use(function *() {
    t.deepEqual(this.permit('street'), {street: null})
    this.status = 200
  })
  t.agent.post('/')
  .set('accept', 'application/json')
  .send({street: null})
  .expect(200)
  .end(t.end)
})

test('json', (t) => {
  t.app.use(function *() {
    this.body = this.json('id', '</<!-<!--</script<!--</script')
  })
  t.agent.get('/')
  .expect(200, `<script type='application/json' id='id'>"</<!-<\\u0021--<\\/script<\\u0021--<\\/script"</script>`)
  .end(t.end)
})

test('json handles undefined', (t) => {
  t.app.use(function *() {
    this.body = this.json('id', null)
  })
  t.agent.get('/')
  .expect(200, `<script type='application/json' id='id'>null</script>`)
  .end(t.end)
})

test('signIn/signOut', (t) => {
  t.app.use(function *() {
    this.signIn(null)
    t.is(this.session.userId, undefined)
    this.signIn({id: 1})
    t.is(this.session.userId, 1)
    this.signOut()
    t.is(this.session, null)
    this.status = 200
  })
  t.agent.get('/').expect(200).end(t.end)
})
