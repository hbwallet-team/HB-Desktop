import Images from 'Assets/Image'
import swal from 'sweetalert2'
import { validateSpace, formatNumberLeftZero, convertWeiToBalance, showNotification, triggerSendEventToAllWindow, checkKanjiCharacter, saveTransactionEther, filterMainAccount, logDebugChatwork } from 'Utils/globalFunction'
import { CONSTANTS, HBCRYPTO, OBSERVER_KEY, LIMIT_NUMBER } from 'Utils/globalConstants'
import { setPendingTx } from 'Backend/Redux/actions/globalActions'
import ReduxServices from 'Utils/globalRedux'
import OxObject from 'Backend/Lib/0x/index'
import Observer from 'Utils/HBObserver'
import ChatworkAPI from 'Backend/Api/services/ChatworkAPI'
import DexAPI from 'Backend/Api/services/DexAPI'

const { ipcRenderer } = window.require('electron')
const log = window.require('electron-log')
const FIVE_MINUTES = 60000 * 5
const arrImgCard = [Images.card1, Images.card2, Images.card3, Images.card4, Images.card5, Images.card6, Images.card7]

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

// Show add modal account
export const openAddModal = () => {
  return (dispatch, getState) => {
    THIS.refs.modalAddAccount.show()
    THIS.setState({ objSelectItem: null, strCardName: '', isNameErr: false, isOpenCreate: false })
  }
}

// Hide add modal account
export const hideAddModal = () => {
  return (dispatch, getState) => {
    THIS.refs.modalAddAccount.hide()
  }
}

export const handleBackToTop = () => {
  return (dispatch, getState) => {
    const { activeKey } = THIS.state
    THIS.setState({ 
      isActiveDetai: false,
      isSimplex: false,
      isKyberSwap: false
    })
    THIS.props.onChangeTab(activeKey)
  }
}

export const checkForUpdate = () => {
  return (dispatch, getState) => {
    const { t } = THIS.props
    console.log('Checking for update in Ether Screen...')
    log.info('checkForUpdate--1')
    ipcRenderer.on('ipcUpdate', (event, text) => {
      log.info('checkForUpdate--2')
      swal({
        width: '404px',
        allowOutsideClick: false,
        title: t('ImportantUpdatesAreAvailable'),
        cancelButtonText: t('NotNow'),
        confirmButtonText: t('ppUpdate'),
        showCancelButton: true,
        type: 'info',
        customClass: 'edt-swal-update'
      }).then((result) => {
        if (result.value) {
          ipcRenderer.send('replyIpcUpdate', true)
          log.info('checkForUpdate--3')
        }
      })
    })
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    try {
      const { arrCardData } = THIS.props
      let arrFilterName = []
      arrCardData.map(item => arrFilterName.push(item.cardName))
      THIS.arrFilterName = arrFilterName
      ReduxServices.refreshCardBalance(arrCardData).then(() => {
        THIS.setState({
          isLoadingCard: false
        })
      })
    } catch (err) {
      logDebugChatwork('EthereumScreen loadingInitial', err)
      THIS.setState({
        isLoadingCard: false
      })
    }
    
  }
}

export const fetchEtherTxs = () => {
  return (dispatch, getState) => {
    try {
      const { arrCardData, arrAccountHistoryDataAll, internetData } = THIS.props
      let arrTxt = []
      if (arrAccountHistoryDataAll && arrAccountHistoryDataAll.datas && arrAccountHistoryDataAll.datas.length > 0) {
        arrTxt = arrAccountHistoryDataAll.datas
      }
      if (arrTxt.length > 0) {
        let tempData = arrTxt.slice(0, CONSTANTS.PAGE_LENGTH)
        if (tempData.length > 0) {
          THIS.setState({
            pageTxt: 1,
            historyData: tempData,
            hasMore: true,
            isLoadMore: false
          })
        } else {
          THIS.setState({
            hasMore: false,
            isLoadMore: false
          })
        }
        THIS.forceUpdate()
      }
      if (internetData) {
        ReduxServices.refreshEtherTxsHistoryAll(arrCardData.filter(card => card.isEnable), true).then(() => {
          THIS.setState({
            pageTxt: 0,
            historyData: [],
            hasMore: true,
            isLoadMore: false
          }, () => THIS.props.handleInfiniteOnLoad())
        })
      }
    } catch (err) {
      logDebugChatwork('fetchEtherTxs', err)
    }
  }
}

