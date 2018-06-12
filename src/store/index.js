import { createStore, combineReducers,applyMiddleware  } from 'redux'
import thunk from 'redux-thunk';
import subReducer from './subReducer';
const rootReducer = combineReducers({
    sub: subReducer,
  });
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);
export default store