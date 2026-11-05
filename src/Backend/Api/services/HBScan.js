import Settings from '../../settings'
import EtherGas from '../../../Backend/Api/services/EtherGas'
import EtherscanServices from '../../Api/services/EtherScan'
var Web3 = require('web3')
var web3 = new Web3()
// web3.setProvider(new web3.providers.HttpProvider('http://13.231.240.138:8545'))
// web3.setProvider(new web3.providers.HttpProvider(Settings.server.networkInfura.url))

/**
 * NAME: HBScanServices
 * CREATOR: Khiem
 * Handle calling rest api to hbScan
 */
const error = 'Error'

export default class HBScanServices {
  /**
   * getEtherBalance() returns balance of the account
   * based on the passed-in ethereum address
   */
  static getEtherBalanceSaga_old (ethAddress) {
    let queryStr = 'account/balance/' + ethAddress
    let apiurl = Settings.server.hbScan.url + queryStr
    return apiurl
  }

  static getEtherBalanceSaga (ethAddress) {
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(ethAddress, (err, res) => {
        if (!err) {
          resolve(res)
        } else {
          resolve(null)
        }
      })
    })
  }

  /**
   * getEtherBalance() returns balance of the account
   * based on the passed-in ethereum address
   */
  static getEtherBalance (ethAddress) {
    let queryStr = 'account/balance/' + ethAddress
    console.log('getEtherBalance')
    return this.fetchData(queryStr)
  }

  static getGasPrice_old () {
    let queryStr = 'transaction/gas-price'

    return this.fetchData(queryStr)
  }

  static async getGasPrice () {
    return await EtherGas.getGasPriceFastest()
  }

  static async sendRawTransaction_old (rawTranx) {
    try {
      var response = await fetch(Settings.server.hbScan.url + 'transaction/sign', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': Settings.server.hbScan.key
        },
        body: JSON.stringify({
          rawTranx
        })
      })
      let responJson = await response.json()

      if (responJson.rawTranx) {
        console.log('sendRawTransaction: ', error)
        throw error
      } else {
        console.log('sendRawTransaction: ', responJson)
        return responJson
      }
    } catch (error) {
      console.log('sendRawTransaction: ', error)
      throw error
    }
  }

  static sendRawTransaction (rawTranx) {
    return new Promise((resolve, reject) => {
      web3.eth.sendRawTransaction(rawTranx, (err, transactionHash) => {
        if (err) {
          console.log('sendRawTransaction error: ', err)
          resolve(null)
        } else {
          console.log('sendRawTransaction hash : ', transactionHash)
          resolve(transactionHash)
        }
      })
    })
  }

  static async getNounce_old (ethAddress) {
    let queryStr = 'account/' + ethAddress + '/transaction/count/'

    return this.fetchData(queryStr)
  }

  static async getNounce (ethAddress) {
    return await EtherscanServices.getNounce(ethAddress)
  }

  static getGasLimit (from, nonce, to, data) {
    return new Promise((resolve, reject) => {
      web3.eth.estimateGas({from, nonce, to, data}, (err, res) => {
        if (err) {
          console.log('estimateGas error: ', err)
          resolve(null)
        } else {
          console.log('estimateGas success : ', res)
          resolve(Math.round(res * 1.2))
        }
      })
    })
  }

  /**
   * fetchData() returns the result from rest api call using build-in fetch() of react
   * based on the passed-in pre-defined query string
   */
  static async fetchData (queryStr) {
    let apiurl = Settings.server.hbScan.url + queryStr
    try {
      let response = await fetch(apiurl, {
        method: 'GET',
        headers: {
          'Authorization': Settings.server.hbScan.key
        }
      }
      )
      let responJson = await response.json()
      console.log(responJson)

      if (responJson.result !== undefined) {
        return responJson.result
      } else {
        throw error
      }
    } catch (e) {
      throw e
    }
  }
}
