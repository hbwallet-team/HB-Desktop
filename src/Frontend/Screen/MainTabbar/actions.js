import React from 'react'
import { Switch, Route } from 'react-router'
import OxObject from 'Backend/Lib/0x/index'
import { setCard, setLanguage, setSettingUrls, setPendingTx, setAdvancedWallet, setPendingAirdrop, setCountWarning, setUnReadNoti, setDexNoti, setReadNotiNew, setScamCoins, setHBContract, setKyberSwapToken, setCompoundRate, setScreenConfig } from 'Backend/Redux/actions/globalActions'
import { getHBTokens, getRealBoostTokens, getChartEtherPrice, getChartEtherPriceYear, getEtherPrice } from 'Backend/Redux/actionSaga/sagaActions'
import EthereumScreen from '../EthereumScreen'
import TokenScreen from '../TokenScreen'
import ExchangeScreen from '../ExchangeScreen'
import ExchangeTop from '../ExchangeTop'
import SettingScreen from '../SettingScreen'
// import ETHToOther from '../ShapeShift/ETHToOther'
// import OtherToETH from '../ShapeShift/OtherToETH'
// import ShapeShiftHistory from '../ShapeShift/ShapeShiftHistory'
import ShapeShiftMenu from '../ShapeShift/ShapeShiftMenu'
import MarketTracker from '../MarketTracker'
import GrabToken from '../GrabToken'
import DappScreen from '../DappScreen'
import DappMarketScreen from '../DappMarketScreen'
import DappAssetScreen from '../DappAssetScreen'
import { activeSocketDex, activeFirebase, filterMainAccount, formatNumberLeftZero, convertWeiToBalance, showNotification, saveTransactionEther, saveTransactionToken, triggerSendEventToAllWindow, openBrowserInNewTab } from 'Utils/globalFunction'
import { APP_PATH, APP_SCREEN_SIZE, PENDING_TYPE, OBSERVER_KEY, HBWALLET, HBCRYPTO } from 'Utils/globalConstants'
import DexAPI from 'Backend/Api/services/DexAPI'
import DappAPI from 'Backend/Api/services/DappAPI'
import ScamCoins from 'Backend/Api/services/ScamCoins'
import ReduxServices from 'Utils/globalRedux'
import { sendEthTokenTxs } from 'Backend/Lib/Web3/index'
import Observer from 'Utils/HBObserver'
import swal from 'sweetalert2'
import Settings from 'Backend/settings'
import NagemonAPI from 'Backend/Api/services/NagemonAPI'
import Images from 'Assets/Image'

var THIS
const FIVE_MINUTES = 300000
const { ipcRenderer } = window.require('electron')
const log = window.require('electron-log')
const remote = window.require('electron').remote
let w = remote.getCurrentWindow()
let newWindow
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const AppRouter = ({that}) => {
  return (
    <Switch>
      <Route path={APP_PATH.ETHEREUM_SCREEN} component={EthereumScreen} />
      <Route path={APP_PATH.TOKENS_SCREEN} component={TokenScreen} />
      <Route path={APP_PATH.GRAB_TOKEN_SCREEN} component={GrabToken} />
      <Route path={APP_PATH.EXCHANGE_TOP} component={ExchangeTop} />
      <Route path={APP_PATH.EXCHANGE_SCREEN} component={ExchangeScreen} />
      <Route path={APP_PATH.SHAPE_SHIFT_SCREEN} component={ShapeShiftMenu} />
      <Route path={APP_PATH.MARKET_TRACKER_SCREEN} component={MarketTracker} />
      <Route path={APP_PATH.SETTINGS_SCREEN} component={SettingScreen} />
      <Route path={APP_PATH.DAPP_SCREEN} component={DappScreen} />
      <Route path={APP_PATH.DAPP_MARKET_SCREEN} component={DappMarketScreen} />
      <Route path={APP_PATH.DAPP_ASSET} component={DappAssetScreen} />
      {/* <Route path="/mainTabbar/ethToOther/" component={ETHToOther} />
      <Route path="/mainTabbar/otherToETH/" component={OtherToETH} />
      <Route path="/mainTabbar/shapeShiftHistory/" component={ShapeShiftHistory} /> */}
    </Switch>
  )
}

