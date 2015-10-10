'use strict'

let ozy = require('../')
let test = require('tape')
let request = require('supertest')

test('parse json bodies', function (t) {
  let app = ozy()

  app.post('/json', function (req, res) {
    res.json(req.body)
  })

  let values = {x: 1, y: 2, z: 3}

  request(app)
  .post('/json')
  .set('Content-Type', 'application/json')
  .send(JSON.stringify(values))
  .expect(values)
  .end(t.end)
})

test('parse urlencoded bodies', function (t) {
  let app = ozy()

  app.post('/urlencoded', function (req, res) {
    res.json(req.body)
  })

  request(app)
  .post('/urlencoded')
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send('x=1&y=2&z=3')
  .expect({x: 1, y: 2, z: 3})
  .end(t.end)
})
