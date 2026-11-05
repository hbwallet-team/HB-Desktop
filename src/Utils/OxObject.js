// import {
//   ZeroEx
// } from '0x.js'
// import {
//   BigNumber
// } from '@0xproject/utils'
// import {
//   HBCRYPTO,
//   GAS_PRICE_DEFAULT
// } from 'Utils/globalConstants'
// import * as ethUtil from 'ethereumjs-util'
// import {
//   formatNumberCalOld,
//   getLatestTx
// } from 'Utils/globalFunction'
// import DexAPI from 'Backend/Api/services/DexAPI'
// import EtherGas from 'Backend/Api/services/EtherGas'
// import Settings from 'Backend/settings'
// import {
//   getErrStr
// } from './0xError'
// import ABI from './ERC20ABI'
// import sleep from 'sleep-promise'
// import abiDecoder from 'abi-decoder' // NodeJS
// abiDecoder.addABI(ABI.ABI_ERC20)
// var PrivateKeyWalletSubprovider = require('@0xproject/subproviders').PrivateKeyWalletSubprovider
// var ProviderEngine = require('web3-provider-engine')
// var RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')
// var Web3Wrapper = require('@0xproject/web3-wrapper').Web3Wrapper

// const ETH_DECIMALS = 18
// const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1)

// let zeroEx
// let account
// let engine
// let configs
// let web3Wrapper

// let transactionOpts = {
//   gasPrice: new BigNumber(5000000000), // wei
//   gasLimit: 300000
// }

// const gasPriceDefault = {
//   slow: 3, // Gwei
//   medium: 4,
//   fast: 40
// }

// class OxObject {
//   init (mainAccount) {
//     if (zeroEx === undefined) {
//       account = mainAccount
//       try {
//         engine = new ProviderEngine()
//         engine.addProvider(new PrivateKeyWalletSubprovider(mainAccount.privateKey))
//         engine.addProvider(new RpcSubprovider({
//           rpcUrl: Settings.server.networkInfura.url
//         }))
//         engine.start()
//         configs = {
//           networkId: Settings.server.networkInfura.id
//         }
//         web3Wrapper = new Web3Wrapper(engine)
//         zeroEx = new ZeroEx(engine, configs)
//       } catch (error) {
//         console.log('OxObject init error: ', error)
//       }
//     }
//     console.log('init OxObject: ', zeroEx, account)
//     return zeroEx
//   }

//   resetProviderEngine () {
//     console.log('reset zeroEx')
//     zeroEx = undefined
//   }

//   getCurrentMainAddress () {
//     if (zeroEx !== undefined) {
//       return zeroEx.exchange._web3Wrapper._web3.currentProvider._providers[0]._address
//     } else {
//       return null
//     }
//   }

//   setGasPrice (gasPrice) {
//     // "gasPrice" in Gwei
//     console.log('setGasPrice: ', gasPrice, ' Gwei')
//     transactionOpts.gasPrice = new BigNumber(gasPrice).mul(Math.pow(10, 9))
//   }

//   async getGasPrice () {
//     let gasPrice = await DexAPI.getGasPrice()
//     if (gasPrice && gasPrice.fastest && typeof gasPrice === 'object') {
//       return {
//         slow: gasPrice.safeLow / 10,
//         medium: gasPrice.average / 10,
//         fast: gasPrice.fastest / 10
//       }
//     }
//     return {
//       slow: GAS_PRICE_DEFAULT.SAFELOW,
//       medium: GAS_PRICE_DEFAULT.AVERAGE,
//       fast: GAS_PRICE_DEFAULT.FASTEST
//     }
//   }

//   getGasLimit () {
//     return transactionOpts.gasLimit
//   }

//   async getTokenAddressBySymbolIfExistsAsync (strToken) {
//     const wethAddress = await zeroEx.tokenRegistry.getTokenAddressBySymbolIfExistsAsync(strToken)
//       .catch((error) => {
//         console.log('getTokenAddressBySymbolIfExistsAsync error: ', error)
//         var e = {
//           message: 'getTokenAddressBySymbolIfExistsAsync error ',
//           error: error.message
//         }
//         DexAPI.insertCrashLog(e)
//       })
//     return wethAddress
//   }

