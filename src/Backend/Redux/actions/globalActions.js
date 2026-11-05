import key from '../lib/constants'
import { KEYSTORE } from '../../../Utils/globalConstants'
import { checkStore } from '../lib/reducerConfig'
import { EncodeData } from 'Utils/globalFunction'
import Settings from 'Backend/settings'

/**
 * NAME: GLOBAL ACTIONS
 * CREATOR: KHIEM
 *  Set actions for GLOBAL DATA IN REDUX
 */

// SET DATA for Card Wallet
export function setCard (card) {
  let cards = []
  if (card.length > 0) {
    card.forEach(c => {
      let cardTemp = Object.assign({}, c)
      cardTemp.mnemonic = EncodeData(c.mnemonic, Settings.secretKey)
      cardTemp.privateKey = EncodeData(c.privateKey, Settings.secretKey)
      cards.push(cardTemp)
    })
  }
  checkStore(cards, KEYSTORE.CARD_DATA)
  return {
    type: key.SET_CARD,
    payload: card
  }
}

// SET DATA for Token
export function setToken (token) {
  checkStore(token, KEYSTORE.TOKEN_DATA)
  return {
    type: key.SET_TOKEN,
    payload: token
  }
}

// SET DATA for Account
export function setSendAccount (account) {
  return {
    type: key.SET_ACCOUNT,
    payload: account
  }
}

// SET DATA for PINcode
export function setPINcode (pinCode) {
  let pin = EncodeData(pinCode, Settings.secretKey)
  checkStore(pin, KEYSTORE.PINCODE)
  return {
    type: key.SET_PINCODE,
    payload: pinCode
  }
}

// SET DATA for Currency
export function setCurrency (currency) {
  checkStore(currency, KEYSTORE.CURRENCY)
  return {
    type: key.SET_CURRENCY,
    payload: currency
  }
}

// SET DATA for Account History
export function setEtherHistory (arrAccountHistoryData) {
  checkStore(arrAccountHistoryData, KEYSTORE.ACCOUNT_HISTORY)
  return {
    type: key.SET_ACCOUNT_HISTORY,
    payload: arrAccountHistoryData
  }
}

// SET DATA for all Account History
export function setEtherHistoryAll (arrAccountHistoryDataAll) {
  checkStore(arrAccountHistoryDataAll, KEYSTORE.ACCOUNT_HISTORY_ALL)
  return {
    type: key.SET_ACCOUNT_HISTORY_ALL,
    payload: arrAccountHistoryDataAll
  }
}

// SET DATA for Token History
export function setTokenHistory (arrTokenHistoryData) {
  checkStore(arrTokenHistoryData, KEYSTORE.TOKEN_HISTORY)
  return {
    type: key.SET_TOKEN_HISTORY,
    payload: arrTokenHistoryData
  }
}

export function setTokenHistoryAll (arrTokenHistoryDataAll) {
  checkStore(arrTokenHistoryDataAll, KEYSTORE.TOKEN_HISTORY_ALL)
  return {
    type: key.SET_TOKEN_HISTORY_ALL,
    payload: arrTokenHistoryDataAll
  }
}

export function setHBContract (arrHBContract) {
  checkStore(arrHBContract, KEYSTORE.HB_CONTRACT)
  return {
    type: key.SET_HB_CONTRACT,
    payload: arrHBContract
  }
}

// SET Language for application
export function setLanguage (language) {
  checkStore(language, KEYSTORE.LANGUAGE)
  return {
    type: key.SET_LANGUAGE,
    payload: language
  }
}

// Set address book
export function setAddressBook (account) {
  checkStore(account, KEYSTORE.ADDRESS_BOOK)
  return {
    type: key.SET_ADDRESS_BOOK,
    payload: account
  }
}

// Set arr payment
export function setArrPayment (arrPayment) {
  checkStore(arrPayment, KEYSTORE.ARR_PAYMENT)
  return {
    type: key.SET_ARR_PAYMENT,
    payload: arrPayment
  }
}

// Set gas station
export function setGasStation (gasStation) {
  checkStore(gasStation, KEYSTORE.GAS_STATION)
  return {
    type: key.SET_GAS_STATION,
    payload: gasStation
  }
}

export function setAirdrop (arrAirdrop) {
  checkStore(arrAirdrop, KEYSTORE.AIR_DROP)
  return {
    type: key.SET_AIR_DROP,
    payload: arrAirdrop
  }
}

export function setTokenSale (arrTokenSale) {
  checkStore(arrTokenSale, KEYSTORE.TOKEN_SALE)
  return {
    type: key.SET_TOKEN_SALE,
    payload: arrTokenSale
  }
}

export function setUnReadGrab (unReadGrab) {
  checkStore(unReadGrab, KEYSTORE.UN_READ_GRAB)
  return {
    type: key.SET_UN_READ_GRAB,
    payload: unReadGrab
  }
}

export function setDexNoti (dexNoti) {
  checkStore(dexNoti, KEYSTORE.DEX_NOTI)
  return {
    type: key.SET_DEX_NOTI,
    payload: dexNoti
  }
}

