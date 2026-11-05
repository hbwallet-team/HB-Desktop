import { setPendingTx } from 'Backend/Redux/actions/globalActions'
import { convertWeiToBalance, logDebugChatwork, saveTransactionEther, saveTransactionToken } from 'Utils/globalFunction'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import converter from 'hex2dec'
import ReduxServices from 'Utils/globalRedux'
import DexAPI from 'Backend/Api/services/DexAPI'
import swal from 'sweetalert2'
import { sendSpeedUpTxs } from 'Backend/Lib/Web3/index'
import OxObject from 'Backend/Lib/0x/index'
import Observer from 'Utils/HBObserver'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return (dispatch) => {
    try {
      const { selectedTx } = THIS.props
      THIS.setState({
        transactionFee: convertWeiToBalance(converter.hexToDec(selectedTx.rawTransaction.gasPrice) * converter.hexToDec(selectedTx.rawTransaction.gasLimit)),
        gasInput: convertWeiToBalance(converter.hexToDec(selectedTx.rawTransaction.gasPrice), 9),
        gasLimit: converter.hexToDec(selectedTx.rawTransaction.gasLimit)
      })
    } catch (err) {
      logDebugChatwork('HBSpeedUpTxs loadingInitial', err)
    }
  }
}

export const handleChangeGasPrice = (res) => {
  return (dispatch) => {
    THIS.setState({
      gasInput: res.gasInput,
      transactionFee: res.transactionFee
    })
  }
}

export const sendAction = () => {
  return (dispatch) => {
    try {
      const { selectedTx, t } = THIS.props
      const { gasInput, isLoadingExcute } = THIS.state
      if (isLoadingExcute) return
      THIS.setState({ 
        isLoadingExcute: true 
      }, () => {
        sendSpeedUpTxs(selectedTx.account.privateKey, selectedTx.rawTransaction, selectedTx.hash, gasInput)
          .then(result => {
            THIS.setState({ isLoadingExcute: false })
            THIS.props.onCloseModal()
            DexAPI.triggerGetEtherTransactions(selectedTx.account.address)
            ReduxServices.trackingTransaction(selectedTx.account, result.txID, selectedTx.account.address, selectedTx.receiver, selectedTx.amount, result.rawTransaction, selectedTx.selectedToken, selectedTx.note, selectedTx.gameItem)
            dispatch(setPendingTx({account: selectedTx.account, isPending: true, lastTxID: result.txID}))
            THIS.props.updateDataAfterSendSpeedUpTxs(selectedTx)
          })
          .catch((error) => {
            console.log('sendTxs error: ', error)
            swal({
              width: '250px',
              text: t('Dapps.sendingError'),
              type: 'error',
              showConfirmButton: false
            })
            THIS.setState({ isLoadingExcute: false })
            THIS.props.onCloseModal()
          })
      })
    } catch (err) {
      THIS.setState({ isLoadingExcute: false })
      logDebugChatwork('sendAction', err)
    }
  }
}

export const updateDataAfterSendSpeedUpTxs = (trackingTx) => {
  return async (dispatch, getState) => {
    try {
      const { pendingTx } = getState()
      console.log('awaitTransactionSuccessAsync: ', pendingTx.lastTxID)
      // update status of tracking transanction to pending
      setTimeout(() => {
        ReduxServices.clearTrackingTxs(pendingTx.lastTxID)
      }, 5000)

      // waiting transaction in ethereum network
      const txReceipt = await OxObject.awaitTransactionSuccessAsync(pendingTx.lastTxID)
      console.log('txReceipt: ', txReceipt, txReceipt.logs)

      // update pending status
      pendingTx.isPending = false
      dispatch(setPendingTx(pendingTx))

      // store new transaction into DB
      if (trackingTx.selectedToken) {
        saveTransactionToken(pendingTx.account, txReceipt)
      } else {
        saveTransactionEther(pendingTx.account, txReceipt)
      }

      if (txReceipt && txReceipt.status === 1) { // transaction successfully

        const { arrCardData } = getState()

        // update transaction history
        await ReduxServices.refreshEtherTxsHistory(pendingTx.account)

        // update transaction history for all account
        await ReduxServices.refreshEtherTxsHistoryAll(arrCardData.filter(card => card.isEnable), false)

        // refresh history
        Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY_ALL)
        Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY)

        // update card balance
        ReduxServices.refreshCardBalance(arrCardData)
      } else { // transaction failed
        ReduxServices.clearTrackingTxs()
      }
    } catch (err) {
      logDebugChatwork('updateDataAfterSendSpeedUpTxs', err)
    }
  }
}
