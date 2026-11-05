import { checkUrlLink, filterMainAccount, convertWeiToBalance, convertHexToDecimal, roundingNumber, logDebugChatwork } from 'Utils/globalFunction'
import { showLoading, hideLoading } from 'react-redux-loading-bar'
import { setDappFavorite, setLanguage, setCodeScan } from 'Backend/Redux/actions/globalActions'
import { signPersonalLoginDapp, signPersonalTransaction, getNounce } from 'Backend/Lib/Web3/index'
import { filter, includes } from 'lodash'
import ReduxServices from 'Utils/globalRedux'
import swal from 'sweetalert2'
import Images from 'Assets/Image'
const electron = window.require('electron')
const appPath = window.require('electron').remote.app.getAppPath()
const urlMetadata = require('url-metadata')
const TabGroup = window.require('electron-tabs')
const dragula = window.require('dragula')
const bufferSend = 0.0008
let tabGroup

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return (dispatch) => {
    try {
      tabGroup = new TabGroup({
        closeButtonText: '&#215;',
        ready: function (tabGroup) {
          dragula([tabGroup.tabContainer], {
            direction: 'horizontal'
          })
        },
        newTab: {
          title: THIS.props.t('Browser.newTab'),
          src: `file://${appPath}/public/blank.html`,
          active: true
        }
      })
      tabGroup.on('tab-active', (tab, tabGroup) => {
        dispatch(hideLoading())
        let activeTab = tabGroup.getActiveTab()
        if (activeTab.webview.src.indexOf('file://') === -1) { // case of not new tab
          THIS.setState({
            txtLink: activeTab.webview.src,
            isNewTab: false,
            isCanAddFavorite: true,
            isCanReloadPage: true
          }, () => handleUpdateActiveTab(activeTab, activeTab.webview.src))
        } else { // case of new tab
          activeTab.setTitle(THIS.props.t('Browser.newTab'))
          THIS.setState({
            isCanAddFavorite: false,
            isCanReloadPage: false,
            isCanBack: false,
            isCanForward: false,
            isMyFavorite: false,
            isNewTab: true,
            txtLink: ''
          })
        }
      })
      tabGroup.on('tab-added', (tab, tabGroup) => {
        let webview = tab.webview
        if (webview) {
          webview.setAttribute('preload', `file://${appPath}/src/Backend/Lib/Golden/Dapps.js`)
        }
      })
      tabGroup.on('tab-removed', (tab, tabGroup) => {
        let allTabs = tabGroup.getTabs()
        if (allTabs.length === 0) {
          // add empty tab as default
          THIS.setState({
            isNewTab: true
          }, () => {
            tabGroup.addTab({
              title: THIS.props.t('Browser.newTab'),
              src: `file://${appPath}/public/blank.html`,
              active: true
            })
          })
        }
      })
      // add empty tab as default
      THIS.setState({
        isNewTab: true
      }, () => {
        tabGroup.addTab({
          title: THIS.props.t('Browser.newTab'),
          src: `file://${appPath}/public/blank.html`,
          active: true
        })
      })
    } catch (err) {
      logDebugChatwork('BrowserScreen loadingInitial', err)
    }
  }
}

const handleUpdateActiveTab = async (activeTab, activeLink) => {
  try {
    const { dappFavorites } = THIS.props
    let isMyFavorite = filter(dappFavorites, (item) => {
      return item.homepage !== '' && includes(activeLink.toLowerCase(), item.homepage.toLowerCase())
    })
    THIS.setState({
      isMyFavorite: Array.isArray(isMyFavorite) && isMyFavorite.length > 0,
      isCanBack: true,
      isCanForward: true,
      isCanAddFavorite: true,
      isCanReloadPage: true
    })
    activeTab.setTitle(activeTab.title)
    activeTab.setIcon(`https://www.google.com/s2/favicons?domain=${activeLink}`)
    activeTab.webview.addEventListener('did-start-loading', THIS.props.loadingStart)
    activeTab.webview.addEventListener('did-stop-loading', THIS.props.loadingStop)
    activeTab.webview.addEventListener('new-window', THIS.props.onNewWindow)
    activeTab.webview.addEventListener('did-navigate', THIS.props.onDidNavigate)
    activeTab.webview.addEventListener('did-navigate-in-page', THIS.props.onDidNavigateInPage)
    activeTab.webview.addEventListener('ipc-message', THIS.props.onMessage)
    let metadata = await urlMetadata(activeLink)
    if (metadata && metadata.title && metadata.title !== '') {
      activeTab.setTitle(metadata.title)
    }
  } catch (err) {
    logDebugChatwork('handleUpdateActiveTab', err)
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
    }, () => {
      let activeTab = tabGroup.getActiveTab()
      if (activeTab) {
        let webview = activeTab.webview
        process.env['NODE_ENV'] === 'development' && webview.openDevTools()
      }
    })
    dispatch(hideLoading())
  }
}

