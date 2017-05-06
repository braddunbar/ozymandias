'use strict'

const {Builder, By, until} = require('selenium-webdriver')
const driver = new Builder().forBrowser('chrome').build()

const listen = (app) => new Promise((resolve, reject) => {
  const server = app.listen()
  server.on('listening', () => resolve(server))
  server.on('error', reject)
})

// Have we visited a page since last deleting cookies?
let visited = false

class Browser {
  constructor (app) {
    this.app = app
  }

  server () {
    return this._server || (this._server = listen(this.app))
  }

  async clear () {
    if (visited) {
      visited = false
      await driver.manage().deleteAllCookies()
    }
  }

  async visit (path) {
    visited = true
    const {port} = (await this.server()).address()
    await driver.get(`http://localhost:${port}${path}`)
    await driver.executeScript('window.scrollTo(0, 0)')
  }

  async close () {
    if (this._server) (await this.server()).close()
  }

  quit () {
    driver.quit()
  }

  $ (selector) {
    return driver.findElement(By.css(selector))
  }

  wait (predicate) {
    return driver.wait(predicate, 5000)
  }

  assert (selector) {
    return this.wait(until.elementLocated(By.css(selector)))
  }

  refute (selector) {
    return this.wait(async () => {
      return !(await driver.findElements(By.css(selector))).length
    })
  }

  getPath () {
    return driver.executeScript('return window.location.pathname')
  }

  alert () {
    return driver.switchTo().alert()
  }

  async signIn (email) {
    await this.visit('/session/signin')
    await this.$('#email').sendKeys(email)
    await this.$('#password').sendKeys('secret')
    await this.$('#password').submit()
    await this.assert('#signout')
  }
}

module.exports = Browser
