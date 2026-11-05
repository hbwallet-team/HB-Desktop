import NagemonAPI from 'Backend/Api/services/NagemonAPI'
import DexAPI from 'Backend/Api/services/DexAPI'
import ReduxServices from 'Utils/globalRedux'
import { APP_ENVIROMENT, NUM_PAGE_NFT } from 'Utils/globalConstants'
import { filterMainAccount, removeDuplicateObjectByKey } from 'Utils/globalFunction'
import { setDappAssets } from 'Backend/Redux/actions/globalActions'
import { filter, includes } from 'lodash'
import { getPriceGameItem, getOwnerOfGameItem } from 'Backend/Lib/Web3/index'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    THIS.setState({
      isLoading: true
    })
    if (internetData) {
      ReduxServices.refreshDappAssests()
        .then((newDappAssets) => {
          THIS.setState({
            isLoading: false,
            numberGameItem: newDappAssets.total
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
  }
}

export const fetchGameCategories = () => {
  return async (dispatch, getState) => {
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
  } 
}

export const fetchTotalSync = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    if (internetData) {
      ReduxServices.refreshTotalSync()
    }
  }
}

export const onChangeSearchKeyword = (value) => {
  return (dispatch, getState) => {
    const { arrDappAssets } = THIS.props
    THIS.setState({
      strSearch: value
    }, () => {
      THIS.setState({
        arrSearch: value.trim() !== '' ? filterAsset(arrDappAssets) : null
      })
    })
  }
}

export const onChangeCategory = (symbol) => {
  return (dispatch, getState) => {
    const { internetData, arrDappAssets, arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      if (APP_ENVIROMENT !== 'development') {
        THIS.setState({
          isLoading: true,
          pageNum: 1,
          hasMore: true,
          isLoadMore: false,
          selectedCategory: symbol
        })
        ReduxServices.refreshDappAssests((symbol === 'all' || symbol === 'self') ? undefined : symbol, symbol === 'self' ? true : undefined)
          .then(async (newDappAssets) => {
            let numberGameItem = newDappAssets.total
            if (symbol === 'self') {
              const dappRequestPending = await DexAPI.getRequestGameItemOfSenderAll(mainAccount.address, NUM_PAGE_NFT, 0)
              if (dappRequestPending && dappRequestPending.data && dappRequestPending.data.length > 0) {
                let newDataRequest = []
                for (let i = 0; i < dappRequestPending.data.length; i++) {
                  let item = dappRequestPending.data[i].gameItem
                  const owner = await getOwnerOfGameItem(item.address, item.id, item.businessAddress, item.version)
                  if (owner.toString().toLowerCase() === mainAccount.address.toLowerCase()) {
                    newDataRequest.push(item)
                  }
                }
                let newData = newDappAssets.data ? newDappAssets.data.concat(newDataRequest) : newDataRequest
                newData = removeDuplicateObjectByKey(newData, 'id')
                dispatch(setDappAssets(newData))
                numberGameItem = newData.length
              }
            }
            THIS.setState({
              isLoading: false,
              numberGameItem
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
          arrSearch: symbol === 'all' || symbol === 'self' ? arrDappAssets : filterCategory(arrDappAssets, symbol)
        })
      }
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
    const priceGame = await getPriceGameItem(item.address, item.id, item.businessAddress, item.version)
    THIS.setState({
      isCheckSellFromOut: priceGame && Number(priceGame._Price) > 0,
      isActiveDetail: true,
      selectedItem: item
    })
  }
}

export const backToAssets = () => {
  return (dispatch, getState) => {
    const { selectedCategory } = THIS.state
    THIS.setState({
      isActiveDetail: false,
      isActiveHistory: false,
      selectedItem: null,
      selectedCategory
    })
  }
}

export const openDappAssetHistory = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isActiveHistory: true
    })
  }
}

export const handleInfiniteOnLoad = () => {
  return (dispatch, getState) => {
    const { pageNum, hasMore, isLoadMore, selectedCategory, numberGameItem } = THIS.state
    const { arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (isLoadMore || !hasMore) return
    // Handle load more
    THIS.setState({
      isLoadMore: true
    }, async () => {
      if (APP_ENVIROMENT !== 'development') {
        if (numberGameItem <= pageNum * NUM_PAGE_NFT) {
          THIS.setState({
            hasMore: false,
            isLoadMore: false
          })
        } else {
          ReduxServices.refreshDappAssests((selectedCategory === 'all' || selectedCategory === 'self') ? undefined : selectedCategory, selectedCategory === 'self' ? true : undefined, (pageNum + 1))
            .then(async (newDappAssets) => {
              const { arrDappAssets } = getState()
              let numberGameItem = newDappAssets.total
              if (selectedCategory === 'self') {
                const dappRequestPending = await DexAPI.getRequestGameItemOfSenderAll(mainAccount.address, NUM_PAGE_NFT, NUM_PAGE_NFT * (pageNum + 1))
                if (dappRequestPending && dappRequestPending.data && dappRequestPending.data.length > 0) {
                  let newDataRequest = []
                  for (let i = 0; i < dappRequestPending.data.length; i++) {
                    let item = dappRequestPending.data[i].gameItem
                    const owner = await getOwnerOfGameItem(item.address, item.id, item.businessAddress, item.version)
                    if (owner.toString().toLowerCase() === mainAccount.address.toLowerCase()) {
                      newDataRequest.push(item)
                    }
                  }
                  let newData = arrDappAssets.concat(newDataRequest)
                  newData = removeDuplicateObjectByKey(newData, 'id')
                  dispatch(setDappAssets(newData))
                  numberGameItem = newData.length
                }
              }
              THIS.setState({
                numberGameItem,
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
      }
    })
  }
}

export const refreshAfterRetrieve = (selectedItem) => {
  return (dispatch, getState) => {
    const { arrDappAssets } = THIS.props
    THIS.setState({
      isLoading: true
    }, () => {
      let newArrDappAssets = arrDappAssets.slice()
      let index = newArrDappAssets.findIndex(e => e.id === selectedItem.id && e.symbol.toLowerCase() === selectedItem.symbol.toLowerCase())
      if (index !== -1) {
        delete newArrDappAssets[index].isPending
        dispatch(setDappAssets(newArrDappAssets))
      }
      THIS.setState({
        isLoading: false
      })
    })
  }
}

export const openModalReceive = () => {
  return (dispatch, getState) => {
    THIS.refs.modalRequestReceive.show()
  }
}

export const closeModalQrCode = () => {
  return (dispatch, getState) => {
    THIS.refs.modalRequestReceive.hide()
  }
}
