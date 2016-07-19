'use strict'

const assets = require('./assets')
const Json = require('remora')
const React = require('react')
const ReactDOM = require('react-dom/server')
const toJSON = require('object-tojson')
const url = require('url')

module.exports = (req, res, next) => {
  res.react = (view, locals = {}) => {
    const json = new Json(Object.assign(res.locals, locals))
    const location = url.parse(req.originalUrl)

    // Render some json!
    json.set(view)

    let state = Object.assign(json.result, {
      path: location.pathname,
      url: req.originalUrl,
      version: assets.version
    })

    res.format({

      json: () => res.json(state),

      html: () => {
        state = toJSON(state)

        const component = req.component || req.app.get('component')
        const element = React.createElement(component, state)
        const html = ReactDOM.renderToString(element)

        res.render('layout', {
          layout: false,
          state: state,
          content: `<div id='root'>${html}</div>`
        })
      }

    })
  }
  next()
}
