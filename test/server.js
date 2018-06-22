import test from 'ava'
const WS = require('ws')
let client = null
let connected = false
let connecting = false
let message = null

test.beforeEach.cb(t => {
  if (connecting || connected) return
  connecting = true
  logger.info('WS connecting')
  client = new WS('ws://127.0.0.1:7000', [], {})

  client.on('open', function(data) {
    setTimeout(t.end)
    logger.info('WS opened')
    connecting = false
    connected = true
  })

  client.on('close', function(data) {
    logger.info('WS close')
    if (data) logger.info(JSON.parse(data))
    connecting = false
    connected = false
  })
  client.on('message', async data => {
    message = JSON.parse(data)
    
  })
})

test.serial('ping', async t => {
  message = null
  await new Promise(res => {
    const ping = {
      "action": "ping",
    }
    client.send(JSON.stringify(ping))
    setTimeout(() => {
      res()
    }, 100)
  })
  
  t.deepEqual(message, {h:["","1","pong"],d:[]})

  message = null
  await new Promise(res => {
    const add = {
      action: "subscribe",
      symbol: "eos"
    }
    client.send(JSON.stringify(add))
    setTimeout(() => {
      res()
    }, 100)
  })
  t.deepEqual(message, { h: ["eos", '1', 'subscribed'], d: [] })
})

