import { checkUrlLink, formatNumber, convertWeiToBalance, convertHexToDecimal, roundingNumber, filterMainAccount, triggerSendEventToAllWindow, logDebugChatwork } from 'Utils/globalFunction'
import { APP_ENVIROMENT } from 'Utils/globalConstants'
import { setDappFavorite } from 'Backend/Redux/actions/globalActions'
import { showLoading, hideLoading } from 'react-redux-loading-bar'
import { signPersonalLoginDapp, signPersonalTransaction, getNounce } from 'Backend/Lib/Web3/index'
import DexAPI from 'Backend/Api/services/DexAPI'
import EtherGas from 'Backend/Api/services/EtherGas'
import ReduxServices from 'Utils/globalRedux'
import swal from 'sweetalert2'
import Image from 'Assets/Image'
const urlMetadata = require('url-metadata')
const bufferSend = 0.0008

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return (dispatch) => {
    try {
      const { dappLink, dappFavorites, selectedGame } = THIS.props
      THIS.setState({ 
        txtLink: dappLink,
        isMyFavorite: selectedGame ? dappFavorites.findIndex(i => i.name === selectedGame.name) !== -1 : false
      }, () => {
        THIS.props.onSubmitLink()
      })
    } catch (err) {
      logDebugChatwork('BrowserScreen loadingInitial', err)
    }
  }
}

export const onSubmitLink = () => {
  return async (dispatch) => {
    try {
      const { txtLinkTemp, txtLink } = THIS.state
      const newLink = await checkUrlLink(txtLinkTemp || txtLink)
      THIS.setState({ 
        txtLink: newLink 
      })
    } catch (err) {
      logDebugChatwork('onSubmitLink', err)
    }
  }
}

export const onChangeLink = (newLink) => {
  return (dispatch) => {
    THIS.setState({ 
      txtLinkTemp: newLink 
    })
  }
}

export const handleChangeFavorite = () => {
  return async (dispatch) => {
    try {
      const { selectedGame } = THIS.props
      const { isMyFavorite, txtLinkTemp, txtLink } = THIS.state
      if (selectedGame && !selectedGame.favoriteItem) {
        THIS.setState({
          isMyFavorite: !isMyFavorite
        }, () => {
          THIS.props.filterDappFavorites()
        })
      } else {
        let metadata = await urlMetadata(txtLinkTemp || txtLink)
        THIS.setState({
          isMyFavorite: !isMyFavorite
        }, () => {
          THIS.props.filterDappFavoritesOutSide(metadata)
        })
      }
    } catch (err) {
      logDebugChatwork('handleChangeFavorite', err)
    }
  }
}

export const filterDappFavorites = () => {
  return (dispatch) => {
    try {
      const { selectedGame, dappFavorites } = THIS.props
      const { isMyFavorite } = THIS.state
      let newDappFavorite
      if (isMyFavorite) {
        newDappFavorite = dappFavorites
        newDappFavorite.push(selectedGame)
      } else {
        newDappFavorite = dappFavorites.filter(i => i.name !== selectedGame.name)
      }
      newDappFavorite.sort((a, b) => a.rank > b.rank ? 1 : -1)
      dispatch(setDappFavorite(newDappFavorite))
      // trigger send event to all windows
      triggerSendEventToAllWindow('add-favorites', newDappFavorite)
    } catch (err) {
      logDebugChatwork('filterDappFavorites', err)
    }
  }
}

export const filterDappFavoritesOutSide = (metadata) => {
  return (dispatch) => {
    try {
      const { dappFavorites } = THIS.props
      const { isMyFavorite } = THIS.state
      let selectedGameOutSide = {}
      selectedGameOutSide.name = metadata && metadata.title
      selectedGameOutSide.homepage = metadata && metadata.url
      selectedGameOutSide.iconUrl = metadata && (metadata.image ? metadata.image : Image.ic_dappGame_default)
      selectedGameOutSide.imgDefault = metadata && !metadata.image
      selectedGameOutSide.favoriteItem = metadata && true
      let newDappFavorite
      if (isMyFavorite) {
        newDappFavorite = dappFavorites
        newDappFavorite.push(selectedGameOutSide)
      } else {
        newDappFavorite = dappFavorites.filter(i => i.name.toLowerCase().replace(/\s+/g, '') !== selectedGameOutSide.name.toLowerCase().replace(/\s+/g, ''))
      }
      newDappFavorite.sort((a, b) => a.rank > b.rank ? 1 : -1)
      dispatch(setDappFavorite(newDappFavorite))
      // trigger send event to all windows
      triggerSendEventToAllWindow('add-favorites', newDappFavorite)
    } catch (err) {
      logDebugChatwork('filterDappFavoritesOutSide', err)
    }
  }
}

