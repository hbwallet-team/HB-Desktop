import DexAPI from 'Backend/Api/services/DexAPI'
import NagemonAPI from 'Backend/Api/services/NagemonAPI'
import OxObject from 'Backend/Lib/0x/index'
import ReduxServices from 'Utils/globalRedux'
import { filterMainAccount, convertWeiToBalance, convertBalanceToWei, formatNumber, roundingNumber, validateAddress, validateNumber, countDots, checkIsOnSell, showNotification, openBrowserInNewTab } from 'Utils/globalFunction'
import { getTokenBalance, getGameInfo, getHighlightFee, sendDirectGameItem, getPriceGameItem, setPriceGameItem, removePriceGameItem, buyGameItem, getGameFees, getPercentEthFee, getHBExchangeETH, getETHBalance, getOwnerOfGameItem, calPriceFeeEth, calPriceFeeHBWALLET, getItemsByTokenOwner, getCdaiKachiage } from 'Backend/Lib/Web3/index'
import { OBSERVER_KEY, HBWALLET, REQUEST_STATUS, arrCryptoCurrency } from 'Utils/globalConstants'
import { setPendingTx, setDappAssets, setDexSelectedPair, setDappMarket } from 'Backend/Redux/actions/globalActions'
import swal from 'sweetalert2'
import Observer from 'Utils/HBObserver'
const bufferSend = 0.002

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { selectedItem, arrCardData, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    const gameItemDetail = await NagemonAPI.getInventoryDetail(selectedItem.address, selectedItem.id, mainAccount.address)
    const priceGameInfo = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
    if (gameItemDetail && !gameItemDetail.error && priceGameInfo['_crypto']) {
      const arrPriceInfo = [
        { 
          key: '1',
          name: t('Dapps.highTrading'),
          value: formatPriceNum(gameItemDetail[priceGameInfo['_crypto'].includes('ETH') ? 'maxPrice' : 'tusdMaxPrice']),
          fiatValue: formatNumFiat(gameItemDetail[priceGameInfo['_crypto'].includes('ETH') ? 'maxPrice' : 'tusdMaxPrice'])
        },
        { 
          key: '2',
          name: t('Dapps.lowTrading'),
          value: formatPriceNum(gameItemDetail[priceGameInfo['_crypto'].includes('ETH') ? 'minPrice' : 'tusdMinPrice']),
          fiatValue: formatNumFiat(gameItemDetail[priceGameInfo['_crypto'].includes('ETH') ? 'minPrice' : 'tusdMinPrice'])
        },
        { 
          key: '3',
          name: t('Dapps.averateTrading'),
          value: formatPriceNum(gameItemDetail[priceGameInfo['_crypto'].includes('ETH') ? 'avgPrice' : 'tusdAvgPrice']),
          fiatValue: formatNumFiat(gameItemDetail[priceGameInfo['_crypto'].includes('ETH') ? 'avgPrice' : 'tusdAvgPrice'])
        },
        { 
          key: '4',
          name: t('Dapps.lastTrading'),
          value: formatPriceNum(gameItemDetail[priceGameInfo['_crypto'].includes('ETH') ? 'lastPrice' : 'tusdLastPrice']),
          fiatValue: formatNumFiat(gameItemDetail[priceGameInfo['_crypto'].includes('ETH') ? 'lastPrice' : 'tusdLastPrice'])
        }
      ]
      THIS.setState({
        isLoading: false,
        arrPriceInfo,
        gameItemDetail
      })
    } else {
      THIS.setState({
        isLoading: false
      })
    }
  }
}

const formatNumFiat = (price) => {
  return price && price !== '-' ? formatNumber(price * THIS.fRate, 6) : '-'
}

const formatPriceNum = (price) => {
  return price && price !== '-' ? formatNumber(price) : '-'
}

export const fetchPriceGame = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData, arrDappAssets, selectedItem } = THIS.props
    const { gasPrice, gasLimit } = THIS.state
    
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      let balance
      const priceGame = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
      const selectedCoin = arrCryptoCurrency.find(e => e.value.includes(priceGame._crypto))
      if (priceGame._crypto.includes('ETH')) {
        balance = await getETHBalance(mainAccount.address)
      } else {
        balance = await getTokenBalance(selectedCoin.address, mainAccount.address, selectedCoin.decimals)
      }
      const ownerAddress = await getOwnerOfGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
      const isOwner = ownerAddress.toLowerCase() === mainAccount.address.toLowerCase()
      const isOnSell = Number(priceGame._Price) > 0
      if (isOnSell) {
        THIS.setState({ 
          isOwner,
          isOnSell, 
          isCheckSell: isOnSell, 
          selectedCurrency: priceGame._crypto,
          selectedCoin,
          priceGame: priceGame._Price ? convertWeiToBalance(priceGame._Price) : 0,
          sentComissionFee: priceGame._fee ? convertWeiToBalance(priceGame._fee) : 0,
          transactionFee: convertWeiToBalance(convertBalanceToWei(gasPrice.slow + 5, 9) * gasLimit),
          sufficientEtherBalance: balance - roundingNumber(convertWeiToBalance(priceGame._Price)) >= 0
        }, () => {
          THIS.props.fetchBalance()
        })
      }
    }
    if (selectedItem.isSync === false) {
      let index = arrDappAssets.findIndex(itm => itm.id === selectedItem.id)
      if (index !== -1) {
        arrDappAssets[index].isSync = true
        dispatch(setDappAssets(arrDappAssets))
        ReduxServices.refreshTotalSync()
      }
    }
  }
}

export const fetchBalance = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData, arrCurrencyData, etherPrice } = THIS.props
    const { selectedCoin } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    THIS.setState({
      isLoadingSpendable: true
    })
    if (internetData) {
      if (selectedCoin.symbol === 'ETH') {
        THIS.fRate = etherPrice.price
        THIS.fWalletBalance = await getETHBalance(mainAccount.address)
      } else {
        const coinInfo = await DexAPI.getCoinInfo(selectedCoin.symbol, arrCurrencyData, selectedCoin.id, selectedCoin.name)
        if (coinInfo && !coinInfo.error) {
          THIS.fRate = coinInfo.priceCurrency
        }
        THIS.fTokenBalance = await getTokenBalance(selectedCoin.address, mainAccount.address, selectedCoin.decimals)
      }
      THIS.setState({
        isLoadingSpendable: false
      })
    } else {
      THIS.setState({
        isLoadingSpendable: false
      })
    }
  }
}

