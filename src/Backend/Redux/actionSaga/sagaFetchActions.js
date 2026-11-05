import { call, select, put } from 'redux-saga/effects'
import EtherScan from '../../Api/services/EtherScan'
import init from '../lib/initState'
import { convertWeiToBalance } from '../../../Utils/globalFunction'
import * as sagaAction from './sagaActions'
import CryptoCompare from '../../Api/services/CryptoCompare'
import CoinMarketCap from '../../Api/services/CoinMarketCap'
import TokenScan from 'Backend/Api/services/TokenScan'
import Ethplorer from 'Backend/Api/services/Ethplorer'
import FiatMoneyConvert from 'Backend/HBLibrary/FiatMoneyConvert'
import DexAPI from 'Backend/Api/services/DexAPI'
import Image from 'Assets/Image'
import { HBCRYPTO } from 'Utils/globalConstants'

export const getMultipleEthBalance = (arrEthAddress) => fetch(EtherScan.getMultipleEthBalanceSaga(arrEthAddress))

export const fetchTotalBalance = function * () {
  // console.log('fetchTotalBalance:... ')
  // internetAvailable().then(function () {
  //   console.log('Internet available')
  // }).catch(function () {
  //   console.log('No internet')
  // })
  try {
    // let internetData = yield select(state => state.internetData)
    let cardData = yield select(state => state.cardData)
    let arrStrCardAddress = []
    cardData.map(e => e.address !== '' && arrStrCardAddress.push(e.address))

    // // Show loading Total Balance
    // if (internetData) {
    //   yield put(sagaAction.setSagaTotalBalance(init.totalBalanceLoadingInit))
    // }
    // internetAvailable().then(function () {
    //   yield put(sagaAction.setSagaTotalBalance(init.totalBalanceLoadingInit))
    // })
    const response = yield call(getMultipleEthBalance, arrStrCardAddress)
    const result = yield response.json()
    console.log('fetchTotalBalance: ', result)
    if (result.error) {
      yield put(sagaAction.setSagaTotalBalance(init.totalBalanceInit))
    } else {
      // let currencyData = yield select(state => state.currencyData)

      let arrCryptoBalance = result.result.map((item) => convertWeiToBalance(item.balance))

      let sumTotalCryptoBalance = arrCryptoBalance.reduce((pre, cur) => pre + cur, 0)

      // let arrTotalEthBalance = getDecimalNumber(formatNumber(sumTotalCryptoBalance))[0]

      // let totalFiatBalance = yield FiatMoneyConvert.convertCrytoToMoney(HBCRYPTO.ETHEREUM, currencyData, sumTotalCryptoBalance)
      // let arrTotalFiatBalance = getDecimalNumber(formatNumber(totalFiatBalance, true))[0]

      yield put(sagaAction.setSagaTotalBalance({
        isLoadingTotalBalance: false,
        firstCrypto: sumTotalCryptoBalance,
        decimalCrypto: 0,
        firstFiat: 0,
        decimalFiat: 0
      }))
    }
  } catch (error) {
    console.log(error)
    yield put(sagaAction.setSagaTotalBalance(init.arrTotalBalanceInit))
  }
}

/**
 * Fetch chart ether price
 */
export const fetchChartEtherPrice = function * (action) {
  const isYear = action.isYear
  try {
    let arrCharEtherPriceOld = yield select(state => state.arrChartEtherPrice)
    if (arrCharEtherPriceOld.isFirstLoad && !isYear) {
      yield put(sagaAction.setSagaChartEtherPrice({
        isLoading: true,
        isFirstLoad: false,
        datas: []
      }))
    }
    // Call func fetch data
    const response = yield call(CryptoCompare.fetchChartPrice, 'ETH', isYear)
    if (response) {
      const result = yield response.json()
      console.log('fetchChartEtherPrice isYear: ', isYear, result)
      let chartData = []
      for (let i = 0; i < result.Data.length; i++) {
        chartData.push(result.Data[i])
      }
      if (isYear) {
        yield put(sagaAction.setSagaChartEtherPriceYear({
          isLoading: false,
          datas: chartData
        }))
      } else {
        yield put(sagaAction.setSagaChartEtherPrice({
          isLoading: false,
          datas: chartData
        }))
      }
    } else {
      if (isYear) {
        yield put(sagaAction.setSagaChartEtherPriceYear({
          isLoading: false,
          datas: []
        }))
      } else {
        yield put(sagaAction.setSagaChartEtherPrice({
          isLoading: false,
          datas: []
        }))
      }
    }
  } catch (error) {
    console.log(error)
    if (isYear) {
      yield put(sagaAction.setSagaChartEtherPriceYear({
        isLoading: false,
        datas: []
      }))
    } else {
      yield put(sagaAction.setSagaChartEtherPrice({
        isLoading: false,
        datas: []
      }))
    }
  }
}

