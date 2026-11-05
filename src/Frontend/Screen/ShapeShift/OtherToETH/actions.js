
import Shapeshift from 'Backend/Api/services/ShapeShift'
import { convertObjectToArray, validateNumber, countDots, formatNumber } from 'Utils/globalFunction'
import * as Vibrant from 'node-vibrant'
import swal from 'sweetalert2'
// const ShapeShiftUrl = 'https://shapeshift.io'

var THIS
var backgroundCheckTxs
export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const fetchInitData = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    const { coinLeft, coinRight } = THIS.state
    if (internetData) {
      let objListCoin = await Shapeshift.getcoins()
      let arrListCoinConvert = objListCoin ? convertObjectToArray(objListCoin) : []
      let arrListCoin = []
      let coinLeftTemp = coinLeft
      let coinEthereum = coinRight
      arrListCoinConvert.map(async (item, index) => {
        if (item.status === 'available') {
          let colorTemp = 'rgb(244,148,28)'
          // let imageUrl = ShapeShiftUrl + item.image
          try {
            await Vibrant.from(item.image).quality(1)
              .clearFilters().getPalette()
              .then((palette) => {
                if (palette && palette.Vibrant) {
                  var rgb = palette.Vibrant.getRgb()
                  colorTemp = 'rgb(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ')'
                }
              })
          } catch (error) {
            console.log(error)
          }

          let objCoin = {
            key: index,
            image: item.image,
            name: item.name,
            symbol: item.symbol,
            color: colorTemp
          }
          if (item.symbol === 'BTC') {
            coinLeftTemp = objCoin
          }
          if (item.symbol === 'ETH') {
            coinEthereum.color = '#fefefe'
          } else {
            arrListCoin.push(objCoin)
          }
        }
      })
      let marketInfo = await Shapeshift.getRateOtherToEth(objListCoin.BTC.symbol)
      THIS.setState({
        marketInfo,
        fRateConvert: marketInfo.rate,
        arrListCoin,
        objListCoin,
        coinLeft: coinLeftTemp,
        coinRight: coinEthereum
      })
    }
  }
}

export const fetchRateEthToAnother = (coinLeft) => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props

    if (internetData) {
      let marketInfo = await Shapeshift.getRateOtherToEth(coinLeft.symbol)
      THIS.setState({
        coinLeft,
        coinColor: coinLeft.color,
        fRateConvert: marketInfo.rate,
        marketInfo
      })
    }
  }
}

export const onSelectCoin = (item) => {
  return async (dispatch, getState) => {
    const { txtCoinSelected } = THIS.state
    const { internetData } = THIS.props

    THIS.props.onChangeRefundAccount('')

    if (internetData) {
      THIS.setState({
        marketInfo: null,
        fRateConvert: 0,
        heightListCoin: 0,
        coinLeft: item
      })
      let marketInfo = await Shapeshift.getRateOtherToEth(item.symbol)
      THIS.setState({
        marketInfo: marketInfo,
        fRateConvert: marketInfo.rate,
        heightListCoin: 0,
        coinLeft: item
      })
      THIS.forceUpdate()
      THIS.props.onChangeCoinSelected(txtCoinSelected)
    }
  }
}

export const onSelectCard = (item) => {
  return async (dispatch, getState) => {
    const { txtEther } = THIS.state

    THIS.setState({
      coinRight: item
    })
    THIS.forceUpdate()
    THIS.props.onChangeEther(txtEther)
  }
}

export const onChangeEther = (txtEther) => {
  return (dispatch, getState) => {
    const { fRateConvert, marketInfo, coinRight } = THIS.state

    if (txtEther.length === 0) {
      THIS.setState({
        txtEther,
        isCoinSelectedPlaceholder: true,
        txtCoinSelected: '',
        isMinErr: false,
        isNotEnoughEthErr: false
      })
      return
    }

    let amountExchange = validateAmount(txtEther)

    if (amountExchange) {
    // User can input if pass all previous condition
      let newAmountNum = Number(amountExchange)
      // Convert to Money amount format max 2 decimal
      let txtCoinSelected = (amountExchange / fRateConvert).toFixed(8)

      if (newAmountNum > Number(coinRight.balance).toFixed(8)) {
      // Final fail checking
        THIS.setState({
          isSendAmountErr: true,
          isMinErr: false,
          isNotEnoughEthErr: true,
          isMinerErr: false,
          txtCoinSelected: txtCoinSelected !== Infinity ? txtCoinSelected : '',
          isCoinSelectedPlaceholder: false,
          txtEther
        })
      } else {
      // Final success checking
        let isMinErr = null

        if (newAmountNum < marketInfo.minimum.toFixed(8)) {
          isMinErr = true
        } else if (newAmountNum > marketInfo.maxLimit.toFixed(8)) {
          isMinErr = false
        }

        THIS.setState({
          isMinErr,
          isNotEnoughEthErr: false,
          isSendAmountErr: false,
          isCoinSelectedPlaceholder: false,
          txtCoinSelected: txtCoinSelected !== Infinity ? txtCoinSelected : '',
          txtEther
        })
      }
    }
  }
}

