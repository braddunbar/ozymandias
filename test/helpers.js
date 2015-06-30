var test = require('tape')
var helpers = require('../helpers')

test('locals.req === req', function (t) {
  var req = {}
  var res = {locals: {}}
  helpers(req, res, function () {
    t.is(res.locals.req, req)
    t.end()
  })
})
