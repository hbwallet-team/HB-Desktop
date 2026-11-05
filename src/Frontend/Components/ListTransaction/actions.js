import { setSendingProcess, setPendingTx } from 'Backend/Redux/actions/globalActions'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return (dispatch) => {
    const { pendingTx, trackingSendTxs } = THIS.props
    // trackingSendTxs[0].isComplete = true
    // dispatch(setSendingProcess(trackingSendTxs))
    // pendingTx.isPending = false
    // dispatch(setPendingTx(pendingTx))
  }
}

export const clickOnSpeedUp = (item) => {
  return (dispatch) => {
    THIS.setState({
      selectedTx: item
    }, () => THIS.refs.modalSpeedUpTxs.show())
  }
}

export const onCloseModalSpeedUpTxs = () => {
  return (dispatch) => {
    THIS.refs.modalSpeedUpTxs.hide()
  }
}
