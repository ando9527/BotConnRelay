// @flow
import sentry from './sentry'
import winston from './winston'
import store from '../store'

class Logger {
  static error = (error: Error, addition: ?string = null) => {
    const info = store.getState()

    const extra = {
      store: info,
      addition,
    }
    winston.error(error.stack)
    winston.error(`Extra Info: ${JSON.stringify(extra)} `)
    sentry.captureException(error, { extra })
  }

  static info = (message: string) => {
    winston.info(message)
  }

  static warn = (message: string) => {
    winston.warn(message)
  }

  static debug = (message: string) => {
    winston.debug(message)
  }

  static record = (message: string,  addition: ?string = null) => {
    const info = store.getState()
    const extra = {
      store: info,
      addition,
    }
    winston.warn(`Extra Info: ${JSON.stringify(extra)} `)
    sentry.captureMessage(message, { extra })
  }
  static getSentry=()=>{
    return sentry
  }
}

const logger = Logger
export default logger