/**
 * Fetch chart ether price
 */
export const fetchChartTokenDetail = function * (action) {
  let token = action.token
  let isYear = action.isYear
  let etherPrice = yield select(state => state.etherPrice)
  try {
    if (!isYear) {
      yield put(sagaAction.setSagaChartTokenDetail({
        isLoading: true,
        isFirstLoad: false,
        datas: []
      }))
    }

    if (token.tokenId.toString().trim().length <= 0) {
      const response = yield call(DexAPI.getTokenDataWithChart, token.address)
      if (response && response.data) {
        // fetch ether price
        let etherPriceUsd = etherPrice.price_usd
        response.data.all.priceChart.map(i => {
          i.price = etherPriceUsd > 0 ? i.price * etherPriceUsd : i.price
        })
        response.data.day.priceChart.map(i => {
          i.price = etherPriceUsd > 0 ? i.price * etherPriceUsd : i.price
        })
        response.data.week.priceChart.map(i => {
          i.price = etherPriceUsd > 0 ? i.price * etherPriceUsd : i.price
        })
        response.data.month.priceChart.map(i => {
          i.price = etherPriceUsd > 0 ? i.price * etherPriceUsd : i.price
        })
        let chartData = {
          all: response.data.all.priceChart,
          day: response.data.day.priceChart,
          week: response.data.week.priceChart,
          month: response.data.month.priceChart
        }
        if (isYear) {
          yield put(sagaAction.setSagaChartTokenDetailYear({
            isLoading: false,
            datas: chartData
          }))
        } else {
          yield put(sagaAction.setSagaChartTokenDetail({
            isLoading: false,
            datas: chartData
          }))
        }
      } else {
        if (isYear) {
          yield put(sagaAction.setSagaChartTokenDetailYear({
            isLoading: false,
            datas: []
          }))
        } else {
          yield put(sagaAction.setSagaChartTokenDetail({
            isLoading: false,
            datas: []
          }))
        }
      }
      return
    }
    // Call func fetch data
    let sym = token.symbol
    if (sym.toUpperCase() === 'WETH') {
      sym = 'ETH'
    }
    if (sym.toUpperCase() === 'BST') {
      sym = ''
    }
    const response = yield call(CryptoCompare.fetchChartPrice, sym, isYear)
    if (response) {
      const result = yield response.json()

      let chartData = []
      // Get 24 record (24 dot in chart)
      for (let i = 0; i < result.Data.length; i++) {
        chartData.push(result.Data[i])
      }
      if (isYear) {
        yield put(sagaAction.setSagaChartTokenDetailYear({
          isLoading: false,
          datas: chartData
        }))
      } else {
        yield put(sagaAction.setSagaChartTokenDetail({
          isLoading: false,
          datas: chartData
        }))
      }
    } else {
      if (isYear) {
        yield put(sagaAction.setSagaChartTokenDetailYear({
          isLoading: false,
          datas: []
        }))
      } else {
        yield put(sagaAction.setSagaChartTokenDetail({
          isLoading: false,
          datas: []
        }))
      }
    }
  } catch (error) {
    console.log(error)
    if (isYear) {
      yield put(sagaAction.setSagaChartTokenDetailYear({
        isLoading: false,
        datas: []
      }))
    } else {
      yield put(sagaAction.setSagaChartTokenDetail({
        isLoading: false,
        datas: []
      }))
    }
  }
}

/**
 * Fetch ether price
 */
