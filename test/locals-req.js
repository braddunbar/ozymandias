var test = require('tape')
var localsReq = require('../mid/locals-req')

test('locals.req === req', function (t) {
  var req = {}
  var res = {locals: {}}
  localsReq(req, res, function () {
    t.is(res.locals.req, req)
    t.end()
  })
})
