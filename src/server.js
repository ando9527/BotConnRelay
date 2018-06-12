import {register} from 'babel-core'
import polyfill from 'babel-polyfill'
import express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'
import store from './store'
import { addSub, removeClient } from './actions/sub '
import { run } from './agent';
import { haltProcess } from './utils/utils';
import logger from './utils/winston';



const app = express()
const clientList = new Map()
//initialize a simple http server
const server = http.createServer(app)

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server })

function getClientById(id) {
  return clientList.get(id)
}

const getPrice = (symbol) => {
  const {cgPrice} = store.getState()
  const ans = cgPrice.filter(cg=>cg.symbol===symbol)
  if (ans.length>0) return ans[0]
  return null
}

const broadCastPrice= () => {
  const {sub} = store.getState()
  for (let clientId of Object.keys(sub)){
    for (let symbol of sub[clientId].symbolList){
      const client = getClientById(clientId)
      const message = JSON.stringify({ h: ["price", '1', 'u'], d: getPrice(symbol) })
      client.send(message)
    }
  }
}

function noop() {}

function heartbeat() {
  this.isAlive = true;
}




wss.on('connection', (ws: WebSocket, req) => {
  const id = req.headers['sec-websocket-key']
  const source = req.headers['x-real-ip']||req.connection.remoteAddress
  clientList.set(id, ws)
  logger.info(`[On Connection] Client socket opened, id: ${id}, source ip: ${source} `)
  logger.info(`[On Connection] Clients number(clientList Map): ${clientList.size}`)

  // Avoid broken connection
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', (message: string) => {
    const { action, symbol } = JSON.parse(message)
    if (action!=='ping') logger.info(`[On Message] Received: ${message}`)
    if (action === 'ping') return ws.send(JSON.stringify({ h: ['', '1', 'pong'], d: [] }))
    
    if (action === 'subscribe') {
      store.dispatch(addSub({ payload: { clientId: id, symbol } }))
      ws.send(JSON.stringify({ h: [`price`, '1', 's'], d: getPrice(symbol) }))
      const subSize = Object.keys(store.getState().sub).length
      logger.info(`[On Message] Client: (${id}) (${source}), subbed: ${message}`)
      logger.debug(`[On Message] Subbed clients: ${subSize}`)
      return 
    }
  })


  ws.on('close', (data) => {
    if (data) logger.debug(`[On Close] Message ${JSON.parse(data)}`)
    /**
     * Remove client socket from the store
     */
    clientList.delete(id)
    store.dispatch(removeClient({ payload: { clientId: id } }))
    logger.debug(`[On Close] Client socket closed (${id}) (${source})`)
    logger.debug(`[On Close] Clients number(clientList Map): ${clientList.size}`)
    const subSize = Object.keys(store.getState().sub).length
    logger.debug(`[On Close] Subbed clients: ${subSize}`)
  })

  ws.addEventListener('error', (err) =>{
    /**
     * code 1006
     * Did not receive closed code from client, possible client closed unexpected. 
     */
    const allowList =['Invalid WebSocket frame: invalid status code 1006']
    if (allowList.includes(err.message)) return logger.warn(`[Error Listener] ${err.message}`)
    logger.error(`[Error Listener] ${err.message}`)
    haltProcess(err)
  })
})


/**
 * Start server
 */
server.listen(process.env.APP_PORT || 7000, () => {
  logger.info(`Server started on port ${server.address().port}`)
  
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


/**
 * Broadcast price of symbol
 */
setInterval(async()=>{
  try {
    broadCastPrice()
  } catch (error) {
    haltProcess(error)
  }
  
}, 10000)

run()
