import { setInternet } from 'Backend/Redux/actions/mainActions'
import { activeSocketDex, activeFirebase } from 'Utils/globalFunction'

const config = {
  url: 'https://ipv4.icanhazip.com/',
  timeout: 5000,
  interval: 5000
}
export const loadingInitial = (THIS) => {
  return (dispatch, getState) => {
    const { arrCardData, internetData, history } = THIS.props
    if (internetData) {
      activeSocketDex(dispatch)
      activeFirebase(dispatch)
    }
    setTimeout(() => {
      arrCardData.length > 0
        ? history.push('/mainTabbar')
        : history.push('/LanguageScreen')
    }, 4000)
  }
}

export const checkInternet = (THIS) => {
  return (dispatch, getState) => {
    setInterval(() => {
      ping().then(online => {
        updateOnlineStatus(online, dispatch, setInternet, THIS)
      })
    }, config.interval)
  }
}

const ping = () => {
  return new Promise((resolve, reject) => {
    const isOnline = () => resolve(true)
    const isOffline = () => resolve(false)
    const xhr = new XMLHttpRequest()

    xhr.onerror = isOffline
    xhr.ontimeout = isOffline
    xhr.onload = () => {
      const response = xhr.responseText.trim()
      if (!response) {
        isOffline()
      } else {
        isOnline()
      }
    }

    xhr.open('GET', config.url)
    xhr.timeout = config.url
    xhr.send()
  })
}

const updateOnlineStatus = (isOnline, dispatch, setInternet, THIS) => {
  if (isOnline === THIS.isON) return
  THIS.isON = isOnline
  dispatch(setInternet(isOnline))
  if (isOnline) {
    activeSocketDex(dispatch)
    activeFirebase(dispatch)
  }
  return null
}
