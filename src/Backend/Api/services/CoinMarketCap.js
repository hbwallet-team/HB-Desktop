import Settings from '../../settings'
import QueryString from 'query-string'
import { requestRetry, logDebugChatwork } from '../../../Utils/globalFunction'

const addUrl = '/?'
const NUMBER_COIN_PER_PAGE = 300
const QUESTION_SYMBOL = '?'
/**
 * Class: CoinMarketCap
 * Author: Chau
 */
export default class CoinMarketCap {
  /**
   * Get price
   * Return price & percent
   * @param {*}
   */
  static getExchangeRateFromCryptoToFiatMoney (crytoCurrency, fiatMoney) {
    let queryStr = QueryString.stringify({
      convert: fiatMoney
    })
    let url = Settings.server.coinmarketcapApi.url + crytoCurrency + addUrl + queryStr
    return fetch(url)
  }

  static async getListCoin (page) {
    let queryStr = QueryString.stringify({
      start: page * NUMBER_COIN_PER_PAGE,
      limit: NUMBER_COIN_PER_PAGE,
      convert: 'BTC',
      structure: 'array'
    })
    let url = Settings.server.coinmarketcapApiV2.url + QUESTION_SYMBOL + queryStr
    // console.log('getListCoin: ', page, url)
    return requestRetry({url: url}).then(results => {
      if (results && Array.isArray(results.data) && results.data.length > 0) {
        return results.data.map(item => {
          return {
            id: item.id,
            name: item.name,
            symbol: item.symbol,
            rank: item.rank,
            price_usd: item.quotes.USD.price,
            price_btc: item.quotes.USD.price,
            '24h_volume_usd': item.quotes.USD.volume_24h,
            market_cap_usd: item.quotes.USD.market_cap,
            available_supply: item.total_supply,
            total_supply: item.total_supply,
            max_supply: item.max_supply,
            percent_change_1h: item.quotes.USD.percent_change_1h,
            percent_change_24h: item.quotes.USD.percent_change_24h,
            percent_change_7d: item.quotes.USD.percent_change_7d,
            last_updated: item.last_updated
          }
        })
      }
      return []
    })
  }

  static async getCoinById (id, currency = 'ETH') {
    let extention = 'cryptocurrency/quotes/latest'
    const params = { id, convert: currency }
    return this.fetchData(extention, params)
  }

  static async getLatestCoin (page, currency = 'USD') {
    let extention = 'cryptocurrency/listings/latest'
    const params = {
      start: page === 1 ? 1 : page * NUMBER_COIN_PER_PAGE - NUMBER_COIN_PER_PAGE,
      limit: NUMBER_COIN_PER_PAGE,
      convert: currency
    }
    return this.fetchData(extention, params)
  }

  /**
   * fetch data
   * @param {*} params
   * @param {*} method
   * @returns respon json
   */
  static async fetchData (extention, params) {
    let url = Settings.server.coinmarketcapProApi.url + extention
    url = url + '?' + QueryString.stringify(params)
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CMC_PRO_API_KEY': Settings.server.coinmarketcapProApi.apiKey
          }
        }
      })
      return response
    } catch (error) {
      logDebugChatwork('CoinMarketCapAPI fetch data error: ', error + '; router: ' + url)
    }
  }
}
