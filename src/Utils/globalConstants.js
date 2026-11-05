export const APP_ENVIROMENT = 'production'

export const APP_SCREEN_SIZE = {
  WIDTH: 1280,
  HEIGHT: 768,
  WIDTH_WIN: 1320,
  HEIGHT_WIN: 857
}

// Router
export const APP_PATH = {
  ETHEREUM_SCREEN: '/mainTabbar/ethereumScreen',
  TOKENS_SCREEN: '/mainTabbar/tokenScreen',
  EXCHANGE_TOP: '/mainTabbar/exchangeTop',
  EXCHANGE_SCREEN: '/mainTabbar/exchangeScreen',
  SHAPE_SHIFT_SCREEN: '/mainTabbar/shapeShiftScreen',
  MARKET_TRACKER_SCREEN: '/mainTabbar/marketTracker',
  SETTINGS_SCREEN: '/mainTabbar/settingScreen',
  GRAB_TOKEN_SCREEN: '/mainTabbar/grabToken',
  DAPP_MARKET_SCREEN: '/mainTabbar/dappMarketScreen',
  DAPP_SCREEN: '/mainTabbar/dappScreen',
  DAPP_ASSET: '/mainTabbar/dappAsset',
  BROWSER: '/mainTabbar/browser'
}

// Keystore for save Async store
export const KEYSTORE = {
  TOKEN_DATA: 'TokenData',
  ACCOUNT_HISTORY_DATA: 'AccountHistoryData',
  TOKEN_HISTORY_DATA: 'TokenHistoryData',
  CARD_DATA: 'CardData',
  CURRENCY: 'Currency',
  PINCODE: 'PINCode',
  ACCOUNT_DATA: 'AccountData',
  LANGUAGE: 'Language',
  PASSPHRASE: 'PassPhrase',
  SEND_TOKEN: 'SendToken',
  SEND_ACCOUNT: 'SendAccount',
  SENDING_PROGRESS: 'SENDINGPROGRESS',
  SELECTED_INDEX: 'SelectedIndex',
  CRYPTO_EXCHANGE_KEY: 'CRYPTOEXCHANGEKEY',
  ARR_CARD_BALANCE: 'ARRCARDBALANCE',
  ADDRESS_BOOK: 'ADDRESS_BOOK',
  ARR_PAYMENT: 'ARR_PAYMENT',
  GAS_STATION: 'GAS_STATION',
  AIR_DROP: 'AIR_DROP',
  TOKEN_SALE: 'TOKEN_SALE',
  UN_READ_GRAB: 'UN_READ_GRAB',
  UN_READ_NOTI: 'UN_READ_NOTI',
  DEX_NOTI: 'DEX_NOTI',
  READ_GRAB: 'READ_GRAB',
  READ_NOTI: 'READ_NOTI',
  READ_NOTI_NEW: 'READ_NOTI_NEW',
  PENDING_TX: 'PENDING_TX',
  ORDER_HISTORY: 'ORDER_HISTORY',
  MY_OPEN_ORDER: 'MY_OPEN_ORDER',
  MY_CLOSE_ORDER: 'MY_CLOSE_ORDER',
  ORDER_BOOK_BUY: 'ORDER_BOOK_BUY',
  ORDER_BOOK_SELL: 'ORDER_BOOK_SELL',
  DEX_TOKEN_LIST: 'DEX_TOKEN_LIST',
  DEX_TOKEN_FAVORITE: 'DEX_TOKEN_FAVORITE',
  DEX_TOKEN_SUMMARY: 'DEX_TOKEN_SUMMARY',
  ETHER_PRICE: 'ETHER_PRICE',
  USER_AUTH: 'USER_AUTH',
  HB_TOKENS: 'HB_TOKENS',
  REALBOOST_TOKENS: 'REALBOOST_TOKENS',
  DAPPS: 'DAPPS',
  DAPP_ASSETS: 'DAPP_ASSETS',
  DAPP_MARKET: 'DAPP_MARKET',
  DAPP_UNBLOCK: 'DAPP_UNBLOCK',
  DAPP_MEDIA_NEWS: 'DAPP_MEDIA_NEWS',
  DAPP_REQUEST: 'DAPP_REQUEST',
  DAPP_FAVORITES: 'DAPP_FAVORITES',
  DAPP_FAVORITES_OUT_SIDE: 'DAPP_FAVORITES_OUT_SIDE',
  NONCE: 'NONCE',
  SENDING_PROCESS: 'SENDING_PROCESS',
  ADVANCED_WALLET_HISTORY: 'ADVANCED_WALLET_HISTORY',
  CUSTOM_TOKEN: 'CUSTOM_TOKEN',
  PENDING_AIRDROP: 'PENDING_AIRDROP',
  COUNT_WARNING: 'COUNT_WARNING',
  UN_READ_GAME_ITEM_SYNC: 'UN_READ_GAME_ITEM_SYNC',
  SETTING_URLS: 'SETTING_URLS',
  ACCOUNT_HISTORY_ALL: 'ACCOUNT_HISTORY_ALL',
  ACCOUNT_HISTORY: 'ACCOUNT_HISTORY',
  TOKEN_HISTORY: 'TOKEN_HISTORY',
  TOKEN_HISTORY_ALL: 'TOKEN_HISTORY_ALL',
  HB_CONTRACT: 'HB_CONTRACT',
  CHART_ETHER_PRICE: 'CHART_ETHER_PRICE',
  CHART_ETHER_PRICE_YEAR: 'CHART_ETHER_PRICE_YEAR',
  CHART_TOKEN_ALL: 'CHART_TOKEN_ALL',
  CHART_TOKEN_ALL_YEAR: 'CHART_TOKEN_ALL_YEAR',
  READ_NEW_FEATURE: 'READ_NEW_FEATURE',
  SCREEN_CONFIG: 'SCREEN_CONFIG',
  KYBER_SWAP_TOKEN: 'KYBER_SWAP_TOKEN',
  DAPP_ASSET_HISTORY: 'DAPP_ASSET_HISTORY',
  COMPOUND_RATE: 'COMPOUND_RATE',
  CODE_SCAN: 'CODE_SCAN'
}
export const ORDER_STATUS = {
  OPEN: 0,
  FILLED: 1,
  CANCEL: 2,
  EXPIRED: 3,
  WARNING: 4,
  PROCESSING: 5,
  FAILED: 6
}

