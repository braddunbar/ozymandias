import React, {Children} from 'react'
import pathToRegexp from 'path-to-regexp'

export const Route = () => {}

const Router = ({children, state}) => {
  const findMatch = (route, prefix = '') => {
    let {children, Component, path} = route.props

    prefix = prefix + path

    if (!children && pathToRegexp(prefix).test(state.path)) {
      return <Component {...state} />
    }

    children = Children.toArray(children)

    for (let i = 0; i < children.length; i++) {
      const match = findMatch(children[i], prefix)
      if (match) return <Component {...state}>{match}</Component>
    }

    return null
  }

  children = Children.toArray(children)

  for (let i = 0; i < children.length; i++) {
    const match = findMatch(children[i])
    if (match) return match
  }

  return null
}

export default Router
