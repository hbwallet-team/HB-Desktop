import NagemonAPI from 'Backend/Api/services/NagemonAPI'
import { setDappAssetHistory } from 'Backend/Redux/actions/globalActions'
import { filterMainAccount } from 'Utils/globalFunction'
import { NUM_ORDER_HISTORY_NFT } from 'Utils/globalConstants'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      const transactions = await NagemonAPI.getOrderHistory(mainAccount.address)
      if (transactions && transactions.data && transactions.data.length > 0) {
        THIS.setState({
          numberGameItem: transactions.total,
          isLoadingNFT: false
        })
        let txs = transactionDataMap(transactions.data)
        dispatch(setDappAssetHistory(txs))
      } else {
        THIS.setState({
          isLoadingNFT: false
        })
      }
    } else {
      THIS.setState({
        isLoadingNFT: false
      })
    }
  }
}

const transactionDataMap = (transactions) => {
  const { arrCardData } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)
  transactions.map((itm) => {
    if (itm.from.toLowerCase() === mainAccount.address.toLowerCase()) {
      itm.sent = true
    } else {
      itm.sent = false
    }
    let fromAddr = ''
    let toAddr = ''
    let receiver = ''
    let sender = ''
    arrCardData.map(cardItem => {
      if (cardItem.address.toLowerCase() === itm.from.toLowerCase()) {
        fromAddr = cardItem.address
        sender = cardItem.cardName
      }
      if (cardItem.address.toLowerCase() === itm.to.toLowerCase()) {
        toAddr = cardItem.address
        receiver = cardItem.cardName
      }
    })
    itm.fromAddr = fromAddr.length > 0 ? fromAddr : itm.from
    itm.toAddr = toAddr.length > 0 ? toAddr : itm.to
    itm.sender = sender.length > 0 ? sender : itm.from
    itm.receiver = receiver.length > 0 ? receiver : itm.to
  })
  return transactions
}

export const clickOnCellDetail = (card) => {
  return (dispatch, getState) => {
    THIS.setState({ objSelectNFT: card }, () => THIS.refs.modalNFTTransactionHistory.show())
  }
}

export const handleInfiniteOnLoad = () => {
  return (dispatch, getState) => {
    const { arrCardData, arrDappAssetHistory } = THIS.props
    const { pageNum, hasMore, isLoadMore, numberGameItem } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (isLoadMore || !hasMore) return
    // Handle load more
    THIS.setState({
      isLoadMore: true
    }, async () => {
      if (numberGameItem <= pageNum * NUM_ORDER_HISTORY_NFT) {
        THIS.setState({
          hasMore: false,
          isLoadMore: false
        })
      } else {
        NagemonAPI.getOrderHistory(mainAccount.address, (pageNum + 1), NUM_ORDER_HISTORY_NFT)
          .then((newDappAssets) => {
            let txs = transactionDataMap(newDappAssets.data)
            THIS.setState({
              numberGameItem: newDappAssets.total,
              pageNum: pageNum + 1,
              hasMore: true,
              isLoadMore: false
            })
            dispatch(setDappAssetHistory(arrDappAssetHistory.concat(txs)))
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
  }
}
