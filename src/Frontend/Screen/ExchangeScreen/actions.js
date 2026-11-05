import {
  validateNumber, formatNumber, formatNumberCal, formatNumberLeftZero, formatNumberOld, showNotification, formatNumber2, isObject, convertWeiToBalanceCustom,
  countDots, convertWeiToBalance, convertBalanceToWei, increaseNumber, decreaseNumber, filterMainAccount, sumValueByKey, sumValueInObject, findIndexWithAttr, removeItemWithAttr, updateArrayWithAttr, openBrowserInNewTab, removeDuplicateObjectByKey
} from 'Utils/globalFunction'
import { BigNumber } from '0x.js'
import OxObject from 'Backend/Lib/0x/index'
import swal from 'sweetalert2'
import { setPendingTx, setDexAnnounce, setDexFavorite, setDexSelectedPair, setListCoin, setDexLastTransaction, setDexNewOrder, setDexTokenFavorite, setScreenConfig } from 'Backend/Redux/actions/globalActions'
import EtherScan from 'Backend/Api/services/EtherScan'
import EtherGas from 'Backend/Api/services/EtherGas'
import CoinMarketCap from 'Backend/Api/services/CoinMarketCap'
import ChatworkAPI from 'Backend/Api/services/ChatworkAPI'
import Settings from 'Backend/settings'
import DexAPI from 'Backend/Api/services/DexAPI'
import bigInt from 'big-integer'
import moment from 'moment'
import { PERIOD_CHART, ORDER_STATUS, LIMIT_NUMBER, CHART_TYPE, MIN_WETH_MAKE_ORDER, HBCRYPTO, HBWALLET, ORDER_FILTER, WETH_ADDRESS, WETH_TOKEN } from 'Utils/globalConstants'
import { csvParse } from 'd3-dsv'
import { timeParse } from 'd3-time-format'
import ReduxServices from 'Utils/globalRedux'
import { getTokenBalance } from 'Backend/Lib/Web3/index'
let minWethMakeOrder = MIN_WETH_MAKE_ORDER
const parseDate = timeParse('%Y-%m-%d %H:%M:%S')
const {shell} = window.require('electron')
const HEITH_CALENDAR = 360
const SIXTY_MINUTES = 3600000
const BOARD_HISTORY_FILTER = {
  ALL: 'all',
  TAKE_BUY: 'takeBuy',
  TAKE_SELL: 'takeSell',
  MAKE_BUY: 'makeBuy',
  MAKE_SELL: 'makeSell'
}
const HISTORY_LIMIT = {
  ALL_TOKEN: 30,
  MY_HISTORY: 23,
  BOARD_HISTORY: 23
}
const TAB_SELECTED = {
  MY_BALANCE: '1',
  NEW_ORDER: '2'
}
const LANGUAGES = [
  'cn', 'en', 'es', 'jp', 'pt', 'ru', 'th', 'vn', 'kr'
]
// Close promise if over time
const callTimeout = () => new Promise((resolve, reject) => setTimeout(reject, 15000, 'OVER_TIME'))
var THIS

export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadInitData = () => {
  return async (dispatch, getState) => {
    const { arrCardData, arrTokenData, internetData, dexSelectedPair, arrHBTokens, screenConfig } = THIS.props
    const { coinPair } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    minWethMakeOrder = screenConfig.hb_dex.mininum_weth_make_order || MIN_WETH_MAKE_ORDER
    if (internetData) {
      if (OxObject.getCurrentMainAddress() !== mainAccount.address) {
        OxObject.resetProviderEngine()
        OxObject.init(mainAccount)
      }
      let data = await DexAPI.getOrderList(coinPair.first.address, coinPair.second.address, mainAccount.address)
      if (data && data.coinPair && data.coinPair.first.address.toLowerCase() === coinPair.first.address.toLowerCase() && data.coinPair.second.address.toLowerCase() === coinPair.second.address.toLowerCase()) {
        let orderBookSell = []
        data.orderBookSell.map((item) => {
          item = convertOrderToBalance(coinPair.first.symbol === item.metadata.makerToken.symbol, item)
          if (orderBookSell[item.priceInWei]) {
            orderBookSell[item.priceInWei].push(item)
          } else {
            orderBookSell[item.priceInWei] = [item]
          }
        })
        orderBookSell = Object.values(orderBookSell)

        let orderBookBuy = []
        data.orderBookBuy.map((item) => {
          item = convertOrderToBalance(coinPair.first.symbol === item.metadata.makerToken.symbol, item)
          if (orderBookBuy[item.priceInWei]) {
            orderBookBuy[item.priceInWei].push(item)
          } else {
            orderBookBuy[item.priceInWei] = [item]
          }
        })
        orderBookBuy = Object.values(orderBookBuy)

        data.myOrder.map((item) => {
          item = convertOrderToBalance(coinPair.first.symbol === item.metadata.makerToken.symbol, item)
        })
        data.orderHistory.map((item) => {
          item = convertOrderToBalance(coinPair.first.symbol === item.metadata.makerToken.symbol, item)
        })

        arrHBTokens.filter((item) => {
          if (item.tokenAddress.toLowerCase() === dexSelectedPair.token.address.toLowerCase()) {
            THIS.setState({
              getImageToken: item.cardImage
            })
          }
        })

        // calculation spread value
        THIS.props.updateSpread(orderBookSell, orderBookBuy)

        // calculation largest amount
        let largestAmountSell = Math.max.apply(Math, orderBookSell.map(function (o) { return sumValueByKey(o, 'balance') }))
        let largestAmountBuy = Math.max.apply(Math, orderBookBuy.map(function (o) { return sumValueByKey(o, 'balance') }))
        
        THIS.setState({
          dexData: {
            orderBookSell,
            orderBookBuy,
            myOrderHistory: data.myOrder,
            boardHistory: data.orderHistory
          },
          isLoadingSpread: false,
          isLoadingOrder: false,
          isLoadingSummary: false,
          largestAmountOrder: largestAmountSell > largestAmountBuy ? largestAmountSell : largestAmountBuy
        })
      } else {
        THIS.setState({
          isLoadingSpread: false,
          isLoadingOrder: false,
          isLoadingSummary: false
        })
      }
    } else {
      THIS.setState({
        isLoadingSpread: false,
        isLoadingOrder: false,
        isLoadingSummary: false
      })
    }
  }
}

export const fetchChart = () => {
  return async (dispatch, setState) => {
    const { coinPair } = THIS.state
    // get all order filled history
    let result = await DexAPI.getOrderFilledHistory(coinPair.first.address, coinPair.second.address, 0, -1)
    if (result && result.filledOrderPair && result.filledOrderPair.length > 0 && result.coinPair.first.address.toLowerCase() === coinPair.first.address.toLowerCase() && result.coinPair.second.address.toLowerCase() === coinPair.second.address.toLowerCase()) {
      result.filledOrderPair.map((item) => {
        item = convertFilledOrderToBalance(item, coinPair.first.decimals)
      })
      // candlesticks chart data
      let candle = loadOrderListBasedOnTimeInterval(coinPair.first.decimals, result.filledOrderPair, getTimeFromPeriod())
      THIS.setState({
        orderFilledHistory: result.filledOrderPair,
        chartData: candle,
        isLoadingChart: false
      })
    } else {
      THIS.setState({
        isLoadingChart: false
      })
    }
  }
}

export const fetchOrderedAmount = () => {
  return async (dispatch) => {
    const { arrCardData } = THIS.props
    const { coinPair } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    let orderedAmount = await DexAPI.getOrderedAmount(mainAccount.address, coinPair.first.address)
    if (orderedAmount && orderedAmount.totalActiveBuy && orderedAmount.totalActiveSell) {
      THIS.setState({
        totalActiveBuy: convertWeiToBalance(orderedAmount.totalActiveBuy, coinPair.second.decimals),
        totalActiveSell: convertWeiToBalance(orderedAmount.totalActiveSell, coinPair.first.decimals)
      })
    }
  }
}

export const fetchLastTransaction = () => {
  return async (dispatch) => {
    const { coinPair } = THIS.state
    const { arrCardData, dexLastTransaction } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (!mainAccount) return
    const latestTx = await EtherScan.getAllTransactionByAddressFromBlock(mainAccount.address, coinPair.first.address, coinPair.second.address, dexLastTransaction.blockNumber, true)

    if (latestTx && latestTx.tx && latestTx.tx.length > 0) {
      for (let i = 0; i < latestTx.tx.length; i++) {
        let item = latestTx.tx[i]
        let tempTx = dexLastTransaction
        if (item.type === HBCRYPTO.ETHEREUM) {
          if (tempTx.etherTx && Number(item.timeStamp) < Number(tempTx.etherTx.timeStamp)) {
            continue
          }
          tempTx.etherTx = {
            timeStamp: item.timeStamp,
            received: item.to === mainAccount.address,
            balance: item.value
          }
        } else if (item.type === HBCRYPTO.ERC20) {
          let tempTx = dexLastTransaction
          if (tempTx.tokenTx[item.tokenAddress] && Number(item.timeStamp) < Number(tempTx.tokenTx[item.tokenAddress].timeStamp)) {
            continue
          }
          tempTx.tokenTx[item.tokenAddress] = {
            timeStamp: item.timeStamp,
            received: item.to === mainAccount.address,
            balance: item.value,
            token: {
              name: item.tokenName,
              decimals: item.tokenDecimal,
              address: item.tokenAddress,
              symbol: item.tokenSymbol
            }
          }
        } else if (item.type === HBCRYPTO.WRAP) {
          let tempTx = dexLastTransaction
          if (tempTx.tokenTx[coinPair.second.address] && Number(item.timeStamp) < Number(tempTx.tokenTx[coinPair.second.address].timeStamp)) {
            continue
          }
          tempTx.tokenTx[coinPair.second.address] = {
            timeStamp: item.timeStamp,
            received: true,
            balance: item.value,
            token: {
              name: coinPair.second.name,
              decimals: coinPair.second.decimals,
              address: coinPair.second.adress,
              symbol: coinPair.second.symbol
            }
          }
        } else if (item.type === HBCRYPTO.UNWRAP) {
          let tempTx = dexLastTransaction
          if (tempTx.tokenTx[coinPair.second.address] && Number(item.timeStamp) < Number(tempTx.tokenTx[coinPair.second.address].timeStamp)) {
            continue
          }
          tempTx.tokenTx[coinPair.second.address] = {
            timeStamp: item.timeStamp,
            received: false,
            balance: item.value,
            token: {
              name: coinPair.second.name,
              decimals: coinPair.second.decimals,
              address: coinPair.second.adress,
              symbol: coinPair.second.symbol
            }
          }
        }
        // save last transactions into local store
        dispatch(setDexLastTransaction(tempTx))
        dispatch(setPendingTx({
          account: mainAccount,
          isPending: false,
          lastTxID: item.hash
        }))
        THIS.forceUpdate()
      }
    }
    THIS.setState({
      isLoadingLastTransaction: false
    })
  }
}

export const fetchDexConfig = () => {
  return async (dispatch, getState) => {
    const { internetData, screenConfig } = THIS.props
    if (internetData) {
      let config = await DexAPI.getDexConfig()
      if (config && config.value) {
        screenConfig['hb_dex'] = config.value
        dispatch(setScreenConfig(screenConfig))
        checkLimitMakeOrder()
      }
    }
  }
}