export const loadingStart = () => {
  return (dispatch) => {
    THIS.setState({
      isCrash: false
    })
    dispatch(showLoading())
  }
}

export const loadingStop = () => {
  return (dispatch) => {
    THIS.setState({
      isReloadBrowser: false
    })
    APP_ENVIROMENT === 'development' && THIS.webview.openDevTools()
    dispatch(hideLoading())
  }
}

export const setRefWebView = (ref) => { 
  return (dispatch) => {
    THIS.webview = ref
  }
}

export const onClickGoBack = () => {
  return (dispatch) => {
    if (THIS.webview.canGoBack()) {
      THIS.webview.goBack()
    } else {
      THIS.props.backHome()
    }
  }
}

export const onClickGoForward = () => {
  return (dispatch) => {
    if (THIS.webview.canGoForward()) {
      THIS.webview.goForward()
    }
  }
}

export const onClickRefreshPage = () => {
  return (dispatch) => {
    THIS.setState({
      isReloadBrowser: true,
      isLoadingPageSuccess: false
    }, () => {
      THIS.props.refreshPage()
    })
  }
}

export const refreshPage = () => {
  return (dispatch) => {
    THIS.webview && THIS.webview.reload()
  }
}

export const onNewWindow = (response) => {
  return (dispatch) => {
    console.log('on: NewWindow', response)
    THIS.setState({
      txtLink: response.url
    }, () => {
      THIS.forceUpdate()
    })
  }
}

export const onDidNavigate = (response) => {
  return (dispatch) => {
    console.log('on: DidNavigate', response)
    THIS.setState({
      txtLinkTemp: response.url
    })
  }
}

export const onDidNavigateInPage = (response) => {
  return (dispatch) => {
    console.log('on: DidNavigateInPage', response)
    THIS.setState({
      txtLinkTemp: response.url
    })
  }
}

export const onDidFinishLoad = (response) => {
  return (dispatch) => {
    console.log('on: onDidFinishLoad', response)
    THIS.setState({
      isLoadingPageSuccess: true
    })
  }
}

export const onDidFailLoad = (response) => {
  return (dispatch) => {
    console.log('on: DidFailLoad', response)
    if (response && response.errorDescription === 'ERR_NAME_NOT_RESOLVED') {
      THIS.setState({
        isCrash: true,
        isLoadingPageSuccess: false
      })
    }
  }
}

export const onMessage = (payload) => {
  return async (dispatch) => {
    const { arrCardData, etherPrice } = THIS.props
    console.log('on: Message', payload)
    if (typeof payload === 'string') return
    const namePayload = JSON.parse(payload.channel)
    if (namePayload.name === 'signPersonalMessage' || namePayload.name === 'signMessage') {
      THIS.setState({
        payload: namePayload,
        isSend: false,
        sendData: null,
        isFeeErr: false
      }, () => {
        THIS.props.openSignPersonalMessageModal()
      })
    } else if (namePayload.name === 'signTransaction' && namePayload.tx && namePayload.tx.gas) {
      let sendData = Object.assign({}, namePayload.tx)
      if (sendData.value) {
        sendData.value = convertWeiToBalance(convertHexToDecimal(sendData.value))
        sendData.fiatMoney = etherPrice.price * sendData.value
      } else {
        sendData.value = '0.00'
        sendData.fiatMoney = '0.00'
      }

      let gasPrice = convertWeiToBalance(convertHexToDecimal(sendData.gasPrice))
      let gasPriceGwei = convertWeiToBalance(convertHexToDecimal(sendData.gasPrice), 9)
      sendData.gas = Math.round(convertHexToDecimal(sendData.gas) * 1.1)
      sendData.gasPrice = gasPrice
      sendData.gasPriceGwei = formatNumber(gasPriceGwei, 2)
      sendData.fee = sendData.gas * gasPrice
      sendData.feeCurrency = sendData.fee * etherPrice.price

      const mainAccount = filterMainAccount(arrCardData)
      let isFeeErr = mainAccount.balance - roundingNumber(sendData.value) - roundingNumber(sendData.fee) - bufferSend <= 0
      let txtNonce = await getNounce(mainAccount.address)
      THIS.setState({
        payload: namePayload,
        isSend: true,
        sendData,
        isFeeErr,
        txtNonce: txtNonce.toString(),
        transactionFee: sendData.fee,
        valueInputGas: sendData.gasPriceGwei
      }, () => {
        THIS.props.openSignTransactionModal()
      })
    }
  }
}

