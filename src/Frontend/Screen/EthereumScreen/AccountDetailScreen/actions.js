import React from 'react'
import { getETHBalance } from 'Backend/Lib/Web3/index'
import { CONSTANTS, ACCOUNT_DETAIL_SUB_VIEW } from 'Utils/globalConstants'
import { validateAddress, validateNumber, countDots, convertWeiToBalance, logDebugChatwork, formatNumber, filterMainAccount } from 'Utils/globalFunction'
import swal from 'sweetalert2'
import ReduxServices from 'Utils/globalRedux'
import { setEtherHistory } from 'Backend/Redux/actions/globalActions'
import ChatworkAPI from 'Backend/Api/services/ChatworkAPI'

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

export const clickOnCell = (card) => {
  return (dispatch, getState) => {
    THIS.setState({ objSelectItemHistoryDetail: card }, () => THIS.refs.modalHistoryDetail.show())
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { internetData, cardSelected, arrCardData, gasStation } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    const { gasLimit } = THIS.state
    if (internetData) {
      // When start, spendable is equal to balance or token Balance
      THIS.fWalletBalance = await getETHBalance(cardSelected.address)
      let transactionFee = convertWeiToBalance(Number(gasStation.slow + 5) * Number(gasLimit), 9)
      let fSpendable
      if (THIS.fWalletBalance >= transactionFee) {
        fSpendable = THIS.fWalletBalance - transactionFee
      } else {
        THIS.setState({ isLoadingSpendable: false })
      }
      THIS.setState({
        transactionFee,
        feeError: transactionFee > THIS.fWalletBalance,
        fSpendable,
        isLoadingSpendable: false
      })
    } else {
      THIS.setState({ isLoadingSpendable: false })
    }
  }
}

