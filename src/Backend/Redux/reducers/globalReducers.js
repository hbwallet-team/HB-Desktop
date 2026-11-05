import createReducer from '../lib/reducerConfig'
import key from '../lib/constants'
import init from '../lib/initState'

// multi language
/**
 * NAME: GLOBAL REDUCERS
 * CREATOR: KHIEM
 *  Set reducers for GLOBAL DATA IN REDUX
 */

// SET REDUCER for Card Wallet
export const arrCardData = createReducer(init.cardInit, {
  [key.SET_CARD] (state, action) {
    return action.payload
  }
})

// SET REDUCER for Token
export const arrTokenData = createReducer(init.tokenInit, {
  [key.SET_TOKEN] (state, action) {
    return action.payload
  }
})

// SET REDUCER for Account
export const arrSendAccountData = createReducer(init.accountInit, {
  [key.SET_ACCOUNT] (state, action) {
    return action.payload
  }
})

// SET REDUCER for PINcode
export const arrPinCodeData = createReducer(init.PINInit, {
  [key.SET_PINCODE] (state, action) {
    return action.payload
  }
})

// SET REDUCER for Currency
export const arrCurrencyData = createReducer(init.currencyInit, {
  [key.SET_CURRENCY] (state, action) {
    return action.payload
  }
})

// SET REDUCER for Account History
export const arrAccountHistoryData = createReducer(init.accountHistoryInit, {
  [key.SET_ACCOUNT_HISTORY] (state, action) {
    return action.payload
  }
})

export const arrAccountHistoryDataAll = createReducer(init.accountHistoryInit, {
  [key.SET_ACCOUNT_HISTORY_ALL] (state, action) {
    return action.payload
  }
})

// SET REDUCER for Account History
export const arrTokenHistoryData = createReducer(init.tokenHistoryInit, {
  [key.SET_TOKEN_HISTORY] (state, action) {
    return action.payload
  }
})

export const arrTokenHistoryDataAll = createReducer(init.tokenHistoryInitAll, {
  [key.SET_TOKEN_HISTORY_ALL] (state, action) {
    return action.payload
  }
})

export const arrHBContract = createReducer(init.HBContractInitAll, {
  [key.SET_HB_CONTRACT] (state, action) {
    return action.payload
  }
})

// SET REDUCER for Language
export const localeData = createReducer(init.languageInit, {
  [key.SET_LANGUAGE] (state, action) {
    return action.payload
  }
})

// Set Address book
export const arrAddressBook = createReducer(init.accountBook, {
  [key.SET_ADDRESS_BOOK] (state, action) {
    return action.payload
  }
})

// Set arr payment
export const arrPayment = createReducer(init.payment, {
  [key.SET_ARR_PAYMENT] (state, action) {
    return action.payload
  }
})

// Set gas station
export const gasStation = createReducer(init.gasStation, {
  [key.SET_GAS_STATION] (state, action) {
    return action.payload
  }
})

// Set gas station
export const arrAirdrop = createReducer(init.arrAirdrop, {
  [key.SET_AIR_DROP] (state, action) {
    return action.payload
  }
})

// Set gas station
export const arrTokenSale = createReducer(init.arrTokenSale, {
  [key.SET_TOKEN_SALE] (state, action) {
    return action.payload
  }
})

export const unReadGrab = createReducer(init.unReadGrab, {
  [key.SET_UN_READ_GRAB] (state, action) {
    return action.payload
  }
})

export const unReadNoti = createReducer(init.unReadNoti, {
  [key.SET_UN_READ_NOTI] (state, action) {
    return action.payload
  }
})

export const dexNoti = createReducer(init.dexNoti, {
  [key.SET_DEX_NOTI] (state, action) {
    return action.payload
  }
})

export const readGrab = createReducer(init.readGrab, {
  [key.SET_READ_GRAB] (state, action) {
    return action.payload
  }
})

export const readNoti = createReducer(init.readNoti, {
  [key.SET_READ_NOTI] (state, action) {
    return action.payload
  }
})

export const readNotiNew = createReducer(init.readNotiNew, {
  [key.SET_READ_NOTI_NEW] (state, action) {
    return action.payload
  }
})

export const pendingTx = createReducer(init.pendingTx, {
  [key.SET_PENDING_TX] (state, action) {
    return action.payload
  }
})

