import DexAPI from 'Backend/Api/services/DexAPI'
import UnblockAPI from 'Backend/Api/services/UnblockAPI'
import { setDexFavorite, setDexTokenList, setDexNewOrder, setDexTokenFavorite } from 'Backend/Redux/actions/globalActions'
import { convertWeiToBalance, convertWeiToBalanceCustom, filterMainAccount, findIndexWithAttr, sumValueByKey, isObject, removeItemWithAttr, updateArrayWithAttr, removeDuplicateObjectByKey } from 'Utils/globalFunction'
import { ORDER_STATUS, NUM_GET_FAVORITE, WETH_ADDRESS } from 'Utils/globalConstants'

var THIS
export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const updateDimensions = () => {
  return (dispatch, getState) => {
    const { favoriteList, currentPage } = THIS.state
    let pageSize = 8
    if (window.innerWidth >= 1500) {
      pageSize = 10
    }
    if (window.innerWidth >= 1900) {
      pageSize = 12
    }
    let favList = favoriteList.slice((pageSize * currentPage - pageSize), (pageSize * currentPage))
    if (!favList || favList.length <= 0) {
      let current = parseInt(Math.round(favoriteList.length / pageSize))
      favList = favoriteList.slice((pageSize * current - pageSize), (pageSize * current))
      THIS.setState({
        currentPage: current
      })
    }
    THIS.setState({
      defaultPageSize: pageSize,
      favoriteListPerPage: favList
    })
  }
}

export const loadInitData = () => {
  return async (dispatch, getState) => {
    const { internetData, dexTokenFavorite } = THIS.props
    const { allTokenOffset, defaultPageSize } = THIS.state
    if (internetData) {
      // set favorite list
      // if (dexTokenFavorite && dexTokenFavorite.datas && dexTokenFavorite.datas.length > 0) {
      //   THIS.setState({
      //     isLoadingFavorite: false
      //   })
      // }
      if (dexTokenFavorite && dexTokenFavorite.datas && dexTokenFavorite.datas.length > 0) {
        THIS.setState({
          favoriteList: dexTokenFavorite.datas,
          favoriteListPerPage: dexTokenFavorite.datas.slice(0, defaultPageSize),
          isLoadingFavorite: false
        }, () => {
          THIS.props.updateDimensions()
        })
      }
      // get all trade information
      let result = await DexAPI.getOrderAllToken()
      if (result && result.orderHistoryAllToken && result.orderHistoryAllToken.length > 0) {
        result.orderHistoryAllToken.map((item) => {
          item = convertOrderToBalance(WETH_ADDRESS !== item.metadata.makerToken.address, item)
          if (item.statusCode !== ORDER_STATUS.FILLED) {
            item.statusCode = ORDER_STATUS.OPEN
          }
        })
        THIS.setState({
          allTokenOffset: allTokenOffset + NUM_GET_FAVORITE,
          hasMoreAllToken: true,
          isLoadMoreAllToken: false,
          tradeHistory: result.orderHistoryAllToken
        })
      }
    }
    THIS.setState({
      isLoadingOrder: false
    })
  }
}

export const fetchMostRecentNews = () => {
  return async (dispatch) => {
    const { internetData } = THIS.props
    if (internetData) {
      let mostRecentNews = await UnblockAPI.getMostRecentNews(4)
      if (mostRecentNews && mostRecentNews.length > 0) {
        THIS.setState({mostRecentNews})
      } 
    }
    THIS.setState({
      isLoadingRecentNews: false
    })
  }
}

export const setIsFavorite = (isFavorite) => {
  return async (dispatch, getState) => {
    const { arrContractAddress } = THIS.state
    THIS.setState({
      isFavorite,
      allTokenOffset: NUM_GET_FAVORITE,
      hasMoreAllToken: true,
      isLoadMoreAllToken: false
    })
    if (isFavorite === true && arrContractAddress) {
      let tradeHistoryFavorite = await DexAPI.getMyFavoriteList2(arrContractAddress.join(','), NUM_GET_FAVORITE, 0)
      if (tradeHistoryFavorite && tradeHistoryFavorite.total > 0) {
        tradeHistoryFavorite.data.map(item => {
          if (item) {
            item = convertOrderToBalance(WETH_ADDRESS === item.metadata.takerToken.address, item)
          }
        })
      }
      THIS.setState({
        tradeHistoryFavorite,
        totalFavorite: tradeHistoryFavorite.total,
        hasMoreTokenFavorite: true,
        isLoadingOrderFavorite: false,
        pageFavorite: 1
      })
    }
  }
}

