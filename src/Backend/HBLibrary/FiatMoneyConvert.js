import QueryString from 'query-string'
import Settings from '../settings'
import FiatMoneyExchange from '../Api/services/FiatMoneyExchange'
import { HBCURRENCY } from '../../Utils/globalConstants'
import { requestRetry } from 'Utils/globalFunction'

const CONVERT = 'convert?'

export default class CurrencyCoversion {
  static async convertCrytoToMoney (cryptoType, fiatMoney, cryptoAmount) {
    try {
      var cryptoExchangeValue = await FiatMoneyExchange.getExchangeRateFromCryptoToFiatMoney(cryptoType, HBCURRENCY.USD)
      if (fiatMoney !== HBCURRENCY.USD) {
        // Get usd & fiatMoney exchange
        var usdToFiatMoneyExchange = await this.getExchangeRateFromUSDToFiatMoney(fiatMoney)
        // => crypto fiatMoney exchange
        cryptoExchangeValue = cryptoExchangeValue * usdToFiatMoneyExchange
      }
      let cryptoValue = cryptoAmount * cryptoExchangeValue
      return cryptoValue
    } catch (error) {
      return 0
    }
  }

  static async convertTokenToMoneyV2 (tokenID, fiatMoney) {
    let tokenParse = tokenID + '/?'
    let convertMoney = 'convert=' + fiatMoney
    let url = Settings.server.coinmarketcapApiV2.url + tokenParse + convertMoney
    console.log('convertTokenToMoney: ', url)
    try {
      let response = await requestRetry({url})

      // let responJson = await response.json()
      if (response) {
        return response
      } else {
        return null
      }
    } catch (error) {
      throw error
    }
  }

  static async convertTokenToMoney (tokenID, fiatMoney) {
    let tokenParse = tokenID + '/?'
    let convertMoney = 'convert=' + HBCURRENCY.USD
    let url = Settings.server.coinmarketcapApi.url + tokenParse + convertMoney
    console.log('convertTokenToMoney: ', url)
    try {
      let response = await requestRetry({url})

      // let responJson = await response.json()
      if (response && response.length > 0) {
        if (fiatMoney === HBCURRENCY.USD) {
          return response[0].price_usd
        } else {
          // Get usd & fiatMoney exchange
          var usdToFiatMoneyExchange = await this.getExchangeRateFromUSDToFiatMoney(fiatMoney)
          // => crypto fiatMoney exchange
          return response[0].price_usd * usdToFiatMoneyExchange
        }
      } else {
        return null
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Name: getExchangeRateFromUSDToFiatMoney
   * @param {*} fiatMoney : currency want to change
   * Get exchange rate from usd to fiatMoney with amount = 1
   * RETURN result (value exchanged)
   */
  static async getExchangeRateFromUSDToFiatMoney (fiatMoney) {
    let queryStr = QueryString.stringify({
      access_key: Settings.server.apilayer.key,
      from: HBCURRENCY.USD,
      to: fiatMoney,
      amount: 1,
      format: 1
    })
    let url = Settings.server.apilayer.url + CONVERT + queryStr
    try {
      var response = await requestRetry({url})
      // let responJson = await json.json()
      if (response && response.result) {
        return response.result
      } else {
        return null
      }
    } catch (error) {
      throw error
    }
  }
}
