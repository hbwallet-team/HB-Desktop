import Settings from '../../settings'
import QueryString from 'query-string'
import crypto from 'crypto-js'
import { requestRetry } from 'Utils/globalFunction'
const convertApi = 'convert/global?'

/**
 * NAME: CurrencyService
 * CREATOR: STEVEN
 * Provides the service to get currency exchange rate from bitcoinaverage
 * FUNCTION
 * getExchangeRateFromCryptoToFiatMoney()
 * fetchData()
 */
export default class FiatMoneyExchange {
  /**
   * NAME: getExchangeRateFromCryptoToFiatMoney
   * PARAMS: cryptoType (ETH, BTC), fiatMoney (USD, JPY)
   * Get the exchange amount from 1 crypto to ? fiat money
   * RETURN fiat money value after converting
   */
  static async getExchangeRateFromCryptoToFiatMoney (crypto, fiatMoney) {
    let queryStr = QueryString.stringify({
      from: crypto,
      to: fiatMoney,
      amount: 1
    })
    let apiurl = Settings.server.bitcoinaverage.url + convertApi + queryStr

    var exchangeRate = await this.fetchData(apiurl)
    return exchangeRate.price
  }
  static createSignature () {
    var timestamp = Math.floor(Date.now() / 1000)
    var payload = timestamp + '.' + Settings.keyConvertMoney.publickey
    var hash = crypto.HmacSHA256(payload, Settings.keyConvertMoney.secretkey)
    var hexhash = crypto.enc.Hex.stringify(hash)
    var signature = payload + '.' + hexhash
    return signature
  }
  static async fetchData (url) {
    try {
      let signature = this.createSignature()

      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'x-signature': signature
          }
        }
      })
      // let responJson = await response.json().catch({})
      return response
    } catch (error) {
      throw error
    }
  }
}