export const onSubmitLink = (e) => {
  return async (dispatch) => {
    try {
      e.preventDefault()
      const { txtLink } = THIS.state
      if (txtLink.trim() !== '') {
        const newLink = await checkUrlLink(txtLink)
        THIS.setState({
          txtLink: newLink,
          isNewTab: false
        }, async () => {
          let activeTab = tabGroup.getActiveTab()
          if (activeTab) {
            let webview = activeTab.webview
            webview.loadURL(newLink)
            handleUpdateActiveTab(activeTab, newLink)
          }
        })
      }
    } catch (err) {
      logDebugChatwork('onSubmitLink', err)
    }
  }
}

export const onChangeLink = (newLink) => {
  return (dispatch) => {
    THIS.setState({ 
      txtLink: newLink 
    })
  }
}

export const openNewTab = (event, value) => {
  return async (dispatch) => {
    try {
      if (value && value.data && value.data.codeScan) {
        dispatch(setCodeScan(value.data.codeScan))
      }
      const newUrl = await checkUrlLink(value.newLink)
      THIS.setState({
        selectedGame: value && value.data ? value.data : null,
        isNewTab: false,
        txtLink: newUrl
      }, () => {
        tabGroup.addTab({
          title: newUrl,
          src: newUrl,
          active: true
        })
      })
    } catch (err) {
      logDebugChatwork('openNewTab', err)
    }
  }
}

export const openSameTab = (event, value) => {
  return async (dispatch) => {
    try {
      THIS.setState({
        selectedGame: value && value.data ? value.data : null,
        isNewTab: !(value && value.newLink),
        txtLink: value && value.newLink
      }, () => {
        let activeTab = tabGroup && tabGroup.getActiveTab()
        if (activeTab && value && value.newLink) {
          let webview = activeTab.webview
          if (webview) {
            webview.loadURL(value.newLink)
            handleUpdateActiveTab(activeTab, value.newLink)
          }
        }
      })
    } catch (err) {
      logDebugChatwork('openSameTab', err)
    }
  }
}

export const onClickGoBack = () => {
  return (dispatch) => {
    let activeTab = tabGroup.getActiveTab()
    if (activeTab) {
      let webview = activeTab.webview
      if (webview.canGoBack()) {
        webview.goBack()
      }
    }
  }
}

export const onClickGoForward = () => {
  return (dispatch) => {
    let activeTab = tabGroup.getActiveTab()
    if (activeTab) {
      let webview = activeTab.webview
      if (webview.canGoForward()) {
        webview.goForward()
      }
    }
  }
}

export const onClickRefreshPage = () => {
  return (dispatch) => {
    const { isNewTab } = THIS.state
    if (!isNewTab) {
      THIS.setState({
        isReloadBrowser: true,
        isLoadingPageSuccess: false
      }, () => {
        THIS.props.refreshPage()
      })
    }
  }
}

export const refreshPage = () => {
  return (dispatch) => {
    let activeTab = tabGroup.getActiveTab()
    if (activeTab) {
      let webview = activeTab.webview
      webview.reloadIgnoringCache()
    }
  }
}

export const onNewWindow = (response) => {
  return async (dispatch) => {
    console.log('on: NewWindow', response)
    const newUrl = await checkUrlLink(response.url)
    THIS.setState({
      isNewTab: false
    }, () => {
      tabGroup.addTab({
        title: newUrl,
        src: newUrl,
        active: true
      })
    })
  }
}

export const onDidNavigate = (response) => {
  return (dispatch) => {
    console.log('on: DidNavigate', response)
    THIS.setState({
      txtLink: response.url
    }, () => {
      let activeTab = tabGroup.getActiveTab()
      if (activeTab) {
        handleUpdateActiveTab(activeTab, response.url)
      }
    })
  }
}

