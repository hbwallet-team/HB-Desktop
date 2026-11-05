import Web3 from 'web3'
import { HDNode, utils, Wallet, providers } from 'ethers'
import bigInt from 'big-integer'
import { concatSig } from 'eth-sig-util'
import Settings from 'Backend/settings'
import EtherGas from 'Backend/Api/services/EtherGas'
import EtherscanServices from 'Backend/Api/services/EtherScan'
import { APP_ENVIROMENT, KACHIAGE_ADDRESS, OBSERVER_KEY, GAME_MARKET_CONTRACT, TOKEN_GAME_CONTRACT } from 'Utils/globalConstants'
import Observer from 'Utils/HBObserver'
import { convertWeiToBalance, convertWeiToBalanceCustom, convertBalanceToWei, generateDataToken, scientificToDecimal, randomInfuraKey } from 'Utils/globalFunction'
import converter from 'hex2dec'
import EthereumTx from 'ethereumjs-tx'
import ABI from 'Utils/ERC20ABI'
import ABIContract from 'Utils/AirDropContractABI'
import DexAPI from 'Backend/Api/services/DexAPI'
import AirdropABI from 'Utils/airDropSmartContractABI'
import AirdropData from 'Utils/airDropData'
import ReduxServices from 'Utils/globalRedux'
import abiGame from './abiGame'
import abiGameOld from './abiGameOld'
import tokenApprove from './tokenApprove'
import abiSwap from './abiSwap'
import abiNFTCard from './abiNFTCard'
import abiKachiage from './abiKachiage'
import OxObject from 'Backend/Lib/0x/index'

const createWeb3Provider = () => {
  let key = randomInfuraKey()
  web3.setProvider(new web3.providers.HttpProvider(Settings.server.networkInfura.url + key))
}
let web3 = new Web3()
createWeb3Provider()
setInterval(() => {
  createWeb3Provider()
}, 60000)
const web3Provider = new providers.Web3Provider(web3)
const abi = ABI.ABI_ERC20

// for testnet
// const contractAddress = '0xa2d33ab1d7cf75bd2236c5fba2c0a7613b489bc7'
// for mainnet
const contractAddress = '0xcBA52DdAfC6F6846b578a7DC2F7fa1902cC2C713'
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

const getTxHashFromError = (error) => {
  const newObject = error.toString()
  const firstIndex = newObject.indexOf('{')
  const lastIndex = newObject.indexOf('}')
  const objectStringReason = newObject.substring(0, firstIndex + 1)
  const objectString = newObject.substring(firstIndex, lastIndex + 1)
  console.log('objectString  ', objectString)
  const finalObject = JSON.parse(objectString)
  console.log('finalObject  ', finalObject)
  return {objectStringReason, finalObject}
}