export const updateDataAfterSendETH = () => {
  return async (dispatch, getState) => {
    const { t } = THIS.props
    const { pendingTx } = getState()
    console.log('awaitTransactionSuccessAsync: ', pendingTx.lastTxID)
    // update status of tracking transanction to pending
    setTimeout(() => {
      ReduxServices.clearTrackingTxs(pendingTx.lastTxID)
    }, 5000)

    // waiting transaction in ethereum network
    const txReceipt = await OxObject.awaitTransactionSuccessAsync(pendingTx.lastTxID)
    console.log('txReceipt: ', txReceipt, txReceipt.logs)

    // update pending status
    pendingTx.isPending = false
    dispatch(setPendingTx(pendingTx))

    // store new transaction into DB
    saveTransactionEther(pendingTx.account, txReceipt)

    if (txReceipt && txReceipt.status === 1) { // transaction successfully

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

      // specify notice message
      let notice = t('Sentnew', { number: formatNumberLeftZero(convertWeiToBalance(txReceipt.value)), Symbol: HBCRYPTO.ETHEREUM, cardName: pendingTx.account.cardName })

      // show notification to notice user
      showNotification(notice, t)
    } else { // transaction failed
      ReduxServices.clearTrackingTxs()
    }
  }
}
export const handleInputName = (newStrCardName) => {
  return (dispatch, getState) => {
    try {
      const { strCardName } = THIS.state
      let cardName = ''
      let isNameErr = false
      if (validateSpace(newStrCardName)) {
        cardName = newStrCardName
        if (checkKanjiCharacter(newStrCardName) > LIMIT_NUMBER.CARD_NAME) {
          cardName = strCardName
        }
        if (THIS.arrFilterName.includes(cardName)) {
          isNameErr = true
        }
      } else {
        cardName = ''
      }
      THIS.setState({isNameErr, strCardName: cardName}, () => checkOpenCreate())
    } catch (err) {
      logDebugChatwork('handleInputName', err)
    }
  }
}

export const clickOnCell = (card, findType, txsInfo, findTxsToken, mainAccount, isSend) => {
  return (dispatch, getState) => {
    THIS.setState({ 
      objSelectItemHistoryDetail: card
    }, () => THIS.refs.modalHistoryDetail.show())
  }
}

export const handleSelectImage = (index, image) => {
  return (dispatch, getState) => {
    THIS.setState({ objSelectItem: { index, image } }, () =>
      checkOpenCreate()
    )
  }
}

const checkOpenCreate = () => {
  const { strCardName, isNameErr } = THIS.state
  if (strCardName.length > 0 && !isNameErr) {
    THIS.setState({ isOpenCreate: true })
  } else {
    THIS.setState({ isOpenCreate: false })
  }
}

export const handleCreateAccount = () => {
  return async (dispatch, getState) => {
    try {
      const { arrCardData, t } = THIS.props
      const { strCardName, isOpenCreate } = THIS.state
      if (!isOpenCreate) {
        return
      }

      THIS.setState({
        isOpenCreate: false
      }, () => {
        let newIndex
        let newCardData = arrCardData.filter(card => card.isImported === false)
        let listIndex = []
        arrCardData.map(card => card.etherIndex !== null && listIndex.push(card.etherIndex))
        console.log('TCL: handleCreateAccount -> listIndex', listIndex)
        let missingIndex = []
        for (let i = 0; i <= listIndex.length - 1; i++) {
          if (listIndex.indexOf(i) === -1) {
            missingIndex.push(i)
          }
        }
        if (missingIndex.length > 0) {
          newIndex = missingIndex[0]
        } else {
          newIndex = newCardData[newCardData.length - 1].etherIndex + 1
        }
        let newKey = arrCardData[arrCardData.length - 1].key + 1
        if (arrCardData[0].mnemonic && arrCardData[0].mnemonic.length > 0) {
          ReduxServices.createNewEtherCard(arrCardData[0].mnemonic, newKey, newIndex, strCardName).then((newCardData) => {
            // hide add sub account modal
            THIS.refs.modalAddAccount.hide()
            THIS.setState({
              isLoadingCard: false, 
              objSelectItem: null, 
              strCardName: ''
            })
            swal({
              text: t('createAccountSuccess'),
              width: '250px',
              type: 'success',
              timer: 5000,
              showConfirmButton: false
            })
            let arrFilterName = []
            newCardData.map(item => arrFilterName.push(item.cardName))
            THIS.arrFilterName = arrFilterName
            ReduxServices.refreshCardBalance(newCardData)
            ReduxServices.refreshEtherTxsHistoryAll(newCardData.filter(card => card.isEnable), false)
            // trigger send event to all windows
            triggerSendEventToAllWindow('add-new-account', newCardData)
          })
        } else {
          swal({
            width: '250px',
            text: t('RequestFail'),
            type: 'error',
            showConfirmButton: false
          })
        }
      })
    } catch (err) {
      THIS.setState({
        isLoadingCard: false, 
        objSelectItem: null, 
        strCardName: ''
      })
      logDebugChatwork('handleCreateAccount', err)
    }
  }
}

