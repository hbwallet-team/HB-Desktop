
import Shapeshift from 'Backend/Api/services/ShapeShift'
import { convertObjectToArray, validateNumber, countDots, formatNumber } from 'Utils/globalFunction'
import * as Vibrant from 'node-vibrant'
import EtherLibrary from 'Backend/HBLibrary/EtherLibrary'
import swal from 'sweetalert2'

import Settings from 'Backend/settings'
var Web3 = require('web3')
var web3 = new Web3()
// web3.setProvider(new web3.providers.HttpProvider(Settings.server.networkInfura.url))

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
    const { coinRight, coinLeft } = THIS.state

    if (internetData) {
      let objListCoin = await Shapeshift.getcoins()
      let arrListCoinConvert = objListCoin ? convertObjectToArray(objListCoin) : []
      let arrListCoin = []
      let coinRightTemp = coinRight
      let coinEthereum = coinLeft
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
            coinRightTemp = objCoin
          }
          if (item.symbol === 'ETH') {
            coinEthereum.color = '#fefefe'
          } else {
            arrListCoin.push(objCoin)
          }
        }
      })
      let marketInfo = await Shapeshift.getRateEthToAnother(objListCoin.BTC.symbol)
      THIS.setState({
        marketInfo,
        fRateConvert: marketInfo.rate,
        arrListCoin,
        objListCoin,
        coinRight: coinRightTemp,
        coinLeft: coinEthereum
      })
    }
  }
}

export const fetchRateEthToAnother = (coinRight) => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props

    if (internetData) {
      let marketInfo = await Shapeshift.getRateEthToAnother(coinRight.symbol)
      THIS.setState({
        coinRight,
        coinColor: coinRight.color,
        fRateConvert: marketInfo.rate,
        marketInfo
      })
    }
  }
}

export const onSelectCoin = (item) => {
  return async (dispatch, getState) => {
    const { txtEther } = THIS.state
    const { internetData } = THIS.props

    if (internetData) {
      THIS.setState({
        marketInfo: null,
        fRateConvert: 0,
        heightListCoin: 0,
        coinRight: item,
        rateBtn: ''
      })
      let marketInfo = await Shapeshift.getRateEthToAnother(item.symbol)
      THIS.setState({
        marketInfo: marketInfo,
        fRateConvert: marketInfo.rate,
        heightListCoin: 0,
        coinRight: item
      })
      THIS.forceUpdate()
      THIS.props.onChangeEther(txtEther)
      THIS.props.onChangeDestination('')
    }
  }
}

export const onSelectCard = (item) => {
  return async (dispatch, getState) => {
    const { txtEther } = THIS.state

    THIS.setState({
      coinLeft: item,
      rateBtn: ''
    })
    THIS.forceUpdate()
    THIS.props.onChangeEther(txtEther)
  }
}

