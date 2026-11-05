import swal from 'sweetalert2'
import DappAPI from 'Backend/Api/services/DappAPI'
import DexAPI from 'Backend/Api/services/DexAPI'
import OxObject from 'Backend/Lib/0x/index'
import Observer from 'Utils/HBObserver'
import ReduxServices from 'Utils/globalRedux'
import { setKyberSwapToken, setPendingTx } from 'Backend/Redux/actions/globalActions'
import Images from 'Assets/Image'
import { filter, includes } from 'lodash'
import { convertWeiToBalance, convertBalanceToWei, filterMainAccount, roundingNumber, validateNumber, countDots, saveTransactionEther, showNotification, logDebugChatwork, openBrowserInNewTab, copyText, formatNumberCal } from 'Utils/globalFunction'
import { getETHBalance, getTokenBalance, getConversionRate, swapCoin } from 'Backend/Lib/Web3/index'
import { getChartTokenDetail, getChartTokenDetailYear } from 'Backend/Redux/actionSaga/sagaActions'
import { SWAP_ADDRESS, OBSERVER_KEY } from 'Utils/globalConstants' 
import Settings from 'Backend/settings'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { outputCoin } = THIS.state
    dispatch(getChartTokenDetail(outputCoin))
    dispatch(getChartTokenDetailYear(outputCoin))
  }
}

export const fetchBalance = () => {
  return async (dispatch, getState) => {
    try {
      const { arrCardData } = THIS.props
      const { gasInput, gasLimit, sourceCoin } = THIS.state
      const mainAccount = filterMainAccount(arrCardData)
      THIS.fWalletBalance = await getETHBalance(mainAccount.address)
      if (sourceCoin.symbol !== 'ETH') {
        THIS.fTokenBalance = await getTokenBalance(sourceCoin.address, mainAccount.address, sourceCoin.decimals)
      }
      const transactionFee = convertWeiToBalance(convertBalanceToWei(gasInput, 9) * gasLimit)
      THIS.setState({
        isLoadingBalance: false,
        transactionFee,
        sufficientBalance: THIS.fWalletBalance - roundingNumber(transactionFee) >= 0,
        spendable: sourceCoin.symbol !== 'ETH' ? THIS.fTokenBalance : (THIS.fWalletBalance - roundingNumber(transactionFee) > 0 ? THIS.fWalletBalance - roundingNumber(transactionFee) : 0)
      })
    } catch (err) {
      logDebugChatwork('fetchBalance', err)
      THIS.setState({
        isLoadingBalance: false
      })
    }
  }
}

export const fetchOutputToken = () => {
  return async (dispatch, getState) => {
    try {
      const { arrCardData, arrHBTokens } = THIS.props
      const { sourceCoin, gasInput } = THIS.state
      const mainAccount = filterMainAccount(arrCardData)
      THIS.fWalletBalance = await getETHBalance(mainAccount.address)
      if (sourceCoin.symbol !== 'ETH') {
        THIS.fTokenBalance = await getTokenBalance(sourceCoin.address, mainAccount.address, sourceCoin.decimals)
      }

      let settings = await DappAPI.getSettingOther()
      const contractSwap = settings && settings.others && settings.others.SWAP_ADDRESS ? settings.others.SWAP_ADDRESS : SWAP_ADDRESS
      const gasLimit = settings && settings.others && settings.others.GAS_SWAP_TOKEN && settings.others.GAS_SWAP ? (sourceCoin.symbol !== 'ETH' ? settings.others.GAS_SWAP_TOKEN : settings.others.GAS_SWAP) : 600000
      const transactionFee = convertWeiToBalance(convertBalanceToWei(gasInput, 9) * gasLimit)
      THIS.setState({
        isLoadingBalance: false,
        contractSwap,
        gasLimit,
        transactionFee,
        sufficientBalance: THIS.fWalletBalance - roundingNumber(transactionFee) >= 0,
        spendable: sourceCoin.symbol !== 'ETH' ? THIS.fTokenBalance : (THIS.fWalletBalance - roundingNumber(transactionFee) > 0 ? THIS.fWalletBalance - roundingNumber(transactionFee) : 0)
      }, () => THIS.props.fetchRate())

      if (settings && settings.kyberSwap) {
        settings.kyberSwap.map(item => {
          let token = arrHBTokens.find(e => e.tokenAddress.toLowerCase() === item.address.toLowerCase())
          item.iconImage = token ? token.iconImage : Images.airDropNone
          item.tokenId = token ? token.id : ''
        })
        dispatch(setKyberSwapToken(settings.kyberSwap))
      }
    } catch (err) {
      logDebugChatwork('fetchOutputToken', err)
      THIS.setState({
        isLoadingBalance: false
      })
    }
  }
}

