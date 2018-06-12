// @flow
import type { SubMap, AllSubActions,  } from '../types/subMap'
import { SET_SUB_MAP, ADD_SUB, REMOVE_CLIENT } from '../types/subMap'

export const setSubMap = ({payload}: SubMap) => {
  return {type: SET_SUB_MAP, payload}
}

export const addSub = ({payload}: {payload: {symbol: string, clientId:string}}) => {
  return {type: ADD_SUB, payload}
}

export const removeClient=({payload}: {payload: {clientId: string}} )=>{
  return {type: REMOVE_CLIENT, payload}
}

