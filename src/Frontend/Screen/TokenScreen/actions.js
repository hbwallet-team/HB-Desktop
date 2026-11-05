import { getTokenTxsHistory, getCardBalance, getTxsHistoryAll, formatNumberLeftZero, convertWeiToBalance, showNotification, validateNumber, countDots, filterMainAccount, saveTransactionToken } from 'Utils/globalFunction'
import { setToken, setPendingTx, setSendingProcess } from 'Backend/Redux/actions/globalActions'
import swal from 'sweetalert2'
import {
  getHBTokens, getRealBoostTokens, getTopTokenCap, getTopTokenTrade, getChartToken, getChartTokenYear, getTokenDetailPrice,
  getChartTokenDetail, getChartTokenDetailYear, getChartTokenSingle, getChartTokenSingleYear
} from 'Backend/Redux/actionSaga/sagaActions'
import { filter, includes } from 'lodash/collection'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import OxObject from 'Backend/Lib/0x/index'
import DexAPI from 'Backend/Api/services/DexAPI'
import ReduxServices from 'Utils/globalRedux'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitialData = () => {
  return async (dispatch, getState) => {
    const { arrCardData, internetData, etherPrice } = getState()
    if (internetData) {
      THIS.fTokenConvert = etherPrice.price
      // loading token balance and fiat balance
      await THIS.props.loadingTokenbalance()
      // get holding tokens
      ReduxServices.refreshHoldingTokens(arrCardData).then(() => {
        // loading token balance and fiat balance
        THIS.props.loadingTokenbalance()
      }).catch((err) => {
        console.log('refreshHoldingTokens error', err)
        THIS.setState({
          isLoadingCard: false
        })
      })
    } else {
      THIS.setState({
        isLoadingCard: false
      })
    }
  }
}

export const fetchTopToken = () => {
  return (dispatch, getState) => {
    // get top token
    dispatch(getTopTokenCap())
    dispatch(getTopTokenTrade())
  }
}

export const updateDataAfterSendToken = () => {
  return async (dispatch, getState) => {
    const { pendingTx, t } = THIS.props
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

    if (txReceipt && txReceipt.status === 1) { // transaction successfully

      // store new transaction into DB
      saveTransactionToken(pendingTx.account, txReceipt)
      
      const { arrCardData } = getState()

      // detect main account
      const mainAccount = filterMainAccount(arrCardData)

      // update transaction history
      await ReduxServices.refreshTokenTxsHistory(pendingTx.token, mainAccount)

      // update transaction history for all account
      await ReduxServices.refreshEtherTxsHistoryAll(arrCardData.filter(card => card.isEnable), false)

      // update card balance
      ReduxServices.refreshCardBalance(arrCardData)

      // specify notice message
      let notice = t('Sentnew', {number: formatNumberLeftZero(convertWeiToBalance(txReceipt.value, pendingTx.token.decimals)), Symbol: pendingTx.token.symbol, cardName: mainAccount.cardName})

      // show notification to notice user
      showNotification(notice, t)

      // refresh token history transaction
      Observer.emit(OBSERVER_KEY.REFRESH_TOKEN_HISTORY)
      Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY)
      Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY_ALL)
    } else { // transaction failed
      ReduxServices.clearTrackingTxs()
    }
  }
}

export const handleBackToDetail = () => {
  return (dispatch, getState) => {
    const { activeKey } = THIS.state

    THIS.setState({isActiveDetai: false})
    THIS.props.onChangeTab(activeKey)
    THIS.props.loadingInitialData()
  }
}

export const openMdAddToken = () => {
  return (dispatch, getState) => {
    const { arrHBTokens } = THIS.props
    if (arrHBTokens.length === 0) {
      dispatch(getHBTokens())
      // dispatch(getRealBoostTokens())
    }
    filterData()
    const arrResults = internalSearch('')

    THIS.setState({
      strSearch: '', 
      arrResults,
      objSelectItem: null, 
      isOpenCreate: false
    }, () => {
      THIS.refs.modalAddToken.show()
    })
  }
}

export const closeMdAddToken = (_this) => {
  return (dispatch, getState) => {
    THIS.refs.modalAddToken.hide()
  }
}

export const handleInputSearch = (value) => {
  return (dispatch, getState) => {
    THIS.setState({ strSearch: value, objSelectItem: null, isOpenCreate: false })

    const arrResults = internalSearch(value)
    THIS.setState({arrResults})
  }
}