export const downloadCompleted = () => {
  return (dispatch, getState) => {
    const { t } = THIS.props
    ipcRenderer.on('ipcDownloadCompleted', (event, text) => {
      log.info('checkForUpdate--2')
      swal({
        width: '425px',
        allowOutsideClick: false,
        title: t('UpdatesCompleted'),
        cancelButtonText: t('NotNow'),
        confirmButtonText: t('ppReset'),
        showCancelButton: true,
        type: 'info',
        customClass: 'edt-swal-update'
      }).then((result) => {
        if (result.value) {
          ipcRenderer.send('replyIpcDownloadCompleted', true)
          log.info('checkForUpdate--5')
        }
      })
    })
  }
}

export const changeLanguage = (value) => {
  return (dispatch, getState) => {
    const { i18n } = THIS.props
    i18n.changeLanguage(value.language)
    dispatch(setLanguage(value.language))
    THIS.setState({dropdownValue: value})
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { arrCardData, mnemonicData, internetData, countWarning, t } = THIS.props
    if (internetData) {
      activeSocketDex(dispatch)
      activeFirebase(dispatch)
    }
    if (arrCardData.length === 0) {
      ReduxServices.createNewEtherCard(mnemonicData, 0, 0, 'Main Account').then(async (newCardData) => {
        const mainAccount = filterMainAccount(newCardData)
        if (mainAccount) {
          OxObject.resetProviderEngine()
          OxObject.init(mainAccount)
          await ReduxServices.refreshUserAuthentication(newCardData)
          ReduxServices.refreshHoldingTokens(newCardData)
        }
        THIS.props.history.push(APP_PATH.ETHEREUM_SCREEN)
      })
    } else {
      let newCardData = []
      arrCardData.map(card => !card.isImported && newCardData.push(card))
      newCardData.map((item, index) => { item.etherIndex = index })

      let newCardDataImport = []
      arrCardData.map(card => card.isImported && newCardDataImport.push(card))
      newCardData = newCardData.concat(newCardDataImport).sort(function (a, b) {
        return a.key - b.key
      })
      dispatch(setCard(newCardData))

      const mainAccount = filterMainAccount(arrCardData)
      if (mainAccount) {
        if (OxObject.getCurrentMainAddress() !== mainAccount.address) {
          OxObject.resetProviderEngine()
          OxObject.init(mainAccount)
        }
        ReduxServices.refreshUserAuthentication(arrCardData)
        ReduxServices.refreshHoldingTokens(arrCardData)
        // show warning alert
        // if (!arrCardData[0].isSkipWarning && countWarning < 3) {
        //   swal({
        //     width: '404px',
        //     title: t('Emergency.notice'),
        //     html: t('Emergency.bugOccured') + '<br/>' + t('Emergency.saveYourPrivateKey') + '<br/><br/>' + t('Emergency.goToPrivateKeyScreen') + '<br/>' + t('Emergency.howToCheckPrivateKey') + '<br/>' + t('Emergency.howToGoPrivateKeyScreen'),
        //     type: 'warning',
        //     confirmButtonText: t('OK'),
        //     customClass: 'edt-swal-update edt-emergency'
        //   }).then((result) => {
        //     if (result.value) {
        //       dispatch(setCountWarning(countWarning + 1))
        //     }
        //   })
        // }
      }
      THIS.props.history.push(APP_PATH.ETHEREUM_SCREEN)
    }
  }
}

export const fetchHBContract = () => {
  return async (dispatch, getState) => {
    let getHBContract = await NagemonAPI.getContractSetting()
    if (Array.isArray(getHBContract)) {
      dispatch(setHBContract(getHBContract))
    }
  }
}

export const fetchSwapTokens = () => {
  return async (dispatch, getState) => {
    const { arrHBTokens, screenConfig } = THIS.props
    let settings = await DappAPI.getSettingOther()
    if (settings && Array.isArray(settings.kyberSwap)) {
      settings.kyberSwap.map(item => {
        let token = arrHBTokens.find(e => e.tokenAddress.toLowerCase() === item.address.toLowerCase())
        item.iconImage = token ? token.iconImage : Images.airDropNone
      })
      dispatch(setKyberSwapToken(settings.kyberSwap))
    }
    if (settings && settings.others) {
      let config = {
        blockchain_card_address: settings.others.BLOCKCHAIN_CARD_ADDRESS,
        blockchain_card_list: settings.others.LIST_BLOCK_CHAIN_CARD,
        blockchain_nft_scan: settings.others.NAGEMON_NFT_BLOCK_CHAIN_SCAN,
        kachiage_address: settings.others.KACHIAGE_ADDRESS,
        kachiage_card_list: settings.others.LIST_KACHIAGE_CARD
      }
      screenConfig['dapp'] = config
      dispatch(setScreenConfig(screenConfig))
    }
  }
}

