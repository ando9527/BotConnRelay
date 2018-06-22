import { assert } from 'chai'
import logger from './helpers/logger'
const WS = require('ws')

describe('WS Server', () => {
  let client = null
  let connected = false
  let connecting = false
  let message = null
  beforeEach(done => {
    if (connecting || connected) return
    connecting = true
    client = new WS('ws://127.0.0.1:7000', [], {})

    client.on('open', function(data) {
      logger.info('WS opened')
      connecting = false
      connected = true
      done()
    })
    client.on('close', function(data) {
      logger.info('WS close')
      if (data) logger.info(JSON.parse(data))
      connecting = false
      connected = false
    })
  })
  afterEach(done => {

    client.close()

    done()
  })

  it('ping', done => {
    client.once('message',  data => {
      const {h:header} = JSON.parse(data)
      assert.equal(header[2], 'pong')
      done()
    })
    assert.equal(connected, true)

    const ping = {
      action: 'ping',
    }

    client.send(JSON.stringify(ping))
  })
  it('sub', (done) => {
    client.on('message', data=>{
      // const {h:header} = JSON.parse(data)
      // assert.equal(header[2], 'pong')
      console.log(data);
      done()
    })
    const add = {
      action: 'subscribe',
      type: 'order-book',
      trading_pair_id: "EOS-ETH",
    }
    client.send(JSON.stringify(add))
  });
})

// test.serial('ping', async t => {
//   message = null
//   await new Promise(res => {

//     setTimeout(() => {
//       res()
//     }, 100)
//   })

//   t.deepEqual(message, {h:["","1","pong"],d:[]})

//   message = null
//   await new Promise(res => {
    // const add = {
    //   action: "subscribe",
    //   symbol: "eos"
    // }
//     client.send(JSON.stringify(add))
//     setTimeout(() => {
//       res()
//     }, 100)
//   })
//   t.deepEqual(message, { h: ["eos", '1', 'subscribed'], d: [] })
// })
