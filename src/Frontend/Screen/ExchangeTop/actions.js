import OxObject from 'Backend/Lib/0x/index'
import swal from 'sweetalert2'
import { setPendingTx, setDexTokenList, setDexAnnounce, setDexTokenSummary, setDexSelectedPair, setListCoin, setUserAuth, setDexNewSummary, setScreenConfig } from 'Backend/Redux/actions/globalActions'
import { validateNumber, convertWeiToBalance, countDots, formatNumberLeftZero, showNotification, filterMainAccount, logDebugChatwork } from 'Utils/globalFunction'
import { TOKEN_STATUS } from 'Utils/globalConstants'
import ReduxServices from 'Utils/globalRedux'
import { getTokenBalance } from 'Backend/Lib/Web3/index'
import EtherGas from 'Backend/Api/services/EtherGas'
import DexAPI from 'Backend/Api/services/DexAPI'
import Settings from 'Backend/settings'
import { filter, includes } from 'lodash'
import Images from 'Assets/Image'
var THIS
const FIVE_MINUTES = 300000
const SORT_TYPE = {
  TRANSACTION: 'transaction',
  CHANGE_HIGH: 'perChangeHigh',
  CHANGE_LOW: 'perChangeLow',
  VOLUME_HIGH: 'volumeHigh'
}
export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
// make by lamtanphiho
export const openPopupTour = () => {
  return () => {
    THIS.refs.md_exs_tour.show()

  }
}
export const loadInitData = () => {
  return async (dispatch) => {
    try {
      const { internetData, arrCardData, localeData, settingUrls, userAuth } = THIS.props
      const mainAccount = filterMainAccount(arrCardData)
      if (internetData) {
        // Lock user
        if (userAuth && userAuth.isLockedDex) {
          THIS.refs.md_isLockedUser.show()
        }
        if (OxObject.getCurrentMainAddress() !== mainAccount.address) {
          OxObject.resetProviderEngine()
          OxObject.init(mainAccount)
        }
        let exchangeData = await DexAPI.getAllVolumeExchange()
        if (exchangeData && Array.isArray(exchangeData) && exchangeData.length > 0) {
          let dexTokenSummary = {
            volume24h: 0,
            totalVolume: 0,
            transaction24h: 0,
            totalTransaction: 0
          }
          for (let i = 0; i < exchangeData.length; i++) {
            let item = exchangeData[i]
            dexTokenSummary.volume24h += item.day.volume
            dexTokenSummary.totalVolume += item.all.volume
            dexTokenSummary.transaction24h += Number(item.day.noOfTx)
            dexTokenSummary.totalTransaction += Number(item.all.noOfTx)
          }
          dispatch(setDexTokenSummary(dexTokenSummary))
          exchangeData.map(e => {
            e.lastPriceBalanceGWei = e.lastPrice.price
            e.highestPrice24hBalanceGWei = e.highestPrice24h.price
            e.lowestPrice24hBalanceGWei = e.lowestPrice24h.price
            e.volume24hBalanceGWei = e.day.volume
            e.volumeBalanceGWei = e.all.volume
            e.volumeTotalBalanceGWei = e.all.volume
            e.change = e.all.change
            e.noOfTx = e.all.noOfTx
            if (e.all.priceChart.length === 1) {
              let recordTemp = {
                price: 0,
                time: new Date((Number(e.all.priceChart[0].time) - 86400)).getTime()
              }
              e.all.priceChart.unshift(recordTemp)
            }
            e.priceChart = e.all.priceChart
          })
          THIS.setState({
            isLoadingExchange: false,
            dexTokenSearch: exchangeData.sort(function (a, b) {
              return Number(b.noOfTx) - Number(a.noOfTx)
            })
          }, () => {
            dispatch(setDexTokenList(exchangeData))
            THIS.forceUpdate()
          })
        } else {
          THIS.setState({
            isLoadingExchange: false
          })
        }

        // specify help url 
        if (settingUrls && localeData) {
          switch (localeData) {
          case 'en':
            THIS.setState({helpUrl: settingUrls.helpUrlEN ? settingUrls.helpUrlEN : ''})
            break
          case 'jp':
            THIS.setState({helpUrl: settingUrls.helpUrlJP ? settingUrls.helpUrlJP : ''})
            break
          case 'cn':
            THIS.setState({helpUrl: settingUrls.helpUrlCN ? settingUrls.helpUrlCN : ''})
            break
          case 'es':
            THIS.setState({helpUrl: settingUrls.helpUrlSP ? settingUrls.helpUrlSP : ''})
            break
          case 'pt':
            THIS.setState({helpUrl: settingUrls.helpUrlPT ? settingUrls.helpUrlPT : ''})
            break
          case 'ru':
            THIS.setState({helpUrl: settingUrls.helpUrlRU ? settingUrls.helpUrlRU : ''})
            break
          case 'th':
            THIS.setState({helpUrl: settingUrls.helpUrlTH ? settingUrls.helpUrlTH : ''})
            break
          case 'vn':
            THIS.setState({helpUrl: settingUrls.helpUrlVN ? settingUrls.helpUrlVN : ''})
            break
          case 'kr':
            THIS.setState({helpUrl: settingUrls.helpUrlEN ? settingUrls.helpUrlEN : ''})
            break
          default:
            THIS.setState({helpUrl: settingUrls.helpUrlEN ? settingUrls.helpUrlEN : ''})
            break
          }
        }
      }
    } catch (err) {
      logDebugChatwork('ExchangeTop loadInitData', err)
      THIS.setState({
        isLoadingExchange: false
      })
    }
  }
}
export const fetchDexConfig = () => {
  return async (dispatch, getState) => {
    try {
      const { internetData, screenConfig } = THIS.props
      if (internetData) {
        let config = await DexAPI.getDexConfig()
        if (config && config.value) {
          screenConfig['hb_dex'] = config.value
          dispatch(setScreenConfig(screenConfig))
        }
      }
    } catch (err) {
      logDebugChatwork('fetchDexConfig', err)
    }
  }
}
export const backToTop = () => {
  return (dispatch) => {
    const { dexTokenList } = THIS.props
    THIS.setState({
      openExchangeScreen: false,
      openExchangeFavorite: false,
      HBtoFavorite: true
    }, () => {
      THIS.setState({
        dexTokenSearch: filterToken(dexTokenList)
      })
    })
  }
}
export const updateDexSummary = (data) => {
  return async (dispatch, getState) => {
    try {
      const { dexTokenList, dexTokenSummary, dexNewSummary, dexSelectedPair } = THIS.props
      const { sortPeriod } = THIS.state
      let index = dexTokenList.findIndex(i => i.token.symbol === data.token.symbol)
      if (index !== -1 && dexNewSummary !== data) {
        let temp = data
        dispatch(setDexNewSummary(temp))
        // update DEX summary
        dispatch(setDexTokenSummary({
          totalTransaction: dexTokenSummary.totalTransaction + 1,
          totalVolume: dexTokenSummary.totalVolume + data.lastPrice.volume,
          transaction24h: dexTokenSummary.transaction24h + 1,
          volume24h: dexTokenSummary.volume24h + data.lastPrice.volume
        }))

        // update DEX token list
        data.lastPriceBalanceGWei = data.lastPrice.price
        data.highestPrice24hBalanceGWei = data.highestPrice24h.price
        data.lowestPrice24hBalanceGWei = data.lowestPrice24h.price
        data.volume24hBalanceGWei = data.day.volume
        data.volumeTotalBalanceGWei = data.all.volume
        switch (sortPeriod) {
        case 'et24H':
          if (data.day !== undefined) {
            data.volumeBalanceGWei = data.day.volume
            data.change = data.day.change
            data.noOfTx = data.day.noOfTx
            if (data.day.priceChart.length === 1) {
              let recordTemp = {
                price: 0,
                time: new Date((Number(data.day.priceChart[0].time) - 3600)).getTime()
              }
              data.day.priceChart.unshift(recordTemp)
            }
            data.priceChart = data.day.priceChart
          }
          break
        case 'et1W':
          if (data.week !== undefined) {
            data.volumeBalanceGWei = data.week.volume
            data.change = data.week.change
            data.noOfTx = data.week.noOfTx
            if (data.week.priceChart.length === 1) {
              let recordTemp = {
                price: 0,
                time: new Date((Number(data.week.priceChart[0].time) - 3600)).getTime()
              }
              data.week.priceChart.unshift(recordTemp)
            }
            data.priceChart = data.week.priceChart
          }
          break
        case 'et1M':
          if (data.month !== undefined) {
            data.volumeBalanceGWei = data.month.volume
            data.change = data.month.change
            data.noOfTx = data.month.noOfTx
            if (data.month.priceChart.length === 1) {
              let recordTemp = {
                price: 0,
                time: new Date((Number(data.month.priceChart[0].time) - 10800)).getTime()
              }
              data.month.priceChart.unshift(recordTemp)
            }
            data.priceChart = data.month.priceChart
          }
          break
        case 'etALL':
          if (data.all !== undefined) {
            data.volumeBalanceGWei = data.all.volume
            data.change = data.all.change
            data.noOfTx = data.all.noOfTx
            if (data.all.priceChart.length === 1) {
              let recordTemp = {
                price: 0,
                time: new Date((Number(data.all.priceChart[0].time) - 86400)).getTime()
              }
              data.all.priceChart.unshift(recordTemp)
            }
            data.priceChart = data.all.priceChart
          }
          break
        }
        dexTokenList[index] = data
        dispatch(setDexTokenList(dexTokenList))
        if (dexSelectedPair && dexSelectedPair.token && dexSelectedPair.token.address === data.token.address) {
          dispatch(setDexSelectedPair(data))
        }
        THIS.setState({
          dexTokenSearch: filterToken(dexTokenList)
        })
        THIS.forceUpdate()
      }
    } catch (err) {
      logDebugChatwork('updateDexSummary', err)
    }
  }
}
export const updateDexSummaryEveryHour = (data) => {
  return async (dispatch, getState) => {
    try {
      if (data !== null) {
        let dexTokenSummary = {
          volume24h: 0,
          totalVolume: 0,
          transaction24h: 0,
          totalTransaction: 0
        }
        data.forEach(e => {
          dexTokenSummary.volume24h += e.day.volume
          dexTokenSummary.totalVolume += e.all.volume
          dexTokenSummary.transaction24h += Number(e.day.noOfTx)
          dexTokenSummary.totalTransaction += Number(e.all.noOfTx)
        })
        dispatch(setDexTokenSummary(dexTokenSummary))
        data.map(e => {
          e.lastPriceBalanceGWei = e.lastPrice.price
          e.highestPrice24hBalanceGWei = e.highestPrice24h.price
          e.lowestPrice24hBalanceGWei = e.lowestPrice24h.price
          e.volume24hBalanceGWei = e.day.volume
          e.volumeBalanceGWei = e.all.volume
          e.volumeTotalBalanceGWei = e.all.volume
          e.change = e.all.change
          e.noOfTx = e.all.noOfTx
          if (e.all.priceChart.length === 1) {
            let recordTemp = {
              price: 0,
              time: new Date((Number(e.all.priceChart[0].time) - 86400)).getTime()
            }
            e.all.priceChart.unshift(recordTemp)
          }
          e.priceChart = e.all.priceChart
        })
        dispatch(setDexTokenList(data))
        THIS.setState({
          dexTokenSearch: filterToken(data)
        })
      }
    } catch (err) {
      logDebugChatwork('updateDexSummaryEveryHour', err)
    }
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

export const clickOnCell = (item) => {
  return (dispatch, getState) => {
    dispatch(setDexSelectedPair(item))
    THIS.setState({
      openExchangeScreen: true
    })
  }
}
export const openOpupWrap = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isWrap: true,
      strPPAmount: '',
      clickPopUp: 'wrapOption'
    }, () => {
      THIS.refs.md_exs_wrap_amount.show()
    })
  }
}

