'use strict'

const cluster = require('cluster')
const {PORT, WEB_CONCURRENCY} = process.env

module.exports = (app) => {
  if (!cluster.isMaster) {
    app.listen(PORT)
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