export const fetchCompoundRate = () => {
  return async (dispatch, getState) => {
    let compound = await DappAPI.getCompoundRate()
    if (compound && Array.isArray(compound.data)) {
      dispatch(setCompoundRate(compound.data))
    }
  }
}

export const fetchHBTokens = () => {
  return (dispatch, getState) => {
    dispatch(getHBTokens())
    // dispatch(getRealBoostTokens())
    if (THIS.backgroundTimerHBTokens) {
      clearInterval(THIS.backgroundTimerHBTokens)
    }
    THIS.backgroundTimerHBTokens = setInterval(() => backgroundFetchHBTokens(dispatch), FIVE_MINUTES)
  }
}

const backgroundFetchHBTokens = (dispatch) => {
  dispatch(getHBTokens())
  // dispatch(getRealBoostTokens())
}

export const fetchSettingUrls = () => {
  return async (dispatch, getState) => {
    let setting = await DexAPI.getSettingUrls()
    if (setting && setting.data && !setting.error) {
      dispatch(setSettingUrls(setting.data))
    }
  }
}

export const fetchLatestVersion = () => {
  return async (dispatch, getState) => {
    const { t } = THIS.props
    let versionInfo = await DexAPI.getVersion()
    if (versionInfo && versionInfo.data) {
      // "appVersion" is set by the field "version" in "package.json"
      const appVersion = window.require('electron').remote.app.getVersion()
      const retrievedVersion = versionInfo.data
      if (retrievedVersion && appVersion !== retrievedVersion.version) {
        let swlink
        if (navigator.platform.toLowerCase().indexOf('mac') > -1) {
          swlink = retrievedVersion.swLink
          console.log('OS: this is my MAC')
        } else if (navigator.platform.toLowerCase().indexOf('win') > -1) {
          swlink = retrievedVersion.swLinkWin
          console.log('OS: this is my WINDOWS')
        } else if (navigator.platform.toLowerCase().indexOf('free') > -1 || navigator.platform.toLowerCase().indexOf('linux') > -1) {
          swlink = retrievedVersion.swLinkLinux
          console.log('OS: this is my LINUX')
        } else {
          swlink = 'https://www.hb-wallet.com/download'
        }
        let forceUpdate = retrievedVersion.forceUpdate
        // If software update is mandatory, display the popup with the info
        //    "There is a mandatory software version at here: <hyper_link>"
        // The popup has "Stop software" button on clicking, it will stop the software completely
        // This is to prevent user from continuing using the software.
        if (swlink) {
          if (forceUpdate === true) {
            swal({
              width: '404px',
              allowOutsideClick: false,
              title: t('ImportantUpdatesAreAvailable'),
              confirmButtonText: t('ppUpdate'),
              type: 'info',
              customClass: 'edt-swal-update'
            }).then((result) => {
              if (result.value) {
                openBrowserInNewTab(swlink)
              }
            })
          } else {
            // If software update is optional, display the popup with the info
            //    "There is a new software version at here: <hyper_link>"
            // The popup has "OK" button on clicking, it will close the popup and still let the software run normally
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
                openBrowserInNewTab(swlink)
              }
            })
          }
        }
      }
    }
  }
}

export const awaitTransaction = (result) => {
  return async (dispatch, getState) => {
    const { pendingTx, arrCardData } = THIS.props
    pendingTx.isPending = true
    await dispatch(setPendingTx({account: arrCardData[0], isPending: true, lastTxID: result}))
    await OxObject.awaitTransactionMinedAsync(result)
    console.log('pendingTx123--: ', pendingTx)
  }
}

export const awaitAllLoopTransferDone = () => {
  return async (dispatch, getState) => {
    const { pendingTx, advancedWallet } = THIS.props
    pendingTx.isPending = false
    advancedWallet.isSending = false
    await dispatch(setPendingTx(pendingTx))
    await dispatch(setAdvancedWallet(advancedWallet))
    console.log('pendingTx123--: ', pendingTx)
  }
}

