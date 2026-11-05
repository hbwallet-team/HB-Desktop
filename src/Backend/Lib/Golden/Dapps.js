require('./GoldenProvider')
const storage = require('electron-json-storage-sync')
const { ipcRenderer } = require('electron')
const KEYSTORE = {
  CARD_DATA: 'CardData',
  CODE_SCAN: 'CODE_SCAN'
}

function getChainID (name) {
  switch (name) {
  case 'mainnet': return 1
  case 'ropsten': return 3
  case 'rinkeby': return 4
  case 'kovan': return 42
  }

  throw new Error('Unsupport network')
}

function getInfuraRPCURL (chainID, apiKey) {
  switch (chainID) {
  case 1: return 'https://mainnet.infura.io/v3/' + apiKey
  case 3: return 'https://ropsten.infura.io/v3/' + apiKey
  case 4: return 'https://rinkeby.infura.io/v3/' + apiKey
  case 42: return 'https://kovan.infura.io/v3/' + apiKey
  }

  throw new Error('Unsupport network')
}

function getInfuraWSSURL (chainID, apiKey) {
  switch (chainID) {
  case 1: return 'wss://mainnet.infura.io/ws/' + apiKey
  case 3: return 'wss://ropsten.infura.io/ws/' + apiKey
  case 4: return 'wss://rinkeby.infura.io/ws/' + apiKey
  case 42: return 'wss://kovan.infura.io/ws/' + apiKey
  }

  throw new Error('Unsupport network')
}

function getStore (KEY) {
  const data = storage.get(KEY)
  if (data) {
    return data.data
  } else {
    return ''
  }
}

const cardData = getStore(KEYSTORE.CARD_DATA)
const mainAccount = cardData.find(card => card.isMain)
const keys = []
for (let index = 0; index < 23; index++) {
  const infuraIndex = 'REACT_APP_INFURA_KEY_' + index
  keys.push(process.env[infuraIndex])
}
const randomKey = () => {
  const key = keys[Math.floor(Math.random() * keys.length)]
  return key
}
let addressHex = mainAccount ? mainAccount.address : ''
let network = 'mainnet'
let chainID = getChainID(network)
let goldenProvider = null

function init () {
  let infuraAPIKey = randomKey()
  let rpcUrl = getInfuraRPCURL(chainID, infuraAPIKey)
  let wssUrl = getInfuraWSSURL(chainID, infuraAPIKey)
  goldenProvider = new Golden({
    noConflict: true,
    address: addressHex,
    networkVersion: chainID,
    rpcUrl,
    getAccounts: function (cb) {
      cb(null, [addressHex]) 
    },
    signTransaction: function (tx, cb) {
      console.log('signing a transaction', tx)
      const { id = 8888 } = tx
      goldenProvider.addCallback(id, cb)
      const resTx = {name: 'signTransaction', id, tx} 
      ipcRenderer.sendToHost(JSON.stringify(resTx))
    },
    signMessage: function (msgParams, cb) {
      const { data } = msgParams
      const { id = 8888 } = msgParams
      console.log('signing a message', msgParams)
      const resTx = {name: 'signMessage', id, tx} 
      ipcRenderer.sendToHost(JSON.stringify(resTx))
    },
    signPersonalMessage: function (msgParams, cb) {
      const { data } = msgParams
      const { id = 8888 } = msgParams
      console.log('signing a personal message', msgParams, cb)
      goldenProvider.addCallback(id, cb)
      const resTx = {name: 'signPersonalMessage', id, data} 
      ipcRenderer.sendToHost(JSON.stringify(resTx))
    },
    signTypedMessage: function (msgParams, cb) {
      const { data } = msgParams
      const { id = 8888 } = msgParams
      console.log('signing a typed message', msgParams)
      goldenProvider.addCallback(id, cb)
      const resTx = {name: 'signTypedMessage', id, tx} 
      ipcRenderer.sendToHost(JSON.stringify(resTx))
    }
  },
  {
    address: addressHex,
    networkVersion: chainID
  })
}

init()
goldenProvider.isHB = true
const codeScan = getStore(KEYSTORE.CODE_SCAN)
if (codeScan && codeScan.length > 0) {
  window.codeScan = codeScan
}
window.web3 = new Web3(goldenProvider)

web3.eth.defaultAccount = addressHex

web3.setProvider = function () {
  console.debug('Golden Wallet - overrode web3.setProvider')
}

web3.version.getNetwork = function (cb) {
  cb(null, chainID)
}
web3.eth.getCoinbase = function (cb) {
  return cb(null, addressHex)
}

ipcRenderer.on('executeCallback', (event, id, error, value) => {
  console.log(id, error, value)
  goldenProvider.executeCallback(id, error, value)
})