export const selectedTokenItem = (index, item) => {
  return (dispatch, getState) => {
    THIS.setState({ objSelectItem: { index, item }, isOpenCreate: true })
  }
}

const internalSearch = (input) => {
  const { arrItems } = THIS.state
  if (input === '') {
    return undefined
  }
  return filter(arrItems, (item) => {
    return depthFirstSearch(item, input)
  })
}

const depthFirstSearch = (collection, input) => {
  let type = typeof collection.name
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return includes(collection.name.toString().toLowerCase(), input.toString().toLowerCase())
  }
  return []
}

const filterData = () => {
  const { arrHBTokens, arrTokenData, arrRealBoostTokens } = THIS.props
  let filterData = []
  let filterAddress = []
  let filterRealBoostTokens = []
  let arrShowItems = []
  // RealBoost token addresses
  arrRealBoostTokens.map(item => filterRealBoostTokens.push(item.tokenAddress.toLowerCase()))
  // holding token addresses
  arrTokenData.map(item => filterAddress.push(item.address.toLowerCase()))
  // remove token belongs to RealBoost token or already added into holding tokens
  arrHBTokens.map(item => item.display_flag !== '-1' && !filterRealBoostTokens.includes(item.tokenAddress.toLowerCase()) && !filterAddress.includes(item.tokenAddress.toLowerCase()) && filterData.push(item))
  // top tokens which display on Add tokens modal at first time
  let arrShowItemsTem = arrHBTokens.filter(item => item.display_flag === '1')
  // remove tokens which already added into holding tokens
  arrShowItemsTem.map(item => !filterAddress.includes(item.tokenAddress.toLowerCase()) && arrShowItems.push(item))
  arrShowItems = arrShowItems.length === 0 ? filterData : arrShowItems
  THIS.setState({ 
    arrItems: filterData, 
    arrShowItems 
  }, () => { 
    THIS.forceUpdate() 
  })
}

export const loadingTokenbalance = () => {
  return async (dispatch, getState) => {
    const { arrTokenData } = getState()
    let totalFiatBalance = 0
    let arrTokenToChart = []
    for (let i = 0; i < arrTokenData.length; i++) {
      let item = arrTokenData[i]
      if (item.isEnabled) {
        totalFiatBalance += Number(item.currencyBalance)
        arrTokenToChart.push(item)
      }

    }
    THIS.setState({ 
      totalFiatBalance, 
      isLoadingCard: false, 
      objSelectItem: null, 
      strSearch: '' 
    }, () => {
      dispatch(getChartToken(arrTokenToChart))
      dispatch(getChartTokenYear(arrTokenToChart))
    })
  }
}