export const handleInfiniteOnLoadAllToken = () => {
  return async (dispatch) => {
    const { internetData } = THIS.props
    const { allTokenOffset, isLoadMoreAllToken, hasMoreAllToken, tradeHistory } = THIS.state
    if (internetData) {
      if (isLoadMoreAllToken || !hasMoreAllToken) return
      THIS.setState({
        isLoadMoreAllToken: true
      }, async () => {
        let result = await DexAPI.getOrderAllToken(tradeHistory.length)
        if (result.orderHistoryAllToken && result.orderHistoryAllToken.length > 0) {
          result.orderHistoryAllToken.map((item) => {
            item = convertOrderToBalance(WETH_ADDRESS !== item.metadata.makerToken.address, item)
            if (item.statusCode !== ORDER_STATUS.FILLED) {
              item.statusCode = ORDER_STATUS.OPEN
            }
          })
          THIS.setState({
            allTokenOffset: allTokenOffset + NUM_GET_FAVORITE,
            hasMoreAllToken: true,
            isLoadMoreAllToken: false,
            tradeHistory: tradeHistory.concat(result.orderHistoryAllToken)
          })
        } else {
          THIS.setState({
            hasMoreAllToken: false,
            isLoadMoreAllToken: false
          })
        }
      })
    }
  }
}

export const handleInfiniteOnLoadTokenFavorite = () => {
  return async (dispatch) => {
    const { internetData } = THIS.props
    const { isLoadMoreTokenFavorite, hasMoreTokenFavorite, pageFavorite, tradeHistoryFavorite, arrContractAddress, totalFavorite } = THIS.state
    if (internetData) {
      if (isLoadMoreTokenFavorite || !hasMoreTokenFavorite) return
      if (totalFavorite < (NUM_GET_FAVORITE * pageFavorite)) {
        THIS.setState({
          hasMoreTokenFavorite: false,
          isLoadMoreTokenFavorite: false
        })
      } else {
        THIS.setState({
          isLoadMoreTokenFavorite: true
        }, async () => {
          let result = await DexAPI.getMyFavoriteList2(arrContractAddress.join(','), NUM_GET_FAVORITE, tradeHistoryFavorite.data.length)
          if (result.total > 0) {
            result.data.map((item) => {
              item = convertOrderToBalance(WETH_ADDRESS !== item.metadata.makerToken.address, item)
              if (item.statusCode !== ORDER_STATUS.FILLED) {
                item.statusCode = ORDER_STATUS.OPEN
              }
            })
            tradeHistoryFavorite.data = tradeHistoryFavorite.data.concat(result.data)
            THIS.setState({
              hasMoreTokenFavorite: true,
              isLoadMoreTokenFavorite: false,
              tradeHistoryFavorite,
              pageFavorite: pageFavorite + 1
            })
          } else {
            THIS.setState({
              hasMoreTokenFavorite: false,
              isLoadMoreTokenFavorite: false
            })
          }
        })
      }
    }
  }
}

const convertOrderToBalance = (isSell, order) => {
  const { arrCardData } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)
  if (mainAccount) {
    order.isSell = isSell
    order.isMyOrder = mainAccount.address === order.signedOrder.makerAddress
    let balance = (order.statusCode === ORDER_STATUS.FILLED || order.statusCode === ORDER_STATUS.PROCESSING) ? order.txBalance : order.remainBalance
    order.balance = convertWeiToBalanceCustom(balance, isSell ? order.metadata.makerToken.decimals : order.metadata.takerToken.decimals)
    order.total = Number(order.balance) * Number(order.price)
    order.amount = isSell ? convertWeiToBalanceCustom(order.signedOrder.makerAssetAmount, order.metadata.makerToken.decimals) : convertWeiToBalance(order.signedOrder.takerAssetAmount, order.metadata.takerToken.decimals)
    order.expires = order.signedOrder.expirationTimeSeconds
    return order
  }
}