export function setUnReadNoti (unReadNoti) {
  checkStore(unReadNoti, KEYSTORE.UN_READ_NOTI)
  return {
    type: key.SET_UN_READ_NOTI,
    payload: unReadNoti
  }
}

export function setReadGrab (readGrab) {
  checkStore(readGrab, KEYSTORE.READ_GRAB)
  return {
    type: key.SET_READ_GRAB,
    payload: readGrab
  }
}

export function setReadNoti (readNoti) {
  checkStore(readNoti, KEYSTORE.READ_NOTI)
  return {
    type: key.SET_READ_NOTI,
    payload: readNoti
  }
}

export function setReadNotiNew (readNotiNew) {
  checkStore(readNotiNew, KEYSTORE.READ_NOTI_NEW)
  return {
    type: key.SET_READ_NOTI_NEW,
    payload: readNotiNew
  }
}

export function setPendingTx (pendingTx) {
  checkStore(pendingTx, KEYSTORE.PENDING_TX)
  return {
    type: key.SET_PENDING_TX,
    payload: pendingTx
  }
}

export function setOrderBookSell (orderBookSell) {
  checkStore(orderBookSell, KEYSTORE.ORDER_BOOK_SELL)
  return {
    type: key.SET_ORDER_BOOK_SELL,
    payload: orderBookSell
  }
}

export function setOrderBookBuy (orderBookBuy) {
  checkStore(orderBookBuy, KEYSTORE.ORDER_BOOK_BUY)
  return {
    type: key.SET_ORDER_BOOK_BUY,
    payload: orderBookBuy
  }
}

export function setMyCloseOrder (myCloseOrder) {
  checkStore(myCloseOrder, KEYSTORE.MY_CLOSE_ORDER)
  return {
    type: key.SET_MY_CLOSE_ORDER,
    payload: myCloseOrder
  }
}

export function setMyOpenOrder (myOpenOrder) {
  checkStore(myOpenOrder, KEYSTORE.MY_OPEN_ORDER)
  return {
    type: key.SET_MY_OPEN_ORDER,
    payload: myOpenOrder
  }
}