export const openOpupUnwrap = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isWrap: false,
      strPPAmount: '',
      clickPopUp: 'wrapOption'
    }, () => {
      THIS.refs.md_exs_wrap_amount.show()
    })
  }
}

export const openPopupTokenListingRequest = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isWrap: false,
      strPPAmount: '',
      clickPopUp: 'wrapOption'
    }, () => {
      THIS.refs.md_exs_token_listing_request.show()
    })
  }
}

export const onChangePPWrapAmount = (value) => {
  return (dispatch, getState) => {
    try {
      let _value = Number(value)
      let firstIndex = value.indexOf('.')

      if (!isNaN(_value) && value.length < 18 && // must be number
        ((firstIndex === -1 && _value < 100000000) || // if integer thenn < 100000000
          (firstIndex > 0 && _value < 100000000 && value.split('.')[1].length < 9))) {
        THIS.setState({
          strPPAmount: value,
          gasAmount: value
        })
      }
    } catch (err) {
      logDebugChatwork('onChangePPWrapAmount', err)
    }
  }
}

export const handleSubmitTokenListingRequest = (values) => {
  return async (dispatch, getState) => {
    try {
      const { t } = THIS.props
      console.log('values', values)
      THIS.setState({
        isSendingTokenRequest: true
      })
      THIS.refs.md_exs_token_listing_request.hide()
      // send request for DEX server
      let newToken = {
        address: values.address,
        decimals: values.decimals,
        name: values.name,
        symbol: values.symbol,
        email: values.email,
        homePage: values.homePage,
        blog: values.blog,
        twitter: values.twitter,
        facebook: values.facebook,
        discord: values.discord,
        telegram: values.telegram,
        whitepaper: values.whitepaper,
        slack: values.slack,
        github: values.github,
        reddit: values.reddit,
        youtube: values.youtube,
        linkedin: values.linkedin,
        status: TOKEN_STATUS.PENDING
      }
      const res = await DexAPI.insertToken(newToken)
      if (res && !res.error) {
        let resM = await DexAPI.sendMail(newToken)
        if (resM && !resM.error) {
          swal({
            width: '250px',
            text: t('tklSendTokenListingRequestSuccess'),
            type: 'success',
            timer: 5000,
            showConfirmButton: false
          })
          THIS.setState({
            isSendingTokenRequest: false
          })
        } else {
          console.error('Failed to send request. Error: ', resM)
          THIS.setState({
            isSendingTokenRequest: false
          })
        }
      } else {
        swal({
          width: '250px',
          text: t('RequestFail'),
          type: 'error',
          showConfirmButton: false
        })
        THIS.setState({
          isSendingTokenRequest: false
        })
      }
    } catch (err) {
      logDebugChatwork('handleSubmitTokenListingRequest', err)
      THIS.setState({
        isSendingTokenRequest: false
      })
    }
  }
}

