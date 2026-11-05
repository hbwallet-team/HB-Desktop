import DexAPI from 'Backend/Api/services/DexAPI'
import { convertWeiToBalance, filterMainAccount, removeDuplicateObjectByKey } from 'Utils/globalFunction'
import { ORDER_STATUS } from 'Utils/globalConstants'
import { setDexFavorite, setDexTokenFavorite } from 'Backend/Redux/actions/globalActions'

var THIS
const HISTORY_LIMIT = {
  ALL_TOKEN: 30,
  MY_HISTORY: 23,
  BOARD_HISTORY: 23
}
let contractAddress = []
let tokenAddress = []

export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadInitData = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    if (internetData) {
      THIS.setState({
        isLoadingOrder: false
      })
      THIS.props.onLoadEditFavorite()
    }
  }
}

export const setIsFavorite = (isFavorite) => {
  return (dispatch, getState) => {
    THIS.setState({isFavorite})
  }
}

export const onLoadEditFavorite1 = () => {
  return (dispatch, getState) => {
    const { dexFavorite, dexTokenList } = THIS.props
    if (dexFavorite) {
      let allFavoriteList = dexTokenList.filter(i => dexFavorite.includes(i.token.symbol))
      THIS.setState({
        favoriteListPerPage: allFavoriteList
      })
    }
  }
}

export const onLoadEditFavorite = () => {
  return async (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const { defaultPageSize } = THIS.state
    let allFavoriteTokens = []
    if (arrCardData && arrCardData.length > 0) {
      let exchangeData = await DexAPI.getAllVolumeExchange()
      let favoriteTokens = await DexAPI.getFavoriteTokens(arrCardData[0].address)
      if (favoriteTokens && favoriteTokens.data) {
        allFavoriteTokens = favoriteTokens.data
      }
      let myFavoriteToken = []
      let myEditFavorite = []
      contractAddress = []
      tokenAddress = []
      if (allFavoriteTokens) {
        allFavoriteTokens.map((item) => {
          let myFavoriteItem = {}
          let match = exchangeData.filter(i => i.token.address.includes(item.from))
          if (match && match[0]) {
            myFavoriteToken.push(match[0])
            myFavoriteItem.id = item.index
            myFavoriteItem.text = match[0].token.name
            myFavoriteItem.tokenAddress = item.from
            myFavoriteItem.wethAddress = item.to
            myFavoriteItem.contractAddress = item._id
            myEditFavorite.push(myFavoriteItem)
            contractAddress.push(item._id)
            tokenAddress.push(item.from)
          }
        })
        THIS.setState({
          editFavoriteList: myEditFavorite,
          countPage: Math.ceil(Number(myEditFavorite.length / defaultPageSize)),
          loadingEditFavoriteList: false
        }, () => {
          THIS.forceUpdate()
        })
      }
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

export const handleChangeFavorite = (makerToken, takerToken) => {
  return async (dispatch, getState) => {
    const { arrCardData, dexTokenFavorite } = THIS.props
    let res = await DexAPI.setFavorite(makerToken, takerToken, 'false', arrCardData[0].address)
    if (res) {
      THIS.props.fetchFavoriteTokens()
      let tempTokenFavorite = dexTokenFavorite.datas.filter(e => e.token.address.toLowerCase() !== makerToken.toLowerCase())
      dispatch(setDexTokenFavorite({
        isLoading: false,
        datas: tempTokenFavorite
      }))
    }
    THIS.props.loadInitData()
  }
}

export const setChangeEditFavorite = (dropResult, item) => {
  return async (dispatch, getState) => {
    const { defaultPageSize } = THIS.state
    const { arrCardData, dexTokenFavorite } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (dropResult && item) {
      let indexSplice = 0
      if (dropResult.listId !== item.listId) {
        if (dropResult.listId > item.listId && item.index === (defaultPageSize - 1)) {
          contractAddress = contractAddress.filter(i => i !== item.card.contractAddress)
          tokenAddress = tokenAddress.filter(i => i !== item.card.tokenAddress)
          indexSplice = Number((Number(dropResult.listId) - 1) * defaultPageSize)
          contractAddress.splice(indexSplice, 0, item.card.contractAddress)
          tokenAddress.splice(indexSplice, 0, item.card.tokenAddress)
        } else {
          contractAddress = contractAddress.filter(i => i !== item.card.contractAddress)
          tokenAddress = tokenAddress.filter(i => i !== item.card.tokenAddress)
          indexSplice = Number((Number(dropResult.listId) - 1) * defaultPageSize)
          contractAddress.splice(indexSplice, 0, item.card.contractAddress)
          tokenAddress.splice(indexSplice, 0, item.card.tokenAddress)
        }
      } else {
        let indexItem = Number((Number(item.listId) - 1) * defaultPageSize) - 1 + Number(item.index)
        contractAddress = contractAddress.filter(i => i !== item.card.contractAddress)
        tokenAddress = tokenAddress.filter(i => i !== item.card.tokenAddress)
        indexSplice = indexItem + 1
        contractAddress.splice(indexSplice, 0, item.card.contractAddress)
        tokenAddress.splice(indexSplice, 0, item.card.tokenAddress)
      }
      let result
      let afterEdit = []
      tokenAddress.map((item) => {
        let findFavorite = dexTokenFavorite.datas.filter(e => e.token.address.toLowerCase() === item.toLowerCase())
        if (findFavorite) {
          afterEdit.push(findFavorite[0])
        }
      })
      dispatch(setDexTokenFavorite({
        isLoading: false,
        datas: afterEdit
      }))
      if (contractAddress) {
        result = await DexAPI.postFavoriteTokens(contractAddress.join(','), mainAccount.address)
      }
      if (result && result.data) {
        THIS.props.loadInitData()
      }
    }
  }
}

export const triggerSwitchedAccount = (event, data) => {
  return (dispatch, getState) => {
    THIS.props.loadInitData()
  }
}
