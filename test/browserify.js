'use strict'

const test = require('./test')
const browserify = require('../browserify')

test('browserify a string', async ({assert}) => {
  assert.is(await browserify('console.log()'), '!function(){return function r(n,e,o){function t(i,f){if(!e[i]){if(!n[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module \'"+i+"\'");throw a.code="MODULE_NOT_FOUND",a}var l=e[i]={exports:{}};n[i][0].call(l.exports,function(r){var e=n[i][1][r];return t(e||r)},l,l.exports,r,n,e,o)}return e[i].exports}for(var u="function"==typeof require&&require,i=0;i<o.length;i++)t(o[i]);return t}}()({1:[function(r,n,e){console.log()},{}]},{},[1]);')
})
