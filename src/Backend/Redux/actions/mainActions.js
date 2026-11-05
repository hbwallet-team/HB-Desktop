import key from '../lib/constants'

/**
 * NAME: MAIN ACTIONS
 * CREATOR: KHIEM
 *  Set actions for MAIN
 */

// SET DATA for Card Wallet
export function setInternet (internet) {
  return {
    type: key.SET_INTERNET,
    payload: internet
  }
}

export function setMnemonic (mnemonic) {
  return {
    type: key.SET_MNEMONIC,
    payload: mnemonic
  }
}

export function setWebsocket (webSocket) {
  return {
    type: key.SET_WEB_SOCKET,
    payload: webSocket
  }
}

export function setTimerSocket (timer) {
  return {
    type: key.SET_TIMER_SOCKET,
    payload: timer
  }
}
