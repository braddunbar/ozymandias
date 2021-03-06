'use strict'

const test = require('./test')
const React = require('react')

test('render state as json', async ({assert, app, client}) => {
  let url

  app.use(async (_) => {
    url = _.origin + _.originalUrl
    _.render({x: 1})
  })

  const response = await client
    .get('/?x=1')
    .set('accept', 'application/json')
    .send()

  response.assert(200, {
    currentUser: null,
    admin: false,
    x: 1,
    path: '/',
    section: null,
    sections: {},
    statusCode: 200,
    url,
    version: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
  })
})

test('render state as HTML', async ({assert, app, client}) => {
  app.context.client = ({x}) => React.createElement('em', {}, x)

  app.use(async (_) => {
    _.render({x: 1})
    assert.deepEqual(_.state.client, {
      currentUser: null,
      admin: false,
      x: 1,
      path: '/',
      section: null,
      sections: {},
      statusCode: 200,
      url: _.origin + _.originalUrl,
      version: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
    })
  })

  const response = await client
    .get('/?x=1')
    .set('Accept', 'text/html')
    .send()
  response.assert(200, `<div id='root'><em data-reactroot="">1</em></div>`)
})

test('return html for browser accept value', async ({assert, app, client}) => {
  app.use(async (_) => { _.render() })

  const response = await client
    .get('/')
    .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    .send()
  response.assert(200).assert('content-type', /html/)
})

test('toJSON', async ({assert, app, client}) => {
  app.context.client = ({x}) => {
    assert.is(x, 1)
    return null
  }

  app.use(async (_) => {
    _.render({x: {toJSON () { return 1 }}})
    assert.is(_.state.client.x, 1)
  })

  const response = await client.get('/').send()
  response.assert(200)
})

test('explicit 404 status', async ({assert, app, client}) => {
  app.use(async (_) => {
    _.status = 404
    _.render()
    assert.is(_.state.client.statusCode, 404)
  })
  const response = await client.get('/').send()
  response.assert(404)
})

test('use context.state.client', async ({assert, app, client}) => {
  let url

  app.use(async (_) => {
    url = _.origin + _.originalUrl
    _.state.client.x = 1
    _.render()
  })
  const response = await client
    .get('/')
    .set('accept', 'application/json')
    .send()

  response.assert(200, {
    currentUser: null,
    admin: false,
    path: '/',
    section: null,
    sections: {},
    statusCode: 200,
    url,
    version: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
    x: 1
  })
})

test('return the correct section data', async ({assert, app, client}) => {
  let url

  app.sections = {x: '/x/(.*)*'}

  app.use(async (_) => {
    url = _.origin + _.originalUrl
    _.render()
  })

  const response = await client
    .get('/x')
    .set('accept', 'application/json')
    .send()

  response.assert(200, {
    currentUser: null,
    admin: false,
    path: '/x',
    section: 'x',
    sections: {x: '/x/(.*)*'},
    statusCode: 200,
    url,
    version: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
  })
})
