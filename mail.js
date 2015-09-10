var aws = require('aws-sdk')
var ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1'
})

module.exports = exports = function (req, res, next) {
  req.mail = function (view, options) {
    return Promise.all([
      render(view, 'html', Object.create(options)),
      render(view, 'text', Object.create(options))
    ]).then(function (results) {
      options.html = results[0]
      options.text = results[1]

      if (process.env.NODE_ENV === 'test' || options.send === false) {
        return format(options)
      }

      return new Promise(function (resolve, reject) {
        ses.sendEmail(format(options), function (e, result) {
          if (e) reject(e)
          else resolve(result)
        })
      })
    })
  }

  function render (view, format, options) {
    options.layout = format === 'html' ? 'mail' : false
    return new Promise(function (resolve, reject) {
      res.render(`${view}.${format}.ejs`, options, function (e, result) {
        if (e) reject(e)
        else resolve(result)
      })
    })
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
