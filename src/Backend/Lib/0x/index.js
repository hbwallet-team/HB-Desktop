import { 
  assetDataUtils,
  BigNumber,
  ContractWrappers,
  generatePseudoRandomSalt,
  orderHashUtils,
  signatureUtils
} from '0x.js'
import { RPCSubprovider, Web3ProviderEngine, PrivateKeyWalletSubprovider } from '@0x/subproviders'
import { Web3Wrapper } from '@0x/web3-wrapper'
import { getContractAddressesForNetwork, getContractWrappersConfig } from './contracts'
import { getTokenInfo, getTokenBalance } from 'Backend/Lib/Web3/index'
import OxErrors from './errors'
import Settings from 'Backend/settings'
import ChatworkAPI from 'Backend/Api/services/ChatworkAPI'
import DappAPI from 'Backend/Api/services/DappAPI'
import { convertWeiToBalance, convertBalanceToWei, formatNumberCalOld, sumValueInObject, isObject, randomInfuraKey } from 'Utils/globalFunction'
import ABI from 'Utils/ERC20ABI'
import abiDecoder from 'abi-decoder'
import EtherscanServices from 'Backend/Api/services/EtherScan'
abiDecoder.addABI(ABI.ABI_ERC20)

const ETH_DECIMALS = 18
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const ZERO = new BigNumber(0)
let account
let providerEngine
let web3Wrapper
let contractWrappers
let contractAddresses
let transactionOpts = {
  gasPrice: new BigNumber(5000000000)
}

export default class ZeroX {
  static async init (mainAccount) {
    account = mainAccount
    let key = randomInfuraKey()
    if (web3Wrapper === undefined) {
      try {
        providerEngine = new Web3ProviderEngine()
        providerEngine.addProvider(new PrivateKeyWalletSubprovider(mainAccount.privateKey))
        providerEngine.addProvider(new RPCSubprovider(Settings.server.networkInfura.url + key))
        providerEngine.start()

        web3Wrapper = new Web3Wrapper(providerEngine)
        contractWrappers = new ContractWrappers(
          providerEngine,
          getContractWrappersConfig(Settings.server.networkInfura.id)
        )
        contractAddresses = await getContractAddressesForNetwork(Settings.server.networkInfura.id)
      } catch (error) {
        ChatworkAPI.postMessage('0x init error: ' + error)
      }
    }
    return web3Wrapper
  }

  static resetProviderEngine () {
    providerEngine = undefined
    web3Wrapper = undefined
  }

  static async getCurrentMainAddress () {
    if (web3Wrapper !== undefined) {
      const userAddresses = await web3Wrapper.getAvailableAddressesAsync()
      return userAddresses
    } else {
      return null
    }
  }

  static setGasPrice (value) {
    transactionOpts.gasPrice = new BigNumber(value * Math.pow(10, 9))
  }

  static async getContractAddressesForNetwork () {
    const contractAddresses = await getContractAddressesForNetwork(Settings.server.networkInfura.id)
    return contractAddresses
  }

  static detectError (errorCode) {
    const errorMessage = OxErrors[errorCode] ? OxErrors[errorCode] : 'CHECK_AGAIN'
    return errorMessage
  }