//   async convertEthToWrappedEthTokensAsync (wethAddress, amount) {
//     console.log('convertEthToWrappedEthTokensAsync: ', wethAddress, amount)
//     try {
//       const result = await zeroEx.etherToken.depositAsync(
//         wethAddress,
//         ZeroEx.toBaseUnitAmount(new BigNumber(Number(amount)), ETH_DECIMALS),
//         account.address,
//         transactionOpts
//       )
//       return result
//     } catch (error) {
//       // error = await getErrStr(error)
//       var e = {
//         message: 'convertEthToWrappedEthTokensAsync error ',
//         error: error
//       }
//       console.log('convertEthToWrappedEthTokensAsync - error: ', error)

//       DexAPI.insertCrashLog(e)
//       return {
//         error: error
//       }
//     }
//   }

//   async convertWrappedEthTokensToEthAsync (wethAddress, amount) {
//     console.log('convertWrappedEthTokensToEthAsync: ', wethAddress, amount)
//     try {
//       const result = await zeroEx.etherToken.withdrawAsync(
//         wethAddress,
//         ZeroEx.toBaseUnitAmount(new BigNumber(Number(amount)), ETH_DECIMALS),
//         account.address,
//         transactionOpts
//       )
//       return result
//     } catch (error) {
//       // error = await getErrStr(error)
//       var e = {
//         message: 'convertWrappedEthTokensToEthAsync error ',
//         error: error
//       }
//       console.log('convertWrappedEthTokensToEthAsync - error: ', error)

//       DexAPI.insertCrashLog(e)
//       return {
//         error: error
//       }
//     }
//   }

//   async awaitTransactionMinedAsync (txID) {
//     let txInfo = null
//     const txReceipt = await zeroEx.awaitTransactionMinedAsync(txID)
//     while (!txInfo) {
//       txInfo = await this.getTransaction(txID)
//       if (txInfo && txInfo.blockNumber !== null && txInfo.actualCost) {
//         break
//       }
//       await sleep(1 * 1000)
//     }
//     if (txInfo.token) {
//       txReceipt.token = txInfo.token
//       txReceipt.to = txInfo.receiver
//       txReceipt.contractAddress = txInfo.contractAddress
//     }
//     txReceipt.blockNumber = txInfo && txInfo.blockNumber ? txInfo.blockNumber : 0
//     txReceipt.fee = txInfo && txInfo.actualCost ? txInfo.actualCost : 0
//     txReceipt.value = txInfo && txInfo.value ? txInfo.value : 0
//     txReceipt.gasPrice = txInfo && txInfo.gasPrice ? txInfo.gasPrice : 0
//     return txReceipt
//   }

//   isValidECSignature (data, signature, signerAddress) {
//     const msgHashBuff = ethUtil.toBuffer(data)
//     const pubKey = ethUtil.ecrecover(
//       msgHashBuff,
//       signature.v,
//       ethUtil.toBuffer(signature.r),
//       ethUtil.toBuffer(signature.s)
//     )
//     const retrievedAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(pubKey))
//     return (retrievedAddress === signerAddress)
//   }

//   async printTokenList () {
//     const tokenList = await zeroEx.tokenRegistry.getTokensAsync()
//     console.log('Token list')
//     for (var i = 0; i < tokenList.length; i++) {
//       console.log(JSON.stringify(tokenList[i]))
//     }
//   }

