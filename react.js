'use strict'

const {version} = require('./assets')
const React = require('react')
const ReactDOM = require('react-dom/server')
const toJSON = require('object-tojson')
const {URL} = require('url')

module.exports = {

  react (state) {
    const url = new URL(this.originalUrl, this.origin)

    Object.assign(this.state.client, state, {
      path: url.pathname,
      section: this.section,
      sections: this.sections,
      statusCode: this.response._explicitStatus ? this.status : 200,
      url,
      version
    })

    switch (this.accepts('html', 'json')) {
      case 'html':
        // Make sure the client/server state match.
        this.state.client = toJSON(this.state.client)

        const Component = this.client || (() => null)
        const element = React.createElement(Component, this.state.client)
        const html = ReactDOM.renderToString(element)

        this.body = `<div id='root'>${html}</div>`
        break

      case 'json':
        this.body = this.state.client
        break
    }
  }

}
