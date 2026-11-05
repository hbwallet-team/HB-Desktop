
import Shapeshift from 'Backend/Api/services/ShapeShift'
import * as Vibrant from 'node-vibrant'
import { convertObjectToArray, convertTimestampToDateTime } from 'Utils/globalFunction'

var THIS

const STATUS_CELL = {
  failed: 'failed',
  returned: 'returned',
  complete: 'complete',
  received: 'received'
}
export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const fetchInitData = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    if (internetData) {
      THIS.setState({isLoading: true})
      let arrTXHistory = await Shapeshift.getTXByApiKey()
      if (arrTXHistory.length === 0) { arrTXHistory = await Shapeshift.getTXByApiKey() }
      if (arrTXHistory.length === 0) { arrTXHistory = await Shapeshift.getTXByApiKey() }
      if (arrTXHistory.length > 0) {
        getShapeShiftListCoin(arrTXHistory)
      } else {
        THIS.setState({isLoading: false, arrTXHistory})
      }
    }
  }
}

const getColorStatus = (status) => {
  switch (status) {
  case STATUS_CELL.failed:
    return 'rgba(255, 78, 0, 0.8)'
  case STATUS_CELL.returned:
    return 'rgba(126, 127, 122, 0.7)'
  case STATUS_CELL.complete:
    return 'rgba(66, 97, 251, 0.7)'
  default:
    return 'rgba(68, 151, 131, 0.7)'
  }
}

const getShapeShiftListCoin = async (arrTXHistory) => {
  let arrListCoin = []
  let objListCoin = await Shapeshift.getcoins()
  let arrListCoinConvert = objListCoin ? convertObjectToArray(objListCoin) : []
  for (let i = 0; i < arrListCoinConvert.length; i++) {
    const item = arrListCoinConvert[i]
    if (item.status === 'available') {
      let colorTemp = 'rgb(244,148,28)'

      await Vibrant.from(item.image).quality(1)
        .clearFilters().getPalette()
        .then((palette) => {
          if (palette && palette.Vibrant) {
            var rgb = palette.Vibrant.getRgb()
            colorTemp = 'rgb(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ')'
          }
        })
      let objCoin = {
        image: item.image,
        symbol: item.symbol,
        color: item.symbol === 'ETH' ? '#fefefe' : colorTemp
      }
      arrListCoin.push(objCoin)
    }
  }
  // Add Color and image to list history
  let arrCoin = []
  for (let j = 0; j < arrTXHistory.length; j++) {
    const item = arrTXHistory[j]
    let coin = addImageColor(item, arrListCoin)
    arrCoin.push(coin)
  }
  THIS.setState({isLoading: false, arrTXHistory: arrCoin})
}
const addImageColor = (item, arrListCoin) => {
  let coinTemp = item
  arrListCoin.map((c, index) => {
    if (item.inputCurrency === c.symbol) {
      coinTemp.inputImage = c.image
      coinTemp.inputColor = c.color
    }
    if (item.outputCurrency === c.symbol) {
      coinTemp.outputImage = c.image
      coinTemp.outputColor = c.color
    }
  })
  coinTemp.timestamp = convertTimestampToDateTime(coinTemp.timestamp)
  coinTemp.statusColor = getColorStatus(item.status)
  return coinTemp
}

export const onBack = () => {
  return (dispatch, getState) => {
    THIS.props.history.push('/mainTabbar/shapeShiftScreen')
  }
}

export const clickCell = (itemSelected) => {
  return (dispatch, getState) => {
    THIS.setState({itemSelected}, () => {
      THIS.refs.md_shapeshiftHistory.show()
    })
  }
}

export const funcClickAnother = (itemSelected) => {
  return (dispatch, getState) => {
    itemSelected.inputCurrency === 'ETH'
      ? THIS.props.history.push('/mainTabbar/ethToOther')
      : THIS.props.history.push('/mainTabbar/otherToETH')
  }
}
