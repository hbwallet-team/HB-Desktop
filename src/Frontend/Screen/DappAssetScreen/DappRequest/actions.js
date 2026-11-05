import OxObject from 'Backend/Lib/0x/index'
import DexAPI from 'Backend/Api/services/DexAPI'
import ReduxServices from 'Utils/globalRedux'
import Observer from 'Utils/HBObserver'
import { setDappRequest, setPendingTx } from 'Backend/Redux/actions/globalActions'
import { filterMainAccount, roundingNumber, convertWeiToBalance, saveTransactionEther } from 'Utils/globalFunction'
import { REQUEST_STATUS, OBSERVER_KEY, NUM_REQUEST_NFT, arrCryptoCurrency } from 'Utils/globalConstants'
import { getETHBalance, getTokenBalance, getPriceGameItem, buyGameItem } from 'Backend/Lib/Web3/index'
import swal from 'sweetalert2'
import moment from 'moment'
const bufferSend = 0.0008

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    if (internetData) {
      ReduxServices.refreshDappRequest()
        .then((res) => {
          THIS.setState({
            isLoadingMyRequests: false,
            numberGameItem: res.total
          })
        })
        .catch((err) => {
          console.log(err)
          THIS.setState({
            isLoadingMyRequests: false
          })
        })
    } else {
      THIS.setState({
        isLoadingMyRequests: false
      })
    }
  }
}

export const fetchTrueUSDPrice = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCurrencyData } = THIS.props
    if (internetData) {
      let tusdPrice = await DexAPI.getCoinInfo('TUSD', arrCurrencyData, 2563, 'TrueUSD')
      if (tusdPrice && !tusdPrice.error) {
        THIS.fRate['TUSD'] = tusdPrice.priceCurrency
      }
    }
  }
}

export const fetchDaiUSDPrice = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCurrencyData } = THIS.props
    if (internetData) {
      let daiPrice = await DexAPI.getCoinInfo('DAI', arrCurrencyData, 2308, 'Dai')
      if (daiPrice && !daiPrice.error) {
        THIS.fRate['DAI'] = daiPrice.priceCurrency
      }
    }
  }
}

export const handleAcceptRequest = (item) => {
  return (dispatch, getState) => {
    console.log('handleAcceptRequest', item)
    THIS.setState({
      selectedItem: item
    }, () => {
      THIS.refs.md_accept_request.show()
    })
  }
}

export const onCloseAcceptRequestModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_accept_request.hide()
  }
}

