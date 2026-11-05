import Settings from '../../settings'
import QueryString from 'query-string'
import { HBCURRENCY } from '../../../Utils/globalConstants'
import cryptojs from 'crypto-js'
const urlAdding = 'indices/global/history/'

/**
 * Class: BitcoinAverage
 * Author: Chau
 */
export default class BitcoinAverage {
  /**
   * Get chart price
   * @param {*}
   */
  static getChartPrice (symbol = 'ETH') {
    symbol += HBCURRENCY.USD + '?'

    var timestamp = Math.floor(Date.now() / 1000)
    var payload = timestamp + '.' + Settings.keyConvertMoney.publickey
    var hash = cryptojs.HmacSHA256(payload, Settings.keyConvertMoney.secretkey)
    var hexhash = cryptojs.enc.Hex.stringify(hash)
    var signature = payload + '.' + hexhash

    let queryStr = QueryString.stringify({
      period: 'daily',
      format: 'json'
    })

    let url = Settings.server.bitcoinaverage.url + urlAdding + symbol + queryStr
    console.log('Fetch chart ' + symbol + ' data: ', url)
    return fetch(url, {
      'async': true,
      'method': 'GET',
      'headers': {
        'x-signature': signature,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
  }
}
