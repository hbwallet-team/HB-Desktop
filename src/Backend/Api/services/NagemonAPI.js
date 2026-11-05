import QueryString from 'query-string'
import Settings from 'Backend/settings'
import store from '../../Server/Datas'
import { requestRetry, logDebugChatwork } from 'Utils/globalFunction'
import { NUM_PAGE_NFT, NUM_ORDER_HISTORY_NFT, KEYSTORE, OBSERVER_KEY } from 'Utils/globalConstants'
import Observer from 'Utils/HBObserver'

export default class NagemonAPI {
  /**
   * getInventoryByAddress
   * @param {*} address
   * @returns func fetchData
   */
  static async getInventoryByAddress (address, gameSymbol, self, pageNum = 1) {
    let extention = `inventory/${address}/list-inventory`
    const params = { gameSymbol, self, pageNum, numPage: NUM_PAGE_NFT }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * getInventoryIdByAddress
   * @param {*} address
   * @returns func fetchData
   */
  static async getInventoryIdByAddress (address) {
    let extention = `inventory/${address}`
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * getInventoryDetail
   * @param {*} address
   * @param {*} id
   * @param {*} owner
   * @returns func fetchData
   */
  static async getInventoryDetail (address, id, owner) {
    let extention = `inventory/${address}/${id}`
    const params = { owner }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * getGameCategories
   * @returns func fetchData
   */
  static async getGameCategories () {
    let extention = 'setting/games-list'
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * getTotalSync
   * @param {*} address
   * @returns func fetchData
   */
  static async getTotalSync (address) {
    let extention = `erc721/total-sync/${address}`
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * getOrderHistory
   * @param {*} address
   * @returns func fetchData
   */
  static async getOrderHistory (address, pageNum = 1, numPage = NUM_ORDER_HISTORY_NFT) {
    let extention = `erc721/order-history/${address}`
    const params = { pageNum, numPage }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * getSaleGameItem
   * @param {*} symbol
   * @param {*} pageNum
   * @param {*} sort
   * @param {*} direction
   * @returns func fetchData
   */
  static async getSaleGameItem (key, symbol, pageNum, sort = 'createdAt', direction = 'desc') {
    let extention = 'erc721/price'
    let params = { symbol, pageNum, numPage: NUM_PAGE_NFT, sort, direction }
    if (key.toString().length > 0) {
      params = Object.assign({ key }, params)
    }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * getSaleGameItemV2
   * @param {*} symbol
   * @param {*} pageNum
   * @param {*} sort
   * @param {*} direction
   * @returns func fetchData
   */
  static async getSaleGameItemV2 (key, symbol, pageNum, sort = 'createdAt', direction = 'desc') {
    let extention = 'erc721/price/v2'
    let params = { symbol, pageNum, numPage: NUM_PAGE_NFT, sort, direction }
    if (key.toString().length > 0) {
      params = Object.assign({ key }, params)
    }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * checkGameItemInStore
   * @param {*} address
   * @param {*} id
   * @returns func fetchData
   */
  static async checkGameItemInStore (address, id) {
    let extention = 'erc721/check-item'
    const params = { address, id }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * get Setting
   * @returns func fetchData
   */
  static async getSetting () {
    let extention = 'setting'
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getAirdropVersion2 () {
    let extention = `airdrops?version2=true`
    return this.fetchDataWithAuth('GET', extention)
  }

  static async getAirdrop () {
    let extention = `airdrops`
    return this.fetchDataWithAuth('GET', extention)
  }

  static async getContractSetting () {
    let extention = `setting/contracts`
    return this.fetchDataWithAuth('GET', extention)
  }

  /**
   * get History By Address
   * @returns func fetchData
   */
  static async getHistoryByAddress (userAddress, pageNum, numPage = 20) {
    let extention = `fossil-airdrop/address/${userAddress}/v2`
    const params = { 
      pageNum,
      numPage
    }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getGachaHistorySub (userAddress, contractAddress, pageNum, airdropId, numPage = 20) {
    let extention = `airdrop/contract/${contractAddress}`
    const params = { 
      userAddress,
      pageNum,
      numPage,
      airdropId
    }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  /**
   * get History By Hash
   * @returns func fetchData
   */
  static async getHistoryByHash (hash) {
    let extention = `fossil-airdrop/${hash}`
    return this.fetchDataWithAuth('GET', extention)
  }

  static async getRewardAirdropSub (hash) {
    let extention = `airdrop/${hash}`
    return this.fetchDataWithAuth('GET', extention)
  }

  /**
   * put History By Hash
   * @returns func fetchData
   */
  static async putHistoryByHash (hash, isClicked) {
    let extention = `/fossil-airdrop/hash/${hash}`
    const params = { isClicked }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async putHistoryByHashSub (hash, isClicked) {
    let extention = `/airdrop/hash/${hash}`
    const params = { isClicked }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  /**
   * get List Winner
   * @returns func fetchData
   */
  static async getListWinner () {
    let extention = `fossil-airdrop/winners`
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  static async getListWinnerSub (address, airdropId) {
    let extention = `airdrop/winner/${address}`
    const params = { airdropId }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getDappList (pageNum, numPage, sortBy = 'genrePosition', direction = 'asc') {
    let extention = 'dapps/web'
    const params = { pageNum, numPage, sortBy, direction }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  
  /**
   * fetchGet
   * fetchDataWithAuth with authentication
   * @param {*} queryStr
   * @param {*} method
   * @returns respon json
   */
  static async fetchDataWithAuth (method, extention, params) {
    const callAPI = new Promise(async (resolve, reject) => {
      const auth = await store.get(KEYSTORE.USER_AUTH)
      let url = Settings.server.nagemonApi.url + extention
      if (method === 'GET' && params) {
        url = url + '?' + QueryString.stringify(params)
      }
      try {
        let opt = {
          method: method,
          headers: {
            'authorization': auth ? 'Bearer ' + auth.token : '',
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
        console.log('NagemonAPI fetch data: ', url, response)
        resolve(response)
      } catch (error) {
        logDebugChatwork('NagemonAPI fetch data error: ', error + '; router: ' + url)
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
