import store from '../../Server/Datas'
import { KEYSTORE, DEFAULT_CARD_URLS } from 'Utils/globalConstants'
import { DecodeData } from 'Utils/globalFunction'
import Settings from 'Backend/settings'
import EthplorerService from 'Backend/Api/services/Ethplorer'

export default function createReducer (initialState, handlers) {
  return function reducer (state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

export const checkStore = (data, KEY_STORE_DATA) => {
  store.set(KEY_STORE_DATA, data)
}

export const checkLocalStoreToRedux = async (storeRedux, keyStoreNew, action, initData) => {
  return new Promise(async (resolve, reject) => {
    const data = store.get(keyStoreNew)
    if (data) {
      if (keyStoreNew === KEYSTORE.CARD_DATA) {
        if (data.length > 0) {
          data.forEach(c => {
            c.mnemonic = DecodeData(c.mnemonic, Settings.secretKey)
            c.privateKey = DecodeData(c.privateKey, Settings.secretKey)
          })
        }
        storeRedux.dispatch(action(data))
        return resolve()
      } else if (keyStoreNew === KEYSTORE.PINCODE) {
        let pinCode = DecodeData(data, Settings.secretKey)
        storeRedux.dispatch(action(pinCode))
        return resolve()
      } else {
        typeof (initData) === 'string'
          ? data !== initData && storeRedux.dispatch(action(data))
          : typeof (initData) === 'boolean'
            ? storeRedux.dispatch(action(data))
            : typeof (initData) === 'number'
              ? storeRedux.dispatch(action(data))
              : storeRedux.dispatch(action(data))
        return resolve()
      }
    } else {
      storeRedux.dispatch(action(initData))
      return resolve()
    }
  })
}