export const fetchRate = () => {
  return async (dispatch, getState) => {
    try {
      const { contractSwap, sourceCoin, outputCoin } = THIS.state
      const valueSwap = convertBalanceToWei(1, sourceCoin.decimals)
      const fRate = await getConversionRate(contractSwap, sourceCoin.address, outputCoin.address, valueSwap)
      THIS.setState({
        conversionRate: fRate[0],
        fRate: convertWeiToBalance(fRate[2]),
        isSupportSwap: convertWeiToBalance(fRate[2]) > 0
      })
    } catch (err) {
      logDebugChatwork('fetchRate', err)
    }
  }
}

export const fetchTokenPrice = () => {
  return async (dispatch, getState) => {
    const { outputCoin, tokenPrice } = THIS.state
    const { internetData, arrCurrencyData, etherPrice } = THIS.props
    if (internetData) {
      // Get exchange rate of token
      let fTokenConvert = 0
      if (outputCoin.tokenId.toString().trim().length > 0) { // get token price from CoinmarketCap
        let res = await DexAPI.getCoinInfo(outputCoin.symbol, arrCurrencyData, outputCoin.tokenId, outputCoin.name)
        if (res && res.data) {
          fTokenConvert = res.data.priceCurrency
          tokenPrice.price = res.data.priceCurrency
          tokenPrice.percent_change_24h = res.data.percent_change_24h
          THIS.setState({
            tokenPrice,
            isLoadingTokenPrice: false
          })
        } else {
          THIS.setState({
            isLoadingTokenPrice: false
          })
        }
      } else { // get token price from HB DEX
        let res = await DexAPI.getTokenDataWithChart(outputCoin.address)
        if (res && res.data) {
          fTokenConvert = Math.abs(res.data.lastPrice.price) * Number(etherPrice.price)
          tokenPrice.price = fTokenConvert
          tokenPrice.percent_change_24h = res.data.day.change
          THIS.setState({
            tokenPrice,
            isLoadingTokenPrice: false
          })
        } else {
          THIS.setState({
            isLoadingTokenPrice: false
          })
        }
      }
      THIS.fTokenConvert = fTokenConvert
    } else {
      THIS.setState({
        isLoadingTokenPrice: false
      })
    }
  }
}

export const changeChartTime = (chartTime) => {
  return (dispatch, getState) => {
    THIS.setState({chartTime})
  }
}

export const onChangeFrom = (inputAmount, outputAmount) => {
  return (dispatch, getState) => {
    try {
      const { sourceCoin, outputCoin, fRate, spendable } = THIS.state
      const newAmount = inputAmount.toString()

      // Check format number only
      if (!validateNumber(newAmount)) {
        // Clear data and error when no input
        if (newAmount.length === 0) {
          THIS.setState({ 
            txtFrom: '', 
            txtTo: '',
            isSendAmountErr: false
          }, () => checkOpenSending())
        }
      } else {
        // Check clear first dots
        if (newAmount.toString() !== '.') {
          let dotsCount = countDots(newAmount, '\\.')
          // Check only accept 1 dots
          if (dotsCount <= 1) {
            let isError = false
            let decimalCount = newAmount.length - newAmount.indexOf('.') - 1

            // Check if token decimal greater than 0
            if (decimalCount > (sourceCoin.decimals > 8 ? 8 : sourceCoin.decimals)) {
              isError = true
            }
            if (!isError) {
              // User can input if pass all previous condition
              let newAmountNum = Number(newAmount, 8)
              let txtFiatAmount = outputAmount || formatNumberCal(fRate * newAmountNum, outputCoin.decimals)

              if (newAmountNum > (spendable) || newAmountNum <= 0) {
                // Final fail checking
                THIS.setState({
                  isSendAmountErr: true,
                  txtFrom: newAmount,
                  txtTo: txtFiatAmount.toString()
                }, () => checkOpenSending())
              } else {
                THIS.setState({ 
                  isSendAmountErr: false,
                  txtFrom: newAmount, 
                  txtTo: txtFiatAmount
                }, () => checkOpenSending())
              }
            }
          }
        }
      }
    } catch (err) {
      logDebugChatwork('onChangeFrom', err)
    }
  }
}

