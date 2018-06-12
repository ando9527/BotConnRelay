// @flow

import { clientList, getClientById } from "../server";
import store from "../store";


export const broadcastOrderBook = (message:string) => {
  // message = {"h":["order-book.EOS-ETH.1E-7","2","subscribed"],"d":[]}
  const {h:header} = JSON.parse(message)
  const channelId = header[0]
  const dataSymbol = channelId.split(".")[1]

  const {sub} = store.getState()
  for (let i of Object.keys(sub)){
    const {symbolList} = sub[i]
    for (let symbol of symbolList){
      if (dataSymbol===symbol){
        const client = getClientById(i)
        if (!client) throw new Error(`Client ${i} not available, while broadcastOrderBook`)
        client.send(i)
      }
    }
  }
}