export const fetchEtherPrice = function * (action) {
  const fiatMoney = action.fiatMoney
  let etherPriceOld = yield select(state => state.etherPrice)
  try {
    // Check if first load -> show loading animation (only first time),
    // isFirstLoad -> false to disable animation
    if (etherPriceOld.isFirstLoad) {
      yield put(sagaAction.setSagaEtherPrice({
        isLoading: true,
        isFirstLoad: false
        // price: 0,
        // percent_change_24h: 0,
        // price_usd: 0
      }))
    }
    // Call func fetch data
    // const response = yield call(CoinMarketCap.getExchangeRateFromCryptoToFiatMoney, 'ethereum', fiatMoney)
    let result = yield call(DexAPI.getCoinInfo, HBCRYPTO.ETHEREUM, fiatMoney)
    if (result && !result.error) {
      yield put(sagaAction.setSagaEtherPrice({
        isLoading: false,
        // price: result[0]['price_' + fiatMoney.toLowerCase()],
        // percent_change_24h: result[0].percent_change_24h,
        // price_usd: result[0].price_usd
        price: result.priceCurrency,
        price_usd: result.data.price_usd,
        percent_change_24h: result.data.percent_change_24h
      }))
    } else {
      yield put(sagaAction.setSagaEtherPrice({
        isLoading: false,
        price: etherPriceOld.price,
        percent_change_24h: etherPriceOld.percent_change_24h,
        price_usd: etherPriceOld.price_usd
      }))
    }
  } catch (error) {
    console.log(error)
    yield put(sagaAction.setSagaEtherPrice({
      isLoading: false,
      price: etherPriceOld.price,
      percent_change_24h: etherPriceOld.percent_change_24h,
      price_usd: etherPriceOld.price_usd
    }))
  }
}

/**
 * Fetch token detail price
 */
export const fetchTokenDetailPrice = function * (action) {
  const cryptoCurrence = action.cryptoCurrence
  const fiatMoney = action.fiatMoney

  try {
    // Call func fetch data
    const response = yield call(FiatMoneyConvert.convertTokenToMoneyV2, cryptoCurrence, fiatMoney)
    if (response && response.data && response.data.quotes[fiatMoney]) {
      yield put(sagaAction.setSagaTokenDetailPrice({
        isLoading: false,
        price: response.data.quotes[fiatMoney].price,
        percent_change_24h: response.data.quotes[fiatMoney].percent_change_24h
      }))
    } else {
      yield put(sagaAction.setSagaTokenDetailPrice({
        isLoading: false,
        price: 0,
        percent_change_24h: 0
      }))
    }
  } catch (error) {
    console.log(error)
    yield put(sagaAction.setSagaTokenDetailPrice({
      isLoading: false,
      price: 0,
      percent_change_24h: 0
    }))
  }
}

/**
 * Fetch chart token
 */
