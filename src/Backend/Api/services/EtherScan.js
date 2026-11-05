import Settings from '../../settings'
import QueryString from 'query-string'
import cryptojs from 'crypto-js'
import { HBCRYPTO, WETH_ADDRESS } from 'Utils/globalConstants'
import { requestRetry } from 'Utils/globalFunction'

/**
 * NAME: ETHERSCAN SERVICE
 * CREATOR: STEVEN
 * Handle calling rest api to etherscan
 */
export default class EtherscanServices {
  /**
   * getEtherBalance() returns balance of the account
   * based on the passed-in ethereum address
   */
  static getEtherBalanceSaga (ethAddress) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'balance',
      address: ethAddress,
      tag: 'latest'
    })
    let apiurl = Settings.server.etherscan.url + queryStr
    return apiurl
  }

  /**
   * getEtherBalance() returns balance of the account
   * based on the passed-in ethereum address
   */
  static getEtherBalance (ethAddress) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'balance',
      address: ethAddress,
      tag: 'latest'
    })
    return this.fetchData(queryStr)
  }

  static getEtherBalanceRinkeby (ethAddress) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'balance',
      address: ethAddress,
      tag: 'latest'
    })
    return this.fetchDataRinkeby(queryStr)
  }

  /**
   * getMultipleEthBalance() returns balances of the multiple accounts
   * based on the passed-in ethereum addresses array
   */
  static getMultipleEthBalanceSaga (...ethAddresses) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'balancemulti',
      address: ethAddresses.join(),
      tag: 'latest'
    })
    let apiurl = Settings.server.etherscan.url + queryStr
    return apiurl
  }

  /**
   * getMultipleEthBalance() returns balances of the multiple accounts
   * based on the passed-in ethereum addresses array
   */
  static getMultipleEthBalance (...ethAddresses) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'balancemulti',
      address: ethAddresses.join(),
      tag: 'latest'
    })
    return this.fetchData(queryStr)
  }

  /**
   * getNormalTransactionByAddress() returns a list of normal transaction
   * based on the passed-in ethereum address
   */
  static async getNormalTransactionByAddress (ethAddress, pageNumber, offset) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'txlist',
      address: ethAddress,
      startblock: 0,
      page: pageNumber,
      offset: offset,
      sort: 'desc'
    })
    return this.fetchData(queryStr)
  }

  static async getAllTransactionByAddress (ethAddress) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'txlist',
      address: ethAddress,
      startblock: 0,
      endblock: 99999999,
      sort: 'desc'
    })
    return this.fetchData(queryStr)
  }

  static async getAllTokenTransactionByAddress (ethAddress, contractaddress) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'tokentx',
      address: ethAddress,
      contractaddress,
      startblock: 0,
      endblock: 999999999,
      sort: 'desc'
    })
    return this.fetchData(queryStr)
  }

  /**
   * getMultipleEthBalance() returns balances of the multiple accounts
   * based on the passed-in ethereum addresses array
   */
  // command by Tuan 2017/12/04 - not use
  // static async checkContractExecutionStatus (txhash) {
  //   let queryStr = QueryString.stringify({
  //     module: 'transaction',
  //     action: 'getstatus',
  //     txhash: txhash
  //   })

  //   return this.fetchData(queryStr)
  // }

  /**
   * getEventLogs() returns the event log from specified blog to the latest blog
   * based on the passed-in starting block, ethereum address and topic
   */
  // command by Tuan 2017/12/04 -not use
  // static async getEventLogs (fromBlock, ethAddress, topic) {
  //   let queryStr = QueryString.stringify({
  //     module: 'logs',
  //     action: 'getLogs',
  //     fromBlock: fromBlock,
  //     toBlock: 'latest',
  //     address: ethAddress,
  //     topic0: topic
  //   })

  //   return this.fetchData(queryStr)
  // }

  /**
   * getCode() returns code at a given address
   * based on the passed-in address
   */
  static async getCode (toAddress) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_getCode',
      address: toAddress,
      tag: 'latest'
    })

    return this.fetchData(queryStr)
  }

  /**
   * getGasPrice() returns the current price per gas in wei.
   */
  static async getGasPrice () {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_gasPrice'
    })

    return this.fetchData(queryStr)
  }

  /**
   * getGasPrice() returns the current price per gas in wei.
   */
  static async getGasPriceRinkeby () {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_gasPrice'
    })

    return this.fetchDataRinkeby(queryStr)
  }

  /**
   * estimateGas() returns the estimated gas when sending ether
   * based on the passed-in address, value, gas price and gas
   */
  static async estimateGas (address, value, gasPrice, gas) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_estimateGas',
      to: address,
      value: value,
      gasPrice: gasPrice,
      gas: gas
    })

    return this.fetchData(queryStr)
  }
  /**
   * estimateGas() returns the estimated gas when sending ether
   * based on the passed-in address, value, gas price and gas
   */
  static async estimateGasToken (address, data, gasPrice, gas) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_estimateGas',
      to: address,
      value: 0x0,
      gasPrice: gasPrice,
      gas: gas,
      data: data
    })
    return this.fetchData(queryStr, 'gasToken')
  }

  /**
   * estimateGas() returns the estimated gas when sending ether
   * based on the passed-in address, value, gas price and gas
   */
  static async estimateGasTokenRinkeby (address, data, gasPrice, gas) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_estimateGas',
      to: address,
      value: 0x0,
      gasPrice: gasPrice,
      gas: gas,
      data: data
    })
    return this.fetchDataRinkeby(queryStr, 'gasToken')
  }

  /**
   * getTokenBalance() returns ERC20 token account balance
   * based on the passed-in contract address and address
   */
  static async getTokenBalance (contractAddress, address) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'tokenbalance',
      contractaddress: contractAddress,
      address: address,
      tag: 'latest'
    })

    return this.fetchData(queryStr)
  }

  /**
   * getTokenBalance() returns ERC20 token account balance
   * based on the passed-in contract address and address
   */
  static async getTokenBalanceRinkeby (contractAddress, address) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'tokenbalance',
      contractaddress: contractAddress,
      address: address,
      tag: 'latest'
    })

    return this.fetchDataRinkeby(queryStr)
  }

  static getTokenBalanceSaga (contractAddress, address) {
    let queryStr = QueryString.stringify({
      module: 'account',
      action: 'tokenbalance',
      contractaddress: contractAddress,
      address: address,
      tag: 'latest'
    })
    let apiurl = Settings.server.etherscan.url + queryStr
    return apiurl
  }

  /**
   * getNounce() returns nounce value
   * based on the passed-in ethereum address
   */
  static async getNounce (ethAddress) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_getTransactionCount',
      address: ethAddress,
      tag: 'latest'
    })

    return this.fetchData(queryStr)
  }

  /**
   * getNounce() returns nounce value
   * based on the passed-in ethereum address
   */
  static async getNounceRinkeby (ethAddress) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_getTransactionCount',
      address: ethAddress,
      tag: 'latest'
    })

    return this.fetchDataRinkeby(queryStr)
  }

  static async sendRawTransaction (hexTransaction) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_sendRawTransaction',
      hex: hexTransaction
    })
    // return true
    return this.fetchData(queryStr)
  }

  static async sendRawTransactionRinkeby (hexTransaction) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_sendRawTransaction',
      hex: hexTransaction
    })
    // return true
    return this.fetchDataRinkeby(queryStr)
  }
  // command by Tuan 2017/12/04 - not use
  static async getReceiptTransaction (txhash) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_getTransactionReceipt',
      txhash: txhash
    })
    console.log('getReceiptTransaction')
    console.log(queryStr)
    return this.fetchData(queryStr)
  }

  static async getTransactionByHash (txhash) {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_getTransactionByHash',
      txhash: txhash
    })
    return this.fetchData(queryStr)
  }

  /**
   * fetchData() returns the result from rest api call using build-in fetch() of react
   * based on the passed-in pre-defined query string
   */
  // static async fetchData (queryStr, type) {
  //   let apiurl = Settings.server.etherscan.url + queryStr
  //   try {
  //     let response = await fetch(apiurl)
  //     let responJson = await response.json()
  //     if (type === 'gasToken') {
  //       if (responJson.result) {
  //         return responJson.result
  //       } else {
  //         return Settings.gas.externalFeeToken
  //       }
  //     } else {
  //       if (responJson.result) {
  //         return responJson.result
  //       } else {
  //         throw responJson.error.message
  //       }
  //     }
  //   } catch (error) {
  //     throw error
  //   }
  // }
  static async fetchData (queryStr, type) {
    const possible = [
      '8Y8J2T7IQTE8Q7XDSTJVZMAB1I1AUQVAW7',
      '8XR2UB6B1W3KPPCR7S8WHKMF2AAWHBYTRH',
      '21HTR85ZVJ8NXHHAYAEP3P58PTMC8DCAXW',
      'CSGZKJYGN9C2N5X4SVIU8B39CQ72P61399',
      'GASTRGVU4MMV87ADAZ8BQYF69B456XQ2AM',
      '8JVPMDXBA9ZCZ9CQ4U6FYA4QEB9S5CIX2D',
      'NHM4MF9MAR9JQN1H1FCRVUEN62FQJEWC64',
      'RYCVDN7X2X24667KHDN13XJPQC7GDM2QY3',
      '3DWQ18R7K16CAMNWF6SST7JNKHESGM971E',
      'U2FABIPYUVCVEQYXE3VS8B5N48E2N261T5',
      'UM4F4C4FJQF7W9MVY5UT54XX4WKN1YVERJ',
      'DUCG6D25NKHP6SQBGE9KP9XEDBTD5PQ4XK',
      'SIJ6R8RMMJBC5P42MYH516I79PPENCS98I',
      '8NCJPDT5YIAX2YB5P9YPPQ9D5ERQ2VSRDV',
      '2PFSAZFHVG78QBNMY57GYBR713XBWYMSC1',
      'YUQ2AFG3X1MYNTEWD61ZNAGBWNQK49SJF3',
      'B3YB1AIMA31NIY6U8N4AFTD9I5VCVPHVDM',
      'MHPEQ83PUG8BHXXS2T5URNY3XCRDZBUETG']
    var results = possible.sort(function () { return 0.5 - Math.random() })
    let url = Settings.server.etherscan.url + queryStr + `&apiKey=${results[0]}`
    console.log('fetch datas: ', url)
    var timestamp = Math.floor(Date.now() / 1000)
    var payload = timestamp + '.' + Settings.keyConvertMoney.publickey
    var hash = cryptojs.HmacSHA256(payload, Settings.keyConvertMoney.secretkey)
    var hexhash = cryptojs.enc.Hex.stringify(hash)
    var signature = payload + '.' + hexhash

    try {
      let response = await requestRetry({
        url,
        opt: {
          // 'async': true,
          method: 'GET',
          headers: {
            'x-signature': signature,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      })
      // let responJson = await response.json()
      if (type === 'gasToken') {
        if (response && response.result) {
          return response.result
        } else {
          return Settings.gas.externalFeeToken
        }
      } else if (type === 'getABI') {
        if (response) {
          return response
        }
      } else {
        if (response && response.result) {
          return response.result
        }
      }
    } catch (error) {
      throw error
    }
  }

  static async fetchDataRinkeby (queryStr, type) {
    let url = Settings.server.etherscan.rinkebyUrl + queryStr
    try {
      let response = await requestRetry({url})
      // let responJson = await response.json()
      if (type === 'gasToken') {
        if (response.result) {
          return response.result
        } else {
          return Settings.gas.externalFeeToken
        }
      } else {
        if (response.result) {
          return response.result
        } else {
          throw response.error.message
        }
      }
    } catch (error) {
      throw error
    }
  }
  // return 0 or latest blockNumber
  static async getLatestBlockNumber () {
    let queryStr = QueryString.stringify({
      module: 'proxy',
      action: 'eth_blockNumber',
      apikey: ''
    })
    let result = await this.fetchData(queryStr)
    let blockNumber = 0
    if (result) {
      blockNumber = parseInt(result, 16) // result.result is in hex, so convert to dec
      if (isNaN(blockNumber)) { return 0 }
    }
    return blockNumber
  }

  static async getNormalTxEtherScan (_startBlock, _ethAddress) {
    let query = {
      module: 'account',
      action: 'txlist',
      address: _ethAddress,
      startblock: _startBlock,
      endblock: 'latest',
      sort: 'asc',
      apikey: ''
    }
    let result = await this.fetchData(QueryString.stringify(query))
    return result
  }

  static async getInternalTxEtherScan (_startBlock, _ethAddress) {
    let query = {
      module: 'account',
      action: 'txlistinternal',
      address: _ethAddress,
      startblock: _startBlock,
      endblock: 'latest',
      sort: 'asc',
      apikey: ''
    }
    let result = await this.fetchData(QueryString.stringify(query))
    return result
  }

  static async getERC20TokenTxEtherScan (_startBlock, _ethAddress, _tokenAddresss) {
    let query = {
      module: 'account',
      action: 'tokentx',
      contractaddress: _tokenAddresss,
      address: _ethAddress,
      startblock: _startBlock,
      endblock: 'latest',
      sort: 'asc',
      apikey: ''
    }
    let result = await this.fetchData(QueryString.stringify(query))
    return result
  }

  // get global erc20 tx of an account which ralate to token1 and 2 via etherscan
  static async getAllTransactionByAddressFromBlockOld (_ethAddress, _tokenAddress1, _tokenAddress2, isFrist) {
    let currentBlockNumber = await this.getLatestBlockNumber()
    console.log('currentBlockNumber :', currentBlockNumber)
    if (currentBlockNumber > 0) {
      let erc20Result
      // get erc20 tx list
      if (isFrist) {
        erc20Result = await this.getERC20TokenTxEtherScan(0, _ethAddress)
      } else {
        erc20Result = await this.getERC20TokenTxEtherScan(currentBlockNumber - 5, _ethAddress)
      }
      if (erc20Result && erc20Result.length > 0) {
        if (erc20Result[erc20Result.length - 1].contractAddress === _tokenAddress1 || erc20Result[erc20Result.length - 1].contractAddress === _tokenAddress2) {
          return erc20Result[erc20Result.length - 1]
        }
      }
    }
    return null
  }
  // get global erc20 tx of an account which ralate to token1 and 2 via etherscan
  static async getLastestUnWETHtx (_ethAddress, wethAddress, isFrist) {
    let currentBlockNumber = await this.getLatestBlockNumber()
    console.log('currentBlockNumber :', currentBlockNumber)
    if (currentBlockNumber > 0) {
      let result
      if (isFrist) {
        result = await this.getInternalTxEtherScan(0, _ethAddress)
      } else {
        result = await this.getInternalTxEtherScan(currentBlockNumber - 5, _ethAddress)
      }
      console.log('currentBlockNumber result :', result)

      if (result && result.length > 0) {
        if (result[result.length - 1].from === wethAddress) {
          return result[result.length - 1]
        }
      }
      return null
    }
  }

  static async getLastestWETHtx (_ethAddress, wethAddress, isFrist) {
    let currentBlockNumber = await this.getLatestBlockNumber()
    console.log('currentBlockNumber :', currentBlockNumber)
    if (currentBlockNumber > 0) {
      let result
      if (isFrist) {
        result = await this.getNormalTxEtherScan(0, _ethAddress)
      } else {
        result = await this.getNormalTxEtherScan(currentBlockNumber - 5, _ethAddress)
      }
      if (result && result.length > 0) {
        if (result[result.length - 1].to === wethAddress) {
          return result[result.length - 1]
        }
      }
      return null
    }
  }

  static getMyTx (txList, address) {
    let txs = []
    txList.sort(function (a, b) {
      return Number(a.timeStamp) - Number(b.timeStamp) // sort by time ascending
    })
    txList.map(tx => {
      if (tx.tokenSymbol) {
        txs.push({
          blockNumber: tx.blockNumber,
          timeStamp: tx.timeStamp,
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          type: HBCRYPTO.ERC20,
          tokenName: tx.tokenName,
          tokenDecimal: tx.tokenDecimal,
          tokenAddress: tx.contractAddress,
          tokenSymbol: tx.tokenSymbol
        })
      } else {
        if (tx.from === address && tx.to === WETH_ADDRESS && tx.value !== '0') {
          txs.push({
            blockNumber: tx.blockNumber,
            timeStamp: tx.timeStamp,
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            type: HBCRYPTO.WRAP
          })
        } else if (tx.from === WETH_ADDRESS && tx.to === address && tx.value !== '0') {
          txs.push({
            blockNumber: tx.blockNumber,
            timeStamp: tx.timeStamp,
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            type: HBCRYPTO.UNWRAP
          })
        } else if (tx.nonce && tx.value !== '0') { // or confirmations for ETH
          txs.push({
            blockNumber: tx.blockNumber,
            timeStamp: tx.timeStamp,
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            type: HBCRYPTO.ETHEREUM
          })
        } else if (tx.type) { // internal tx type = 'call'
          txs.push({
            blockNumber: tx.blockNumber,
            timeStamp: tx.timeStamp,
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            type: tx.type
          })
        }
      }
    })
    return txs
  }
  // get global erc20 tx of an account which ralate to token1 and 2 via etherscan
  static async getAllTransactionByAddressFromBlock (_ethAddress, _tokenAddresss1, _tokenAddresss2, currentBlockNumber, isFrist = false) {
    let latestBlock = await this.getLatestBlockNumber()
    console.log('latestBlock :', currentBlockNumber, latestBlock)
    if (latestBlock > currentBlockNumber) {

      console.log('get tx of ', _ethAddress, ' at  block :', currentBlockNumber)
      let erc20ResultFirst
      let erc20ResultSecond
      let normalResult
      let internalResult
      // get erc20 tx list
      let result = { latestBlock: latestBlock, tx: [] }

      if (isFrist) { // first time loading, get only the last of tx for normal and erc20
        erc20ResultFirst = await this.getERC20TokenTxEtherScan(0, _ethAddress, _tokenAddresss1)
        erc20ResultSecond = await this.getERC20TokenTxEtherScan(0, _ethAddress, _tokenAddresss2)
        normalResult = await this.getNormalTxEtherScan(0, _ethAddress)
        internalResult = await this.getInternalTxEtherScan(0, _ethAddress)

        if (erc20ResultFirst && erc20ResultFirst.length > 0) {
          result.tx = result.tx.concat(erc20ResultFirst.slice(erc20ResultFirst.length - 1, erc20ResultFirst.length))
        }

        if (erc20ResultSecond && erc20ResultSecond.length > 0) {
          result.tx = result.tx.concat(erc20ResultSecond.slice(erc20ResultSecond.length - 1, erc20ResultSecond.length))
        }

        if (normalResult && normalResult.length > 0) {
          result.tx = result.tx.concat(normalResult.slice(normalResult.length - 1, normalResult.length))
        }

        if (internalResult && internalResult.length > 0) {
          result.tx = result.tx.concat(internalResult.slice(internalResult.length - 1, internalResult.length))
        }

      } else {
        erc20ResultFirst = await this.getERC20TokenTxEtherScan(currentBlockNumber, _ethAddress, _tokenAddresss1)
        erc20ResultSecond = await this.getERC20TokenTxEtherScan(currentBlockNumber, _ethAddress, _tokenAddresss2)
        normalResult = await this.getNormalTxEtherScan(currentBlockNumber, _ethAddress)
        internalResult = await this.getInternalTxEtherScan(currentBlockNumber, _ethAddress)

        if (erc20ResultFirst && erc20ResultFirst.length > 0) {
          result.tx = result.tx.concat(erc20ResultFirst)
        }

        if (erc20ResultSecond && erc20ResultSecond.length > 0) {
          result.tx = result.tx.concat(erc20ResultSecond)
        }

        if (normalResult && normalResult.length > 0) {
          result.tx = result.tx.concat(normalResult)
        }

        if (internalResult && internalResult.length > 0) {
          result.tx = result.tx.concat(internalResult)
        }
      }
      console.log('result.tx', result.tx)
      result.tx = this.getMyTx(result.tx, _ethAddress)
      console.log('result.tx after', result.tx)
      return result
    }
  }

  static async getABI (address) {
    let queryStr = QueryString.stringify({
      module: 'contract',
      action: 'getabi',
      address: address
    })

    return this.fetchData(queryStr, 'getABI')
  }
}

// https://api-kovan.etherscan.io/api?module=account&action=tokentx&address=0x9016a39182bea380b3dd6c3f409abbfce1a843bb&startblock=0&endblock=999999999&sort=asc&apikey=CWXAFVFUQXG28RHDUISF6GHSP5WPC7K4HA
