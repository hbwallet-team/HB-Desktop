
import DexAPI from 'Backend/Api/services/DexAPI'
import {
  searchMarketCoin
} from 'Backend/Redux/actionSaga/sagaActions'

var THIS

export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const fetchListCoin = () => {
  return async (dispatch, getState) => {
    const { arrCurrencyData } = THIS.props
    const { page } = THIS.state
    let result = await DexAPI.getCMC(page, arrCurrencyData)
    console.log('fetchListCoin: ', result)
    if (result && result.data && result.data.length > 0) {
      await dispatch(searchMarketCoin(result.data, ''))
      THIS.setState({
        page: page + 1,
        arrCoin: result.data,
        isLoading: false,
        isSignal1h: null,
        isSignal24h: null,
        isSignal1w: null
      })
      
    } else {
      THIS.setState({
        isLoading: false
      })
    }
  }
}

export const handleInfiniteOnLoad = () => {
  return async (dispatch, getState) => {
    const { arrCurrencyData } = THIS.props
    const { page, arrCoin, isLoadMore, hasMore } = THIS.state

    if (isLoadMore || !hasMore) {
      return
    }
    THIS.setState({ isLoadMore: true })
    THIS.forceUpdate()
    let result = await DexAPI.getCMC(page, arrCurrencyData)
    if (result && result.data && result.data.length > 0) {
      await dispatch(searchMarketCoin(arrCoin.concat(result.data), ''))
      THIS.setState({
        page: page + 1,
        arrCoin: arrCoin.concat(result.data),
        hasMore: true,
        isLoadMore: false
      })
    } else {
      THIS.setState({
        hasMore: false,
        isLoadMore: false
      })
    }
  }
}

export const onChangeSearchCoin = (txtSearch) => {
  return async (dispatch, getState) => {
    const { arrCoin } = THIS.state
    THIS.setState({ isSignal1h: null,
      isSignal1w: null,
      isSignal24h: null })
    if (txtSearch.length === 0) {
      THIS.setState({
        txtSearch,
        hasMore: true

      })
    } else {
      THIS.setState({
        txtSearch,
        hasMore: false
      })
    }
    setTimeout(() => {
      dispatch(searchMarketCoin(arrCoin, txtSearch))
    }, 700)
  }
}

/**
* @name : onSortChange1h
* @param :
* @description :
*/
export const onSortChange1h = (isSignal) => {
  return async (dispatch, getState) => {
    const { arrMarketCoin } = THIS.props
    let datas = await isSignal
      ? arrMarketCoin.sort((a, b) => (Number(a.percent_change_1h) < Number(b.percent_change_1h)) ? 1 : -1)
      : arrMarketCoin.sort((a, b) => (Number(a.percent_change_1h) > Number(b.percent_change_1h)) ? 1 : -1)
    console.log('onSortChange1h: ', arrMarketCoin, datas)

    dispatch(searchMarketCoin(
      datas, ''
    ))
    THIS.setState({
      isSignal1h: isSignal,
      isSignal1w: null,
      isSignal24h: null
    })
  }
}

/**
* @name : onSortChange24h
* @param :
* @description :
*/
export const onSortChange24h = (isSignal) => {
  return async (dispatch, getState) => {
    const { arrMarketCoin } = THIS.props
    console.log('onSortChange24h')
    let datas = await isSignal
      ? arrMarketCoin.sort((a, b) => (Number(a.percent_change_24h) < Number(b.percent_change_24h)) ? 1 : -1)
      : arrMarketCoin.sort((a, b) => (Number(a.percent_change_24h) > Number(b.percent_change_24h)) ? 1 : -1)
    dispatch(searchMarketCoin(
      datas, ''
    ))
    THIS.setState({
      isSignal1h: null,
      isSignal1w: null,
      isSignal24h: isSignal
    })
  }
}

/**
* @name : onSortChange1W
* @param :
* @description :
*/
export const onSortChange1W = (isSignal) => {
  return async (dispatch, getState) => {
    const { arrMarketCoin } = THIS.props
    console.log('onSortChange1W')
    let datas = await isSignal
      ? arrMarketCoin.sort((a, b) => (Number(a.percent_change_7d) < Number(b.percent_change_7d)) ? 1 : -1)
      : arrMarketCoin.sort((a, b) => (Number(a.percent_change_7d) > Number(b.percent_change_7d)) ? 1 : -1)
    dispatch(searchMarketCoin(datas, ''))
    THIS.setState({
      isSignal1h: null,
      isSignal1w: isSignal,
      isSignal24h: null
    })
  }
}
