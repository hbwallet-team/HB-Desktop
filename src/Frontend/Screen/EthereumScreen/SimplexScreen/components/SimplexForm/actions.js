import { showLoading, hideLoading } from 'react-redux-loading-bar'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingStart = () => {
  return (dispatch) => {
    THIS.setState({
      isCrash: false
    })
    dispatch(showLoading())
  }
}

export const loadingStop = () => {
  return (dispatch) => {
    dispatch(hideLoading())
  }
}

export const setRefWebView = (ref) => { 
  return (dispatch) => {
    THIS.webview = ref
  }
}

export const onNewWindow = (response) => {
  return (dispatch) => {
    console.log('on: NewWindow', response)
    THIS.setState({
      txtLink: response.url
    }, () => {
      THIS.forceUpdate()
    })
  }
}

export const onDidFinishLoad = (response) => {
  return (dispatch) => {
    console.log('on: onDidFinishLoad', response)
    THIS.setState({
      isLoadingPageSuccess: true
    })
  }
}

export const onDidFailLoad = (response) => {
  return (dispatch) => {
    console.log('on: DidFailLoad', response)
    if (response && response.errorDescription === 'ERR_NAME_NOT_RESOLVED') {
      THIS.setState({
        isCrash: true,
        isLoadingPageSuccess: false
      })
    }
  }
}