//   async generateOrder (takerTokenAmount, makerTokenAmount, makerToken, takerToken, exprireDate) {
//     const exchangeContractAddress = await zeroEx.exchange.getContractAddress()
//     const salt = ZeroEx.generatePseudoRandomSalt()
//     // const accounts = await zeroEx.getAvailableAddressesAsync()
//     const accounts = await web3Wrapper.getAvailableAddressesAsync()
//     console.log('accounts', accounts)
//     const _address = accounts[0].toLowerCase()
//     const order = {
//       exchangeContractAddress: exchangeContractAddress.toLowerCase(),
//       maker: _address,
//       taker: '0x0000000000000000000000000000000000000000',
//       makerTokenAddress: makerToken.address.toLowerCase(),
//       takerTokenAddress: takerToken.address.toLowerCase(),
//       makerTokenAmount: new BigNumber(makerTokenAmount),
//       takerTokenAmount: new BigNumber(takerTokenAmount),
//       makerFee: new BigNumber(0),
//       takerFee: new BigNumber(0),
//       expirationUnixTimestampSec: new BigNumber(exprireDate),
//       feeRecipient: '0x0000000000000000000000000000000000000000',
//       salt: salt
//     }

//     const orderHash = ZeroEx.getOrderHashHex(order)

//     var ecSignature = await zeroEx.signOrderHashAsync(orderHash, accounts[0].toString(), false)
//     var isValid = ZeroEx.isValidSignature(orderHash, ecSignature, _address)
//     console.log('isValid: ', isValid, JSON.stringify(order, null, 2))
//     const fullOrder = {
//       signedOrder: {
//         ...order,
//         ecSignature: ecSignature
//       },
//       metadata: {
//         makerToken,
//         takerToken
//       }
//     }
//     return fullOrder
//   }

//   // convert sign order into correct format
//   formatSignOrder (rawSignOrder) {
//     rawSignOrder.makerTokenAmount = new BigNumber(parseFloat(rawSignOrder.makerTokenAmount).toString())
//     rawSignOrder.takerTokenAmount = new BigNumber(parseFloat(rawSignOrder.takerTokenAmount).toString())
//     rawSignOrder.makerFee = new BigNumber(parseFloat(rawSignOrder.makerFee).toString())
//     rawSignOrder.takerFee = new BigNumber(parseFloat(rawSignOrder.takerFee).toString())
//     rawSignOrder.expirationUnixTimestampSec = new BigNumber(parseFloat(rawSignOrder.expirationUnixTimestampSec).toString())
//     return rawSignOrder
//   }

//   // ZeroEx.toBaseUnitAmount(new BigNumber(Number(fillTakerTokenAmount)), ETH_DECIMALS),
//   async fillOrderAsync (orderJSON, fillTakerTokenAmount, isFillSell) {
//     const order = this.formatSignOrder(orderJSON.signedOrder)
//     let amountBaseUnit
//     try {
//       // Only if it's the case of fill a sell order when user wants to buy
//       if (isFillSell) {
//         // Suppose that seller of 1 ZRX (taken token) to receive 2 WETH (maker token)
//         // Buyer wants to buy 0.5 ZRX that corresponds to 1 WETH
//         // So, the fillOrderAsync() doesn't receive ZRX (taker token) amount, but it receives WETH (maker token) amount
//         // So, we must multiple "fillTakerTokenAmount" by the "price" because the input field "fillTakerTokenAmount"
//         // specifies the ZRX (taker token) amount.
//         // "price" = takerTokenAmount / makerTokenAmount
//         const originalSignedOrder = orderJSON.signedOrder
//         const price = originalSignedOrder.takerTokenAmount / originalSignedOrder.makerTokenAmount
//         fillTakerTokenAmount = formatNumberCalOld(fillTakerTokenAmount * price, 8)
//         amountBaseUnit = ZeroEx.toBaseUnitAmount(new BigNumber(fillTakerTokenAmount.toString()), orderJSON.metadata.makerToken.decimals)
//       } else {
//         amountBaseUnit = ZeroEx.toBaseUnitAmount(new BigNumber(fillTakerTokenAmount.toString()), orderJSON.metadata.takerToken.decimals)
//       }
//       console.log('amountBaseUnit:', amountBaseUnit)
//       console.log('order1', JSON.stringify(order, undefined, 2))
//       console.log('order:', order)
//       const txHash = await zeroEx.exchange.fillOrderAsync(
//         order,
//         amountBaseUnit,
//         true,
//         account.address.toLowerCase(),
//         transactionOpts
//       )
//       return txHash

