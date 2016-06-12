'use strict'

const assets = require('./assets')
const qs = require('querystring')
const React = require('react')
const ReactDOM = require('react-dom/server')
const toJSON = require('object-tojson')
const url = require('url')

module.exports = (req, res, next) => {
  res._react = (view, locals) => {
    locals.layout = false

    res.render(view, locals, (e, state) => {
      if (e) return res.error(e)

      const location = url.parse(req.originalUrl)
      const params = qs.parse((location.search || '').slice(1))

      Object.assign(state, params, {
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
    })
  }
  next()
}
