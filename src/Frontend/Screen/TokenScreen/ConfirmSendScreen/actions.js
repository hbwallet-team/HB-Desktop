
import swal from 'sweetalert2'
import ReduxServices from 'Utils/globalRedux'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import { filterMainAccount, logDebugChatwork } from 'Utils/globalFunction'
import { setPendingTx } from 'Backend/Redux/actions/globalActions'
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

export const sendAction = (value) => {
  return async (dispatch, getState) => {
    try {
      const {
        internetData, cardSelected, t,
        txtReceiveAddr, txtSendAmount, gasInput, arrCardData
      } = THIS.props
      const mainAccount = filterMainAccount(arrCardData)
      THIS.setState({ isLoadingExcute: true })
  
      if (internetData) {
        sendEthTokenTxs(mainAccount.privateKey, txtReceiveAddr, txtSendAmount, cardSelected, gasInput)
          .then((result) => {
            DexAPI.triggerGetEtherTransactions(cardSelected.address)
            ReduxServices.trackingTransaction(mainAccount, result.txID, cardSelected.address, txtReceiveAddr, txtSendAmount, result.rawTransaction, cardSelected)
            THIS.setState({ isLoadingExcute: false })
            dispatch(setPendingTx({account: mainAccount, token: cardSelected, isPending: true, lastTxID: result.txID}))
            Observer.emit(OBSERVER_KEY.GET_DATA_AFTER_SEND_TOKEN)
            Observer.emit(OBSERVER_KEY.SELECT_TAB_ETHER)
          }).catch((error) => {
            console.log('sendTxs error: ', error)
            swal({
              width: '250px',
              text: t('sendTokenNameError', {tokenName: cardSelected.symbol}),
              type: 'error',
              showConfirmButton: false
            })
            THIS.setState({ isLoadingExcute: false })
          })
      } else {
        THIS.setState({ isLoadingExcute: false })
      }
    } catch (err) {
      THIS.setState({ isLoadingExcute: false })
      logDebugChatwork('sendTokenNameError', err)
    }
  }
}