const filterData = () => {
  const { arrCardData } = THIS.props
  let filterData = []
  let filterImage = []
  arrCardData.map(item => filterImage.push(item.image))
  arrImgCard.map(item => !filterImage.includes(item) && filterData.push(item))

  THIS.setState({ arrCardImage: filterData })
}

export const onClickCard = (item) => {
  return async (dispatch, getState) => {
    THIS.setState({ isActiveDetai: true, cardSelected: item })
  }
}

export const changeChartTime = (chartTime) => {
  return (dispatch, getState) => {
    THIS.setState({ chartTime })
  }
}

export const handleInfiniteOnLoad = () => {
  return (dispatch, getState) => {
    try {
      const { pageTxt, historyData, hasMore, isLoadMore } = THIS.state
      const { arrAccountHistoryDataAll } = THIS.props
      let arrTxt = []
      if (arrAccountHistoryDataAll && arrAccountHistoryDataAll.datas && arrAccountHistoryDataAll.datas.length > 0) {
        arrTxt = arrAccountHistoryDataAll.datas
      }
      if (isLoadMore || !hasMore) return
      // Handle load more
      THIS.setState({
        isLoadMore: true
      }, async () => {
        if (arrTxt.length > 0) {
          var tempData = arrTxt.slice(pageTxt * CONSTANTS.PAGE_LENGTH, (pageTxt + 1) * CONSTANTS.PAGE_LENGTH)
          if (tempData.length > 0) {
            THIS.setState({
              pageTxt: pageTxt + 1,
              historyData: historyData.concat(tempData),
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
      })
    } catch (err) {
      logDebugChatwork('handleInfiniteOnLoad', err)
    }
  }
}

export const handleUpdateHistoryDataAll = () => {
  return (dispatch, getState) => {
    try {
      const { pageTxt, hasMore, isLoadMore } = THIS.state
      const { arrAccountHistoryDataAll } = getState()
      let arrTxt = []
      if (arrAccountHistoryDataAll.datas.length > 0) {
        arrTxt = arrAccountHistoryDataAll.datas
      }
      if (isLoadMore || !hasMore) return
      // Handle load more
      THIS.setState({
        isLoadMore: true
      }, async () => {
        if (arrTxt.length > 0) {
          let tempData = arrTxt.slice(0, (pageTxt + 1) * CONSTANTS.PAGE_LENGTH)
          if (tempData.length > 0) {
            THIS.setState({
              pageTxt: pageTxt + 1,
              historyData: tempData,
              hasMore: true,
              isLoadMore: false
            })
          } else {
            THIS.setState({
              hasMore: false,
              isLoadMore: false
            })
          }
          THIS.forceUpdate()
        }
      })
    } catch (err) {
      logDebugChatwork('handleUpdateHistoryDataAll', err)
    }
  }
}

export const onChangeTab = (activeKey) => {
  return (dispatch, getState) => {
    THIS.setState({ activeKey: activeKey })
  }
}

export const fetchEtherGasStation = () => {
  return (dispatch, getState) => {
    THIS.props.getEtherGasStation()
    if (THIS.backgroundEtherGasStation) {
      clearInterval(THIS.backgroundEtherGasStation)
    }
    THIS.backgroundEtherGasStation = setInterval(() => THIS.props.getEtherGasStation(), FIVE_MINUTES)
  }
}

export const getEtherGasStation = () => {
  return async (dispatch, getState) => {
    ReduxServices.refreshGasStation()
  }
}

export const handleSwitchAccount = (card) => {
  return (dispatch) => {
    THIS.setState({
      switchSelectItem: card
    }, () => {
      THIS.refs.modalSwitchAccount.show()
    })
  }
}

export const closeSwitchAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.modalSwitchAccount.hide()
  }
}

export const openImportAccountModal = () => {
  return (dispatch) => {
    THIS.refs.modalImportAccount.show()
  }
}

export const closeImportAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.modalImportAccount.hide()
  }
}
export const fetchSimplexInfo = () => {
  return async (dispatch, getState) => {
    let res = await DexAPI.getSimplexInfo()
    THIS.setState({
      simplexInfo: res && res.message ? res.message : ''
    })
  }
}

export const onSwitchKyberSwap = (selectedCoinSwap, outputCoinSwap = null) => {
  return (dispatch) => {
    THIS.setState({
      isKyberSwap: true,
      selectedCoinSwap,
      outputCoinSwap
    })
  }
}
