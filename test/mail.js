'use strict'

var test = require('./test')
var request = require('supertest')
var mail = require('../mail')

var sent = null
var app = require('../')()
app.set('views', 'test/views')

app.get('/', function (req, res) {
  req.mail('mail/test', {
    send: false,
    to: ['to@example.com'],
    cc: ['cc@example.com'],
    bcc: ['bcc@example.com'],
    title: 'test email'
  }).then(function (mail) {
    sent = mail
    res.status(200).end()
  }).catch(function (e) { throw e })
})

test('render the layout', function (t) {
  request(app)
  .get('/')
  .expect(200)
  .end(function (e) {
    if (e) return t.end(e)
    t.deepEqual(sent.Message.Body, {
      Html: {
        Data: 'mail <h1>test email</h1>\n\n',
        Charset: 'utf-8'
      },
      Text: {
        Data: 'test email\n',
        Charset: 'utf-8'
      }
    })
    t.end()
  })
})

test('to addresses', function (t) {
  var options = mail.format({to: ['one@example.com', 'two@example.com']})
  t.deepEqual(options.Destination, {
    ToAddresses: ['one@example.com', 'two@example.com'],
    CcAddresses: [],
    BccAddresses: []
  })
  t.end()
})

test('cc addresses', function (t) {
  var options = mail.format({cc: ['one@example.com', 'two@example.com']})
  var cc = options.Destination.CcAddresses
  t.deepEqual(cc, ['one@example.com', 'two@example.com'])
  t.end()
})

test('bcc addresses', function (t) {
  var options = mail.format({bcc: ['one@example.com', 'two@example.com']})
  var bcc = options.Destination.BccAddresses
  t.deepEqual(bcc, ['one@example.com', 'two@example.com'])
  t.end()
})

test('subject', function (t) {
  t.deepEqual(mail.format({subject: 'test subject'}).Message.Subject, {
    Data: 'test subject',
    Charset: 'utf-8'
  })
  t.end()
})

test('from', function (t) {
  process.env.SOURCE_EMAIL = 'source@example.com'
  t.is(mail.format({}).Source, 'source@example.com')
  t.end()
})