export const fetchHBTokenBalance = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      THIS.fHBTokenBalance = await getTokenBalance(HBWALLET, mainAccount.address, 2)
    }
  }
}

export const fetchTrueUSDPrice = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCurrencyData } = THIS.props
    if (internetData) {
      let tusdPrice = await DexAPI.getCoinInfo('TUSD', arrCurrencyData, 2563, 'TrueUSD')
      if (tusdPrice && !tusdPrice.error) {
        THIS.trueUSDPrice = tusdPrice.priceCurrency
      }
    }
  }
}

export const fetchDaiUSDPrice = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCurrencyData } = THIS.props
    if (internetData) {
      let daiPrice = await DexAPI.getCoinInfo('DAI', arrCurrencyData, 2308, 'Dai')
      if (daiPrice && !daiPrice.error) {
        THIS.daiPrice = daiPrice.priceCurrency
      }
    }
  }
}

export const fetchCommissionFee = () => {
  return async (dispatch) => {
    const { internetData, selectedItem } = THIS.props
    const { selectedCoin, selectedCurrency } = THIS.state
    if (internetData) {
      let gameInfo = await getGameInfo(selectedItem.address, selectedItem.businessAddress, selectedCoin.value)
      if (gameInfo && gameInfo.data && gameInfo.address) {
        let highlightFee = await getHighlightFee(gameInfo.address)
        THIS.setState({
          gameInfo,
          highlightFee,
          limitFeeTxs: convertWeiToBalance(gameInfo.data.limitFee),
          feeCommissionRate: gameInfo.data.Fee / 1000,
          limitHBForSale: convertWeiToBalance(gameInfo.data.limitHBWALLETForDiscount, 2),
          percentDiscount: gameInfo.data.PercenDiscountOnHBWallet / 10
        })
      }
    }
  }
}

export const fetchCdaiKachiage = () => {
  return async (dispatch) => {
    const { screenConfig, selectedItem } = THIS.props
    if (screenConfig.dapp && screenConfig.dapp.kachiage_card_list && screenConfig.dapp.kachiage_card_list.includes(selectedItem.address)) {
      const numDai = await getCdaiKachiage(screenConfig.dapp.kachiage_address, selectedItem.address, selectedItem.id, true)
      THIS.setState({
        numDai
      })
    }
  }
}

export const checkIsRequestItem = () => {
  return async (dispatch, getState) => {
    const { internetData, selectedItem, arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      let requestFind = await DexAPI.getSingleRequestGame(mainAccount.address, selectedItem.symbol, selectedItem.id)
      if (requestFind && requestFind.data && requestFind.data.length > 0) {
        THIS.setState({
          isSentRequest: true
        })
      }
    }
  }
}

export const checkInStore = () => {
  return async (dispatch, getState) => {
    const { internetData, selectedItem, screenConfig } = THIS.props
    if (internetData) {
      const listCardBlockChain = screenConfig.dapp.blockchain_card_list
      const isSpecial = listCardBlockChain.includes(selectedItem.address)
      let gameItem = isSpecial ? false : await NagemonAPI.checkGameItemInStore(selectedItem.address, selectedItem.id)
      if (gameItem && gameItem.existed) {
        THIS.setState({
          isOnStore: gameItem.existed
        })
      }
    }
  }
}

export const handleSendDirectAddress = () => {
  return (dispatch, getState) => {
    const { gasPrice, gasLimit } = THIS.state
    let transactionFee = convertWeiToBalance(convertBalanceToWei(gasPrice.slow + 5, 9) * gasLimit)
    THIS.setState({
      strSearchAccount: '',
      strReceiverAddr: '',
      isSendDirect: true,
      isActiveSend: false,
      isAgreeTermsOfServices: true,
      isReceiverErr: false,
      isSendAmountErr: false,
      gasInput: gasPrice.slow + 5,
      transactionFee,
      sufficientEtherBalance: THIS.fWalletBalance - roundingNumber(transactionFee) >= 0 // check ether balance is enough or not
    }, () => {
      THIS.refs.md_send_direct_address.show()
    })
  }
}

export const onCloseSendDirectModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_send_direct_address.hide()
  }
}

export const onChangeReceiverAddr = (newAddress) => {
  return (dispatch, getState) => {
    handleValidateAddr(newAddress)
  }
}

export const openAddressBook = () => {
  return (dispatch, getState) => {
    THIS.setState({ 
      strSearchAccount: '',
      isReceiverErr: false
    }, () => {
      THIS.refs.modalAccountBook.show()
    })
  }
}

export const searchAccountBook = (strSearch) => {
  return (dispatch, getState) => {
    THIS.setState({
      strSearchAccount: strSearch
    })
  }
}

export const selectAccountBook = (item) => {
  return (dispatch, getState) => {
    THIS.setState({
      strReceiverAddr: item.address
    }, () => {
      THIS.refs.modalAccountBook.hide()
      handleValidateAddr(item.address)
    })
  }
}

