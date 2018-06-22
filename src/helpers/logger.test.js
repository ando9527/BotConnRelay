require('dotenv').load()
import logger from './logger'
console.log(`NODE_ENV ${process.env.NODE_ENV}`)
console.log(`SENTRY_DSN ${process.env.SENTRY_DSN}`)
describe('sentry', () => {
  it('Capture error', done => {
    logger.getSentry().on('logged', function() {
      console.log('Yay, it worked!')
      done()
    })
    try {
      throw new Error('!!!unit test error!')
    } catch (error) {
      logger.error(error)
    }
  })
  it('Capture message', (done) => {
    logger.getSentry().on('logged', function (e) {
      // The event contains information about the failure:
      //   e.reason -- raw response body
      //   e.statusCode -- response status code
      //   e.response -- raw http response object
      
      done()
    });
    logger.record('testtttt')
  });
})

// it('Capture message', (done) => {
//   logger.getSentry().on('error', function (e) {
//     // The event contains information about the failure:
//     //   e.reason -- raw response body
//     //   e.statusCode -- response status code
//     //   e.response -- raw http response object
//     console.log(e);
    
//     console.log('uh oh, couldnt record the event');
//     done()
//   });
//   logger.record('testtttt')
// });