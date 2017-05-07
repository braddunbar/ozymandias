'use strict'

const test = require('./test')

const layout = async (_, next) => {
  await next()
  _.body = `
    <!doctype html>
    <html>
    <head>
      <meta charset='utf-8'>
      <title>Browser Testing</title>
    </head>
    <body>
    ${_.body}
    </body>
    </html>`
}

test('assertSelector', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '<div id="foo"></div>' })

  await browser.visit('/')
  await browser.assertSelector('div#foo')
  try {
    await browser.assertSelector('span#bar')
    assert.fail()
  } catch (error) {}
})

test('refuteSelector', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '<div id="foo"></div>' })

  await browser.visit('/')
  await browser.refuteSelector('span#bar')
  try {
    await browser.refuteSelector('div#foo')
    assert.fail()
  } catch (error) {}
})

test('assertUrl', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '' })

  await browser.visit('/path?key=value')
  await browser.assertUrl('/path?key=value')
  try {
    await browser.assertUrl('/wrong')
    assert.fail()
  } catch (error) {}
})

test('url', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '' })

  await browser.visit('/path?key=value')
  assert.is(await browser.url(), '/path?key=value')
})

test('find', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '<div id="foo"></div>' })

  await browser.visit('/')
  await browser.find('#foo')
  try {
    await browser.find('#bar')
    assert.fail()
  } catch (error) {}
})

test('assertSelector with text', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '<div>test</div>' })

  await browser.visit('/')
  await browser.assertSelector('body', {text: 'test'})
  try {
    await browser.assertSelector('body', {text: 'wrong'})
    assert.fail()
  } catch (error) {}
})

test('assertSelector with count', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '<div></div><div></div>' })

  await browser.visit('/')
  await browser.assertSelector('div', {count: 2})
  try {
    await browser.assertSelector('div', {count: 3})
    assert.fail()
  } catch (error) {}
})

test('assertSelector with text and count', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '<div>test</div><div>test</div><div></div>' })

  await browser.visit('/')
  await browser.assertSelector('div', {count: 2, text: 'test'})
  try {
    await browser.assertSelector('div', {count: 3, text: 'test'})
    assert.fail()
  } catch (error) {}
})

test('assertSelector with default count', async ({app, assert, browser}) => {
  app.use(layout)
  app.use(async (_) => { _.body = '<div>test</div><div>test</div>' })

  await browser.visit('/')
  await browser.assertSelector('div', {text: 'test'})
})