export const getFavoriteList = () => {
  return async (dispatch) => {
    const { internetData, arrCardData, dexTokenList } = THIS.props
    const { defaultPageSize } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData && mainAccount) {
      // get exchange data
      // let exchangeData = await DexAPI.getAllVolumeExchange()
      let exchangeData = dexTokenList
      if (exchangeData && exchangeData.length > 0) {
        exchangeData.map(e => {
          e.lastPriceBalanceGWei = e.lastPrice.price
          e.highestPrice24hBalanceGWei = e.highestPrice24h.price
          e.lowestPrice24hBalanceGWei = e.lowestPrice24h.price
          e.volume24hBalanceGWei = e.day.volume
          e.volumeBalanceGWei = e.day.volume
          e.volumeTotalBalanceGWei = e.all.volume
          e.change = e.day.change
          e.noOfTx = e.day.noOfTx
        })
        dispatch(setDexTokenList(exchangeData))

        // get list of token which token was added favorite
        let allFavoriteTokens = []
        if (arrCardData && arrCardData.length > 0) {
          let favoriteTokens = await DexAPI.getFavoriteTokens(arrCardData[0].address)
          if (favoriteTokens && favoriteTokens.data) {
            allFavoriteTokens = favoriteTokens.data
          }
        }
        if (allFavoriteTokens) {
          dispatch(setDexFavorite(allFavoriteTokens))

          // get list of contract address which token was added favorite
          let myFavoriteToken = []
          let contractAddress = []
          allFavoriteTokens.map((item) => {
            let match = exchangeData.find(i => i.token.address.toUpperCase() === item.from.toUpperCase())
            if (match) {
              myFavoriteToken.push(match)
              contractAddress.push(match.token.address)
            }
          })
          THIS.setState({
            arrContractAddress: contractAddress
          })

          // get current order book for each token
          let orderBook = await DexAPI.getMyFavoriteList(contractAddress.join(','))
          if (orderBook && orderBook.result && orderBook.result.length > 0) {
            myFavoriteToken.map((item) => {
              let match = orderBook.result.filter(i => i.token && item.token && item.token.address.includes(i.token.address))
              if (match && match[0]) {
                let orderBookSell = []
                match[0].orderBookSell.map((item) => {
                  item = convertOrderToBalance(WETH_ADDRESS === item.metadata.takerToken.address, item)
                  if (orderBookSell[item.priceInWei]) {
                    orderBookSell[item.priceInWei].push(item)
                  } else {
                    orderBookSell[item.priceInWei] = [item]
                  }
                })
                orderBookSell = Object.values(orderBookSell)

                let orderBookBuy = []
                match[0].orderBookBuy.map((item) => {
                  item = convertOrderToBalance(WETH_ADDRESS === item.metadata.takerToken.address, item)
                  if (orderBookBuy[item.priceInWei]) {
                    orderBookBuy[item.priceInWei].push(item)
                  } else {
                    orderBookBuy[item.priceInWei] = [item]
                  }
                })
                orderBookBuy = Object.values(orderBookBuy)

                item.orderBookSell = orderBookSell
                item.orderBookBuy = orderBookBuy
                item.spread = updateSpread(orderBookSell, orderBookBuy)
                item.largestAmountOrder = updateVolumeBar(orderBookSell, orderBookBuy)
              }
            })
          }
          dispatch(setDexTokenFavorite({
            isLoading: false,
            datas: myFavoriteToken
          }))
          THIS.setState({
            favoriteList: myFavoriteToken,
            favoriteListPerPage: myFavoriteToken.slice(0, defaultPageSize)
          }, () => {
            THIS.props.updateDimensions()
          })
        }
      }
      THIS.setState({
        isLoadingFavorite: false
      })
    } else {
      THIS.setState({
        isLoadingFavorite: false
      })
    }
  }
}

const updateSpread = (orderBookSell, orderBookBuy) => {
  let spread = 0
  if (orderBookBuy[0] && orderBookSell[0]) {
    let res = Number(orderBookSell[0][0].price) - Number(orderBookBuy[0][0].price)
    if (res > 0) {
      spread = res
    }
  } 
  return spread
}

const updateVolumeBar = (orderBookSell, orderBookBuy) => {
  let largestAmountSell = Math.max.apply(Math, orderBookSell.map(function (o) { return sumValueByKey(o, 'balance') }))
  let largestAmountBuy = Math.max.apply(Math, orderBookBuy.map(function (o) { return sumValueByKey(o, 'balance') }))
  return largestAmountSell > largestAmountBuy ? largestAmountSell : largestAmountBuy
}

