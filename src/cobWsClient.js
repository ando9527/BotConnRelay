// @flow
import dotenv from 'dotenv'
import store from './store'
import { broadcastOrders } from './libs/broadcastOrders';
import { broadcastOrderBook } from './libs/broadcastOrderBook';
import logger from './helpers/logger';
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
    logger.info('[Websocket][Cobinhood][Close] WS close')
    if (data) logger.info(`[Websocket][Cobinhood][Close] ${JSON.stringify(data)}`)
    logger.info('[Websocket][Cobinhood] Force exit program')
    process.exit(1)
    
    connecting = false
    connected = false
  })

  client.on('message', async message => {
    try {
      onRawMessage(message)
    } catch (e) {
      logger.error(e)
    }


    
  })
  client.addEventListener('error', (err) =>{
    connecting = false
    connected = false
    logger.warn(`err instanceof Error:${(err instanceof Error).toString()}`)
    logger.record(`[Websocket][Cobinhood] Error event listener, err code: ${err.code}, err message: ${err.message}`)
  })
}

const onRawMessage=(rawMessage: string)=>{
  const { h: header, d: data } = JSON.parse(rawMessage)
  // [channel_id, version, type, request_id (optional)]
  const channelId = header[0]
  const type = header[2]
  if (type==="pong")return 
  logger.debug(`[Websocket][Cobinhood][Message] ${rawMessage}`)
  if (channelId==="order")return broadcastOrders(rawMessage)
  if (channelId.startsWith("order-book")===true)return broadcastOrderBook(rawMessage)

  if (type === 'error'){
    const errorMessage = header[4] 
    // {"h":["modify-order-undefined","2","error","4021","balance_locked"],"d":[]}
    if (errorMessage==="balance_locked") return logger.info('balance_locked');
    throw new Error(`[Websocket][Cobinhood]WS error:${rawMessage}`)
  }
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