export const wrapAction = () => {
  return async (dispatch, getState) => {
    try {
      const { isWrap, strPPAmount } = THIS.state
      const { arrCardData, internetData, t } = THIS.props
      const mainAccount = filterMainAccount(arrCardData)
      const contractAddresses = await OxObject.getContractAddressesForNetwork()
      const etherTokenAddress = contractAddresses.etherToken
      THIS.refs.md_exs_wrap_amount.hide()

      if (!internetData) return
      if (isWrap) {
        THIS.setState({
          isSending: true
        }, async () => {
          const data = await OxObject.convertEthToWrappedEthTokenAsync(Number(strPPAmount))
          if (!data.error) {
            swal({
              width: '320px',
              text: t('ItMayTakeAFewMomentsToProcess'),
              type: 'info',
              showConfirmButton: false
            })
            DexAPI.triggerGetEtherTransactions(mainAccount.address)
            // ReduxServices.trackingTransaction(mainAccount, data, mainAccount.address, etherTokenAddress, strPPAmount)
            dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: data}))
            THIS.props.updateBalanceAfterWrap(data, Number(strPPAmount))
          } else {
            swal({
              width: '250px',
              text: t(`${data.error}`),
              type: 'error',
              showConfirmButton: false
            })
            THIS.setState({isSending: false})
          }
        })
      } else {
        THIS.setState({
          isSending: true
        }, async () => {
          const data = await OxObject.convertWrappedEthTokenToEthAsync(Number(strPPAmount))
          if (!data.error) {
            swal({
              width: '320px',
              text: t('ItMayTakeAFewMomentsToProcess'),
              type: 'info',
              showConfirmButton: false
            })
            DexAPI.triggerGetEtherTransactions(mainAccount.address)
            // ReduxServices.trackingTransaction(mainAccount, data, mainAccount.address, etherTokenAddress, strPPAmount)
            dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: data}))
            THIS.props.updateBalanceAfterWrap(data, Number(strPPAmount))
          } else {
            swal({
              width: '250px',
              text: t(`${data.error}`),
              type: 'error',
              showConfirmButton: false
            })
            THIS.setState({isSending: false})
          }
        })
      }
    } catch (err) {
      logDebugChatwork('wrapAction', err)
      THIS.setState({isSending: false})
    }
  }
}

