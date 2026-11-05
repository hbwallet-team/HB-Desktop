export const onClickOutPINCode = (value) => {
  return (dispatch, getState) => {
    if (THIS.pin) {
      THIS.pin.clear()
      THIS.pin.focus()
    }
  }
}