export const fetchHBTokenBalance = () => {
  return async (dispatch) => {
    const { arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    try {
      const balance = await getTokenBalance(HBWALLET, mainAccount.address, 2)
      if (balance) {
        THIS.setState({
          hbTokenBalance: balance
        }, () => checkLimitMakeOrder())
      }
    } catch (err) {
      console.log('fetchHBTokenBalance error', err)
    }
  }
}

const checkLimitMakeOrder = () => {
  const { dexSelectedPair, screenConfig } = THIS.props
  const { hbTokenBalance, coinPair } = THIS.state

  try {
    if (screenConfig.hb_dex && Number(screenConfig.hb_dex.num_of_limit_transaction) > 0) {
      if (Number(dexSelectedPair.all.noOfTx) > Number(screenConfig.hb_dex.num_of_limit_transaction)) {
        if (Number(hbTokenBalance) < Number(screenConfig.hb_dex.hold_limit_hbwallet)) {
          if (!screenConfig.hb_dex.exclude_limit_token.includes(coinPair.first.address)) {
            THIS.setState({
              isDisabledMakeOrder: true
            })
          }
        }
      }
    }
  } catch (err) {
    console.log('checkLimitMakeOrder error', err)
  }
}

export const updateLastTx = (tx) => {
  return (dispatch) => {
    const { arrCardData, dexLastTransaction, pendingTx, t } = THIS.props
    const { coinPair } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (tx.txID === pendingTx.lastTxID && pendingTx.isPending === false) return
    // send notification to maker and taker
    let notice = ''
    let balance = convertWeiToBalance(tx.txBalance, coinPair.first.decimals)
    balance = formatNumber(balance, coinPair.first.decimals)
    if (tx.addressFiller && mainAccount.address.toLowerCase() === tx.addressFiller.toLowerCase()) {
      if (tx.isSell) {
        notice = t('youBought', {number: balance, tokenName: coinPair.first.symbol})
      } else {
        notice = t('youSold', {number: balance, tokenName: coinPair.first.symbol})
      }
    } else {
      if (tx.isSell) {
        notice = t('youSold', {number: balance, tokenName: coinPair.first.symbol})
      } else {
        notice = t('youBought', {number: balance, tokenName: coinPair.first.symbol})
      }
    }
    showNotification(notice, t)

    let tempTx = dexLastTransaction
    if (!tempTx.tokenTx[tx.metadata.makerToken.address] || Number(tempTx.tokenTx[tx.metadata.makerToken.address].timeStamp) < Number(tx.filledTimestamp)) {
      tempTx.tokenTx[tx.metadata.makerToken.address] = {
        timeStamp: tx.filledTimestamp,
        received: tx.addressFiller && mainAccount.address.toLowerCase() === tx.addressFiller.toLowerCase(),
        balance: tx.isSell ? tx.txBalance : bigInt(convertBalanceToWei(tx.total, 18)),
        token: {
          name: tx.metadata.makerToken.name,
          decimals: tx.metadata.makerToken.decimals,
          address: tx.metadata.makerToken.address,
          symbol: tx.metadata.makerToken.symbol
        }
      }
    }
    if (!tempTx.tokenTx[tx.metadata.takerToken.address] || Number(tempTx.tokenTx[tx.metadata.takerToken.address].timeStamp) < Number(tx.filledTimestamp)) {
      tempTx.tokenTx[tx.metadata.takerToken.address] = {
        timeStamp: tx.filledTimestamp,
        received: tx.addressFiller && mainAccount.address.toLowerCase() !== tx.addressFiller.toLowerCase(),
        balance: tx.isSell ? bigInt(convertBalanceToWei(tx.total, 18)) : tx.txBalance,
        token: {
          name: tx.metadata.takerToken.name,
          decimals: tx.metadata.takerToken.decimals,
          address: tx.metadata.takerToken.address,
          symbol: tx.metadata.takerToken.symbol
        }
      }
    }
    dispatch(setDexLastTransaction(tempTx))
    dispatch(setPendingTx({
      account: mainAccount,
      isPending: false,
      lastTxID: tx.txID
    }))
    // update card balance
    // await getCardBalance(arrCardData, arrCurrencyData, dispatch)
    // update token balance
    // await getTokenBalance(arrCardData, arrTokenData, arrCurrencyData, dispatch)
    // update transaction history
    // await getTxsHistoryAll(arrCardData, dispatch, true)
    THIS.forceUpdate()
  }
}

const getTimeFromPeriod = () => {
  const { periodChart, chartType } = THIS.state
  // time in seconds
  let period = 60
  if (chartType === CHART_TYPE.CHART_LINE) {
    switch (periodChart) {
    case PERIOD_CHART.FIVE_MUNITES:
    case PERIOD_CHART.THIRTY_MUNITES:
      period = period * 5
      break
    case PERIOD_CHART.ONE_HOURS:
      period = period * 10
      break
    case PERIOD_CHART.SIX_HOURS:
    case PERIOD_CHART.TWELVE_HOURS:
      period = period * 30
      break
    case PERIOD_CHART.ONE_DAY:
    case PERIOD_CHART.ONE_WEEK:
      period = period * 60
      break
    case PERIOD_CHART.ONE_MONTH:
      period = period * 180
      break
    case PERIOD_CHART.ALL:
      period = period * 1440
      break
    default:
      period = period * 60
      break
    }
  } else {
    switch (periodChart) {
    case PERIOD_CHART.FIVE_MUNITES:
      period = period * 5
      break
    case PERIOD_CHART.THIRTY_MUNITES:
      period = period * 30
      break
    case PERIOD_CHART.ONE_HOURS:
      period = period * 60
      break
    case PERIOD_CHART.SIX_HOURS:
      period = period * 360
      break
    case PERIOD_CHART.TWELVE_HOURS:
      period = period * 720
      break
    case PERIOD_CHART.ONE_DAY:
      period = period * 1440
      break
    case PERIOD_CHART.ONE_WEEK:
      period = period * 10080
      break
    case PERIOD_CHART.ONE_MONTH:
      period = period * 43200
      break
    default:
      period = period * 5
      break
    }
  }
  return period
}

const getNodeFromPeriod = () => {
  const { periodChart, chartType } = THIS.state
  let node = 3 // each node is 20 seconds, 1 minute = 60 seconds / 20 seconds = 3 nodes
  if (chartType === CHART_TYPE.CHART_LINE) {
    switch (periodChart) {
    case PERIOD_CHART.FIVE_MUNITES:
      node = 3 * 5 // each node is 20 seconds
      break
    case PERIOD_CHART.THIRTY_MUNITES:
      node = 3 * 30 // each node is 20 seconds
      break
    case PERIOD_CHART.ONE_HOURS:
      node = 12 // each node is 5 minutes
      break
    case PERIOD_CHART.SIX_HOURS:
      node = 12 * 6 // each node is 5 minutes
      break
    case PERIOD_CHART.TWELVE_HOURS:
      node = 12 * 12 // each node is 5 minutes
      break
    case PERIOD_CHART.ONE_DAY:
      node = 24 // each node is an hour
      break
    case PERIOD_CHART.ONE_WEEK:
      node = 24 * 7 // each node is an hour
      break
    case PERIOD_CHART.ONE_MONTH:
      node = 8 * 30 // each node is 3 hours
      break
    case PERIOD_CHART.ALL:
      node = 9999 // each node is a day
      break
    }
  }
  return node
}
export const updateNewDexOrder = (object) => {
  return async (dispatch, getState) => {
    const { coinPair, dexData, totalActiveSell, totalActiveBuy, boardHistoryType } = THIS.state
    const { dexNewOrder, arrCardData, pendingTx } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)

    if (dexNewOrder !== object) {
      dispatch(setDexNewOrder(object))
      let arrOrder = object.orderList
      const status = object.statusCode
      let lightingMyOrder = false
      let lightingMyHistory = false
      let lightingBoardHistory = false
      let lightingTradeHistory = false
      let lightingOrderBookFilling = false
      let lightingOrderBookSellId = ''
      let lightingOrderBookBuyId = ''

      // remove lighting
      THIS.setState({
        lightingMyOrder,
        lightingMyHistory,
        lightingBoardHistory,
        lightingTradeHistory,
        lightingOrderBookSellId,
        lightingOrderBookBuyId,
        lightingOrderBookFilling
      })

      if (arrOrder) {
        let tempOrder = arrOrder[0] || arrOrder[1]
        if (tempOrder.metadata.makerToken.address === coinPair.first.address || tempOrder.metadata.takerToken.address === coinPair.first.address) {
          arrOrder.map(item => {
            if (item && isObject(item)) {
              item = convertOrderToBalance(coinPair.first.address === item.metadata.makerToken.address, item)
            }
          })
          switch (status) {
          case ORDER_STATUS.OPEN:
            if (arrOrder[0].metadata.makerToken.address === coinPair.first.address) { // sell
              // import the order to order book sell
              let index = findIndexWithAttr(dexData.orderBookSell, 'priceInWei', arrOrder[0].priceInWei)
              if (index !== -1) {
                dexData.orderBookSell[index].push(arrOrder[0])
              } else {
                dexData.orderBookSell.push([arrOrder[0]])
              }
              // sort orders as descending
              dexData.orderBookSell = dexData.orderBookSell.sort(function (a, b) {
                return (a[0]['price'] < b[0]['price']) ? -1 : 1
              })
              // make flash light
              lightingOrderBookSellId = arrOrder[0]._id
            } else {
              // import the order to order book buy
              let index = findIndexWithAttr(dexData.orderBookBuy, 'priceInWei', arrOrder[0].priceInWei)
              if (index !== -1) {
                dexData.orderBookBuy[index].push(arrOrder[0])
              } else {
                dexData.orderBookBuy.push([arrOrder[0]])
              }
              // sort orders as ascending
              dexData.orderBookBuy = dexData.orderBookBuy.sort(function (a, b) {
                return (a[0]['price'] > b[0]['price']) ? -1 : 1
              })
              // make flash light
              lightingOrderBookBuyId = arrOrder[0]._id
            }
            // import order to my history
            if (mainAccount.address === arrOrder[0].signedOrder.makerAddress || mainAccount.address === arrOrder[0].signedOrder.takerAddress) {
              dexData.myOrderHistory.unshift(arrOrder[0])
              // update totalActiveSell/Buy
              if (arrOrder[0].metadata.makerToken.address === coinPair.first.address) { // sell
                THIS.setState({
                  totalActiveSell: totalActiveSell + Number(arrOrder[0].balance)
                })
              } else { // buy
                THIS.setState({
                  totalActiveBuy: totalActiveBuy + Number(arrOrder[0].total)
                })
              }
              // make flash light
              lightingMyHistory = true
            }
            // import order to board history
            if (boardHistoryType === BOARD_HISTORY_FILTER.ALL ||
              (boardHistoryType === BOARD_HISTORY_FILTER.MAKE_BUY && arrOrder[0].metadata.takerToken.address === coinPair.first.address) ||
              (boardHistoryType === BOARD_HISTORY_FILTER.MAKE_SELL && arrOrder[0].metadata.makerToken.address === coinPair.first.address)) {
              dexData.boardHistory.unshift(arrOrder[0])
              // make flash light
              lightingBoardHistory = true
            }
            // calculation spread value
            THIS.props.updateSpread(dexData.orderBookSell, dexData.orderBookBuy)
            break
          case ORDER_STATUS.PROCESSING:
            if (arrOrder[0].metadata.makerToken.address === coinPair.first.address) { // sell
              // update remain balance in order book
              dexData.orderBookSell = updateArrayWithAttr(dexData.orderBookSell, '_id', arrOrder[0]._id, arrOrder[0])
              // make flash light
              lightingOrderBookSellId = arrOrder[0]._id
              lightingOrderBookFilling = true
            } else { // buy
              // update remain balance in order book
              dexData.orderBookBuy = updateArrayWithAttr(dexData.orderBookBuy, '_id', arrOrder[0]._id, arrOrder[0])
              // make flash light
              lightingOrderBookBuyId = arrOrder[0]._id
              lightingOrderBookFilling = true
            }

            if (mainAccount.address === arrOrder[0].signedOrder.makerAddress || mainAccount.address === arrOrder[0].signedOrder.takerAddress) {
              let index = dexData.myOrderHistory.findIndex(i => i._id === arrOrder[0]._id)
              if (index !== -1) {
                dexData.myOrderHistory[index] = arrOrder[0]
              }
            }
            // calculation spread value
            THIS.props.updateSpread(dexData.orderBookSell, dexData.orderBookBuy)
            break
          case ORDER_STATUS.FILLED:
            // check my order
            if (mainAccount.address === arrOrder[1].signedOrder.makerAddress || mainAccount.address === arrOrder[1].signedOrder.takerAddress) {
              // remove order
              dexData.myOrderHistory = dexData.myOrderHistory.filter(i => i._id !== arrOrder[1]._id)
              // import filled order into my history
              dexData.myOrderHistory.unshift(arrOrder[1])
              // make flash light
              lightingMyHistory = true
            }
            if (mainAccount.address === arrOrder[1].addressFiller) {
              // remove order
              dexData.myOrderHistory = dexData.myOrderHistory.filter(i => i._id !== arrOrder[1]._id) 
              // import filled order into my history
              dexData.myOrderHistory.unshift(arrOrder[1])
              // make flash light
              lightingMyHistory = true
            }
            // import filled order into board history
            if (dexData.boardHistory.findIndex(e => e._id === arrOrder[1]._id) === -1) {
              arrOrder[1].addressFiller && dexData.boardHistory.unshift(arrOrder[1])
            }
            // make flash light 
            lightingBoardHistory = true
            lightingTradeHistory = true
            lightingOrderBookFilling = true
            // update last transaction
            if (mainAccount.address === arrOrder[1].signedOrder.makerAddress || mainAccount.address === arrOrder[1].addressFiller) {
              THIS.props.updateLastTx(arrOrder[1])
              // update token balance
              THIS.props.loadingTokenbalance()
              // update available balance
              THIS.props.fetchOrderedAmount()
            }
            // update candlestick chart
            THIS.props.updateCandle(arrOrder[1])
            break
          case ORDER_STATUS.CANCEL:
            if (arrOrder[0].metadata.makerToken.symbol === coinPair.first.symbol) {
              // remove order from order book sell
              dexData.orderBookSell = removeItemWithAttr(dexData.orderBookSell, '_id', arrOrder[0]._id)
            } else {
              // remove order from order book buy
              dexData.orderBookBuy = removeItemWithAttr(dexData.orderBookBuy, '_id', arrOrder[0]._id)
            }
            if (mainAccount.address === arrOrder[0].signedOrder.makerAddress || mainAccount.address === arrOrder[0].signedOrder.takerAddress) {
              // update my order history
              dexData.myOrderHistory = dexData.myOrderHistory.filter(i => i._id !== arrOrder[0]._id)
              dexData.myOrderHistory.unshift(arrOrder[0])
              // update pending tx
              dispatch(setPendingTx({
                account: mainAccount,
                isPending: false,
                lastTxID: arrOrder[0].txID
              }))
            }
            break
          case ORDER_STATUS.EXPIRED:
            if (arrOrder[0].metadata.makerToken.symbol === coinPair.first.symbol) {
              // remove order from order book sell
              dexData.orderBookSell = removeItemWithAttr(dexData.orderBookSell, '_id', arrOrder[0]._id)
            } else {
              // remove order from order book buy
              dexData.orderBookBuy = removeItemWithAttr(dexData.orderBookBuy, '_id', arrOrder[0]._id)
            }
            if (mainAccount.address === arrOrder[0].signedOrder.makerAddress || mainAccount.address === arrOrder[0].signedOrder.takerAddress) {
              // update my order history
              dexData.myOrderHistory = dexData.myOrderHistory.filter(i => i._id !== arrOrder[0]._id)
              dexData.myOrderHistory.unshift(arrOrder[0])
            }
            break
          case ORDER_STATUS.FAILED:
            if (mainAccount.address === arrOrder[0].addressFiller) {
              // update my order history
              dexData.myOrderHistory = dexData.myOrderHistory.filter(i => i._id !== arrOrder[0]._id)
              dexData.myOrderHistory.unshift(arrOrder[0])
              // make flash light
              lightingMyHistory = true
              // change status pending
              pendingTx.isPending = false
              dispatch(setPendingTx(pendingTx))
            }
            break
          default:
            break
          }

          let largestAmountSell = Math.max.apply(Math, dexData.orderBookSell.map(function (o) { return sumValueByKey(o, 'balance') }))
          let largestAmountBuy = Math.max.apply(Math, dexData.orderBookBuy.map(function (o) { return sumValueByKey(o, 'balance') }))
          THIS.setState({
            dexData,
            lightingMyOrder,
            lightingMyHistory,
            lightingBoardHistory,
            lightingTradeHistory,
            lightingOrderBookSellId,
            lightingOrderBookBuyId,
            lightingOrderBookFilling,
            largestAmountOrder: largestAmountSell > largestAmountBuy ? largestAmountSell : largestAmountBuy
          })
        } else {
          arrOrder.map(item => {
            if (item && isObject(item)) {
              item = convertOrderToBalance(WETH_ADDRESS === item.metadata.takerToken.address, item)
            }
          })
          switch (status) {
          case ORDER_STATUS.OPEN:
            // make flash light
            lightingTradeHistory = true
            break
          case ORDER_STATUS.FILLED:
            // make flash light
            lightingTradeHistory = true
            break
          }
          THIS.setState({
            dexData,
            lightingMyOrder,
            lightingMyHistory,
            lightingBoardHistory,
            lightingTradeHistory,
            lightingOrderBookSellId,
            lightingOrderBookBuyId,
            lightingOrderBookFilling
          })
        }
      }
    }
  }
}
export const updateCandle = (newOrder) => {
  return (dispatch) => {
    console.log('updateCandle', newOrder)
    const { coinPair, orderFilledHistory } = THIS.state
    orderFilledHistory.unshift(newOrder)
    let candle = loadOrderListBasedOnTimeInterval(coinPair.first.decimals, orderFilledHistory, getTimeFromPeriod())
    THIS.setState({
      orderFilledHistory,
      periodNode: getNodeFromPeriod(),
      chartData: candle,
      isLoadingChart: false
    }, () => {
      THIS.forceUpdate()
    })
  }

  // // calculate txBalance in Eth
  // let _price = Number(newOrder.price)
  // let candle = {
  //   date: new Date(Number(newOrder.filledTimestamp) * 1000),
  //   open: _price,
  //   close: _price,
  //   high: _price,
  //   low: _price
  // }

  // let _time = Number(orders[i].filledTimestamp)
  // if (_time < tempTimeStamp + interval) {
  //   orderEachCandle.push(orders[i])
  // } else {
  //   let temp = filterCandle(orderEachCandle, interval)
  //   if (temp) { candleList.push(temp) }
  //   orderEachCandle = [] // reset only work when orderEachCandle is not reference by other array
  //   tempTimeStamp += interval
  //   let NoOf5m = Math.floor((_time - tempTimeStamp) / interval)
  //   if (NoOf5m > 0) { // add empty list5m
  //     let result = addEmptyCandle(NoOf5m, tempTimeStamp, interval, candleList[candleList.length - 1].close) // calculate empty candle
  //     candleList = candleList.concat(result)
  //     tempTimeStamp += NoOf5m * interval
  //   }
  //   orderEachCandle.push(orders[i])
  // }

  // if (candleList.length === 0) {
  //   candleList.push(candle) // new candle. add it into the list
  // } else {
  //   if (candleList[candleList.length - 1].date + candleTimeInterval < newOrder.filledTimestamp) {
  //     candleList.push(candle) // new candle. add it into the list
  //   } else { // update the last candle, since new order still within candleTimeInterval range
  //     candle = candleList[candleList.length - 1]
  //     candle.close = _price
  //     if (_price > candle.high) { candle.high = _price }
  //     if (_price < candle.low) { candle.low = _price }
  //     candleList[candleList.length - 1] = candle
  //   }
  // }
  // THIS.setState({
  //   periodNode: getNodeFromPeriod(),
  //   chartData: candleList,
  //   isLoadingChart: false
  // })
  // THIS.forceUpdate()
}
export const updateSpread = (orderBookSell, orderBookBuy) => {
  return (dispatch, getState) => {
    const { coinPair } = THIS.state
    if (orderBookBuy[0] && orderBookSell[0]) {
      let spread = Number(orderBookSell[0][0].priceInWei) - Number(orderBookBuy[0][0].priceInWei)
      if (spread > 0) {
        spread = convertWeiToBalance(spread, coinPair.second.decimals)
        THIS.setState({
          spreadValue: spread
        })
        console.log('spread', spread)
      }
    } else {
      THIS.setState({
        spreadValue: 0
      })
    }
  }
}
export const onChangeDropdownCoin = (item) => {
  return (dispatch, getState) => {
    console.log('onChangeDropdownCoin: ', item)
    const { dexTokenList, arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)

    let tempCoinPair = THIS.CoinPairs[Number(item.key)]
    console.log('tempCoinPair', tempCoinPair)
    tempCoinPair.first.unLocking = true
    console.log('start check unlocked')
    let index = dexTokenList.findIndex(i => i.token.symbol === tempCoinPair.first.symbol)
    if (index !== -1) {
      THIS.setState({
        coinPair: tempCoinPair,
        isLoadingChart: true,
        isLoadingOrder: true,
        isLoadingSummary: true,
        isLoadingLastTransaction: true,
        isLoadedTokenBalance: false,
        isMyFavorite: false,
        hasMoreAllToken: true,
        hasMoreMyHistory: true,
        hasMoreBoardHistory: true,
        allTokenOffset: 0,
        myHistoryOffset: 0,
        boardHistoryOffset: 0,
        isLoadMoreAllToken: false,
        isLoadMoreMyHistory: false,
        isLoadMoreBoardHistory: false,
        boardHistoryType: BOARD_HISTORY_FILTER.ALL,
        isLoadingCMC: true
      }, async () => {
        try {
          dispatch(setDexSelectedPair(dexTokenList[index]))
          await OxObject.hasProxyAllowanceAsync(mainAccount.address, tempCoinPair.first.address)
          THIS.props.loadInitData()
          THIS.props.fetchRateAndFavorite()
          await THIS.props.getCoinInfo(THIS.props.dexSelectedPair.token.symbol)
          console.log('dexSelectedPairSymbol: ', THIS.props.dexSelectedPair.token.symbol)
          tempCoinPair.first.unlocked = await OxObject.hasProxyAllowanceAsync(mainAccount.address, tempCoinPair.first.address)
          console.log('coinPair.first.unlocked: ', tempCoinPair.first.unlocked)
          tempCoinPair.first.unLocking = false
          THIS.setState({ coinPair: tempCoinPair }, () => THIS.forceUpdate())
        } catch (error) {
          tempCoinPair.first.unLocking = false
          THIS.setState({ coinPair: tempCoinPair }, () => THIS.forceUpdate())
          var e = {
            message: 'onChangeDropdownCoin error ',
            error: error.message
          }
          DexAPI.insertCrashLog(e)
        }
      })
    }
  }
}