const handleValidateAddr = async (newAddress) => {
  const { strReceiverAddr, isViaSmartContract } = THIS.state
  const { arrCardData } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)
  // Check valid format address ethereum
  if (!validateAddress(newAddress)) {
    // Clear data and error when no input
    if (newAddress.length === 0) {
      THIS.setState({
        isActiveSend: false,
        isReceiverErr: false,
        isNotExistAccount: false,
        isSameAccount: false,
        strReceiverAddr: ''
      })
    } else {
      // remove input when error
      THIS.setState({ 
        strReceiverAddr
      }, () => checkOpenSending())
    }
  } else {
    if ((newAddress.startsWith('0x') && newAddress.length === 42)) {
      // Final success checking
      if (isViaSmartContract) {
        if (newAddress.toLowerCase() === mainAccount.address.toLowerCase()) {
          THIS.setState({ 
            strReceiverAddr: newAddress, 
            isReceiverErr: true,
            isSameAccount: true
          }, () => checkOpenSending())
        } else {
          THIS.setState({ 
            strReceiverAddr: newAddress, 
            isReceiverErr: false,
            isSameAccount: false
          }, () => checkOpenSending())
        }
      } else {
        THIS.setState({ 
          strReceiverAddr: newAddress, 
          isReceiverErr: false,
          isSameAccount: false
        }, () => checkOpenSending())
      }
      // } else {
      //   let user = await DexAPI.getUserInfo(newAddress)
      //   if (user && user.address) {
      //     THIS.setState({ 
      //       strReceiverAddr: newAddress, 
      //       isReceiverErr: false
      //     }, () => checkOpenSending())
      //   } else {
      //     THIS.setState({ 
      //       strReceiverAddr: newAddress, 
      //       isReceiverErr: true,
      //       isNotExistAccount: true
      //     })
      //   }
      // }
    } else {
      // Final fail checking
      THIS.setState({
        strReceiverAddr: newAddress,
        isReceiverErr: true,
        isNotExistAccount: false,
        isSameAccount: false,
        isActiveSend: false
      })
    }
  }
}

const checkOpenSending = () => {
  const { isReceiverErr, isSendAmountErr, isSendToAnotherUser, strReceiverAddr, strSendAmount, sufficientEtherBalance, isAgreeTermsOfServices, isViaSmartContract, isBuyAsset, isSendDirect, isChangePrice, priceGame } = THIS.state
  if (isSendDirect) { // case of send direct address
    if (!isReceiverErr && sufficientEtherBalance && isAgreeTermsOfServices && strReceiverAddr.length > 0) {
      THIS.setState({ isActiveSend: true })
    } else {
      THIS.setState({ isActiveSend: false })
    }
  } else if (isChangePrice) { // case of buy asset item
    if (!isSendAmountErr && sufficientEtherBalance && isAgreeTermsOfServices && strSendAmount.length > 0 && Number(strSendAmount) !== Number(priceGame)) {
      THIS.setState({ isActiveSend: true })
    } else {
      THIS.setState({ isActiveSend: false })
    }
  } else if (isBuyAsset) { // case of buy asset item
    if (sufficientEtherBalance && isAgreeTermsOfServices) {
      THIS.setState({ isActiveSend: true })
    } else {
      THIS.setState({ isActiveSend: false })
    }
  } else if (isViaSmartContract) { // case of send asset item via smart contract
    if (!isReceiverErr && !isSendAmountErr && sufficientEtherBalance && isAgreeTermsOfServices && strReceiverAddr.length > 0 && strSendAmount.length > 0) {
      THIS.setState({ isActiveSend: true })
    } else {
      THIS.setState({ isActiveSend: false })
    }
  } else if (isSendToAnotherUser) { // case of send asset item to another user
    if (!isReceiverErr && strReceiverAddr.length > 0) {
      THIS.setState({ isActiveSend: true })
    } else {
      THIS.setState({ isActiveSend: false })
    }
  } else { // case of sell asset item
    if (!isSendAmountErr && sufficientEtherBalance && isAgreeTermsOfServices && strSendAmount.length > 0) {
      THIS.setState({ isActiveSend: true })
    } else {
      THIS.setState({ isActiveSend: false })
    }
  }
}

export const handleChangeGasPrice = (res) => {
  return (dispatch, getState) => {
    const { strReceiverAddr } = THIS.state
    THIS.setState({
      gasInput: res.gasInput,
      transactionFee: res.transactionFee,
      sufficientEtherBalance: THIS.fWalletBalance - roundingNumber(res.transactionFee) >= 0 // check ether balance is enough or not
    }, () => handleValidateAddr(strReceiverAddr))
  }
}

export const handleChangeGasPriceBuyAsset = (res) => {
  return (dispatch, getState) => {
    THIS.setState({
      gasInput: res.gasInput,
      transactionFee: res.transactionFee,
      sufficientEtherBalance: THIS.fWalletBalance - roundingNumber(res.transactionFee) >= 0 // check ether balance is enough or not
    }, () => checkOpenSending())
  }
}

export const sendDirectAddress = () => {
  return (dispatch, getState) => {
    const { arrCardData, arrDappAssets, selectedItem, t } = THIS.props
    const { strReceiverAddr, gasInput, isActiveSend } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (!isActiveSend) {
      return
    }
    THIS.setState({
      isActiveSend: false,
      isSending: true
    }, () => {
      sendDirectGameItem(mainAccount.privateKey, mainAccount.address, strReceiverAddr, selectedItem.id, selectedItem.address, gasInput, selectedItem.isTransferFrom)
        .then((result) => {
          console.log('sendDirectAddress', result)
          THIS.refs.md_send_direct_address.hide()
          swal({
            width: '250px',
            text: t('Dapps.sendAssetSuccess'),
            type: 'success',
            timer: 5000,
            showConfirmButton: false
          })
          DexAPI.triggerGetEtherTransactions(mainAccount.address)
          DexAPI.postGameTxsHistory(result.txID, selectedItem.id.toString(), selectedItem.symbol, mainAccount.address, strReceiverAddr)
          ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, selectedItem.address.toLowerCase(), 0, result.rawTransaction, null, 'sending', selectedItem)
          dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: result.txID}))
          THIS.props.updateDataAfterSendDirectAsset(selectedItem, result.txID)
          let index = arrDappAssets.findIndex(e => e.id === selectedItem.id && e.symbol.toLowerCase() === selectedItem.symbol.toLowerCase())
          if (index !== -1) {
            arrDappAssets[index].isPending = 'sending'
            dispatch(setDappAssets(arrDappAssets))
          }
          THIS.setState({ 
            isSending: false 
          }, () => THIS.props.backToTop())
        })
        .catch((err) => {
          console.log('sendDirectAddress', err)
          THIS.setState({ isSending: false })
          THIS.refs.md_send_direct_address.hide()
          swal({
            width: '250px',
            text: t('gasFeeIsNotEnough2'),
            type: 'error',
            showConfirmButton: false
          })
        })
    })
  }
}

