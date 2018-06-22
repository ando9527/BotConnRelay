// @flow
const Raven = require('raven')
const git = require('git-rev-sync')
import store from '../store'
const dsn = process.env.SENTRY_DSN || 'https://28305aa4c4f0419db81e69aaee4d121d@sentry.io/1230804'
const sentry = Raven.config(process.env.NODE_ENV === 'production' && dsn, {
  release: git.long(),
}).install()

/**
 * logger.record('balanced not enough', {tags:{reject: 'balanced not enough'}})
 * logger.error(error, {extra: { foo: { bar: "baz" }}})
 * logger.error(error, {user:{name: 'Ando'}})
 */

export default sentry