export const fetchChartTokenAll = function * (action) {
  let arrTokenToChart = action.arrTokenToChart
  const isYear = action.isYear
  try {
    if (arrTokenToChart.length > 0) {
      let initData = []
      let iExistTK = 0
      const maxRecord = isYear ? 365 : 720
      for (let j = 0; j < maxRecord; j++) {
        initData.push({close: 0})
      }
      // if (!isYear) {
      //   yield put(sagaAction.setSagaChartToken({
      //     isLoading: true,
      //     isFirstLoad: false,
      //     datas: []
      //   }))
      // }

      for (let i = 0; i < arrTokenToChart.length; i++) {
        let sym = arrTokenToChart[i].symbol.toUpperCase()
        if (sym.toUpperCase() === 'WETH') {
          sym = 'ETH'
        }
        if (arrTokenToChart[i].tokenId.toString().trim().length <= 0) { // get chart data from HB DEX
          const response = yield call(DexAPI.getTokenDataWithChart, arrTokenToChart[i].address)
          if (response) {
            if (response && response.data) {
              const etherPrice = yield select(state => state.etherPrice)
              let datas = response.data.week.priceChart.reverse()
              if (isYear) {
                datas = response.data.all.priceChart.reverse()
              }
              iExistTK++
              for (let j = 0; j < maxRecord; j++) {
                let price = datas[j] && datas[j].price ? datas[j].price : 0
                let balance = arrTokenToChart[i].balance
                initData[j].close += Math.abs(price) * balance * etherPrice.price
              }
            }
          }
        } else { // get chart data from CryptoCompare
          const response = yield call(CryptoCompare.fetchChartPrice, sym, isYear)
          if (response) {
            const result = yield response.json()
            if (result && result.Response !== 'Error' && result.Data.length > 0) {
              let datas = result.Data.reverse()
              iExistTK++
              for (let j = 0; j < maxRecord; j++) {
                let close = datas[j] && datas[j].close ? datas[j].close : 0
                let balance = arrTokenToChart[i].balance
                initData[j].close += close * balance
              }
              // if (i === 0) { // Time
              for (let j = 0; j < maxRecord; j++) {
                initData[j].time = datas[j] && datas[j].time ? datas[j].time : 0
              }
              // }
            }
          }
        }
      }
      if (iExistTK) {
        if (isYear) {
          yield put(sagaAction.setSagaChartTokenYear({
            isLoading: false,
            datas: initData.reverse()
          }))
        } else {
          yield put(sagaAction.setSagaChartToken({
            isLoading: false,
            datas: initData.reverse()
          }))
        }
      } else {
        if (isYear) {
          yield put(sagaAction.setSagaChartTokenYear({
            isLoading: false,
            datas: []
          }))
        } else {
          yield put(sagaAction.setSagaChartToken({
            isLoading: false,
            datas: []
          }))
        }
      }
    } else {
      if (isYear) {
        yield put(sagaAction.setSagaChartTokenYear({
          isLoading: false,
          datas: []
        }))
      } else {
        yield put(sagaAction.setSagaChartToken({
          isLoading: false,
          datas: []
        }))
      }
    }
  } catch (error) {
    console.log(error)
    if (isYear) {
      yield put(sagaAction.setSagaChartTokenYear({
        isLoading: false,
        datas: []
      }))
    } else {
      yield put(sagaAction.setSagaChartToken({
        isLoading: false,
        datas: []
      }))
    }
  }
}

/**
 * Fetch chart token
 */
export const fetchChartTokenSingle = function * (action) {
  let token = action.token
  const isYear = action.isYear
  const maxRecord = isYear ? 365 : 720
  try {
    if (!isYear) {
      yield put(sagaAction.setSagaChartTokenSingle({
        isLoading: true,
        datas: []
      }))
    }

    let initData = []
    let iExistTK = 0
    for (let j = 0; j < maxRecord; j++) {
      initData.push({close: 0})
    }

    if (token.tokenId.toString().trim().length <= 0) { // get chart data from HB DEX
      const response = yield call(DexAPI.getTokenDataWithChart, token.address)
      if (response) {
        if (response && response.data) {
          const etherPrice = yield select(state => state.etherPrice)
          let datas = response.data.week.priceChart.reverse()
          if (isYear) {
            datas = response.data.all.priceChart.reverse()
          }
          iExistTK++
          for (let j = 0; j < maxRecord; j++) {
            let price = datas[j] && datas[j].price ? datas[j].price : 0
            let balance = token.balance
            initData[j].close += Math.abs(price) * balance * etherPrice.price
            initData[j].time = datas[j] && datas[j].time ? datas[j].time : 0
          }
        }
      }
    } else { // prevent token don't have token id
      let sym = token.symbol
      if (sym.toUpperCase() === 'WETH') {
        sym = 'ETH'
      }
      const response = yield call(CryptoCompare.fetchChartPrice, sym, isYear)
      if (response) {
        const result = yield response.json()
        if (result.Response !== 'Error' && result.Data.length > 0) {
          let datas = result.Data.reverse()
          iExistTK++
          for (let j = 0; j < maxRecord; j++) {
            let close = datas[j] && datas[j].close ? datas[j].close : 0
            let balance = token.balance
            initData[j].close = close * balance
            initData[j].time = datas[j] && datas[j].time ? datas[j].time : 0
          }
        }
      }
    }

    if (iExistTK) {
      if (isYear) {
        yield put(sagaAction.setSagaChartTokenSingleYear({
          isLoading: false,
          datas: initData.reverse()
        }))
      } else {
        yield put(sagaAction.setSagaChartTokenSingle({
          isLoading: false,
          datas: initData.reverse()
        }))
      }
    } else {
      if (isYear) {
        yield put(sagaAction.setSagaChartTokenSingleYear({
          isLoading: false,
          datas: initData
        }))
      } else {
        yield put(sagaAction.setSagaChartTokenSingle({
          isLoading: false,
          datas: initData
        }))
      }
    }
  } catch (error) {
    console.log(error)
    if (isYear) {
      yield put(sagaAction.setSagaChartTokenSingleYear({
        isLoading: false,
        datas: []
      }))
    } else {
      yield put(sagaAction.setSagaChartTokenSingle({
        isLoading: false,
        datas: []
      }))
    }
  }
}

