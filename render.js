'use strict'

module.exports = (request, response, next) => {
  const render = response.render.bind(response)

  // Render a function.
  response.render = (...args) => {
    const [view, options] = args

    // Call through unless the view is a function.
    if (typeof view !== 'function') return render(...args)

    const {app} = request
    const layout = app.get('layout')
    const locals = Object.assign({}, app.locals, response.locals, options)
    let body = view(locals)

    // Layout?
    if (typeof layout === 'function') body = layout(locals, body)

    response.send(body)
  }

  next()
}
