'use strict'

const bugsnag = require('bugsnag')
const cluster = require('cluster')
const {PORT, WEB_CONCURRENCY} = process.env

module.exports = function () {
  if (this.env === 'production') bugsnag.register(process.env.BUGSNAG_KEY)

  if (!cluster.isMaster) {
    this.listen(PORT)
    console.log(`Worker ${process.pid} listening on port ${PORT}.`)
    return
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited with code ${code}. Restarting…`)
    cluster.fork()
  })

  const workers = +WEB_CONCURRENCY || 1
  for (let i = 0; i < workers; i++) cluster.fork()
}
