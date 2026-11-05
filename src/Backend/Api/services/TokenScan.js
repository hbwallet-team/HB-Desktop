import Settings from '../../settings'
import cryptojs from 'crypto-js'
export default class TokenService {
  /**
   * NAME: getTokenData
   * RETURN TokenImage and information from sever
   */
  static getTokenData () {
    let module = 'token_db_api/'
    let action = 'scan'
    let queryStr = module + action
    // let apiurl = Settings.server.amazonapi.url + queryStr
    return this.fetchData(queryStr)
  }

  /**
   * NAME: fetchData
   * RETURN Data fetch from sever
   */
  static async fetchData (queryStr) {
    let apiurl = Settings.server.amazonapi.url + queryStr

    var timestamp = Math.floor(Date.now() / 1000)
    var payload = timestamp + '.' + Settings.keyConvertMoney.publickey
    var hash = cryptojs.HmacSHA256(payload, Settings.keyConvertMoney.secretkey)
    var hexhash = cryptojs.enc.Hex.stringify(hash)
    var signature = payload + '.' + hexhash

    try {
      let response = await fetch(apiurl, {
        'async': true,
        'method': 'GET',
        'headers': {
          'x-signature': signature,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      let responJson = await response.json()
      let array = []

      responJson.forEach(function (element) {
        array.push({
          id: element.id,
          name: element.token_name,
          tokenAddress: element.contract_address,
          cardImage: element.card_file_path,
          iconImage: element.icon_file_path,
          symbol: element.symbol,
          url: element.url,
          decimal: element.decimal,
          display_flag: element.display_flag
        })
      }, this)

      if (array.length > 0) {
        return array
      } else {
        return []
      }
    } catch (error) {
      throw error
    }
  }

  static async getTokenDataSagaAsync (apiurl, signature) {
    try {
      let response = await fetch(apiurl, {
        'async': true,
        'method': 'GET',
        'headers': {
          'x-signature': signature,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch (error) {
      return null
    }
  }

  static async getTokenDataSaga () {
    let module = 'token_db_api/'
    let action = 'scan'
    let queryStr = module + action
    // let apiurl = Settings.server.amazonapi.url + queryStr
    let apiurl = Settings.server.amazonapi.url + queryStr

    var timestamp = Math.floor(Date.now() / 1000)
    var payload = timestamp + '.' + Settings.keyConvertMoney.publickey
    var hash = cryptojs.HmacSHA256(payload, Settings.keyConvertMoney.secretkey)
    var hexhash = cryptojs.enc.Hex.stringify(hash)
    var signature = payload + '.' + hexhash
    console.log('signature: ' + signature)

    // return this.getTokenDataSagaAsync(apiurl, signature)
    try {
      let response = await fetch(apiurl, {
        'async': true,
        'method': 'GET',
        'headers': {
          'x-signature': signature,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      console.log('getTokenDataSagaAsync: ' + response)
      return response
    } catch (error) {
      return null
    }
  }

  static async getDressUpListAsync () {
    try {
      let response = await fetch(Settings.server.dressUpToken.scan.url)
      let responseJson = await response.json()
      return responseJson
    } catch (error) {
      return null
    }
  }

  static getDressUpList () {
    return this.getDressUpListAsync()
  }
}
