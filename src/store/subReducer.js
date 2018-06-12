// @flow
import type { SubMap, AllSubActions } from '../types/subMap'
import { SET_SUB_MAP, ADD_SUB, REMOVE_CLIENT } from '../types/subMap'

const subReducer = (state: SubMap = {}, action: AllSubActions) => {
  switch (action.type) {
    case SET_SUB_MAP: {
      return action.payload
    }
    case ADD_SUB: {
      const { symbol, clientId } = action.payload
      if (clientId in state === false)
        return Object.assign({}, state, { [clientId]: { symbolList: [symbol] } })

      const { symbolList } = state[clientId]
      if (symbolList.includes(symbol) === false)
        return Object.assign({}, state, { [clientId]: { symbolList: [...symbolList, symbol] } })
      return state
    }

    case REMOVE_CLIENT: {
      const { clientId } = action.payload
      delete state[clientId]
      return state
    }
    default:
      return state
  }
}

export default subReducer