export const updateDataAfterSendDirectAsset = (item, txID) => {
  return async (dispatch, getState) => {
    const { pendingTx } = THIS.props
    console.log('awaitTransactionSuccessAsync: ', txID)
    // update status of tracking transanction to pending
    setTimeout(() => {
      ReduxServices.clearTrackingTxs(txID)
    }, 5000)

    // waiting transaction in ethereum network
    const txReceipt = await OxObject.awaitTransactionSuccessAsync(txID)
    console.log('txReceipt: ', txReceipt, txReceipt.logs)
    // update pending status
    pendingTx.isPending = false
    dispatch(setPendingTx(pendingTx))

    if (txReceipt && txReceipt.status === 1) { // transaction successfully

      const { arrCardData, arrDappAssets } = getState()

      // remove this asset from dapp assets list
      let newArrDappAssets = arrDappAssets.slice()
      newArrDappAssets = newArrDappAssets.filter(e => !(e.id === item.id && e.symbol.toLowerCase() === item.symbol.toLowerCase()))
      dispatch(setDappAssets(newArrDappAssets))

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
  }
}

export const handleSendViaSmartContract = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isViaSmartContract: true,
      isSendDirect: false
    }, () => THIS.refs.md_select_currency.show())
  }
}

export const handleSellOrder = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isViaSmartContract: false,
      isSendDirect: false
    }, () => THIS.refs.md_select_currency.show())
  }
}

export const backToAssetDetail = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isActiveHowToSend: false,
      isActiveSendViaSmartContract: false,
      isViaSmartContract: false,
      isChangePrice: false,
      isSendDirect: false, 
      isSendToAnotherUser: false
    })
  }
}

export const checkBoxNFT = (value) => {
  return (dispatch, getState) => {
    const { strSendAmount } = THIS.state
    THIS.setState({
      isHighlight: value
    }, () => calculateSendAmount(strSendAmount))
  }
}

export const handleNextHowToSend = () => {
  return (dispatch, getState) => {
    const { gasPrice, gasLimit } = THIS.state
    let transactionFee = convertWeiToBalance(convertBalanceToWei(gasPrice.slow + 5, 9) * gasLimit)
    THIS.setState({
      isActiveHowToSend: false,
      isActiveSendViaSmartContract: true,
      strReceiverAddr: '',
      strSearchAccount: '',
      strSendAmount: '',
      strFiatAmount: '',
      isActiveSend: false,
      isAgreeTermsOfServices: false,
      isReceiverErr: false,
      isSendAmountErr: false,
      commissionFee: 0,
      totalPaymentAmount: 0, 
      totalPaymentUSD: 0, 
      transactionFee,
      sufficientEtherBalance: THIS.fWalletBalance - roundingNumber(transactionFee) >= 0 // check ether balance is enough or not
    })
  }
}

export const onCloseSelectCurrencyModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_select_currency.hide()
  }
}

export const onChangeCryptoCurrency = (e) => {
  return (dispatch, getState) => {
    THIS.setState({
      selectedCurrency: e.target.value,
      selectedCoin: arrCryptoCurrency.find(i => i.value.includes(e.target.value))
    })
  }
}

export const openSendAssetSmartContractModal = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isActiveHowToSend: true
    }, () => {
      THIS.refs.md_select_currency.hide()
      THIS.props.fetchCommissionFee()
      THIS.props.fetchBalance()
    })
  }
}

export const onCloseSendAssetSmartContracModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_send_smart_contract.hide()
    THIS.setState({
      strReceiverAddr: '',
      strSendAmount: '',
      strFiatAmount: '',
      strMessage: '',
      isSendAmountErr: false,
      sufficientEtherBalance: true,
      isReceiverErr: false,
      isAgreeTermsOfServices: false,
      isActiveSend: false
    })
  }
}

export const onChangePaymentType = (newType) => {
  return (dispatch, getState) => {
    const { strSendAmount } = THIS.state
    THIS.setState({
      paymentType: newType,
      showBuyHBtoken: newType === 'HBWALLET'
    }, () => {
      calculateSendAmount(strSendAmount)
    })
  }
}

export const onChangeEthereumAmount = (newAmount) => {
  return (dispatch, getState) => {
    calculateSendAmount(newAmount)
  }
}

export const onChangeCurrencyAmount = (newMoney) => {
  return (dispatch, getState) => {
    // Check format number only
    if (!validateNumber(newMoney)) {
      // Clear data and error when no input
      if (newMoney.length === 0) {
        THIS.setState({ 
          isDisableSend: true, 
          isSendAmountErr: false, 
          strSendAmount: '', 
          strFiatAmount: '', 
          commissionFee: 0, 
          totalPaymentAmount: 0, 
          totalPaymentUSD: 0 
        }, () => checkOpenSending())
      }
    } else {
      // Check clear first dots
      if (newMoney.toString() !== '.') {
        let dotsCount = countDots(newMoney, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let isError = false
          let decimalCount = newMoney.length - newMoney.indexOf('.') - 1

          if (dotsCount === 1 && decimalCount > 2) {
            // Check if money decimal greater than 2
            isError = true
          }
          if (!isError) {
            // Convert to token amount format based on token Decimal
            let sendAmount = (Number(newMoney) / THIS.fRate).toFixed(8)

            calculateSendAmount(sendAmount, newMoney)
          }
        }
      }
    }
  }
}

export const getCommisionFee = () => {
  return (dispatch) => {
    const { limitHBForSale, feeCommissionRate, percentDiscount, selectedCurrency } = THIS.state
    const isDiscount = THIS.fHBTokenBalance >= limitHBForSale
    return isDiscount ? percentDiscount / 100 : feeCommissionRate
  }
}

