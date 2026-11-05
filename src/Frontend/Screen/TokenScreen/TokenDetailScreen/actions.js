import {
  validateAddress, validateNumber, countDots, convertWeiToBalance,
  filterMainAccount, formatNumber, formatFloorNumber, formatNumberDisplay, roundingNumber, formatFiatDisplay, formatNumberLeftZeroCal
} from 'Utils/globalFunction'
import React from 'react'
import EtherLibrary from 'Backend/HBLibrary/EtherLibrary'
import FiatMoneyConvert from 'Backend/HBLibrary/FiatMoneyConvert'
import swal from 'sweetalert2'
import { CONSTANTS, ACCOUNT_DETAIL_SUB_VIEW, WETH_ADDRESS, OBSERVER_KEY } from 'Utils/globalConstants'
import DexAPI from 'Backend/Api/services/DexAPI'
import EtherGas from 'Backend/Api/services/EtherGas'
import ReduxServices from 'Utils/globalRedux'
import { getETHBalance, getTokenBalance } from 'Backend/Lib/Web3/index'
import { setTokenHistory } from 'Backend/Redux/actions/globalActions'
import OxObject from 'Backend/Lib/0x/index'
import Observer from 'Utils/HBObserver'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const openModalReceive = () => {
  return (dispatch, getState) => {
    THIS.refs.modalRequestReceive.show()
    THIS.setState({txtReceiveAmount: '', txtReceiveFiatAmount: ''})
  }
}

export const closeModalQrCode = () => {
  return (dispatch, getState) => {
    THIS.refs.modalRequestReceive.hide()
  }
}

export const onBack = () => {
  return (dispatch, getState) => {
    THIS.props.backToDetail()
  }
}

export const onSelectMax = () => {
  return (dispatch, getState) => {
    calculateFeeETH(true)
  }
}

export const clickOnCell = (txt) => {
  return async (dispatch, getState) => {
    THIS.setState({
      isLoadingCellTxt: true,
      tokenTxtInfo: txt
    })
    THIS.refs.modalHistoryDetail.show()
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { internetData, cardSelected, arrCardData } = THIS.props
    const { gasLimit, gasPrice } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      // When start, spendable is equal to balance or token Balance
      THIS.fWalletBalance = await getETHBalance(mainAccount.address)
      let unlocked = await OxObject.hasProxyAllowanceAsync(mainAccount.address, cardSelected.address)
      let getSpendableAmount
      let getOrderedAmount = await DexAPI.getOrderedAmount(mainAccount.address, cardSelected.address)
      let getTokenTrading = await DexAPI.getTokenDataWithChart(cardSelected.address)
      if (getOrderedAmount) {
        if (cardSelected.address.toString() === WETH_ADDRESS) {
          getSpendableAmount = convertWeiToBalance(getOrderedAmount.totalActiveBuy)
        } else {
          getSpendableAmount = convertWeiToBalance(getOrderedAmount.totalActiveSell, cardSelected.decimals)
        }
      }
      let transactionFee = convertWeiToBalance(Number(gasPrice.slow + 5) * Number(gasLimit), 9)
      THIS.fBalanceCoinSelected = await getTokenBalance(cardSelected.address, mainAccount.address, cardSelected.decimals)
      THIS.setState({
        transactionFee,
        feeError: transactionFee > THIS.fWalletBalance,
        fSpendable: THIS.fBalanceCoinSelected,
        isLoadingSpendable: false,
        getOrderedAmount: Number(cardSelected.balance) - Number(getSpendableAmount),
        getTokenTrading: getSpendableAmount,
        loadingGetOrderedAmount: false,
        unlocked
      })
    } else {
      THIS.setState({ isLoadingSpendable: false })
    }
  }
}

