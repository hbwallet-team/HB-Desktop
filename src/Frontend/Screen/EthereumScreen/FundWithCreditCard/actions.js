
var THIS

export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const onChangeDropdown = (item) => {
  return (dispatch, getState) => {
    console.log('onChangeDropdown: ', item)
  }
}

export const onChangeCurrency = (value) => {
  return (dispatch, getState) => {
    THIS.setState({txtCurrency: value})
  }
}