const calculateSendAmount = async (newAmount, newMoneyAmount) => {
  const { isChangePrice, highlightFee, isHighlight, limitFeeTxs, transactionFee, sentComissionFee, isAlreadyHighlight, selectedCoin } = THIS.state

  // Check format number only
  if (!validateNumber(newAmount)) {
    // Clear data and error when no input
    if (newAmount.length === 0) {
      THIS.setState({ 
        isDisableSend: true, 
        isSendAmountErr: false, 
        strSendAmount: '', 
        strFiatAmount: '', 
        commissionFee: 0, 
        totalPaymentAmount: 0, 
        totalPaymentUSD: 0, 
        sufficientEtherBalance: THIS.fWalletBalance - roundingNumber(transactionFee) >= 0
      }, () => { checkOpenSending() })
    }
  } else {
    // Check clear first dots
    if (newAmount.toString() !== '.') {
      let dotsCount = countDots(newAmount, '\\.')
      // Check only accept 1 dots
      if (dotsCount <= 1) {
        let isError = false
        let decimalCount = newAmount.length - newAmount.indexOf('.') - 1

        if (dotsCount === 1 && decimalCount > 8) {
          isError = true
        }

        if (!isError) {
          // User can input if pass all previous condition
          let newAmountNum = roundingNumber(newAmount)
          // Convert to Money amount format max 2 decimal
          let strFiatAmount = newMoneyAmount || roundingNumber(THIS.fRate * newAmountNum, 2)
          // Calculate commission fee
          let commissionFee = newAmountNum * THIS.props.getCommisionFee()
          // let commissionFee = paymentType === 'ETH' 
          //   ? await calPriceFeeEth(selectedItem.address, selectedItem.id, selectedItem.businessAddress, newAmountNum, isHighlight)
          //   : await calPriceFeeHBWALLET(selectedItem.address, selectedItem.id, selectedItem.businessAddress, newAmountNum, isHighlight)
          // commissionFee = convertWeiToBalance(commissionFee, paymentType === 'ETH' ? 18 : 2)
          let oldComissionFee
          if (isChangePrice) {
            oldComissionFee = sentComissionFee
            commissionFee = commissionFee - oldComissionFee
            commissionFee = commissionFee <= 0 ? 0 : commissionFee
          } else {
            commissionFee = Number(commissionFee) <= Number(limitFeeTxs) ? limitFeeTxs : commissionFee
          }
          const isActiveHighlight = isChangePrice ? (!isAlreadyHighlight && isHighlight) : isHighlight
          let totalPaymentAmount = Number(commissionFee) + Number(!isActiveHighlight ? 0 : highlightFee)
          let totalPaymentUSD = totalPaymentAmount * THIS.fRate

          if (totalPaymentAmount > roundingNumber(selectedCoin.symbol === 'ETH' ? THIS.fWalletBalance : THIS.fTokenBalance) || newAmountNum <= 0) {
            // Final fail checking
            THIS.setState({
              strSendAmount: newAmount,
              strFiatAmount,
              commissionFee,
              isSendAmountErr: true,
              isDisableSend: true,
              totalPaymentAmount,
              totalPaymentUSD
            })
          } else {
            if (!isChangePrice && commissionFee < limitFeeTxs) {
              totalPaymentAmount = Number(limitFeeTxs) + Number(isHighlight ? highlightFee : 0)
              totalPaymentUSD = totalPaymentAmount * THIS.fRate
              THIS.setState({
                strSendAmount: newAmount,
                strFiatAmount,
                commissionFee: limitFeeTxs,
                isSendAmountErr: false,
                totalPaymentAmount,
                totalPaymentUSD
              }, () => { checkOpenSending() })
            } else {
              // Final success checking
              THIS.setState({
                strSendAmount: newAmount,
                strFiatAmount,
                commissionFee,
                isSendAmountErr: false,
                totalPaymentAmount,
                totalPaymentUSD
              }, () => { checkOpenSending() })
            }
          }
        }
      }
    }
  }
}

export const sendViaSmartContract = () => {
  return (dispatch, getState) => {
    const { arrCardData, arrDappAssets, selectedItem, t } = THIS.props
    const { strSendAmount, strFiatAmount, strReceiverAddr, strMessage, isViaSmartContract, isChangePrice, isHighlight, isActiveSend, gameInfo, totalPaymentAmount, selectedCoin } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    const numAmount = roundingNumber(strSendAmount, 18)
    const isSendVia = isViaSmartContract && !isChangePrice 
    if (!isActiveSend) {
      return
    }
    THIS.setState({
      isActiveSend: false,
      isSending: true
    }, async () => {
      let finalFee = roundingNumber(totalPaymentAmount, 18)
      if (isChangePrice) {
        const priceGame = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
        if (!priceGame || (priceGame && !priceGame._Price)) {
          swal({
            width: '250px',
            text: t('Dapps.noLonger'),
            type: 'error',
            showConfirmButton: false
          })
          THIS.setState({
            isSending: false
          }, () => {
            THIS.props.backToTop()
          })
          return
        }
      }
      setPriceGameItem(mainAccount.privateKey, gameInfo.address, selectedItem.id, numAmount, selectedItem.address, finalFee, isChangePrice, isHighlight, mainAccount.address, selectedCoin)
        .then(async (result) => {
          console.log('setPriceGameItem success', result)
          if (isSendVia) {
            const requestData = {
              address: selectedItem.address,
              businessAddress: selectedItem.businessAddress,
              symbol: selectedItem.symbol, 
              game: selectedItem.game,
              icon: selectedItem.icon,
              id: selectedItem.id,
              image: selectedItem.image,
              name: selectedItem.name,
              from: mainAccount.address, 
              to: strReceiverAddr, 
              amount: numAmount, 
              // fiatAmount: strFiatAmount, 
              crypto: selectedCoin.symbol,
              hash: result.txID, 
              gameItem: selectedItem,
              status: REQUEST_STATUS.PENDING,
              isAccepted: false,
              type: 'request'
            }
            DexAPI.postRequestGameItem(requestData)
          } else {
            // update request status
            let requestFind = await DexAPI.getSingleRequestGame(mainAccount.address, selectedItem.symbol, selectedItem.id)
            if (requestFind && requestFind.data && requestFind.data.length > 0) {
              let updateData = {
                address: mainAccount.address,
                symbol: selectedItem.symbol,
                id: selectedItem.id,
                amount: numAmount,
                // fiatAmount: strFiatAmount,
                crypto: selectedCoin.symbol,
                hash: result.txID
              }
              DexAPI.batchUpdateRequestGameItem(updateData)
            } else {
              DexAPI.postSaleGameItem(selectedItem.symbol, selectedItem.id, mainAccount.address, numAmount, strMessage, result.txID)
            }
          }
          selectedCoin.fiatAmount = THIS.fRate
          DexAPI.triggerGetEtherTransactions(mainAccount.address)
          ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, selectedItem.address.toLowerCase(), finalFee, result.rawTransaction, selectedCoin, 'selling', selectedItem)
          dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: result.txID}))
          THIS.props.updateDataAfterSellAsset(result.txID)
          let index = arrDappAssets.findIndex(e => e.id === selectedItem.id && e.symbol.toLowerCase() === selectedItem.symbol.toLowerCase())
          if (index !== -1) {
            arrDappAssets[index].isPending = 'selling'
            dispatch(setDappAssets(arrDappAssets))
          }
          swal({
            width: '250px',
            text: t(`Dapps.${isChangePrice ? 'changePriceOk' : (isSendVia ? 'sendViaOk' : 'sellOk')}`),
            type: 'success',
            timer: 5000,
            showConfirmButton: false
          })
          THIS.setState({
            isSending: false
          }, () => {
            THIS.props.backToTop()
          })
        })
        .catch((err) => {
          console.log('setPriceGameItem error', err)
          swal({
            width: '250px',
            text: t('gasFeeIsNotEnough2'),
            type: 'error',
            showConfirmButton: false
          })
          THIS.setState({
            isSending: false,
            strReceiverAddr: '',
            strSendAmount: '',
            strFiatAmount: '',
            commissionFee: 0,
            totalPaymentAmount: 0,
            totalPaymentUSD: 0
          })
        })
    })
  }
}

