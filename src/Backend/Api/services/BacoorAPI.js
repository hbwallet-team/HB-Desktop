import Settings from '../../settings'
import { requestRetry } from 'Utils/globalFunction'

export default class BacoorAPI {
  static async getGasStation () {
    try {
      let queryStr = Settings.server.gasStation.url
      let response = await requestRetry({
        url: queryStr, 
        opt: {
          method: 'GET',
          headers: {
            'Authorization': Settings.server.gasStation.token
          }
        }
      })
      // return await response.json()
      return response
    } catch (error) {
      throw (error)
    }
  }
  static async getTokenSale () {
    try {
      let queryStr = Settings.server.tokenSale.url
      let response = await requestRetry({
        url: queryStr,
        opt: {
          method: 'GET',
          headers: {
            'Authorization': Settings.server.tokenSale.token
          }
        }
      })
      // let responseJson = await response.json()

      if (response && response.data) {
        console.log('getTokenSale: ', response.data)
        return response.data
      } else {
        console.log('getTokenSale error')
      }
    } catch (error) {
      throw (error)
    }
  }

  static async getAirdrop () {
    try {
      let queryStr = Settings.server.airdrop.url
      let response = await requestRetry({
        url: queryStr, 
        opt: {
          method: 'GET',
          headers: {
            'Authorization': Settings.server.airdrop.token
          }
        }
      })
      // let responseJson = await response.json()

      if (response && response.data) {
        console.log('getAirdrop: ', response.data)
        return response.data
      } else {
        console.log('getAirdrop error')
      }
    } catch (error) {
      throw (error)
    }
  }
}