export const onChangeTo = (outputAmount) => {
  return (dispatch, getState) => {
    try {
      const { outputCoin, fRate } = THIS.state
      // Check format number only
      if (!validateNumber(outputAmount)) {
        // Clear data and error when no input
        if (outputAmount.length === 0) {
          THIS.setState({ txtFrom: '', txtTo: '', isSendAmountErr: false })
        }
      } else {
        // Check clear first dots
        if (outputAmount.toString() !== '.') {
          let dotsCount = countDots(outputAmount, '\\.')
          // Check only accept 1 dots
          if (dotsCount <= 1) {
            let isError = false
            let decimalCount = outputAmount.length - outputAmount.indexOf('.') - 1

            // Check if token decimal greater than 0
            if (decimalCount > (outputCoin.decimals > 8 ? 8 : outputCoin.decimals)) {
              isError = true
            }
            if (!isError) {
              // Convert to token amount format based on token Decimal
              let sendAmount = formatNumberCal(outputAmount / fRate, outputCoin ? (outputCoin.decimals > 8 ? 8 : outputCoin.decimals) : 8)

              THIS.props.onChangeFrom(sendAmount, outputAmount)
            }
          }
        }
      }
    } catch (err) {
      logDebugChatwork('onChangeTo', err)
    }
  }
}

export const handleChangeGasPrice = (res) => {
  return (dispatch) => {
    try {
      const { sourceCoin, txtFrom } = THIS.state
      THIS.setState({
        gasInput: res.gasInput,
        transactionFee: res.transactionFee,
        sufficientBalance: THIS.fWalletBalance - roundingNumber(res.transactionFee) >= 0, // check ether balance is enough or not
        spendable: sourceCoin.symbol !== 'ETH' ? THIS.fTokenBalance : (THIS.fWalletBalance - roundingNumber(res.transactionFee) > 0 ? THIS.fWalletBalance - roundingNumber(res.transactionFee) : 0),
        isSendAmountErr: sourceCoin.symbol !== 'ETH' ? false : (txtFrom !== '' && txtFrom > THIS.fWalletBalance - roundingNumber(res.transactionFee))
      }, () => checkOpenSending())
    } catch (err) {
      logDebugChatwork('handleChangeGasPrice', err)
    }
  }
}

export const openModalConfirmSwap = () => {
  return (dispatch, getState) => {
    THIS.refs.modal_confirm_swap.show() 
  }
}

export const closeModalConfirmSwap = () => {
  return (dispatch, getState) => {
    THIS.refs.modal_confirm_swap && THIS.refs.modal_confirm_swap.hide()
  }
}

export const openModalOutputToken = () => {
  return (dispatch, getState) => {
    THIS.refs.modal_output_token.show() 
  }
}

export const closeModalOutputToken = () => {
  return (dispatch, getState) => {
    THIS.refs.modal_output_token && THIS.refs.modal_output_token.hide()
  }
}

export const selectCoin = (item) => {
  return (dispatch, getState) => {
    THIS.setState({
      objSelectCoin: item
    })
  }
}

export const onSelectOutputToken = () => {
  return (dispatch, getState) => {
    try {
      const { objSelectCoin, txtFrom, sourceCoin } = THIS.state
      THIS.setState({
        outputCoin: objSelectCoin,
        isErrSameCoin: sourceCoin.address.toLowerCase() === objSelectCoin.address.toLowerCase()
      }, async () => {
        THIS.props.closeModalOutputToken()
        THIS.props.loadingInitial()
        THIS.props.fetchTokenPrice()
        await THIS.props.fetchRate()
        THIS.props.onChangeFrom(txtFrom)
      })
    } catch (err) {
      logDebugChatwork('onSelectOutputToken', err)
    }
  }
}

