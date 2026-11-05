import Settings from '../../settings'
import QueryString from 'query-string'

const histohour = 'data/histohour?'
const histoday = 'data/histoday?'

/**
 * Class: CryptoCompare
 * Author: Chau
 */
export default class CryptoCompare {
  /**
   * Get chart price
   * @param {*}
   */
  static fetchChartPrice (symbol = 'ETH', isYear = false) {
    let queryStr = QueryString.stringify({
      fsym: symbol,
      tsym: 'USD',
      limit: isYear ? 365 : 720, // 24 * 30 = 720
      // limit: 24,
      aggregate: 1,
      extraParams: 'HBWallet'
    })
    let url = Settings.server.cryptocompare.url + (isYear ? histoday : histohour) + queryStr
    console.log('Fetch chart ' + symbol + ' data: ', url)
    return fetch(url)
  }
}