export function setOrderHistory (orderHistory) {
  checkStore(orderHistory, KEYSTORE.ORDER_HISTORY)
  return {
    type: key.SET_ORDER_HISTORY,
    payload: orderHistory
  }
}
export function setDexData (dexData) {
  checkStore(dexData, KEYSTORE.DEX_DATA)
  return {
    type: key.SET_DEX_DATA,
    payload: dexData
  }
}
export function setDexTokenList (dexTokenList) {
  checkStore(dexTokenList, KEYSTORE.DEX_TOKEN_LIST)
  return {
    type: key.SET_DEX_TOKEN_LIST,
    payload: dexTokenList
  }
}
export function setDexTokenFavorite (dexTokenFavorite) {
  checkStore(dexTokenFavorite, KEYSTORE.DEX_TOKEN_FAVORITE)
  return {
    type: key.SET_DEX_TOKEN_FAVORITE,
    payload: dexTokenFavorite
  }
}
export function setDexCandleList (dexCandleList) {
  return {
    type: key.SET_DEX_CANDLE_LIST,
    payload: dexCandleList
  }
}
export function setDexFavorite (dexFavorite) {
  return {
    type: key.SET_DEX_FAVORITE,
    payload: dexFavorite
  }
}
export function setDexAnnounce (dexAnnounce) {
  return {
    type: key.SET_DEX_ANNOUNCE,
    payload: dexAnnounce
  }
}
export function setAdvancedWallet (advancedWallet) {
  return {
    type: key.SET_ADVANCED_WALLET,
    payload: advancedWallet
  }
}
export function setadvancedWalletHistory (advancedWalletHistory) {
  checkStore(advancedWalletHistory, KEYSTORE.ADVANCED_WALLET_HISTORY)
  return {
    type: key.SET_ADVANCED_WALLET_HISTORY,
    payload: advancedWalletHistory
  }
}
export function setDexTokenSummary (dexTokenSummary) {
  checkStore(dexTokenSummary, KEYSTORE.DEX_TOKEN_SUMMARY)
  return {
    type: key.SET_DEX_TOKEN_SUMMARY,
    payload: dexTokenSummary
  }
}
export function setDexSelectedPair (dexSelectedPair) {
  return {
    type: key.SET_DEX_SELECTED_PAIR,
    payload: dexSelectedPair
  }
}
export function setListCoin (arrListCoin) {
  return {
    type: key.SET_LIST_COIN,
    payload: arrListCoin
  }
}
export function setDexLastTransaction (dexLastTransaction) {
  return {
    type: key.SET_DEX_LAST_TRANSACTION,
    payload: dexLastTransaction
  }
}
export function setDexNewOrder (dexNewOrder) {
  return {
    type: key.SET_DEX_NEW_ORDER,
    payload: dexNewOrder
  }
}
export function setDexNewSummary (dexNewSummary) {
  return {
    type: key.SET_DEX_NEW_SUMMARY,
    payload: dexNewSummary
  }
}
export function setUserAuth (userAuth) {
  checkStore(userAuth, KEYSTORE.USER_AUTH)
  return {
    type: key.SET_USER_AUTH,
    payload: userAuth
  }
}
export function setSettingUrls (settingUrls) {
  checkStore(settingUrls, KEYSTORE.SETTING_URLS)
  return {
    type: key.SET_SETTING_URLS,
    payload: settingUrls
  }
}
export function setDapps (arrDapps) {
  checkStore(arrDapps, KEYSTORE.DAPPS)
  return {
    type: key.SET_DAPPS,
    payload: arrDapps
  }
}
export function setDappAssets (arrDappAssets) {
  checkStore(arrDappAssets, KEYSTORE.DAPP_ASSETS)
  return {
    type: key.SET_DAPP_ASSETS,
    payload: arrDappAssets
  }
}
export function setDappMarket (arrDappMarket) {
  return {
    type: key.SET_DAPP_MARKET,
    payload: arrDappMarket
  }
}
export function setDappUnblock (arrDappUnblock) {
  checkStore(arrDappUnblock, KEYSTORE.DAPP_UNBLOCK)
  return {
    type: key.SET_DAPP_UNBLOCK,
    payload: arrDappUnblock
  }
}
export function setDappMediaNews (arrDappMediaNews) {
  checkStore(arrDappMediaNews, KEYSTORE.DAPP_MEDIA_NEWS)
  return {
    type: key.SET_DAPP_MEDIA_NEWS,
    payload: arrDappMediaNews
  }
}
export function setDappRequest (arrDappRequest) {
  checkStore(arrDappRequest, KEYSTORE.DAPP_REQUEST)
  return {
    type: key.SET_DAPP_REQUEST,
    payload: arrDappRequest
  }
}
export function setDappFavorite (dappFavorites) {
  checkStore(dappFavorites, KEYSTORE.DAPP_FAVORITES)
  return {
    type: key.SET_DAPP_FAVORITE,
    payload: dappFavorites
  }
}
export function setDappFavoriteOutSide (dappFavoritesOutSide) {
  checkStore(dappFavoritesOutSide, KEYSTORE.DAPP_FAVORITES_OUT_SIDE)
  return {
    type: key.SET_DAPP_FAVORITE_OUT_SIDE,
    payload: dappFavoritesOutSide
  }
}
export function setSendingProcess (trackingSendTxs) {
  checkStore(trackingSendTxs, KEYSTORE.SENDING_PROCESS)
  return {
    type: key.SET_SENDING_PROCESS,
    payload: trackingSendTxs
  }
}
export function setCustomToken (arrCustomToken) {
  checkStore(arrCustomToken, KEYSTORE.CUSTOM_TOKEN)
  return {
    type: key.SET_CUSTOM_TOKEN,
    payload: arrCustomToken
  }
}
export function setPendingAirdrop (pendingAirdrop) {
  checkStore(pendingAirdrop, KEYSTORE.PENDING_AIRDROP)
  return {
    type: key.SET_PENDING_AIRDROP,
    payload: pendingAirdrop
  }
}
export function setCountWarning (countWarning) {
  checkStore(countWarning, KEYSTORE.COUNT_WARNING)
  return {
    type: key.SET_COUNT_WARNING,
    payload: countWarning
  }
}
export function setUnReadGameItemSync (unReadGameItemSync) {
  checkStore(unReadGameItemSync, KEYSTORE.UN_READ_GAME_ITEM_SYNC)
  return {
    type: key.SET_UN_READ_GAME_ITEM_SYNC,
    payload: unReadGameItemSync
  }
}
export function setScamCoins (arrScamCoins) {
  return {
    type: key.SET_SCAM_COINS,
    payload: arrScamCoins
  }
}

export function setReadNewFeature (readNewFeature) {
  checkStore(readNewFeature, KEYSTORE.READ_NEW_FEATURE)
  return {
    type: key.SET_READ_NEW_FEATURE,
    payload: readNewFeature
  }
}

export function setScreenConfig (screenConfig) {
  checkStore(screenConfig, KEYSTORE.SCREEN_CONFIG)
  return {
    type: key.SET_SCREEN_CONFIG,
    payload: screenConfig
  }
}

export function setKyberSwapToken (arrKyberSwapToken) {
  checkStore(arrKyberSwapToken, KEYSTORE.KYBER_SWAP_TOKEN)
  return {
    type: key.SET_KYBER_SWAP_TOKEN,
    payload: arrKyberSwapToken
  }
}

export function setDappAssetHistory (arrDappAssetHistory) {
  checkStore(arrDappAssetHistory, KEYSTORE.DAPP_ASSET_HISTORY)
  return {
    type: key.SET_DAPP_ASSET_HISTORY,
    payload: arrDappAssetHistory
  }
}

export function setCompoundRate (arrCompoundRate) {
  checkStore(arrCompoundRate, KEYSTORE.COMPOUND_RATE)
  return {
    type: key.SET_COMPOUND_RATE,
    payload: arrCompoundRate
  }
}

export function setCodeScan (codeScan) {
  checkStore(codeScan, KEYSTORE.CODE_SCAN)
  return {
    type: key.SET_CODE_SCAN,
    payload: codeScan
  }
}
