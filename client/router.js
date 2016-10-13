import React, {Children, PureComponent, PropTypes} from 'react'

const optionalParam = /\((.*?)\)/g
const namedParam = /(\(\?)?:\w+/g
const splatParam = /\*\w+/g
const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g

const toRegExp = (path) => {
  return new RegExp('^' + path
    .replace(escapeRegExp, '\\$&')
    .replace(optionalParam, '(?:$1)?')
    .replace(namedParam, (match, optional) => optional ? match : '([^/?]+)')
    .replace(splatParam, '([^/]*?)') + '$')
}

export class Route extends PureComponent { }

export default class Router extends PureComponent {

  static propTypes () {
    return {
      state: PropTypes.object,
      children: PropTypes.object
    }
  }

  match (route, prefix = '') {
    const {state} = this.props
    const {Component, path} = route.props
    const children = Children.toArray(route.props.children)
    prefix = prefix + path

    if (children.length) {
      for (let i = 0; i < children.length; i++) {
        const match = this.match(children[i], prefix)
        if (match) return <Component {...state}>{match}</Component>
      }
      return null
    }

    if (toRegExp(prefix).test(state.path)) {
      return <Component {...state} />
    }

    return null
  }

  render () {
    const children = Children.toArray(this.props.children)

    for (let i = 0; i < children.length; i++) {
      const match = this.match(children[i])
      if (match) return match
    }

    return null
  }
}