export const ORDER_FILTER = {
  OPEN: 0,
  CLOSED: 1,
  FILLED: 2
}

export const REQUEST_STATUS = {
  PENDING: 0,
  COMPLETED: 1,
  FAILED: 2
}

export const TAB_SELECTED = {
  TAB_1: '1',
  TAB_2: '2',
  TAB_3: '3',
  TAB_4: '4'
}
export const TABBAR_INDEX = {
  ETHEREUM: 0,
  TOKENS: 1,
  GRAB_TOKEN: 2,
  EXCHANGE: 3,
  DAPP_MARKET: 7,
  DAPP_ASSET: 8,
  DAPP: 4,
  MARKET_TRACKER: 5,
  SETTINGS: 6
}
export const OBSERVER_KEY = {
  SELECT_TAB_TOKEN: 'SELECT_TAB_TOKEN',
  SELECT_TAB_TOKEN_DETAIL: 'SELECT_TAB_TOKEN_DETAIL',
  SELECT_TAB_ETHER: 'SELECT_TAB_ETHER',
  SELECT_TAB_SETTING: 'SELECT_TAB_SETTING',
  SELECT_TAB_EXCHANGE: 'SELECT_TAB_EXCHANGE',
  SELECT_TAB_EXCHANGE_SCREEN: 'SELECT_TAB_EXCHANGE_SCREEN',
  SELECT_TAB_ADD_TOKEN: 'SELECT_TAB_ADD_TOKEN',
  SELECT_TAB_DAPP: 'SELECT_TAB_DAPP',
  SELECT_TAB_DAPP_MARKET: 'SELECT_TAB_DAPP_MARKET',
  SELECT_TAB_DAPP_TO_GACHA: 'SELECT_TAB_DAPP_TO_GACHA',
  GET_DATA_AFTER_SEND_ETH: 'GET_DATA_AFTER_SEND_ETH',
  GET_DATA_AFTER_SEND_TOKEN: 'GET_DATA_AFTER_SEND_TOKEN',
  GET_DATA_AFTER_REGISTER_TOKEN_CARD: 'GET_DATA_AFTER_REGISTER_TOKEN_CARD',
  GET_DATA_AFTER_BUY_DAPP_ITEM: 'GET_DATA_AFTER_BUY_DAPP_ITEM',
  GET_DATA_AFTER_APPLY_AIRDROP: 'GET_DATA_AFTER_APPLY_AIRDROP',
  GET_DATA_AFTER_APPLY_AIRDROP_PAYMENT_FEE:
    'GET_DATA_AFTER_APPLY_AIRDROP_PAYMENT_FEE',
  APPLY_AIRDROP_SUCCESSFULLY: 'APPLY_AIRDROP_SUCCESSFULLY',
  NEW_DEX_ORDER: 'NEW_DEX_ORDER',
  NEW_DEX_ORDER_FAVORITE: 'NEW_DEX_ORDER_FAVORITE',
  NEW_DEX_GAME_EVENT: 'NEW_DEX_GAME_EVENT',
  NEW_DEX_REQUEST_EVENT: 'NEW_DEX_REQUEST_EVENT',
  DEX_UPDATE_FAVORITE: 'DEX_UPDATE_FAVORITE',
  DEX_UPDATE_VOLUME: 'DEX_UPDATE_VOLUME',
  DEX_UPDATE_PRICE_CHART: 'DEX_UPDATE_PRICE_CHART',
  DEX_UPDATE_PRICE_CHART_1H: 'DEX_UPDATE_PRICE_CHART_1H',
  REFRESH_ETH_HISTORY: 'REFRESH_ETH_HISTORY',
  REFRESH_ETH_HISTORY_ALL: 'REFRESH_ETH_HISTORY_ALL',
  REFRESH_TOKEN_HISTORY: 'REFRESH_TOKEN_HISTORY',
  LOOP_TRANSFER_AND_APPROVE: 'LOOP_TRANSFER_AND_APPROVE',
  ALL_LOOP_TRANSFER_DONE: 'ALL_LOOP_TRANSFER_DONE',
  SAVE_IN_ADVANCED_WALLET_HISTORY: 'SAVE_IN_ADVANCED_WALLET_HISTORY',
  SEND_SIGNED_TRANSACTION: 'SEND_SIGNED_TRANSACTION',
  NEW_DEX_NOTIFICATIONS: 'NEW_DEX_NOTIFICATIONS',
  SERVER_API_CRASH: 'SERVER_API_CRASH',
  GO_TO_MARKET: 'GO_TO_MARKET',
  CHECK_FOR_UPDATE: 'CHECK_FOR_UPDATE',
  OPEN_KYBER_SWAP: 'OPEN_KYBER_SWAP',
  NEW_AIRDROP: 'NEW_AIRDROP'
}
export const WETH_ADDRESS =
  APP_ENVIROMENT === 'development'
    ? '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
    : '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