export const updateDataAfterSellAsset = (txID) => {
  return async (dispatch, getState) => {
    const { pendingTx } = THIS.props
    console.log('awaitTransactionMinedAsync: ', txID)
    // update status of tracking transanction to pending
    setTimeout(() => {
      ReduxServices.clearTrackingTxs(txID)
    }, 5000)

    // waiting transaction in ethereum network
    const txReceipt = await OxObject.awaitTransactionSuccessAsync(txID)
    console.log('txReceipt: ', txReceipt, txReceipt.logs)
    // update pending status
    pendingTx.isPending = false
    dispatch(setPendingTx(pendingTx))

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
  }
}

export const lastCheckSendSmartContract = (totalPaymentAmount, spendableAmount) => {
  return (dispatch, getState) => {
    const { showBuyHBtoken } = THIS.state
    if (showBuyHBtoken) {
      if (Number(totalPaymentAmount) > Number(spendableAmount)) {
        THIS.setState({
          isErrorAmount: true
        })
      }
    } else {
      if (Number(totalPaymentAmount) > Number(spendableAmount)) {
        THIS.setState({
          isErrorAmount: true
        })
      }
    }
  }
}

export const handleBuyAsset = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isBuyAsset: true
    }, () => {
      THIS.props.fetchBalance()
      THIS.refs.md_buy_asset.show()
    })
  }
}

export const onCloseBuyAssetModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_buy_asset.hide()
  }
}

export const onChangeAgreeTermsOfServices = (e) => {
  return (dispatch, getState) => {
    const { isAgreeTermsOfServices } = THIS.state
    THIS.setState({
      // isAgreeTermsOfServices: e.target.checked
      isAgreeTermsOfServices: !isAgreeTermsOfServices
    }, () => { checkOpenSending() })
  }
}

export const buyAsset = () => {
  return (dispatch, getState) => {
    const { arrCardData, arrDappAssets, selectedItem, t, backToTop } = THIS.props
    const { gasInput, isActiveSend } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (!isActiveSend) {
      return
    }
    THIS.setState({
      isActiveSend: false,
      isSending: true
    }, async () => {
      const priceGame = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
      if (priceGame && Number(priceGame._Price) > 0) {
        let balance
        const ethBalance = await getETHBalance(mainAccount.address)
        const selectedCoin = arrCryptoCurrency.find(e => e.value.includes(priceGame._crypto))
        const priceETH = convertWeiToBalance(priceGame._Price)
        if (priceGame._crypto.includes('ETH')) {
          balance = ethBalance
        } else {
          balance = await getTokenBalance(selectedCoin.address, mainAccount.address, selectedCoin.decimals)
        }
        if ((balance - (priceGame._crypto.includes('ETH') ? bufferSend : 0) - roundingNumber(priceETH)) >= 0 && (ethBalance - bufferSend) >= 0) {
          buyGameItem(mainAccount.privateKey, selectedItem.businessAddress, selectedItem.address, selectedItem.id, selectedItem.version, selectedCoin, gasInput)
            .then((result) => {
              THIS.setState({ isSending: false })
              THIS.refs.md_buy_asset && THIS.refs.md_buy_asset.hide()
              swal({
                width: '250px',
                text: t('Dapps.boughItemSuccess'),
                type: 'success',
                timer: 5000,
                showConfirmButton: false
              })
              DexAPI.triggerGetEtherTransactions(mainAccount.address)
              DexAPI.postGameTxsHistory(result.txID, selectedItem.id.toString(), selectedItem.symbol, selectedItem.owner, mainAccount.address, priceETH)
              DexAPI.deleteSaleGameItem(selectedItem.symbol, selectedItem.id)
              ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, selectedItem.address.toLowerCase(), priceETH, result.rawTransaction, null, 'buying', selectedItem)
              dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: result.txID}))
              THIS.props.updateDataAfterBuyAsset(selectedItem, result.txID)
              let index = arrDappAssets.findIndex(e => e.id === selectedItem.id && e.symbol.toLowerCase() === selectedItem.symbol.toLowerCase())
              if (index !== -1) {
                arrDappAssets[index].isPending = 'buying'
                dispatch(setDappAssets(arrDappAssets))
              }
              backToTop()
            })
            .catch((err) => {
              console.log('buyGameItem', err)
              THIS.setState({ 
                isSending: false,
                isAgreeTermsOfServices: false 
              })
              THIS.refs.md_buy_asset && THIS.refs.md_buy_asset.hide()
              swal({
                width: '250px',
                text: t('gasFeeIsNotEnough2'),
                type: 'error',
                showConfirmButton: false
              })
            })
        } else {
          THIS.setState({ 
            isSending: false,
            isAgreeTermsOfServices: false 
          })
          THIS.refs.md_buy_asset.hide()
          swal({
            width: '250px',
            text: t('Dapps.sendErrFunds'),
            type: 'error',
            showConfirmButton: false
          })
        }
      } else {
        THIS.setState({ 
          isSending: false,
          isAgreeTermsOfServices: false 
        })
        THIS.refs.md_buy_asset.hide()
        swal({
          width: '250px',
          text: t('Dapps.noLonger'),
          type: 'error',
          showConfirmButton: false
        })
        backToTop()
      }
    })
  }
}