export const updateBalanceAfterWrap = (txId, amount) => {
  return async (dispatch, getState) => {
    try {
      const { arrCardData, pendingTx, t } = THIS.props
      const { isWrap } = THIS.state
      setTimeout(() => {
        ReduxServices.clearTrackingTxs(txId)
      }, 5000)

      console.log('awaitTransactionSuccessAsync: ', txId)
      const txReceipt = await OxObject.awaitTransactionSuccessAsync(txId)
      console.log('txReceipt: ', txReceipt)
      THIS.setState({isSending: false})
      // update pending status
      pendingTx.isPending = false
      dispatch(setPendingTx(pendingTx))

      if (txReceipt && txReceipt.status === 1) { // transaction successfully
        ReduxServices.clearTrackingTxs(txId, true)
        
        // specify notice message
        let notice = ''
        if (isWrap) {
          // Get message
          notice = t('wrapETHsuccess', {number: formatNumberLeftZero(amount)})
        } else {
          // Get message
          notice = t('unwrapETHsuccess', {number: formatNumberLeftZero(amount)})
        }
        // update card balance
        ReduxServices.refreshCardBalance(arrCardData)
        await THIS.props.loadingTokenbalance()
        // show notification to notice user
        showNotification(notice, t)
        THIS.forceUpdate()
      } else { // transaction failed
        swal({
          width: '250px',
          text: t('transactionFailed'),
          type: 'error',
          showConfirmButton: false
        })
        ReduxServices.clearTrackingTxs()
      }
    } catch (err) {
      logDebugChatwork('updateBalanceAfterWrap', err)
    }
  }
}

