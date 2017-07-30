import id from 'env:GA_ID'

const ga = window.ga = window.ga || function () {
  (ga.q = ga.q || []).push(arguments)
}
ga.l = +new Date()
ga('create', id, 'auto')
ga('send', 'pageview')