export const onClickMax = () => {
  return (dispatch, getState) => {
    const { marketInfo } = THIS.state

    THIS.props.onChangeCoinSelected(marketInfo ? formatNumber(marketInfo.maxLimit) : '')
  }
}
export const onClickMin = () => {
  return (dispatch, getState) => {
    const { marketInfo } = THIS.state

    THIS.props.onChangeCoinSelected(marketInfo ? formatNumber(marketInfo.minimum) : '')
  }
}
export const onChangeCoinSelected = (txtCoinSelected) => {
  return (dispatch, getState) => {
    const { fRateConvert, marketInfo, coinRight } = THIS.state

    if (txtCoinSelected.length === 0) {
      THIS.setState({
        txtCoinSelected,
        isCoinSelectedPlaceholder: true,
        txtEther: '',
        isMinErr: false,
        isNotEnoughEthErr: false
      })
      return
    }
    let amountExchange = validateAmount(txtCoinSelected)
    if (amountExchange) {
      let newAmountNum = Number(amountExchange)
      // Convert to Money amount format max 2 decimal
      let txtEther = (newAmountNum * fRateConvert).toFixed(8)

      if (txtEther > coinRight.balance) {
      // Final fail checking
        THIS.setState({
          isSendAmountErr: true,
          isMinErr: false,
          isNotEnoughEthErr: true,
          txtCoinSelected,
          txtEther: txtEther !== 'Infinity' ? txtEther : '',
          isCoinSelectedPlaceholder: txtCoinSelected.length === 0
        })
      } else {
        let isMinErr = null
        if (txtEther < marketInfo.minimum) {
          isMinErr = true
        } else if (txtEther > marketInfo.maxLimit) {
          isMinErr = false
        }
        // Final success checking
        THIS.setState({
          isMinErr,
          isSendAmountErr: false,
          txtCoinSelected,
          txtEther: txtEther !== 'Infinity' ? txtEther : '',
          isNotEnoughEthErr: false,
          isCoinSelectedPlaceholder: txtCoinSelected.length === 0
        })
      }
    }
  }
}

const validateAmount = (newAmount, isFiat = false) => {
  // Check format number only
  if (!validateNumber(newAmount)) {
    // Clear data and error when no input
    if (newAmount.length === 0) {
      THIS.setState({ isDisableExchange: true,
        isSendAmountErr: false,
        isMinErr: null,
        txtEthAmount: '',
        txtEthFiatAmount: '',
        txtCoinAmount: '',
        txtCoinFiatAmount: '' })
      return null
    }
  } else {
    // Check clear first dots
    if (newAmount.toString() !== '.') {
      let dotsCount = countDots(newAmount, '\\.')
      // Check only accept 1 dots
      if (dotsCount <= 1) {
        let isError = false
        let decimalCount = newAmount.length - newAmount.indexOf('.') - 1

        if (dotsCount === 1 && decimalCount > (isFiat ? 2 : 8)) {
          isError = true
        }

        if (!isError) {
          return newAmount
        }
      }
    }
  }
}

export const onChangeRefundAccount = (txtDestination) => {
  return (dispatch, getState) => {
    THIS.setState({
      txtDestination,
      isDestinationError: false,
      isShowNextBtn: true,
      isCheckRefound: false
    })
  }
}

