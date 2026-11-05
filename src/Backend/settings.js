import { APP_ENVIROMENT } from 'Utils/globalConstants'
// Main settings will contain all the neccessary information of the system
const settings = {
  server: {
    dexApi: {
      url: APP_ENVIROMENT === 'production' ? 'https://dex-api-v2.hb-wallet.io/' : (APP_ENVIROMENT === 'staging' ? 'http://staging-dex-api.hb-wallet.io/' : (APP_ENVIROMENT === 'development' ? 'http://dev-api-dex.hb-wallet.io/' : 'http://13.250.44.196:3001/')),
      urlExchangeTop: APP_ENVIROMENT === 'production' ? 'https://dex-api-ts.hb-wallet.io/' : (APP_ENVIROMENT === 'staging' ? 'http://13.231.114.226:3009/' : (APP_ENVIROMENT === 'development' ? 'http://13.250.44.196:3009/' : 'http://13.250.44.196:3010/')),
      socket: APP_ENVIROMENT === 'production' ? 'https://dex-api-v2-socket.hb-wallet.io/' : (APP_ENVIROMENT === 'staging' ? 'http://13.231.114.226:3077/' : 'http://dev-socket-dex.hb-wallet.io/')
    },
    hbChatApi: {
      url: APP_ENVIROMENT === 'development' ? 'http://dev.hb-chat.work/' : 'https://api.hb-chat.work/'
    },
    nagemonApi: {
      url: APP_ENVIROMENT === 'development' ? 'http://dev-api-kovan.nagemon.com/' : 'https://api.nagemon.com/'
    },
    cryptocompare: {
      url: 'https://min-api.cryptocompare.com/'
    },
    hbScan: {
      url: 'https://core.fullnode.work/api/',
      urlProvider: 'http://18.179.26.249:8545/',
      key: ''
    },
    etherscan: {
      orginUrl: APP_ENVIROMENT === 'development' ? 'https://kovan.etherscan.io/' : 'https://etherscan.io/',
      url: APP_ENVIROMENT === 'development' ? 'https://api-kovan.etherscan.io/api?' : 'https://api.etherscan.io/api?',
      urlLookup: APP_ENVIROMENT === 'development' ? 'https://kovan.etherscan.io/' : 'https://etherscan.io/',
      rinkebyUrl: 'https://kovan.etherscan.io/api?'
    },
    networkInfura: {
      url: APP_ENVIROMENT === 'development' ? 'https://kovan.infura.io/v3/' : 'https://mainnet.infura.io/v3/',
      id: APP_ENVIROMENT === 'development' ? 42 : 1,
      apiKey: '',
      network: APP_ENVIROMENT === 'development' ? 'kovan' : 'mainnet'
    },
    bitcoinaverage: {
      url: 'https://apiv2.bitcoinaverage.com/'
    },
    amazonapi: {
      url: 'https://5q5y954f4a.execute-api.ap-northeast-1.amazonaws.com/'
    },
    coinmarketcapApi: {
      url: 'https://api.coinmarketcap.com/v1/ticker/'
    },
    coinmarketcapApiV2: {
      url: 'https://api.coinmarketcap.com/v2/ticker/'
    },
    coinmarketcapProApi: {
      url: 'https://pro-api.coinmarketcap.com/v1/',
      apiKey: ''
    },
    ethgasstation: {
      url: 'https://ethgasstation.info/json/'
    },
    ethplorer: {
      url: 'https://api.ethplorer.io/',
      key: '',
      limit: 1000
    },
    apilayer: {
      url: 'http://apilayer.net/api/',
      key: ''
    },
    etherdelta: {
      url: 'https://api.etherdelta.com/'
    },
    shapeshift: {
      url: 'https://shapeshift.io/',
      privateKey: '',
      publicKey: ''
    },
    airdrop: {
      url: 'http://18.179.26.249:3001/api/air-drop/list',
      token: '',
      urlTest: 'http://54.249.78.25:3008/api/air-drop/list', // 'http://54.238.200.205:3001/api/air-drop/list',
      tokenTest: ''
    },
    tokenSale: {
      url: 'http://18.179.26.249:3001/api/ico/ads/list',
      token: '',
      urlTest: 'http://54.249.78.25:3008/api/ico/ads/list', // 'http://54.238.200.205:3001/api/ico/ads/list',
      tokenTest: ''
    },
    gasStation: {
      url: 'http://18.179.26.249:3000/api/transaction/gas-time-price-estimate',
      token: '',
      urlDev: 'http://54.249.78.25:3009/api/transaction/gas-time-price-estimate',
      tokenDev: ''
    },
    gasStationNew: {
      url: 'https://ethgasstation.info/json/ethgasAPI.json'
    },
    dressUpToken: {
      scan: {
        url: 'https://93u5c24vg7.execute-api.ap-northeast-1.amazonaws.com/prod/scan'
      },
      search: {
        url: 'https://93u5c24vg7.execute-api.ap-northeast-1.amazonaws.com/prod/search'
      }
    },
    unblockAPI: {
      url: 'https://www.unblock.news/api/'
    }
  },
  websocket: {
    etherscan: 'wss://socket.etherscan.io/wshandler'
  },
  intervalTime: {
    refreshExchangeRate: 300
  },
  gas: {
    externalFee: 21000,
    externalFeeToken: 200000,
    externalLargeFeeToken: 300000
  },
  keyConvertMoney: {
    publickey: '',
    secretkey: ''
  },
  secretKey: 'http://bacoor.co/1/1/2018'
}

export default settings
