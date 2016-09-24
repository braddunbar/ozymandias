'use strict'

const {html} = require('../html')

exports.html = ({url}) => html`
<p>
  We received a request to reset your password. If you did not request a
  password reset, please ignore this message.
</p>
<a href='${url}'>Reset Your Password</a>
`

exports.text = ({url}) => `
We received a request to reset your password. If you did not request a password
reset, please ignore this message.

${url}
`
