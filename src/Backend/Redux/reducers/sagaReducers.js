import createReducer from '../lib/reducerConfig'
import key from '../lib/constants'
import init from '../lib/initState'

export const arrChartEtherPrice = createReducer(init.arrChartEtherPrice, {
  [key.SET_SAGA_CHART_ETHER_PRICE] (state, action) {
    return action.payload
  }
})
export const arrChartEtherPriceYear = createReducer(init.arrChartEtherPriceYear, {
  [key.SET_SAGA_CHART_ETHER_PRICE_YEAR] (state, action) {
    return action.payload
  }
})

export const arrChartTokenDetail = createReducer(init.arrChartTokenPrice, {
  [key.SET_SAGA_CHART_TOKEN_DETAIL] (state, action) {
    return action.payload
  }
})

export const arrChartTokenDetailYear = createReducer(init.arrChartTokenPriceYear, {
  [key.SET_SAGA_CHART_TOKEN_DETAIL_YEAR] (state, action) {
    return action.payload
  }
})

export const arrChartTokenAll = createReducer(init.arrChartTokenPriceAll, {
  [key.SET_SAGA_CHART_TOKEN] (state, action) {
    return action.payload
  }
})

export const arrChartTokenAllYear = createReducer(init.arrChartTokenPriceAllYear, {
  [key.SET_SAGA_CHART_TOKEN_YEAR] (state, action) {
    return action.payload
  }
})

export const arrChartTokenSingle = createReducer(init.arrChartTokenSingle, {
  [key.SET_SAGA_CHART_TOKEN_SINGLE] (state, action) {
    return action.payload
  }
})

export const arrChartTokenSingleYear = createReducer(init.arrChartTokenSingleYear, {
  [key.SET_SAGA_CHART_TOKEN_SINGLE_YEAR] (state, action) {
    return action.payload
  }
})

export const etherPrice = createReducer(init.etherPrice, {
  [key.SET_SAGA_ETHER_PRICE] (state, action) {
    return action.payload
  }
})

export const tokenDetailPrice = createReducer(init.etherPrice, {
  [key.SET_SAGA_TOKEN_DETAIL_PRICE] (state, action) {
    return action.payload
  }
})

export const arrSendingProcess = createReducer(init.arrSendProcessInit, {
  [key.SET_SAGA_SEND_PROCESS] (state, action) {
    return action.payload
  }
})

export const arrHBTokens = createReducer(init.arrHBTokens, {
  [key.SET_SAGA_HB_TOKENS] (state, action) {
    return action.payload
  }
})

export const arrRealBoostTokens = createReducer(init.arrRealBoostTokens, {
  [key.SET_SAGA_REALBOOST_TOKENS] (state, action) {
    return action.payload
  }
})

export const arrTopTokenCap = createReducer(init.arrTopTokenCap, {
  [key.SET_SAGA_TOP_TOKENS_CAP] (state, action) {
    return action.payload
  }
})

export const arrTopTokenTrade = createReducer(init.arrTopTokenTrade, {
  [key.SET_SAGA_TOP_TOKENS_TRADE] (state, action) {
    return action.payload
  }
})

export const arrMarketCoin = createReducer(init.arrMarketCoin, {
  [key.SET_SAGA_SEARCH_MARKET_COIN] (state, action) {
    return action.payload
  }
})