export const fetchTokenTxsHistory = () => {
  return (dispatch, getState) => {
    const { internetData, cardSelected, arrCardData, arrTokenHistoryDataAll } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    // get list history transaction
    let arrTxt = []
    if (arrTokenHistoryDataAll && arrTokenHistoryDataAll.cardsTxs) {
      arrTxt = arrTokenHistoryDataAll.cardsTxs[cardSelected.address] || []
      dispatch(setTokenHistory({
        isLoading: false,
        datas: arrTxt
      }))
    }
    let tempData = arrTxt.slice(0, CONSTANTS.PAGE_LENGTH)
    if (tempData.length > 0) {
      THIS.setState({
        pageTxt: 1,
        arrHistoryTxs: tempData,
        hasMore: true,
        isLoadMore: false
      })
    } else {
      THIS.setState({
        hasMore: false,
        isLoadMore: false,
        isLoadingTxs: true
      })
    }
    if (internetData) {
      ReduxServices.refreshTokenTxsHistory(cardSelected, mainAccount).then(() => {
        THIS.setState({
          pageTxt: 0,
          arrHistoryTxs: [],
          hasMore: true,
          isLoadMore: false,
          isLoadingTxs: false
        }, () => THIS.props.handleInfiniteOnLoad())
      }).catch(err => {
        console.log(err)
        THIS.setState({
          isLoadingTxs: false
        })
      })
    } else {
      THIS.setState({
        isLoadingTxs: false
      })
    }
  }
}