/**
   * Render dropdown option
   * @param {*} option row
   */
export const renderDropdownValue = (option) => {
  return (
    <div className="dropdown-it">
      <img alt="img" className="dropdown-img" src={require('../../../Assets/Image/flags/' + option.flat)} />
      <span className="dropdown-label-show">{option.label}</span>
    </div>
  )
}

export const fetchLastTransaction = () => {
  return (dispatch, getState) => {
    console.log('fetchLastTransaction: restart after 30 seconds')
    THIS.props.watchingLastTransaction()
    // if (THIS.backgroundTimerLastTransaction) {
    //   clearInterval(THIS.backgroundTimerLastTransaction)
    // }
    // THIS.backgroundTimerLastTransaction = setInterval(() => THIS.props.watchingLastTransaction(), 10000)
  }
}

export const watchingLastTransaction = (isFirst = false) => {
  return (dispatch, getState) => {
    const { arrCardData } = THIS.props

    if (!arrCardData[0]) return
    // const latestTx = await EtherScan.getAllTransactionByAddressFromBlock(arrCardData[0].address, dexLastTransaction.blockNumber, isFirst)
    OxObject.watcher(THIS, dispatch)
  }
}

/**
 * Get char ether price
 */
export const fetchChartEtherPrice = () => {
  return (dispatch, getState) => {
    const { arrCurrencyData } = THIS.props

    dispatch(getChartEtherPrice())
    dispatch(getChartEtherPriceYear())
    dispatch(getEtherPrice(arrCurrencyData))
    if (THIS.backgroundTimer) {
      clearInterval(THIS.backgroundTimer)
    }
    THIS.backgroundTimer = setInterval(() => backgroundHandle(dispatch), FIVE_MINUTES)
  }
}

/**
 * Call this func each 5 minutes
 * Run in background
 * Reload chart ether price,
 * Reload ether price in USD
 * @param {*} dispatch
 */
const backgroundHandle = (dispatch) => {
  const { arrCurrencyData } = THIS.props

  dispatch(getChartEtherPrice())
  dispatch(getChartEtherPriceYear())
  dispatch(getEtherPrice(arrCurrencyData))
}

/**
 * Get new grab token
 */
export const refreshGrabToken = () => {
  return (dispatch, getState) => {
    ReduxServices.refreshGrabToken()
  }
}

/**
 * Get new total sync
 */
export const fetchTotalSync = () => {
  return (dispatch, getState) => {
    ReduxServices.refreshTotalSync()
    if (THIS.backgroundTimerGrab) {
      clearInterval(THIS.backgroundTimerTotalSync)
    }
    THIS.backgroundTimerTotalSync = setInterval(() => ReduxServices.refreshTotalSync(), FIVE_MINUTES)
  }
}

export const updateDexRequestEvent = () => {
  return (dispatch, getState) => {
    ReduxServices.refreshTotalSync()
  }
}

export const triggerSwitchedAccount = (event, data) => {
  return (dispatch, getState) => {
    if (data) {
      ReduxServices.switchAccount(data)
    }
  }
}

export const updateDexNotifications = (onSocket = true) => {
  return async (dispatch, getState) => {
    const { readNotiNew, t, userAuth } = THIS.props
    await ReduxServices.refreshNoti()
    let notiItems = await DexAPI.getNoti(0, 0, userAuth.createdAt)
    let readNotiLocal = 0
    let setNotiAgain = readNotiNew
    if (notiItems && notiItems.notifications && notiItems.notifications.length > 0) {
      notiItems.notifications.filter(val => {
        let check = !!readNotiNew[`${val._id}`]
        if (check) {
          readNotiLocal++
          setNotiAgain[`${val._id}`] = true
        }
      })
      dispatch(setReadNotiNew(setNotiAgain))
      dispatch(setDexNoti(notiItems))
      dispatch(setUnReadNoti(Number(notiItems.total - readNotiLocal)))
      if (onSocket && notiItems && notiItems.notifications && notiItems.notifications[0]) {
        showNotification(notiItems.notifications[0].title, t)
      }
    }
  }
}