export const ZRX_ADDRESS =
  APP_ENVIROMENT === 'development'
    ? '0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570'
    : '0xe41d2489571d322189246dafa5ebde1f4699f498'
export const HBWALLET = 
  APP_ENVIROMENT === 'development'
    ? '0x91013928b1c4dbd0d5cb21ba5b052bfd840a7a7f'
    : '0xec7ba74789694d0d03d458965370dc7cf2fe75ba'
export const SWAP_ADDRESS =
  APP_ENVIROMENT === 'development'
    ? '0x9a1BE730168973E9fF436a6f3327c77268704c05'
    : '0x7F45d3b158410B69b2d7f503BDc90a9AA734CbEF'
export const KACHIAGE_ADDRESS =
  APP_ENVIROMENT === 'development'
    ? '0x14750DDb2b11D3a23E8d6c5cC4cAc1782e988745'
    : '0xae27068c648ba514bda71d431a4d345ddf1767c4'
export const BOOST_ADDRESS = '0xbdb686ac471b374bdc844615c768c2595c2ff2fe'
export const OWNER_RECEIVER_ADDRESS = '0x3b8a67ad64160e0b977b6dd877e0fb98878ab902'
export const GAME_MARKET_CONTRACT = '0xc3c708c6e32976267ee129886b72383e769fc05b'
export const TOKEN_GAME_CONTRACT = '0xac9d8d6db95828259069226456dde98d8e296c5f'
// KEY VALUE
export const CONSTANTS = {
  PAGE_LENGTH: 50
}

export const LANGUAGES = [
  { label: 'English', language: 'en', flat: 'English.png' },
  { label: '日本語', language: 'jp', flat: 'Japanese.png' },
  { label: '中文', language: 'cn', flat: 'Chinese.png' },
  { label: 'русский', language: 'ru', flat: 'Russian.png' },
  { label: 'español', language: 'es', flat: 'Spainish.png' },
  { label: 'Português', language: 'pt', flat: 'Portugese.png' },
  { label: 'ไทย', language: 'th', flat: 'Thai.png' },
  { label: 'Tiếng Việt', language: 'vn', flat: 'Vietnamese.png' },
  { label: '한국어', language: 'kr', flat: 'Korea.png' }
]