export const checkRefundAccount = (txtDestination, symbol) => {
  return (dispatch, getState) => {
    const { coinRight, coinLeft } = THIS.state
    const { t, internetData } = THIS.props
    THIS.setState({
      isCheckRefound: true
    }, async () => {
      if (internetData) {
        if (await Shapeshift.getValidateAddress(txtDestination, symbol)) {
          let txsCreate = await Shapeshift.exchangeCoinNoAmount(coinRight.address, coinLeft.symbol, txtDestination)
          console.log(txsCreate)
          if (txsCreate.error) {
            THIS.setState({ isDestinationError: false, isCheckRefound: false })
            swal({
              width: '300px',
              text: t('createShiftErr'),
              type: 'error',
              showConfirmButton: false
            })
          } else {
            backgroundCheckTxs = setInterval(() => {
              checkProgressExchange()
            }, 4000)
            THIS.setState({ depositAddr: txsCreate.deposit, isActiveExchange: true, isDestinationError: false, isCheckRefound: false })
          }
        } else {
          THIS.setState({
            isDestinationError: true,
            isCheckRefound: false
          })
        }
      } else {
        THIS.setState({
          isCheckRefound: false
        })
      }
    }
    )
  }
}

export const handleCopyQRCode = () => {
  return (dispatch, getState) => {
    const { t } = THIS.props

    swal({
      width: '300px',
      text: t('qrCopied'),
      type: 'success',
      showConfirmButton: false
    })
  }
}

export const doAnotherTxs = () => {
  return (dispatch, getState) => {
    clearInterval(backgroundCheckTxs)
    THIS.setState({ isActiveExchange: false }, () => {
      clearAfterChooseCoin()
    })
  }
}

export const cancelTrackingTx = () => {
  return async (dispatch, getState) => {
    const { t } = THIS.props
    await Shapeshift.cancelPendingTxs()
    clearInterval(backgroundCheckTxs)
    swal({
      width: '300px',
      text: t('cancelSuccess'),
      type: 'success',
      showConfirmButton: false
    })
    setTimeout(() => {
      clearInterval(backgroundCheckTxs)
      THIS.setState({ isActiveExchange: false }, () => {
        clearAfterChooseCoin()
      })
    }, 2400)
  }
}

const checkProgressExchange = async () => {
  const { t } = THIS.props
  const { depositAddr, iStageExchange } = THIS.state
  const txStt = await Shapeshift.checkTxStatus(depositAddr)
  console.log('checkProgressExchange ', txStt)
  if (txStt.status === 'received') {
    iStageExchange !== 1 && THIS.setState({ iStageExchange: 1 })
  } else if (txStt.status === 'complete' && iStageExchange !== 3) {
    clearInterval(backgroundCheckTxs)
    THIS.setState({ iStageExchange: 2, amountDepo: txStt.incomingCoin, amountWidthdraw: txStt.outgoingCoin })
    setTimeout(() => {
      THIS.setState({ iStageExchange: 3 })
    }, 2000)
  } else if (txStt.status === 'failed') {
    swal({
      width: '300px',
      text: t('shipFailed'),
      type: 'error',
      showConfirmButton: false
    })
    clearInterval(backgroundCheckTxs)
    setTimeout(() => {
      THIS.setState({ isActiveExchange: false }, () => {
        clearAfterChooseCoin()
      })
    }, 3000)
  }
}

const clearAfterChooseCoin = () => {
  THIS.setState({
    txtDestination: '',
    depositAddr: '',
    txtEther: '',
    txtCoinSelected: '',
    iStageExchange: 0,
    isCoinSelectedPlaceholder: true
  })
}

export const inputEther = (percent) => {
  return (dispatch, getState) => {
    const { fRateConvert, coinRight, marketInfo } = THIS.state
    if (fRateConvert) {
      switch (percent) {
      case 'all':
        THIS.setState({
          txtEther: Number(coinRight.balance)
        })
        THIS.props.onChangeEther(formatNumber(coinRight.balance))
        break
      case 'half':
        THIS.setState({
          txtEther: Number(coinRight.balance) / 2
        })
        THIS.props.onChangeEther(formatNumber(coinRight.balance) / 2)
        break
      default:
        THIS.setState({
          txtEther: marketInfo.minimum
        })
        THIS.props.onChangeEther((marketInfo.minimum).toString())
      }
    }
  }
}

export const onBack = () => {
  return (dispatch, getState) => {
    THIS.props.history.push('/mainTabbar/shapeShiftScreen')
  }
}