export const orderBookSell = createReducer(init.orderBookSell, {
  [key.SET_ORDER_BOOK_SELL] (state, action) {
    return action.payload
  }
})
export const orderBookBuy = createReducer(init.orderBookBuy, {
  [key.SET_ORDER_BOOK_BUY] (state, action) {
    return action.payload
  }
})
export const myCloseOrder = createReducer(init.myCloseOrder, {
  [key.SET_MY_CLOSE_ORDER] (state, action) {
    return action.payload
  }
})
export const myOpenOrder = createReducer(init.myOpenOrder, {
  [key.SET_MY_OPEN_ORDER] (state, action) {
    return action.payload
  }
})
export const orderHistory = createReducer(init.orderHistory, {
  [key.SET_ORDER_HISTORY] (state, action) {
    return action.payload
  }
})
export const dexData = createReducer(init.dexData, {
  [key.SET_DEX_DATA] (state, action) {
    return action.payload
  }
})
export const dexTokenList = createReducer(init.dexTokenList, {
  [key.SET_DEX_TOKEN_LIST] (state, action) {
    return action.payload
  }
})
export const dexTokenFavorite = createReducer(init.dexTokenFavorite, {
  [key.SET_DEX_TOKEN_FAVORITE] (state, action) {
    return action.payload
  }
})
export const dexCandleList = createReducer(init.dexCandleList, {
  [key.SET_DEX_CANDLE_LIST] (state, action) {
    return action.payload
  }
})
export const dexFavorite = createReducer(init.dexFavorite, {
  [key.SET_DEX_FAVORITE] (state, action) {
    return action.payload
  }
})
export const dexAnnounce = createReducer(init.dexAnnounce, {
  [key.SET_DEX_ANNOUNCE] (state, action) {
    return action.payload
  }
})
export const advancedWallet = createReducer(init.advancedWallet, {
  [key.SET_ADVANCED_WALLET] (state, action) {
    return action.payload
  }
})
export const advancedWalletHistory = createReducer(init.advancedWalletHistory, {
  [key.SET_ADVANCED_WALLET_HISTORY] (state, action) {
    return action.payload
  }
})
export const dexTokenSummary = createReducer(init.dexTokenSummary, {
  [key.SET_DEX_TOKEN_SUMMARY] (state, action) {
    return action.payload
  }
})
export const dexSelectedPair = createReducer(init.dexSelectedPair, {
  [key.SET_DEX_SELECTED_PAIR] (state, action) {
    return action.payload
  }
})
export const arrListCoin = createReducer(init.arrListCoin, {
  [key.SET_LIST_COIN] (state, action) {
    return action.payload
  }
})
export const dexLastTransaction = createReducer(init.dexLastTransaction, {
  [key.SET_DEX_LAST_TRANSACTION] (state, action) {
    return action.payload
  }
})
export const dexNewOrder = createReducer(init.dexNewOrder, {
  [key.SET_DEX_NEW_ORDER] (state, action) {
    return action.payload
  }
})
export const dexNewSummary = createReducer(init.dexNewSummary, {
  [key.SET_DEX_NEW_SUMMARY] (state, action) {
    return action.payload
  }
})
// SET REDUCER FOR USER AUTHENTICATION
export const userAuth = createReducer(init.userAuth, {
  [key.SET_USER_AUTH] (state, action) {
    return action.payload
  }
})

export const settingUrls = createReducer(init.settingUrls, {
  [key.SET_SETTING_URLS] (state, action) {
    return action.payload
  }
})
export const arrDapps = createReducer(init.arrDapps, {
  [key.SET_DAPPS] (state, action) {
    return action.payload
  }
})
export const arrDappAssets = createReducer(init.arrDappAssets, {
  [key.SET_DAPP_ASSETS] (state, action) {
    return action.payload
  }
})
export const arrDappMarket = createReducer(init.arrDappMarket, {
  [key.SET_DAPP_MARKET] (state, action) {
    return action.payload
  }
})
export const arrDappUnblock = createReducer(init.arrDappUnblock, {
  [key.SET_DAPP_UNBLOCK] (state, action) {
    return action.payload
  }
})
export const arrDappMediaNews = createReducer(init.arrDappMediaNews, {
  [key.SET_DAPP_MEDIA_NEWS] (state, action) {
    return action.payload
  }
})
export const arrDappRequest = createReducer(init.arrDappRequest, {
  [key.SET_DAPP_REQUEST] (state, action) {
    return action.payload
  }
})
export const dappFavorites = createReducer(init.dappFavorites, {
  [key.SET_DAPP_FAVORITE] (state, action) {
    return action.payload
  }
})
export const dappFavoritesOutSide = createReducer(init.dappFavoritesOutSide, {
  [key.SET_DAPP_FAVORITE_OUT_SIDE] (state, action) {
    return action.payload
  }
})
export const trackingSendTxs = createReducer(init.trackingSendTxs, {
  [key.SET_SENDING_PROCESS] (state, action) {
    return action.payload
  }
})
export const arrCustomToken = createReducer(init.arrCustomToken, {
  [key.SET_CUSTOM_TOKEN] (state, action) {
    return action.payload
  }
})
export const pendingAirdrop = createReducer(init.pendingAirdrop, {
  [key.SET_PENDING_AIRDROP] (state, action) {
    return action.payload
  }
})
export const countWarning = createReducer(init.countWarning, {
  [key.SET_COUNT_WARNING] (state, action) {
    return action.payload
  }
})
export const unReadGameItemSync = createReducer(init.unReadGameItemSync, {
  [key.SET_UN_READ_GAME_ITEM_SYNC] (state, action) {
    return action.payload
  }
})
export const arrScamCoins = createReducer(init.arrScamCoins, {
  [key.SET_SCAM_COINS] (state, action) {
    return action.payload
  }
})
export const etherHistoryAll = createReducer(init.etherHistoryAll, {
  [key.SET_ACCOUNT_HISTORY_ALL] (state, action) {
    return action.payload
  }
})
export const readNewFeature = createReducer(init.readNewFeature, {
  [key.SET_READ_NEW_FEATURE] (state, action) {
    return action.payload
  }
})
export const screenConfig = createReducer(init.screenConfig, {
  [key.SET_SCREEN_CONFIG] (state, action) {
    return action.payload
  }
})
export const arrKyberSwapToken = createReducer(init.arrKyberSwapToken, {
  [key.SET_KYBER_SWAP_TOKEN] (state, action) {
    return action.payload
  }
})
export const arrDappAssetHistory = createReducer(init.arrDappAssetHistory, {
  [key.SET_DAPP_ASSET_HISTORY] (state, action) {
    return action.payload
  }
})
export const arrCompoundRate = createReducer(init.arrCompoundRate, {
  [key.SET_COMPOUND_RATE] (state, action) {
    return action.payload
  }
})
export const codeScan = createReducer(init.codeScan, {
  [key.SET_CODE_SCAN] (state, action) {
    return action.payload
  }
})