export const onAcceptRequest = () => {
  return (dispatch, getState) => {
    const { arrDappRequest, arrCardData, t } = THIS.props
    const { selectedItem, isExecuting } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    THIS.refs.md_accept_request.hide()
    if (isExecuting) {
      return
    }
    THIS.setState({
      isExecuting: true
    }, async () => {
      const priceGame = await getPriceGameItem(selectedItem.gameItem.address, selectedItem.gameItem.id, selectedItem.gameItem.businessAddress, selectedItem.gameItem.version)
      if (priceGame && Number(priceGame._Price) > 0) {
        let balance
        const ethBalance = await getETHBalance(mainAccount.address)
        const selectedCoin = arrCryptoCurrency.find(e => e.value.includes(priceGame._crypto))
        const priceETH = convertWeiToBalance(priceGame._Price)
        if (priceGame._crypto.includes('ETH')) {
          balance = ethBalance
        } else {
          balance = await getTokenBalance(selectedCoin.address, mainAccount.address, selectedCoin.decimals)
        }
        if ((balance - (priceGame._crypto.includes('ETH') ? bufferSend : 0) - roundingNumber(priceETH)) >= 0 && (ethBalance - bufferSend) >= 0) {
          buyGameItem(mainAccount.privateKey, selectedItem.gameItem.businessAddress, selectedItem.gameItem.address, selectedItem.gameItem.id, selectedItem.gameItem.version, selectedCoin)
            .then(async (result) => {
              THIS.setState({ isExecuting: false })
              // update request status
              let newDappRequest = arrDappRequest.slice()
              let requestFind = newDappRequest.find(item => item._id === selectedItem._id)
              requestFind.amount = priceETH
              // requestFind.fiatAmount = priceETH * THIS.etherPrice.price
              requestFind.crypto = priceGame._crypto
              requestFind.isAccepted = true
              DexAPI.updateRequestGameItem(selectedItem._id, priceETH, priceGame._crypto, true)

              // add new request
              const newRequest = {
                hash: result.txID,
                type: 'pay',
                status: REQUEST_STATUS.PENDING,
                amount: priceETH,
                // fiatAmount: priceETH * THIS.etherPrice.price,
                crypto: priceGame._crypto,
                from: selectedItem.from,
                to: selectedItem.to,
                address: selectedItem.address,
                businessAddress: selectedItem.businessAddress,
                symbol: selectedItem.symbol,
                game: selectedItem.game,
                icon: selectedItem.icon,
                id: selectedItem.id,
                image: selectedItem.image,
                name: selectedItem.name,
                gameItem: selectedItem.gameItem
              }
              const res = await DexAPI.postRequestGameItem(newRequest)
              if (res && res._id) {
                newRequest._id = res._id
              }
              newDappRequest.unshift(newRequest)
              dispatch(setDappRequest(newDappRequest))
              
              DexAPI.postGameTxsHistory(result.txID, selectedItem.gameItem.id.toString(), selectedItem.gameItem.symbol, selectedItem.from, mainAccount.address, priceETH)
              DexAPI.deleteSaleGameItem(selectedItem.gameItem.symbol, selectedItem.gameItem.id)
              ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, selectedItem.gameItem.address.toLowerCase(), priceETH, result.rawTransaction, null, 'buying', selectedItem.gameItem)
              dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: result.txID}))
              THIS.props.updateDataAfterAcceptRequest(result.txID, newRequest)
            })
            .catch((err) => {
              console.log('buyGameItem failed', err)
              THIS.setState({ isExecuting: false })
              swal({
                width: '250px',
                text: t('gasFeeIsNotEnough2'),
                type: 'error',
                showConfirmButton: false
              })
            })
        } else {
          THIS.setState({ isExecuting: false })
          swal({
            width: '250px',
            text: t('Dapps.sendErrFunds'),
            type: 'error',
            showConfirmButton: false
          })
        }
      } else {
        THIS.setState({ isExecuting: false })
        swal({
          width: '250px',
          text: t('Dapps.sendInvalid'),
          type: 'error',
          showConfirmButton: false
        })
        // update request status
        let newDappRequest = arrDappRequest.slice()
        let index = newDappRequest.findIndex(item => item._id === selectedItem._id)
        if (index !== -1) {
          newDappRequest[index].status = REQUEST_STATUS.FAILED
          dispatch(setDappRequest(newDappRequest))
          DexAPI.updateRequestGameItem(newDappRequest[index]._id, null, null, null, REQUEST_STATUS.FAILED)
        }
      }
    })
  }
}

export const updateDataAfterAcceptRequest = (txID, gameRequest) => {
  return async (dispatch, getState) => {
    const { pendingTx } = THIS.props
    console.log('awaitTransactionMinedAsync: ', txID)
    // update status of tracking transanction to pending
    setTimeout(() => {
      ReduxServices.clearTrackingTxs(txID)
    }, 5000)

    // waiting transaction in ethereum network
    const txReceipt = await OxObject.awaitTransactionMinedAsync(txID)
    console.log('txReceipt: ', txReceipt, txReceipt.logs)
    // update pending status
    pendingTx.isPending = false
    dispatch(setPendingTx(pendingTx))

    if (txReceipt && txReceipt.status === 1) { // transaction successfully

      // refresh dapp assets
      ReduxServices.refreshDappAssests()
      ReduxServices.refreshTotalSync()

      // update dapp request
      gameRequest.status = REQUEST_STATUS.COMPLETED
      THIS.props.updateNewDexGameEvent(gameRequest)
      DexAPI.updateRequestGameItem(gameRequest._id, null, null, null, REQUEST_STATUS.COMPLETED)

      const { arrCardData } = getState()

      // update transaction history
      await ReduxServices.refreshEtherTxsHistory(pendingTx.account)

      // update transaction history for all account
      await ReduxServices.refreshEtherTxsHistoryAll(arrCardData.filter(card => card.isEnable), false)

      // refresh history
      Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY_ALL)
      Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY)

      // update card balance
      ReduxServices.refreshCardBalance(arrCardData)
    } else { // transaction failed
      ReduxServices.clearTrackingTxs()

      // update dapp request
      gameRequest.status = REQUEST_STATUS.FAILED
      THIS.props.updateNewDexGameEvent(gameRequest)
      DexAPI.updateRequestGameItem(gameRequest._id, null, null, null, REQUEST_STATUS.FAILED)
    }
  }
}