export const onChangePage = (page) => {
  return (dispatch, getState) => {
    const { favoriteList, defaultPageSize } = THIS.state
    if (favoriteList) {
      THIS.setState({
        currentPage: page,
        favoriteListPerPage: favoriteList.slice((defaultPageSize * page - defaultPageSize), (defaultPageSize * page))
      })
    }
  }
}

// export const clickOnCell = (item) => {
//   return (dispatch, getState) => {
//     dispatch(setDexSelectedPair(item))
//     console.log('setDexSelectedPair123: ', item)
//     // THIS.setState({
//     //   openExchangeScreen: true
//     // })
//   }
// }

export const favoriteEdit = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isLoadedEdit: true
    })
  }
}

export const backToFavorite = () => {
  return (dispatch) => {
    THIS.setState({
      isLoadedEdit: false,
      isLoadingOrder: true,
      isLoadingFavorite: true,
      isLoadingRecentNews: true
    }, () => {
      THIS.props.loadInitData()
      THIS.props.getFavoriteList()
      THIS.props.fetchMostRecentNews()
    })
  }
}

export const backFromFavoriteEdit = () => {
  return (dispatch) => {
    const { dexTokenFavorite } = THIS.props
    const { defaultPageSize } = THIS.state
    THIS.setState({
      isLoadedEdit: false,
      favoriteList: dexTokenFavorite.datas,
      favoriteListPerPage: dexTokenFavorite.datas.slice(0, defaultPageSize),
      isLoadingFavorite: false
    }, () => {
      THIS.props.updateDimensions()
    })
  }
}

export const getPriceUSD = (num) => {
  return (dispatch) => {
    if (num === 0) {
      THIS.setState({
        isActiveUSD: false
      })
    }
    if (num === 1) {
      THIS.setState({
        isActiveUSD: true
      })
    }
  }
}