export const onChangePrice = (value) => {
  return (dispatch, getState) => {
    const { amountInput } = THIS.state

    if (validateNumber(value)) {
      if (value.toString() !== '.') {
        let dotsCount = countDots(value, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let decimalCount = value.length - value.indexOf('.') - 1
          let integerCount = String(parseInt(value)).length
          if (!(integerCount > LIMIT_NUMBER.INT_NUMBER) && !(dotsCount === 1 && decimalCount > LIMIT_NUMBER.DECIMAL_NUMBER)) {
            THIS.setState({
              priceInput: value,
              totalInput: Number(value) > 0 && Number(amountInput) > 0 ? BigNumber(amountInput).times(value).dp(18).toString() : ''
            })
          }
        }
      }
    } else if (value.length === 0) {
      THIS.setState({
        priceInput: '',
        totalInput: ''
      })
    }
  }
}

export const onChangeAmount = (value) => {
  return (dispatch, getState) => {
    const { priceInput } = THIS.state
    if (validateNumber(value)) {
      if (value.toString() !== '.') {
        let dotsCount = countDots(value, '\\.')
        console.log('amount input: ', Number(value))
        console.log('dotsCount', dotsCount)
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let decimalCount = value.length - value.indexOf('.') - 1
          let integerCount = String(parseInt(value)).length
          if (!(integerCount > LIMIT_NUMBER.INT_NUMBER) && !(dotsCount === 1 && decimalCount > LIMIT_NUMBER.DECIMAL_NUMBER)) {
            THIS.setState({
              amountInput: value,
              totalInput: Number(priceInput) > 0 && Number(value) > 0 ? BigNumber(priceInput).times(value).dp(18).toString() : ''
            })
          }
        }
      }
    } else if (value.length === 0) {
      THIS.setState({
        amountInput: '',
        totalInput: ''
      })
    }
  }
}

export const onFocusInputMyAmount = () => {
  return (dispatch, getState) => {
    THIS.setState({isFocusedMyAmount: true})
  }
}

export const onBlurInputMyAmount = () => {
  return (dispatch, getState) => {
    THIS.setState({isFocusedMyAmount: false})
  }
}

export const onChangeTotal = (value) => {
  return (dispatch, getState) => {
    if (validateNumber(value)) {
      THIS.setState({
        totalInput: value
      })
    }
  }
}

export const loadingTokenbalance = () => {
  return async (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const { coinPair } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)

    const balance1 = await getTokenBalance(coinPair.first.address, mainAccount.address, coinPair.first.decimals)
    coinPair.first.balance = balance1

    const balance2 = await getTokenBalance(coinPair.second.address, mainAccount.address, coinPair.second.decimals)
    coinPair.second.balance = balance2
    THIS.setState({
      coinPair: coinPair,
      isLoadedTokenBalance: true
    })
  }
}

export const getBalanceMaker = (orderJSON) => {
  return async (dispatch, getState) => {
    THIS.setState({
      balanceMaker: await getTokenBalance(orderJSON.metadata.makerToken.address, orderJSON.signedOrder.makerAddress, orderJSON.metadata.makerToken.decimals)
    })
  }
}

export const loadingTokenUnlock = () => {
  return (dispatch) => {
    const { arrCardData } = THIS.props
    const { coinPair } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    coinPair.first.unLocking = true
    coinPair.second.unLocking = true
    THIS.setState({
      coinPair
    }, async () => {
      try {
        coinPair.first.unlocked = await OxObject.hasProxyAllowanceAsync(mainAccount.address, coinPair.first.address)
        console.log('coinPair.first.unlocked: ', coinPair.first.unlocked)
        coinPair.second.unlocked = await OxObject.hasProxyAllowanceAsync(mainAccount.address, coinPair.second.address)
        console.log('coinPair.second.unlocked: ', coinPair.second.unlocked)
        coinPair.first.unLocking = false
        coinPair.second.unLocking = false
        THIS.setState({ coinPair }, () => THIS.forceUpdate())
      } catch (error) {
        coinPair.first.unLocking = false
        coinPair.second.unLocking = false
        THIS.setState({ coinPair }, () => THIS.forceUpdate())
        var e = {
          message: 'loadingTokenUnlock error ',
          error: error.message
        }
        DexAPI.insertCrashLog(e)
      }
    })
  }
}
export const scrollOrderSellToBottom = () => {
  return (dispatch, getState) => {
    const objDiv = document.getElementById('exs-list-sell')
    if (objDiv) {
      objDiv.scrollTop = objDiv.scrollHeight
    }
  }
}

export const onChangePPWrapAmount = (value) => {
  return (dispatch, getState) => {
    if (validateNumber(value)) {
      if (value.toString() !== '.') {
        let dotsCount = countDots(value, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          // let decimalCount = value.length - value.indexOf('.') - 1
          if (Number(value).toFixed(8) < 100000000) {
            THIS.setState({
              strPPAmount: value,
              gasAmount: value
            }, () => THIS.forceUpdate())
          }
        }
      }
    } else if (value.length === 0) {
      THIS.setState({
        strPPAmount: ''
      }, () => THIS.forceUpdate())
    }
  }
}

export const openTxID = (txID) => {
  return (dispatch, getState) => {
    openBrowserInNewTab(Settings.server.etherscan.urlLookup + 'tx/' + txID)
  }
}

