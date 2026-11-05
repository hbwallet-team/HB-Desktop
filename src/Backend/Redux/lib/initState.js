
var initState = {
  // Global Reducers
  PINInit: '',
  currencyInit: 'USD',
  cardInit: [],
  accountBook: [],
  payment: [],
  tokenInit: [],
  accountInit: [],
  // Main Reducers
  internetInit: true,
  mnemonicInit: '',
  qrCodeInit: '',
  accountModalInit: '',
  accountInfoInit: '',
  tokenTopInit: [],
  tokenBottomInit: [],
  messageInit: '',
  accountHistoryInit: {
    isLoading: true,
    isFirstLoad: true,
    datas: []
  },
  accountHistoryAllInit: {
    isLoading: true,
    isFirstLoad: true,
    datas: [],
    cardsTxs: {}
  },
  tokenHistoryInit: {
    isLoading: false,
    isFirstLoad: true,
    datas: []
  },
  tokenHistoryInitAll: {
    isLoading: false,
    isFirstLoad: true,
    datas: [],
    cardsTxs: {}
  },
  HBContractInitAll: [],
  arrChartTokenSingle: {
    isLoading: false,
    datas: []
  },
  arrChartTokenSingleYear: {
    isLoading: false,
    datas: []
  },
  sendingValueInit: [],
  sendingTokenInit: [],
  languageInit: 'en',
  isPassPhraseInit: false,
  pushNotificationInit: '',
  sendingStatusInit: [],
  selectedCardIndexInit: '',
  oldWebsocketInit: null,
  oldTimerSocketInit: null,
  // Saga variable init
  arrTotalBalanceInit: [{ isLoadingTotalBalance: false,
    firstCrypto: '.',
    decimalCrypto: '..',
    firstFiat: '.',
    decimalFiat: '..' }],
  arrTotalBalanceLoadingInit: [{ isLoadingTotalBalance: true,
    firstCrypto: '.',
    decimalCrypto: '..',
    firstFiat: '.',
    decimalFiat: '..' }],
  arrCardBalanceInit: [{ isLoadingCardBalance: false,
    firstCrypto: '.',
    decimalCrypto: '..',
    firstFiat: '.',
    decimalFiat: '..',
    fiatConvert: '...',
    cardIndex: 0,
    pageIndex: 0,
    arrTokenItem: undefined }],
  arrCardBalanceLoadingInit: [{ isLoadingCardBalance: true,
    firstCrypto: '.',
    decimalCrypto: '..',
    firstFiat: '.',
    decimalFiat: '..',
    fiatConvert: '...',
    cardIndex: 0,
    pageIndex: 0,
    arrTokenItem: undefined }],
  arrHistoryTxsInit: [{
    isLoadingHistory: false,
    arrHistoryTxs: []
  }],
  arrHistoryTxsLoadingInit: [{
    isLoadingHistory: true,
    arrHistoryTxs: []
  }],
  arrSendProcessInit: [],
  arrSendProcessLoadingInit: [],
  arrTokenData: [],
  isResetView: false,
  arrChartEtherPrice: {
    isLoading: false,
    isFirstLoad: true,
    datas: []
  },
  arrChartEtherPriceYear: {
    isLoading: false,
    isFirstLoad: true,
    datas: []
  },
  arrChartTokenPrice: {
    isLoading: false,
    isFirstLoad: true,
    datas: []
  },
  arrChartTokenPriceYear: {
    isLoading: false,
    isFirstLoad: true,
    datas: []
  },
  arrChartTokenPriceAll: {
    isLoading: true,
    isFirstLoad: true,
    datas: []
  },
  arrChartTokenPriceAllYear: {
    isLoading: true,
    isFirstLoad: true,
    datas: []
  },
  etherPrice: {
    isLoading: false,
    isFirstLoad: true,
    price: 0,
    percent_change_24h: 0,
    price_usd: 0
  },
  arrHBTokens: [],
  arrRealBoostTokens: [],
  arrTopTokenCap: {
    isLoading: true,
    datas: []
  },
  arrTopTokenTrade: {
    isLoading: true,
    datas: []
  },
  arrMarketCoin: [],
  arrListCoin: [],
  gasStation: {
    blockNum: 0,
    speed: 0,
    slowest: 0,
    fastest: 0,
    medium: 0,
    gasTime_m: 0,
    gasTime_b: 0,
    gasUsed: 0
  },
  arrAirdrop: [],
  arrTokenSale: [],
  unReadGrab: 0,
  unReadNoti: 0,
  dexNoti: [],
  readGrab: [],
  readNoti: [],
  readNotiNew: {},
  pendingTx: {
    account: {},
    token: {},
    isPending: false,
    lastTxID: ''
  },
  orderHistory: [],
  myOpenOrder: [],
  myCloseOrder: [],
  orderBookBuy: [],
  orderBookSell: [],
  dexData: {
    orderBookSell: [],
    orderBookBuy: [],
    myOrderHistory: [],
    orderHistory: [],
    orderFilledHistory: [],
    orderHistoryAllToken: [],
    isLoading: true
  },
  dexTokenList: [],
  dexTokenFavorite: {
    isLoading: true,
    datas: []
  },
  dexCandleList: [],
  dexFavorite: [],
  dexAnnounce: '',
  advancedWallet: {},
  advancedWalletHistory: [],
  dexTokenSummary: {},
  dexSelectedPair: {},
  dexLastTransaction: {
    etherTx: {},
    tokenTx: [],
    blockNumber: 0
  },
  dexNewOrder: {},
  dexNewSummary: {},
  userAuth: {},
  settingUrls: {},
  arrDapps: [],
  arrDappAssets: [],
  arrDappMarket: [],
  arrDappUnblock: [],
  arrDappMediaNews: [],
  arrDappRequest: [],
  dappFavorites: [],
  dappFavoritesOutSide: [],
  trackingSendTxs: [],
  arrCustomToken: [],
  pendingAirdrop: {
    isPending: false,
    lastTxID: '',
    type: '',
    data: {},
    account: {}
  },
  countWarning: 0,
  unReadGameItemSync: 0,
  arrScamCoins: [],
  etherHistoryAll: [],
  readNewFeature: [],
  screenConfig: {},
  arrKyberSwapToken: [],
  arrDappAssetHistory: [],
  arrCompoundRate: [],
  codeScan: ''
}

export default initState