  static convertToBaseUnitAmount (amount, decimals) {
    try {
      const res = Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), decimals)
      return res
    } catch (error) {
      ChatworkAPI.postMessage('convertToBaseUnitAmount: ' + error)
      return 0
    }
  }

  static async convertEthToWrappedEthTokenAsync (amount) {
    try {
      const etherTokenAddress = contractAddresses.etherToken
      const takerAssetAmount = this.convertToBaseUnitAmount(amount, ETH_DECIMALS)
      const depositTxHash = await contractWrappers.etherToken.depositAsync(
        etherTokenAddress,
        takerAssetAmount,
        account.address,
        transactionOpts
      )
      return depositTxHash
    } catch (error) {
      ChatworkAPI.postMessage('convertEthToWrappedEthTokenAsync: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async convertWrappedEthTokenToEthAsync (amount) {
    try {
      const etherTokenAddress = contractAddresses.etherToken
      const takerAssetAmount = this.convertToBaseUnitAmount(amount, ETH_DECIMALS)
      const withdrawTxHash = await contractWrappers.etherToken.withdrawAsync(
        etherTokenAddress,
        takerAssetAmount,
        account.address,
        transactionOpts
      )
      return withdrawTxHash
    } catch (error) {
      ChatworkAPI.postMessage('convertWrappedEthTokenToEthAsync: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async awaitTransactionMinedAsync (txID) {
    try {
      const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txID)
      return txReceipt
    } catch (error) {
      ChatworkAPI.postMessage('awaitTransactionMinedAsync: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async awaitTransactionSuccessAsync (txID) {
    try {
      const txReceipt = await web3Wrapper.awaitTransactionSuccessAsync(txID)
      const txInfo = await this.getTransaction(txID, txReceipt)
      if (txInfo.token) {
        txReceipt.token = txInfo.token
        txReceipt.contractAddress = txInfo.contractAddress
        txReceipt.to = txInfo.receiver
      }
      txReceipt.value = txInfo.value ? txInfo.value : 0
      txReceipt.fee = txInfo && txInfo.actualCost ? txInfo.actualCost : 0
      txReceipt.gas = txInfo && txInfo.gas ? txInfo.gas : txReceipt.gas
      txReceipt.gasPrice = txInfo && txInfo.gasPrice ? txInfo.gasPrice : 0
      txReceipt.input = txInfo && txInfo.input ? txInfo.input : ''
      txReceipt.nonce = txInfo && txInfo.nonce ? txInfo.nonce : null
      return txReceipt
    } catch (error) {
      ChatworkAPI.postMessage('awaitTransactionSuccessAsync: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async getTransaction (txID, txReceipt) {
    try {
      let tx = await web3Wrapper.getTransactionByHashAsync(txID)
      if (tx) {
        let result = {
          value: tx.value.toNumber(),
          blockNumber: tx.blockNumber ? tx.blockNumber : 0,
          actualCost: parseInt(tx.gasPrice.toNumber()) * parseInt(txReceipt.gasUsed),
          gas: parseInt(tx.gas),
          gasPrice: parseInt(tx.gasPrice.toNumber()),
          input: tx.input,
          nonce: tx.nonce
        }
          
        if (tx.input !== '' && tx.input !== '0x' && txReceipt.logs[0]) {
          const ABI = await EtherscanServices.getABI(txReceipt.logs[0].address)
          if (ABI && ABI.result) {
            const res = await DappAPI.decodeInput(tx.input, JSON.parse(ABI.result))
            if (res && res.method && res.method.toUpperCase() === 'TRANSFER') {
              var log = abiDecoder.decodeLogs([txReceipt.logs[0]])
              if (log && log.length > 0 && log[0]) {
                let token = await getTokenInfo(log[0].address)
                if (token) {
                  result.contractAddress = log[0].address
                  result.token = token
                  result.event = log[0].name
                  result.receiver = log[0].events[1].value
                  result.value = log[0].events[2].value
                }
              }
            }
          }
        }
        return result
      } else {
        return null
      }
    } catch (error) {
      ChatworkAPI.postMessage('getTransaction: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async hasProxyAllowanceAsync (address, tokenAddress) {
    try {
      const allowanceInBaseUnits = await contractWrappers.erc20Token.getProxyAllowanceAsync(
        tokenAddress.toLowerCase(),
        address.toLowerCase()
      )
      const res = !allowanceInBaseUnits.isZero()
      return res
    } catch (error) {
      ChatworkAPI.postMessage('hasProxyAllowanceAsync: ' + error)
      return false
    }
  }

  static async setUnlimitedProxyAllowanceAsync (tokenAddress, decimals, isLock) {
    try {
      let unlockTxHash
      if (isLock) {
        unlockTxHash = await contractWrappers.erc20Token.setProxyAllowanceAsync(
          tokenAddress.toLowerCase(),
          account.address.toLowerCase(),
          Web3Wrapper.toBaseUnitAmount(ZERO, decimals),
          transactionOpts
        )
      } else {
        unlockTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
          tokenAddress.toLowerCase(),
          account.address.toLowerCase(),
          transactionOpts
        )
      }
      return unlockTxHash
    } catch (error) {
      ChatworkAPI.postMessage('setUnlimitedProxyAllowanceAsync: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async generateOrder (makerTokenAmount, takerTokenAmount, makerToken, takerToken, exprireDate) {
    try {
      const exchangeAddress = contractAddresses.exchange
      const maker = account.address.toLowerCase()
      const salt = generatePseudoRandomSalt()
      const makerAssetAmount = this.convertToBaseUnitAmount(makerTokenAmount, makerToken.decimals)
      const takerAssetAmount = this.convertToBaseUnitAmount(takerTokenAmount, takerToken.decimals)
      const makerAssetData = assetDataUtils.encodeERC20AssetData(makerToken.address)
      const takerAssetData = assetDataUtils.encodeERC20AssetData(takerToken.address)
      const order = {
        exchangeAddress: exchangeAddress.toLowerCase(),
        makerAddress: maker,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: new BigNumber(exprireDate),
        salt,
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFee: ZERO,
        takerFee: ZERO
      }
      const orderHashHex = orderHashUtils.getOrderHashHex(order)
      const signature = await signatureUtils.ecSignHashAsync(
        providerEngine,
        orderHashHex,
        maker
      )
      const isValid = await contractWrappers.exchange.isValidSignatureAsync(
        orderHashHex,
        maker,
        signature
      )
      if (isValid === true) {
        const fullOrder = {
          signedOrder: {
            ...order, 
            signature
          },
          orderHashHex,
          metadata: {
            makerToken,
            takerToken
          }
        }
        return fullOrder
      } else {
        return false
      }
    } catch (error) {
      ChatworkAPI.postMessage('generateOrder: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static parseJSONSignedOrder (order) {
    const signedOrder = order
    signedOrder.salt = new BigNumber(signedOrder.salt)
    signedOrder.makerAssetAmount = new BigNumber(signedOrder.makerAssetAmount)
    signedOrder.takerAssetAmount = new BigNumber(signedOrder.takerAssetAmount)
    signedOrder.makerFee = new BigNumber(signedOrder.makerFee)
    signedOrder.takerFee = new BigNumber(signedOrder.takerFee)
    signedOrder.expirationTimeSeconds = new BigNumber(signedOrder.expirationTimeSeconds)
    return signedOrder
  }

  static async cancelOrderAsync (orderJSON) {
    let txHash
    try {
      if (orderJSON && orderJSON.length > 1) {
        let order = []
        let itemOrder
        orderJSON.map(e => {
          itemOrder = this.parseJSONSignedOrder(e.signedOrder)
          order.push(itemOrder)
        })
        txHash = await contractWrappers.exchange.batchCancelOrdersAsync(
          order,
          transactionOpts
        )
      } else {
        let order = this.parseJSONSignedOrder(orderJSON.signedOrder)
        txHash = await contractWrappers.exchange.cancelOrderAsync(
          order,
          transactionOpts
        )
      }
      // console.log('awaitTransactionSuccessAsync', txHash)
      // let txReceipt = await this.awaitTransactionSuccessAsync(txHash)
      // console.log('cancelOrderAsync receipt ', txReceipt)
      // let txReceiptFull = await web3Wrapper.getTransactionByHashAsync(txHash)
      // if (txReceiptFull && txReceiptFull.gasPrice && txReceipt.gasUsed) {
      //   txReceipt.fee = txReceipt.gasUsed * txReceiptFull.gasPrice.toNumber()
      // }
      // return txReceipt
      return {
        transactionHash: txHash,
        error: false,
        blockNumber: 0,
        fee: 0
      }
    } catch (error) {
      console.log('cancelOrderAsync---errors123: ')
      ChatworkAPI.postMessage('cancelOrderAsync: ' + (isObject(error) ? JSON.stringify(error, undefined, 2) : error))
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async fillOrderAsync (orderJSON, fillTakerTokenAmount, isFillSell) {
    try {
      const signedOrder = this.parseJSONSignedOrder(orderJSON.signedOrder)
      const taker = account.address.toLowerCase()
      let amountBaseUnit
      if (isFillSell) {
        // Suppose that seller of 1 ZRX (taken token) to receive 2 WETH (maker token)
        // Buyer wants to buy 0.5 ZRX that corresponds to 1 WETH
        // So, the fillOrderAsync() doesn't receive ZRX (taker token) amount, but it receives WETH (maker token) amount
        // So, we must multiple "fillTakerTokenAmount" by the "price" because the input field "fillTakerTokenAmount"
        // specifies the ZRX (taker token) amount.
        // "price" = takerTokenAmount / makerTokenAmount
        const originalSignedOrder = orderJSON.signedOrder
        const price = originalSignedOrder.takerAssetAmount / originalSignedOrder.makerAssetAmount
        fillTakerTokenAmount = formatNumberCalOld(fillTakerTokenAmount * price, 8)
        amountBaseUnit = this.convertToBaseUnitAmount(fillTakerTokenAmount.toString(), orderJSON.metadata.makerToken.decimals)
      } else {
        amountBaseUnit = this.convertToBaseUnitAmount(fillTakerTokenAmount.toString(), orderJSON.metadata.takerToken.decimals)
      }

      // Validate the order is Fillable before calling fillOrder
      // This checks both the maker and taker balances and allowances to ensure it is fillable
      // up to takerAssetAmount
      await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(signedOrder, amountBaseUnit, taker)

      // Fill the Order via 0x Exchange contract
      const txHash = await contractWrappers.exchange.fillOrderAsync(
        signedOrder,
        amountBaseUnit,
        taker,
        transactionOpts
      )
      return txHash
    } catch (error) {
      ChatworkAPI.postMessage('fillOrderAsync: ' + (isObject(error) ? JSON.stringify(error, undefined, 2) : error))
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async batchFillOrdersAsync (orders, fillTakerTokenAmount, isFillSell) {
    try {
      const taker = account.address.toLowerCase()
      let signOrders = []
      let takerAssetFillAmounts = []
      let ordersLocked = []
      let ordersFilled = []
      let amountBaseUnit = {}
      for (let i = 0; i < orders.length; i++) {
        // check whether maker has locked token or not
        const allowanceInBaseUnits = await contractWrappers.erc20Token.getProxyAllowanceAsync(
          orders[i].metadata.makerToken.address,
          orders[i].signedOrder.makerAddress
        )
        if (allowanceInBaseUnits.isZero()) {
          ordersLocked.push(orders[i])
          continue
        }
        
        // calculation filled amount for each order
        let remainBalance
        if (isFillSell) {
          remainBalance = await getTokenBalance(orders[i].metadata.makerToken.address, orders[i].signedOrder.makerAddress, orders[i].metadata.makerToken.decimals)
          if (amountBaseUnit[orders[i].signedOrder.makerAddress]) {
            remainBalance = BigNumber(remainBalance).minus(amountBaseUnit[orders[i].signedOrder.makerAddress]).toNumber()
          }
          // case of token balance is greater than order's remaining balance
          // just get the order's remaining balance
          // Example: the order has remaining balance is 10 tokens, but the owner who created the order still has 5 tokens
          // so just get 5 tokens is remaining balance
          let filledAssetAmount = await contractWrappers.exchange.getFilledTakerAssetAmountAsync(orders[i].orderHashHex)
          let remainOfTaker = BigNumber(orders[i].signedOrder.takerAssetAmount).minus(filledAssetAmount)
          let remainOfTakerInWETH = remainOfTaker.div(
            Math.pow(10, orders[i].metadata.takerToken.decimals)
          )
          let orderRemainBalance = remainOfTakerInWETH.div(orders[i].price).toNumber()
          // let originOrder = await DexAPI.getOrderById(orders[i].orderHashHex)
          // let orderRemainBalance = convertWeiToBalance(originOrder.remainBalance, orders[i].metadata.makerToken.decimals)
          if (Number(remainBalance) > Number(orderRemainBalance)) {
            remainBalance = orderRemainBalance
          }
          // case of filled amount is less than remaining balance
          // just get filled amount is remaining balance
          // Example: the order has remaining balance is 10 tokens, but the taker want to take only 5 tokens
          // so just get 5 tokens is remaining balance
          if ((Number(fillTakerTokenAmount) - Number(sumValueInObject(amountBaseUnit))) < Number(remainBalance)) {
            remainBalance = Number(fillTakerTokenAmount) - Number(sumValueInObject(amountBaseUnit))
          }
          if (Number(remainBalance) <= 0) {
            continue
          }
          if (amountBaseUnit[orders[i].signedOrder.makerAddress]) {
            amountBaseUnit[orders[i].signedOrder.makerAddress] += Number(remainBalance)
          } else {
            amountBaseUnit[orders[i].signedOrder.makerAddress] = Number(remainBalance)
          } 
          ordersFilled.push({
            orderHashHex: orders[i].orderHashHex,
            amount: convertBalanceToWei(remainBalance, orders[i].metadata.makerToken.decimals)
          })
          remainBalance = this.convertToBaseUnitAmount(BigNumber(remainBalance).times(orders[i].price).dp(18).toString(), orders[i].metadata.takerToken.decimals)
        } else {
          let remainBalanceMaker = await getTokenBalance(orders[i].metadata.makerToken.address, orders[i].signedOrder.makerAddress, orders[i].metadata.makerToken.decimals)
          remainBalance = BigNumber(remainBalanceMaker).div(orders[i].price).dp(orders[i].metadata.takerToken.decimals).toNumber()
          if (amountBaseUnit[orders[i].signedOrder.makerAddress]) {
            remainBalance = BigNumber(remainBalance).minus(amountBaseUnit[orders[i].signedOrder.makerAddress]).toNumber()
          }
          // case of token balance is greater than order's remaining balance
          // just get the order's remaining balance
          // Example: the order has remaining balance is 10 tokens, but the owner who created the order still has 5 tokens
          // so just get 5 tokens is remaining balance
          let filledAssetAmount = await contractWrappers.exchange.getFilledTakerAssetAmountAsync(orders[i].orderHashHex)
          let orderRemainBalance = BigNumber(orders[i].signedOrder.takerAssetAmount).minus(filledAssetAmount).toString()
          orderRemainBalance = convertWeiToBalance(orderRemainBalance, orders[i].metadata.takerToken.decimals)
          // let originOrder = await DexAPI.getOrderById(orders[i].orderHashHex)
          // let orderRemainBalance = convertWeiToBalance(originOrder.remainBalance, orders[i].metadata.takerToken.decimals)
          if (Number(remainBalance) > Number(orderRemainBalance)) {
            remainBalance = orderRemainBalance
          }
          // case of filled amount is less than remaining balance
          // just get filled amount is remaining balance
          // Example: the order has remaining balance is 10 tokens, but the taker want to take only 5 tokens
          // so just get 5 tokens is remaining balance
          if ((Number(fillTakerTokenAmount) - Number(sumValueInObject(amountBaseUnit))) < Number(remainBalance)) {
            remainBalance = Number(fillTakerTokenAmount) - Number(sumValueInObject(amountBaseUnit))
          }
          if (Number(remainBalance) <= 0) {
            continue
          }
          if (amountBaseUnit[orders[i].signedOrder.makerAddress]) {
            amountBaseUnit[orders[i].signedOrder.makerAddress] += Number(remainBalance)
          } else {
            amountBaseUnit[orders[i].signedOrder.makerAddress] = Number(remainBalance)
          } 
          ordersFilled.push({
            orderHashHex: orders[i].orderHashHex,
            amount: convertBalanceToWei(remainBalance, orders[i].metadata.takerToken.decimals)
          })
          remainBalance = this.convertToBaseUnitAmount(remainBalance.toFixed(10).toString(), orders[i].metadata.takerToken.decimals)
        }
        // format signed order
        let signedOrder = this.parseJSONSignedOrder(orders[i].signedOrder)
        signOrders.push(signedOrder)
        // push taker asset fill amount
        takerAssetFillAmounts.push(remainBalance)
        if (Number(sumValueInObject(amountBaseUnit)) >= Number(fillTakerTokenAmount)) {
          break
        }
      }
      if (signOrders.length > 0) {
        // Fill the Order via 0x Exchange contract
        const txHash = await contractWrappers.exchange.batchFillOrdersAsync(
          signOrders,
          takerAssetFillAmounts,
          taker,
          transactionOpts
        )
        return {
          txHash,
          signOrders,
          takerAssetFillAmounts,
          amountBaseUnit,
          ordersLocked, 
          ordersFilled
        }
      } else {
        ChatworkAPI.postMessage('batchFillOrdersAsync: all orders has been filled')
        return {
          error: 'CHECK_AGAIN'
        }
      }
    } catch (error) {
      ChatworkAPI.postMessage('batchFillOrdersAsync: ' + ((isObject(error) ? JSON.stringify(error, undefined, 2) : error)) + '; token: ' + orders[0].tokenSymbol + '; price: ' + orders[0].price)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async getOrderInfo (orderJSON) {
    try {
      // Parse the Order JSON into types (converting into BigNumber)
      const signedOrder = this.parseJSONSignedOrder(orderJSON)
      // call getOrderInfoAsync on the Exchange contract
      const orderInfo = await contractWrappers.exchange.getOrderInfoAsync(signedOrder)
      return orderInfo
    } catch (error) {
      ChatworkAPI.postMessage('getOrderInfo: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }

  static async getFilledAssetAmount (orderHash) {
    try {
      let filledAssetAmount = await contractWrappers.exchange.getFilledTakerAssetAmountAsync(orderHash)
      return filledAssetAmount
    } catch (error) {
      ChatworkAPI.postMessage('getFilledAssetAmount: ' + error)
      const errorMessage = this.detectError(error)
      return {
        error: errorMessage
      }
    }
  }
}