export const clickOnCellOrder = (orderJSON, isSell = true) => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData, screenConfig, t } = THIS.props
    const { coinPair, dexData } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)

    console.log('clickOnCellOrder----here')
    console.log('orderJSON: ', JSON.stringify(orderJSON, undefined, 2))
    if (!internetData) return
    if (orderJSON.length > 0) {
      const ordersDeleteExpired = orderJSON.map(async (item, index) => {
        return new Promise(async (resolve, reject) => {
          const isOrderDE = await OxObject.getOrderInfo(item.signedOrder)
          console.log('isOrderDE123: ', isOrderDE)
          if (isOrderDE && (isOrderDE.orderStatus === 4 || isOrderDE.orderStatus === 6)) {
            if (isSell) {
              // remove order from order book sell
              dexData.orderBookSell = removeItemWithAttr(dexData.orderBookSell, '_id', item._id)
            } else {
              // remove order from order book buy
              dexData.orderBookBuy = removeItemWithAttr(dexData.orderBookBuy, '_id', item._id)
            }
            THIS.setState({
              dexData
            })

            const res = await DexAPI.hideStatusCode(isOrderDE.orderStatus, item._id)
            if (res && !res.error) {
              resolve(true)
            } else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
            }
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve(null)
          }
        })
      })
      Promise.all(ordersDeleteExpired)
        .then(result => {
          console.log('warningMultipleOrders', result)
          THIS.forceUpdate()
        })
        .catch(err => {
          console.log('warningMultipleOrders error', err)
        })
    }
    if ((coinPair.first.unlocked && isSell === false) || (coinPair.second.unlocked && isSell === true)) {
      let isMyOrder = orderJSON.find(e => e.signedOrder.makerAddress.toLowerCase() === mainAccount.address.toLowerCase())
      let isAllMyOrder = orderJSON.filter(e => e.signedOrder.makerAddress.toLowerCase() === mainAccount.address.toLowerCase())
      if (isMyOrder) {
        let wrapAllMyOrder = {}
        if (isAllMyOrder && (isAllMyOrder.length > 1)) {
          let wBalance = 0
          let wTotal = 0
          let wAmount = 0
          isAllMyOrder.map(e => {
            wBalance = Number(wBalance) + Number(e.balance)
            wTotal = Number(wTotal) + Number(e.total)
            wAmount = Number(wAmount) + Number(e.amount)
          })
          wrapAllMyOrder.balance = wBalance
          wrapAllMyOrder.total = wTotal
          wrapAllMyOrder.amount = wAmount
        }
        THIS.setState({
          orderJSON: isMyOrder,
          wrapAllOrderJSON: (isAllMyOrder && (isAllMyOrder.length > 1)) ? wrapAllMyOrder : null,
          allOrderJSON: (isAllMyOrder && (isAllMyOrder.length > 1)) ? isAllMyOrder : null
        }, () => {
          THIS.refs.md_exs_order_detail.show()
        })
        return
      }
      if (screenConfig.hb_dex && screenConfig.hb_dex.is_limit_take_order) {
        if (isSell && Number(orderJSON[0].price) !== Number(dexData.orderBookSell[0][0].price)) {
          swal({
            width: '250px',
            text: t('buyOnlyLowestPrice'),
            type: 'warning',
            showConfirmButton: false
          })
          return
        }
        if (!isSell && Number(orderJSON[0].price) !== Number(dexData.orderBookBuy[0][0].price)) {
          swal({
            width: '250px',
            text: t('sellOnlyHighestPrice'),
            type: 'warning',
            showConfirmButton: false
          })
          return
        }
      }
      
      try {
        THIS.isFillSell = isSell
        THIS.setState({
          orderJSON,
          fillOrderInput: '',
          fillOrderTotal: '',
          clickPopUp: 'fillOption'
        }, async () => {
          // let balanceMaker = await getTokenBalance(orderJSON.metadata.makerToken.address, orderJSON.signedOrder.makerAddress, orderJSON.metadata.makerToken.decimals)
          // let balanceWETHOfMaker = balanceMaker
          // balanceMaker = THIS.isFillSell ? balanceMaker : (Number(balanceMaker) / Number(orderJSON.price))
          // let balanceDecimal = Math.pow(10, -Number(coinPair.first.decimals))
          // let maxBalanceCanPay = Number(balanceMaker) * Number(orderJSON.price)
          // let roundBalanceOfMakerWithPrice = Number(formatNumber2(balanceMaker, coinPair.first.decimals)) * Number(orderJSON.price)
          // For code below, when that order has been deleted immediatly:
          // 1. [DELETED] if balance of maker too small (<0.001) (It will be wrong if another Token has a price bigger than WETH price) - (Number(balanceMaker) < MIN_WETH_MAKE_ORDER)
          // 2. if "TAKE SELL ORDER" and maximum WETH you can pay for Token is too smaller than 0.001
          // 3. if "TAKE BUY ORDER" and Token balance of maker is smaller than DECIMAL
          // 4. if "TAKE BUY ORDER" and WETH balance of maker is smaller than 0.001
          // 5. if "TAKE BUY ORDER" and "TAKE SELL ORDER" total balance of order is smaller than 0.001
          // if (
          //   (THIS.isFillSell && maxBalanceCanPay < MIN_WETH_MAKE_ORDER) ||
          //   (!THIS.isFillSell && Number(balanceMaker) <= balanceDecimal) ||
          //   (!THIS.isFillSell && balanceWETHOfMaker < MIN_WETH_MAKE_ORDER) ||
          //   (Number(orderJSON.total) < MIN_WETH_MAKE_ORDER) ||
          //   (!THIS.isFillSell && roundBalanceOfMakerWithPrice < MIN_WETH_MAKE_ORDER)
          // ) {
          //   THIS.setState({
          //     balanceMakerForCheck: 0
          //   })
          //   await DexAPI.hideStatusCode(ORDER_STATUS.WARNING, orderJSON._id)
          //   THIS.refs.md_exs_fill_order.hide()
          //   THIS.setState({
          //     hasMoreAllToken: true,
          //     hasMoreMyHistory: true,
          //     hasMoreBoardHistory: true,
          //     allTokenOffset: 0,
          //     myHistoryOffset: 0,
          //     boardHistoryOffset: 0,
          //     isLoadMoreAllToken: false,
          //     isLoadMoreMyHistory: false,
          //     isLoadMoreBoardHistory: false
          //   }, () => {
          //     THIS.props.loadInitData()
          //   })
          // } else {
          //   THIS.setState({
          //     balanceMakerForCheck: balanceMaker
          //   })
          // }
          THIS.refs.md_exs_fill_order.show()
        })
      } catch (error) {
        ChatworkAPI.postMessage('clickOnCellOrder: ' + error)
      }
    } else {
      swal({
        width: '250px',
        text: t('isTakeLocked', {tokenName: isSell ? coinPair.second.symbol : coinPair.first.symbol}),
        type: 'error',
        showConfirmButton: false
      })
    }

    // check order locked by maker
    if (orderJSON.length > 0) {
      const ordersLocked = orderJSON.map(async (item, index) => {
        return new Promise(async (resolve, reject) => {
          const isOrderUnlocked = await OxObject.hasProxyAllowanceAsync(item.signedOrder.makerAddress, item.metadata.makerToken.address)
          if (!isOrderUnlocked) {
            if (isSell) {
              // remove order from order book sell
              dexData.orderBookSell = removeItemWithAttr(dexData.orderBookSell, '_id', item._id)
            } else {
              // remove order from order book buy
              dexData.orderBookBuy = removeItemWithAttr(dexData.orderBookBuy, '_id', item._id)
            }
            THIS.setState({
              dexData
            })

            const res = await DexAPI.warningMultipleOrders(item.signedOrder.makerAddress, item.metadata.makerToken.address, 'MAKER_LOCKED_TOKEN')
            if (res && !res.error) {
              resolve(true)
            } else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
            }
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            resolve(null)
          }
        })
      })
      Promise.all(ordersLocked)
        .then(result => {
          console.log('warningMultipleOrders', result)
          THIS.forceUpdate()
        })
        .catch(err => {
          console.log('warningMultipleOrders error', err)
        })
      
    }
  }
}

export const clickOnNextButtonFillOrder = (orderJSON, isFillSell) => {
  return (dispatch) => {
    const { gasPrice, fillOrderInput, fillOrderTotal, coinPair, minAmountFillInput } = THIS.state
    const { t } = THIS.props
    const totalBalance = sumValueByKey(orderJSON, 'balance')
    let arrFillOrderInputDigit = String(fillOrderInput).split('.')
    let decimalCountFillInput = fillOrderInput.toString().length - fillOrderInput.toString().indexOf('.') - 1
    let decimals = coinPair.first.decimals
    let balanceDecimal = Math.pow(10, -Number(decimals))
    let minAmountFillInputForCompare = Number(formatNumber2(minAmountFillInput, decimals))

    // case of the fill amount input greater than total balance
    if (Number(totalBalance) < (fillOrderInput.length === 0 ? 0 : Number(fillOrderInput))) {
      swal({
        width: '250px',
        text: t('InsufficientAmount', {tokenName: coinPair.first.symbol}),
        type: 'error',
        showConfirmButton: false
      })
      return
    }
    if (isFillSell && Number(fillOrderTotal) > Number(coinPair.second.balance)) {
      swal({
        width: '250px',
        text: t('InsufficientAmount', {tokenName: coinPair.second.symbol}),
        type: 'error',
        showConfirmButton: false
      })
      return
    }
    if (!isFillSell && Number(fillOrderInput) > Number(coinPair.first.balance)) {
      swal({
        width: '250px',
        text: t('InsufficientAmount', {tokenName: coinPair.first.symbol}),
        type: 'error',
        showConfirmButton: false
      })
      return
    }

    // case of the decimals greater than the limited decimals
    if (arrFillOrderInputDigit.length > 1 && decimalCountFillInput > decimals) {
      if (Number(decimals) === 0) {
        swal({
          width: '250px',
          text: t('InputIntegerAmountOnly'),
          type: 'error',
          showConfirmButton: false
        })
      } else {
        swal({
          width: '250px',
          text: t('ppInputMaximum', {number: decimals}),
          type: 'error',
          showConfirmButton: false
        })
      }
      return
    }

    // case of fill amount input less than minimum fill amount input
    // if (Number(fillOrderInput) < Number(minAmountFillInput)) {
    //   swal({
    //     width: '250px',
    //     text: t('amountMustBeAtLeast', {number: formatNumber2((minAmountFillInputForCompare < Number(minAmountFillInput) ? (Number(minAmountFillInputForCompare) + balanceDecimal) : Number(minAmountFillInput)), (decimals > 8 ? 8 : decimals))}),
    //     type: 'error',
    //     showConfirmButton: false
    //   })
    //   return
    // }

    // if maker has not enough money
    // await getBalanceMaker(orderJSON)
    // let balanceMaker = await EtherLibrary.getTokenBalance(orderJSON.metadata.makerToken.address, orderJSON.signedOrder.makerAddress, orderJSON.metadata.makerToken.decimals)
    // console.log('balanceMakerFILL:', balanceMaker)
    // if (balanceMakerForCheck < Number(fillOrderInput) && isFillSell) {
    //   swal({
    //     width: '250px',
    //     text: t('InsufficientAmountMaker', {tokenName: orderJSON.tokenSymbol}),
    //     type: 'error',
    //     showConfirmButton: false
    //   })
    //   popupFillOrder.hide()
    //   // await cancelOrderByUser(orderJSON)
    //   console.log('Maker Selling and just take care about Token Name:', balanceMakerForCheck)
    //   return
    // }
    // if (balanceMakerForCheck < Number(fillOrderTotal) && !isFillSell) {
    //   swal({
    //     width: '250px',
    //     text: t('InsufficientAmountMaker', {tokenName: 'WETH'}),
    //     type: 'error',
    //     showConfirmButton: false
    //   })
    //   popupFillOrder.hide()
    //   // await cancelOrderByUser(orderJSON)
    //   console.log('Maker Buying and just take care about WETH:', balanceMakerForCheck)
    //   return
    // }

    THIS.setState({
      setWidthPrice: Number(gasPrice.slow + 5).toFixed(1),
      valueInputGas: Number(gasPrice.slow + 5).toFixed(1),
      transactionFee: convertWeiToBalance(Number(gasPrice.slow + 5) * THIS.gasLimit, 9)
    }, () => {
      THIS.refs.md_exs_fill_order.hide()
      THIS.refs.md_exs_gas.show()
    })
  }
}

export const clickOnFilledOrder = (orderJSON) => {
  return (dispatch) => {
    console.log('orderJSON: ', JSON.stringify(orderJSON, undefined, 2))
  }
}

export const clickOnOrderHistory = (orderJSON) => {
  return (dispatch) => {
    THIS.setState({
      orderJSON,
      wrapAllOrderJSON: null,
      allOrderJSON: null
    }, () => {
      THIS.refs.md_exs_order_detail.show()
    })
  }
}

