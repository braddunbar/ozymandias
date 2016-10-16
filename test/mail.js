'use strict'

const test = require('./test')

test('send mail', function *(t, {app, client}) {
  app.use(function *() {
    const options = yield this.mail({
      html: () => '<h1>test</h1>',
      text: () => 'test'
    }, {
      to: ['to@example.com'],
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      subject: 'test email'
    })

    t.deepEqual(options, {
      Destination: {
        ToAddresses: ['to@example.com'],
        CcAddresses: ['cc@example.com'],
        BccAddresses: ['bcc@example.com']
      },
      Message: {
        Subject: {Data: 'test email', Charset: 'utf-8'},
        Body: {
          Html: {Data: '<h1>test</h1>', Charset: 'utf-8'},
          Text: {Data: 'test', Charset: 'utf-8'}
        }
      },
      Source: 'source@example.com'
    })

    this.status = 200
  })

  const response = yield client.get('/').send()
  response.expect(200)
  t.end()
})
