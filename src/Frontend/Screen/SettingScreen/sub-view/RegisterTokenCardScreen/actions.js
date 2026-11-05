import { reset } from 'redux-form'
import OxObject from 'Backend/Lib/0x/index'
import DexAPI from 'Backend/Api/services/DexAPI'
import EtherGas from 'Backend/Api/services/EtherGas'
import swal from 'sweetalert2'
import EtherLibrary from 'Backend/HBLibrary/EtherLibrary'
import Settings from 'Backend/settings'
import { setPendingTx, setScreenConfig } from 'Backend/Redux/actions/globalActions'
import { OBSERVER_KEY, HBWALLET } from 'Utils/globalConstants'
import Observer from 'Utils/HBObserver'
import { getHBTokens, getRealBoostTokens } from 'Backend/Redux/actionSaga/sagaActions'
import { convertWeiToBalance, convertBalanceToWei, filterMainAccount, saveTransactionEther } from 'Utils/globalFunction'
import { getTokenBalance, sendEthTokenTxs } from 'Backend/Lib/Web3/index'
import ReduxServices from 'Utils/globalRedux'

let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    const { gasLimit } = THIS.state
    if (internetData) {
      // fetch gas price from etherscan
      let gas = await EtherGas.getGasPrice()
      if (gas && gas.fast) {
        THIS.setState({
          gasPrice: gas,
          valueInputGas: gas.fast,
          transactionFee: convertWeiToBalance(convertBalanceToWei(gas.fast, 9) * gasLimit)
        })
      }
    }
  }
}

export const fetchRegistrationFee = () => {
  return async (dispatch, getState) => {
    const { internetData, screenConfig } = THIS.props
    const { etherPrice } = THIS.state
    if (internetData) {
      let fee = await DexAPI.getTokenCardRegistrationFee()
      if (fee && fee.value) {
        THIS.setState({
          holdingTokenUsd: fee.value.hold_usd_amount,
          receiverAddress: fee.value.receiver_address,
          registrationFeeUsd: fee.value.registration_fee,
          registrationFee: Number(fee.value.registration_fee / etherPrice).toFixed(8)
        }, () => {
          screenConfig['register_token_card'] = fee.value
          dispatch(setScreenConfig(screenConfig))
        })
      } else if (screenConfig['register_token_card']) {
        THIS.setState({
          holdingTokenUsd: screenConfig['register_token_card'].hold_usd_amount,
          receiverAddress: screenConfig['register_token_card'].receiver_address,
          registrationFeeUsd: screenConfig['register_token_card'].registration_fee,
          registrationFee: Number(screenConfig['register_token_card'].registration_fee / etherPrice).toFixed(8)
        })
      }
    }
  }
}

export const fetchTokenPrice = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    const { etherPrice } = THIS.state
    if (internetData) {
      let token = await DexAPI.getTokenDataWithChart(HBWALLET)
      if (token && token.data) {
        THIS.setState({
          tokenPrice: Math.abs(token.data.lastPrice.price) * etherPrice
        })
      }
    }
  }
}

export const fetchTokenBalance = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      let balance = await getTokenBalance(HBWALLET, mainAccount.address, 2)
      if (balance) {
        THIS.setState({
          tokenBalance: balance
        })
      }
    }
  }
}

export const handleSubmit = (values) => {
  return (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const { tokenBalance, registrationFee, transactionFee, paymentType } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    // save form data into state avarible
    THIS.setState({
      formData: values
    })
    if (paymentType === 'ETH') {
      THIS.setState({
        totalFee: Number(registrationFee) + Number(transactionFee), // ether + transaction fee
        sufficientTokenBalance: true,
        sufficientEtherBalance: Number(mainAccount.balance) >= Number(registrationFee) + Number(transactionFee) // check ether balance is enough or not
      }, () => {
        // display confirm transactopn popup
        THIS.refs.md_exs_gas.show()
        THIS.setState({
          cardPreview:''
        })
      })
    } else {
      THIS.setState({
        totalFee: transactionFee,
        sufficientTokenBalance: Number(tokenBalance) >= Number(registrationFee) // check token balance is enough or not
      }, () => {
        // display confirm transactopn popup
        THIS.refs.md_exs_gas.show()
        THIS.setState({
          cardPreview:''
        })
      })
    }
  }
}

