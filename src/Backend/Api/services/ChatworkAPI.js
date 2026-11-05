import { CHATWORK, APP_ENVIROMENT } from 'Utils/globalConstants'
import { requestRetry } from 'Utils/globalFunction'
const appVersion = window.require('electron').remote.app.getVersion()

export default class ChatworkAPI {
  static async postMessage (message) {
    let url = 'https://api.chatwork.com/v2/rooms/' + CHATWORK.ROOM_ID + '/messages'
    const params = { body: 'ENV: ' + APP_ENVIROMENT + ' - ' + 'App version: ' + appVersion + ' - ' + message }
    try {
      let response = await requestRetry({
        url,
        opt: {
          form: params,
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-ChatWorkToken': CHATWORK.TOKEN
          }
        }
      })
      console.log('Chatwork post message: ', url, response)
      return response
    } catch (error) {
      console.log('Chatwork post message error: ', error)
    }
  }
}
