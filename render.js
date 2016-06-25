'use strict'

module.exports = (req, res, next) => {
  const render = res.render

  // Render a function.
  res.render = (...args) => {
    const [view, options] = args

    // Call through unless the view is a function.
    if (typeof view !== 'function') {
      return render.call(res, ...args)
    }

    const {app} = req
    const layout = app.get('layout')
    const locals = Object.assign({}, app.locals, res.locals, options)
    let body = view(locals)

    // Layout?
    if (typeof layout === 'function') body = layout(body, locals)
    res.send(body)
  }

  next()
}