export const fetchEtherTxsHistory = () => {
  return (dispatch, getState) => {
    try {
      const { cardSelected, arrAccountHistoryDataAll, internetData } = THIS.props
      let arrTxt = []
      if (arrAccountHistoryDataAll && arrAccountHistoryDataAll.cardsTxs) {
        arrTxt = arrAccountHistoryDataAll.cardsTxs[cardSelected.address] || []
        dispatch(setEtherHistory({
          isLoading: false,
          datas: arrTxt
        }))
        
      }
      if (arrTxt && arrTxt.length > 0) {
        let tempData = arrTxt.slice(0, CONSTANTS.PAGE_LENGTH)
        if (tempData.length > 0) {
          THIS.setState({
            pageTxt: 1,
            historyData: tempData,
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
      if (internetData) {
        ReduxServices.refreshEtherTxsHistory(cardSelected).then(() => {
          THIS.setState({
            pageTxt: 0,
            historyData: [],
            hasMore: true,
            isLoadMore: false
          }, () => THIS.props.handleInfiniteOnLoad())
        })
      }
    } catch (err) {
      logDebugChatwork('fetchEtherTxsHistory', err)
    }
  }
}

export const onChangeReceiverAccount = (value) => {
  return (dispatch, getState) => {
    handleValidateAddr(value)
  }
}

const handleValidateAddr = (newAddress) => {
  try {
    const { txtReceiveAddr } = THIS.state
    // Check valid format address ethereum
    if (!validateAddress(newAddress)) {
      // Clear data and error when no input
      if (newAddress.length === 0) {
        THIS.setState({
          isDisableSend: true,
          isFeeErr: false,
          isAddressErr: false,
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
  } catch (err) {
    logDebugChatwork('handleValidateAddr', err)
  }
}

const calculateSendAmount = (newAmount, newMoneyAmount) => {
  try {
    const { fSpendable } = THIS.state
    const { internetData, etherPrice } = THIS.props

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
              let txtFiatAmount = newMoneyAmount || (etherPrice.price * newAmountNum).toFixed(2)
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
  } catch (err) {
    logDebugChatwork('calculateSendAmount', err)
  }
  
}

const calculateReceiveAmount = (newAmount, newMoneyAmount) => {
  try {
    const { internetData, etherPrice } = THIS.props

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
              let txtReceiveFiatAmount = newMoneyAmount || (etherPrice.price * newAmountNum).toFixed(2)
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
  } catch (err) {
    logDebugChatwork('calculateReceiveAmount', err)
  }
}

const checkOpenSending = () => {
  try {
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
  } catch (err) {
    logDebugChatwork('checkOpenSending', err)
  }
}

const calculateFeeETH = async (isSetMax = false) => {
  try {
    const { txtSendAmount, transactionFee } = THIS.state
    const { internetData } = THIS.props
    const { fWalletBalance } = THIS
    if (internetData) {
      THIS.setState({ isLoadingSpendable: true })
      // Check send type MAX
      if (isSetMax) {
        let fSpendable = fWalletBalance
        let fNewFee = 0
        fNewFee = transactionFee
        if (!fSpendable || !fNewFee) {
          THIS.setState({ isLoadingSpendable: false })
          return
        }
        fSpendable = (fSpendable - fNewFee) < 0 ? 0 : (fSpendable - fNewFee)
        
        THIS.setState({
          fSpendable,
          fGasFee: fNewFee,
          isFeeErr: fWalletBalance < fNewFee
        }, () => {
          calculateSendAmount(formatNumber(fSpendable))
        })
      } else {
        let fSpendable = fWalletBalance
        let fNewFee = 0

        fNewFee = transactionFee
        // Check send type ACCOUNT
        fSpendable = (fSpendable - fNewFee) < 0 ? 0 : (fSpendable - fNewFee)

        // Check eth amount and condition for open sending
        THIS.setState({
          fSpendable,
          fGasFee: fNewFee,
          isFeeErr: fSpendable === 0
        }, () => {
          calculateSendAmount(txtSendAmount)
        })
      }
      THIS.setState({ isLoadingSpendable: false })
    } else {
      THIS.setState({ isLoadingSpendable: false })
    }
  } catch (err) {
    THIS.setState({ isLoadingSpendable: false })
    logDebugChatwork('calculateFeeETH', err)
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
    try {
      const { internetData, etherPrice } = THIS.props

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

              if (dotsCount === 1 && decimalCount > 2) {
                // Check if money decimal greater than 2
                isError = true
              }
              if (!isError) {
                // Convert to token amount format based on token Decimal
                let sendAmount = (Number(newMoney) / etherPrice.price).toFixed(8)

                calculateSendAmount(sendAmount, newMoney)
              }
            }
          }
        }
      } else {
        THIS.setState({ txtFiatAmount: newMoney })
      }
    } catch (err) {
      logDebugChatwork('onChangeCurrencyAmount', err)
    }
  }
}

export const onChangeReceiveCurrencyAmount = (newMoney) => {
  return (dispatch, getState) => {
    try {
      const { internetData, etherPrice } = THIS.props

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
                let sendAmount = (Number(newMoney) / etherPrice.price).toFixed(8)

                calculateReceiveAmount(sendAmount, newMoney)
              }
            }
          }
        }
      } else {
        THIS.setState({ txtReceiveFiatAmount: newMoney })
      }
    } catch (err) {
      logDebugChatwork('onChangeReceiveCurrencyAmount', err)
    }
  }
}

export const openAddressBook = () => {
  return (dispatch, getState) => {
    THIS.setState({ 
      strSearchAccount: '' 
    }, () => THIS.refs.modalAccountBook.show())
  }
}

export const onAfterChangeSlide = (value) => {
  return (dispatch, getState) => {
    THIS.setState({
      sliderValue: value, 
      iCountPercent: value / 100
    }, () => calculateFeeETH())
  }
}

export const cancelAction = () => {
  return (dispatch, getState) => {
    THIS.props.backToDetail()
  }
}

