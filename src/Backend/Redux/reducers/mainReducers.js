import createReducer from '../lib/reducerConfig'
import key from '../lib/constants'
import init from '../lib/initState'

/**
 * NAME: GLOBAL REDUCERS
 * CREATOR: KHIEM
 *  Set reducers for GLOBAL DATA IN REDUX
 */

// SET REDUCER for internet
export const internetData = createReducer(init.internetInit, {
  [key.SET_INTERNET] (state, action) {
    return action.payload
  }
})

export const mnemonicData = createReducer(init.mnemonicInit, {
  [key.SET_MNEMONIC] (state, action) {
    return action.payload
  }
})

export const oldWebsocketData = createReducer(init.oldWebsocketInit, {
  [key.SET_WEB_SOCKET] (state, action) {
    return action.payload
  }
})

export const oldTimerSocketData = createReducer(init.oldTimerSocketInit, {
  [key.SET_TIMER_SOCKET] (state, action) {
    return action.payload
  }
})