export const hanldeDeleteRequest = (item) => {
  return (dispatch, getState) => {
    console.log('hanldeDeleteRequest', item)
    THIS.setState({
      selectedItem: item
    }, () => {
      THIS.refs.md_delete_request.show()
    })
  }
}

export const onCloseDeleteRequestModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_delete_request.hide()
  }
}

export const onDeleteRequest = () => {
  return async (dispatch, getState) => {
    const { arrDappRequest } = THIS.props
    const { selectedItem } = THIS.state
    let newDappRequest = arrDappRequest.slice()
    THIS.refs.md_delete_request.hide()
    let res = await DexAPI.deleteRequestGameItem(selectedItem._id)
    if (res && res.status && res.status === 'success') {
      newDappRequest = newDappRequest.filter(item => item._id.toLowerCase() !== selectedItem._id.toLowerCase())
      dispatch(setDappRequest(newDappRequest))
      ReduxServices.refreshTotalSync()
    } else {
      swal({
        width: '250px',
        text: THIS.props.t('Dapps.sendAssetFailed'),
        type: 'error',
        showConfirmButton: false
      })
    }
  }
}

export const updateNewDexGameEvent = (gameData) => {
  return (dispatch, getState) => {
    const { arrDappRequest } = THIS.props
    let newDappRequest = arrDappRequest.slice()
    if (gameData) {
      THIS.setState({
        isLoadingMyRequests: true
      })
      let index = newDappRequest.findIndex(item => item._id.toLowerCase() === gameData._id.toLowerCase())
      if (index !== -1) {
        newDappRequest[index].status = gameData.status
        newDappRequest[index].createdAtTs = gameData.createdAtTs ? gameData.createdAtTs : moment(new Date()).unix()
        dispatch(setDappRequest(newDappRequest))
        THIS.setState({
          listRequest: newDappRequest
        })
      }
      THIS.setState({
        isLoadingMyRequests: false
      })
    }
  }
}

export const onClickHistory = (item) => {
  return (dispatch, getState) => {
    THIS.setState({ 
      objSelectNFT: item 
    }, () => THIS.refs.modalNFTTransactionHistory.show())
  }
}

export const handleInfiniteOnLoad = () => {
  return (dispatch, getState) => {
    const { pageNum, hasMore, isLoadMore, numberGameItem } = THIS.state
    if (isLoadMore || !hasMore) return
    // Handle load more
    THIS.setState({
      isLoadMore: true
    }, async () => {
      if (numberGameItem <= (pageNum * NUM_REQUEST_NFT)) {
        THIS.setState({
          hasMore: false,
          isLoadMore: false
        })
      } else {
        ReduxServices.refreshDappRequest(NUM_REQUEST_NFT, (pageNum * NUM_REQUEST_NFT))
          .then((newDappRequest) => {
            if (newDappRequest.length > 0) {
              THIS.setState({
                pageNum: pageNum + 1,
                hasMore: true,
                isLoadMore: false
              })
            } else {
              THIS.setState({
                hasMore: false,
                isLoadMore: false
              })
            }
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