//       // let txReceipt
//       // while (true) {
//       //   txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash)
//       //   if (txReceipt.blockNumber && txReceipt.blockNumber !== 0) {
//       //     break
//       //   }
//       //   await sleep(1 * 1000)
//       //   // console.log('fillOrderAsync - sleeping for 1s: ', txReceipt)
//       // }

//       // // status code, 0 indicating failure (due to any operation that can cause the transaction or top-level call to revert)
//       // // and 1 indicating success
//       // if (txReceipt.status === 1) {
//       //   console.log('fillOrderAsync - status OK - txReceipt: ', txReceipt)
//       // } else {
//       //   console.log('fillOrderAsync - status failed - txReceipt: ', txReceipt)
//       //   let error1 = {}
//       //   error1.message = 'Fill Order status ' + txReceipt.status
//       //   return error1
//       // }

//       // // const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash)
//       // console.log('fillOrderAsync - amountBaseUnit: ', amountBaseUnit.toString(), ', tx: ', txHash)
//       // txReceipt.fee = new BigNumber(txReceipt.gasUsed).mul(transactionOpts.gasPrice).div(Math.pow(10, 18))
//       // txReceipt.fee = txReceipt.fee.toString()
//       // return txReceipt
      
//     } catch (error) {
//       // error = await getErrStr(error)
//       console.log('fillOrderAsync - error: ', error)
//       error = error.toString().replace('Error:', '')
//       const orderHash = ZeroEx.getOrderHashHex(order)
//       var e = {
//         orderHash,
//         message: 'fillOrderAsync error ',
//         error: error
//       }
//       DexAPI.insertCrashLog(e)
//       return {
//         error: error
//       }
//     }
//   }

//   async cancelOrderAsync (orderJSON, cancelTakerTokenAmount) {
//     // let currentGasPrice = await this.getGasPrice()
//     console.log('orderJSON', orderJSON)
//     // transactionOpts.gasPrice = new BigNumber(currentGasPrice.medium * 2).mul(Math.pow(10, 9))
//     const order = this.formatSignOrder(orderJSON.signedOrder)
//     console.log('cancelOrderAsync: ', cancelTakerTokenAmount, new BigNumber(cancelTakerTokenAmount))
//     try {
//       const txHash = await zeroEx.exchange.cancelOrderAsync(
//         order,
//         ZeroEx.toBaseUnitAmount(new BigNumber(cancelTakerTokenAmount), orderJSON.metadata.makerToken.decimals),
//         transactionOpts
//       )

//       // const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash)
//       console.log('cancelOrderAsync: ', txHash)
//       let txReceipt
//       let txInfo
//       txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash)
//       while (!txInfo) {
//         txInfo = await this.getTransaction(txHash)
//         if (txInfo && txInfo.blockNumber > 0 && txInfo.actualCost) {
//           break
//         }
//         await sleep(1 * 1000)
//       }
//       console.log('cancelOrderAsync receipt ', txReceipt)
//       // txReceipt.fee = new BigNumber(txReceipt.gasUsed).mul(transactionOpts.gasPrice).div(Math.pow(10, 18))
//       txReceipt.blockNumber = txInfo && txInfo.blockNumber ? txInfo.blockNumber : 0
//       txReceipt.fee = txInfo && txInfo.actualCost ? txInfo.actualCost : 0
//       return txReceipt
//     } catch (error) {
//       // eslint-disable-next-line no-ex-assign
//       error = await getErrStr(error)
//       const orderHash = ZeroEx.getOrderHashHex(order)
//       var e = {
//         orderHash,
//         message: 'cancelOrderAsync error ',
//         error: error
//       }
//       DexAPI.insertCrashLog(e)
//       console.log('cancelOrderAsync ', error)
//       return {
//         error: error
//       }
//     }
//   }

