import Settings from '../../settings'
import { convertBalanceToWei } from '../../../Utils/globalFunction'

export default class EtherGasStation {
  /**
   * getEtherBalance() returns balance of the account
   * based on the passed-in ethereum address
   */
  static getGasPrice (ethAddress) {
    let queryStr = 'ethgasAPI.json'
    return this.fetchData(queryStr)
  }

  static async fetchData (queryStr) {
    let apiurl = Settings.server.ethgasstation.url + queryStr
    try {
      let response = await fetch(apiurl)
      let responJson = await response.json()
      if (responJson) {
        return convertBalanceToWei(responJson.fastest, 8)
      } else {
        return 0
      }
    } catch (error) {
      throw error
    }
  }
}