export const onSearchCoin = (strSearch) => {
  return (dispatch, getState) => {
    try {
      const { arrKyberSwapToken } = THIS.props
      let arrSearch = filter(arrKyberSwapToken, (item) => {
        return includes(item.name.toLowerCase(), strSearch.toLowerCase()) || includes(item.address.toLowerCase(), strSearch.toLowerCase()) || includes(item.symbol.toLowerCase(), strSearch.toLowerCase())
      })
      THIS.setState({
        txtSearchCoin: strSearch,
        arrSearch
      })
    } catch (err) {
      logDebugChatwork('onSearchCoin', err)
    }
  }
}

export const onSelectMax = () => {
  return (dispatch, getState) => {
    try {
      const { sourceCoin, transactionFee } = THIS.state
      const balanceSpend = sourceCoin.symbol !== 'ETH' ? THIS.fTokenBalance : (THIS.fWalletBalance - transactionFee > 0 ? THIS.fWalletBalance - transactionFee : 0)
      THIS.props.onChangeFrom(roundingNumber(balanceSpend, 8))
    } catch (err) {
      logDebugChatwork('onSelectMax', err)
    }
  }
}

export const onClickCancel = () => {
  return (dispatch, getState) => {
    try {
      THIS.setState({
        txtFrom: '',
        txtTo: '',
        isActiveSend: false,
        isSending: false
      })
    } catch (err) {
      logDebugChatwork('onClickCancel', err)
    }
  }
}

const checkOpenSending = () => {
  try {
    const { txtFrom, sufficientBalance, spendable, isErrSameCoin, isSupportSwap, isSendAmountErr } = THIS.state
    if (txtFrom.length > 0 && Number(txtFrom) > 0 && sufficientBalance && isSupportSwap && !isErrSameCoin && !isSendAmountErr && Number(txtFrom) <= Number(spendable)) {
      THIS.setState({
        isActiveSend: true
      })
    } else {
      THIS.setState({
        isActiveSend: false
      })
    }
  } catch (err) {
    logDebugChatwork('checkOpenSending', err)
    THIS.setState({
      isActiveSend: false
    })
  }
}