export const executeCallback = (id, error, value) => {
  return (dispatch) => {
    THIS.webview.send('executeCallback', id, error, value)
  }
}

export const closeSignModal = () => {
  return (dispatch) => {
    THIS.refs.md_sign_message.hide()
    THIS.refs.md_sign_transaction.hide()
  }
}

export const openSignPersonalMessageModal = () => {
  return (dispatch) => {
    THIS.refs.md_sign_message.show()
  }
}

export const openSignTransactionModal = () => {
  return (dispatch) => {
    THIS.refs.md_sign_transaction.show()
  }
}

export const onSignPersonalMessage = () => {
  return (dispatch) => {
    try {
      const { arrCardData } = THIS.props
      const { payload } = THIS.state
      THIS.setState({
        isLoadingSignMessage: true
      })
      const mainAccount = filterMainAccount(arrCardData)
      const signedTx = signPersonalLoginDapp(mainAccount.privateKey, payload.data)
      THIS.props.executeCallback(payload.id, null, signedTx)
      THIS.setState({
        isLoadingSignMessage: false
      })
      THIS.refs.md_sign_message.hide()
    } catch (err) {
      logDebugChatwork('onSignPersonalMessage', err)
    }
  }
}

export const onSignTransaction = () => {
  return (dispatch) => {
    try {
      const { arrCardData, selectedGame, t } = THIS.props
      const { payload, valueInputGas } = THIS.state
      const mainAccount = filterMainAccount(arrCardData)
      THIS.setState({ isLoadingSignTransaction: true })
      signPersonalTransaction(mainAccount.privateKey, payload.tx, valueInputGas)
        .then((signedTx) => {
          THIS.setState({ isLoadingSignTransaction: false })
          THIS.refs.md_sign_transaction.hide()
          swal({
            width: '250px',
            text: t('Dapps.purchaseItemSuccessfully', { name: selectedGame ? selectedGame.name : 'Dapp' }),
            type: 'success',
            timer: 5000,
            showConfirmButton: false
          }).then(async () => {
            // THIS.props.refreshPage()
            // DexAPI.triggerGetEtherTransactions(mainAccount.address)
            // ReduxServices.trackingTransaction(hash, mainAccount.address, sendData.to.toLowerCase(), sendData.value, null)
            // dispatch(setPendingTx({account: mainAccount, isPending: true, lastTxID: hash}))
            // Observer.emit(OBSERVER_KEY.GET_DATA_AFTER_BUY_DAPP_ITEM)
          })
          THIS.props.executeCallback(payload.id, null, signedTx)
        }).catch((e) => {
          THIS.setState({ isLoadingSignTransaction: false })
          swal({
            width: '250px',
            text: t('Dapps.purchaseItemFailed'),
            type: 'error',
            showConfirmButton: false
          }).then(() => {
            THIS.props.refreshPage()
          })
        })
    } catch (err) {
      THIS.setState({ isLoadingSignTransaction: false })
      logDebugChatwork('onSignTransaction', err)
    }
  }
}

export const openConfirmPinCodeModal = () => {
  return (dispatch) => {
    THIS.refs.md_sign_message.hide()
    THIS.refs.md_sign_transaction.hide()
    THIS.refs.modalConfirmPinCode.show()
  }
}

export const onCompleteInputPINCode = (value, self, THIS) => {
  return (dispatch, getState) => {
    try {
      const { isSend } = THIS.state
      const {countInput} = self.state
      const { t } = self.props
      const { arrPinCodeData } = getState()

      if (countInput === -1) {
        if (arrPinCodeData === value) {
          THIS.refs.modalConfirmPinCode.hide()
          if (isSend) {
            THIS.props.onSignTransaction()
          } else {
            THIS.props.onSignPersonalMessage()
          }
        } else {
          self.setState({ isErrorCurrentPIN: true, txtError: t('PinCodeNotMatched') })
          setTimeout(() => {
            self.pin.clear()
          }, 100)
          self.pin.focus()
        }
      }
    } catch (err) {
      logDebugChatwork('onCompleteInputPINCode', err)
    }
  }
}

