import QueryString from 'query-string'
import Settings from '../../settings'
import store from '../../Server/Datas'
import { KEYSTORE, OBSERVER_KEY } from 'Utils/globalConstants'
import { requestRetry, logDebugChatwork } from 'Utils/globalFunction'
import Observer from 'Utils/HBObserver'
const NUMBER_COIN_PER_PAGE = 300
export default class DexAPI {
  /**
   * getOrderList
   * @param {*} makerToken
   * @param {*} takerToken
   * @param {*} address // main account address
   * @returns func fetchData
   */
  static async getOrderList (makerToken, takerToken, address) {
    let extention = 'order-list'
    const params = { makerToken, takerToken, address }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  static async setRate (makerToken, takerToken, rate, address) {
    let extention = 'rate'
    const params = { makerToken, takerToken, rate, address }
    return this.fetchDataWithAuth('POST', extention, params)
  }
  static async setFavorite (makerToken, takerToken, status, address) {
    let extention = 'favorite'
    const params = { makerToken, takerToken, status, address }
    return this.fetchDataWithAuth('POST', extention, params)
  }
  static async rateAverageAndFavorite (makerToken, takerToken, address) {
    let extention = 'rate/favorite'
    const params = { makerToken, takerToken, address }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  static async getFavoriteTokens (address) {
    let extention = `favorites/${address}`
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }
  static async postFavoriteTokens (ids, address) {
    let extention = 'favorite/swap'
    const params = { ids, address }
    return this.fetchDataWithAuth('POST', extention, params)
  }
  static async getOrderById (orderHash) {
    let extention = `order/${orderHash}`
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  /**
   * initilize user authentication
   */
  static async initAuth (address, password) {
    let extention = 'user'
    const params = { address, password }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async updateAuth (address, isConfirmDex) {
    let extention = 'user'
    const params = { address, isConfirmDex }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async getUserInfo (address) {
    let extention = 'user/' + address
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  /**
   * getExchangeTokens
   */
  static async getExchangeTokens (isAdmin = false) {
    let extention = 'token-list'
    const params = { isAdmin }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  /**
   * insert a token
   */
  static async insertToken (data) {
    let extention = 'token'
    const params = data
    return this.fetchDataWithAuth('POST', extention, params)
  }

  /**
   * get specific token
   * @returns func fetchData
   */
  static async getToken (address) {
    let extention = `token/${address}`
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  /**
   *
   * statusCode {
   *  0: open,
   *  1: success,
   *  2: canceled,
   *  3: expired
   * }
   */
  static async cancelOrder (_id, txID, blockNumber, actualTxCost) {
    let extention = 'order'
    const params = { _id, txID, blockNumber, actualTxCost }
    return this.fetchDataWithAuth('PUT', extention, params)
  }
  static async cancelMoreOrder (_ids, txID, blockNumber, actualTxCost) {
    let extention = 'orders'
    const params = { _ids, txID, blockNumber, actualTxCost }
    return this.fetchDataWithAuth('PUT', extention, params)
  }
  /**
   * fillOrder
   * @param {string} orderJSON
   */
  static async fillOrder (orderJSON) {
    let extention = 'fill-order'
    const params = orderJSON
    return this.fetchDataWithAuth('POST', extention, params)
  }
  /**
   * batchFillOrder
   * @param {string} orderJSON
   */
  static async batchFillOrder (orderJSON) {
    let extention = 'batch-fill-order'
    const params = orderJSON
    return this.fetchDataWithAuth('POST', extention, params)
  }
  /**
   * insertOrder
   * @param {*} strJson
   * @returns func fetchData
   */
  static async insertOrder (jsonObject) {
    let extention = 'order'
    return this.fetchDataWithAuth('POST', extention, jsonObject)
  }

  /**
   * getAnnounceMessage
   */
  static async getAnnounceMessage () {
    let extention = 'announce'
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  /**
   * getAllVolumeExchange
   */
  static async getAllVolumeExchange () {
    let extention = 'order/screen/top'
    const queryStr = {}
    return this.fetchDataWithAuth('GET', extention, queryStr)
  }

  static async getOrderAllToken (skip) {
    let extention = 'order-histories'
    const params = { skip }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getOrderBoardHistory (makerToken, takerToken, type, skip, limit) {
    let extention = 'order-pair-histories'
    const params = { makerToken, takerToken, type, skip, limit }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getOrderFilledHistory (makerToken, takerToken, skip, limit) {
    let extention = 'order-filled-pair'
    const params = { makerToken, takerToken, skip, limit }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getOrderMyHistory (address, makerToken, takerToken, skip, limit) {
    let extention = 'my-order-histories'
    const params = { address, makerToken, takerToken, skip, limit }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getMyOrderHistory (myAddress, from, to, skip) {
    let extention = 'user/' + myAddress + '/history'
    const queryStr = { from, to, skip }
    return this.fetchDataWithAuth('GET', extention, queryStr)
  }

  static async getMinMaxOrder (from, to) {
    let extention = 'order-pair-price'
    const params = { from, to }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async checkValidMakeOrder (address, makerToken, takerToken, priceInWei, isSell) {
    let extention = 'check-make-order'
    const params = { address, makerToken, takerToken, priceInWei, isSell }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getOrderedAmount (address, tokenAddress) {
    let extention = 'order/active/balance'
    const params = { address, tokenAddress }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getTokenPrice (tokens) {
    let extention = 'token/price'
    const params = { tokens }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async warningMultipleOrders (address, makerTokenAddress, warningReason) {
    let extention = 'order/warning'
    const params = { address, makerTokenAddress, warningReason }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async checkValidFillOrder (orders, amount, isSell) {
    let extention = 'check-fill-order'
    const params = { orders, amount, isSell }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async updateOrderRemaining (orderHash, remainBalance) {
    let extention = 'order/balance'
    const params = { orderHash, remainBalance }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async removeOrder (_id) {
    let extention = 'order'
    const params = { _id }
    return this.fetchDataWithAuth('DELETE', extention, params)
  }

  static async getVersion () {
    let extention = 'config/version'
    return this.fetchDataWithAuth('GET', extention)
  }

  static async getSettingUrls () {
    let extention = 'config/urls'
    return this.fetchDataWithAuth('GET', extention)
  }

  static async getCMC (page, currency = 'USD', limit = NUMBER_COIN_PER_PAGE) {
    let extention = 'cmc'
    const params = {
      start: page === 1 ? 0 : page * limit - limit,
      limit,
      currency
    }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getCoinInfo (symbol, currency = 'USD', id = '', name = '') {
    let extention = 'coin/info'
    const queryStr = { symbol, currency }
    if (id) {
      queryStr.id = id
    } else if (name) {
      queryStr.name = name
    }
    let url = Settings.server.dexApi.url + extention
    url = url + '?' + QueryString.stringify(queryStr)
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      console.log('DexAPI fetch data: ', url, response)
      return response
    } catch (error) {
      console.log('DexAPI fetch data error: ', error)
    }
  }

  static async hideStatusCode (statusCode, _id) {
    let extention = 'order-status'
    const params = { statusCode, _id }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async getMyFavoriteList (addresses) {
    let extention = 'tokens/favorite'
    const queryStr = { addresses }
    return this.fetchDataWithAuth('GET', extention, queryStr)
  }

  static async getMyFavoriteList2 (addresses, limit = 0, skip = 0) {
    let extention = 'tokens/favorite2'
    const queryStr = { addresses, limit, skip }
    return this.fetchDataWithAuth('GET', extention, queryStr)
  }

  static async getTokenDataWithChart2 (address, symbol) {
    let extention = 'token/load'
    const queryStr = { address, symbol }
    return this.fetchDataWithAuth('GET', extention, queryStr)
  }

  static async getTokenDataWithChart (address) {
    let extention = 'token/load'
    const params = { address }
    let url = Settings.server.dexApi.url + extention
    url = url + '?' + QueryString.stringify(params)
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      console.log('DexAPI fetch data: ', url, response)
      return response
    } catch (error) {
      console.log('DexAPI fetch data error: ', error)
    }
  }

  static async getGasPrice () {
    let extention = 'ethgasstation'
    const params = {}
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async sendMail (data) {
    let extension = 'email'
    const params = data
    return this.fetchDataWithAuth('POST', extension, params)
  }

  static async getTokenCardRegistrationFee () {
    let extention = 'screen-configs/register_token_card'
    const params = {}
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getApplyForAirdropConfig () {
    let extention = 'screen-configs/apply_for_airdrop'
    const params = {}
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getDexConfig () {
    let extention = 'screen-configs/hb_dex'
    const params = {}
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getAllTokenDB () {
    let extention = 'token-clients'
    let url = Settings.server.dexApi.url
    url = url + extention
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      console.log('DexAPI fetch data: ', url, response)
      return response
    } catch (error) {
      console.log('DexAPI fetch data error: ', error)
    }
  }

  // Only get Token from RealBoost
  static async getRealBoostTokenDB () {
    let url = 'https://realboost.jp/api/tokens'
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      console.log('RealBoost fetch data: ', url, response)
      return response
    } catch (error) {
      console.log('RealBoost fetch data error: ', error)
    }
  }

  // Only get Token from RSS
  static async getDappsmarket () {
    let url = 'http://dappsmarket.net/feed/'
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      return response
    } catch (error) {
      console.log('dappsmarket fetch data error: ', error)
    }
  }

  // Only get Token from unblock
  static async getUnblock () {
    let url = 'https://www.unblock.news/api/dappnews'
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      return response
    } catch (error) {
      console.log('dappsmarket fetch data error: ', error)
    }
  }

  static async getSingleTokenDB (tokenName) {
    let extension = `token-client/${tokenName}`
    const params = { }
    return this.fetchDataWithAuth('GET', extension, params)
  }

  static async insertTokenDB (data) {
    let extention = 'token-client'
    const params = data
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async updateTokenDB (data) {
    let extention = 'token-client'
    const params = data
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async getSingleDappRating (userId, gameId) {
    let extention = 'dapp/rate'
    const queryStr = { userId, gameId }
    return this.fetchDataWithAuth('GET', extention, queryStr)
  }

  static async addRatingToDapp (userId, gameId, value) {
    let extention = 'dapp/rate'
    const params = { userId, gameId, value }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async getAmountAdvancedWallet () {
    let extension = 'screen-configs/advanced_wallet'
    const params = {}
    return this.fetchDataWithAuth('GET', extension, params)
  }

  static async triggerGetEtherTransactions (address) {
    let extention = 'user/history'
    const params = { address }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async getEtherTransactions (address, from, size) {
    let extention = 'transactions'
    const params = { address, from, size }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getTokenTransactions (address, contractAddress, from, size) {
    let extention = 'transactions-token'
    const params = { address, contractAddress, from, size }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getAllTokenTransactions (address) {
    let extention = 'transactions-tokens'
    const params = { address }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async walletAdvancedHistory (from) {
    let extention = 'wallet/advanced/tx'
    const params = { from }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  // static async walletAdvancedSuccess (from, txs, amounts, timeStamp, tokenName, tokenSymbol, fileName, success, totalTokenAmounts, fee, fisrtTry = true) {
  static async walletAdvancedSuccess (from, fee, timeStamp, firstTry = true, address, amounts) {
    let extention = 'wallet/advanced/insert/success/tx'
    const params = { from, fee, timeStamp, firstTry, address, amounts }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  // static async walletAdvancedFail (from, txs, amounts, timeStamp, tokenName, tokenSymbol, fileName, totalTokenAmounts, fee, retry, reason) {
  static async walletAdvancedFail (from, fee, timeStamp, reason, address, amounts) {
    let extention = 'wallet/advanced/insert/failed/tx'
    const params = { from, fee, timeStamp, reason, address, amounts }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async walletAdvancedPending (from, tokenName, tokenSymbol, fileName, totalTokenAmounts, timeStamp, txHash, totalAddress, address, amounts) {
    let extention = 'wallet/advanced/insert/pending/tx'
    const params = { from, tokenName, tokenSymbol, fileName, totalTokenAmounts, timeStamp, txHash, totalAddress, address, amounts }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async getAddressInfo (address, currency) {
    let extention = 'tokens'
    const params = { address, currency }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async addCustomToken (address, token) {
    let extention = 'user/token'
    const params = { address, token }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async enabledToken (address, contractAddress, isEnabled) {
    let extention = 'user/token'
    const params = { address, contractAddress, isEnabled }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async deleteToken (address, contractAddress, isDeleted) {
    let extention = 'user/token'
    const params = { address, contractAddress, isDeleted }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async getAirdropList (key = 'airdrop') {
    let extention = 'air-drop'
    const params = { key }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async saveAirdrop (data) {
    let extention = 'air-drop'
    const params = data
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async saveTransactionToken (tokenReceipt, address) {
    let extention = 'transaction/token'
    const params = { tokenReceipt, address }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async saveTransactionEther (ethReceipt, address) {
    let extention = 'transaction/eth'
    const params = { ethReceipt, address }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async imageUpload (fileName, fileContent) {
    let extention = 'image/upload'
    const params = { fileName, fileContent }
    return this.fetchDataWithAuth('POST', extention, params)
  }
  static async imageUploadResize (fileName, fileContent, width, height) {
    let extention = 'image/upload/resize'
    const params = { fileName, fileContent, width, height }
    return this.fetchDataWithAuth('POST', extention, params)
  }
  static async deleteSaleGameItem (symbol, tokenId) {
    let extention = `erc721/${symbol}/${tokenId}/price`
    const params = {}
    return this.fetchDataWithAuth('DELETE', extention, params)
  }

  static async postGameTxsHistory (hash, id, symbol, from, to, price) {
    let extention = 'erc721/order-history'
    const params = { hash, id, symbol, from, to, price }
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async postSaleGameItem (symbol, id, owner, price, description, hash) {
    let extention = `erc721/${symbol}/price/v2`
    const params = { id, owner, price, hash }
    if (description && description.length > 0) {
      params.description = description
    }
    return this.fetchDataWithAuth('PATCH', extention, params)
  }

  static async postRequestGameItem (data) {
    let extention = 'erc721/request'
    const params = data
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async getRequestGameItem (address, limit, skip) {
    let extention = `erc721/request/${address}`
    const params = { limit, skip }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getRequestGameItemAll (address, limit, skip) {
    let extention = `erc721/request-all/${address}`
    const params = { limit, skip }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getRequestGameItemOfSender (address, limit, skip) {
    let extention = `erc721/request/sender`
    const params = { address, limit, skip }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getRequestGameItemOfSenderAll (address, limit, skip) {
    let extention = `erc721/request-all/sender`
    const params = { address, limit, skip }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getSingleRequestGame (address, symbol, id) {
    let extention = `erc721/request`
    const params = { address, symbol, id }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getTotalSyncRequestGame (address) {
    let extention = `erc721/count/request/${address}`
    const params = { }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async updateRequestGameItem (_id, amount, crypto, isAccepted, status) {
    let extention = 'erc721/request'
    const params = { _id }
    if (amount) {
      params.amount = amount
    }
    if (crypto) {
      params.crypto = crypto
    }
    if (isAccepted) {
      params.isAccepted = isAccepted
    }
    if (status) {
      params.status = status
    }
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async batchUpdateRequestGameItem (data) {
    let extention = 'erc721/requests'
    const params = data
    return this.fetchDataWithAuth('PUT', extention, params)
  }

  static async deleteRequestGameItem (id) {
    let extention = `erc721/request/${id}`
    const params = { }
    return this.fetchDataWithAuth('DELETE', extention, params)
  }
  
  static async getNoti (limit = 0, skip = 0, fromTime) {
    let extention = 'noti'
    const params = { limit, skip }
    if (fromTime) {
      params.fromTime = fromTime
    }
    return this.fetchDataWithAuth('GET', extention, params)
  }

  static async getPaymentQuote (data, address) {
    let extention = `address/${address}/quote`
    const params = data
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async requestPayment (data, address, balance) {
    let extention = `address/${address}/payment-request?hbWalletBalance=${balance}`
    const params = data
    return this.fetchDataWithAuth('POST', extention, params)
  }

  static async getLocation () {
    let url = 'https://api.hb-chat.work/location/'
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      return response
    } catch (error) {
      console.log('dappsmarket fetch data error: ', error)
    }
  }

  static async getNewFeatures () {
    let extention = 'feature'
    const params = {}
    return this.fetchDataWithAuth('GET', extention, params)
  }
  static async getSimplexInfo () {
    let extention = 'card-promotion'
    const params = {}
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
      const auth = await store.get(KEYSTORE.USER_AUTH)
      let url = Settings.server.dexApi.url + extention
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
        console.log('DexAPI fetch data: ', url, response)
        resolve(response)
      } catch (error) {
        logDebugChatwork('DexAPI fetch data error: ', error + '; router: ' + url)
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
