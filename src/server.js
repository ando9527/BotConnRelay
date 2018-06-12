// @flow
import {register} from 'babel-core'
import polyfill from 'babel-polyfill'
import express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'
import store from './store'
import { addSub, removeClient } from './actions/sub '
import { haltProcess } from './utils/utils';
import logger from './utils/winston';
import { connectCobinhood, client, connected} from './cobWsClient';


const app = express()
export const clientList: Map<string,any> = new Map()
//initialize a simple http server
const server = http.createServer(app)

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server })

export const getClientById=(id: string)=>{
  return clientList.get(id)
}




function noop() {}

function heartbeat() {
  this.isAlive = true;
}




wss.on('connection', (ws: WebSocket, req) => {
  const id = req.headers['sec-websocket-key']
  const source = req.headers['x-real-ip']||req.connection.remoteAddress
  clientList.set(id, ws)
  logger.info(`[Websocket][RelayServer][On Connection] Client socket opened, id: ${id}, source ip: ${source} `)
  logger.info(`[Websocket][RelayServer][On Connection] Clients number(clientList Map): ${clientList.size}`)

  // Avoid broken connection
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', (message: string) => {
    const { action, trading_pair_id: symbol, type} = JSON.parse(message)
    if (action!=='ping' || action!=="modify_order") logger.info(`[Websocket][RelayServer][On Message] Received: ${message}`)
    if (action==="modify_order") logger.debug(`[Websocket][RelayServer][On Message] Received: ${message}`)
    if (action === 'ping') return ws.send(JSON.stringify({ h: ['', '1', 'pong'], d: [] }))
    // Send message to cobinhood ws server
    if (client)client.send(message)

    if (action === 'subscribe' && type!=="order") {
      store.dispatch(addSub({ payload: { clientId: id, symbol } }))
      const subSize = Object.keys(store.getState().sub).length
      logger.info(`[Websocket][RelayServer][On Message] Client: (${id}) (${source}), subbed: ${message}`)
      logger.debug(`[Websocket][RelayServer][On Message] Subbed clients: ${subSize}`)
      return 
    }
  })


  ws.on('close', (data) => {
    if (data) logger.debug(`[Websocket][RelayServer][On Close] Message ${JSON.parse(data)}`)
    /**
     * Remove client socket from the store
     */
    clientList.delete(id)
    store.dispatch(removeClient({ payload: { clientId: id } }))
    logger.debug(`[Websocket][RelayServer][On Close] Client socket closed (${id}) (${source})`)
    logger.debug(`[Websocket][RelayServer][On Close] Clients number(clientList Map): ${clientList.size}`)
    const subSize = Object.keys(store.getState().sub).length
    logger.debug(`[Websocket][RelayServer][On Close] Subbed clients: ${subSize}`)
  })

  ws.addEventListener('error', (err) =>{
    /**
     * code 1006
     * Did not receive closed code from client, possible client closed unexpected. 
     */
    const allowList =['Invalid WebSocket frame: invalid status code 1006']
    if (allowList.includes(err.message)) return logger.warn(`[Error Listener] ${err.message}`)
    logger.error(`[Websocket][RelayServer][Error Listener] ${err.message}`)
    haltProcess(err)
  })
})




/**
 * Avoid broken connection
 */
setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);


connectCobinhood()

/**
 * Start server
 */

const interval = setInterval(()=>{
  if(connected===true){
    server.listen(process.env.APP_PORT || 7000, () => {
      logger.info(`[Websocket][RelayServer] Server started on port ${server.address().port}`)
      
    })
    clearInterval(interval)
  }
},1000)