// Locale support in HB-DEX
export const HBLOCALE = {
  EN: 'en',
  JP: 'jp',
  CN: 'cn',
  ES: 'es',
  PT: 'pt',
  RU: 'ru'
}

export const ONE_TIME = {
  ONE_DAY: '1day',
  ONE_WEEK: '1week',
  ONE_MONTH: '1month',
  ONE_YEAR: '1year'
}

// Language support in HB-DEX
export const HBLANGUAGE = {
  ENGLISH: 'English',
  JAPAN: '日本語',
  CHINA: '中文',
  RUSIAN: 'русский',
  SPANISH: 'Español',
  PORTUGUESE: 'Português'
}

// Crypto support in HB-DEX
export const HBCRYPTO = {
  ETHEREUM: 'ETH',
  BITCOIN: 'BTC',
  ETHEREUMFULLNAME: 'Ethereum',
  ETHEREUMSHORTNAME: 'Ether',
  WRAP: 'WRAP',
  UNWRAP: 'UNWRAP',
  ERC20: 'ERC20'
}

// Account detail sub view
export const ACCOUNT_DETAIL_SUB_VIEW = {
  ACCOUNT_DETAIL: 'ACCOUNT_DETAIL',
  CONFIRM_SEND: 'CONFIRM_SEND',
  FUND_WITH_CREDIT_CARD: 'FUND_WITH_CREDIT_CARD',
  PAYMENT_MENTHUD: 'PAYMENT_MENTHUD',
  NEW_PAYMENT: 'NEW_PAYMENT'
}

// Currency support in HB-DEX
export const HBCURRENCY = {
  USD: 'USD',
  JPY: 'JPY',
  AUD: 'AUD',
  BRL: 'BRL',
  CAD: 'CAD',
  CHF: 'CHF',
  CLP: 'CLP',
  RMB: 'CNY',
  CZK: 'CZK',
  DKK: 'DKK',
  EUR: 'EUR',
  GBP: 'GBP',
  HKD: 'HKD',
  HUF: 'HUF',
  IDR: 'IDR',
  ILS: 'ILS',
  INR: 'INR',
  ISK: 'ISK',
  KRW: 'KRW',
  MXN: 'MXN',
  MYR: 'MYR',
  NOK: 'NOK',
  NZD: 'NZD',
  PHP: 'PHP',
  PKR: 'PKR',
  PLN: 'PLN',
  RUB: 'RUB',
  SEK: 'SEK',
  SGD: 'SGD',
  THB: 'THB',
  TRY: 'TRY',
  NTD: 'TWD',
  ZAR: 'ZAR',
  VND: 'VND'
}

export const ARR_HBCURRENCY = [
  { name: 'USD' },
  { name: 'JPY' },
  { name: 'AUD' },
  { name: 'BRL' },
  { name: 'CAD' },
  { name: 'CHF' },
  { name: 'CLP' },
  { name: 'CNY' },
  { name: 'CZK' },
  { name: 'DKK' },
  { name: 'EUR' },
  { name: 'GBP' },
  { name: 'HKD' },
  { name: 'HUF' },
  { name: 'IDR' },
  { name: 'ILS' },
  { name: 'INR' },
  { name: 'ISK' },
  { name: 'KRW' },
  { name: 'MXN' },
  { name: 'RM' },
  { name: 'NOK' },
  { name: 'NZD' },
  { name: 'PHP' },
  { name: 'PKR' },
  { name: 'PLN' },
  { name: 'RUB' },
  { name: 'SEK' },
  { name: 'SGD' },
  { name: 'THB' },
  { name: 'TRY' },
  { name: 'TWD' },
  { name: 'ZAR' },
  { name: 'VND' }
]

