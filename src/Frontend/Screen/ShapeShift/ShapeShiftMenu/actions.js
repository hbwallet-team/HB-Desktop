
var THIS

export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const ethToOther = () => {
  return (dispatch, getState) => {
    THIS.props.history.push('/mainTabbar/ethToOther')
  }
}

export const otherToETH = () => {
  return (dispatch, getState) => {
    THIS.props.history.push('/mainTabbar/otherToETH')
  }
}

export const shapeShiftHistory = () => {
  return (dispatch, getState) => {
    THIS.props.history.push('/mainTabbar/shapeShiftHistory')
  }
}

export const onBack = () => {
  return (dispatch, getState) => {
    THIS.setState({isContact: false})
  }
}
