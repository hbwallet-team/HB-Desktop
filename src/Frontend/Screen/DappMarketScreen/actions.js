import NagemonAPI from 'Backend/Api/services/NagemonAPI'
import DexAPI from 'Backend/Api/services/DexAPI'
import ReduxServices from 'Utils/globalRedux'
import { setDappMarket } from 'Backend/Redux/actions/globalActions'
import { getPriceGameItem, getOwnerOfGameItem } from 'Backend/Lib/Web3/index'
import { filter, includes } from 'lodash'
import { NUM_PAGE_NFT } from 'Utils/globalConstants'
import { logDebugChatwork } from 'Utils/globalFunction'
import swal from 'sweetalert2'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return (dispatch, getState) => {
    try {
      const { internetData } = THIS.props
      const { strSearch, selectedCategory, selectedSort, pageNum } = THIS.state
      THIS.setState({
        isLoading: true
      })
      if (internetData) {
        dispatch(setDappMarket([]))
        ReduxServices.refreshDappMarket(strSearch, selectedCategory === 'all' ? undefined : selectedCategory, pageNum, selectedSort !== 'new' ? 'price' : undefined, selectedSort === 'low' ? 'asc' : 'desc')
          .then((newDappMarket) => {
            THIS.setState({
              isLoading: false,
              numberGameItem: newDappMarket.totalFilter
            })
          })
          .catch((err) => {
            console.log(err)
            THIS.setState({
              isLoading: false
            })
          })
      } else {
        THIS.setState({
          isLoading: false
        })
      }
    } catch (err) {
      THIS.setState({
        isLoading: false
      })
      logDebugChatwork('DappMarketScreen loadingInitial', err)
    }
  } 
}

export const fetchGameCategories = () => {
  return async (dispatch, getState) => {
    try {
      const { internetData } = THIS.props
      const { arrCategories } = THIS.state
      if (internetData) {
        let categories = await NagemonAPI.getGameCategories()
        if (categories && categories.length > 0) {
          THIS.setState({ 
            arrCategories: arrCategories.concat(categories) 
          })
        }
      }
    } catch (err) {
      logDebugChatwork('fetchGameCategories', err)
    }
  } 
}

export const onChangeSearchKeyword = (value) => {
  return (dispatch, getState) => {
    try {
      const { strSearch, selectedCategory, selectedSort } = THIS.state
      THIS.setState({
        strSearch: value
      })
      if (value === '') {
        THIS.setState({
          pageNum: 1,
          hasMore: true,
          isLoadMore: false
        }, () => {
          ReduxServices.refreshDappMarket(strSearch, selectedCategory === 'all' ? undefined : selectedCategory, 1, selectedSort !== 'new' ? 'price' : undefined, selectedSort === 'low' ? 'asc' : 'desc')
            .then((newDappMarket) => {
              THIS.setState({
                isLoading: false,
                numberGameItem: newDappMarket.totalFilter
              })
            })
            .catch((err) => {
              console.log(err)
              THIS.setState({
                isLoading: false
              })
            })
        })
      }
    } catch (err) {
      THIS.setState({
        isLoading: false
      })
      logDebugChatwork('onChangeSearchKeyword', err)
    }
  }
}

export const onKeyPressSearchKeyword = (key) => {
  return (dispatch, getState) => {
    try {
      if (key === 'Enter') {
        const { strSearch, selectedCategory, selectedSort } = THIS.state
        THIS.setState({
          pageNum: 1,
          hasMore: true,
          isLoadMore: false
        }, () => {
          ReduxServices.refreshDappMarket(strSearch, selectedCategory === 'all' ? undefined : selectedCategory, 1, selectedSort !== 'new' ? 'price' : undefined, selectedSort === 'low' ? 'asc' : 'desc')
            .then((newDappMarket) => {
              THIS.setState({
                isLoading: false,
                numberGameItem: newDappMarket.totalFilter
              })
            })
            .catch((err) => {
              console.log(err)
              THIS.setState({
                isLoading: false
              })
            })
        })
      }
    } catch (err) {
      THIS.setState({
        isLoading: false
      })
      logDebugChatwork('onKeyPressSearchKeyword', err)
    }
  }
}

