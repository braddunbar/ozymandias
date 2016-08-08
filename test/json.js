'use strict'

const test = require('./test')
const request = require('supertest')
const app = require('../')()

// function

app.get('/function', (req, res) => {
  res.locals.x = 1
  res.json((set, {x, y}) => set({x, y}), {y: 2})
})

test('render a json function', (t) => {
  request(app)
  .get('/function')
  .expect({x: 1, y: 2})
  .end(t.end)
})

// object

app.get('/object', (req, res) => {
  res.json({x: 1, y: 2})
})

test('render a json object', (t) => {
  request(app)
  .get('/object')
  .expect({x: 1, y: 2})
  .end(t.end)
})