export const fillAction = (orderJson) => {
  return (dispatch, getState) => {
    const { internetData, arrCardData, t } = THIS.props
    const { dexData, fillOrderInput, coinPair } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    // if (!internetData || isSending) return
    if (!internetData) return
    THIS.refs.md_exs_fill_order.hide()
    THIS.setState({
      isSending: true
    }, () => {
      OxObject.batchFillOrdersAsync(orderJson, fillOrderInput, THIS.isFillSell).then(async (res) => {
        console.log('fillAction success', res)
        if (res && res.txHash && !res.error) {
          let txID = res.txHash
          let amountWei = OxObject.convertToBaseUnitAmount(sumValueInObject(res.amountBaseUnit), Number(coinPair.first.decimals))
          let signedOrder = orderJson[0].signedOrder
          signedOrder.makerAddress = '0x0000000000000000000000000000000000000000'
          signedOrder.makerAssetAmount = amountWei
          signedOrder.takerAssetAmount = OxObject.convertToBaseUnitAmount(formatNumberCal(sumValueInObject(res.amountBaseUnit) * orderJson[0].price), Number(coinPair.second.decimals))
          const fillData = {
            signedOrder,
            metadata: orderJson[0].metadata,
            tokenSymbol: orderJson[0].tokenSymbol,
            price: orderJson[0].price,
            priceInWei: orderJson[0].priceInWei,
            createTimestamp: orderJson[0].createTimestamp,
            remainBalance: amountWei.toString(),
            txID,
            txBalance: amountWei.toString(),
            addressFiller: mainAccount.address.toLowerCase(),
            ordersFilled: res.ordersFilled ? res.ordersFilled : []
          }
          const rs = await DexAPI.batchFillOrder(fillData)
          if (rs && !rs.error && rs.order) {
            // show notice the order was filled, but the transaction of order is pending
            swal({
              width: '320px',
              text: t('ItMayTakeAFewMomentsToProcess'),
              type: 'info',
              timer: 2000,
              showConfirmButton: false
            })
            dexData.myOrderHistory.unshift(convertOrderToBalance(coinPair.first.symbol === rs.order.metadata.makerToken.symbol, rs.order))
            THIS.setState({
              dexData,
              lightingMyHistory: true,
              isSending: false
            }, () => {
              dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: txID}))
            })
          } else {
            ChatworkAPI.postMessage('fillAction: ' + rs)
          }
        } else {
          // if (res.error.toString().includes('ORDER_FILL_EXPIRED')) {
          //   swal({
          //     width: '250px',
          //     text: t('ORDER_FILL_EXPIRED'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          //   THIS.props.loadInitData()
          // } else if (res.error.toString().includes('ORDER_REMAINING_FILL_AMOUNT_ZERO')) {
          //   swal({
          //     width: '250px',
          //     text: t('ORDER_REMAINING_FILL_AMOUNT_ZERO'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          //   DexAPI.hideStatusCode(ORDER_STATUS.WARNING, orderJson._id)
          //   THIS.props.loadInitData()
          // } else if (res.error.toString().includes('INSUFFICIENT_MAKER_ALLOWANCE')) {
          //   swal({
          //     width: '250px',
          //     text: t('INSUFFICIENT_MAKER_ALLOWANCE'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // } else if (res.error.toString().includes('INSUFFICIENT_TAKER_ALLOWANCE')) {
          //   swal({
          //     width: '250px',
          //     text: t('INSUFFICIENT_TAKER_ALLOWANCE'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // } else if (res.error.toString().includes('INSUFFICIENT_MAKER_BALANCE')) {
          //   swal({
          //     width: '250px',
          //     text: t('INSUFFICIENT_MAKER_BALANCE', {tokenName: orderJson.metadata.makerToken.symbol}),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // } else if (res.error.toString().includes('INSUFFICIENT_TAKER_BALANCE')) {
          //   swal({
          //     width: '250px',
          //     text: t('INSUFFICIENT_TAKER_BALANCE', {tokenName: orderJson.metadata.takerToken.symbol}),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // } else if (res.error.toString().includes('INSUFFICIENT_ETH_BALANCE_FOR_DEPOSIT')) {
          //   swal({
          //     width: '250px',
          //     text: t('INSUFFICIENT_ETH_BALANCE_FOR_DEPOSIT'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // } else if (res.error.toString().includes('INSUFFICIENT_WETH_BALANCE_FOR_WITHDRAWAL')) {
          //   swal({
          //     width: '250px',
          //     text: t('INSUFFICIENT_WETH_BALANCE_FOR_WITHDRAWAL'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // } else if (res.error.toString().includes('INVALID_SIGNATURE')) {
          //   swal({
          //     width: '250px',
          //     text: t('CHECK_AGAIN'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // } else if (res.error.toString().includes('ORDER_FILL_ROUNDING_ERROR')) {
          //   swal({
          //     width: '250px',
          //     text: t('CHECK_AGAIN'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          //   DexAPI.hideStatusCode(ORDER_STATUS.WARNING, orderJson._id)
          //   // when this order has been deleted and filled
          //   THIS.props.loadInitData()
          // } else if (res.error.toString().toLowerCase() === '[object object]' || res.error.toString().toLowerCase().includes('[object object]')) {
          //   swal({
          //     width: '250px',
          //     text: t('CHECK_AGAIN'),
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // } else if (res.error.toString().toLowerCase() !== '[object progressevent]') {
          //   swal({
          //     width: '250px',
          //     text: res.error,
          //     type: 'error',
          //     showConfirmButton: false
          //   })
          // }
          swal({
            width: '250px',
            text: t(res.error),
            type: 'error',
            showConfirmButton: false
          })
          THIS.setState({isSending: false})
          ChatworkAPI.postMessage('fillAction - error: ' + res.error + '; token: ' + orderJson[0].tokenSymbol + '; price: ' + orderJson[0].price)
        }
      }).catch(error => {
        swal({
          width: '250px',
          text: t('CHECK_AGAIN'),
          type: 'error',
          showConfirmButton: false
        })
        THIS.setState({isSending: false})
        ChatworkAPI.postMessage('fillAction - error: ' + error + '; token: ' + orderJson[0].tokenSymbol + '; price: ' + orderJson[0].price)
      })
    })
  }
}

export const clickCancel = (item) => {
  return async (dispatch, getState) => {
    console.log('clickCancel: ', item)
    const { internetData, arrCardData, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    let orderCanceling = []
    let moreItems = false
    if (item && item.length > 1) {
      item.map(e => {
        orderCanceling.push(e._id)
      })
      moreItems = true
    } else {
      orderCanceling = item._id
    }
    THIS.setState({
      lightingMyOrder: false,
      isCancelingOrder: true,
      orderCanceling
    })
    console.log('orderCanceling: ', orderCanceling)
    if (internetData) {
      try {
        await OxObject.cancelOrderAsync(item).then(async (res) => {
          if (!res.error) {
            let txID = res.transactionHash
            let blockNumber = res.blockNumber
            let fee = res.fee.toString()
            let data = moreItems 
              ? (await DexAPI.cancelMoreOrder(orderCanceling, txID, blockNumber, fee))  
              : (await DexAPI.cancelOrder(item._id, txID, blockNumber, fee))
            if (data && !data.error) {
              THIS.setState({
                isCancelingOrder: false,
                orderCanceling: ''
              }, () => {
                THIS.props.fetchOrderedAmount()
                dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: txID}))
              })
            } else {
              swal({
                width: '250px',
                text: t('ppCancelOrderError'),
                type: 'error',
                showConfirmButton: false
              })
            }
          } else {
            swal({
              width: '250px',
              text: t('ppCancelOrderError'),
              type: 'error',
              showConfirmButton: false
            })
          }
        })
      } catch (error) {
        swal({
          width: '250px',
          text: t('ppCancelOrderError'),
          type: 'error',
          showConfirmButton: false
        })
      }
    }
    THIS.setState({
      isCancelingOrder: false,
      orderCanceling: ''
    })
  }
}

export const cancelOrderByUser = (item) => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    if (internetData) {
      await OxObject.cancelOrderAsync(item, item.remainBalance)
      let data = await DexAPI.cancelOrder(item._id)
      console.log('data cancel', data)
      THIS.props.loadInitData()
    }
  }
}

export const nextPlaceOrder = () => {
  return async (dispatch, getState) => {
    const { priceInput, amountInput, coinPair, selectedDate, isSell, totalInput } = THIS.state
    const { screenConfig, t } = THIS.props
    let makerTokenAmount = amountInput
    let takerTokenAmount = totalInput
    let priceInWei = bigInt(convertBalanceToWei(Number(priceInput), coinPair.second.decimals))
    priceInWei = priceInWei.toString().split('.')[0]
    const coinFirstTemp = {
      symbol: coinPair.first.symbol,
      decimals: Number(coinPair.first.decimals),
      name: coinPair.first.name,
      address: coinPair.first.address
    }
    const coinSecondTemp = {
      symbol: coinPair.second.symbol,
      decimals: Number(coinPair.second.decimals),
      name: coinPair.second.name,
      address: coinPair.second.address
    }
    let makerToken = coinFirstTemp
    let takerToken = coinSecondTemp
    if (!isSell) {
      makerToken = coinSecondTemp
      takerToken = coinFirstTemp
      let temp = takerTokenAmount
      takerTokenAmount = makerTokenAmount
      makerTokenAmount = temp
    }
    THIS.setState({isPlacing: true})
    const orderJson = await OxObject.generateOrder(makerTokenAmount, takerTokenAmount, makerToken, takerToken, selectedDate.unix())
    if (orderJson && !orderJson.errorCode) {
      console.log('Generated order: ', orderJson)
      orderJson.tokenSymbol = coinPair.first.symbol
      orderJson.price = priceInput
      // orderJson.createTimestamp = moment(new Date()).unix()
      orderJson.priceInWei = priceInWei.toString()

      // check valid amount input
      let isValidAmountInput = true
      await THIS.props.loadingTokenbalance()
      if (isSell) {
        orderJson.remainBalance = OxObject.convertToBaseUnitAmount(makerTokenAmount, makerToken.decimals).toString()
        if (coinPair.first.balance < Number(amountInput)) {
          isValidAmountInput = false
        }
      } else {
        orderJson.remainBalance = OxObject.convertToBaseUnitAmount(takerTokenAmount, takerToken.decimals).toString()
        if (coinPair.second.balance < Number(totalInput)) {
          isValidAmountInput = false
        }
      }

      let result = {}
      if (isValidAmountInput) {
        result = await DexAPI.insertOrder(orderJson)
      }
      if (!result || result.errorCode || !isValidAmountInput) {
        THIS.setState({
          isPlacing: false,
          amountInput: '',
          totalInput: '',
          date: moment(new Date()).add(7, 'd'), // current day + a week,
          selectedDate: moment(new Date()).add(7, 'd') // current day + a week
        })
        let messsageError = !isValidAmountInput ? t('placeOrderError') + ' ' + t('reloadBalance') : t('placeOrderError')
        if (result.errorCode) {
          switch (orderJson.errorCode) {
          case 'PRICE_MUST_LESS_THAN':
            messsageError = t('inputPriceLessThan', { price: formatNumberOld(convertWeiToBalance(orderJson.price)) })
            break
          case 'PRICE_MUST_GREATER_THAN':
            messsageError = t('inputPriceGreaterThan', { price: formatNumberOld(convertWeiToBalance(orderJson.price)) })
            break
          case 'MAXIMUM_NEW_ORDER':
            messsageError = t('maximumNewOrder', { number: formatNumberOld(screenConfig.hb_dex.num_of_limit_make_order) })
            break
          }
        }
        swal({
          width: '250px',
          text: messsageError,
          type: 'error',
          showConfirmButton: false
        })
      } else {
        THIS.setState({
          isPlacing: false,
          amountInput: '',
          totalInput: '',
          date: moment(new Date()).add(7, 'd'), // current day + a week,
          selectedDate: moment(new Date()).add(7, 'd') // current day + a week
        })
        swal({
          width: '250px',
          text: t('placeOrderSuccessfull'),
          type: 'success',
          timer: 5000,
          showConfirmButton: false
        })
      }
    } else {
      THIS.setState({
        isPlacing: false,
        amountInput: '',
        totalInput: '',
        date: moment(new Date()).add(7, 'd'), // current day + a week,
        selectedDate: moment(new Date()).add(7, 'd') // current day + a week
      })
      swal({
        width: '250px',
        text: t('placeOrderError'),
        type: 'error',
        showConfirmButton: false
      })
    }
  }
}