export const updateDataAfterBuyAsset = (selectedItem, txID) => {
  return async (dispatch, getState) => {
    const { pendingTx, arrDappMarket } = THIS.props
    console.log('awaitTransactionMinedAsync: ', txID)
    // update status of tracking transanction to pending
    setTimeout(() => {
      ReduxServices.clearTrackingTxs(txID)
    }, 5000)

    // waiting transaction in ethereum network
    const txReceipt = await OxObject.awaitTransactionSuccessAsync(txID)
    console.log('txReceipt: ', txReceipt, txReceipt.logs)
    // update pending status
    pendingTx.isPending = false
    dispatch(setPendingTx(pendingTx))

    if (txReceipt && txReceipt.status === 1) { // transaction successfully

      // Set temporary arrDappMarket
      let tempDappMarket = arrDappMarket.filter(e => e.id !== selectedItem.id)
      dispatch(setDappMarket(tempDappMarket))

      // refresh dapp assets
      ReduxServices.refreshDappAssests()
      ReduxServices.refreshTotalSync()

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
  }
}

export const clickToHBWALLET = () => {
  return async (dispatch, getState) => {
    const { userAuth } = THIS.props
    let dataHBWallet = await DexAPI.getTokenDataWithChart(HBWALLET)
    if (dataHBWallet && dataHBWallet.data) {
      dispatch(setDexSelectedPair(dataHBWallet.data))
      if (!userAuth.isConfirmDex) {
        Observer.emit(OBSERVER_KEY.SELECT_TAB_EXCHANGE)
      } else {
        Observer.emit(OBSERVER_KEY.HB_EXCHANGE_SCREEN)
      }
    }
  }
}

export const handleChangePrice = () => {
  return async (dispatch, getState) => {
    const { selectedItem, backToTop, t } = THIS.props
    const priceGame = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
    if (priceGame && Number(priceGame._Price) > 0) {
      THIS.setState({
        priceGame: convertWeiToBalance(priceGame._Price),
        sentComissionFee: convertWeiToBalance(priceGame._fee),
        selectedCurrency: priceGame._crypto,
        selectedCoin: arrCryptoCurrency.find(e => e.value.includes(priceGame._crypto)),
        isAlreadyHighlight: priceGame._isHightlight === '1',
        isActiveHowToSend: false,
        isChangePrice: true,
        isViaSmartContract: false,
        isSendToAnotherUser: false
      }, () => {
        THIS.props.fetchBalance()
        THIS.props.fetchCommissionFee()
        THIS.props.handleNextHowToSend()
      })
    } else {
      swal({
        width: '250px',
        text: t('Dapps.noLonger'),
        type: 'error',
        showConfirmButton: false
      })
      backToTop()
    }
  }
}

export const handleRetrieve = () => {
  return async (dispatch, getState) => {
    const { selectedItem, backToTop, t } = THIS.props
    const priceGame = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
    if (priceGame && Number(priceGame._Price) > 0) {
      THIS.refs.md_retrieve.show()
    } else {
      swal({
        width: '250px',
        text: t('Dapps.noLonger'),
        type: 'error',
        showConfirmButton: false
      })
      backToTop()
    }
  }
}

export const onCloseRetrieveModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_retrieve.hide()
  }
}

export const onRetrieve = () => {
  return (dispatch, getState) => {
    const { arrCardData, arrDappAssets, backToTop, selectedItem, t } = THIS.props
    const { selectedCurrency } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    THIS.setState({
      isSending: true
    }, async () => {
      const priceGame = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
      if (priceGame && Number(priceGame._Price) > 0) {
        const ethBalance = await getETHBalance(mainAccount.address)
        if (ethBalance - bufferSend >= 0) {
          removePriceGameItem(mainAccount.privateKey, selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version, selectedCurrency)
            .then((result) => {
              THIS.refs.md_retrieve && THIS.refs.md_retrieve.hide()
              THIS.setState({ isSending: false })
              swal({
                width: '250px',
                text: t('Dapps.retrieveOk'),
                type: 'success',
                timer: 5000,
                showConfirmButton: false
              })
              DexAPI.triggerGetEtherTransactions(mainAccount.address)
              DexAPI.deleteSaleGameItem(selectedItem.symbol, selectedItem.id)
              ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, selectedItem.address.toLowerCase(), 0, result.rawTransaction, null, 'retrieving', selectedItem)
              dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: result.txID}))
              THIS.props.updateDataAfterRetrieve(selectedItem, result.txID)
              let index = arrDappAssets.findIndex(e => e.id === selectedItem.id && e.symbol.toLowerCase() === selectedItem.symbol.toLowerCase())
              if (index !== -1) {
                arrDappAssets[index].isPending = 'retrieving'
                dispatch(setDappAssets(arrDappAssets))
              }
              backToTop()
            })
            .catch((err) => {
              console.log('removePriceGameItem failed', err)
              THIS.refs.md_retrieve && THIS.refs.md_retrieve.hide()
              THIS.setState({ isSending: false })
              swal({
                width: '250px',
                text: t('Dapps.retrieveFail'),
                type: 'error',
                showConfirmButton: false
              })
            })
        } else {
          THIS.setState({ isSending: false })
          THIS.refs.md_retrieve && THIS.refs.md_retrieve.hide()
          swal({
            width: '250px',
            text: t('Dapps.sendErrFunds'),
            type: 'error',
            showConfirmButton: false
          })
        }
      } else {
        THIS.refs.md_retrieve.hide()
        THIS.setState({ isSending: false })
        swal({
          width: '250px',
          text: t('Dapps.noLonger'),
          type: 'error',
          showConfirmButton: false
        })
      }
    })
  }
}

