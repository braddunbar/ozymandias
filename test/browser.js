'use strict'

const test = require('./test')

const layout = (body) => `<!doctype html><meta charset='utf-8'>${body}`

test('assertSelector', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div id="foo"></div>') })

  await browser.visit('/')
  await browser.assertSelector('div#foo')
  try {
    await browser.assertSelector('span#bar')
    assert.fail()
  } catch (error) {}
})

test('refuteSelector', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div id="foo"></div>') })

  await browser.visit('/')
  await browser.refuteSelector('span#bar')
  try {
    await browser.refuteSelector('div#foo')
    assert.fail()
  } catch (error) {}
})

test('assertUrl', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('') })

  await browser.visit('/path?key=value')
  await browser.assertUrl('/path?key=value')
  try {
    await browser.assertUrl('/wrong')
    assert.fail()
  } catch (error) {}
})

test('url', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('') })

  await browser.visit('/path?key=value')
  assert.is(await browser.url(), '/path?key=value')
})

test('find', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div id="foo"></div>') })

  await browser.visit('/')
  await browser.find('#foo')
  try {
    await browser.find('#bar')
    assert.fail()
  } catch (error) {}
})

test('find by function', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div id="foo"></div>') })

  await browser.visit('/')
  await browser.find(() => document.querySelector('#foo'))
  await browser.find((selector) => document.querySelector(selector), '#foo')
  try {
    await browser.find(() => document.querySelector('#doesnotexist'))
    assert.fail()
  } catch (error) {}
})

test('assertSelector with text', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div>test</div>') })

  await browser.visit('/')
  await browser.assertSelector('body', {text: 'test'})
  try {
    await browser.assertSelector('body', {text: 'wrong'})
    assert.fail()
  } catch (error) {}
})

test('assertSelector with count', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div></div><div></div>') })

  await browser.visit('/')
  await browser.assertSelector('div', {count: 2})
  try {
    await browser.assertSelector('div', {count: 3})
    assert.fail()
  } catch (error) {}
})

test('assertSelector with text and count', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div>test</div><div>test</div><div></div>') })

  await browser.visit('/')
  await browser.assertSelector('div', {count: 2, text: 'test'})
  try {
    await browser.assertSelector('div', {count: 3, text: 'test'})
    assert.fail()
  } catch (error) {}
})

test('assertSelector with default count', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div>test</div><div>test</div>') })

  await browser.visit('/')
  await browser.assertSelector('div', {text: 'test'})
})

test('assertSelector with regex text', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div>testing</div>') })

  await browser.visit('/')
  await browser.assertSelector('div', {text: /test/})
  try {
    await browser.assertSelector('div', {text: /wrong/})
    assert.fail()
  } catch (error) {}
})

test('refuteSelector with text', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div>test</div>') })

  await browser.visit('/')
  await browser.refuteSelector('div', {text: 'wrong'})
  try {
    await browser.refuteSelector('div', {text: 'test'})
    assert.fail()
  } catch (error) {}
})

test('refuteSelector with regexp text', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div>testing</div>') })

  await browser.visit('/')
  await browser.refuteSelector('div', {text: /wrong/})
  try {
    await browser.refuteSelector('div', {text: /test/})
    assert.fail()
  } catch (error) {}
})

test('assertText', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div>test</div>') })

  await browser.visit('/')
  await browser.assertText('test')
  await browser.assertText(/test/)
  try {
    await browser.assertText('wrong')
    assert.fail()
  } catch (error) {}
  try {
    await browser.assertText(/wrong/)
    assert.fail()
  } catch (error) {}
})

test('refuteText', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout('<div>test</div>') })

  await browser.visit('/')
  await browser.refuteText('wrong')
  await browser.refuteText(/wrong/)
  try {
    await browser.refuteText('test')
    assert.fail()
  } catch (error) {}
  try {
    await browser.refuteText(/test/)
    assert.fail()
  } catch (error) {}
})

test('findButton by text', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout(`<button>test\`'"</button>`) })

  await browser.visit('/')
  await browser.findButton(`test\`'"`)
  try {
    await browser.findButton('does not exist')
    assert.fail()
  } catch (error) {}
})

test('findButton by id', async ({app, assert, browser}) => {
  app.use(async (_) => { _.body = layout(`<button id="id"></button>`) })

  await browser.visit('/')
  await browser.findButton('id')
})