export const clickPlaceOrder = () => {
  return async (dispatch, getState) => {
    const { dexData, priceInput, amountInput, coinPair, selectedDate, isSell, totalInput, totalActiveBuy, totalActiveSell } = THIS.state
    const { screenConfig, t } = THIS.props
    if (isSell && !coinPair.first.unlocked) {
      swal({
        width: '250px',
        text: t('isPlaceLocked', {tokenName: coinPair.first.symbol}),
        type: 'error',
        showConfirmButton: false
      })
      return
    }
    if (!isSell && !coinPair.second.unlocked) {
      swal({
        width: '250px',
        text: t('isPlaceLocked', {tokenName: coinPair.second.symbol}),
        type: 'error',
        showConfirmButton: false
      })
      return
    }

    if (!(priceInput.toString().length === 0 || amountInput.toString().length === 0 || Number(amountInput) === 0 || Number(priceInput) === 0)) {
      try {

        // check mininum amount allow to exchage
        if ((Number(priceInput) * Number(amountInput)) < minWethMakeOrder) {
          let minAmountAllow = Math.ceil(minWethMakeOrder / Number(priceInput))
          swal({
            width: '250px',
            text: t(isSell ? 'AmountMustBeAtLeastSell' : 'AmountMustBeAtLeastBuy', {number: formatNumberLeftZero(minAmountAllow, coinPair.first.decimals), tokenName: coinPair.first.symbol}),
            type: 'error',
            showConfirmButton: false
          })
          return
        }

        // check maximum decimal allow for amount
        let arrAmountDigit = String(amountInput).split('.')
        let decimalCountAmount = amountInput.length - amountInput.indexOf('.') - 1
        if (arrAmountDigit.length > 1 && decimalCountAmount > coinPair.first.decimals) {
          if (Number(coinPair.first.decimals) === 0) {
            swal({
              width: '250px',
              text: t('InputIntegerAmountOnly'),
              type: 'error',
              showConfirmButton: false
            })
          } else {
            swal({
              width: '250px',
              text: t('ppInputMaximum', {number: coinPair.first.decimals}),
              type: 'error',
              showConfirmButton: false
            })
          }
          return
        }
        
        if (isSell) {
          let amountAvailableSell = Number(coinPair.first.balance) - Number(totalActiveSell)
          if (amountAvailableSell <= 0) {
            swal({
              width: '250px',
              text: t('BalanceIsNotEnoughToSell'),
              type: 'error',
              showConfirmButton: false
            })
            return
          }
          if (Number(amountInput) > Number(amountAvailableSell)) {
            swal({
              width: '250px',
              text: t('maximumAmount', {number: formatNumberLeftZero(amountAvailableSell, coinPair.first.decimals), tokenName: coinPair.first.symbol}),
              type: 'error',
              customClass: 'swal-breakLine',
              showConfirmButton: false
            })
            return
          }
          if (dexData.orderBookBuy.length > 0 && Number(priceInput) <= Number(dexData.orderBookBuy[0][0].price)) {
            swal({
              width: '250px',
              text: t('inputPriceGreaterThan', { price: formatNumberCal(dexData.orderBookBuy[0][0].price) }),
              type: 'error',
              showConfirmButton: false
            })
            return
          }
        } else {
          let amountAvailableBuy = Number(coinPair.second.balance) - Number(totalActiveBuy)
          if (amountAvailableBuy <= 0) {
            swal({
              width: '250px',
              text: t('BalanceIsNotEnoughToBuy'),
              type: 'error',
              showConfirmButton: false
            })
            return
          }
          if (Number(totalInput) > Number(amountAvailableBuy)) {
            swal({
              width: '250px',
              text: t('maximumAmount', {number: formatNumberOld(amountAvailableBuy, 8), tokenName: coinPair.second.symbol}),
              type: 'error',
              customClass: 'swal-breakLine',
              showConfirmButton: false
            })
            return
          }
          if (dexData.orderBookSell.length > 0 && Number(priceInput) >= Number(dexData.orderBookSell[0][0].price)) {
            swal({
              width: '250px',
              text: t('inputPriceLessThan', { price: formatNumberCal(dexData.orderBookSell[0][0].price) }),
              type: 'error',
              showConfirmButton: false
            })
            return
          }
        }

        // check maximum order
        let myOpenOrders = dexData.myOrderHistory.filter(e => e.statusCode === ORDER_STATUS.OPEN)
        if (myOpenOrders.length >= screenConfig.hb_dex.num_of_limit_make_order) {
          swal({
            width: '250px',
            text: t('maximumNewOrder', { number: formatNumberOld(screenConfig.hb_dex.num_of_limit_make_order) }),
            type: 'error',
            showConfirmButton: false
          })
          return
        }

        // check valid exprire date
        const isValidExprireDate = moment(new Date()).unix() <= selectedDate.unix()
        if (!isValidExprireDate) {
          THIS.setState({
            date: moment(new Date()),
            hourSelect: moment(new Date()).format('HH'),
            minuteSelect: moment(new Date()).format('mm')
          })
          swal({
            width: '250px',
            text: t('invalidExprireDate'),
            type: 'error',
            showConfirmButton: false
          })
          return
        }
        THIS.refs.md_exs_place_order.show()
      } catch (error) {
        THIS.setState({isPlacing: false})
        swal({
          width: '250px',
          text: t('placeOrderError'),
          type: 'error',
          showConfirmButton: false
        })
        ChatworkAPI.postMessage('clickPlaceOrder: ' + error)
      }
    } else {
      swal({
        width: '250px',
        text: t('invalidInput'),
        type: 'error',
        showConfirmButton: false
      })
    }
  }
}
export const unlock = (item) => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)

    if (!internetData || THIS.isUnLocking) return
    item.unLocking = true
    THIS.isUnLocking = true
    THIS.setState({
      isSending: true
    }, async () => {
      const res = await OxObject.setUnlimitedProxyAllowanceAsync(item.address, item.decimal ? Number(item.decimal) : Number(item.decimals), item.unlocked)
      if (!res.error) {
        const txId = res
        THIS.setState({
          isSending: false
        })
        dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: txId}))
        // show notice the order was filled, but the transaction of order is pending
        swal({
          width: '320px',
          text: t('ItMayTakeAFewMomentsToProcess'),
          type: 'info',
          timer: 2000,
          showConfirmButton: false
        })
        
        const callRequest = new Promise(async (resolve, reject) => {
          console.log('awaitTransactionSuccessAsync: ', txId)
          const txReceipt = await OxObject.awaitTransactionSuccessAsync(txId)
          console.log('txReceipt: ', txReceipt)
          if (txReceipt.to.toLowerCase() === item.address.toLowerCase()) {
            item.unLocking = false
            item.unlocked = !item.unlocked
          }
          THIS.isUnLocking = false

          // update pending status
          const { pendingTx } = getState()
          pendingTx.isPending = false
          dispatch(setPendingTx(pendingTx))
          if (txReceipt && txReceipt.status === 1) { // transaction successfully
            // update card balance
            ReduxServices.refreshCardBalance(arrCardData)
            resolve(true)
          } else { // transaction failed
            swal({
              width: '250px',
              text: t('transactionFailed'),
              type: 'error',
              showConfirmButton: false
            })
            resolve(false)
          }
          THIS.forceUpdate()
        })
        Promise.race([callRequest, callTimeout()]).then((result) => {
          console.log('callRequest success', result)
          THIS.forceUpdate()
        }).catch((err) => {
          console.log('callRequest failed', err)
          if (err === 'OVER_TIME') {
            item.unLocking = false
            THIS.isUnLocking = false

            THIS.setState({
              isSending: false
            })
          } else {
            // update pending status
            const { pendingTx } = getState()
            pendingTx.isPending = false
            dispatch(setPendingTx(pendingTx))
          }
          THIS.forceUpdate()
        })
      } else {
        let error = res.error
        item.unLocking = false
        THIS.isUnLocking = false
        THIS.forceUpdate()
        THIS.setState({
          isSending: false
        })
        swal({
          width: '250px',
          text: t(`${error}`),
          type: 'error',
          showConfirmButton: false
        })
      }
    })
  }
}

export const openCalender = () => {
  return (dispatch, getState) => {
    const { heightCalendar } = THIS.state
    THIS.setState({heightCalendar: heightCalendar === 0 ? HEITH_CALENDAR : 0})
  }
}

export const closeCalender = () => {
  return (dispatch, getState) => {
    THIS.setState({heightCalendar: 0})
  }
}

export const changeFillOrderInput = (fillOrderInput) => {
  return (dispatch, getState) => {
    const { orderJSON } = THIS.state

    if (validateNumber(fillOrderInput)) {
      if (fillOrderInput.toString() !== '.') {
        let dotsCount = countDots(fillOrderInput, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let decimalCount = fillOrderInput.length - fillOrderInput.indexOf('.') - 1
          let integerCount = String(parseInt(fillOrderInput)).length
          if (!(integerCount > LIMIT_NUMBER.INT_NUMBER) && !(dotsCount === 1 && decimalCount > LIMIT_NUMBER.DECIMAL_NUMBER)) {
            const fillOrderTotal = Number(fillOrderInput) * Number(orderJSON[0].price)
            const minAmountFillInput = minWethMakeOrder / Number(orderJSON[0].price)
            THIS.setState({
              fillOrderInput,
              gasAmount: fillOrderInput,
              fillOrderTotal,
              isErrorFillInput: Number(fillOrderInput) < Number(minAmountFillInput),
              minAmountFillInput: formatNumberCal(minAmountFillInput)
            })
          }
        }
      }
    } else if (fillOrderInput.length === 0) {
      THIS.setState({
        fillOrderInput: '',
        fillOrderTotal: ''
      })
    }
  }
}

export const setIsSell = (isSell) => {
  return (dispatch, getState) => {
    console.log('setIsSell: ', isSell)
    THIS.setState({
      isSell: isSell
    })
  }
}
export const setIsActive = (isActive) => {
  return (dispatch, getState) => {
    const { arrCurrencyData } = THIS.props
    if (isActive) {
      THIS.setState({
        isActive: false,
        unitOfCoin2: arrCurrencyData
      })
    } else {
      THIS.setState({
        isActive: true,
        unitOfCoin2: 'WETH'
      })
    }
  }
}
export const setIsFavorite = (isFavorite) => {
  return (dispatch, getState) => {
    THIS.setState({isFavorite})
  }
}
export const changeChartType = (type) => {
  return (dispatch) => {
    const { chartType, coinPair, orderFilledHistory } = THIS.state
    if (chartType !== type) {
      THIS.setState({
        chartType: type,
        isLoadingChart: true
      }, () => {
        let candle = loadOrderListBasedOnTimeInterval(coinPair.first.decimals, orderFilledHistory, getTimeFromPeriod())
        THIS.setState({
          periodNode: getNodeFromPeriod(),
          chartData: candle,
          isLoadingChart: false
        })
        THIS.forceUpdate()
      })
    }
  }
}

const filterCandle = (decimals, orders, interval) => {
  if (orders.length === 0 || orders.length === null) { return null }
  let _price = Number(orders[0].price)
  let _leftTime = Number(orders[0].filledTimestamp) % interval
  let _tempTime = Number(orders[0].filledTimestamp) - _leftTime
  let result = {
    date: new Date(Number(_tempTime) * 1000), // time of candle will be the filledTime of the first order
    open: _price,
    close: Number(orders[orders.length - 1].price),
    high: _price,
    low: _price,
    volume: Number(convertWeiToBalance(orders[0].txBalance, decimals))
  }
  // console.log('filter result1: ', result)
  for (let i = 1; i < orders.length; i++) {
    _price = Number(orders[i].price)
    if (result.high < _price) {
      result.high = _price
    }
    if (result.low > _price) {
      result.low = _price
    }
    result.volume += Number(convertWeiToBalance(orders[i].txBalance, decimals))
  }
  return result
}

const addEmptyCandle = (NoDistance, timeStamp, interval, value) => {
  let candleList = []
  // emply candle will take the close value of last candle
  for (let i = 0; i < NoDistance; i++) {
    candleList.push({
      date: new Date((timeStamp + i * interval) * 1000),
      open: value,
      close: value,
      high: value,
      low: value,
      volume: 0
    })
  }
  return candleList
}

// get list of order base on time interval
// orders : list of unshorted orders, interval = miliseconds
const loadOrderListBasedOnTimeInterval = (decimals, orders, interval) => {
  let candleList = [] // list of candle

  if (orders && orders.length > 0) {
    // orders = orders.filter(i => i.statusCode === ORDER_STATUS.FILLED)
    console.log('orders :', orders)
    console.log('orders.length :', orders.length)
    console.log('interval', interval)
    let tempTimeStamp = Number(orders[orders.length - 1].filledTimestamp)
    let leftTime = tempTimeStamp % interval
    tempTimeStamp = tempTimeStamp - leftTime
    console.log('tempTimeStamp', tempTimeStamp)
    let orderEachCandle = [] // list of order in certain time

    for (let i = orders.length - 1; i >= 0; i--) {
      let _time = Number(orders[i].filledTimestamp)
      if (_time < tempTimeStamp + interval) {
        orderEachCandle.push(orders[i])
      } else {
        let temp = filterCandle(decimals, orderEachCandle, interval)
        if (temp) { candleList.push(temp) }
        orderEachCandle = [] // reset only work when orderEachCandle is not reference by other array
        tempTimeStamp += interval
        let NoOf5m = Math.floor((_time - tempTimeStamp) / interval)
        if (NoOf5m > 0) { // add empty list5m
          let result = addEmptyCandle(NoOf5m, tempTimeStamp, interval, candleList[candleList.length - 1].close) // calculate empty candle
          candleList = candleList.concat(result)
          tempTimeStamp += NoOf5m * interval
        }
        orderEachCandle.push(orders[i])
      }
    }
    console.log('orderEachCandle', orderEachCandle)

    if (orderEachCandle.length > 0) {
      let temp = filterCandle(decimals, orderEachCandle, interval)
      candleList.push(temp)
    }
    console.log('tempTimeStamp end', tempTimeStamp)

    const currentTimeStamp = Math.floor(Date.now() / 1000)
    console.log('current time', currentTimeStamp)
    if (currentTimeStamp > tempTimeStamp + interval) {
      let NoOf5m = Math.floor((currentTimeStamp - tempTimeStamp) / interval)
      console.log('NoOf5m', NoOf5m)
      tempTimeStamp += interval
      if (NoOf5m > 0) { // add empty list5m
        let result = addEmptyCandle(NoOf5m, tempTimeStamp, interval, candleList[candleList.length - 1].close) // calculate empty candle
        candleList = candleList.concat(result)
        tempTimeStamp += NoOf5m * interval
      }
    }

    if (candleList.length === 1) {
      let recordTemp = {
        date: new Date((Number(orders[orders.length - 1].filledTimestamp) - interval) * 1000),
        open: orders[0].price,
        close: orders[0].price,
        high: orders[0].price,
        low: orders[0].price,
        volumn: 0
      }
      candleList.unshift(recordTemp)
    }
  }
  console.log('candleList: ', candleList)
  return candleList
}

