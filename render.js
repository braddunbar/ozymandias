'use strict'

module.exports = (req, res, next) => {
  const render = res.render.bind(res)

  // Render a function.
  res.render = (...args) => {
    const [view, options] = args

    // Call through unless the view is a function.
    if (typeof view !== 'function') return render(...args)

    const {app} = req
    const layout = app.get('layout')
    const locals = Object.assign({}, app.locals, res.locals, options)
    let body = view(locals)

    // Layout?
    if (typeof layout === 'function') body = layout(locals, body)

    res.send(body)
  }

  next()
}