export const onClickReloadBalance = () => {
  return (dispatch) => {
    try {
      const { arrCardData } = THIS.props
      THIS.setState({
        isReloadBalance: true
      }, async () => {
        ReduxServices.refreshCardBalance(arrCardData).then(() => {
          THIS.setState({
            isReloadBalance: false
          })
        })
      })
    } catch (err) {
      THIS.setState({
        isReloadBalance: true
      })
      logDebugChatwork('onClickReloadBalance', err)
    }
  }
}

export const onClickBackToTop = () => {
  return (dispatch) => {
    THIS.webview.executeJavaScript(`scrollToTop(1000);function scrollToTop(scrollDuration) {
      var scrollStep = -window.scrollY / (scrollDuration / 15),
          scrollInterval = setInterval(function(){
          if ( window.scrollY != 0 ) {
              window.scrollBy( 0, scrollStep );
          }
          else clearInterval(scrollInterval); 
      },15);
  }`)
  }
}

export const onClickOutPINCode = (value) => {
  return (dispatch, getState) => {
    if (THIS.pin) {
      THIS.pin.clear()
      THIS.pin.focus()
    }
  }
}

export const fetchRating = () => {
  return async (dispatch, getState) => {
    try {
      const { internetData, arrCardData, selectedGame } = THIS.props
      const mainAccount = filterMainAccount(arrCardData)
      if (internetData && selectedGame) {
        let rating = await DexAPI.getSingleDappRating(mainAccount.address, selectedGame._id)
        if (rating && rating.data && rating.data.value) {
          THIS.setState({
            ratingValue: rating.data.value
          })
        }
      }
    } catch (err) {
      logDebugChatwork('fetchRating', err)
    }
  }
}

export const onChangeRating = (value) => {
  return async (dispatch, getState) => {
    try {
      const { internetData, arrCardData, selectedGame, t } = THIS.props
      const mainAccount = filterMainAccount(arrCardData)
      if (internetData && selectedGame) {
        let rating = await DexAPI.addRatingToDapp(mainAccount.address, selectedGame._id, value)
        if (rating && rating.status && rating.status === 'success') {
          THIS.setState({
            ratingValue: value
          }, () => {
            swal({
              width: '250px',
              text: t('Dapps.thanksForRating'),
              type: 'success',
              timer: 5000,
              showConfirmButton: false
            })
          })
        }
      }
    } catch (err) {
      logDebugChatwork('onChangeRating', err)
    }
  }
}

export const handleChangeGasPrice = (res) => {
  return (dispatch, getState) => {
    THIS.setState({
      valueInputGas: res.gasInput,
      transactionFee: res.transactionFee
    })
  }
}

export const onCloseAdvertisement = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isShowBrowserAddress: true
    }, () => {
      setTimeout(() => {
        THIS.setState({
          isShowBrowserAddress: false
        })
      }, 10000)
    })
  }
}

export const triggerSwitchedAccount = (event, data) => {
  return (dispatch, getState) => {
    const { mainAccount } = THIS.state
    THIS.setState({
      switchedAccount: data
    }, () => {
      if (data.address.toLowerCase() !== mainAccount.address.toLowerCase()) {
        THIS.refs.md_account_switched.show()
      }
    })
  }
}

export const triggerEditAccount = (event, data) => {
  return (dispatch, getState) => {
    const { mainAccount } = THIS.state
    let cardFind = data.find(e => e.address.toLowerCase() === mainAccount.address.toLowerCase())
    cardFind && THIS.setState({
      mainAccount: cardFind
    })
  }
}

export const triggerDeletedMainAccount = (event, data) => {
  return (dispatch, getState) => {
    const { mainAccount } = THIS.state
    if (mainAccount.address.toLowerCase() === data.address.toLowerCase()) {
      THIS.props.backHome()
    }
  }
}

export const onAgreeKeepCurrentAccount = () => {
  return (dispatch, getState) => {
    THIS.refs.md_account_switched.hide()
  }
}

export const onDisagreeKeepCurrentAccount = () => {
  return (dispatch, getState) => {
    THIS.refs.md_account_switched.hide()
    THIS.props.backHome()
  }
}
