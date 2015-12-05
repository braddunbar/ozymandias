'use strict'

const test = require('tape')
const User = require('../user')
const hash = '$2a$04$GSyRKrbgj9PWCc.cHQsFJO3nSc0dz.JO..SZBIFBuyPTnquf3OswG'

test('authenticate a user', (t) => {
  const user = new User({password: hash})
  Promise.all([
    user.authenticate('secret').then((match) => t.ok(match)),
    user.authenticate('wrong').then((match) => t.ok(!match))
  ]).then(() => t.end()).catch(t.end)
})
