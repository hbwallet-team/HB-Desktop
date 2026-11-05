
import swal from 'sweetalert2'
import { setPendingTx } from 'Backend/Redux/actions/globalActions'
import ReduxServices from 'Utils/globalRedux'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import { logDebugChatwork } from 'Utils/globalFunction'
import Observer from 'Utils/HBObserver'
import { sendEthTokenTxs } from 'Backend/Lib/Web3/index'
import DexAPI from 'Backend/Api/services/DexAPI'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const cancelAction = (that) => {
  return (dispatch, getState) => {
    that.refs.modalConfirmSendScreen.hide()
  }
}

export const sendAction = (that) => {
  return async (dispatch, getState) => {
    try {
      const { internetData, cardSelected, txtReceiveAddr, txtSendAmount, onBack, t, gasInput } = THIS.props
      THIS.setState({ isLoadingExcute: true })
      if (internetData) {
        sendEthTokenTxs(cardSelected.privateKey, txtReceiveAddr, txtSendAmount, null, gasInput)
          .then((result) => {
            DexAPI.triggerGetEtherTransactions(cardSelected.address)
            ReduxServices.trackingTransaction(cardSelected, result.txID, cardSelected.address, txtReceiveAddr, txtSendAmount, result.rawTransaction, null)
            THIS.setState({ isLoadingExcute: false })
            dispatch(setPendingTx({account: cardSelected, isPending: true, lastTxID: result.txID}))
            Observer.emit(OBSERVER_KEY.GET_DATA_AFTER_SEND_ETH)
            onBack()
          }).catch((error) => {
            console.log('sendTxs error: ', error)
            swal({
              width: '250px',
              text: t('SendEtherError'),
              type: 'error',
              showConfirmButton: false
            })
            THIS.setState({ isLoadingExcute: false })
            that.refs.modalConfirmSendScreen.hide()
          })
      } else {
        THIS.setState({ isLoadingExcute: false })
      }
    } catch (err) {
      THIS.setState({ isLoadingExcute: false })
      logDebugChatwork('SendEtherError', err)
    }
  }
}
