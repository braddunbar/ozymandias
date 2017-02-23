'use strict'

const test = require('./test')

test('500', async (t, {app, client}) => {
  app.use(async (_) => { _.error(new Error('test')) })
  const response = await client.get('/').send()
  response.assert(500)
})

test('422', async (t, {app, client}) => {
  app.use(async (_) => {
    const error = new Error('invalid')
    error.model = {errors: {x: 1}}
    _.error(error)
  })

  const response = await client.get('/422').send()
  response.assert(422, {x: 1})
})

test('permit', async (t, {app, client}) => {
  app.use(async (_) => {
    t.deepEqual(_.permit('name', 'count', 'missing'), {
      name: 'test',
      count: 25
    })
    _.status = 200
  })

  const response = await client
    .post('/')
    .set('accept', 'application/json')
    .send({id: 1, name: 'test', count: 25})
  response.assert(200)
})

test('permit allows explicitly null values', async (t, {app, client}) => {
  app.use(async (_) => {
    t.deepEqual(_.permit('street'), {street: null})
    _.status = 200
  })

  const response = await client
    .post('/')
    .set('accept', 'application/json')
    .send({street: null})
  response.assert(200)
})

test('json', async (t, {app, client}) => {
  app.use(async (_) => {
    _.body = _.json('id', '</<!-<!--</script<!--</script')
  })
  const response = await client.get('/').send()
  response.assert(200, `<script type='application/json' id='id'>"</<!-<\\u0021--<\\/script<\\u0021--<\\/script"</script>`)
})

test('json handles mixed case', async (t, {app, client}) => {
  app.use(async (_) => {
    _.body = _.json('id', '</sCrIpT')
  })
  const response = await client.get('/').send()
  response.assert(200, `<script type='application/json' id='id'>"<\\/sCrIpT"</script>`)
})

test('json handles undefined', async (t, {app, client}) => {
  app.use(async (_) => {
    _.body = _.json('id', null)
  })
  const response = await client.get('/').send()
  response.assert(200, `<script type='application/json' id='id'>null</script>`)
})

test('signIn/signOut', async (t, {app, client}) => {
  app.use(async (_) => {
    _.signIn(null)
    t.is(_.session.userId, undefined)
    _.signIn({id: 1})
    t.is(_.session.userId, 1)
    _.signOut()
    t.is(_.session, null)
    _.status = 200
  })
  const response = await client.get('/').send()
  response.assert(200)
})

test('csp', async (t, {app, client}) => {
  app.use(async (_) => {
    _.csp('script-src', 'x.net')
    _.csp('script-src', 'y.org')
    _.csp('style-src', 'z.com')
    _.status = 200
  })
  const response = await client.get('/').send()
  response
    .assert(200)
    .assert('content-security-policy', /script-src[^;]+x.net y.org;/)
    .assert('content-security-policy', /style-src[^;]+z.com;/)
})