export const updateNewDexOrderFavorite = (object) => {
  return (dispatch) => {
    const { dexNewOrder } = THIS.props
    const { favoriteList, currentPage, defaultPageSize, tradeHistory, tradeHistoryFavorite } = THIS.state
    if (dexNewOrder !== object) {
      dispatch(setDexNewOrder(object))
      let arrOrder = object.orderList
      const status = object.statusCode
      let lightingTradeHistory = false
      let lightingOrderBookFilling = false
      let lightingOrderBookSellId = ''
      let lightingOrderBookBuyId = ''

      // remove lighting
      THIS.setState({
        lightingTradeHistory,
        lightingOrderBookFilling,
        lightingOrderBookSellId,
        lightingOrderBookBuyId
      })

      if (arrOrder && arrOrder.length > 0) {
        arrOrder.map(item => {
          if (item && isObject(item)) {
            item = convertOrderToBalance(WETH_ADDRESS === item.metadata.takerToken.address, item)
          }
        })
        let tempOrder = arrOrder[0] || arrOrder[1]
        let index = favoriteList.findIndex(i => i.token.address === tempOrder.metadata.makerToken.address || i.token.address === tempOrder.metadata.takerToken.address)
        if (index !== -1) {
          switch (status) {
          case ORDER_STATUS.OPEN:
            if (arrOrder[0].metadata.takerToken.address === WETH_ADDRESS) { // sell
              // import the order to order book sell
              let indexOrder = findIndexWithAttr(favoriteList[index].orderBookSell, 'priceInWei', arrOrder[0].price)
              if (indexOrder !== -1) {
                favoriteList[index].orderBookSell[indexOrder].push(arrOrder[0])
              } else {
                favoriteList[index].orderBookSell.push([arrOrder[0]])
              }
              // sort orders as descending
              favoriteList[index].orderBookSell = favoriteList[index].orderBookSell.sort(function (a, b) {
                return (a[0]['price'] < b[0]['price']) ? -1 : 1
              })
              // make flash light
              lightingOrderBookSellId = arrOrder[0]._id
            } else { // buy
              // import the order to order book buy
              let indexOrder = findIndexWithAttr(favoriteList[index].orderBookBuy, 'priceInWei', arrOrder[0].price)
              if (indexOrder !== -1) {
                favoriteList[index].orderBookBuy[indexOrder].push(arrOrder[0])
              } else {
                favoriteList[index].orderBookBuy.push([arrOrder[0]])
              }
              // sort orders as ascending
              favoriteList[index].orderBookBuy = favoriteList[index].orderBookBuy.sort(function (a, b) {
                return (a[0]['price'] > b[0]['price']) ? -1 : 1
              })
              // make flash light
              lightingOrderBookBuyId = arrOrder[0]._id
            }
            // calculation spread value
            favoriteList[index].spread = updateSpread(favoriteList[index].orderBookSell, favoriteList[index].orderBookBuy)
            // calculation volume bar
            favoriteList[index].largestAmountOrder = updateVolumeBar(favoriteList[index].orderBookSell, favoriteList[index].orderBookBuy)
            // import order to trade history
            tradeHistory.unshift(arrOrder[0])
            // make flash light
            lightingTradeHistory = true
            break
          case ORDER_STATUS.PROCESSING:
            if (arrOrder[0].metadata.takerToken.address === WETH_ADDRESS) { // sell
              // update remain balance in order book
              favoriteList[index].orderBookSell = updateArrayWithAttr(favoriteList[index].orderBookSell, '_id', arrOrder[0]._id, arrOrder[0])
              // make flash light
              lightingOrderBookSellId = arrOrder[0]._id
              lightingOrderBookFilling = true
            } else { // buy
              // update remain balance in order book
              favoriteList[index].orderBookBuy = updateArrayWithAttr(favoriteList[index].orderBookBuy, '_id', arrOrder[0]._id, arrOrder[0])
              // make flash light
              lightingOrderBookBuyId = arrOrder[0]._id
              lightingOrderBookFilling = true
            }
            // calculation spread value
            favoriteList[index].spread = updateSpread(favoriteList[index].orderBookSell, favoriteList[index].orderBookBuy)
            // calculation volume bar
            favoriteList[index].largestAmountOrder = updateVolumeBar(favoriteList[index].orderBookSell, favoriteList[index].orderBookBuy)
            break
          case ORDER_STATUS.FILLED:
            // import order to trade history
            if (tradeHistory.findIndex(e => e._id === arrOrder[1]._id) === -1) {
              arrOrder[1].addressFiller && tradeHistory.unshift(arrOrder[1])
            }
            // make flash light
            lightingTradeHistory = true
            lightingOrderBookFilling = true
            break
          case ORDER_STATUS.CANCEL:
          case ORDER_STATUS.EXPIRED:
            if (arrOrder[0].metadata.takerToken.address === WETH_ADDRESS) {
              // remove order from order book sell
              favoriteList[index].orderBookSell = removeItemWithAttr(favoriteList[index].orderBookSell, '_id', arrOrder[0]._id)
            } else {
              // remove order from order book buy
              favoriteList[index].orderBookBuy = removeItemWithAttr(favoriteList[index].orderBookBuy, '_id', arrOrder[0]._id)
            }
            break
          }
          THIS.setState({
            lightingTradeHistory,
            lightingOrderBookFilling,
            lightingOrderBookSellId,
            lightingOrderBookBuyId,
            tradeHistory,
            tradeHistoryFavorite,
            favoriteList: favoriteList,
            favoriteListPerPage: favoriteList.slice((defaultPageSize * currentPage - defaultPageSize), (defaultPageSize * currentPage))
          })
        }
      }
    }
  }
}

export const updateDexSummaryFavorite = (data) => {
  return async (dispatch, getState) => {
    const { favoriteList, currentPage, defaultPageSize } = THIS.state
    let index = favoriteList.findIndex(i => i.token.symbol === data.token.symbol)
    if (index !== -1) {
      // update DEX token list
      favoriteList[index].lastPriceBalanceGWei = data.lastPrice.price
      favoriteList[index].highestPrice24hBalanceGWei = data.highestPrice24h.price
      favoriteList[index].lowestPrice24hBalanceGWei = data.lowestPrice24h.price
      favoriteList[index].volume24hBalanceGWei = data.day.volume
      favoriteList[index].volumeTotalBalanceGWei = data.all.volume
      favoriteList[index].volumeBalanceGWei = data.day.volume
      favoriteList[index].change = data.day.change
      favoriteList[index].noOfTx = data.day.noOfTx
      favoriteList[index].day = data.day
      THIS.setState({
        favoriteList: favoriteList,
        favoriteListPerPage: favoriteList.slice((defaultPageSize * currentPage - defaultPageSize), (defaultPageSize * currentPage))
      })
    }
  }
}

export const triggerSwitchedAccount = (event, data) => {
  return (dispatch, getState) => {
    THIS.props.loadInitData()
    THIS.props.getFavoriteList()
  }
}