export const getData = (self) => {
  console.log('get data now')
  return (dispatch) => {
    const parseData = (parse) => {
      return function (d) {
        d.date = parse(d.date)
        d.open = +d.open
        d.high = +d.high
        d.low = +d.low
        d.close = +d.close
        d.volume = +d.volume
        return d
      }
    }

    try {
      self.setState({isLoadingChart: true}, async () => {
        let response = await fetch('//rrag.github.io/react-stockcharts/data/bitfinex_xbtusd_1m.csv')
        response = await response.text()
        response = await csvParse(response, parseData(parseDate))
        self.setState({ chartData: response, isLoadingChart: false })
      })
    } catch (error) {
      self.setState({isLoadingChart: false})
      var e = {
        message: 'getData error ',
        error: error.message
      }
      DexAPI.insertCrashLog(e)
    }
  }
}
export const handleChangePeriod = (type, value) => {
  return (dispatch) => {
    const { periodChart, coinPair, orderFilledHistory } = THIS.state

    if (periodChart !== value) {
      THIS.setState({
        periodChartType: type,
        periodChart: value,
        isLoadingChart: true
      }, () => {
        let candle = loadOrderListBasedOnTimeInterval(coinPair.first.decimals, orderFilledHistory, getTimeFromPeriod())
        THIS.setState({
          periodNode: getNodeFromPeriod(),
          chartData: candle,
          isLoadingChart: false
        })
        THIS.forceUpdate()
      })
    }
  }
}
export const renderCoinPair = (_this) => {
  return (dispatch) => {
    const { arrTokenData, dexSelectedPair } = _this.props
    console.log('dexSelectedPair', dexSelectedPair)
    _this.CoinPairs = []
    let coinPair = [
      {first: dexSelectedPair.token, second: arrTokenData[0] || WETH_TOKEN}
    ]

    return coinPair[0]
  }
}
export const handleFilterBoardHistory = (type) => {
  return async (dispatch) => {
    const { dexData, coinPair } = THIS.state
    let result = await DexAPI.getOrderBoardHistory(coinPair.first.address, coinPair.second.address, type, 0)
    if (result && result.orderHistory && result.orderHistory.length > 0) {
      result.orderHistory.map((item) => {
        item = convertOrderToBalance(coinPair.first.symbol === item.metadata.makerToken.symbol, item)
      })
      dexData.boardHistory = result.orderHistory
      THIS.setState({
        dexData,
        boardHistoryType: type,
        boardHistoryOffset: 0,
        hasMoreBoardHistory: true,
        isLoadMoreBoardHistory: false
      })
    } else {
      dexData.boardHistory = []
      THIS.setState({
        dexData,
        boardHistoryType: type,
        boardHistoryOffset: 0,
        hasMoreBoardHistory: false,
        isLoadMoreBoardHistory: false
      })
    }
  }
}
export const getExchangeTokens = () => {
  return async () => {
    const { arrTokenData } = THIS.props
    const list = await DexAPI.getExchangeTokens(false)
    if (list && list.length && list.length > 0) {
      list && list.forEach(e => {
        THIS.CoinPairs.push({
          first: e,
          second: arrTokenData[0]
        })
      })
    }
    
    THIS.CoinPairs = THIS.CoinPairs.sort(function (a, b) {
      if (a.first.symbol < b.first.symbol) return -1
      if (a.first.symbol > b.first.symbol) return 1
      return 0
    })
  }
}

export const onInputAmount = (percent) => {
  return () => {
    const { isSell, priceInput, coinPair, totalActiveBuy, totalActiveSell } = THIS.state
    const { t } = THIS.props
    let amount = ''
    if (isSell) {
      let amountAvailabelSell = Number(coinPair.first.balance) - Number(totalActiveSell)
      amount = amountAvailabelSell * Number(percent)
    } else if (priceInput.toString().length > 0) {
      let amountAvailableBuy = Number(coinPair.second.balance) - Number(totalActiveBuy)
      amountAvailableBuy = amountAvailableBuy / Number(priceInput)
      amount = amountAvailableBuy * Number(percent)
    } else {
      swal({
        width: '250px',
        text: t('PleaseInputPRICEFirst'),
        type: 'error',
        showConfirmButton: false
      })
    }
    console.log('amount: ', percent, coinPair.first.decimals, amount, formatNumberCal(amount.toString(), coinPair.first.decimals))
    THIS.props.onChangeAmount(amount !== '' ? formatNumberCal(amount.toString(), coinPair.first.decimals) : '')
  }
}

export const fetchListCoin = () => {
  return async (dispatch, getState) => {
    const { arrCurrencyData } = THIS.props
    let result = await DexAPI.getCMC(1, arrCurrencyData)
    if (result && result.data && result.data.length > 0) {
      dispatch(setListCoin(result.data))
    }
  }
}

export const fetchAnnounceMessage = () => {
  return async (dispatch, getState) => {
    let announceMessage = await DexAPI.getAnnounceMessage()
    if (announceMessage && !announceMessage.error) {
      dispatch(setDexAnnounce(announceMessage))
    }
  }
}

export const onChangeMyOrderFilter = (value) => {
  return (dispatch, getState) => {
    THIS.setState({
      myOrderFilter: value
    })
  }
}

export const changeTabNewOrder = () => {
  return (dispatch, getState) => {
    THIS.setState({
      tabNewOrder: false
    })
  }
}

export const changeTabMyBalance = () => {
  return (dispatch, getState) => {
    THIS.setState({
      tabNewOrder: true
    })
  }
}

export const handleChangeActiveBoard = (value) => {
  return (dispatch, getState) => {
    const { activeOrderBoard } = THIS.state
    if (activeOrderBoard !== 0) {
      THIS.setState({
        activeOrderBoard: 0,
        lightingBoardHistory: false
      })
    } else {
      THIS.setState({
        activeOrderBoard: value,
        lightingBoardHistory: false
      })
    }
  }
}

export const handleChangeRating = (rate) => {
  return async (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const { coinPair } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    let setRate = await DexAPI.setRate(coinPair.first.address, coinPair.second.address, rate, mainAccount.address)
    if (setRate && !setRate.error && setRate.data) {
      THIS.props.fetchRateAndFavorite()
    }
  }
}

export const fetchFavoriteTokens = () => {
  return async (dispatch, getState) => {
    const { arrCardData } = THIS.props
    if (arrCardData && arrCardData.length > 0) {
      let favoriteTokens = await DexAPI.getFavoriteTokens(arrCardData[0].address)
      if (favoriteTokens && favoriteTokens.data) {
        dispatch(setDexFavorite(favoriteTokens.data))
      }
    }
  }
}

export const handleChangeFavorite = () => {
  return async (dispatch, getState) => {
    const { arrCardData, dexFavorite, dexTokenList, dexTokenFavorite } = THIS.props
    const { coinPair, isMyFavorite } = THIS.state
    let favoriteFind = dexFavorite.find(e => e.from.toLowerCase() === coinPair.first.address.toLowerCase() && e.to.toLowerCase() === coinPair.second.address.toLowerCase())
    // add new favorite list into store
    let addFavorite = dexTokenList.find(e => e.token.address.toLowerCase() === coinPair.first.address.toLowerCase())
    if (favoriteFind) {
      let newDexTokenFavorite = dexTokenFavorite.datas.filter(e => e.token.address.toLowerCase() !== coinPair.first.address.toLowerCase())
      dispatch(setDexTokenFavorite({
        isLoading: false,
        datas: newDexTokenFavorite
      }))
    } else {
      let newDexTokenFavorite = dexTokenFavorite.datas.concat(addFavorite)
      dispatch(setDexTokenFavorite({
        isLoading: false,
        datas: newDexTokenFavorite
      }))
    }
    let res = await DexAPI.setFavorite(coinPair.first.address, coinPair.second.address, String(!isMyFavorite), arrCardData[0].address)
    if (res) {
      THIS.setState({
        isMyFavorite: !isMyFavorite
      }, () => {
        THIS.props.fetchFavoriteTokens()
      })
    }
  }
}

export const getCoinById = (id, currency) => {
  return async (dispatch, getState) => {
    let atcResult = await CoinMarketCap.getCoinById(id, currency)
    if (atcResult && atcResult.data && atcResult.data[id] && id) {
      THIS.setState({
        atcResultEth: atcResult.data[id].quote[currency],
        isLoadingCMC: false
      })
    } else {
      THIS.setState({
        atcResultEth: null,
        isLoadingCMC: false
      })
    }
  }
}

export const getCoinInfo = (symbol, name, currency = 'ETH') => {
  return async (dispatch, getState) => {
    let atcCoinInfo = await DexAPI.getCoinInfo(symbol, currency, null, name)
    if (atcCoinInfo && !atcCoinInfo.error && atcCoinInfo.data) {
      // await THIS.props.getCoinById(atcCoinInfo.data.id, currency)
      THIS.setState({
        atcResultEth: atcCoinInfo.data,
        isLoadingCMC: false
      })
    } else {
      THIS.setState({
        atcResultEth: null,
        isLoadingCMC: false
      })
    }
  }
}

export const getMarketEth = (value) => {
  return (dispatch, getState) => {
    const { arrCurrencyData } = THIS.props
    const { coinPair } = THIS.state
    let unitOfCoin = ''
    if (value === 'ETH') {
      unitOfCoin = arrCurrencyData
      THIS.setState({
        coinToEth: false,
        unitOfCoin
      })
    } else {
      unitOfCoin = 'ETH'
      THIS.setState({
        coinToEth: true,
        unitOfCoin
      })
    }
    THIS.setState({
      isLoadingCMC: true
    }, () => {
      THIS.props.getCoinInfo(coinPair.first.symbol, coinPair.first.name, unitOfCoin)
    })
  }
}

export const onChangeLanguage = (lg) => {
  return (dispatch, getState) => {
    let isLg = LANGUAGES.some(function (e) { return e === lg })
    if (isLg) {
      THIS.setState({
        setLanguage: 'exs-font-' + lg.toString()
      })
    }
  }
}

export const dragVolume = (e) => {
  return (dispatch, getState) => {
    let gasLimit = Settings.gas.externalFeeToken
    THIS.setState({
      setWidthPrice: e,
      valueInputGas: e,
      transactionFee: convertWeiToBalance(e * gasLimit, 9)
    })
  }
}

export const openPopupLock = (num) => {
  return (dispatch, getState) => {
    // console.log('openPopupLock')
    const { coinPair } = THIS.state
    const { etherPrice, arrTokenData, dexSelectedPair } = THIS.props
    if (num === 0) {
      THIS.setState({
        checkarrToken: coinPair.first,
        checkUnlocked: coinPair.first.unlocked,
        balanceForPPLock: coinPair.first.balance,
        balancePriceForPPLock: Math.abs(dexSelectedPair.lastPrice.price) * coinPair.first.balance * etherPrice.price,
        clickPopUp: 'lockOption'
      }, () => {
        THIS.refs.md_exs_lock.show()
      })
    }
    if (num === 1) {
      THIS.setState({
        checkarrToken: coinPair.second,
        checkUnlocked: coinPair.second.unlocked,
        balanceForPPLock: arrTokenData[0].balance,
        balancePriceForPPLock: etherPrice.price * coinPair.second.balance,
        clickPopUp: 'lockOption'
      }, () => {
        THIS.refs.md_exs_lock.show()
      })
    }
  }
}
// make by lamtanphiho
export const openPopupTour = () => {
  return () => {
    THIS.refs.md_exs_tour.show()

  }
}

export const openPopupCancel = (item) => {
  return async (dispatch, getState) => {
    let gasLimit = Settings.gas.externalFeeToken
    let gasPrice = await EtherGas.getGasPrice()
    if (!gasPrice) {
      return
    }
    console.log('openPopupCancel123: ', item)
    THIS.refs.md_exs_order_detail.hide()
    THIS.setState({
      clickPopUp: 'cancelOption',
      setWidthPrice: Number(gasPrice.slow + 5).toFixed(1),
      valueInputGas: Number(gasPrice.slow + 5).toFixed(1),
      transactionFee: convertWeiToBalance(Number(gasPrice.slow + 5) * gasLimit, 9),
      openPopupCancelByID: item
    }, () => {
      THIS.refs.md_exs_gas.show()
    })
  }
}

export const fetchGasPrice = () => {
  return (dispatch, getState) => {
    console.log('fetchGasPrice: restart after 60 minutes')
    THIS.props.loadingGasPrice()
    if (THIS.backgroundTimerGasPrice) {
      clearInterval(THIS.backgroundTimerGasPrice)
    }
    THIS.backgroundTimerGasPrice = setInterval(() => THIS.props.loadingGasPrice(), SIXTY_MINUTES)
  }
}

export const loadingGasPrice = () => {
  return async (dispatch, getState) => {
    let gasLimit = Settings.gas.externalFeeToken
    let gas = await EtherGas.getGasPrice()
    if (!gas) {
      return
    }
    console.log('gasPrice', gas)
    THIS.setState({
      gasPrice: gas,
      setWidthPrice: gas.slow + 5,
      valueInputGas: gas.slow + 5,
      transactionFee: convertWeiToBalance(gas.slow * gasLimit, 9)
    })
  }
}

export const focusInputGasPrice = (value) => {
  return (dispatch, getState) => {
    if (validateNumber(value)) {
      if (value.toString() !== '.') {
        let dotsCount = countDots(value, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let decimalCount = value.length - value.indexOf('.') - 1
          if ((dotsCount !== 1 && decimalCount <= 3) || (dotsCount === 1 && decimalCount <= 1)) {
            THIS.setState({
              valueInputGas: value
            }, () => THIS.forceUpdate())
          }
        }
      }
    } else if (value.length === 0) {
      THIS.setState({
        valueInputGas: ''
      })
    }
  }
}