export const swapAction = () => {
  return (dispatch, getState) => {
    try {
      const { arrCardData, arrTokenData, t } = THIS.props
      const { isActiveSend, contractSwap, sourceCoin, outputCoin, txtFrom, conversionRate, gasInput } = THIS.state
      const mainAccount = filterMainAccount(arrCardData)
      if (!isActiveSend) {
        return
      }
      THIS.setState({
        isActiveSend: false,
        isSending: true
      }, () => {
        // show alert before execute swap coin
        swal({
          customClass: 'kyber-swap-noti',
          width: '404px',
          title: t('KyberSwap.transactionExecuted'),
          html: `<div class="kyber-swap-loading"><img src="${Images.infinity_cycle_loader}"/></div><div class="kyber-swap-tx-empty"></div><div class="kyber-swap-noted">` + t('KyberSwap.itMayTakeSeveralMinutes') + '</div>',
          imageUrl: Images.ic_swal_timer,
          showConfirmButton: false
        })
        // If large than 1 coin swap increate maximumDestAmount
        const conversionRateConvert = roundingNumber(txtFrom) <= 1 ? conversionRate : conversionRate * roundingNumber(txtFrom)
        swapCoin(mainAccount.privateKey, contractSwap, sourceCoin.address, outputCoin.address, txtFrom, sourceCoin.decimals, mainAccount.address, roundingNumber(conversionRateConvert, 0), sourceCoin.symbol === 'ETH', gasInput)
          .then(result => {
            THIS.props.closeModalConfirmSwap()
            THIS.setState({
              isSending: false,
              txtFrom: '',
              txtTo: ''
            })
            swal({
              customClass: 'kyber-swap-noti',
              width: '404px',
              title: t('KyberSwap.transactionExecuted'),
              html: `<div class="kyber-swap-tx"><span>${result.txID}</span>` + `<img id="copyTx" class="kyber-swap-copy" src="${Images.ic_copy}" />` + '</div><div class="kyber-swap-noted">' + t('KyberSwap.itMayTakeSeveralMinutes') + '</div>' + '<button id="openExternal" class="btn btn-default">' + `<img class="kyber-swap-etherscan" src="${Images.ic_etherscan}"/>` + t('KyberSwap.viewOnEtherscan') + '</button>',
              imageUrl: Images.ic_swal_timer,
              showConfirmButton: false,
              onBeforeOpen: () => {
                const content = swal.getContent()
                const $ = content.querySelector.bind(content)
                const openExternal = $('#openExternal')
                openExternal.addEventListener('click', () => {
                  openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}tx/${result.txID}`)
                })
                const copyTx = $('#copyTx')
                copyTx.addEventListener('click', () => {
                  copyText(result.txID)
                  swal({
                    width: '250px',
                    text: t('Copied'),
                    type: 'success',
                    timer: 5000,
                    showConfirmButton: false
                  })
                })
              }
            })
            DexAPI.triggerGetEtherTransactions(mainAccount.address)
            let coinFind = arrTokenData.find(e => e.address.toLowerCase() === sourceCoin.address.toLowerCase())
            sourceCoin.fiatAmount = coinFind && coinFind.fiatAmount ? coinFind.fiatAmount : 0
            ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, contractSwap, txtFrom, result.rawTransaction, sourceCoin.symbol !== 'ETH' ? sourceCoin : null)
            dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: result.txID}))
            THIS.props.updateDataAfterSwapCoin(result.txID)
          })
          .catch(err => {
            console.log('swapAction error', err)
            THIS.props.closeModalConfirmSwap()
            THIS.setState({
              isSending: false,
              txtFrom: '',
              txtTo: ''
            })
            swal({
              customClass: 'kyber-swap-noti',
              width: '250px',
              title: t('KyberSwap.transactionError'),
              text: t('gasFeeIsNotEnough2'),
              type: 'error',
              showConfirmButton: false
            })
          })
      })
    } catch (err) {
      logDebugChatwork('swapAction', err)
      THIS.setState({
        isActiveSend: false,
        isSending: false,
        txtFrom: '',
        txtTo: ''
      })
    }
  }
}

export const updateDataAfterSwapCoin = (txID) => {
  return async (dispatch, getState) => {
    try {
      const { sourceCoin, outputCoin } = THIS.state
      const { pendingTx, t } = THIS.props
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
        // store new transaction into DB
        saveTransactionEther(pendingTx.account, txReceipt)

        // refresh source balance
        THIS.props.fetchBalance()

        // show popup
        swal({
          customClass: 'kyber-swap-noti',
          width: '404px',
          title: t('KyberSwap.success'),
          html: `<div class="kyber-swap-tx"><span>${txID}</span>` + `<img id="copyTx" class="kyber-swap-copy" src="${Images.ic_copy}" />` + '</div><div class="kyber-swap-noted">' + t('KyberSwap.itMayTakeSeveralMinutes') + '</div>' + '<button id="openExternal" class="btn btn-default">' + `<img class="kyber-swap-etherscan" src="${Images.ic_etherscan}"/>` + t('KyberSwap.viewOnEtherscan') + '</button>',
          type: 'success',
          showConfirmButton: false,
          onBeforeOpen: () => {
            const content = swal.getContent()
            const $ = content.querySelector.bind(content)
            const openExternal = $('#openExternal')
            openExternal.addEventListener('click', () => {
              openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}tx/${txID}`)
            })
            const copyTx = $('#copyTx')
            copyTx.addEventListener('click', () => {
              copyText(txID)
              swal({
                width: '250px',
                text: t('Copied'),
                type: 'success',
                timer: 5000,
                showConfirmButton: false
              })
            })
          }
        })

        // specify notice message
        let notice = t('KyberSwap.swapNoti', { from: sourceCoin.symbol, to: outputCoin.symbol })

        // show notification to notice user
        showNotification(notice, t)

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
      logDebugChatwork('updateDataAfterSwapCoin', err)
    }
  }
}
