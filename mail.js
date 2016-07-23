'use strict'

const aws = require('aws-sdk')
const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1'
})

module.exports = (req, res, next) => {
  req.mail = (mail, locals) => {
    locals = Object.assign({}, req.app.locals, res.locals, locals)
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

    return new Promise(function (resolve, reject) {
      ses.sendEmail(options, (e, result) => (
        e ? reject(e) : resolve(result)
      ))
    })
  }
  next()
}
