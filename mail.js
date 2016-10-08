'use strict'

const aws = require('aws-sdk')
const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1'
})

module.exports = (request, response, next) => {
  request.mail = (mail, locals) => {
    locals = Object.assign({}, request.app.locals, response.locals, locals)
    const options = {
      Destination: {
        ToAddresses: locals.to,
        CcAddresses: locals.cc || [],
        BccAddresses: locals.bcc || []
      },
      Message: {
        Subject: {
          Data: locals.subject,
          Charset: 'utf-8'
        },
        Body: {
          Html: {
            Data: mail.html(locals),
            Charset: 'utf-8'
          },
          Text: {
            Data: mail.text(locals),
            Charset: 'utf-8'
          }
        }
      },
      Source: process.env.SOURCE_EMAIL
    }

    if (process.env.NODE_ENV === 'test' || locals.send === false) {
      return options
    }

    return new Promise((resolve, reject) => {
      ses.sendEmail(options, (error, result) => (
        error ? reject(error) : resolve(result)
      ))
    })
  }
  next()
}