//   async setUnlimitedProxyAllowanceAsync (tokenAddress, amount, decimal, isLock) {
//     try {
//       const txHash = await zeroEx.token.setProxyAllowanceAsync(
//         tokenAddress.toLowerCase(),
//         account.address.toLowerCase(),
//         ZeroEx.toBaseUnitAmount(new BigNumber(Number(isLock ? 0 : amount)), Number(decimal)),
//         transactionOpts
//       )
//       const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash)
//       console.log('setUnlimitedProxyAllowanceAsync: ', txReceipt.transactionHash, ', isLock: ', isLock)
//       return txReceipt
//     } catch (error) {
//       // error = await getErrStr(error)
//       var e = {
//         tokenAddress,
//         message: 'setUnlimitedProxyAllowanceAsync error ',
//         error: error
//       }
//       DexAPI.insertCrashLog(e)
//       return {
//         error: error
//       }
//     }
//   }

//   async hasProxyAllowanceAsync (tokenAddress) {
//     try {
//       const allowanceInBaseUnits = await zeroEx.token.getProxyAllowanceAsync(
//         tokenAddress.toLowerCase(),
//         account.address.toLowerCase()
//       )
//       const res = !allowanceInBaseUnits.isZero()
//       console.log('hasProxyAllowanceAsync: ', res)
//       return res
//     } catch (error) {
//       error = await getErrStr(error)
//       var e = {
//         message: 'hasProxyAllowanceAsync error ',
//         tokenAddress,
//         error: error
//       }
//       DexAPI.insertCrashLog(e)
//       return false
//     }
//   }

//   getTransaction (txID) {
//     return new Promise((resolve, reject) => {

//       web3Wrapper._web3.eth.getTransactionReceipt(txID, (err, receipt) => {
//         if (err) {
//           return resolve(null)
//         } else {
//           if (!receipt || (receipt && !receipt.gasUsed)) {
//             return resolve(null)
//           }
//           web3Wrapper._web3.eth.getTransaction(txID, async (err, tx) => {
//             if (err) {
//               return resolve(null)
//             } else {
//               if (!tx || !tx.gasPrice) {
//                 return resolve(null)
//               }
//               if (!receipt || (receipt && !receipt.gasUsed)) {
//                 return resolve(null)
//               }
//               let result = {
//                 value: tx.value.toNumber(),
//                 blockNumber: tx.blockNumber,
//                 actualCost: parseInt(tx.gasPrice) * parseInt(receipt.gasUsed),
//                 gasPrice: parseInt(tx.gasPrice)
//               }

//               if (receipt.logs && receipt.logs[0]) {
//                 var arr = [receipt.logs[0]]
//                 var log = abiDecoder.decodeLogs(arr)
//                 if (log && log.length > 0 && log[0]) {
//                   console.log('log[0]', log[0])
//                   let token = await this.getTokenInfo(log[0].address)
//                   result.contractAddress = log[0].address
//                   result.token = token
//                   result.event = log[0].name
//                   result.receiver = log[0].events[1].value
//                   if (log[0].name.toUpperCase() === 'TRANSFER') {
//                     result.value = log[0].events[2].value
//                   } else {
//                     result.value = log[0].events[1].value
//                   }
//                 }
//               }
//               return resolve(result)
//             }
//           })

//         }
//       })

//     })
//   }

//   getTokenDecimals (tokenContract) {
//     return new Promise((resolve, reject) => {
//       tokenContract.decimals((err, decimals) => {
//         if (err) {
//           reject(err)
//         } else {
//           console.log('symbol: ' + decimals.toString())
//           resolve(decimals)
//         }
//       })
//     })
//   }

//   getTokenSymbol (tokenContract) {
//     return new Promise((resolve, reject) => {
//       tokenContract.symbol((err, symbol) => {
//         if (err) {
//           reject(err)
//         } else {
//           console.log('symbol: ' + symbol.toString())
//           resolve(symbol)
//         }
//       })
//     })
//   }

//   getTokenName (tokenContract) {
//     return new Promise((resolve, reject) => {
//       tokenContract.name((err, name) => {
//         if (err) {
//           reject(err)
//         } else {
//           console.log('name: ' + name)
//           resolve(name)
//         }
//       })
//     })
//   }

