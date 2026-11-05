import Settings from '../../settings'
import cryptojs from 'crypto-js'
const urlAdding = 'returnTicker'

/**
 * Class: EtherDelta
 * Author: Chau
 */
export default class EtherDelta {
  /**
   * Get chart token
   * @param {*}
   */
  static async getChartToken () {
    try {
      let url = Settings.server.etherdelta.url + urlAdding
      var timestamp = Math.floor(Date.now() / 1000)
      var payload = timestamp + '.' + Settings.keyConvertMoney.publickey
      var hash = cryptojs.HmacSHA256(payload, Settings.keyConvertMoney.secretkey)
      var hexhash = cryptojs.enc.Hex.stringify(hash)
      var signature = payload + '.' + hexhash
      let response = await fetch(url, {
        'async': true,
        'method': 'GET',
        'headers': {
          'x-signature': signature,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      let responseJson = await response.json().catch(error => console.log(error))
      console.log(responseJson)
      return responseJson
    } catch (error) {
      throw error
    }
  }
}
