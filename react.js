'use strict'

const qs = require('querystring')
const url = require('url')
const toJSON = require('object-tojson')
const React = require('react')
const ReactDOM = require('react-dom/server')
const assets = require('./assets')

module.exports = (req, res, next) => {
  req.state = {}
  res.react = (state) => {
    const location = url.parse(req.originalUrl)
    const params = qs.parse((location.search || '').slice(1))

    state = toJSON(Object.assign(req.state, params, state, {
      currentUser: req.user,
      path: location.pathname,
      url: req.originalUrl,
      version: assets.version
    }))

    res.format({
      json: () => {
        res.json(state)
      },
      html: () => {
        const component = req.component || req.app.get('component')
        const element = React.createElement(component, state)
        res.render('layout', {
          layout: false,
          state: state,
          content: ReactDOM.renderToString(element)
        })
      }
    })
  }
  next()
}
