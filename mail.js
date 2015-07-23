var async = require('async')
var aws = require('aws-sdk')
var ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1'
})

module.exports = exports = function (req, res, next) {

  req.mail = function (view, options, next) {
    async.parallel([
      renderHTML.bind(null, view, Object.create(options)),
      renderText.bind(null, view, Object.create(options))
    ], function (e, results) {
      if (e) return next(e)
      options.html = results[0]
      options.text = results[1]
      if (options.send === false) return next(null, format(options))
      ses.sendEmail(format(options), next)
    })
  }

  function renderText (view, options, next) {
    options.layout = false
    res.render(`${view}.text.ejs`, options, next)
  }

  function renderHTML (view, options, next) {
    options.layout = 'mail'
    res.render(`${view}.html.ejs`, options, next)
  }

  next()
}

var format = exports.format = function (options) {
  return {
    Destination: {
      ToAddresses: options.to,
      CcAddresses: options.cc || [],
      BccAddresses: options.bcc || []
    },
    Message: {
      Subject: {
        Data: options.subject,
        Charset: 'utf-8'
      },
      Body: {
        Html: {
          Data: options.html,
          Charset: 'utf-8'
        },
        Text: {
          Data: options.text,
          Charset: 'utf-8'
        }
      }
    },
    Source: process.env.SOURCE_EMAIL
  }
}