export const updateDataAfterRetrieve = (selectedItem, txID) => {
  return async (dispatch, getState) => {
    const { pendingTx, arrCardData, refreshAfterRetrieve } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    console.log('awaitTransactionMinedAsync: ', txID)
    // update status of tracking transanction to pending
    setTimeout(() => {
      ReduxServices.clearTrackingTxs(txID)
    }, 5000)

    // waiting transaction in ethereum network
    const txReceipt = await OxObject.awaitTransactionSuccessAsync(txID)
    console.log('txReceipt: ', txReceipt, txReceipt.logs)
    // update pending status
    pendingTx.isPending = false
    dispatch(setPendingTx(pendingTx))

    if (txReceipt && txReceipt.status === 1) { // transaction successfully

      // refresh dapp assets
      refreshAfterRetrieve(selectedItem)

      // update request status
      let requestFind = await DexAPI.getSingleRequestGame(mainAccount.address, selectedItem.symbol, selectedItem.id)
      if (requestFind && requestFind.data && requestFind.data.length > 0) {
        let updateData = {
          address: mainAccount.address,
          symbol: selectedItem.symbol,
          id: selectedItem.id,
          status: REQUEST_STATUS.FAILED
        }
        DexAPI.batchUpdateRequestGameItem(updateData)
      }

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
  }
}

export const getTextArea = (e) => {
  return async (dispatch, getState) => {
    THIS.setState({
      strMessage: e.target.value
    })
  }
}

export const clickToGame = () => {
  return (dispatch, getState) => {
    const { gameItemDetail } = THIS.state
    Observer.emit(OBSERVER_KEY.SELECT_TAB_DAPP)
    setTimeout(() => {
      Observer.emit(OBSERVER_KEY.SELECT_TAB_DAPP_TO_GACHA, gameItemDetail.url)
    }, 500)
  }
}

export const onResendToStore = () => {
  return (dispatch, getState) => {
    const { selectedItem, arrCardData, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    THIS.setState({
      isLoadingStore: true
    }, async () => {
      const priceGame = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
      if (priceGame && Number(priceGame._Price) > 0) {
        const priceETH = convertWeiToBalance(priceGame._Price)
        await DexAPI.postSaleGameItem(selectedItem.symbol, selectedItem.id, mainAccount.address, priceETH)
        setTimeout(async () => {
          const res = await NagemonAPI.checkGameItemInStore(selectedItem.address, selectedItem.id)
          THIS.setState({
            isLoadingStore: false,
            isOnStore: res.existed
          })
          swal({
            width: '250px',
            text: t('Dapps.sellOk'),
            type: 'success',
            timer: 5000,
            showConfirmButton: false
          })
        }, 1000)
      } else {
        THIS.setState({
          isLoadingStore: false
        })
        swal({
          width: '250px',
          text: t('Dapps.noLonger'),
          type: 'error',
          showConfirmButton: false
        })
      }
    })
  }
}

export const handleSendToAnotherUser = () => {
  return (dispatch, getState) => {
    THIS.setState({
      strSearchAccount: '',
      strReceiverAddr: '',
      isActiveSend: false,
      isReceiverErr: false,
      isSendToAnotherUser: true
    }, () => {
      THIS.refs.md_send_to_another_user.show()
    })
  }
}

export const onCloseSendToAnotherUserModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_send_to_another_user.hide()
  }
}

export const sendToAnotherUser = () => {
  return (dispatch, getState) => {
    const { isActiveSend, strReceiverAddr } = THIS.state
    const { selectedItem, arrCardData, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (!isActiveSend) {
      return
    }
    THIS.setState({
      isActiveSend: false,
      isLoadingSendAnother: true
    }, async () => {
      const priceGame = await getPriceGameItem(selectedItem.address, selectedItem.id, selectedItem.businessAddress, selectedItem.version)
      if (priceGame && Number(priceGame._Price) > 0) {
        const priceETH = convertWeiToBalance(priceGame._Price)
        const selectedCoin = arrCryptoCurrency.find(e => e.value.includes(priceGame._crypto))
        // const fiatAmount = roundingNumber(THIS.fRate * priceETH, 2)
        const requestData = {
          address: selectedItem.address,
          businessAddress: selectedItem.businessAddress,
          symbol: selectedItem.symbol, 
          game: selectedItem.game,
          icon: selectedItem.icon,
          id: selectedItem.id,
          image: selectedItem.image,
          name: selectedItem.name,
          from: mainAccount.address, 
          to: strReceiverAddr, 
          amount: priceETH, 
          // fiatAmount, 
          crypto: selectedCoin.symbol,
          gameItem: selectedItem,
          status: REQUEST_STATUS.COMPLETED,
          isAccepted: false,
          type: 'request'
        }
        DexAPI.postRequestGameItem(requestData)
  
        swal({
          width: '250px',
          text: t(`Dapps.sendViaAgain`),
          type: 'success',
          timer: 5000,
          showConfirmButton: false
        })
        THIS.setState({
          isLoadingSendAnother: false
        })
        THIS.props.onCloseSendToAnotherUserModal()
      } else {
        THIS.setState({
          isLoadingSendAnother: false
        })
        swal({
          width: '250px',
          text: t('Dapps.noLonger'),
          type: 'error',
          showConfirmButton: false
        })
      }
    })
  }
}

export const onOpenNFT = () => {
  return async (dispatch, getState) => {
    const { screenConfig, selectedItem, userAuth } = THIS.props
    const res = await getItemsByTokenOwner(screenConfig.dapp.blockchain_card_address, selectedItem.address, selectedItem.id, userAuth.address)
    if (res && res[0] && res[0].length > 0) {
      openBrowserInNewTab(screenConfig.dapp.blockchain_nft_scan, { codeScan: res[0] })
    }
  }
}
