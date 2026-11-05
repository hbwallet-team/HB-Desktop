import QueryString from 'query-string'
import Settings from '../../settings'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import { requestRetry, logDebugChatwork } from 'Utils/globalFunction'
import Observer from 'Utils/HBObserver'

export default class DappAPI {
  /**
   * getDappList
   * @param {*} pageNum
   * @param {*} numPage
   * @returns func fetchData
   */
  static async initUser (address, password) {
    let extention = 'user'
    const params = { address, password }
    return this.fetchDataWithAuth('POST', extention, params)
  }
  static async getDappList (pageNum, numPage) {
    let extention = 'dapps/web'
    const params = { pageNum, numPage }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  static async getSettingOther () {
    let extention = 'setting/others'
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  static async decodeInput (data, abi) {
    let extention = 'data-decoder/decode-input'
    const params = { data, abi }
    return this.fetchDataWithAuth('POST', extention, params)
  }
  static async getCompoundRate () {
    let extention = 'coin-exchange-rate'
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * getCommissionFee
   * @returns func fetchData
   */
  static async getCommissionFee () {
    let extention = 'commission-fee'
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  /**
   * fetchDataWithAuth with authentication
   * @param {*} queryStr
   * @param {*} method
   * @returns respon json
   */
  static async fetchDataWithAuth (method, extention, params) {
    const callAPI = new Promise(async (resolve, reject) => {
      let url = Settings.server.hbChatApi.url + extention
      if (method === 'GET' && params) {
        url = url + '?' + QueryString.stringify(params)
      }
      try {
        let opt = {
          method: method,
          headers: {
            'authorization': 'Bearer ',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
        if (params) {
          opt.body = params
        }
        let response = await requestRetry({
          url,
          opt
        })
        console.log('ChatAPI fetch data: ', url, response)
        resolve(response)
      } catch (error) {
        logDebugChatwork('ChatAPI fetch data error: ', error + '; router: ' + url)
        reject(error)
      }
    })

    // Close promise if over time
    const callTimeout = () => new Promise((resolve, reject) => setTimeout(reject, 60000, 'OVER_TIME'))

    return Promise.race([callAPI, callTimeout()]).then((result) => {
      return result
    }).catch((e) => {
      if (e === 'OVER_TIME') {
        Observer.emit(OBSERVER_KEY.SERVER_API_CRASH)
      }
      // return null
    })
  }
}
