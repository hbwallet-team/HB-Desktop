var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const closeSwitchAccountModal = () => {
  return (dispatch) => {
    THIS.refs.modalSwitchAccount.hide()
  }
}

export const handleSwitchAccount = (card) => {
  return (dispatch) => {
    THIS.setState({
      switchSelectItem: card
    }, () => {
      THIS.refs.modalSwitchAccount.show()
    })
  }
}
