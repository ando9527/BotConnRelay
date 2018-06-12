export const SET_SUB_MAP = "SET_SUB_MAP"
export const ADD_SUB = "ADD_SUB"
export const REMOVE_SUB = "REMOVE_SUB"
export const REMOVE_CLIENT = "REMOVE_CLIENT"

export type SubMap = {[clientId:string]: {symbolList:Array<string>}}

export type SetSubMapAction ={
  type: typeof SET_SUB_MAP,
  payload: SubMap,
}

export type AddSubAction={
  type: typeof ADD_SUB,
  payload: {symbol: string, clientId:string }
}

export type RemoveClientAction={
  type: typeof REMOVE_CLIENT,
  payload: {clientId: string}
}


export type RemoveSubAction={
  type: typeof REMOVE_SUB,
  payload: {symbol: string, clientId: string}
}

export type AllSubActions= SetSubMapAction| AddSubAction | RemoveSubAction