export const sendAction = (value) => {
  return (dispatch, getState) => {
    try {
      const { arrPinCodeData } = THIS.props
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
          SUB_VIEW: value,
          isSlideLeft: true
        })
      }
    } catch (err) {
      logDebugChatwork('sendAction', err)
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

export const handleInfiniteOnLoad = () => {
  return (dispatch, getState) => {
    try {
      const { historyData, pageTxt, hasMore, isLoadMore } = THIS.state
      const { arrAccountHistoryData, arrAccountHistoryDataAll, cardSelected } = THIS.props
      let arrTxt = []
      if (arrAccountHistoryData && arrAccountHistoryData.datas && arrAccountHistoryData.datas.length > 0) {
        arrTxt = cardSelected.address.toLowerCase() === arrAccountHistoryData.datas[0].fromAddr.toLowerCase() || cardSelected.address.toLowerCase() === arrAccountHistoryData.datas[0].toAddr.toLowerCase()
          ? arrAccountHistoryData.datas
          : (
            arrAccountHistoryDataAll.cardsTxs[cardSelected.address] 
              ? arrAccountHistoryDataAll.cardsTxs[cardSelected.address] 
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
              historyData: historyData.concat(tempData),
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
    } catch (err) {
      logDebugChatwork('handleInfiniteOnLoad', err)
    }
  }
}

export const handleUpdateHistoryDataAll = () => {
  return (dispatch, getState) => {
    try {
      const { pageTxt, hasMore, isLoadMore } = THIS.state
      const { arrAccountHistoryData } = THIS.props
      let arrTxt = []
      if (arrAccountHistoryData && arrAccountHistoryData.datas && arrAccountHistoryData.datas.length > 0) {
        arrTxt = arrAccountHistoryData.datas
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
              historyData: tempData,
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
    } catch (err) {
      logDebugChatwork('handleUpdateHistoryDataAll', err)
    }
  }
}

export const selectAccountBook = (item) => {
  return (dispatch, getState) => {
    try {
      THIS.setState({
        txtReceiveAddr: item.address,
        isAddressErr: false
      })
      handleValidateAddr(item.address)
      THIS.refs.modalAccountBook.hide()
    } catch (err) {
      logDebugChatwork('selectAccountBook', err)
    }
  }
}

export const openBuyCreditCard = (VIEW) => {
  return (dispatch, getState) => {
    const { SUB_VIEW } = THIS.state

    if ((SUB_VIEW === ACCOUNT_DETAIL_SUB_VIEW.ACCOUNT_DETAIL) || (SUB_VIEW === ACCOUNT_DETAIL_SUB_VIEW.CONFIRM_SEND)) {
      // THIS.setState({SUB_VIEW: VIEW})
    }
  }
}

export const onCompleteInputPINCode = (value, THIS) => {
  return (dispatch, getState) => {
    try {
      const {countInput} = THIS.state
      const { t, that } = THIS.props
      const { arrPinCodeData } = getState()

      if (countInput === -1) {
        if (arrPinCodeData === value) {
          THIS.setState({ isSuccess: true })
          THIS.props.setIsActiveScreen(true)
          that.refs.modalConfirmSendScreen.show()
        } else {
          THIS.setState({ isErrorCurrentPIN: true, txtError: t('PinCodeNotMatched') })
          setTimeout(() => {
            THIS.pin.clear()
          }, 100)
          THIS.pin.focus()
        }
      }
    } catch (err) {
      logDebugChatwork('onCompleteInputPINCode', err)
    }
  }
}

export const handleChangeGasPrice = (res) => {
  return (dispatch, getState) => {
    try {
      const { fWalletBalance } = THIS
      THIS.setState({
        gasInput: res.gasInput,
        transactionFee: res.transactionFee,
        feeError: res.transactionFee > fWalletBalance
      }, () => calculateFeeETH())
    } catch (err) {
      logDebugChatwork('handleChangeGasPrice', err)
    }
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

export const openEditAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.mdEditAccount.show()
  }
}

export const closeEditAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.mdEditAccount.hide()
  }
}