//   async getTokenInfo (contractAddress) {
//     var tokenContract = web3Wrapper._web3.eth.contract(ABI.ABI_ERC20).at(contractAddress)
//     // console.log('contractAddress ' + contractAddress)
//     // console.log('tokenContract ' + tokenContract)
//     try {
//       let symbol = await this.getTokenSymbol(tokenContract)
//       let name = await this.getTokenName(tokenContract)
//       let decimals = await this.getTokenDecimals(tokenContract)
//       console.log('symbols ne :' + symbol)
//       console.log('name ne :' + name)
//       console.log('decimals ne :' + decimals)
//       let tokenInfo = {
//         decimals,
//         name,
//         symbol
//       }
//       return tokenInfo
//     } catch (error) {
//       return null
//     }
//   }

//   getTxReceipt (web3, txHash, mainAddress) {
//     return new Promise((resolve, reject) => {
//       web3.eth.getTransactionReceipt(txHash, async (err, res) => {
//         if (!err) {
//           if (res && res.status === '0x1') {
//             // console.log('getTransactionReceipt', res)
//             if (res.logs && res.logs.length > 1) {
//               resolve(null)
//             } else if (res.logs && res.logs.length > 0) {
//               var arr = [res.logs[0]]
//               var log = abiDecoder.decodeLogs(arr)
//               if (log && log.length > 0 && log[0]) {
//                 if (log.length === 3 && log[2].name.toUpperCase() === 'LOGFILL') {
//                   resolve(null)
//                 }
//                 if ((log[0].events[0].value.toLowerCase() === mainAddress.toLowerCase() || log[0].events[1].value.toLowerCase() === mainAddress.toLowerCase())) {
//                   // console.log('log:', log)
//                   log[0].hash = txHash
//                   let token = await this.getTokenInfo(log[0].address)
//                   log[0].token = token
//                   resolve(log[0])
//                 } else {
//                   resolve(null)
//                 }
//               } else {
//                 resolve(null)
//               }
//             } else {
//               if ((res.to && res.to.toLowerCase() === mainAddress.toLowerCase()) || (res.from && res.from.toLowerCase() === mainAddress.toLowerCase())) {
//                 resolve(res)
//               } else {
//                 resolve(null)
//               }
              
//             }
//           } else {
//             resolve(null)
//           }
//         } else {
//           resolve(null)
//         }
//       })
//     })
//   }

//   async handleTx (web3, blockNumber, mainAddress) {
//     return new Promise((resolve, reject) => {
//       try {
//         web3.eth.getBlock(blockNumber, async (err, block) => {
//           if (!err && block && block.transactions) {
//             let listTx = await this.getTransactionFromBlock(web3, block, mainAddress)
//             // save this block to
//             // await global.EtherDeposit.saveLastBlockNumberToDb(block.number);
//             resolve(listTx)
//           } else {
//             console.log('error at1 ', blockNumber, 'err', err)
//             resolve(null)
//           }
//           if (err) {
//             console.log('error at2 ', blockNumber, 'err', err)
//             resolve(null)
//           }
//         })
//       } catch (error) {
//         console.log('handleTx  error :', error)
//         resolve(null)
//       }
//     })
//   }

//   async getTransactionWeb3 (web3, txHash, block, mainAddress) {
//     return new Promise((resolve, reject) => {
//       web3.eth.getTransaction(txHash, async (err, tx) => {
//         if (!err) {
//           if (!tx) resolve(null)
//           if (tx) {
//             let txReceipt = await this.getTxReceipt(web3, txHash, mainAddress)
//             if (txReceipt && txReceipt.token) { // send/receive ERC20 token
//               resolve(txReceipt)
//             } else if (txReceipt) { // send/receive ETH
//               resolve(tx)
//             } else { // transaction failed
//               resolve(null)
//             }
//           } else {
//             resolve(null)
//           }
//         } else {
//           console.log('error get tx :', err)
//           resolve(null)
//         }
//       })
//     })
//   }

