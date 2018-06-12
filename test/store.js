import test from 'ava'
import store from '../src/store';
import { setSubMap, addSub, removeClient } from '../src/actions/sub ';
import logger from '../src/utils/winston';
test.serial('subReducer - setSubMap', async t => {
  const payload = {'123456': {symbolList:['eos']}}
  store.dispatch(setSubMap({payload}))
  const {sub} = store.getState()
  t.deepEqual(payload, sub)
})

test.serial('subReducer - addSub', async t => {
  store.dispatch(setSubMap({payload:{}}))
  const payload = {clientId:'123456', symbol:'eos'}
  store.dispatch(addSub({payload}))
  const {sub} = store.getState()
  t.deepEqual(sub, {'123456': {symbolList:['eos']}})
})

test.serial('subReducer - addSub2', async t => {
  store.dispatch(setSubMap({payload:{}}))
  store.dispatch(addSub({payload: {clientId:'123456', symbol:'eos'}}))
  const payload = {clientId:'123456', symbol:'ada'}
  store.dispatch(addSub({payload}))
  const {sub} = store.getState()
  t.deepEqual(sub, {'123456': {symbolList:['eos','ada']}})
})

test.serial('subReducer - addSub3', async t => {
  store.dispatch(setSubMap({payload:{}}))
  const payload1 = {clientId:'123456', symbol:'ada'}
  store.dispatch(addSub({payload: payload1}))
  const payload2 = {clientId:'1234fsd56', symbol:'eos'}
  store.dispatch(addSub({payload: payload2}))
  const payload3 = {clientId:'12345454556', symbol:'ada'}
  store.dispatch(addSub({payload: payload3}))
  const {sub} = store.getState()
  t.is(Object.keys(sub).length, 3)
})

test.serial('subReducer - removeClient', async t => {
  store.dispatch(setSubMap({payload:{}}))
  store.dispatch(addSub({payload:  {clientId:'123456', symbol:'eos'}}))
  store.dispatch(addSub({payload:{clientId:'1234567', symbol:'ada'}}))
  store.dispatch(removeClient({payload: {clientId:'123456'}}))
  const {sub} = store.getState()
  logger.info(JSON.stringify(sub))
  t.deepEqual({'1234567': {symbolList:['ada']}}, sub)
})