export const onDidNavigateInPage = (response) => {
  return (dispatch) => {
    console.log('on: DidNavigateInPage', response)
    THIS.setState({
      txtLink: response.url
    }, () => {
      let activeTab = tabGroup.getActiveTab()
      if (activeTab) {
        handleUpdateActiveTab(activeTab, response.url)
      }
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

export const executeCallback = (id, error, value) => {
  return (dispatch) => {
    let activeTab = tabGroup.getActiveTab()
    if (activeTab) {
      let webview = activeTab.webview
      webview.send('executeCallback', id, error, value)
    }
  }
}

export const triggerSwitchAccount = (event, data) => {
  return (dispatch) => {
    tabGroup.eachTab((tab) => {
      tab.webview.reload()
    })
  }
}

export const triggerResetWallet = (event, data) => {
  return (dispatch) => {
    let allWindows = electron.remote.BrowserWindow.getAllWindows()
    if (allWindows.length > 0) {
      allWindows = allWindows.filter(w => w.id !== 1) // remove main window
      allWindows.map(w => {
        w.destroy()
      })
    }
  }
}

export const triggerChangeLanguage = (event, data) => {
  return (dispatch, getState) => {
    const { i18n } = THIS.props
    i18n.changeLanguage(data)
    dispatch(setLanguage(data))
    tabGroup.eachTab((tab) => {
      if (tab.webview.src.indexOf('file://') !== -1) {
        tab.setTitle(THIS.props.t('Browser.newTab'))
      }
    })
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
  }
}

export const onMessage = (payload) => {
  return async (dispatch) => {
    try {
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
        sendData.gasPriceGwei = roundingNumber(gasPriceGwei, 2)
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
      } else if (namePayload.type === 'clearCode') {
        dispatch(setCodeScan(''))
      }
    } catch (err) {
      logDebugChatwork('onMessage', err)
    }
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

export const closeSignModal = () => {
  return (dispatch) => {
    const { payload } = THIS.state
    THIS.refs.md_sign_message.hide()
    THIS.refs.md_sign_transaction.hide()
    THIS.props.executeCallback(payload.id, { error: true, message: 'User denied message signature.' }, null)
  }
}

export const closeSignTransactionModal = () => {
  return (dispatch) => {
    const { payload } = THIS.state
    THIS.refs.md_sign_message.hide()
    THIS.refs.md_sign_transaction.hide()
    THIS.props.executeCallback(payload.id, { error: true, message: 'User denied transaction signature.' }, null)
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
      const { arrCardData, t } = THIS.props
      const { payload, valueInputGas, selectedGame } = THIS.state
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
      logDebugChatwork('onSignTransaction', err)
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

export const handleChangeFavorite = () => {
  return (dispatch) => {
    try {
      const { arrDapps } = THIS.props
      const { isNewTab, isMyFavorite, txtLink } = THIS.state
      if (!isNewTab) {
        THIS.setState({
          isMyFavorite: !isMyFavorite
        }, async () => {
          let dappList = filter(arrDapps, (item) => {
            return item.homepage && item.homepage !== '' && includes(txtLink.toLowerCase(), item.homepage.toLowerCase())
          })
          if (Array.isArray(dappList) && dappList.length > 0) {
            THIS.props.filterDappFavorites(dappList[0])
          } else {
            let metadata = await urlMetadata(txtLink)
            THIS.props.filterExternalFavorites(metadata)
          }
        })
      }
    } catch (err) {
      logDebugChatwork('handleChangeFavorite', err)
    }
  }
}

export const filterDappFavorites = (dappItem) => {
  return (dispatch) => {
    try {
      const { dappFavorites } = THIS.props
      const { isMyFavorite } = THIS.state
      let newDappFavorite
      if (isMyFavorite) {
        newDappFavorite = dappFavorites
        newDappFavorite.push(dappItem)
      } else {
        newDappFavorite = dappFavorites.filter(i => i.homepage.toLowerCase().replace(/\s+/g, '') !== dappItem.homepage.toLowerCase().replace(/\s+/g, ''))
      }
      newDappFavorite.sort((a, b) => a.rank > b.rank ? 1 : -1)
      dispatch(setDappFavorite(newDappFavorite))
    } catch (err) {
      logDebugChatwork('filterDappFavorites', err)
    }
  }
}

export const filterExternalFavorites = (metadata) => {
  return (dispatch) => {
    try {
      const { dappFavorites } = THIS.props
      const { isMyFavorite } = THIS.state
      let externalLink = {}
      externalLink.name = metadata.title ? metadata.title : ''
      externalLink.homepage = metadata.url ? metadata.url : ''
      externalLink.logo = metadata.image ? metadata.image : Images.ic_dappGame_default
      externalLink.imgDefault = !metadata.image
      let newDappFavorite
      if (isMyFavorite) {
        newDappFavorite = dappFavorites
        newDappFavorite.push(externalLink)
      } else {
        newDappFavorite = dappFavorites.filter(i => i.homepage.toLowerCase().replace(/\s+/g, '') !== externalLink.homepage.toLowerCase().replace(/\s+/g, ''))
      }
      newDappFavorite.sort((a, b) => a.rank > b.rank ? 1 : -1)
      dispatch(setDappFavorite(newDappFavorite))
    } catch (err) {
      logDebugChatwork('filterExternalFavorites', err)
    }
  }
}
