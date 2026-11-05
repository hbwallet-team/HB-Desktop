import key from '../lib/constants'
import { checkStore } from '../lib/reducerConfig'
import { KEYSTORE } from '../../../Utils/globalConstants'

// Total balance action saga
export function getTotalBalance () {
  return {
    type: key.GET_TOTAL_BALANCE
  }
}

export function setSagaTotalBalance (totalBalance) {
  return {
    type: key.SET_SAGA_TOTAL_BALANCE,
    payload: totalBalance
  }
}

// Chart ether price
export function getChartEtherPrice () {
  return {
    type: key.GET_CHART_ETHER_PRICE

  }
}
export function getChartEtherPriceYear () {
  const isYear = true
  return {
    type: key.GET_CHART_ETHER_PRICE_YEAR,
    isYear
  }
}

export function setSagaChartEtherPrice (arrChartEtherPrice) {
  checkStore(arrChartEtherPrice, KEYSTORE.CHART_ETHER_PRICE)
  return {
    type: key.SET_SAGA_CHART_ETHER_PRICE,
    payload: arrChartEtherPrice
  }
}

export function setSagaChartEtherPriceYear (arrChartEtherPriceYear) {
  checkStore(arrChartEtherPriceYear, KEYSTORE.CHART_ETHER_PRICE_YEAR)
  return {
    type: key.SET_SAGA_CHART_ETHER_PRICE_YEAR,
    payload: arrChartEtherPriceYear
  }
}

// Chart token price detail
export function getChartTokenDetail (token) {
  return {
    type: key.GET_CHART_TOKEN_DETAIL,
    token
  }
}

export function getChartTokenDetailYear (token) {
  const isYear = true
  return {
    type: key.GET_CHART_TOKEN_DETAIL_YEAR,
    token,
    isYear
  }
}

export function setSagaChartTokenDetail (arrChartTokenDetail) {
  return {
    type: key.SET_SAGA_CHART_TOKEN_DETAIL,
    payload: arrChartTokenDetail
  }
}

export function setSagaChartTokenDetailYear (arrChartTokenDetailYear) {
  return {
    type: key.SET_SAGA_CHART_TOKEN_DETAIL_YEAR,
    payload: arrChartTokenDetailYear
  }
}

// Get ether price in USD
export function getEtherPrice (fiatMoney) {
  return {
    type: key.GET_ETHER_PRICE,
    fiatMoney
  }
}

export function setSagaEtherPrice (etherPrice) {
  checkStore(etherPrice, KEYSTORE.ETHER_PRICE)
  return {
    type: key.SET_SAGA_ETHER_PRICE,
    payload: etherPrice
  }
}

// Get ether price in USD
export function getTokenDetailPrice (cryptoCurrence, fiatMoney) {
  return {
    type: key.GET_TOKEN_DETAIL_PRICE,
    cryptoCurrence,
    fiatMoney
  }
}

export function setSagaTokenDetailPrice (tokenDetailPrice) {
  return {
    type: key.SET_SAGA_TOKEN_DETAIL_PRICE,
    payload: tokenDetailPrice
  }
}

// Get chart token
export function getChartToken (arrTokenToChart) {
  return {
    type: key.GET_CHART_TOKEN,
    arrTokenToChart
  }
}

export function getChartTokenYear (arrTokenToChart) {
  const isYear = true
  return {
    type: key.GET_CHART_TOKEN_YEAR,
    arrTokenToChart,
    isYear
  }
}

export function setSagaChartToken (arrChartTokenAll) {
  checkStore(arrChartTokenAll, KEYSTORE.CHART_TOKEN_ALL)
  return {
    type: key.SET_SAGA_CHART_TOKEN,
    payload: arrChartTokenAll
  }
}

export function setSagaChartTokenYear (arrChartTokenAllYear) {
  checkStore(arrChartTokenAllYear, KEYSTORE.CHART_TOKEN_ALL_YEAR)
  return {
    type: key.SET_SAGA_CHART_TOKEN_YEAR,
    payload: arrChartTokenAllYear
  }
}

export function getChartTokenSingle (token) {
  return {
    type: key.GET_CHART_TOKEN_SINGLE,
    token
  }
}

export function getChartTokenSingleYear (token) {
  const isYear = true
  return {
    type: key.GET_CHART_TOKEN_SINGLE_YEAR,
    token,
    isYear
  }
}

export function setSagaChartTokenSingle (arrChartTokenSingle) {
  return {
    type: key.SET_SAGA_CHART_TOKEN_SINGLE,
    payload: arrChartTokenSingle
  }
}

export function setSagaChartTokenSingleYear (arrChartTokenSingleYear) {
  return {
    type: key.SET_SAGA_CHART_TOKEN_SINGLE_YEAR,
    payload: arrChartTokenSingleYear
  }
}

export function getSendingProcess (address, isRemove) {
  return {
    type: key.GET_SEND_PROCESS,
    address,
    isRemove
  }
}

export function setSagaSendingProcess (arrSendingProcess) {
  return {
    type: key.SET_SAGA_SEND_PROCESS,
    payload: arrSendingProcess
  }
}

export function getHBTokens () {
  return {
    type: key.GET_HB_TOKENS
  }
}

export function setSagaHBTokens (arrHBTokens) {
  checkStore(arrHBTokens, KEYSTORE.HB_TOKENS)
  return {
    type: key.SET_SAGA_HB_TOKENS,
    payload: arrHBTokens
  }
}

export function getRealBoostTokens () {
  return {
    type: key.GET_REALBOOST_TOKENS
  }
}

export function setSagaRealBoostTokens (arrRealBoostTokens) {
  checkStore(arrRealBoostTokens, KEYSTORE.REALBOOST_TOKENS)
  return {
    type: key.SET_SAGA_REALBOOST_TOKENS,
    payload: arrRealBoostTokens
  }
}

export function getTopTokenCap () {
  return {
    type: key.GET_TOP_TOKENS_CAP
  }
}

export function setSagaTopTokenCap (arrTopTokenCap) {
  return {
    type: key.SET_SAGA_TOP_TOKENS_CAP,
    payload: arrTopTokenCap
  }
}

export function getTopTokenTrade () {
  return {
    type: key.GET_TOP_TOKENS_TRADE
  }
}

export function setSagaTopTokenTrade (arrTopTokenTrade) {
  return {
    type: key.SET_SAGA_TOP_TOKENS_TRADE,
    payload: arrTopTokenTrade
  }
}

export function searchMarketCoin (arrCoin, strSearch) {
  return {
    type: key.SEARCH_MARKET_COIN,
    arrCoin,
    strSearch
  }
}

export function setSagaSearchMarketCoin (arrMarketCoin) {
  return {
    type: key.SET_SAGA_SEARCH_MARKET_COIN,
    payload: arrMarketCoin
  }
}
