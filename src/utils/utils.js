import { BigNumber } from 'bignumber.js'
import logger from './winston';

export const plus = (a, b) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .plus(y)
    .decimalPlaces(10)
    .toNumber()
}

export const minus = (a, b) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .minus(y)
    .decimalPlaces(10)
    .toNumber()
}

export const multi = (a, b) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .multipliedBy(y)
    .decimalPlaces(10)
    .toNumber()
}

export const div = (a, b) => {
  const x = new BigNumber(parseFloat(a).toFixed(10))
  const y = new BigNumber(parseFloat(b).toFixed(10))
  return x
    .dividedBy(y)
    .decimalPlaces(10)
    .toNumber()
}
export const haltProcess=(error)=>{
  logger.error(error);
  process.exit(1)
}