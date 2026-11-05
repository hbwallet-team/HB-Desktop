// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import { store, history } from './Backend/Redux/store/configureStore'

import { KEYSTORE } from './Utils/globalConstants'
import { checkLocalStoreToRedux } from './Backend/Redux/lib/reducerConfig'
import * as actions from './Backend/Redux/actions/globalActions'
import { setSagaEtherPrice, setSagaChartEtherPrice, setSagaChartEtherPriceYear, setSagaChartToken, setSagaChartTokenYear, setSagaHBTokens, setSagaRealBoostTokens } from './Backend/Redux/actionSaga/sagaActions'
import init from './Backend/Redux/lib/initState'
import Scene from './Utils/globalRoutes'

import { I18nextProvider } from 'react-i18next'
import registerServiceWorker from './Assets/Lang/registerServiceWorker'
import i18n from './Assets/Lang/i18n'
import { Spin } from 'Frontend/Components/HBLoader'
import Lottie from 'react-lottie'
import Images from 'Assets/Image'

export default class App extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isLoading: true
    }
  }

  componentDidMount = async () => {
    await checkLocalStoreToRedux(store, KEYSTORE.CARD_DATA, actions.setCard, init.cardInit)
    await checkLocalStoreToRedux(store, KEYSTORE.TOKEN_DATA, actions.setToken, init.tokenInit)
    await checkLocalStoreToRedux(store, KEYSTORE.LANGUAGE, actions.setLanguage, init.languageInit)
    await checkLocalStoreToRedux(store, KEYSTORE.PINCODE, actions.setPINcode, init.PINInit)
    await checkLocalStoreToRedux(store, KEYSTORE.CURRENCY, actions.setCurrency, init.currencyInit)
    await checkLocalStoreToRedux(store, KEYSTORE.ADDRESS_BOOK, actions.setAddressBook, init.accountBook)
    await checkLocalStoreToRedux(store, KEYSTORE.ARR_PAYMENT, actions.setArrPayment, init.payment)
    await checkLocalStoreToRedux(store, KEYSTORE.GAS_STATION, actions.setGasStation, init.gasStation)
    await checkLocalStoreToRedux(store, KEYSTORE.AIR_DROP, actions.setAirdrop, init.arrAirdrop)
    await checkLocalStoreToRedux(store, KEYSTORE.TOKEN_SALE, actions.setTokenSale, init.arrTokenSale)
    await checkLocalStoreToRedux(store, KEYSTORE.UN_READ_GRAB, actions.setUnReadGrab, init.unReadGrab)
    await checkLocalStoreToRedux(store, KEYSTORE.UN_READ_NOTI, actions.setUnReadNoti, init.unReadNoti)
    await checkLocalStoreToRedux(store, KEYSTORE.DEX_NOTI, actions.setDexNoti, init.dexNoti)
    await checkLocalStoreToRedux(store, KEYSTORE.READ_GRAB, actions.setReadGrab, init.readGrab)
    await checkLocalStoreToRedux(store, KEYSTORE.READ_NOTI, actions.setReadNoti, init.readNoti)
    await checkLocalStoreToRedux(store, KEYSTORE.READ_NOTI_NEW, actions.setReadNotiNew, init.readNotiNew)
    await checkLocalStoreToRedux(store, KEYSTORE.PENDING_TX, actions.setPendingTx, init.pendingTx)
    await checkLocalStoreToRedux(store, KEYSTORE.DEX_TOKEN_LIST, actions.setDexTokenList, init.dexTokenList)
    await checkLocalStoreToRedux(store, KEYSTORE.DEX_TOKEN_FAVORITE, actions.setDexTokenFavorite, init.dexTokenFavorite)
    await checkLocalStoreToRedux(store, KEYSTORE.DEX_TOKEN_SUMMARY, actions.setDexTokenSummary, init.dexTokenSummary)
    await checkLocalStoreToRedux(store, KEYSTORE.ETHER_PRICE, setSagaEtherPrice, init.etherPrice)
    await checkLocalStoreToRedux(store, KEYSTORE.HB_TOKENS, setSagaHBTokens, init.arrHBTokens)
    await checkLocalStoreToRedux(store, KEYSTORE.REALBOOST_TOKENS, setSagaRealBoostTokens, init.arrHBTokens)
    await checkLocalStoreToRedux(store, KEYSTORE.USER_AUTH, actions.setUserAuth, init.userAuth)
    await checkLocalStoreToRedux(store, KEYSTORE.DAPPS, actions.setDapps, init.arrDapps)
    await checkLocalStoreToRedux(store, KEYSTORE.DAPP_FAVORITES, actions.setDappFavorite, init.dappFavorites)
    await checkLocalStoreToRedux(store, KEYSTORE.DAPP_FAVORITES_OUT_SIDE, actions.setDappFavoriteOutSide, init.dappFavoritesOutSide)
    await checkLocalStoreToRedux(store, KEYSTORE.DAPP_ASSETS, actions.setDappAssets, init.arrDappAssets)
    await checkLocalStoreToRedux(store, KEYSTORE.DAPP_UNBLOCK, actions.setDappUnblock, init.arrDappUnblock)
    await checkLocalStoreToRedux(store, KEYSTORE.DAPP_MEDIA_NEWS, actions.setDappMediaNews, init.arrDappMediaNews)
    await checkLocalStoreToRedux(store, KEYSTORE.DAPP_REQUEST, actions.setDappRequest, init.arrDappRequest)
    await checkLocalStoreToRedux(store, KEYSTORE.SENDING_PROCESS, actions.setSendingProcess, init.trackingSendTxs)
    await checkLocalStoreToRedux(store, KEYSTORE.ADVANCED_WALLET_HISTORY, actions.setadvancedWalletHistory, init.advancedWalletHistory)
    await checkLocalStoreToRedux(store, KEYSTORE.CUSTOM_TOKEN, actions.setCustomToken, init.arrCustomToken)
    await checkLocalStoreToRedux(store, KEYSTORE.PENDING_AIRDROP, actions.setPendingAirdrop, init.pendingAirdrop)
    await checkLocalStoreToRedux(store, KEYSTORE.COUNT_WARNING, actions.setCountWarning, init.countWarning)
    await checkLocalStoreToRedux(store, KEYSTORE.UN_READ_GAME_ITEM_SYNC, actions.setUnReadGameItemSync, init.unReadGameItemSync)
    await checkLocalStoreToRedux(store, KEYSTORE.SETTING_URLS, actions.setSettingUrls, init.settingUrls)
    await checkLocalStoreToRedux(store, KEYSTORE.ACCOUNT_HISTORY_ALL, actions.setEtherHistoryAll, init.accountHistoryAllInit)
    await checkLocalStoreToRedux(store, KEYSTORE.ACCOUNT_HISTORY, actions.setEtherHistory, init.accountHistoryInit)
    await checkLocalStoreToRedux(store, KEYSTORE.TOKEN_HISTORY, actions.setTokenHistory, init.tokenHistoryInit)
    await checkLocalStoreToRedux(store, KEYSTORE.TOKEN_HISTORY_ALL, actions.setTokenHistoryAll, init.tokenHistoryInitAll)
    await checkLocalStoreToRedux(store, KEYSTORE.HB_CONTRACT, actions.setHBContract, init.HBContractInitAll)
    await checkLocalStoreToRedux(store, KEYSTORE.CHART_ETHER_PRICE, setSagaChartEtherPrice, init.arrChartEtherPrice)
    await checkLocalStoreToRedux(store, KEYSTORE.CHART_ETHER_PRICE_YEAR, setSagaChartEtherPriceYear, init.arrChartEtherPriceYear)
    await checkLocalStoreToRedux(store, KEYSTORE.CHART_TOKEN_ALL, setSagaChartToken, init.arrChartTokenPriceAll)
    await checkLocalStoreToRedux(store, KEYSTORE.CHART_TOKEN_ALL_YEAR, setSagaChartTokenYear, init.arrChartTokenPriceAllYear)
    await checkLocalStoreToRedux(store, KEYSTORE.READ_NEW_FEATURE, actions.setReadNewFeature, init.readNewFeature)
    await checkLocalStoreToRedux(store, KEYSTORE.SCREEN_CONFIG, actions.setScreenConfig, init.screenConfig)
    await checkLocalStoreToRedux(store, KEYSTORE.KYBER_SWAP_TOKEN, actions.setKyberSwapToken, init.arrKyberSwapToken)
    await checkLocalStoreToRedux(store, KEYSTORE.DAPP_ASSET_HISTORY, actions.setDappAssetHistory, init.arrDappAssetHistory)
    await checkLocalStoreToRedux(store, KEYSTORE.COMPOUND_RATE, actions.setCompoundRate, init.arrCompoundRate)
    await checkLocalStoreToRedux(store, KEYSTORE.CODE_SCAN, actions.setCodeScan, init.codeScan)
    
    setTimeout(() => {
      this.setState({
        isLoading: false
      })
    }, 1000)
  }
  render () {
    const { isLoading } = this.state
    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: Images.dappsLoader,
      resizeMode: 'contain'
    }
    const lottieStyles = {
      position: 'relative',
      top: '50%',
      marginTop: '-100px'
    }
    return (
      isLoading 
        ? <Lottie
          options={defaultOptions}
          width={200}
          height={200}
          style={lottieStyles}
        />
        : <Provider store={store}>
          <ConnectedRouter history={history}>
            <div><Scene/></div>
          </ConnectedRouter>
        </Provider>
    )
  }
}

ReactDOM.render(<I18nextProvider i18n={ i18n() }>
  <App />
</I18nextProvider>, document.getElementById('root'))
registerServiceWorker()