export const handleChangePaymentType = (value) => {
  return async (dispatch, getState) => {
    const { registrationFeeUsd, valueInputGas, etherPrice, tokenPrice } = THIS.state
    THIS.setState({
      paymentType: value
    })
    if (value === 'ETH') {
      THIS.setState({
        gasLimit: Settings.gas.externalFee,
        transactionFee: convertWeiToBalance(convertBalanceToWei(valueInputGas, 9) * Settings.gas.externalFee),
        registrationFee: Number(registrationFeeUsd / etherPrice).toFixed(8)
      })
    } else {
      THIS.setState({
        gasLimit: Settings.gas.externalLargeFeeToken,
        transactionFee: convertWeiToBalance(convertBalanceToWei(valueInputGas, 9) * Settings.gas.externalLargeFeeToken),
        registrationFee: Number(0.5 * (registrationFeeUsd / tokenPrice)).toFixed(2) // discount 50% for HBWALLET token
      })
    }
  }
}

export const handleChangeGasPrice = (res) => {
  return (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const { paymentType, registrationFee, gasLimit, tokenBalance } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    THIS.setState({
      valueInputGas: res.gasInput,
      transactionFee: res.transactionFee
    })
    if (paymentType === 'ETH') {
      THIS.setState({
        totalFee: Number(registrationFee) + Number(convertWeiToBalance(convertBalanceToWei(res.gasInput, 9) * gasLimit)), // ether + transaction fee,
        sufficientTokenBalance: true,
        sufficientEtherBalance: Number(mainAccount.balance) >= Number(registrationFee) + Number(convertWeiToBalance(convertBalanceToWei(res.gasInput, 9) * gasLimit)) // check ether balance is enough or not
      })
    } else {
      THIS.setState({
        totalFee: convertWeiToBalance(convertBalanceToWei(res.gasInput, 9) * gasLimit),
        sufficientTokenBalance: Number(tokenBalance) >= Number(registrationFee), // check token balance is enough or not
        sufficientEtherBalance: Number(mainAccount.balance) >= Number(convertWeiToBalance(convertBalanceToWei(res.gasInput, 9) * gasLimit)) // check ether balance is enough or not
      })
    }
  }
}

export const sendAction = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData, t, txtReceiveAddr, txtSendAmount } = THIS.props
    const { receiverAddress, registrationFee, valueInputGas, paymentType } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      THIS.setState({ 
        isLoadingExcute: true 
      })
      if (paymentType === 'ETH') { // case of payment by ETH
        sendEthTokenTxs(mainAccount.privateKey, receiverAddress, registrationFee, null, valueInputGas)
          .then((result) => {
            swal({
              width: '320px',
              text: t('ItMayTakeAFewMomentsToProcess'),
              type: 'info',
              timer: 3000,
              showConfirmButton: false
            })
            THIS.setState({ isLoadingExcute: false })
            THIS.refs.md_exs_gas.hide()
            DexAPI.triggerGetEtherTransactions(mainAccount.address)
            ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, txtReceiveAddr, txtSendAmount, result.rawTransaction, null)
            dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: result.txID}))
            Observer.emit(OBSERVER_KEY.GET_DATA_AFTER_REGISTER_TOKEN_CARD)
            // reset form data
            dispatch(reset('registerTokenCard'))
          }).catch((error) => {
            console.log('sendTxs error: ', error)
            swal({
              width: '250px',
              text: t('SendEtherError'),
              type: 'error',
              showConfirmButton: false
            })
            THIS.setState({ isLoadingExcute: false })
            THIS.refs.md_exs_gas.hide()
          })
      } else { // case of payment by HBWALLET token
        const contract = {
          address: HBWALLET,
          decimal: 2,
          name: 'HB Wallet Infinity Token',
          symbol: 'HBWALLET'
        }
        sendEthTokenTxs(mainAccount.privateKey, receiverAddress, registrationFee, contract, valueInputGas)
          .then((result) => {
            swal({
              width: '320px',
              text: t('ItMayTakeAFewMomentsToProcess'),
              type: 'info',
              timer: 3000,
              showConfirmButton: false
            })
  
            THIS.setState({ isLoadingExcute: false })
            THIS.refs.md_exs_gas.hide()
            DexAPI.triggerGetEtherTransactions(mainAccount.address)
            ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, txtReceiveAddr, txtSendAmount, result.rawTransaction, contract)
            dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: result.txID}))
            Observer.emit(OBSERVER_KEY.GET_DATA_AFTER_REGISTER_TOKEN_CARD)
            // reset form data
            dispatch(reset('registerTokenCard'))
          }).catch((error) => {
            console.log('sendTxs error: ', error)
            swal({
              width: '250px',
              text: t('sendTokenNameError', {tokenName: 'HBWALLET'}),
              type: 'error',
              showConfirmButton: false
            })
            THIS.setState({ isLoadingExcute: false })
            THIS.refs.md_exs_gas.hide()
          })
      }
    } else {
      THIS.setState({ isLoadingExcute: false })
    }
  }
}

