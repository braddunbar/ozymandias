'use strict'

const {version} = require('./assets')
const Json = require('remora')
const React = require('react')
const ReactDOM = require('react-dom/server')
const toJSON = require('object-tojson')
const url = require('url')

module.exports = (request, response, next) => {
  response.react = (view, locals = {}) => {
    const json = new Json(Object.assign(response.locals, locals))
    const layout = request.app.get('layout.json')
    const location = url.parse(request.originalUrl)

    // Render some json!
    if (typeof layout === 'function') json.set(layout)
    if (typeof view === 'function') json.set(view)

    let state = Object.assign(json.result, {
      path: location.pathname,
      statusCode: response.statusCode,
      url: request.originalUrl,
      version: version
    })

    response.format({

      html: () => {
        state = toJSON(state)

        const component = request.component || request.app.get('component')
        const element = React.createElement(component, state)
        const html = ReactDOM.renderToString(element)

        response.render(() => `<div id='root'>${html}</div>`, {state})
      },

      json: () => response.json(state)

    })
  }
  next()
}
