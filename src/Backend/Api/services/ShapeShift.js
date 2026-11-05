import Setting from '../../settings'
import {getErrStr} from '../../../Utils/0xError'
export default class Shapeshift {
  static async exchangeCoin (amount, receiveAddr, pairCoin, returnAddress) {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'sendamount', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          withdrawal: receiveAddr,
          pair: 'eth_' + pairCoin,
          returnAddress,
          apiKey: Setting.server.shapeshift.publicKey
        })
      })
      let responJson = await response.json()

      console.log(responJson)
      return responJson.success
    } catch (error) {
      console.log(error)
      return {error: error}
    }
  }

  static async getcoins () {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'getcoins')
      let responJson = await response.json()
      return responJson
    } catch (error) {
      return undefined
    }
  }

  static async getRateEthToAnother (coinSymbol) {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'marketinfo/eth_' + coinSymbol)
      let responJson = await response.json()
      return responJson
    } catch (error) {
      return 0
    }
  }

  static async getRateOtherToEth (coinSymbol) {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'marketinfo/' + coinSymbol + '_eth')
      let responJson = await response.json()
      return responJson
    } catch (error) {
      return 0
    }
  }

  static async getValidateAddress (address, coinSymbol) {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'validateAddress/' + address + '/' + coinSymbol)
      let responJson = await response.json()
      return responJson.isvalid
    } catch (error) {
      return 0
    }
  }

  static async getTXByApiKey () {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'txbyapikey/' + Setting.server.shapeshift.privateKey)
      let responJson = await response.json()
      return responJson
    } catch (error) {
      throw (error)
    }
  }

  static async checkTxStatus (address) {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'txStat/' + address)
      let responJson = await response.json()
      return responJson
    } catch (error) {
      return 0
    }
  }

  static async cancelPendingTxs (depositAddr) {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'cancelpending', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: depositAddr
        })
      })
      let responJson = await response.json()
      console.log(responJson)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  static async exchangeCoinNoAmount (receiveAddr, pairCoin, returnAddress) {
    try {
      var response = await fetch(Setting.server.shapeshift.url + 'shift', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          withdrawal: receiveAddr,
          pair: pairCoin + '_eth',
          returnAddress,
          apiKey: Setting.server.shapeshift.publicKey
        })
      })
      let responJson = await response.json()

      console.log(responJson)
      return responJson
    } catch (error) {
      console.log(error)
      return undefined
    }
  }
}