//   async getTransactionFromBlock (web3, block, mainAddress) {
//     const txs = block.transactions
//     // console.log('have ', txs.length, ' txs at block', block.number, txs)
//     let result = []
//     for (let i = 0; i < txs.length; i++) {
//       let txHash = await this.getTransactionWeb3(web3, txs[i], block, mainAddress)
//       txHash && result.push(txHash)
//     }
//     return result
//   }

//   getBlockTs (web3) {
//     return new Promise((resolve, reject) => {
//       web3.eth.getBlockNumber((err, res) => {
//         if (!err) {
//           resolve(res)
//         } else {
//           reject(null)
//         }
//       })
//     })
//   }

//   getTimestampFromBlock (web3, block) {
//     return new Promise((resolve, reject) => {
//       web3.eth.getBlock(block, (err, res) => {
//         if (!err) {
//           if (res && res.timestamp) {
//             resolve(res.timestamp)
//           } else {
//             reject(null)
//           }
//         } else {
//           reject(null)
//         }
//       })
//     })
//   }

//   getMyTx (txList) {
//     if (!txList) return
//     let txs = []
//     txList.map(tx => {
//       if (tx.name) {
//         if (tx.name.toUpperCase() === 'WITHDRAWAL') { 
//           txs.push({
//             hash: tx.hash,
//             from: tx.events[0].value,
//             to: tx.address,
//             value: tx.events[1].value,
//             token: tx.token,
//             type: HBCRYPTO.UNWRAP
//           })
//         } else if (tx.name.toUpperCase() === 'DEPOSIT') {
//           txs.push({
//             hash: tx.hash,
//             from: tx.events[0].value,
//             to: tx.address,
//             value: tx.events[1].value,
//             token: tx.token,
//             type: HBCRYPTO.WRAP
//           })
//         } else if (tx.name.toUpperCase() === 'TRANSFER') {
//           txs.push({
//             hash: tx.hash,
//             from: tx.events[0].value,
//             to: tx.events[1].value,
//             value: tx.events[2].value,
//             token: tx.token,
//             type: HBCRYPTO.ERC20
//           })
//         }
//       } else {
//         tx.value = tx.value.toNumber()
//         tx.type = HBCRYPTO.ETHEREUM
//         txs.push(tx)
//       }
//     })
//     return txs
//   }

//   watcher (THIS, dispatch) {
//     const { arrCardData } = THIS.props
//     const web33 = zeroEx.exchange._web3Wrapper._web3
//     // web33.providers.HttpProvider.prototype.sendAsync = web33.providers.HttpProvider.prototype.send
//     // const mainAddress = this.getCurrentMainAddress()
//     const mainAddress = arrCardData[0].address
//     // console.log('mainAddress', mainAddress)
//     let currentBlock = 0
//     setInterval(async () => {
//       try {
//         let listTx = []
//         let result = {blockNumber: '', tx: [], timeStamp: ''}
//         const res = await this.getBlockTs(web33)
//         // console.log('blocknumber:', res)
//         // console.log('currentBlock:', currentBlock)
//         // web33.eth.getBlockNumber(async (err, res) => {
//         if (res) {
//           if (currentBlock === 0) {
//             listTx = await this.handleTx(web33, res, mainAddress)
//             currentBlock = res
//             result.blockNumber = res
//           } else if (currentBlock > 0 && res > currentBlock) {
//             listTx = await this.handleTx(web33, currentBlock, mainAddress)
//             result.blockNumber = currentBlock
//             currentBlock++
//           }
//           if (listTx && listTx.length > 0) {
//             result.tx = this.getMyTx(listTx)
//           }
//           result.timeStamp = await this.getTimestampFromBlock(web33, currentBlock)
//         } else {
//           console.log('get block number error block :', currentBlock)
//         }
//         // })
//         console.log('latest tx.hash: ', result)
//         getLatestTx(THIS, result, dispatch)
//       } catch (error) {
//         console.log('listenHolderAddressEvent error :', error)
//       }
//     }, 5000)
//   }
// }

// const instance = new OxObject()
// Object.freeze(instance)

// export default instance
