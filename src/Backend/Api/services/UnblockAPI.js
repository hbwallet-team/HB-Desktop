import Settings from '../../settings'
import QueryString from 'query-string'
import { requestRetry, logDebugChatwork } from 'Utils/globalFunction'

export default class UnblockAPI {
  /**
   * get most recent news
   * @returns respon json
   */
  static async getMostRecentNews (limit) {
    let extention = 'most-recent'
    const params = { limit }
    return this.fetchGet(extention, params)
  }

  /**
   * fetchGet
   * @param {*} queryStr
   * @param {*} method
   * @returns respon json
   */
  static async fetchGet (extention, queryStr) {
    let url = Settings.server.unblockAPI.url + extention + '?' + QueryString.stringify(queryStr)
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
      console.log('Unblock fetch data: ', url, response)
      return response
    } catch (error) {
      logDebugChatwork('Unblock fetch data error: ', error + '; router: ' + url)
    }
  }
}
