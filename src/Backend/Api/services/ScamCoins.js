import QueryString from 'query-string'
import { requestRetry } from 'Utils/globalFunction'

export default class ScamCoins {
  /**
   * getScamCoinsList
   * @param {*} address
   * @returns func fetchData
   */
  static async getScamCoinsList () {
    let extention = 'scam/list'
    const params = { }
    return this.fetchGet(extention, params)
  }

  /**
   * fetchGet
   * @param {*} queryStr
   * @param {*} method
   * @returns respon json
   */
  static async fetchGet (extention, queryStr) {
    let url = 'https://scamcoinslist.info/' + extention
    url = url + '?' + QueryString.stringify(queryStr)
    try {
      let response = await requestRetry({
        url,
        opt: {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      console.log('ScamCoins fetch data: ', url, response)
      return response
    } catch (error) {
      console.log('ScamCoins fetch data error: ', error)
      return null
    }
  }
}