export const unFocusInputGasPrice = () => {
  return async (dispatch, getState) => {
    const { valueInputGas, gasPrice } = THIS.state
    if (valueInputGas === '' || valueInputGas === 0 || Number(valueInputGas) < Number(gasPrice.slow)) {
      THIS.setState({
        setWidthPrice: Number(gasPrice.slow).toFixed(1),
        valueInputGas: Number(gasPrice.slow).toFixed(1)
      })
    } else if (valueInputGas > Number(gasPrice.fast)) {
      THIS.setState({
        setWidthPrice: Number(gasPrice.fast).toFixed(1),
        valueInputGas: Number(gasPrice.fast).toFixed(1)
      })
    } else {
      THIS.setState({
        setWidthPrice: Number(valueInputGas),
        valueInputGas: Number(valueInputGas)
      })
    }
  }
}

export const fetchRateAndFavorite = () => {
  return async (dispatch) => {
    const { coinPair } = THIS.state
    const { arrCardData } = THIS.props
    let rateAndFavorite = await DexAPI.rateAverageAndFavorite(coinPair.first.address, coinPair.second.address, arrCardData[0].address)
    if (rateAndFavorite && rateAndFavorite.data) {
      THIS.setState({
        isMyFavorite: rateAndFavorite.data.myFavorite,
        rateAndFavorite: rateAndFavorite.data,
        totalRate: Number(rateAndFavorite.data.one_star + rateAndFavorite.data.two_star + rateAndFavorite.data.three_star + rateAndFavorite.data.four_star + rateAndFavorite.data.five_star)
      })
    }
  }
}

export const reloadTokenBalance = () => {
  return async (dispatch) => {
    THIS.setState({
      isLoadedTokenBalance: false
    }, () => THIS.props.loadingTokenbalance())
  }
}

export const handleInfiniteOnLoadMyHistory = () => {
  return async (dispatch) => {
    const { arrCardData } = THIS.props
    const { coinPair, myHistoryOffset, isLoadMoreMyHistory, hasMoreMyHistory, dexData } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (isLoadMoreMyHistory || !hasMoreMyHistory) return
    THIS.setState({
      isLoadMoreMyHistory: true
    }, async () => {
      let result = await DexAPI.getOrderMyHistory(mainAccount['address'], coinPair.first.address, coinPair.second.address, dexData.myOrderHistory.length, HISTORY_LIMIT.MY_HISTORY)
      if (result && result.myOrderHistory && result.myOrderHistory.length > 0) {
        result.myOrderHistory.map((item) => {
          item = convertOrderToBalance(coinPair.first.symbol === item.metadata.makerToken.symbol, item)
        })
        dexData.myOrderHistory = dexData.myOrderHistory.concat(result.myOrderHistory)
        THIS.setState({
          myHistoryOffset: myHistoryOffset + 1,
          hasMoreMyHistory: true,
          isLoadMoreMyHistory: false,
          dexData
        })
      } else {
        THIS.setState({
          hasMoreMyHistory: false,
          isLoadMoreMyHistory: false
        })
      }
    })
  }
}

export const handleInfiniteOnLoadBoardHistory = () => {
  return async (dispatch) => {
    const { coinPair, boardHistoryOffset, isLoadMoreBoardHistory, hasMoreBoardHistory, dexData, boardHistoryType } = THIS.state
    if (isLoadMoreBoardHistory || !hasMoreBoardHistory) return
    THIS.setState({
      isLoadMoreBoardHistory: true
    }, async () => {
      let result = await DexAPI.getOrderBoardHistory(coinPair.first.address, coinPair.second.address, boardHistoryType, dexData.boardHistory.length, HISTORY_LIMIT.BOARD_HISTORY)
      if (result && result.orderHistory && result.orderHistory.length > 0) {
        result.orderHistory.map((item) => {
          item = convertOrderToBalance(coinPair.first.symbol === item.metadata.makerToken.symbol, item)
        })
        dexData.boardHistory = dexData.boardHistory.concat(result.orderHistory)
        THIS.setState({
          boardHistoryOffset: boardHistoryOffset + HISTORY_LIMIT.BOARD_HISTORY,
          hasMoreBoardHistory: true,
          isLoadMoreBoardHistory: false,
          dexData
        })
      } else {
        THIS.setState({
          hasMoreBoardHistory: false,
          isLoadMoreBoardHistory: false
        })
      }
    })
  }
}

export const onChangeIncreaseAmount = () => {
  return (dispatch) => {
    const { amountInput } = THIS.state
    console.log('increase amount', amountInput)
    let res = increaseNumber(amountInput)
    THIS.setState({
      amountInput: res
    }, () => {
      THIS.props.onChangeAmount(res)
    })
  }
}

export const onChangeDecreaseAmount = () => {
  return (dispatch) => {
    const { amountInput } = THIS.state
    console.log('decrease amount', amountInput)
    let res = decreaseNumber(amountInput)
    THIS.setState({
      amountInput: res
    }, () => {
      THIS.props.onChangeAmount(res)
    })
  }
}

export const onChangeIncreasePrice = () => {
  return (dispatch) => {
    const { priceInput } = THIS.state
    console.log('increase price', priceInput)
    let res = increaseNumber(priceInput)
    THIS.setState({
      priceInput: res
    }, () => {
      THIS.props.onChangePrice(res)
    })
  }
}

export const onChangeDecreasePrice = () => {
  return (dispatch) => {
    const { priceInput } = THIS.state
    console.log('decrease price', priceInput)
    let res = decreaseNumber(priceInput)
    THIS.setState({
      priceInput: res
    }, () => {
      THIS.props.onChangePrice(res)
    })
  }
}

export const onChangeTab = (key) => {
  return (dispatch) => {
    THIS.setState({
      tabSelected: key
    })
  }
}

export const hoverOnRating = (num) => {
  return (dispatch) => {
    THIS.setState({
      isNumberHoverRating: num
    })
  }
}

export const hoverOffRating = () => {
  return (dispatch) => {
    THIS.setState({
      isNumberHoverRating: 0
    })
  }
}

export const getBuyAll = (orderJSON, isFillSell) => {
  return (dispatch, getState) => {
    const { coinPair } = THIS.state
    const minAmountFillInput = minWethMakeOrder / Number(orderJSON[0].price)
    let amountTakerCanPay = isFillSell ? BigNumber(coinPair.second.balance).div(orderJSON[0].price).dp(18).toString() : coinPair.first.balance
    let limitBalance = sumValueByKey(orderJSON, 'balance')
    if (Number(limitBalance) > Number(amountTakerCanPay)) {
      limitBalance = amountTakerCanPay
    }
    limitBalance = formatNumberCal(limitBalance, coinPair.first.decimals)
    THIS.setState({
      fillOrderInput: limitBalance,
      gasAmount: limitBalance,
      fillOrderTotal: Number(limitBalance) * Number(orderJSON[0].price),
      minAmountFillInput: formatNumberCal(minAmountFillInput)
    }, () => {
      THIS.forceUpdate()
    })
  }
}

const convertOrderToBalance = (isSell, order) => {
  const { arrCardData } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)
  order.isSell = isSell
  order.isMyOrder = mainAccount.address === order.signedOrder.makerAddress
  let balance = (order.statusCode === ORDER_STATUS.FILLED || order.statusCode === ORDER_STATUS.PROCESSING) ? order.txBalance : order.remainBalance
  order.balance = convertWeiToBalanceCustom(balance, isSell ? order.metadata.makerToken.decimals : order.metadata.takerToken.decimals)
  order.total = Number(order.balance) * Number(order.price)
  order.amount = isSell ? convertWeiToBalanceCustom(order.signedOrder.makerAssetAmount, order.metadata.makerToken.decimals) : convertWeiToBalance(order.signedOrder.takerAssetAmount, order.metadata.takerToken.decimals)
  order.expires = order.signedOrder.expirationTimeSeconds
  return order
}

const convertFilledOrderToBalance = (order, decimals) => {
  order.balance = convertWeiToBalance(order.txBalance, decimals)
  order.total = Number(order.balance) * Number(order.price)
  return order
}

export const fetchTokenInfo = () => {
  return async (dispatch, getState) => {
    const { coinPair } = THIS.state
    let res = await DexAPI.getToken(coinPair.first.address)
    res && res.token && THIS.setState({tokenSelectedPair: res.token})
  }
}

export const switchToHBWalletExchangeScreen = () => {
  return async (dispatch, getState) => {
    const { arrTokenData, dexTokenList, arrCurrencyData } = THIS.props
    let index = dexTokenList.findIndex(i => i.token.address.toLowerCase() === HBWALLET)
    if (index !== -1) {
      const tempCoinPair = {
        first: dexTokenList[index].token, 
        second: arrTokenData[0]
      }
      THIS.setState({
        coinPair: tempCoinPair,
        dexData: {
          orderBookSell: [],
          orderBookBuy: [],
          tradeHistory: [],
          myOrderHistory: [],
          boardHistory: []
        },
        boardHistoryType: BOARD_HISTORY_FILTER.ALL,
        priceInput: '',
        amountInput: '',
        totalActiveSell: 0,
        totalActiveBuy: 0,
        isFocused: false,
        totalInput: '',
        isWrap: true,
        strPPAmount: '',
        lastTxID: '',
        isSending: false,
        heightCalendar: 0,
        date: moment(new Date()).add(7, 'd'), // current day + a week,
        selectedDate: moment(new Date()).add(7, 'd'), // current day + a week
        hourSelect: moment(new Date()).add(7, 'd').format('HH'),
        minuteSelect: moment(new Date()).add(7, 'd').format('mm'),
        isSell: false,
        isActive: true,
        isPlacing: false,
        orderJSON: {},
        fillOrderInput: '',
        fillOrderError: false,
        fillOrderTotal: '',
        valueInputGas: 0,
        chartData: null,
        isLoadingChart: true,
        // chart period
        periodNode: 24, // each node is an hour for 24h
        periodChart: PERIOD_CHART.ONE_DAY,
        periodChartType: PERIOD_CHART.ONE_DAY,
        chartType: CHART_TYPE.CHART_LINE,
        isZoomChart: false,
        isShowMyOrder: true,
        myOrderFilter: ORDER_FILTER.OPEN,
        tabNewOrder: true,
        tabSelected: TAB_SELECTED.MY_BALANCE,
        activeOrderBoard: 0,
        rateAndFavorite: {
          one_star: 0,
          two_star: 0,
          three_star: 0,
          four_star: 0,
          five_star: 0,
          avarageRate: 0,
          myRate: null
        },
        totalRate: 0,
        lightingOrderBookSellId: '',
        lightingOrderBookBuyId: '',
        lightingMyOrder: false,
        lightingMyHistory: false,
        lightingBoardHistory: false,
        lightingTradeHistory: false,
        isLoadingOrder: true,
        isLoadingSummary: true,
        isLoadingCMC: true,
        atcResultEth: null,
        coinToEth: true,
        marketPricePair: ['ETH', arrCurrencyData],
        pricePair: ['WETH', arrCurrencyData],
        unitOfCoin: 'ETH',
        unitOfCoin2: 'WETH',
        largestAmountOrder: 0,
        setLanguage: '',
        setWidthPrice: 0,
        transactionFee: 0,
        checkarrToken: null,
        checkUnlocked: null,
        clickPopUp: null,
        gasAmount: 0,
        gasPrice: {},
        isFocusedMyAmount: false,
        isMyFavorite: false,
        isFavorite: false,
        isLoadedTokenBalance: false,
        hasMoreAllToken: true,
        hasMoreMyHistory: true,
        hasMoreBoardHistory: true,
        allTokenOffset: 0,
        myHistoryOffset: 0,
        boardHistoryOffset: 0,
        isLoadMoreAllToken: false,
        isLoadMoreMyHistory: false,
        isLoadMoreBoardHistory: false,
        isLoadingSpread: true,
        spreadValue: 0,
        isCancelingOrder: false,
        orderCanceling: '',
        isNumberHoverRating: 0,
        isLoadingLastTransaction: true,
        openPopupCancelByID: null,
        isErrorFillInput: false,
        minAmountFillInput: 0,
        getImageToken: null,
        balanceForPPLock: 0,
        balancePriceForPPLock: 0,
        balanceMakerForCheck: 0,
        tokenSelectedPair: {},
        orderFilledHistory: [],
        hbTokenBalance: 0,
        isDisabledMakeOrder: false
      }, async () => {
        await dispatch(setDexSelectedPair(dexTokenList[index]))
        THIS.props.loadInitData()
        THIS.props.fetchChart()
        THIS.props.fetchTokenInfo()
        THIS.props.fetchRateAndFavorite()
        THIS.props.fetchFavoriteTokens()
        THIS.props.fetchLastTransaction()
        THIS.props.fetchOrderedAmount()
        THIS.props.fetchDexConfig()
        THIS.props.fetchHBTokenBalance()
        THIS.props.loadingTokenUnlock()
        THIS.props.loadingTokenbalance()
        THIS.props.scrollOrderSellToBottom()
        THIS.props.getCoinInfo(dexTokenList[index].token.symbol, dexTokenList[index].token.name)
      })
    }
  }
}