export const fetchTokenbalance = () => {
  return (dispatch, getState) => {
    console.log('fetchTokenBalance: restart after 5 minutes')
    THIS.props.loadingTokenbalance()
    if (THIS.backgroundTimer) {
      clearInterval(THIS.backgroundTimer)
    }
    THIS.backgroundTimer = setInterval(() => THIS.props.loadingTokenbalance(), FIVE_MINUTES)
  }
}

export const loadingTokenbalance = () => {
  return async (dispatch, getState) => {
    try {
      const { arrCardData, arrHBTokens } = THIS.props
      const { wethToken } = THIS.state
      const mainAccount = filterMainAccount(arrCardData)
      const balance = await getTokenBalance(wethToken.address, mainAccount.address, wethToken.decimals)
      wethToken.balance = balance
      let wethCard = arrHBTokens.find(e => e.symbol.toUpperCase() === 'WETH')
      wethToken.cardImage = wethCard && wethCard.cardImage ? wethCard.cardImage : Images.wethCard
      THIS.setState({
        wethToken,
        isLoadingToken: false
      })
    } catch (err) {
      logDebugChatwork('loadingTokenbalance', err)
    }
  }
}

export const handleClick = (e) => {
  return (dispatch, getState) => {
    THIS.setState({
      currentKey: e.key
    })
  }
}

const filterToken = (tokens) => {
  if (!tokens) return
  const { dexFavorite } = THIS.props
  const { sortPeriod, sortType, strSearch, isMyFavoriteToken } = THIS.state
  // sort by period
  switch (sortPeriod) {
  case 'et24H':
    tokens.map((item) => {
      if (item.day !== undefined) {
        item.volumeBalanceGWei = item.day.volume
        item.change = item.day.change
        item.noOfTx = item.day.noOfTx
        if (item.day.priceChart.length === 1) {
          let recordTemp = {
            price: 0,
            time: new Date((Number(item.day.priceChart[0].time) - 3600)).getTime()
          }
          item.day.priceChart.unshift(recordTemp)
        }
        item.priceChart = item.day.priceChart
      }
    })
    break
  case 'et1W':
    tokens.map((item) => {
      if (item.week !== undefined) {
        item.volumeBalanceGWei = item.week.volume
        item.change = item.week.change
        item.noOfTx = item.week.noOfTx
        if (item.week.priceChart.length === 1) {
          let recordTemp = {
            price: 0,
            time: new Date((Number(item.week.priceChart[0].time) - 3600)).getTime()
          }
          item.week.priceChart.unshift(recordTemp)
        }
        item.priceChart = item.week.priceChart
      }
    })
    break
  case 'et1M':
    tokens.map((item) => {
      if (item.month !== undefined) {
        item.volumeBalanceGWei = item.month.volume
        item.change = item.month.change
        item.noOfTx = item.month.noOfTx
        if (item.month.priceChart.length === 1) {
          let recordTemp = {
            price: 0,
            time: new Date((Number(item.month.priceChart[0].time) - 10800)).getTime()
          }
          item.month.priceChart.unshift(recordTemp)
        }
        item.priceChart = item.month.priceChart
      }
    })
    break
  case 'etALL':
    tokens.map((item) => {
      if (item.month !== undefined) {
        item.volumeBalanceGWei = item.all.volume
        item.change = item.all.change
        item.noOfTx = item.all.noOfTx
        if (item.all.priceChart.length === 1) {
          let recordTemp = {
            price: 0,
            time: new Date((Number(item.all.priceChart[0].time) - 86400)).getTime()
          }
          item.all.priceChart.unshift(recordTemp)
        }
        item.priceChart = item.all.priceChart
      }
    })
    break
  }

  // sort by type
  switch (sortType) {
  case SORT_TYPE.TRANSACTION:
    tokens = tokens.sort(function (a, b) {
      return Number(b.noOfTx) - Number(a.noOfTx)
    })
    break
  case SORT_TYPE.CHANGE_HIGH:
    tokens = tokens.sort(function (a, b) {
      return Number(b.change) - Number(a.change)
    })
    break
  case SORT_TYPE.CHANGE_LOW:
    tokens = tokens.sort(function (a, b) {
      return Number(a.change) - Number(b.change)
    })
    break
  case SORT_TYPE.VOLUME_HIGH:
    tokens = tokens.sort(function (a, b) {
      return Number(b.volumeBalanceGWei) - Number(a.volumeBalanceGWei)
    })
    break
  }

  // search by keywords
  tokens = filter(tokens, (item) => {
    return includes(item.token.name.toLowerCase(), strSearch.toLowerCase()) || includes(item.token.address.toLowerCase(), strSearch.toLowerCase()) || includes(item.token.symbol.toLowerCase(), strSearch.toLowerCase())
  })

  // filter my favorite token
  if (isMyFavoriteToken && dexFavorite) {
    tokens = tokens.filter(i => dexFavorite.includes(i.token.symbol))
  }

  return tokens
}

