import ReduxServices from 'Utils/globalRedux'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const openImportAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.modalImportAccount.show()
  }
}

export const closeImportAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.modalImportAccount.hide()
  }
}

export const openListAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.modalListAccount.show()
  }
}

export const closeListAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.modalListAccount.hide()
  }
}