export const onChangeCategory = (value) => {
  return (dispatch, getState) => {
    try {
      THIS.setState({
        selectedCategory: value,
        pageNum: 1,
        hasMore: true,
        isLoadMore: false
      }, () => {
        THIS.props.loadingInitial()
      })
    } catch (err) {
      logDebugChatwork('onChangeCategory', err)
    }
  }
}

export const onChangeSort = (value) => {
  return (dispatch, getState) => {
    try {
      THIS.setState({
        selectedSort: value,
        pageNum: 1,
        hasMore: true,
        isLoadMore: false
      }, () => {
        THIS.props.loadingInitial()
      })
    } catch (err) {
      logDebugChatwork('onChangeSort', err)
    }
  }
}

const filterAsset = (listAsset) => {
  if (!listAsset) return null
  const { strSearch } = THIS.state
  // search by keywords
  const assets = filter(listAsset, (item) => {
    return includes(item.name.toLowerCase(), strSearch.toLowerCase())
  })
  return assets
}

const filterCategory = (listAsset, category) => {
  if (!listAsset) return null
  // search by category
  const assets = listAsset.filter(i => i.symbol.toLowerCase() === category.toLowerCase())
  return assets
}

export const onClickAsset = (item) => {
  return async (dispatch, getState) => {
    try {
      const { arrDappMarket } = THIS.props
      const { numberGameItem } = THIS.state
      const priceGame = await getPriceGameItem(item.address, item.id, item.businessAddress, item.version)
      // const owner = await getOwnerOfGameItem(item.address, item.id, item.businessAddress)
      // if (priceGame && priceGame[0] && priceGame[0].toLowerCase() === owner.toString().toLowerCase() && priceGame[1] && priceGame[1] > 0) {
      if (priceGame && Number(priceGame._Price) > 0) {
        THIS.setState({
          isActiveDetail: true,
          selectedItem: item
        })
      } else {
        DexAPI.deleteSaleGameItem(item.symbol, item.id)
        swal({
          width: '250px',
          text: THIS.props.t('Dapps.noLonger'),
          type: 'error',
          showConfirmButton: false
        })
        // remove asset from market
        let tempDappMarket = arrDappMarket.filter(e => e.id !== item.id)
        dispatch(setDappMarket(tempDappMarket))
        THIS.setState({
          numberGameItem: numberGameItem - 1
        })
      }
    } catch (err) {
      logDebugChatwork('onClickAsset', err)
    }
  }
}

export const backToMarket = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isActiveDetail: false,
      selectedItem: null
    })
  }
}

export const handleInfiniteOnLoad = () => {
  return (dispatch, getState) => {
    try {
      const { pageNum, hasMore, isLoadMore, selectedCategory, numberGameItem, selectedSort, strSearch } = THIS.state
      if (isLoadMore || !hasMore) return
      // Handle load more
      THIS.setState({
        isLoadMore: true
      }, async () => {
        if (numberGameItem <= pageNum * NUM_PAGE_NFT) {
          THIS.setState({
            hasMore: false,
            isLoadMore: false
          })
        } else {
          ReduxServices.refreshDappMarket(strSearch, selectedCategory === 'all' ? undefined : selectedCategory, (pageNum + 1), selectedSort !== 'new' ? 'price' : undefined, selectedSort === 'low' ? 'asc' : 'desc')
            .then((newDappMarket) => {
              THIS.setState({
                numberGameItem: newDappMarket.totalFilter,
                pageNum: pageNum + 1,
                hasMore: true,
                isLoadMore: false
              })
            })
            .catch((err) => {
              console.log(err)
              THIS.setState({
                hasMore: false,
                isLoadMore: false
              })
            })
        }
      })
    } catch (err) {
      logDebugChatwork('DappMarketScreen handleInfiniteOnLoad', err)
    }
  }
}