export const updateDataAfterApplyForAirdrop = () => {
  return async (dispatch, getState) => {
    const { internetData, pendingAirdrop, arrTokenData, t } = THIS.props
    if (internetData && pendingAirdrop.isPending && pendingAirdrop.type === PENDING_TYPE.APPLY_AIRDROP) {
      const mainAccount = pendingAirdrop.account
      // waiting transaction
      const txReceipt = await OxObject.awaitTransactionSuccessAsync(pendingAirdrop.lastTxID)
      console.log('updateDataAfterApplyForAirdrop txReceipt: ', txReceipt)
      if (txReceipt && txReceipt.status === 1) { // transaction successfully
        let pendingData = pendingAirdrop.data
        pendingData.contractAddress = txReceipt.contractAddress
        // payment fee
        if (pendingData.paymentType === 'ETH') { // case of payment by ETH
          sendEthTokenTxs(mainAccount.privateKey, pendingData.receiverAddress, pendingData.registrationFee, null, pendingData.gasPrice)
            .then((result) => {
              DexAPI.triggerGetEtherTransactions(mainAccount.address)
              ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, pendingData.receiverAddress, pendingData.registrationFee, result.rawTransaction, null)
              dispatch(setPendingAirdrop({
                account: mainAccount, 
                isPending: true, 
                lastTxID: result.txID,
                data: pendingData,
                type: PENDING_TYPE.AIRDROP_PAYMENT_FEE
              }))
              Observer.emit(OBSERVER_KEY.GET_DATA_AFTER_APPLY_AIRDROP_PAYMENT_FEE)
            }).catch((error) => {
              console.log('sendTxs error: ', error)
              swal({
                width: '250px',
                text: t('SendEtherError'),
                type: 'error',
                showConfirmButton: false
              })
              THIS.setState({ isLoadingExcute: false })
              // update pending status
              pendingAirdrop.isPending = false
              dispatch(setPendingAirdrop(pendingAirdrop))
            })
        } else { // case of payment by HBWALLET token
          let contract = arrTokenData.find(e => e.address.toLowerCase() === HBWALLET)
          if (!contract) {
            contract = {
              address: HBWALLET,
              decimal: 2,
              name: 'HB Wallet Infinity Token',
              symbol: 'HBWALLET'
            }
          }
          sendEthTokenTxs(mainAccount.privateKey, pendingData.receiverAddress, pendingData.registrationFee, contract, pendingData.gasPrice)
            .then((result) => {
              DexAPI.triggerGetEtherTransactions(mainAccount.address)
              ReduxServices.trackingTransaction(mainAccount, result.txID, mainAccount.address, pendingData.receiverAddress, pendingData.registrationFee, result.rawTransaction, contract)
              dispatch(setPendingAirdrop({
                account: mainAccount, 
                isPending: true, 
                lastTxID: result.txID,
                data: pendingData,
                type: PENDING_TYPE.AIRDROP_PAYMENT_FEE
              }))
              Observer.emit(OBSERVER_KEY.GET_DATA_AFTER_APPLY_AIRDROP_PAYMENT_FEE)
            }).catch((error) => {
              console.log('sendTxs error: ', error)
              swal({
                width: '250px',
                text: t('sendTokenNameError', {tokenName: 'HBWALLET'}),
                type: 'error',
                showConfirmButton: false
              })
              THIS.setState({ isLoadingExcute: false })
              // update pending status
              pendingAirdrop.isPending = false
              dispatch(setPendingAirdrop(pendingAirdrop))
            })
        }
      } else { // transaction failed
        THIS.setState({ isLoadingExcute: false })
        // update pending status
        pendingAirdrop.isPending = false
        dispatch(setPendingAirdrop(pendingAirdrop))
        // show popup
        swal({
          width: '250px',
          text: t('transactionFailed'),
          type: 'error',
          showConfirmButton: false
        })
      }
    }
  }
}

