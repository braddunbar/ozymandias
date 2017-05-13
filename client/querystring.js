import qs from 'querystring'
import assign from 'object-assign'

export const set = (url, values) => {
  const [path, search] = url.split('?')
  values = assign(qs.parse(search), values)
  Object.keys(values).forEach((key) => {
    const value = values[key]
    if (!value || (Array.isArray(value) && !value.length)) delete values[key]
  })
  const result = qs.stringify(values)
  return result ? path + '?' + result : path
}