export const fetchTokenPrice = () => {
  return async (dispatch, getState) => {
    const { tokenPrice } = THIS.state
    const { cardSelected, internetData, arrCurrencyData, etherPrice } = THIS.props
    if (internetData) {
      // Get exchange rate of token
      console.log('cardSelected', cardSelected)
      let fTokenConvert = 0
      if (cardSelected.tokenId.toString().trim().length > 0) { // get token price from CoinmarketCap
        let res = await DexAPI.getCoinInfo(cardSelected.symbol, arrCurrencyData, cardSelected.tokenId, cardSelected.name)
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
        let res = await DexAPI.getTokenDataWithChart(cardSelected.address)
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

export const onChangeReceiverAccount = (value) => {
  return (dispatch, getState) => {
    handleValidateAddr(value)
  }
}

const handleValidateAddr = (newAddress) => {
  const { txtReceiveAddr } = THIS.state
  // Check valid format address ethereum
  if (!validateAddress(newAddress)) {
    // Clear data and error when no input
    if (newAddress.length === 0) {
      THIS.setState({
        isDisableSend: true,
        isAddressErr: false,
        isFeeErr: false,
        txtReceiveAddr: ''
      }, () => calculateFeeETH())
    } else {
      // remove input when error
      THIS.setState({ txtReceiveAddr, isLoadingSpendable: false }, () => checkOpenSending())
    }
  } else {
    if ((newAddress.startsWith('0x') && newAddress.length === 42)) {
      // Final success checking
      THIS.setState({ isQrCodeAddress: false, txtReceiveAddr: newAddress, isAddressErr: false }, () => {
        calculateFeeETH()
        checkOpenSending()
      })
    } else {
      // Final fail checking
      THIS.setState({
        txtReceiveAddr: newAddress,
        isAddressErr: true,
        isDisableSend: true
      })
    }
  }
}

export const handleInfiniteOnLoad = () => {
  return (dispatch, getState) => {
    const { arrHistoryTxs, pageTxt, hasMore, isLoadMore } = THIS.state
    const { arrCardData, arrTokenHistoryData, arrTokenHistoryDataAll, cardSelected } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    let arrTxt = []
    if (arrTokenHistoryData && arrTokenHistoryData.datas && arrTokenHistoryData.datas.length > 0) {
      arrTxt = arrTokenHistoryData.datas[0].contractAddress.toLowerCase() === cardSelected.address.toLowerCase() && (mainAccount.address.toLowerCase() === arrTokenHistoryData.datas[0].fromAddr.toLowerCase() || mainAccount.address.toLowerCase() === arrTokenHistoryData.datas[0].toAddr.toLowerCase())
        ? arrTokenHistoryData.datas 
        : (
          arrTokenHistoryDataAll.cardsTxs[cardSelected.address] 
            ? arrTokenHistoryDataAll.cardsTxs[cardSelected.address] 
            : []
        )
    }
    if (isLoadMore || !hasMore) return
    // Handle load more
    THIS.setState({
      isLoadMore: true
    }, async () => {
      if (arrTxt.length > 0) {
        var tempData = arrTxt.slice(pageTxt * CONSTANTS.PAGE_LENGTH, (pageTxt + 1) * CONSTANTS.PAGE_LENGTH)
        if (tempData.length > 0) {
          THIS.setState({
            pageTxt: pageTxt + 1,
            arrHistoryTxs: arrHistoryTxs.concat(tempData),
            hasMore: true,
            isLoadMore: false
          })
        } else {
          THIS.setState({
            hasMore: false,
            isLoadMore: false
          })
        }
      }
    })
  }
}

export const handleUpdateHistoryDataAll = () => {
  return (dispatch, getState) => {
    console.log('handleUpdateHistoryDataAll')
    const { pageTxt, hasMore, isLoadMore } = THIS.state
    const { arrTokenHistoryData } = THIS.props
    let arrTxt = []
    if (arrTokenHistoryData.datas.length > 0) {
      arrTxt = arrTokenHistoryData.datas
    }
    if (isLoadMore || !hasMore) return
    // Handle load more
    THIS.setState({
      isLoadMore: true
    }, async () => {
      if (arrTxt.length > 0) {
        let tempData = arrTxt.slice(0, (pageTxt + 1) * CONSTANTS.PAGE_LENGTH)
        if (tempData.length > 0) {
          THIS.setState({
            pageTxt: pageTxt + 1,
            arrHistoryTxs: tempData,
            hasMore: true,
            isLoadMore: false
          })
        } else {
          THIS.setState({
            hasMore: false,
            isLoadMore: false
          })
        }
        THIS.forceUpdate()
      }
    })
  }
}

const calculateSendAmount = (newAmount, newMoneyAmount) => {
  const { fSpendable } = THIS.state
  const { internetData, cardSelected } = THIS.props
  const { fTokenConvert } = THIS
  console.log('newAmount', newAmount)
  console.log('fTokenConvert', fTokenConvert)

  if (internetData) {
    // Check format number only
    if (!validateNumber(newAmount)) {
      // Clear data and error when no input
      if (newAmount.length === 0) {
        THIS.setState({ isDisableSend: true, isSendAmountErr: false, txtSendAmount: '', txtFiatAmount: '' })
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
            let txtFiatAmount = newMoneyAmount || formatNumberLeftZeroCal(fTokenConvert * newAmountNum, 6)
            console.log('txtFiatAmount', txtFiatAmount)
            if (newAmountNum > (fSpendable) || newAmountNum <= 0) {
              // Final fail checking
              THIS.setState({
                isSendAmountErr: true,
                txtSendAmount: newAmount,
                txtFiatAmount,
                isDisableSend: true
              })
            } else {
              // Final success checking
              THIS.setState({
                isSendAmountErr: false,
                txtSendAmount: newAmount,
                txtFiatAmount
              }, () => { checkOpenSending() })
            }
          }
        }
      }
    }
  } else {
    THIS.setState({ txtSendAmount: newAmount })
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
            let txtReceiveFiatAmount = newMoneyAmount || formatNumberLeftZeroCal(fTokenConvert * newAmountNum, 6)
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

const checkOpenSending = () => {
  const { isAddressErr, isSendAmountErr, isFeeErr, txtReceiveAddr, fGasFee, txtSendAmount } = THIS.state

  if (!isAddressErr && !isSendAmountErr && isFeeErr === false) {
    if (txtReceiveAddr.length > 0 && fGasFee.toString().length > 0 && txtSendAmount.length > 0) {
      THIS.setState({ isDisableSend: false })
    } else {
      THIS.setState({ isDisableSend: true })
    }
  } else {
    THIS.setState({ isDisableSend: true })
  }
}

const calculateFeeETH = async (isSetMax = false) => {
  const { txtReceiveAddr, isAddressErr, iCountPercent, fSpendable, txtSendAmount, transactionFee } = THIS.state
  const { internetData, cardSelected, arrCardData } = THIS.props
  const { fWalletBalance } = THIS
  const { fBalanceCoinSelected } = THIS

  if (internetData) {
    THIS.setState({ isLoadingSpendable: true })
    if (isSetMax) {
      let fNewFee = 0
      fNewFee = transactionFee
      // Check eth amount and condition for open sending
      THIS.setState({
        fSpendable: fBalanceCoinSelected,
        fGasFee: fNewFee,
        isFeeErr: fWalletBalance < fNewFee
      }, () => {
        let cardSelectedDecimal = cardSelected.decimals > 8 ? 8 : cardSelected.decimals
        calculateSendAmount(roundingNumber(fBalanceCoinSelected, cardSelectedDecimal).toString())
      })
    } else {
      let fNewFee = 0
      fNewFee = transactionFee
      // Check eth amount and condition for open sending
      THIS.setState({
        fSpendable: fBalanceCoinSelected,
        fGasFee: fNewFee,
        isFeeErr: fWalletBalance < fNewFee
      }, () => {
        calculateSendAmount(txtSendAmount)
      })
    }
    THIS.setState({ isLoadingSpendable: false })
  } else {
    THIS.setState({ isLoadingSpendable: false })
  }
}

export const onChangeEthereumAmount = (newAmount) => {
  return (dispatch, getState) => {
    calculateSendAmount(newAmount.trim())
  }
}

export const onChangeReceiveEthereumAmount = (newAmount) => {
  return (dispatch, getState) => {
    calculateReceiveAmount(newAmount.trim())
  }
}

export const onChangeCurrencyAmount = (newMoney) => {
  return (dispatch, getState) => {
    const { internetData } = THIS.props
    const { fTokenConvert } = THIS
    if (internetData) {
      // Check format number only
      if (!validateNumber(newMoney)) {
        // Clear data and error when no input
        if (newMoney.length === 0) {
          THIS.setState({ isSendAmountErr: false, txtSendAmount: '', txtFiatAmount: '' })
        }
      } else {
        // Check clear first dots
        if (newMoney.toString() !== '.') {
          let dotsCount = countDots(newMoney, '\\.')
          // Check only accept 1 dots
          if (dotsCount <= 1) {
            let isError = false
            let decimalCount = newMoney.length - newMoney.indexOf('.') - 1

            if (dotsCount === 1 && decimalCount > 6) {
              // Check if money decimal greater than 2
              isError = true
            }
            if (!isError) {
              // Convert to token amount format based on token Decimal
              console.log('fTokenConvert: ', fTokenConvert, fTokenConvert === 0, validateNumber(fTokenConvert))
              let sendAmount = 0
              if (validateNumber(fTokenConvert)) {
                sendAmount = (Number(newMoney) / fTokenConvert).toFixed(8)
              }
              calculateSendAmount(sendAmount.toString(), newMoney)
            }
          }
        }
      }
    } else {
      THIS.setState({ txtFiatAmount: newMoney })
    }
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

export const openAddressBook = () => {
  return (dispatch, getState) => {
    THIS.setState({ strSearchAccount: '' },
      () => THIS.refs.modalAccountBook.show())
  }
}

export const onAfterChangeSlide = (value) => {
  return (dispatch, getState) => {
    THIS.setState({sliderValue: value, iCountPercent: value / 100}, () =>
      calculateFeeETH()
    )
  }
}

export const cancelAction = (value) => {
  return (dispatch, getState) => {
    THIS.props.backToDetail()
  }
}

export const sendAction = (value) => {
  return (dispatch, getState) => {
    const { txtSendAmount } = THIS.state
    const { arrPinCodeData, cardSelected, t } = THIS.props
    // check maximum decimal allow for amount
    let arrAmountDigit = txtSendAmount.toString().split('.')
    let decimalCountAmount = txtSendAmount.toString().length - txtSendAmount.toString().indexOf('.') - 1
    if (arrAmountDigit.length > 1 && decimalCountAmount > cardSelected.decimals) {
      if (Number(cardSelected.decimals) === 0) {
        swal({
          width: '250px',
          text: t('InputIntegerAmountOnly'),
          type: 'error',
          showConfirmButton: false
        })
      } else {
        swal({
          width: '250px',
          text: t('ppInputMaximum', {number: cardSelected.decimals}),
          type: 'error',
          showConfirmButton: false
        })
      }
      return
    }

    if (arrPinCodeData.length > 0) {
      THIS.setState({
        isConfirmPinCode: true
      })
      THIS.refs.modalConfirmPinCode.show()
    } else {
      if (value === ACCOUNT_DETAIL_SUB_VIEW.CONFIRM_SEND) {
        THIS.refs.modalConfirmSendScreen.show()
      }
      THIS.setState({
        isGotoConfirmScreen: true,
        isSlideLeft: true
      })
    }
  }
}

export const selectChange = (value) => {
  return (dispatch, getState) => {
    THIS.setState({
      dropdownValue: value,
      isShowDropDown: false
    })
  }
}

export const renderDropdownValue = (value) => {
  return (
    <div className="dropdown-it">
      <span className="dropdown-label-show">{value.label}</span>
    </div>
  )
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

export const selectAccountBook = (item) => {
  return (dispatch, getState) => {
    THIS.setState({
      txtReceiveAddr: item.address,
      isAddressErr: false
    })
    handleValidateAddr(item.address)
    THIS.refs.modalAccountBook.hide()
  }
}

export const searchAccountBook = (strSearch) => {
  return (dispatch, getState) => {
    THIS.setState({
      strSearchAccount: strSearch
    })
  }
}

export const onCompleteInputPINCode = (value, THIS) => {
  return (dispatch, getState) => {
    const {countInput} = THIS.state
    const {t, that} = THIS.props
    const { arrPinCodeData } = getState()

    if (countInput === -1) {
      if (arrPinCodeData === value) {
        THIS.setState({ isSuccess: true })
        if (THIS.props.showView === 'withdraw') {
          THIS.props.setIsActiveWithdrawScreen(true)
          that.setState({ showView: '' })
        } else {
          that.refs.modalConfirmSendScreen.show()
        }
      } else {
        THIS.setState({ isErrorCurrentPIN: true, txtError: t('PinCodeNotMatched') })
        setTimeout(() => {
          THIS.pin.clear()
        }, 100)
        THIS.pin.focus()
      }
    }
  }
}
/**
* @name : onWithdrawAction
* @param :
* @description : excuse button withraw
*/
export const onWithdrawAction = () => {
  return (dispatch, getState) => {
    const { arrPinCodeData } = THIS.props

    if (arrPinCodeData.length > 0) {
      THIS.setState({
        showView: 'withdraw',
        isConfirmPinCode: true
      })
      THIS.refs.modalConfirmPinCode.show()
    } else {
      THIS.setState({
        isGotoWithdrawScreen: true,
        isSlideLeft: true
      })
    }
  }
}

export const changeChartTime = (chartTime) => {
  return (dispatch, getState) => {
    THIS.setState({chartTime})
  }
}

export const handleChangeGasPrice = (res) => {
  return (dispatch, getState) => {
    const { fWalletBalance } = THIS
    THIS.setState({
      gasInput: res.gasInput,
      transactionFee: res.transactionFee,
      feeError: res.transactionFee > fWalletBalance
    }, () => calculateFeeETH())
  }
}

export const onClickOutPINCode = (value) => {
  return (dispatch, getState) => {
    if (THIS.pin) {
      THIS.pin.clear()
      THIS.pin.focus()
    }
  }
}

export const triggerSwitchedAccount = (event, data) => {
  return async (dispatch, getState) => {
    const { cardSelected, arrCurrencyData } = THIS.props
    if (data) {
      const addressInfo = await DexAPI.getAddressInfo(data.address, arrCurrencyData)
      if (addressInfo && !addressInfo.error) {
        let tokenFind = addressInfo.tokens.find(e => e.address.toLowerCase() === cardSelected.address.toLowerCase())
        if (tokenFind) {
          THIS.props.loadingInitial()
          THIS.props.fetchTokenTxsHistory()
          THIS.props.fetchTokenPrice()
        } else {
          THIS.props.backToDetail()
        }
      }
    }
  }
}

export const onSwitchKyberSwap = (selectedCoinSwap) => {
  return (dispatch) => {
    Observer.emit(OBSERVER_KEY.SELECT_TAB_ETHER)
    setTimeout(() => {
      Observer.emit(OBSERVER_KEY.OPEN_KYBER_SWAP, selectedCoinSwap)
    }, 500)
  }
}
