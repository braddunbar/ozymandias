const {all} = require('koa-route')

module.exports = all('/admin/*', async (_, args, next) => {
  _.requireAdmin()
  await next()
})