export const onClickMax = () => {
  return (dispatch, getState) => {
    const { marketInfo } = THIS.state

    THIS.props.onChangeEther(marketInfo ? formatNumber(marketInfo.maxLimit, 8) : '')
  }
}
export const onClickMin = () => {
  return (dispatch, getState) => {
    const { marketInfo } = THIS.state

    THIS.props.onChangeEther(marketInfo ? formatNumber(marketInfo.minimum, 8) : '')
  }
}
export const onChangeEther = (txtEther) => {
  return (dispatch, getState) => {
    const { fRateConvert, marketInfo, coinLeft } = THIS.state

    if (txtEther.length === 0) {
      THIS.setState({
        txtEther,
        isCoinSelectedPlaceholder: true,
        txtCoinSelected: '',
        isMinErr: false,
        isNotEnoughEthErr: false,
        rateBtn: ''
      })
      return
    }

    let amountExchange = validateAmount(txtEther)

    if (amountExchange) {
    // User can input if pass all previous condition
      let newAmountNum = Number(amountExchange)
      // Convert to Money amount format max 2 decimal
      let txtCoinSelected = (fRateConvert * amountExchange).toFixed(8)

      if (newAmountNum > Number(coinLeft.balance).toFixed(8)) {
      // Final fail checking
        THIS.setState({
          isSendAmountErr: true,
          isMinErr: false,
          isNotEnoughEthErr: true,
          isMinerErr: false,
          txtCoinSelected: txtCoinSelected !== Infinity ? txtCoinSelected : '',
          isCoinSelectedPlaceholder: false,
          txtEther,
          rateBtn: ''
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
          txtEther,
          rateBtn: ''
        })
      }
    }
  }
}
export const onChangeCoinSelected = (txtCoinSelected) => {
  return (dispatch, getState) => {
    const { fRateConvert, marketInfo, coinLeft } = THIS.state

    if (txtCoinSelected.length === 0) {
      THIS.setState({
        txtCoinSelected,
        isCoinSelectedPlaceholder: true,
        txtEther: '',
        isMinErr: false,
        isNotEnoughEthErr: false,
        rateBtn: ''
      })
      return
    }
    let amountExchange = validateAmount(txtCoinSelected)
    if (amountExchange) {
      let newAmountNum = Number(amountExchange)
      // Convert to Money amount format max 2 decimal
      let txtEther = (newAmountNum / fRateConvert).toFixed(8)

      if (txtEther > coinLeft.balance) {
      // Final fail checking
        THIS.setState({
          isSendAmountErr: true,
          isMinErr: false,
          isNotEnoughEthErr: true,
          txtCoinSelected,
          txtEther: txtEther !== 'Infinity' ? txtEther : '',
          isCoinSelectedPlaceholder: txtCoinSelected.length === 0,
          rateBtn: ''
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
          isCoinSelectedPlaceholder: txtCoinSelected.length === 0,
          rateBtn: ''
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

export const onChangeDestination = (txtDestination) => {
  return (dispatch, getState) => {
    THIS.setState({
      txtDestination,
      isDestinationError: false
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

const checkProgressExchange = async () => {
  const { t } = THIS.props
  const { depositAddr, iStageExchange } = THIS.state
  const txStt = await Shapeshift.checkTxStatus(depositAddr)
  console.log(txStt)
  if (txStt.status === 'received') {
    iStageExchange !== 1 && THIS.setState({ iStageExchange: 1 })
  } else if (txStt.status === 'complete') {
    clearInterval(backgroundCheckTxs)
    THIS.setState({ iStageExchange: 2 })
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
    setTimeout(() => {
      clearInterval(backgroundCheckTxs)
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

export const handleExchange = () => {
  return async (dispatch, getState) => {
    const { txtDestination, coinRight } = THIS.state
    const { internetData } = THIS.props
    if (internetData) {
      THIS.setState({
        isExchanging: true
      })
      THIS.forceUpdate()

      if (await Shapeshift.getValidateAddress(txtDestination, coinRight.symbol)) {
        exchange()
      } else {
        THIS.setState({
          isDestinationError: true,
          isExchanging: false
        })
      }
    }
  }
}

const exchange = async () => {
  const { txtCoinSelected, txtDestination, coinRight, coinLeft } = THIS.state
  const { t } = THIS.props

  let txsCreate = await Shapeshift.exchangeCoin(txtCoinSelected, txtDestination, coinRight.symbol, coinLeft.address)
  if (txsCreate.error) {
    THIS.setState({ isActiveExchange: true, isExchanging: false, depositAddr: txsCreate.deposit })
    swal({
      width: '300px',
      // text: t('createShiftErr'),
      text: txsCreate.error,
      type: 'error',
      showConfirmButton: false
    })
  } else {
    const txHash = await EtherLibrary.sendEtherAction(coinLeft.address, coinLeft.privateKey, txsCreate.deposit, txsCreate.depositAmount, 1)
    web3.eth.sendRawTransaction(txHash, (err, transactionHash) => {
      if (err) {
        THIS.setState({ isActiveExchange: true, isExchanging: false, depositAddr: txsCreate.deposit })
        swal({
          width: '300px',
          text: t('exchangeError'),
          type: 'error',
          showConfirmButton: false
        })
      } else {
        backgroundCheckTxs = setInterval(() => {
          checkProgressExchange()
        }, 4000)
        THIS.setState({ isActiveExchange: true, isExchanging: false, depositAddr: txsCreate.deposit })
        swal({
          width: '300px',
          text: t('exchangeSuccess'),
          type: 'success',
          showConfirmButton: false
        })
      }
    })
  }
}

export const inputEther = (percent) => {
  return (dispatch, getState) => {
    const { fRateConvert, coinLeft, marketInfo } = THIS.state
    if (fRateConvert) {
      switch (percent) {
      case 'all':
        THIS.setState({
          txtEther: Number(coinLeft.balance)
        })
        THIS.props.onChangeEther(formatNumber(coinLeft.balance))
        break
      case 'half':
        THIS.setState({
          txtEther: Number(coinLeft.balance) / 2
        })
        THIS.props.onChangeEther(formatNumber(coinLeft.balance) / 2)
        break
      default:
        THIS.setState({
          txtEther: marketInfo.minimum
        })
        THIS.props.onChangeEther((marketInfo.minimum).toString())
      }
    }
    THIS.setState({
      rateBtn: percent
    })
  }
}

export const onBack = () => {
  return (dispatch, getState) => {
    THIS.props.history.push('/mainTabbar/shapeShiftScreen')
  }
}

export const onCompleteInputPINCode = (value, THIS) => {
  return (dispatch, getState) => {
    const {countInput} = THIS.state
    const { t } = THIS.props
    const { arrPinCodeData } = getState()

    if (countInput === -1) {
      if (arrPinCodeData === value) {
        THIS.props.setIsActiveScreen(true)
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