export const fetchSendProcess = function * (action) {
  let arrSendingProcess = yield select(state => state.arrSendingProcess)
  if (action.isRemove) {
    console.log('fetchSendProcess Remove: ', action.address)
    let arrTemp = arrSendingProcess.filter(address => address !== action.address) // remove address
    yield put(sagaAction.setSagaSendingProcess(arrTemp))
  } else {
    console.log('fetchSendProcess: ', action.address)
    yield put(sagaAction.setSagaSendingProcess(arrSendingProcess.concat(action.address)))
  }
}

export const fetchHBTokens = function * (action) {
  const response = yield call(DexAPI.getAllTokenDB)
  let array = []

  if (response && response.data && response.data.length > 0) {
    response.data.forEach(function (element) {
      array.push({
        id: element.id,
        name: element.token_name,
        tokenAddress: element.contract_address,
        cardImage: element.card_file_path,
        iconImage: element.icon_file_path,
        symbol: element.symbol,
        url: element.url,
        decimals: element.decimal,
        display_flag: element.display_flag
      })
    }, this)
  }
  yield put(sagaAction.setSagaHBTokens(array))
}

export const fetchRealBoostTokens = function * (action) {
  const response = yield call(DexAPI.getRealBoostTokenDB)
  let array = []
  if (response && Array.isArray(response) && response.length && response.length > 0) {
    response.forEach(function (element) {
      array.push({
        name: element.name,
        tokenAddress: element.address,
        symbol: element.symbol
      })
    }, this)
  }
  yield put(sagaAction.setSagaRealBoostTokens(array))
}

export const fetchTopTokensCap = function * (action) {
  console.log('fetchTopTokens: ')
  yield put(sagaAction.setSagaTopTokenCap({
    isLoading: true,
    datas: []
  }))
  const criteria = 'cap'
  const response = yield call(Ethplorer.getTopTokenSaga, criteria)
  console.log('fetchTopTokensCap datas: ', response)
  if (response) {
    const result = yield response.json()
    if (result && result.tokens && result.tokens.length > 0) {
      yield put(sagaAction.setSagaTopTokenCap({
        isLoading: false,
        datas: result.tokens
      }))
    } else {
      yield put(sagaAction.setSagaTopTokenCap({
        isLoading: false,
        datas: []
      }))
    }
  }
}
export const fetchTopTokensTrade = function * (action) {
  console.log('fetchTopTokens: ')
  yield put(sagaAction.setSagaTopTokenTrade({
    isLoading: true,
    datas: []
  }))
  const criteria = 'trade'
  const response = yield call(Ethplorer.getTopTokenSaga, criteria)
  console.log('fetchTopTokensTrade datas: ', response)
  if (response) {
    const result = yield response.json()
    if (result && result.tokens && result.tokens.length > 0) {
      yield put(sagaAction.setSagaTopTokenTrade({
        isLoading: false,
        datas: result.tokens
      }))
      console.log('fetchTopTokensTrade result.tokens: ', result)
    } else {
      yield put(sagaAction.setSagaTopTokenTrade({
        isLoading: false,
        datas: []
      }))
    }
  }
}
export const fetchSearchMarketCoin = function * (action) {
  const strSearch = action.strSearch
  const arrCoin = action.arrCoin

  if (strSearch.length === 0) {
    yield put(sagaAction.setSagaSearchMarketCoin(
      arrCoin
    ))
  } else {
    let arrTemp = yield arrCoin.filter(coin => (coin.name.toLowerCase().includes(strSearch.toLowerCase()) || coin.symbol.toLowerCase().includes(strSearch.toLowerCase())))
    yield put(sagaAction.setSagaSearchMarketCoin(
      arrTemp
    ))
  }
}
