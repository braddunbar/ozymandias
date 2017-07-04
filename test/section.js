'use strict'

const test = require('./test')
const {get} = require('koa-route')

test('handle null sections', async ({app, client}) => {
  app.sections = null

  app.use(get('*', async (_) => {
    _.body = {section: _.section}
  }))

  const response = await client
    .get('/')
    .accept('application/json')
    .send()

  response.assert(200, {section: null})
})

test('match the exact path', async ({app, client}) => {
  app.sections = {x: '/x/(.*)*'}

  app.use(get('*', async (_) => {
    _.body = {section: _.section}
  }))

  const response = await client
    .get('/x')
    .accept('application/json')
    .send()

  response.assert(200, {section: 'x'})
})

test('match a sub path', async ({app, client}) => {
  app.sections = {x: '/x/(.*)*'}

  app.use(get('*', async (_) => {
    _.body = {section: _.section}
  }))

  const response = await client
    .get('/x/y')
    .accept('application/json')
    .send()

  response.assert(200, {section: 'x'})
})

test('match a sub sub path', async ({app, client}) => {
  app.sections = {x: '/x/(.*)*'}

  app.use(get('*', async (_) => {
    _.body = {section: _.section}
  }))

  const response = await client
    .get('/x/y/z')
    .accept('application/json')
    .send()

  response.assert(200, {section: 'x'})
})

test('handle non-matches', async ({app, client}) => {
  app.sections = {x: '/x/(.*)*'}

  app.use(get('*', async (_) => {
    _.body = {section: _.section}
  }))

  const response = await client
    .get('/y')
    .accept('application/json')
    .send()

  response.assert(200, {section: null})
})

test('handle multiple sections', async ({app, client}) => {
  app.sections = {x: '/x/(.*)*', y: '/y/(.*)*'}

  app.use(get('*', async (_) => {
    _.body = {section: _.section}
  }))

  const response = await client
    .get('/y')
    .accept('application/json')
    .send()

  response.assert(200, {section: 'y'})
})

test('handle fallback', async ({app, client}) => {
  app.sections = {x: '/x(.*)*', fallback: '*'}

  app.use(get('*', async (_) => {
    _.body = {section: _.section}
  }))

  const response = await client
    .get('/y')
    .accept('application/json')
    .send()

  response.assert(200, {section: 'fallback'})
})

test('handle fallback at the root', async ({app, client}) => {
  app.sections = {x: '/x/(.*)*', fallback: '*'}

  app.use(get('*', async (_) => {
    _.body = {section: _.section}
  }))

  const response = await client
    .get('/')
    .accept('application/json')
    .send()

  response.assert(200, {section: 'fallback'})
})