// Currency symbol display support in HB-DEX
export const HBCURRENCY_SYMBOL = {
  USD: '$',
  JPY: '¥',
  AUD: '$',
  BRL: 'R$',
  CAD: 'C$',
  CHF: 'Fr. ',
  CLP: '$',
  CNY: '¥',
  CZK: 'Kč',
  DKK: 'kr. ',
  EUR: '€',
  GBP: '£',
  HKD: 'HK$',
  HUF: 'Ft ',
  IDR: 'Rp ',
  ILS: '₪',
  INR: '₹',
  ISK: 'kr',
  KRW: '₩',
  MXN: '$',
  MYR: 'RM',
  NOK: 'kr ',
  NZD: '$',
  PHP: '₱',
  PKR: 'Rs. ',
  PLN: 'zł',
  RUB: '₽',
  SEK: 'kr ',
  SGD: 'S$',
  THB: '฿',
  TRY: '₺',
  TWD: 'NT$',
  ZAR: 'R ',
  VND: 'VND '
}
export const KEY_ENCODE = 'bacoor-hbwallet'
export const PERIOD_CHART = {
  FIVE_MUNITES: '5M',
  THIRTY_MUNITES: '30M',
  ONE_HOURS: '1H',
  SIX_HOURS: '6H',
  TWELVE_HOURS: '12H',
  ONE_DAY: '1D',
  ONE_WEEK: '1W',
  ONE_MONTH: '1M',
  ALL: 'ALL',
  MUNITE: 'munite',
  HOUR: 'hour'
}
export const CHART_TYPE = {
  CHART_LINE: 'line',
  CHART_CANDLE_STICK: 'candleStick',
  CHART_DEPTH: 'depth'
}
export const LIMIT_NUMBER = {
  INT_NUMBER: 9,
  DECIMAL_NUMBER: 8,
  CARD_NAME: 12
}
export const EMAILJS = {
  SERVICE: 'gmail',
  RECEIVER: 'user_lE4r9sWjUBdj9WSF5CLuP',
  TEMPLATEID: 'template_rlgajkYA'
}
export const MIN_WETH_MAKE_ORDER = 0.01

export const DEFAULT_CARD_URLS = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null
]

export const TOKEN_STATUS = {
  PENDING: 0,
  APPROVE: 1,
  REJECT: 2
}

export const USD_STATUS = {
  WETH: 0,
  USD: 1
}

export const GAS_PRICE_DEFAULT = {
  SAFELOW: 3,
  AVERAGE: 4,
  FASTEST: 20
}

export const SEND_ERR_TYPE = {
  REPLACEMENT: 'REPLACEMENT'
}

export const LIMIT_PRICE_TICKER = 30

export const PENDING_TYPE = {
  APPLY_AIRDROP: 'APPLY_AIRDROP',
  AIRDROP_PAYMENT_FEE: 'AIRDROP_PAYMENT_FEE'
}

export const rinkebyDappAssets = {
  data: [
    {
      _id: '5c9b2c6b1ce30e2ed81dcb26',
      locked: false,
      image:
        'https://img00.deviantart.net/0b8d/i/2016/293/6/8/_fakemon__luxelong_by_involuntary_twitch-dalmya1.png',
      icon:
        'https://www.shareicon.net/download/2016/08/05/807321_gaming_512x512.png',
      name: 'Monster 6',
      game: 'Game Monster',
      id: '6',
      address: TOKEN_GAME_CONTRACT,
      symbol: 'GODS',
      owner: '0x3e25fd5a8a66a749375f293e58207834a8d852da',
      businessAddress: GAME_MARKET_CONTRACT,
      version: 2
    },
    {
      _id: '5c9b2c6b1ce30e2ed81dcb26',
      locked: false,
      image:
        'https://i.pinimg.com/originals/25/95/d3/2595d34e825e57f8f1b3130768eef483.png',
      icon:
        'https://www.shareicon.net/download/2016/08/05/807321_gaming_512x512.png',
      name: 'Monster 7',
      game: 'Game Monster',
      id: '17',
      address: TOKEN_GAME_CONTRACT,
      symbol: 'GODS',
      owner: '0x3e25fd5a8a66a749375f293e58207834a8d852da',
      businessAddress: GAME_MARKET_CONTRACT,
      version: 2
    },
    {
      _id: '5c9b2c6b1ce30e2ed81dcb26',
      locked: false,
      image:
        'https://orig00.deviantart.net/268f/f/2014/313/1/9/fake_pokemon_game_monster_blazdra_mmo_rpg_by_monstermmorpg-d85t3gw.png',
      icon:
        'https://www.shareicon.net/download/2016/08/05/807321_gaming_512x512.png',
      name: 'Monster 8',
      game: 'Game Monster',
      id: '18',
      address: TOKEN_GAME_CONTRACT,
      symbol: 'GODS',
      owner: '0x3e25fd5a8a66a749375f293e58207834a8d852da',
      businessAddress: GAME_MARKET_CONTRACT,
      version: 2
    },
    {
      _id: '5c9b2c6b1ce30e2ed81dcb26',
      locked: false,
      image:
        'https://i.pinimg.com/originals/71/12/66/711266d72818e61484621b4133dc1b54.png',
      icon:
        'https://www.shareicon.net/download/2016/08/05/807321_gaming_512x512.png',
      name: 'Monster 9',
      game: 'Game Monster',
      id: '19',
      address: TOKEN_GAME_CONTRACT,
      symbol: 'GODS',
      owner: '0x3e25fd5a8a66a749375f293e58207834a8d852da',
      businessAddress: GAME_MARKET_CONTRACT,
      version: 2
    },
    {
      _id: '5c9b2c6b1ce30e2ed81dcb26',
      locked: false,
      image:
        'https://i.pinimg.com/originals/be/de/0a/bede0aef3b4f04d2c1522b92c48d450d.png',
      icon:
        'https://www.shareicon.net/download/2016/08/05/807321_gaming_512x512.png',
      name: 'Monster 10',
      game: 'Game Monster',
      id: '20',
      address: TOKEN_GAME_CONTRACT,
      symbol: 'GODS',
      owner: '0x3e25fd5a8a66a749375f293e58207834a8d852da',
      businessAddress: GAME_MARKET_CONTRACT,
      version: 2
    }
  ],
  total: 5
}