export const updateDataAfterRegisterTokenCard = () => {
  return async (dispatch, getState) => {
    const { formData } = THIS.state 
    const { internetData, arrCardData, pendingTx, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    console.log('awaitTransactionSuccessAsync: ', pendingTx.lastTxID)
    // update status of tracking transanction to pending
    setTimeout(() => {
      ReduxServices.clearTrackingTxs(pendingTx.lastTxID)
    }, 5000)

    if (internetData) {
      // insert/update token data into dynamicDB
      let tokenDB = await DexAPI.getSingleTokenDB(formData.name)
      console.log('tokenDB', tokenDB)
      if (tokenDB && tokenDB.data && tokenDB.data.Item && tokenDB.data.Item.card_file_path.length <= 0) {
        let tokenData = {
          tokenName: formData.name,
          iconFilePath: formData.iconImage ? formData.iconImage : '',
          cardFilePath: formData.cardImage,
          displayFlag: '0',
          tx: pendingTx.lastTxID,
          clientAddress: mainAccount.address
        }
        let res = await DexAPI.updateTokenDB(tokenData)
        console.log(res)
      } else {
        let tokenData = {
          contractAddress: formData.address,
          tokenName: formData.name,
          symbol: formData.symbol,
          decimals: formData.decimals,
          iconFilePath: formData.iconImage ? formData.iconImage : '',
          cardFilePath: formData.cardImage,
          id: '', 
          displayFlag: '0',
          urlHomePage: '',
          tx: pendingTx.lastTxID,
          clientAddress: mainAccount.address
        }
        let res = await DexAPI.insertTokenDB(tokenData)
        console.log(res)
      }
      // waiting transaction
      const txReceipt = await OxObject.awaitTransactionSuccessAsync(pendingTx.lastTxID)
      console.log('txReceipt: ', txReceipt, txReceipt.logs)

      // update pending status
      pendingTx.isPending = false
      dispatch(setPendingTx(pendingTx))

      if (txReceipt && txReceipt.status === 1) { // transaction successfully
        
        // store new transaction into DB
        saveTransactionEther(pendingTx.account, txReceipt)

        // show popup
        swal({
          width: '250px',
          text: t('registerTokenCardSuccessfully'),
          type: 'success',
          timer: 5000,
          showConfirmButton: false
        })
        // update display flag 
        let tokenData = {
          tokenName: formData.name,
          displayFlag: '1'
        }
        let res = await DexAPI.updateTokenDB(tokenData)
        console.log(res)
        // fetch HB tokens
        dispatch(getHBTokens())
        // dispatch(getRealBoostTokens())
      } else { // transaction failed
        // show popup
        swal({
          width: '350px',
          text: t('transactionFailed'),
          type: 'error',
          showConfirmButton: false
        })
        ReduxServices.clearTrackingTxs()
      }
    }
  }
}