export const handleCreateToken = () => {
  return (dispatch, getState) => {
    const { objSelectItem, isOpenCreate } = THIS.state
    const { t, arrCardData, arrTokenData, internetData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    let tokenSelect
    if (objSelectItem) {
      tokenSelect = objSelectItem.item
    } else {
      return
    }

    if (!isOpenCreate) {
      return
    }
    THIS.setState({
      isOpenCreate: false
    }, async () => {
      const newTokenToLocal = {
        key: arrTokenData.length === 0 ? 0 : arrTokenData[arrTokenData.length - 1].key + 1,
        tokenId: tokenSelect.id,
        name: tokenSelect.name,
        address: tokenSelect.tokenAddress,
        symbol: tokenSelect.symbol,
        url: tokenSelect.url,
        cardImage: tokenSelect.cardImage,
        iconImage: tokenSelect.iconImage,
        balance: 0,
        currencyBalance: 0,
        fiatAmount: 0,
        decimal: tokenSelect.decimals,
        isEnabled: true,
        isCustomToken: false,
        isDeleted: false,
        isAutoAddedToken: false
      }
      arrTokenData.push(newTokenToLocal)
      dispatch(setToken(arrTokenData))
      filterData()
      THIS.props.loadingTokenbalance(arrTokenData)
      THIS.refs.modalAddToken.hide()
      
      // save new token to server
      if (internetData) {
        const newTokenToServer = {
          name: tokenSelect.name,
          address: tokenSelect.tokenAddress,
          symbol: tokenSelect.symbol,
          url: tokenSelect.url,
          balance: 0,
          priceCurrency: 0,
          price_usd: 0,
          decimals: tokenSelect.decimals,
          isEnabled: true,
          isCustomToken: false,
          isDeleted: false
        }
        await DexAPI.addCustomToken(mainAccount.address, newTokenToServer)
      }
      swal({
        text: t('createTokenSuccess'),
        showConfirmButton: false,
        width: '320px',
        type: 'success'
      })
    })
  }
}

export const onClickToken = (token) => {
  return async (dispatch, getState) => {
    THIS.setState({
      isActiveDetai: true, 
      cardSelected: token
    }, () => {
      dispatch(getChartTokenDetail(token))
      dispatch(getChartTokenDetailYear(token))
    })
  }
}

export const changeChartTime = (chartTime) => {
  return (dispatch, getState) => {
    THIS.setState({chartTime})
  }
}

export const onChangeDropdown = (item, itemTemp) => {
  return (dispatch, getState) => {
    const { strFilter } = THIS.state
    const { arrTokenData, t } = THIS.props
    const ALL_TOKEN = t('allToken')

    let symbol = item.key.split('#')[1]
    const token = arrTokenData.filter(item => item.symbol === symbol)[0]

    if (symbol !== ALL_TOKEN && symbol !== strFilter) {
      dispatch(getChartTokenSingle(token))
      dispatch(getChartTokenSingleYear(token))
    }
    THIS.setState({ strFilter: symbol })
  }
}
export const onChangeTab = (activeKey) => {
  return (dispatch, getState) => {
    THIS.setState({activeKey: activeKey})
  }
}
export const addCustomToken = () => {
  return (dispatch, getState) => {
    Observer.emit(OBSERVER_KEY.SELECT_TAB_SETTING)
    setTimeout(() => {
      Observer.emit(OBSERVER_KEY.SELECT_TAB_ADD_TOKEN)
    }, 100)
  }
}

export const closeModalQrCode = () => {
  return (dispatch, getState) => {
    THIS.refs.modalRequestReceive.hide()
  }
}

export const handleCopyQRCode = (address) => {
  return (dispatch, getState) => {
    const { t } = THIS.props

    THIS.refs.modalRequestReceive.hide()
    swal({
      width: '250px',
      text: t('qrCopied'),
      type: 'success',
      timer: 5000,
      showConfirmButton: false
    })
    
  }
}

export const openModalReceive = () => {
  return (dispatch, getState) => {
    THIS.refs.modalRequestReceive.show()
    THIS.setState({txtReceiveAmount: '', txtReceiveFiatAmount: ''})
  }
}

export const onChangeReceiveEthereumAmount = (newAmount) => {
  return (dispatch, getState) => {
    calculateReceiveAmount(newAmount.trim())
  }
}

const calculateReceiveAmount = (newAmount, newMoneyAmount) => {
  const { internetData } = THIS.props
  const { fTokenConvert } = THIS

  if (internetData) {
    // Check format number only
    if (!validateNumber(newAmount)) {
      // Clear data and error when no input
      if (newAmount.length === 0) {
        THIS.setState({ txtReceiveAmount: '', txtReceiveFiatAmount: '' })
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
            let newAmountNum = Number(newAmount)
            // Convert to Money amount format max 2 decimal
            let txtReceiveFiatAmount = newMoneyAmount || (fTokenConvert * newAmountNum).toFixed(2)
            // Final success checking
            THIS.setState({
              txtReceiveAmount: newAmount,
              txtReceiveFiatAmount
            })
          }
        }
      }
    }
  } else {
    THIS.setState({ txtReceiveAmount: newAmount })
  }
}

export const onChangeReceiveCurrencyAmount = (newMoney) => {
  return (dispatch, getState) => {
    const { internetData } = THIS.props
    const { fTokenConvert } = THIS
    if (internetData) {
      // Check format number only
      if (!validateNumber(newMoney)) {
        // Clear data and error when no input
        if (newMoney.length === 0) {
          THIS.setState({ txtReceiveAmount: '', txtReceiveFiatAmount: '' })
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
              let sendAmount = (Number(newMoney) / fTokenConvert).toFixed(8)

              calculateReceiveAmount(sendAmount, newMoney)
            }
          }
        }
      }
    } else {
      THIS.setState({ txtReceiveFiatAmount: newMoney })
    }
  }
}

export const triggerSwitchedAccount = (event, data) => {
  return (dispatch, getState) => {
    // THIS.props.loadingInitialData()
  }
}

export const selectedTabTokenDetail = (token) => {
  return (dispatch, getState) => {
    THIS.setState({
      isActiveDetai: true, 
      cardSelected: token,
      receiverAddr: token.airdropSmartContract
    }, () => {
      dispatch(getChartTokenDetail(token))
      dispatch(getChartTokenDetailYear(token))
    })
  }
}
