// @flow
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'
import { routerMiddleware } from 'react-router-redux'
import rootReducer from '../reducers'

import { createHashHistory } from 'history'
import { connectRouter } from 'connected-react-router'
import createSagaMiddleWare from 'redux-saga'
// Root action saga
import rootSaga from '../actionSaga/rootSaga'
// Start history
const history = createHashHistory()

// Merge middlewares
const router = routerMiddleware(history)
const sagaMiddleWare = createSagaMiddleWare()

const middleWare = [sagaMiddleWare, thunkMiddleware, router]

if (process.env['NODE_ENV'] === 'development') {
  middleWare.push(logger)
}

const store = createStore(connectRouter(history)(rootReducer), applyMiddleware(...middleWare))

sagaMiddleWare.run(rootSaga)

export { store, history }