export const generateWallet = (mnemonic, index = 0) => {
  return new Promise(async (resolve, reject) => {
    if (!mnemonic) {
      mnemonic = HDNode.entropyToMnemonic(utils.randomBytes(16))
    }
    const wallet = await Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${index}`)
    return resolve({ currentReceiveAddress: wallet.address, privatekey: wallet.privateKey, mnemonic: wallet.mnemonic })
  })
}

export const getWalletByPrivateKey = (privateKey) => {
  return new Promise((resolve, reject) => {
    try {
      const wallet = new Wallet(privateKey)
      if (wallet) {
        resolve(wallet)
      } else {
        resolve(null)
      }
    } catch (err) {
      resolve(null)
    }
  })
}

export const getETHBalance = (address) => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address).then((response) => {
      resolve(convertWeiToBalance(response))
    }).catch(err => {
      reject(err)
    })
  })
}

export const getTokenBalance = (contractAddress, address, decimalToken) => {
  return new Promise(async (resolve, reject) => {
    let minABI = [
      {
        'constant': true,
        'inputs': [{ 'name': '_owner', 'type': 'address' }],
        'name': 'balanceOf',
        'outputs': [{ 'name': 'balance', 'type': 'uint256' }],
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'decimals',
        'outputs': [{ 'name': '', 'type': 'uint8' }],
        'type': 'function'
      }
    ]
    const contract = new web3.eth.Contract(minABI, contractAddress)

    contract.methods.balanceOf(address).call().then(balance => {
      if (decimalToken) {
        const tokenBalance = convertWeiToBalanceCustom(balance, decimalToken)
        resolve(tokenBalance)
      } else {
        contract.methods.decimals().call().then(decimal => {
          const tokenBalance = convertWeiToBalanceCustom(balance, decimal)
          resolve(tokenBalance)
        }).catch(err => {
          console.log(err)
          const tokenBalance = convertWeiToBalanceCustom(balance, 18)
          resolve(tokenBalance)
        })
      }
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}

export const signPersonalLoginDapp = (privateKeyHex, rawTransaction) => {
  var ethUtil = require('ethereumjs-util')
  var message = ethUtil.toBuffer(rawTransaction)
  var msgHash = ethUtil.hashPersonalMessage(message)
  var sig = ethUtil.ecsign(msgHash, Buffer.from(privateKeyHex, 'hex'))
  var serialized = ethUtil.bufferToHex(concatSig(sig.v, sig.r, sig.s))
  return serialized
}

export const signPersonalTransaction = (privateKeyHex, payload, gasPrice) => {
  return new Promise(async (resolve, reject) => {
    const ethWallet = new Wallet('0x' + privateKeyHex)
    ethWallet.provider = web3Provider

    const nonce = await web3.eth.getTransactionCount(ethWallet.address)
    gasPrice = convertBalanceToWei(gasPrice, 9)
    gasPrice = converter.decToHex(gasPrice)

    let rawTransaction = {
      nonce,
      to: payload.to,
      value: payload.value,
      gasLimit: payload.gas,
      gasPrice,
      data: payload.data,
      chainId: '0x' + Settings.server.networkInfura.id
    }
    console.log(rawTransaction)

    let signedTransaction = ethWallet.sign(rawTransaction)
    resolve(signedTransaction)
  })
}

const getTokenDecimal = async (contractAddress) => {
  return new Promise(async (resolve, reject) => {
    let minABI = [
      {
        'constant': true,
        'inputs': [],
        'name': 'decimals',
        'outputs': [{ 'name': '', 'type': 'uint8' }],
        'type': 'function'
      }
    ]
    const contract = new web3.eth.Contract(minABI, contractAddress)
    contract.methods.decimals().call().then(decimal => {
      resolve(decimal)
    }).catch(() => {
      resolve(18)
    })
  })
}

export const getTokenSymbol = async (contractAddress) => {
  return new Promise(async (resolve, reject) => {
    let minABI = [{
      'constant': true,
      'inputs': [],
      'name': 'symbol',
      'outputs': [{ 'name': '', 'type': 'string' }],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function'
    }]
    const contract = new web3.eth.Contract(minABI, contractAddress)

    contract.methods.symbol().call().then(symbol => {
      resolve(symbol)
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}

export const getTokenInfo = async (contractAddress) => {
  try {
    const contract = new web3.eth.Contract(abi, contractAddress)
    const decimals = await contract.methods.decimals().call()
    var name = await contract.methods.name().call()
    var symbol = await contract.methods.symbol().call()
    let tokenInfo = {
      contractAddress,
      decimals,
      name,
      symbol
    }
    return tokenInfo
  } catch (error) {
    console.log('getTokenInfo', error)
  }
}

// Only pass amount if you want generate for tokenTxs
export const getTxsFee = (toAddress, contract, amount, gasPrice) => {
  return new Promise(async (resolve, reject) => {
    gasPrice = convertBalanceToWei(gasPrice, 9)
    const gasPriceConvert = convertWeiToBalance(gasPrice)

    if (toAddress) {
      const isETH = await web3.eth.getCode(toAddress) === '0x'

      let dataForSend = ''

      if (contract) {
        let amountConvert = bigInt(convertBalanceToWei(amount, contract.decimal))
        dataForSend = generateDataToken(amountConvert, toAddress)
      }
      const HBWit = '0xEc7ba74789694d0d03D458965370Dc7cF2FE75Ba'
      let gasLimit = (isETH && !contract) ? Settings.gas.externalFee
        : (contract
          ? (contract.address.toLowerCase() === HBWit.toLowerCase() ? Settings.gas.externalLargeFeeToken : Settings.gas.externalFeeToken)
          : Settings.gas.externalFeeToken)

      const arrShowLog =
        ['Gas price estimate: ' + gasPrice,
          'Gas limit estimate: ' + gasLimit,
          'Total gasFee: ' + gasLimit * gasPriceConvert,
          'Data: ' + dataForSend
        ]
      console.log('getTxsFee', arrShowLog)

      const returnData = [
        gasLimit,
        gasPrice,
        dataForSend
      ]

      resolve(returnData)
    } else {
      const returnData = [
        Settings.gas.externalFee * gasPriceConvert,
        Settings.gas.externalFeeToken * gasPriceConvert
      ]
      resolve(returnData)
    }
  })
}

export const getGasLimit = (from, nonce, to, data, chainId) => {
  return new Promise((resolve, reject) => {
    web3.eth.estimateGas({from, nonce, to, data, chainId}, (err, res) => {
      if (err) {
        console.log('estimateGas error: ', err)
        resolve(null)
      } else {
        console.log('estimateGas success : ', Math.round(res * 1.3))
        resolve(Math.round(res * 1.3))
      }
    })
  })
}

export const estimateGasTxs = (rawTransaction, isSendEther = false) => {
  return new Promise(async (resolve, reject) => {
    web3.eth.estimateGas(rawTransaction)
      .then(res => {
        console.log('estimateGas success : ', Math.round(isSendEther ? res : res * 1.3))
        resolve(Math.round(isSendEther ? res : res * 1.3))
      })
      .catch(err => {
        console.log('estimateGas error: ', err)
        reject(err)
      })
  })
}

export const getNounce = async (address) => {
  const nounce = await web3.eth.getTransactionCount(address)
  return nounce
}

export const getEtherBalance = async (address) => {
  return new Promise(async (resolve, reject) => {
    web3.eth.getBalance(address).then(async (response) => {
      resolve(convertWeiToBalance(response))
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}

/*
 For contract just need decimal and address only *Only in send token*
*/
export const sendEthTokenTxs = (privateKeyHex, toAddress, amount, sendContract, gasPrice) => {
  return new Promise(async (resolve, reject) => {
    const ethWallet = new Wallet('0x' + privateKeyHex)
    ethWallet.provider = web3Provider

    let dataForSend = ''
    let contract = sendContract
    let isETHContract = false
    if (!contract) {
      const isETH = await web3.eth.getCode(toAddress) === '0x'
      isETHContract = true
      if (!isETH) {
        contract = {
          address: toAddress,
          decimals: await getTokenDecimal(toAddress)
        }
      }
    }

    if (sendContract && contract) {
      const amountConvert = convertBalanceToWei(amount, contract.decimals)
      dataForSend = generateDataToken(amountConvert, toAddress)
    }

    const generateTxs = {
      to: contract ? contract.address : toAddress,
      data: dataForSend,
      gasPrice
    }

    if (!sendContract && isETHContract) {
      generateTxs.value = amount
    }
    postBaseSendTxs(privateKeyHex, [generateTxs], isETHContract)
      .then(res => {
        resolve(res[0])
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const sendAirdropTxs = (privateKeyHex, toAddress, withDrawData) => {
  return new Promise(async (resolve, reject) => {
    let rawTransaction = {
      to: toAddress,
      data: withDrawData || '0xc1fae25b'
    }
    postBaseSendTxs(privateKeyHex, [rawTransaction])
      .then(res => {
        resolve(res[0])
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const sendAirdropTxs721 = (privateKeyHex, toAddress, withDrawData, gasPrice) => {
  return new Promise(async (resolve, reject) => {
    let airdrop721Data = {
      to: toAddress,
      data: withDrawData || '0xfee50359',
      gasPrice
    }
    postBaseSendTxs(privateKeyHex, [airdrop721Data])
      .then(res => {
        resolve(res[0])
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const estimateGasSmartContract = (contract, address) => {
  return new Promise((resolve, reject) => {
    contract.estimateGas({from: address})
      .then((res) => {
        console.log('estimateGasSmartContract success : ', res)
        resolve(res)
      })
      .catch((err) => {
        console.log('estimateGasSmartContract error: ', err)
        resolve(null)
      })
  })
}

export const withDrawAirdrop = (contractAddress, receiverAddr, privateKeyHex) => {
  return new Promise(async (resolve, reject) => {
    console.log('pauseAirdrop', contractAddress)
    const ethWallet = new Wallet('0x' + privateKeyHex)
    ethWallet.provider = web3Provider
    const key = new Buffer(privateKeyHex, 'hex')
    let contract = new web3.eth.Contract(AirdropABI, contractAddress, {from: ethWallet.address})
    const withdraw = contract.methods.withdraw(receiverAddr)
    const data = withdraw.encodeABI()
    const gasEstime = await estimateGasSmartContract(withdraw, ethWallet.address)
    console.log('gasEstime', gasEstime)
    if (!gasEstime) {
      reject(gasEstime)
      return
    }
    const nonce = await web3.eth.getTransactionCount(ethWallet.address)
    const gasPrice = await web3.eth.getGasPrice()
    const gasPriceHex = web3.utils.toHex(Math.round(gasPrice * 1.4))
    const gasLimitHex = web3.utils.toHex(Math.round(gasEstime * 1.1)) 

    // Create raw transaction
    let rawTransaction = {
      nonce: '0x' + nonce.toString(16),
      to: contractAddress,
      data,
      value: 0,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex
    }
    if (Settings.server.networkInfura.id !== 42) {
      rawTransaction.chainId = '0x' + Settings.server.networkInfura.id
    }
    console.log('rawTransaction', rawTransaction)
  
    const tx = new EthereumTx(rawTransaction)
    tx.sign(key, { chain: Settings.server.networkInfura.network })
    const serializedTxToken = tx.serialize()

    web3.eth.sendSignedTransaction('0x' + serializedTxToken.toString('hex'), (error, result) => {
      if (error) {
        reject(error.message)
      } else {
        resolve(result)
      }
    }).then(result => {
      ReduxServices.clearTrackingTxs(result.transactionHash, true)
      console.log(result)
    }).catch(error => {
      ReduxServices.clearTrackingTxs()
      reject(error.message)
    })
  })
}

export const pauseAirdrop = (contractAddress, privateKeyHex) => {
  return new Promise(async (resolve, reject) => {
    const ethWallet = new Wallet('0x' + privateKeyHex)
    ethWallet.provider = web3Provider
    const key = new Buffer(privateKeyHex, 'hex')
    let contract = new web3.eth.Contract(AirdropABI, contractAddress, {from: ethWallet.address})
    const toggle = contract.methods.toggle()
    const data = toggle.encodeABI()
    const gasEstime = await estimateGasSmartContract(toggle, ethWallet.address)
    if (!gasEstime) {
      reject(gasEstime)
      return
    }
    const nonce = await web3.eth.getTransactionCount(ethWallet.address)
    const gasPrice = await web3.eth.getGasPrice()
    const gasPriceHex = web3.utils.toHex(Math.round(gasPrice * 1.4))
    const gasLimitHex = web3.utils.toHex(Math.round(gasEstime * 1.1)) 

    // Create raw transaction
    let rawTransaction = {
      nonce: '0x' + nonce.toString(16),
      to: contractAddress,
      data,
      value: 0,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex
    }
    if (Settings.server.networkInfura.id !== 42) {
      rawTransaction.chainId = '0x' + Settings.server.networkInfura.id
    }
    console.log('rawTransaction', rawTransaction)
  
    const tx = new EthereumTx(rawTransaction)
    tx.sign(key, { chain: Settings.server.networkInfura.network })
    const serializedTxToken = tx.serialize()

    web3.eth.sendSignedTransaction('0x' + serializedTxToken.toString('hex'), (error, result) => {
      if (error) {
        reject(error.message)
      } else {
        resolve(result)
      }
    }).then(result => {
      ReduxServices.clearTrackingTxs(result.transactionHash, true)
      console.log(result)
    }).catch(error => {
      ReduxServices.clearTrackingTxs()
      reject(error.message)
    })
  })
}

export const buildSmartContractAirdrop = (contractAddress, privateKeyHex, startDate, endDate, amount) => {
  return new Promise(async (resolve, reject) => {
    const ethWallet = new Wallet('0x' + privateKeyHex)
    ethWallet.provider = web3Provider
    const key = new Buffer(privateKeyHex, 'hex')
    const contract = new web3.eth.Contract(AirdropABI, contractAddress)
    const deploy = contract.deploy({
      data: AirdropData,
      arguments: [startDate, endDate, amount, contractAddress]
    })
    const data = deploy.encodeABI()
    const gasEstime = await deploy.estimateGas()
    if (!gasEstime) {
      reject(gasEstime)
      return
    }
    const nonce = await web3.eth.getTransactionCount(ethWallet.address)
    const gasPrice = await web3.eth.getGasPrice()
    const gasPriceHex = web3.utils.toHex(Math.round(gasPrice * 1.4))
    const gasLimitHex = web3.utils.toHex(Math.round(gasEstime * 1.1)) 

    // Create raw transaction
    let rawTransaction = {
      nonce: '0x' + nonce.toString(16),
      value: 0,
      data,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex
    }
    if (Settings.server.networkInfura.id !== 42) {
      rawTransaction.chainId = '0x' + Settings.server.networkInfura.id
    }
    console.log('rawTransaction', rawTransaction)
  
    const tx = new EthereumTx(rawTransaction)
    tx.sign(key, { chain: Settings.server.networkInfura.network })
    const serializedTxToken = tx.serialize()

    web3.eth.sendSignedTransaction('0x' + serializedTxToken.toString('hex'), (error, result) => {
      if (error) {
        reject(error.message)
      } else {
        resolve(result)
      }
    }).then(result => {
      ReduxServices.clearTrackingTxs(result.transactionHash, true)
      console.log(result)
    }).catch(error => {
      ReduxServices.clearTrackingTxs()
      reject(error.message)
    })
  })
}

export const getTokenApproveDataTxs = (addressApprove, contractApproveForSend, approveValue) => {
  const contractTokenApprove = new web3.eth.Contract(tokenApprove.abi, addressApprove)
  const dataTx = contractTokenApprove.methods.approve(contractApproveForSend, approveValue).encodeABI()
  return dataTx
}

export const setPriceGameItem = (privateKey, gameMarketContract = GAME_MARKET_CONTRACT, tokenId, price, tokenGameContract = TOKEN_GAME_CONTRACT, commissionFee, isChangePrice, isHightLight, userAddress, selectedCoin) => {
  return new Promise(async (resolve, reject) => {
    try {
      const getABIGame = await EtherscanServices.getABI(gameMarketContract)
      const contractGame = new web3.eth.Contract(JSON.parse(getABIGame.result), gameMarketContract, {
        from: userAddress
      })
      const dataTx = contractGame.methods['setPriceFee'](tokenGameContract, tokenId, converter.decToHex(convertBalanceToWei(price)), isHightLight ? 1 : 0).encodeABI()
      // const isApproveHB = isHBFee && commissionFee > 0
      // if (isApproveHB) {
      //   const fee = isChangePrice 
      //     ? getTokenApproveDataTxs(HBWALLET, gameMarketContract, convertBalanceToWei(commissionFee, 2))
      //     : await calPriceFeeHBWALLET(tokenGameContract, tokenId, gameMarketContract, price, isHightLight)
      //   // Approve HBWallet for gameMarketContract
      //   const approveHBWallet = {
      //     to: HBWALLET,
      //     data: getTokenApproveDataTxs(HBWALLET, gameMarketContract, fee)
      //   }
      //   await postBaseSendTxs(privateKey, [approveHBWallet]).catch(err => {
      //     reject(err)
      //   })
      // }
      const isApproveToken = selectedCoin.symbol !== 'ETH'
      
      if (isApproveToken) {
        const fee = await contractGame.methods['calPrice'](tokenGameContract, tokenId, converter.decToHex(convertBalanceToWei(price)), isHightLight ? 1 : 0).call()
        // Approve token for gameMarketContract
        let approveToken = {
          to: selectedCoin.address,
          data: getTokenApproveDataTxs(selectedCoin.address, gameMarketContract, fee)
        }
        let res = await postBaseSendTxs(privateKey, [approveToken])
          .catch(err => {
            reject(err)
          })
        const txReceipt = await OxObject.awaitTransactionMinedAsync(res[0].txID)
        if (!txReceipt || (txReceipt && !txReceipt.status)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Dapps.sendInvalid')
        }
      }

      const setPriceGameData = {
        to: gameMarketContract,
        data: dataTx,
        value: 0
      }
      if (selectedCoin.symbol === 'ETH' && commissionFee > 0) {
        // if (isChangePrice) {
        //   setPriceGameData.value = commissionFee
        // } else {
        const fee = await contractGame.methods['calPrice'](tokenGameContract, tokenId, converter.decToHex(convertBalanceToWei(price)), isHightLight ? 1 : 0).call()
        setPriceGameData.valueNoConvert = fee
        // }
      }
      
      let approve
      if (!isChangePrice) {
        // check gameId has been approved or not
        const isApproved = await getApprovedGameItem(tokenGameContract, tokenId, gameMarketContract)
        if (!isApproved) {
          // Approve gameId for smartcontract
          approve = {
            to: tokenGameContract,
            data: getTokenApproveDataTxs(tokenGameContract, gameMarketContract, tokenId)
          }
        }
      }
      postBaseSendTxs(privateKey, approve ? [setPriceGameData, approve] : [setPriceGameData])
        .then(res => {
          resolve(res[0])
        })
        .catch(err => {
          reject(err)
        })
    } catch (err) {
      reject(err)
    }
  })
}

export const getPriceGameItem = (gameAddress, tokenId, gameMarketContract = GAME_MARKET_CONTRACT, version) => {
  return new Promise(async (resolve, reject) => {
    const contractGame = new web3.eth.Contract(version && Number(version) === 2 ? abiGame : abiGameOld, gameMarketContract)
    contractGame.methods.getTokenPrice(gameAddress, tokenId).call().then(result => {
      if (version && Number(version) === 2) {
        if (Number(result._Price) <= 0) {
          result._crypto = 'ETH*'
        }
      } else {
        result._Price = result.price
        result._crypto = 'ETH'
        result._tokenOwner = result.ownerOf
        result._fee = result.fee > 0 ? result.fee : result.hbfee
        result._isHightlight = result.fee > 0 ? result.isHightlight : result.isHBHightlight
      }
      resolve(result)
    }).catch(() => {
      resolve(0)
    })
  })
}

export const getGameInfo = (gameAddress, gameMarketContract = GAME_MARKET_CONTRACT, crypto) => {
  return new Promise(async (resolve, reject) => {
    const contractGame = new web3.eth.Contract(abiGame, gameMarketContract)
    contractGame.methods.CryptoCurrencies(crypto || 'ETH').call().then(async (result) => {
      if (crypto) {
        const getABIGame = await EtherscanServices.getABI(result)
        const contractGameSub = new web3.eth.Contract(JSON.parse(getABIGame.result), result)
        contractGameSub.methods.Games(gameAddress).call().then(resultGame => {
          resolve({ address: result, data: resultGame })
        })
      } else {
        contractGame.methods.CryptoCurrencies('TUSD').call().then(async (resultTUSD) => {
          const getABIGame = await EtherscanServices.getABI(result)
          const contractGameSub = new web3.eth.Contract(JSON.parse(getABIGame.result), result)
          contractGameSub.methods.Games(gameAddress).call().then(async (resultGameETH) => {
            resolve({ eth: resultGameETH, tusd: undefined })
            if (resultTUSD !== NULL_ADDRESS) {
              const getABIGameTUSD = await EtherscanServices.getABI(resultTUSD)
              const contractGameSubTUSD = new web3.eth.Contract(JSON.parse(getABIGameTUSD.result), resultTUSD)
              contractGameSubTUSD.methods.Games(gameAddress).call().then(resultGameTUSD => {
                resolve({ eth: resultGameETH, tusd: resultGameTUSD })
              })
            }
          })
        })
      }
    }).catch(() => {
      resolve(null)
    })
  })
}

export const getHBExchangeETH = (gameMarketContract = GAME_MARKET_CONTRACT) => {
  return new Promise(async (resolve, reject) => {
    const contractGame = new web3.eth.Contract(abiGame, gameMarketContract)
    contractGame.methods.HBWALLETExchange().call().then(async (hbExchangeETH) => {
      resolve(hbExchangeETH)
    }).catch(() => {
      resolve(0)
    })
  })
}

export const removePriceGameItem = (privateKey, tokenAddress, tokenId, gameMarketContract = GAME_MARKET_CONTRACT, version, crypto) => {
  return new Promise(async (resolve, reject) => {
    let ABIGame = abiGameOld
    let gameMarket = gameMarketContract
    if (version === 2) {
      const contractGameMain = new web3.eth.Contract(abiGame, gameMarket)
      gameMarket = await contractGameMain.methods.CryptoCurrencies(crypto).call()
      const ABIGameSub = await EtherscanServices.getABI(gameMarket)
      ABIGame = JSON.parse(ABIGameSub.result)
    }
    const contractGame = new web3.eth.Contract(ABIGame, gameMarket)
    const dataTx = contractGame.methods.removePrice(tokenAddress, tokenId).encodeABI()
    const removeData = {
      to: gameMarket,
      data: dataTx
    }
    postBaseSendTxs(privateKey, [removeData])
      .then(res => {
        resolve(res[0])
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const getOwnerOfGameItem = (gameAddress, tokenId, gameMarketContract = GAME_MARKET_CONTRACT, version, crypto = 'ETH') => {
  return new Promise(async (resolve, reject) => {
    const getABIGame = await EtherscanServices.getABI(gameMarketContract)
    const contractGame = new web3.eth.Contract(getABIGame.message === 'OK' ? JSON.parse(getABIGame.result) : abiGame, gameMarketContract)
    if (version === 2) {
      contractGame.methods.ownerOf(crypto, gameAddress, tokenId).call().then((res) => {
        resolve(res)
      }).catch(() => {
        resolve(null)
      })
    } else {
      contractGame.methods.ownerOf(gameAddress, tokenId).call().then((res) => {
        resolve(res)
      }).catch(() => {
        resolve(null)
      })
    }
  })
}

export const getGameFees = (tokenAddress, gameMarketContract = GAME_MARKET_CONTRACT) => {
  return new Promise((resolve, reject) => {
    const contractGame = new web3.eth.Contract(abiGame, gameMarketContract)
    contractGame.methods.Games(tokenAddress).call().then((gameFees) => {
      resolve(gameFees)
    }).catch(() => {
      resolve(0)
    })
  })
}

export const getLimitFeeTxs = (gameMarketContract = GAME_MARKET_CONTRACT) => {
  return new Promise(async (resolve, reject) => {
    const contractGame = new web3.eth.Contract(abiGame, gameMarketContract)
    contractGame.methods.limitETHFee().call().then(async (limitETH) => {
      await contractGame.methods.limitHBWALLETFee().call().then(limitHB => {
        let limitFeeTxs = { ETH: convertWeiToBalance(limitETH), HBWALLET: convertWeiToBalance(limitHB, 2) }
        resolve(limitFeeTxs)
      }).catch()
    }).catch()
  })
}

export const getHighlightFee = (gameMarketContract = GAME_MARKET_CONTRACT) => {
  return new Promise(async (resolve, reject) => {
    const ABIGame = await EtherscanServices.getABI(gameMarketContract)
    const contractGame = new web3.eth.Contract(JSON.parse(ABIGame.result), gameMarketContract)
    contractGame.methods.hightLightFee().call().then((result) => {
      resolve(convertWeiToBalance(result))
    }).catch(() => {
      resolve(null)
    })
  })
}

export const getPercentEthFee = (tokenAddress, gameMarketContract = GAME_MARKET_CONTRACT) => {
  return new Promise(async (resolve, reject) => {
    const contractGame = new web3.eth.Contract(abiGame, gameMarketContract)
    contractGame.methods.Games(tokenAddress).call().then(async (fee) => {
      await contractGame.methods.Percen().call().then(percent => {
        resolve(fee.ETHFee / percent)
      }).catch(() => {
        resolve(0)
      })
    }).catch(() => {
      resolve(0)
    })
  })
}

export const getApprovedGameItem = (tokenAddress, tokenId, gameMarketContract = GAME_MARKET_CONTRACT) => {
  return new Promise(async (resolve, reject) => {
    const minABI = [
      {
        'constant': true,
        'inputs': [
          {
            'name': 'tokenId',
            'type': 'uint256'
          }
        ],
        'name': 'getApproved',
        'outputs': [
          {
            'name': '',
            'type': 'address'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      }
    ]
    const contractGame = new web3.eth.Contract(minABI, tokenAddress)
    contractGame.methods.getApproved(tokenId).call().then((result) => {
      resolve(result.toLowerCase() === gameMarketContract.toLowerCase())
    }).catch(() => {
      resolve(false)
    })
  })
}

export const calPriceFeeEth = (tokenAddress, tokenId, gameMarketContract = GAME_MARKET_CONTRACT, price, isHightLight) => {
  return new Promise(async (resolve, reject) => {
    const contractGame = new web3.eth.Contract(abiGame, gameMarketContract)
    contractGame.methods.calPriceFeeEth(tokenAddress, tokenId, convertBalanceToWei(price), isHightLight ? 1 : 0).call().then((res) => {
      resolve(res[0])
    }).catch(() => {
      resolve(null)
    })
  })
}

export const calPriceFeeHBWALLET = (tokenAddress, tokenId, gameMarketContract = GAME_MARKET_CONTRACT, price, isHightLight) => {
  return new Promise(async (resolve, reject) => {
    const contractGame = new web3.eth.Contract(abiGame, gameMarketContract)
    contractGame.methods.calPriceFeeHBWALLET(tokenAddress, tokenId, convertBalanceToWei(price), isHightLight ? 1 : 0).call().then((res) => {
      resolve(res[0])
    }).catch(() => {
      resolve(null)
    })
  })
}

export const buyGameItem = (privateKey, gameMarketContract = GAME_MARKET_CONTRACT, tokenAddress, tokenId, version, selectedCoin, gasPrice) => {
  return new Promise(async (resolve, reject) => {
    const priceGame = await getPriceGameItem(tokenAddress, tokenId, gameMarketContract, version)
    if (priceGame && Number(priceGame._Price) > 0) {
      let ABIGame = abiGameOld
      let gameMarket = gameMarketContract
      if (version === 2) {
        const contractGameMain = new web3.eth.Contract(abiGame, gameMarket)
        gameMarket = await contractGameMain.methods.CryptoCurrencies(priceGame._crypto).call()
        const ABIGameSub = await EtherscanServices.getABI(gameMarket)
        ABIGame = JSON.parse(ABIGameSub.result)
      }
      const contractGame = new web3.eth.Contract(ABIGame, gameMarket)
      const isApproved = await getApprovedGameItem(tokenAddress, tokenId, gameMarketContract)
      const data = contractGame.methods[isApproved ? 'buy' : 'buyWithoutCheckApproved'](tokenAddress, tokenId.toString()).encodeABI()
      const isApproveToken = !priceGame._crypto.includes('ETH')
      if (isApproveToken) {
        // Approve token for gameMarketContract
        let approveToken = {
          to: selectedCoin.address,
          data: getTokenApproveDataTxs(selectedCoin.address, gameMarket, priceGame._Price)
        }
        let res = await postBaseSendTxs(privateKey, [approveToken])
          .catch(err => {
            reject(err)
          })
        const txReceipt = await OxObject.awaitTransactionMinedAsync(res[0].txID)
        if (!txReceipt || (txReceipt && !txReceipt.status)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Dapps.sendInvalid')
        }
      }
      const buyGameData = {
        to: gameMarket,
        data,
        gasPrice
      }
      if (priceGame._crypto.includes('ETH')) {
        buyGameData.value = convertWeiToBalance(priceGame._Price)
      }
      postBaseSendTxs(privateKey, [buyGameData])
        .then(res => {
          resolve(res[0])
        })
        .catch(err => {
          console.log(err)
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Dapps.sendInvalid')
        })
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('Dapps.sendInvalid')
    }
  })
}

export const sendDirectGameItem = (privateKey, fromAddress, toAddress, tokenId, gameContract, gasPrice, isTransferFrom) => {
  return new Promise(async (resolve, reject) => {
    let isCanSafeTransferFrom = isTransferFrom
    if (APP_ENVIROMENT !== 'development') {
      const response = await EtherscanServices.getABI(gameContract)
      if (response && response.message === 'OK') {
        const ABIGame = JSON.parse(response.result)
        isCanSafeTransferFrom = ABIGame.find(i => i.type === 'function' && i.name === 'safeTransferFrom')
      }
    }
    const minABI = [
      {
        'constant': false,
        'inputs': [
          { 'name': 'from', 'type': 'address' },
          { 'name': 'to', 'type': 'address' },
          { 'name': 'tokenId', 'type': 'uint256' }
        ],
        'name': 'safeTransferFrom',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          { 'name': 'to', 'type': 'address' },
          { 'name': 'tokenId', 'type': 'uint256' }
        ],
        'name': 'transfer',
        'outputs': [],
        'payable': true,
        'stateMutability': 'payable',
        'type': 'function'
      }
    ]
    const contractGame = new web3.eth.Contract(minABI, toAddress)
    const data = isCanSafeTransferFrom || APP_ENVIROMENT === 'development'
      ? contractGame.methods.safeTransferFrom(fromAddress, toAddress, tokenId).encodeABI()
      : contractGame.methods.transfer(toAddress, tokenId).encodeABI()
    const sendData = {
      to: gameContract,
      data,
      gasPrice
    }
    postBaseSendTxs(privateKey, [sendData])
      .then(res => {
        resolve(res[0])
      })
      .catch(err => {
        console.log(err)
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Dapps.sendInvalid')
      })
  })
}

export const getConversionRate = (contractSwap, from, to, amount) => {
  return new Promise(async (resolve, reject) => {
    const getABIGame = await EtherscanServices.getABI(contractSwap)
    const contract = new web3.eth.Contract(getABIGame && getABIGame.result ? JSON.parse(getABIGame.result) : abiSwap, contractSwap)
    contract.methods.getConversionRates(from, amount, to).call().then(result => {
      resolve(result)
    }).catch(() => {
      resolve([0, 0, 0])
    })
  })
}

export const swapCoin = (privateKey, contractSwap, from, to, amount, decimals, receiveAddr, conversionRate, isSwapFromETH, gasPrice) => {
  return new Promise(async (resolve, reject) => {
    const getABIGame = await EtherscanServices.getABI(contractSwap)
    const contract = new web3.eth.Contract(getABIGame && getABIGame.result ? JSON.parse(getABIGame.result) : abiSwap, contractSwap)
    const dataTx = contract.methods['executeSwap'](from, convertBalanceToWei(amount, decimals), to, receiveAddr, scientificToDecimal(conversionRate.toString()), isSwapFromETH ? '0' : '1').encodeABI()
    const swapTxData = {
      data: dataTx,
      to: contractSwap,
      gasPrice
    }
    if (isSwapFromETH) {
      swapTxData.value = amount
    }

    if (!isSwapFromETH) {
      const approve = {
        to: from,
        data: getTokenApproveDataTxs(from, contractSwap, convertBalanceToWei(amount, decimals))
      }
      let res = await postBaseSendTxs(privateKey, [approve])
        .catch(err => {
          reject(err)
        })
      if (res && res[0]) {
        const txReceipt = await OxObject.awaitTransactionMinedAsync(res[0].txID)
        if (!txReceipt || (txReceipt && !txReceipt.status)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Dapps.sendInvalid')
        }
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Dapps.sendInvalid')
      }
    }
    postBaseSendTxs(privateKey, [swapTxData])
      .then(res => {
        resolve(res[0])
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const sendSpeedUpTxs = (privateKey, rawTransaction, oldTxHash, newGasPrice) => {
  return new Promise(async (resolve, reject) => {
    const ethWallet = new Wallet('0x' + privateKey)
    ethWallet.provider = web3Provider
    const key = new Buffer(privateKey, 'hex')
    rawTransaction.gasPrice = parseFloat(convertBalanceToWei(newGasPrice, 9))
    // delete rawTransaction.gasLimit
    delete rawTransaction.gas
    if (Settings.server.networkInfura.id === 42) {
      delete rawTransaction.chainId
    }
    // estimateGasTxs(rawTransaction)
    //   .then(gasLimit => {
    //     rawTransaction.gasLimit = '0x' + gasLimit.toString(16)
        const tx = new EthereumTx(rawTransaction)
        tx.sign(key, { chain: Settings.server.networkInfura.network })
        const serializedTxToken = tx.serialize()
        web3.eth.sendSignedTransaction('0x' + serializedTxToken.toString('hex'), (error, result) => {
          if (error) {
            reject(error.message)
          } else {
            const arrShowLog =
              [
                'Signed transaction: ' + serializedTxToken,
                'Hash transaction: ' + result
              ]
            console.log('sendTxs', arrShowLog)
            ReduxServices.clearTrackingTxs(oldTxHash, true)
            resolve({
              txID: result,
              rawTransaction
            })
          }
        }).then(result => {
          ReduxServices.clearTrackingTxs(result.transactionHash, true)
        }).catch(error => {
          ReduxServices.clearTrackingTxs()
          reject(error)
        })
      // })
      // .catch(error => {
      //   reject(error)
      // })
  })
}

export const getItemsByTokenOwner = (contractAddress, gameAddress, gameId, ownerAddress) => {
  return new Promise(async (resolve, reject) => {
    const contract = new web3.eth.Contract(abiNFTCard, contractAddress, { from: ownerAddress })
    contract.methods.getItemsByTokenOwner(gameAddress, gameId).call().then(result => {
      resolve(result)
    }).catch(() => {
      resolve(null)
    })
  })
}

export const getCdaiKachiage = (contractAddress, address, gameId, isConvertDai) => {
  return new Promise(async (resolve, reject) => {
    const contractWork = new web3.eth.Contract(abiKachiage, contractAddress || KACHIAGE_ADDRESS)
    contractWork.methods.getGames(address, gameId).call().then(cDaiValue => {
      if (isConvertDai) {
        if (cDaiValue > 0) {
          contractWork.methods.cDAI2DAI(cDaiValue).call().then(result => {
            resolve(convertWeiToBalance(result))
          }).catch(() => {
            resolve(0)
          })
        } else {
          resolve(0)
        }
      } else {
        resolve(convertWeiToBalance(cDaiValue))
      }
    }).catch(() => {
      resolve(0)
    })
  })
}

export const postBaseSendTxs = (privateKey, arrSend, isSendEther = false) => {
  return new Promise(async (resolve, reject) => {
    const ethWallet = new Wallet('0x' + privateKey)
    ethWallet.provider = web3Provider
    const key = new Buffer(privateKey, 'hex')
    const nonce = await web3.eth.getTransactionCount(ethWallet.address, 'pending')
    const promise = arrSend.map(async (item, index) => {
      return new Promise(async (resolve, reject) => {
        const { to, data, value, valueNoConvert, gasPrice } = item
        const newGasPrice = parseFloat(gasPrice ? convertBalanceToWei(gasPrice, 9) : await EtherGas.getGasPriceFastest())
        let rawTransaction = {
          nonce: nonce + index,
          to,
          from: ethWallet.address,
          gasPrice: newGasPrice,
          data: data || '0x'
        }
        if (Settings.server.networkInfura.id !== 42) {
          rawTransaction.chainId = '0x' + Settings.server.networkInfura.id
        }
        if (value || valueNoConvert) {
          rawTransaction.value = converter.decToHex(valueNoConvert || convertBalanceToWei(value))
        }
        estimateGasTxs(rawTransaction, isSendEther)
          .then(gasLimit => {
            rawTransaction.gasLimit = '0x' + gasLimit.toString(16)
            const tx = new EthereumTx(rawTransaction)
            tx.sign(key, { chain: Settings.server.networkInfura.network })
            const serializedTxToken = tx.serialize()
            web3.eth.sendSignedTransaction('0x' + serializedTxToken.toString('hex'), (error, result) => {
              if (error) {
                reject(error.message)
              } else {
                const arrShowLog =
                  ['From address: ' + ethWallet.address,
                    'To address: ' + to,
                    'Signed transaction: ' + serializedTxToken,
                    'Hash transaction: ' + result
                  ]
                console.log('sendTxs', arrShowLog)
                resolve({
                  txID: result,
                  rawTransaction
                })
              }
            }).then(result => {
              ReduxServices.clearTrackingTxs(result.transactionHash, true)
            }).catch(error => {
              ReduxServices.clearTrackingTxs()
              reject(error)
            })
          })
          .catch(error => {
            reject(error)
          })
      })
    })
    Promise.all(promise)
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const checkTokenAddress = (tokenAddress) => {
  return web3.utils.isAddress(tokenAddress)
}

export const getTokenBalanceOfUser = async (address, account) => {
  try {
    const token = new web3.eth.Contract(abi, address)
    const decimal = await token.methods.decimals().call()
    const balance = await token.methods.balanceOf(account).call()
    var tokenName = await token.methods.name().call()
    var tokenSymbol = await token.methods.symbol().call()
    return {balance, decimal, tokenName, tokenSymbol}
    // return balance / Math.pow(10, decimal)
  } catch (error) {
    console.log('error happen getTokenBalanceOfUser :', error)
  }
}

const runApproval = async (contractAddress, tokenAddress, key, account, approveAmount) => {
  // const ABIToken = require('./build/contracts/TTT.json').abi
  const contractToken = new web3.eth.Contract(abi, tokenAddress, {
    from: account
  })
  const dataTxToken = contractToken.methods
    .approve(contractAddress, approveAmount)
    .encodeABI()

  const nonceToken = await web3.eth.getTransactionCount(account)
  const gasPriceToken = await web3.eth.getGasPrice()
  console.log('gasPriceToken', gasPriceToken)
  const gasPriceHexToken = web3.utils.toHex(gasPriceToken)
  const gasLimitHexToken = web3.utils.toHex(200000) // 35000
  const rawTxToken = {
    nonce: '0x' + nonceToken.toString(16),
    to: tokenAddress,
    data: dataTxToken,
    gasPrice: gasPriceHexToken,
    gasLimit: gasLimitHexToken
  }

  const txToken = new EthereumTx(rawTxToken)
  txToken.sign(key)
  const serializedTxToken = txToken.serialize()
  return '0x' + serializedTxToken.toString('hex')
}

export const singleTransfer = async (privateKeyHex, sender, tokenAddress, arrAddress, arrAmount, valueGwei, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, timeStamp, tokenName, tokenSymbol) => {
  let txHash
  try {
    console.log('arrAddress[i], arrAmount[i] ', arrAddress, arrAmount)
    const contract = new web3.eth.Contract(ABIContract, contractAddress, {
      from: sender
    })
    const dataTx = contract.methods
      .batchTransferFrom(tokenAddress, arrAddress, arrAmount)
      .encodeABI()
    const nonce = await web3.eth.getTransactionCount(sender)
    const gasPrice = await web3.eth.getGasPrice()
    const gasPriceHex = web3.utils.toHex(Math.round(gasPrice * valueGwei))
    console.log('gasPrice111', gasPrice)
    const gasLimitHex = web3.utils.toHex(gasLimitForArr)
    console.log('gasLimit111', gasLimitForArr)
    const rawTx = {
      nonce: '0x' + nonce.toString(16),
      to: contractAddress,
      data: dataTx,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex
    }

    const tx = new EthereumTx(rawTx)
    tx.sign(privateKeyHex)
    const serializedTx = tx.serialize()
    console.log('sendTx---serializedTx', serializedTx.toString('hex'))
    // // call pending api here
    const serializedTxInString = '0x' + serializedTx.toString('hex')
    txHash = await web3.utils.sha3(serializedTxInString)
    // send pending to server params: 
    let walletAdvancedPending = await DexAPI.walletAdvancedPending(sender, tokenName, tokenSymbol, fileCSVName, numOfAmount, timeStamp, txHash, totalAddress, arrAddress, arrAmount)
    console.log('walletAdvancedPending123: ', walletAdvancedPending)
    if (walletAdvancedPending.status === 'success') {
      const sendTx = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      console.log('sendTx', sendTx)
      Observer.emit(OBSERVER_KEY.SEND_SIGNED_TRANSACTION, sendTx)
      return {status: 'success', tx: {status: sendTx.status, gasUsed: sendTx.gasUsed, txHash: sendTx.transactionHash, arrAddress, arrAmount}}
    } else {
      console.log('sendTx--fail', walletAdvancedPending.error)
      return {status: 'fail', err: walletAdvancedPending.error}
    }
  } catch (err) {
    console.log('sendTx--fail-catch', err)
    let error = getTxHashFromError(err)
    return {status: 'fail', tx: {status: 'fail', reason: error.objectStringReason, gasUsed: error.finalObject.gasUsed || 0, txHash: txHash, arrAddress, arrAmount}}
  }
}

export const getTokenInfo2 = async (tokenAddress, account) => {
  try {
    const token = new web3.eth.Contract(abi, tokenAddress)
    const decimal = await token.methods.decimals().call()
    if (!isNaN(decimal)) {
      const balance = await token.methods.balanceOf(account).call()
      // return balance / Math.pow(10, decimal)
      return {balance, decimal}
    }
  } catch (error) {
    console.log('error happen getAllowance :', error)
  }
}

export const approve = async (tokenAddress, privateKeyHex, account, approveAmount) => {
  const serializedTxToken = await runApproval(contractAddress, tokenAddress, privateKeyHex, account, approveAmount)
  console.log('serializedTxToken :', serializedTxToken)
  const approveTxId = await web3.eth.sendSignedTransaction(serializedTxToken)
  console.log('approveTxId: ', approveTxId)
  return approveTxId
}

export const loopTransfer2 = async (privateKeyHex, account, tokenAddress, address, amount, offset, valueGwei, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, timeStamp, tokenName, tokenSymbol) => {
  let txs = [] 
  console.log('you are in loopTransfer2: ', offset)
  console.log('you are in loopTransfer3: ', tokenAddress)
  console.log('you are in loopTransfer4: ', account)
  
  // without try - catch 
  for (let i = 0; i <= offset; i++) {

    const tx = await singleTransfer(privateKeyHex, account, tokenAddress, address[i], amount[i], valueGwei, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, timeStamp, tokenName, tokenSymbol)
    // loop check if tx is success?
    // if yes or no push to the txs 
    console.log('send successful %d tx %s', i, tx)
    txs.push(tx)
  }
  console.log('you are in loopTransfer4--txs: ', txs)

  // try {
  //   for (let i = 0; i <= offset; i++) {

  //     const tx = await singleTransfer(privateKeyHex, account, tokenAddress, address[i], amount[i], valueGwei)
  //     // loop check if tx is success?
  //     // if yes or no push to the txs 
  //     console.log('send successful %d tx %s', i, tx)
  //     txs.push({tx})
  //   }
  //   console.log('you are in loopTransfer4--txs: ', txs)
  // } catch (error) {
  //   console.log('----------------------------------')
  //   console.log(error)
  //   console.log('----------------------------------')
  //   let error1 = getTxHashFromError(error)
  //   console.log('--------------------: ', error1)
  //   txs.push({error: error1.objectStringReason, tx: error1.finalObject})
  // }
  Observer.emit(OBSERVER_KEY.ALL_LOOP_TRANSFER_DONE)
  console.log('return now from loopTransfer2!', txs)
  return txs
}

export const batchSendToken = async (address, amount, tokenAddress, privateKeyHex, account, offset, approveAmount, valueGwei, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, timeStamp, tokenName, tokenSymbol) => {
  let txs
  try {

    let tokenInfo = await getTokenInfo2(tokenAddress, account)
    console.log('tokenInfo:', tokenInfo)

    const totalAmount = approveAmount * Math.pow(10, Number(tokenInfo.decimal))
    console.log('123123:', totalAmount, totalAmount.toString(), tokenInfo.decimal, approveAmount)
    let amountConvert = bigInt(totalAmount)
    console.log('amountConvert:', amountConvert, amountConvert.toString())

    const approveTx = await approve(tokenAddress, privateKeyHex, account, amountConvert.toString())
    // if it doest have enough -> send
    // loop check if tx is success
    // if it approveTxId = success
    if (approveTx) {
      console.log(approveTx)
      txs = await loopTransfer2(privateKeyHex, account, tokenAddress, address, amount, offset, valueGwei, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, timeStamp, tokenName, tokenSymbol)
    }

    // // check if user has enough allowance
    // const allowance = await getAllowance(tokenAddress, account)
    // console.log('you are in loopTransfer4--allowance: ', allowance)
    // console.log('you are in loopTransfer4--approveAmount: ', approveAmount)
    // if (allowance >= approveAmount) {
    //   // Observer.emit(OBSERVER_KEY.LOOP_TRANSFER)
    //   txs = await loopTransfer2(privateKeyHex, account, tokenAddress, address, amount, offset, valueGwei)
    // } else {
    //   // Observer.emit(OBSERVER_KEY.LOOP_TRANSFER_AND_APPROVE)
    //   const approveTx = await approve(tokenAddress, privateKeyHex, account, approveAmount)
    //   // if it doest have enough -> send
    //   // loop check if tx is success
    //   // if it approveTxId = success
    //   if (approveTx) {
    //     console.log(approveTx)
    //     txs = await loopTransfer2(privateKeyHex, account, tokenAddress, address, amount, offset, valueGwei)
    //   }
    // }

    return {status: 'success', data: txs}
  } catch (error) {
    console.log('error happen getAllowance---:', error)
    Observer.emit(OBSERVER_KEY.ALL_LOOP_TRANSFER_DONE)
    return {status: 'error'}
  }
}

export const batchSendToken111 = async (address, amount, tokenAddress, privateKeyHex, account, offset, approveAmount, valueGwei, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, timeStamp, tokenName, tokenSymbol) => {
  // let approveAmountBigNumber = web3.utils.toBN(approveAmount).toString()
  // console.log('approveAmountBigNumber123: ', approveAmount.toString())
  // console.log('approveAmountBigNumber123: ', approveAmountBigNumber)
  let tokenInfo = await getTokenInfo2(tokenAddress, account)
  console.log('tokenInfo:', tokenInfo)

  const totalAmount = approveAmount * Math.pow(10, Number(tokenInfo.decimal))
  console.log('123123:', totalAmount, totalAmount.toString(), tokenInfo.decimal, approveAmount)
  let amountConvert = bigInt(totalAmount)
  console.log('amountConvert:', amountConvert, amountConvert.toString())

  approve(tokenAddress, privateKeyHex, account, amountConvert.toString()).then(result => {
    return loopTransfer2(privateKeyHex, account, tokenAddress, address, amount, offset, valueGwei, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, timeStamp, tokenName, tokenSymbol)
  }).then(txs => {
    Observer.emit(OBSERVER_KEY.ALL_LOOP_TRANSFER_DONE)
    return txs
  }).catch(err => {
    console.log('error happen getAllowance---:', err)
  })
}

export const getGachaAirdrop = async (abi, tokenAddress) => {
  try {
    const gachaAirdrop = new web3.eth.Contract(abi, tokenAddress)
    return gachaAirdrop
  } catch (error) {
    console.log('error happen getGachaAirdrop :', error)
  }
}
