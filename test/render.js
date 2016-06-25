'use strict'

const test = require('tape')
const request = require('supertest')

test('render a function', (t) => {
  const app = require('../')()
  app.locals = {x: 1, y: 1, z: 1}

  app.get('/', (req, res) => {
    res.locals = {y: 2, z: 2}
    res.render(({x, y, z}) => `${x}${y}${z}`, {z: 3})
  })

  request(app).get('/').expect('123').expect(200).end(t.end)
})

test('render a function with layout', (t) => {
  const app = require('../')()
  app.locals = {x: 1, y: 1, z: 1}
  app.set('layout', (content, {x, y, z}) => `${z}${y}${x}${content}`)

  app.get('/', (req, res) => {
    res.locals = {y: 2, z: 2}
    res.render(({x, y, z}) => `${x}${y}${z}`, {z: 3})
  })
  request(app).get('/').expect('321123').expect(200).end(t.end)
})
