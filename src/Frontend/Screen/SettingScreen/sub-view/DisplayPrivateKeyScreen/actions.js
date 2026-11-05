export const onCompleteInputPINCode = (value, THIS) => {
  return (dispatch, getState) => {
    const {countInput} = THIS.state
    const { arrPinCodeData } = getState()
    const { t } = THIS.props

    if (countInput === -1) {
      if (arrPinCodeData === value) {
        THIS.props.setIsActiveScreen(true)
      } else {
        THIS.setState({ isErrorCurrentPIN: true, txtError: t('PinCodeNotMatched') })
        setTimeout(() => {
          THIS.pin.clear()
        }, 100)
        THIS.pin.focus()
      }
    }
  }
}
export const onChangeInputPINCode = () => {
  return (dispatch, getState) => {

  }
}
