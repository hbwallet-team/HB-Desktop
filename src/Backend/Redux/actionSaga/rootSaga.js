import { takeLatest } from 'redux-saga/effects'
import key from '../lib/constants'
import {
  fetchChartEtherPrice, fetchEtherPrice, fetchSendProcess,
  fetchChartTokenAll, fetchTokenDetailPrice, fetchChartTokenDetail,
  fetchHBTokens, fetchRealBoostTokens, fetchTopTokensCap, fetchTopTokensTrade, fetchChartTokenSingle,
  fetchSearchMarketCoin
} from './sagaFetchActions'

export default function * rootSaga () {
  yield takeLatest(key.GET_CHART_ETHER_PRICE, fetchChartEtherPrice)
  yield takeLatest(key.GET_CHART_ETHER_PRICE_YEAR, fetchChartEtherPrice)
  yield takeLatest(key.GET_TOKEN_DETAIL_PRICE, fetchTokenDetailPrice)
  yield takeLatest(key.GET_CHART_TOKEN, fetchChartTokenAll)
  yield takeLatest(key.GET_CHART_TOKEN_YEAR, fetchChartTokenAll)
  yield takeLatest(key.GET_CHART_TOKEN_SINGLE, fetchChartTokenSingle)
  yield takeLatest(key.GET_CHART_TOKEN_SINGLE_YEAR, fetchChartTokenSingle)
  yield takeLatest(key.GET_CHART_TOKEN_DETAIL, fetchChartTokenDetail)
  yield takeLatest(key.GET_CHART_TOKEN_DETAIL_YEAR, fetchChartTokenDetail)
  yield takeLatest(key.GET_ETHER_PRICE, fetchEtherPrice)
  yield takeLatest(key.GET_SEND_PROCESS, fetchSendProcess)
  yield takeLatest(key.GET_HB_TOKENS, fetchHBTokens)
  yield takeLatest(key.GET_REALBOOST_TOKENS, fetchRealBoostTokens)
  yield takeLatest(key.GET_TOP_TOKENS_CAP, fetchTopTokensCap)
  yield takeLatest(key.GET_TOP_TOKENS_TRADE, fetchTopTokensTrade)
  yield takeLatest(key.SEARCH_MARKET_COIN, fetchSearchMarketCoin)
}
