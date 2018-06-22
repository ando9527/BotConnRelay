import {assert} from 'chai'
import store from './index';
import { setSubMap, addSub, removeClient } from '../actions/sub ';

describe('subReducer', () => {
  it('setSubMap', () => {
    const payload = {'123456': {symbolList:['eos']}}
    store.dispatch(setSubMap({payload}))
    const {sub} = store.getState()
    assert.equal(payload, sub)
  });
  it('addSub', () => {
    store.dispatch(setSubMap({payload:{}}))
    const payload = {clientId:'123456', symbol:'eos'}
    store.dispatch(addSub({payload}))
    const {sub} = store.getState()
    assert.deepEqual(sub, {'123456': {symbolList:['eos']}})
  });
  it('addSub2', () => {
      store.dispatch(setSubMap({payload:{}}))
  store.dispatch(addSub({payload: {clientId:'123456', symbol:'eos'}}))
  const payload = {clientId:'123456', symbol:'ada'}
  store.dispatch(addSub({payload}))
  const {sub} = store.getState()
  assert.deepEqual(sub, {'123456': {symbolList:['eos','ada']}})
  });
  it('addSub3', () => {
    store.dispatch(setSubMap({payload:{}}))
    const payload1 = {clientId:'123456', symbol:'ada'}
    store.dispatch(addSub({payload: payload1}))
    const payload2 = {clientId:'1234fsd56', symbol:'eos'}
    store.dispatch(addSub({payload: payload2}))
    const payload3 = {clientId:'12345454556', symbol:'ada'}
    store.dispatch(addSub({payload: payload3}))
    const {sub} = store.getState()
    assert.equal(Object.keys(sub).length, 3)
  });
  it('removeClient', () => {
    store.dispatch(setSubMap({payload:{}}))
    store.dispatch(addSub({payload:  {clientId:'123456', symbol:'eos'}}))
    store.dispatch(addSub({payload:{clientId:'1234567', symbol:'ada'}}))
    store.dispatch(removeClient({payload: {clientId:'123456'}}))
    const {sub} = store.getState()
    assert.deepEqual({'1234567': {symbolList:['ada']}}, sub)
  });
});






