'use strict'

const test = require('./test')
const request = require('supertest')

test('send mail', (t) => {
  const app = require('../')()

  app.get('/', (request, response) => {
    const mail = request.mail({html: () => '<h1>test</h1>', text: () => 'test'}, {
      send: false,
      to: ['to@example.com'],
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      subject: 'test email'
    })

    t.deepEqual(mail, {
      Destination: {
        ToAddresses: ['to@example.com'],
        CcAddresses: ['cc@example.com'],
        BccAddresses: ['bcc@example.com']
      },
      Message: {
        Subject: {
          Data: 'test email',
          Charset: 'utf-8'
        },
        Body: {
          Html: {
            Data: '<h1>test</h1>',
            Charset: 'utf-8'
          },
          Text: {
            Data: 'test',
            Charset: 'utf-8'
          }
        }
      },
      Source: 'source@example.com'
    })

    response.end()
  })

  app.use((error, request, response, next) => t.end(error))

  request(app)
  .get('/')
  .expect(200)
  .end(t.end)
})
