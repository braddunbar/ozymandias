'use strict'

const test = require('./test')
const browserify = require('../browserify')

test('browserify a string', async ({assert}) => {
  assert.is(await browserify('console.log()'), '!function r(e,n,o){function t(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module \'"+i+"\'");throw a.code="MODULE_NOT_FOUND",a}var l=n[i]={exports:{}};e[i][0].call(l.exports,function(r){var n=e[i][1][r];return t(n||r)},l,l.exports,r,e,n,o)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<o.length;i++)t(o[i]);return t}({1:[function(r,e,n){console.log()},{}]},{},[1]);')
})
