// @flow
import dotenv from 'dotenv'
import store from './store'
import { haltProcess } from './utils/utils'
import logger from './utils/winston';
import { broadcastOrders } from './libs/broadcastOrders';
dotenv.load()
const WS = require('ws')
export let client = null
export let connected = false
let connecting = false



const connect = () => {
  if (connecting || connected) return
  connecting = true
  const wsURL = 'wss://ws.cobinhood.com/v2/ws'
  logger.info(`[Websocket][Cobinhood] WS connecting to ${wsURL}`)
  
  client = new WS(wsURL, [], {
    headers: {
      authorization: process.env.APP_API_SECRET,
      // "nonce": new Date()*1000000 ,
    },
  })
  // client = new WS(wsURL, [])

  client.on('open', function(data) {
    logger.info('[Websocket][Cobinhood] WS opened')
    connecting = false
    connected = true
    if (client===null) throw new Error('Client is null')


    


  })

  client.on('close', function(data) {
    logger.info('[Websocket][Cobinhood] WS close')
    if (data) logger.info(JSON.parse(data))
    connecting = false
    connected = false
  })

  client.on('message', async message => {
    const { h: header, d: data } = JSON.parse(message)
    // [channel_id, version, type, request_id (optional)]
    const channelId = header[0]
    const type = header[2]
    if (channelId==="order")return broadcastOrders(message)
    


    if (type === 'error'){
      const errorMessage = header[4] 
      // {"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}
      if (errorMessage==="balance_locked") return logger.info('balance_locked');
      await haltProcess(`WS error:${message}`)
    }
    
  })
  client.addEventListener('error', (err) =>{
    connecting = false
    connected = false
    logger.warn(`[Websocket][Cobinhood] Error event listener ${err.message}`)
  })
}

export const connectCobinhood = () => {
  setInterval(async () => {
    if (connected) return
    connect()
  }, 3500)

  /**
   * require ping every 20 sec or disconnection
   */
  setInterval(() => {
    if (!connected) return
    if (client===null) throw new Error('Client is null')
    client.send(
      JSON.stringify({
        action: 'ping',
      }),
    )
  }, 20000)
}