export const WETH_TOKEN = {
  name: 'Wrapped Ether',
  symbol: 'WETH',
  decimals: 18,
  balance: 0,
  address: APP_ENVIROMENT === 'development' ? '0xd0a1e359811322d97991e03f863a0c30c2cf029c' : '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
}

export const ETH_COIN = {
  decimals: 18,
  address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  name: 'Ethereum',
  symbol: 'ETH',
  tokenId: '1027'
}
export const DAI_COIN = {
  decimals: 18,
  address: APP_ENVIROMENT === 'development'
    ? '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'
    : '0x6b175474e89094c44da98b954eedeac495271d0f',
  name: 'DAI',
  symbol: 'DAI',
  tokenId: '4943',
  iconImage: 'https://ipfs.io/ipfs/QmPDQUpLJzvrKwSnmHoLC5cer2YthYfkoRzQ4nGhHD5CCm/hb-blockchain-wallet/icon/dai_stablecoin.png'
}
export const MKR_COIN = {
  decimals: 18,
  address: APP_ENVIROMENT === 'development'
    ? '0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD'
    : '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  name: 'Maker',
  symbol: 'MKR',
  tokenId: '1518',
  iconImage: 'https://ipfs.io/ipfs/QmPDQUpLJzvrKwSnmHoLC5cer2YthYfkoRzQ4nGhHD5CCm/hb-blockchain-wallet/icon/mkr-etherscan-35.png'
}

export const arrCryptoCurrency = [
  { 
    'value': 'ETH*', 
    'name': 'Ethereum',
    'symbol': 'ETH',
    'decimals': 18
  },
  { 
    'value': 'TUSD*', 
    'name': 'TrueUSD',
    'symbol': 'TUSD',
    'decimals': 18,
    'id': 2563,
    'address': APP_ENVIROMENT !== 'development' ? '0x0000000000085d4780B73119b644AE5ecd22b376' : '0x9a96fcefb9198a7f7fab4feac580cb16a3725b52'
  },
  { 
    'value': 'DAI', 
    'name': 'Dai',
    'symbol': 'DAI',
    'decimals': 18,
    'id': 4943,
    'address': APP_ENVIROMENT !== 'development' ? '0x6b175474e89094c44da98b954eedeac495271d0f' : '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'
  }
]

export const GA_ID = 'UA-139832490-1'

export const NUM_PAGE_NFT = 28

export const NUM_PAGE_GACHA = 20

export const NUM_REQUEST_NFT = 6

export const NUM_ORDER_HISTORY_NFT = 20

export const CHATWORK = {
  ROOM_ID: 154683187,
  TOKEN: 'd48a37d902be36176e1421ab59c49a7c' // 46bae7a388f025b9e88a5c8354b44065
}
export const NUM_GET_NOTI = 20

export const NUM_GET_FAVORITE = 30