export const updateDataAfterApplyForAirdropPaymentFee = () => {
  return async (dispatch, getState) => {
    const { internetData, pendingAirdrop, t } = THIS.props

    if (internetData && pendingAirdrop.isPending && pendingAirdrop.type === PENDING_TYPE.AIRDROP_PAYMENT_FEE) {
      // update status of tracking transanction to pending
      setTimeout(() => {
        ReduxServices.clearTrackingTxs(pendingAirdrop.lastTxID)
      }, 5000)

      // waiting transaction
      const txReceipt = await OxObject.awaitTransactionSuccessAsync(pendingAirdrop.lastTxID)
      console.log('updateDataAfterApplyForAirdropPaymentFee txReceipt: ', txReceipt)
      if (txReceipt && txReceipt.status === 1) { // transaction successfully
        THIS.setState({ isLoadingExcute: false })

        // clear tracking tx
        ReduxServices.clearTrackingTxs(pendingAirdrop.lastTxID, true)

        const pendingData = pendingAirdrop.data
        // show popup
        swal({
          width: '350px',
          title: t('ApplyAirdrop.smartContractCreatedSuccessfully'),
          html: t('ApplyAirdrop.pleaseSendTokenToSmartContract') + `<br/><a id="openExternal">${Settings.server.etherscan.orginUrl}address/${pendingData.contractAddress}</a>`,
          type: 'info',
          showConfirmButton: false,
          onBeforeOpen: () => {
            const content = swal.getContent()
            const $ = content.querySelector.bind(content)
            const openExternal = $('#openExternal')
            openExternal.addEventListener('click', () => {
              openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}address/${pendingData.contractAddress}`)
            })
          }
        })

        // save airdrop into DB
        let airdropData = {
          key: 'airdrop',
          owner: pendingAirdrop.account.address,
          description: pendingData.description,
          short_description: pendingData.title,
          imageLink: pendingData.imageLink,
          imageCard: pendingData.imageLink,
          contractAddress: pendingData.contractAddress,
          erc20: pendingData.address,
          name: pendingData.name,
          symbol: pendingData.symbol,
          decimals: pendingData.decimals,
          totalSupply: pendingData.totalSupply,
          amount: pendingData.amount,
          website: pendingData.website,
          email: pendingData.email,
          enable: true,
          start_time: pendingData.startDate * 1000,
          expire_time: pendingData.endDate * 1000
        }
        await DexAPI.saveAirdrop(airdropData)

        // refresh grab token
        ReduxServices.refreshGrabToken()

        // update pending status
        pendingAirdrop.isPending = false
        dispatch(setPendingAirdrop(pendingAirdrop))

        Observer.emit(OBSERVER_KEY.APPLY_AIRDROP_SUCCESSFULLY)

        const { arrCardData } = getState()

        if (pendingAirdrop.data.paymentType === 'ETH') { // case of payment by ETH
          // store new transaction into DB
          saveTransactionEther(pendingAirdrop.account, txReceipt)
    
          // update transaction history
          await ReduxServices.refreshEtherTxsHistory(pendingAirdrop.account)

          // update transaction history for all account
          await ReduxServices.refreshEtherTxsHistoryAll(arrCardData.filter(card => card.isEnable), false)

          // refresh history
          Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY_ALL)
          Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY)

          // update card balance
          ReduxServices.refreshCardBalance(arrCardData.filter(card => card.isEnable))

          // specify notice message
          let notice = t('Sentnew', {number: formatNumberLeftZero(convertWeiToBalance(txReceipt.value)), Symbol: HBCRYPTO.ETHEREUM, cardName: pendingAirdrop.account.cardName})

          // show notification to notice user
          showNotification(notice, t)
        } else { // case of payment by HBWALLET
          // store new transaction into DB
          saveTransactionToken(pendingAirdrop.account, txReceipt)

          // update transaction history
          const token = {
            address: HBWALLET,
            decimal: 2
          }
          await ReduxServices.refreshTokenTxsHistory(token, pendingAirdrop.account)

          // update transaction history for all account
          await ReduxServices.refreshEtherTxsHistoryAll(arrCardData.filter(card => card.isEnable), false)

          // refresh token history transaction
          Observer.emit(OBSERVER_KEY.REFRESH_TOKEN_HISTORY)
          Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY)
          Observer.emit(OBSERVER_KEY.REFRESH_ETH_HISTORY_ALL)
          
          // update card balance
          ReduxServices.refreshCardBalance(arrCardData.filter(card => card.isEnable))

          // specify notice message
          let notice = t('Sentnew', {number: formatNumberLeftZero(convertWeiToBalance(txReceipt.value, txReceipt.token.decimals.toNumber())), Symbol: txReceipt.token.symbol, cardName: pendingAirdrop.account.cardName})

          // show notification to notice user
          showNotification(notice, t)
        }
      } else { // transaction failed
        THIS.setState({ isLoadingExcute: false })
        // update pending status
        pendingAirdrop.isPending = false
        dispatch(setPendingAirdrop(pendingAirdrop))
        // clear tracking tx
        ReduxServices.clearTrackingTxs()
      }
    }
  }
}

export const fetchScamCoins = () => {
  return async (dispatch, getState) => {
    let scamCoins = await ScamCoins.getScamCoinsList()
    if (scamCoins && scamCoins.length && scamCoins.length > 0) {
      dispatch(setScamCoins(scamCoins))
    }
  }
}

export const goToMarket = () => {
  return async (dispatch, getState) => {
    // Observer.emit(OBSERVER_KEY.GO_TO_MARKET)
    Observer.emit(OBSERVER_KEY.SELECT_TAB_DAPP_MARKET)
  }
}

export const goToDapp = () => {
  return async (dispatch, getState) => {
    // Observer.emit(OBSERVER_KEY.GO_TO_MARKET)
    Observer.emit(OBSERVER_KEY.SELECT_TAB_DAPP)
  }
}

export const fetchNewFeatures = () => {
  return async (dispatch, getState) => {
    const { localeData, readNewFeature } = THIS.props
    let newFeatures = await DexAPI.getNewFeatures()
    if (newFeatures && !newFeatures.error && newFeatures.content && !readNewFeature.includes(newFeatures._id)) {
      THIS.setState({
        newFeatureID: newFeatures._id,
        newFeatures: newFeatures.content[localeData] ? newFeatures.content[localeData] : newFeatures.content['en']
      })
      THIS.refs.modalNewFeatures.show()
    }
  }
}

export const triggerOpenBrowser = (event, data) => {
  return (dispatch) => {
    THIS.props.openBrowserScreen(data)
  }
}

export const openBrowserScreen = (data = null) => {
  return (dispatch, getState) => {
    let allWindows = remote.BrowserWindow.getAllWindows()
    if (allWindows.length >= 2) {
      allWindows[0].focus()
    } else {
      // if (process.platform === 'darwin') {
      newWindow = new remote.BrowserWindow({
        width: APP_SCREEN_SIZE.WIDTH,
        minWidth: APP_SCREEN_SIZE.WIDTH,
        height: APP_SCREEN_SIZE.HEIGHT,
        minHeight: APP_SCREEN_SIZE.HEIGHT,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          webviewTag: true
        },
        title: 'HB WEB3 Browser',
        useContentSize: true,
        x: Math.floor(Math.random() * (+300 - +0)) + +0,
        y: Math.floor(Math.random() * (+300 - +0)) + +0
      })
      // } else {
      //   newWindow = new electron.remote.BrowserWindow({
      //     width: APP_SCREEN_SIZE.WIDTH_WIN,
      //     minWidth: APP_SCREEN_SIZE.WIDTH_WIN,
      //     height: APP_SCREEN_SIZE.HEIGHT_WIN,
      //     minHeight: APP_SCREEN_SIZE.HEIGHT_WIN,
      //     webPreferences: {
      //       webSecurity: false,
      //       nodeIntegration: true,
      //       webviewTag: true
      //     },
      //     title,
      //     x: Math.floor(Math.random() * (+300 - +0)) + +0,
      //     y: Math.floor(Math.random() * (+300 - +0)) + +0
      //   })
      // }

      const currentUrl = remote.getCurrentWindow().getURL()
      let index = currentUrl.indexOf('localhost:3000') + 14
      if (process.env.NODE_ENV === 'production') {
        index = currentUrl.indexOf('build/index.html') + 16
      }
      let rootUrl = currentUrl.substr(0, index)
      newWindow.loadURL(`${rootUrl}#/browser`)
      newWindow.webContents.on('did-finish-load', () => {
        newWindow.show()
        newWindow.focus()
        newWindow.setTitle('HB WEB3 Browser')
        setTimeout(() => {
          triggerSendEventToAllWindow('open-browser-in-same-tab', data)
        }, 2000)
      })
      newWindow.once('ready-to-show', () => {
        newWindow.webContents.session.clearCache()
        newWindow.show()
        newWindow.setTitle('HB WEB3 Browser')
      })
      newWindow.on('closed', () => {
        newWindow = null
      })
    }
  }
}
