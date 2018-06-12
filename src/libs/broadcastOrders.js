import { clientList } from "../server";

// @flow

export const broadcastOrders = (message: string) => {
  // {"h":["order","2","u","0"],"d":["ac67bfbe-e7c8-4c9e-bcbe-560dc38758bd","1528665324205","","TRX-ETH","open","modified","bid","0.0000787","0","4400","0"]}
  for(let client of clientList.values()){
    client.send(message)
  }
}
