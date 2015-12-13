'use strict'

const App = require('../')
const test = require('./test')
const request = require('supertest')

test('flash shows for one request', (t) => {
  const app = App()

  app.post('/flash', (req, res) => {
    res.flash('success', 'test')
    res.end()
  })

  app.get('/flash', (req, res) => {
    t.deepEqual(req.flash, {type: 'success', message: 'test'})
    t.deepEqual(res.locals.flash, {type: 'success', message: 'test'})
    res.end()
  })

  app.get('/noflash', (req, res) => {
    t.ok(!req.flash)
    t.ok(!res.locals.flash)
    res.end()
  })

  const agent = request.agent(app)
  agent.post('/flash').expect(200).end((e) => {
    if (e) return t.end(e)
    agent.get('/flash').expect(200).end((e) => {
      if (e) return t.end(e)
      agent.get('/noflash').expect(200).end(t.end)
    })
  })
})