export const onChangeSearchKeyword = (value) => {
  return (dispatch, getState) => {
    try {
      const { dexTokenList } = THIS.props
      THIS.setState({
        strSearch: value
      }, () => {
        THIS.setState({
          dexTokenSearch: filterToken(dexTokenList)
        })
        THIS.forceUpdate()
      })
    } catch (err) {
      logDebugChatwork('onChangeSearchKeyword', err)
    }
  }
}

export const onChangeSortPeriod = (e) => {
  return (dispatch, getState) => {
    try {
      const { dexTokenList } = THIS.props
      console.log('sort period', e)
      THIS.setState({
        sortPeriod: e.key
      }, () => {
        THIS.setState({
          dexTokenSearch: filterToken(dexTokenList)
        })
        THIS.forceUpdate()
      })
    } catch (err) {
      logDebugChatwork('onChangeSortPeriod', err)
    }
  }
}

export const onChangeSortType = (e) => {
  return (dispatch) => {
    try {
      const { dexTokenList } = THIS.props
      console.log('sort type', e)
      THIS.setState({
        sortType: e
      }, () => {
        THIS.setState({
          dexTokenSearch: filterToken(dexTokenList)
        })
        THIS.forceUpdate()
      })
    } catch (err) {
      logDebugChatwork('onChangeSortType', err)
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

export const fetchGasPrice = () => {
  return async (dispatch, getState) => {
    let gasLimit = Settings.gas.externalFeeToken
    let gas = await EtherGas.getGasPrice()
    gasLimit && gas && THIS.setState({
      gasPrice: gas,
      setWidthPrice: gas.slow,
      transactionFee: convertWeiToBalance(gas.slow * gasLimit, 9)
    })
  }
}

export const handleFilterFavoriteToken = () => {
  return (dispatch) => {
    THIS.setState({
      openExchangeFavorite: true,
      openExchangeScreen: false,
      HBtoFavorite: true
    })
  }
}

export const focusInputGasPrice = (value) => {
  return (dispatch, getState) => {
    try {
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
    } catch (err) {
      logDebugChatwork('focusInputGasPrice', err)
    }
  }
}

export const unFocusInputGasPrice = () => {
  return async (dispatch, getState) => {
    try {
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
    } catch (err) {
      logDebugChatwork('unFocusInputGasPrice', err)
    }
  }
}

export const openPopupBeforeGoToExchange = () => {
  return (dispatch, getState) => {
    const { userAuth } = THIS.props
    if (!userAuth.isConfirmDex) {
      THIS.refs.md_exs_polyci.show()
    }
  }
}

export const setUserAuthentication = () => {
  return async (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (mainAccount) {
      let userAuth = await DexAPI.updateAuth(mainAccount.address, true)
      if (userAuth && userAuth.data) {
        dispatch(setUserAuth(userAuth.data))
      }
    }
  }
}

export const toHBExchangeScreen = () => {
  return async (dispatch, getState) => {
    THIS.setState({
      toHBWallet: true
    })
  }
}
