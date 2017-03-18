'use strict'

const aws = require('aws-sdk')
const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1'
})

module.exports = {

  async mail (mail, state) {
    state = Object.assign({}, this.state, state)

    const options = {
      Destination: {
        ToAddresses: state.to,
        CcAddresses: state.cc || [],
        BccAddresses: state.bcc || []
      },
      Message: {
        Subject: {Data: state.subject, Charset: 'utf-8'},
        Body: {
          Html: {Data: mail.html(state), Charset: 'utf-8'},
          Text: {Data: mail.text(state), Charset: 'utf-8'}
        }
      },
      Source: process.env.SOURCE_EMAIL
    }

    if (this.app.env === 'test') return options

    return ses.sendEmail(options).promise()
  }

}
