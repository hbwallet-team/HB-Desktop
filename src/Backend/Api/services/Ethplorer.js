import Settings from '../../settings'
import QueryString from 'query-string'
import { requestRetry } from 'Utils/globalFunction'

export default class EthplorerService {
  static async getAddressTransactions (address, limit) {
    let action = 'getAddressTransactions/'

    let queryStr = action + address + '?' + QueryString.stringify({
      apiKey: Settings.server.ethplorer.key,
      limit: limit || Settings.server.ethplorer.limit
    })

    return this.fetchData(queryStr)
  }

  static async getTokenTransactions (address, tokenAddress, limit) {
    let action = 'getAddressHistory/'
    let queryStr = action + address + '?' + QueryString.stringify({
      token: tokenAddress,
      apiKey: Settings.server.ethplorer.key,
      limit: limit || Settings.server.ethplorer.limit

    })

    return this.fetchData(queryStr)
  }

  static async getAllTokenTransactions (address) {
    let action = 'getAddressHistory/'
    let queryStr = action + address + '?' + QueryString.stringify({
      apiKey: Settings.server.ethplorer.key,
      limit: Settings.server.ethplorer.limit

    })

    return this.fetchData(queryStr)
  }

  static async getAddressInfo (address) {
    let action = 'getAddressInfo/'

    let queryStr = action + address + '?' + QueryString.stringify({
      apiKey: Settings.server.ethplorer.key
    })

    return this.fetchData(queryStr)
  }
  static getTopTokenList (criteria = 'cap') {
    let action = 'getTop'

    let queryStr = action + '?' + QueryString.stringify({
      apiKey: Settings.server.ethplorer.key,
      limit: 10,
      criteria: criteria,
      period: 90
    })
    console.log('getTopTokenSaga: ', queryStr)
    return this.fetchData(queryStr)
  }
  static getTopTokenSaga (criteria) {
    let action = 'getTop'

    let queryStr = Settings.server.ethplorer.url + action + '?' + QueryString.stringify({
      apiKey: Settings.server.ethplorer.key,
      limit: 30,
      criteria: criteria,
      period: 90
    })
    console.log('getTopTokenSaga: ', queryStr)
    return fetch(queryStr)
  }
  static async getTokenInfo (address) {
    let action = 'getTokenInfo/'

    let queryStr = action + address + '?' + QueryString.stringify({
      apiKey: Settings.server.ethplorer.key
    })

    return this.fetchData(queryStr)
  }
  static async getTxInfo (txtHash) {
    let action = 'getTxInfo/'

    let queryStr = action + txtHash + '?' + QueryString.stringify({
      apiKey: Settings.server.ethplorer.key
    })

    return this.fetchData(queryStr)
  }

  /**
   * fetchData() returns the result from rest api call using build-in fetch() of react
   * based on the passed-in pre-defined query string
   */
  static async fetchData (queryStr, type) {
    let apiurl = Settings.server.ethplorer.url + queryStr
    try {
      let re = await requestRetry({url: apiurl})
      return re
    } catch (error) {
      console.log('Failed query: ', apiurl, ', error: ', error)
      return null
    }
  }
}
