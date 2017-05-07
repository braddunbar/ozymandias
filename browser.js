'use strict'

const {Builder, By} = require('selenium-webdriver')
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

  find (selector) {
    return driver.findElement(By.css(selector))
  }

  all (selector) {
    return driver.findElements(By.css(selector))
  }

  wait (predicate) {
    return driver.wait(predicate, +(process.env.WAIT || 5000))
  }

  assertSelector (selector, {count, text} = {}) {
    return this.wait(async () => {
      const elements = (await this.all(selector))
      for (const element of elements) {
        if (typeof text === 'string' && (await element.getText()) !== text) {
          continue
        }

        if (text instanceof RegExp && !text.test(await element.getText())) {
          continue
        }

        // If we're not counting, just bail.
        if (count == null) return true

        --count
      }
      return count === 0
    })
  }

  refuteSelector (selector) {
    return this.wait(async () => (
      !(await this.all(selector)).length
    ))
  }

  assertUrl (url) {
    return this.wait(async () => (await this.url()) === url)
  }

  url () {
    return driver.executeScript('return location.pathname + location.search')
  }

  alert () {
    return driver.switchTo().alert()
  }

  async signIn (email) {
    await this.visit('/session/signin')
    await this.find('#email').sendKeys(email)
    await this.find('#password').sendKeys('secret')
    await this.find('#password').submit()
    await this.assertSelector('#signout')
  }
}

module.exports = Browser
