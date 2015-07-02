module.exports = function (req, res, next) {
  var render = res.render

  res.render = function (view, options, fn) {
    // Support callback function as second arg.
    if (typeof options === 'function') {
      fn = options
      options = {}
    }

    // Default options.
    if (!options) options = {}

    // Default callback.
    fn = fn || function (e, result) {
      if (e) return req.next(e)
      res.send(result)
    }

    // Render the view.
    render.call(res, view, options, function (e, result) {
      if (e) return req.next(e)

      // Provide the content to the layout.
      options.content = result

      // Render the layout.
      render.call(res, 'layout', options, fn)
    })
  }

  next()
}
