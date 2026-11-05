import { store } from 'Backend/Redux/store/configureStore'
import * as globalActions from 'Backend/Redux/actions/globalActions'
import DexAPI from 'Backend/Api/services/DexAPI'
import BacoorAPI from 'Backend/Api/services/BacoorAPI'
import NagemonAPI from 'Backend/Api/services/NagemonAPI'
import DappAPI from 'Backend/Api/services/DappAPI'
import EtherscanServices from 'Backend/Api/services/EtherScan'
import AirdropABI721 from 'Utils/airDropSmartContractABI721'
import AirdropABI721v2 from 'Utils/airDropSmartContractABI721v2'
import { generateWallet, getETHBalance, getGachaAirdrop, getOwnerOfGameItem } from 'Backend/Lib/Web3/index'
import { HBCRYPTO, DEFAULT_CARD_URLS, WETH_ADDRESS, NUM_REQUEST_NFT } from 'Utils/globalConstants'
import { filterMainAccount, convertWeiToBalance, convertWeiToBalanceCustom, removeDuplicateObjectByKey, logDebugChatwork, isObject, formatNumber } from 'Utils/globalFunction'
import moment from 'moment'
import Images from 'Assets/Image'
import { APP_ENVIROMENT } from './globalConstants'
let reduxState
store.subscribe(() => {
  reduxState = store.getState()
})

export default class ReduxServices {
  static async createNewEtherCard (mnemonic, key, etherIndex, cardName, isSkipWarning = true) {
    return new Promise(async (resolve, reject) => {
      try {
        let newIndex = etherIndex
        const { arrCardData } = reduxState
        const newCardData = arrCardData.slice()
        let newWallet = await generateWallet(mnemonic, newIndex)
        const isExistAddress = newCardData.find(e => e.address.toLowerCase() === newWallet.currentReceiveAddress.toLowerCase())
        if (isExistAddress) {
          isExistAddress.etherIndex = etherIndex
          let listIndex = []
          arrCardData.map(card => card.etherIndex !== null && listIndex.push(card.etherIndex))
          listIndex.sort()
          newIndex = listIndex[listIndex.length - 1] + 1
          newWallet = await generateWallet(mnemonic, newIndex)
        }
        const privateKey = newWallet.privatekey.substring(2, newWallet.privatekey.length)
        const newAddress = newWallet.currentReceiveAddress.toLowerCase()
        newCardData.push({
          key,
          etherIndex: newIndex,
          address: newAddress,
          mnemonic: newWallet.mnemonic,
          privateKey,
          cardName,
          balance: 0,
          totalBalance: 0,
          totalFiatAmount: 0,
          isMain: key === 0,
          isEnable: true,
          isImported: false,
          isSkipWarning
        })
        store.dispatch(globalActions.setCard(newCardData))
        resolve(newCardData)
      } catch (err) {
        reject(err)
        logDebugChatwork('createNewEtherCard', err)
      }
    })
  }

  static switchAccount (card) {
    return new Promise(async (resolve, reject) => {
      try {
        const { arrCardData } = reduxState
        const newCardData = arrCardData.slice()
        const cardFind = newCardData.find(item => item.address === card.address)
        const cardMain = newCardData.find(item => item.isMain)
        cardMain.isMain = false
        cardFind.isMain = true
        cardFind.isEnable = true
        store.dispatch(globalActions.setCard(newCardData))
        store.dispatch(globalActions.setDexLastTransaction({
          etherTx: {},
          tokenTx: [],
          blockNumber: 0
        }))
        store.dispatch(globalActions.setTokenHistory({
          isLoading: false,
          datas: []
        }))
        store.dispatch(globalActions.setTokenHistoryAll({
          isLoading: false,
          cardsTxs: {}
        }))
        store.dispatch(globalActions.setDappAssetHistory([]))
        this.refreshHoldingTokens(newCardData)
        this.refreshUserAuthentication(newCardData)
        // this.refreshTokenTxsHistoryAll(cardFind)
        resolve(newCardData)
      } catch (err) {
        reject(err)
        logDebugChatwork('switchAccount', err)
      }
    })
  }

  static async importAccount (newWallet, key, cardName, isMain = false) {
    return new Promise(async (resolve, reject) => {
      try {
        const { arrCardData } = reduxState
        let newCardData = arrCardData.slice()

        if (isMain) {
          newCardData = newCardData.map(item => {
            return { ...item, isMain: false }
          })
        }
        const privateKey = newWallet.privateKey.substring(2, newWallet.privateKey.length)
        const newAddress = newWallet.address.toLowerCase()

        newCardData.push({
          key,
          etherIndex: null,
          address: newAddress,
          mnemonic: null,
          privateKey,
          cardName,
          balance: 0,
          totalBalance: 0,
          totalFiatAmount: 0,
          isMain,
          isEnable: true,
          isImported: true
        })
        store.dispatch(globalActions.setCard(newCardData))
        await this.refreshCardBalance(newCardData)
        if (isMain) {
          this.refreshHoldingTokens(newCardData)
          this.refreshUserAuthentication(newCardData)
        }
        resolve(newCardData)
      } catch (err) {
        reject(err)
        logDebugChatwork('importAccount', err)
      }
    })
  }

  static editAccount (card) {
    return new Promise((resolve, reject) => {
      try {
        const { arrCardData } = reduxState
        const newCardData = arrCardData.slice()
        const cardFind = newCardData.find(item => item.address === card.address)
        cardFind.cardName = card.cardName
        store.dispatch(globalActions.setCard(newCardData))
        resolve(newCardData)
      } catch (err) {
        reject(err)
        logDebugChatwork('editAccount', err)
      }
    })
  }

  static deleteAccount (card) {
    return new Promise((resolve, reject) => {
      try {
        const { arrCardData } = reduxState
        const newCardData = arrCardData.filter(item => item.address !== card.address)
        if (card.isMain) {
          newCardData[0].isMain = true
          newCardData[0].isEnable = true
          this.refreshHoldingTokens(newCardData)
        }
        store.dispatch(globalActions.setCard(newCardData))
        resolve(newCardData)
      } catch (err) {
        reject(err)
        logDebugChatwork('deleteAccount', err)
      }
    })
  }

  static async refreshCardBalance (arrCardData) {
    try {
      const { arrCurrencyData, etherPrice } = reduxState
      let arrFilterAddr = []
      arrCardData.map(item => item.address !== '' && item.isEnable && arrFilterAddr.push(item.address))
      // let arrBalance = await EtherScan.getMultipleEthBalance(arrFilterAddr)
      let totalBalance = 0
      if (arrCardData && arrCardData.length > 0) {
        let etherFiat
        let newEtherPrice = await DexAPI.getCoinInfo(HBCRYPTO.ETHEREUM, arrCurrencyData)
        if (newEtherPrice && !newEtherPrice.error && newEtherPrice.priceCurrency) {
          etherFiat = newEtherPrice.priceCurrency
        } else {
          etherFiat = etherPrice.price
        }
        for (let i = 0; i < arrCardData.length; i++) {
          let balance = await getETHBalance(arrCardData[i].address)
          arrCardData[i].balance = balance
          arrCardData[i].fiatAmount = Number(etherFiat) * Number(balance)
          totalBalance += Number(balance)
        }
        arrCardData[0].totalBalance = totalBalance
        arrCardData[0].totalFiatAmount = Number(etherFiat) * Number(totalBalance)
      
        store.dispatch(globalActions.setCard(arrCardData))
      }
    } catch (err) {
      logDebugChatwork('refreshCardBalance', err)
    }
  }

  static async refreshHoldingTokens (arrCardData) {
    try {
      const { arrHBTokens, arrCustomToken, arrCurrencyData } = reduxState
      if (arrCardData && arrCardData.length > 0) {
        const mainAccount = filterMainAccount(arrCardData)
        if (mainAccount) {
          let tempTokenData = []
          // get holding tokens belongs to ether address
          const addressInfo = await DexAPI.getAddressInfo(mainAccount.address, arrCurrencyData)
          if (addressInfo && !addressInfo.error) {
            let autoAddTokens = addressInfo.tokens
            if (autoAddTokens && autoAddTokens.length > 0) {
              // find wrapper ether token from holding list
              let wethToken = autoAddTokens.find(item => item.symbol === 'WETH')
              // remove wrapper ether token from list
              autoAddTokens = autoAddTokens.filter(item => item.symbol !== 'WETH')
              // import wrapper ether token into holding list
              wethToken && autoAddTokens.unshift(wethToken)
              autoAddTokens.map(token => {
                let key = tempTokenData.length === 0 ? 0 : tempTokenData[tempTokenData.length - 1].key + 1
                let cardImage = DEFAULT_CARD_URLS[key % DEFAULT_CARD_URLS.length]
                let tokenId = ''
                let iconImage = ''
                if (arrHBTokens.length > 0) {
                  let existHBToken = arrHBTokens.find(e => e.tokenAddress.toLowerCase() === token.address.toLowerCase())
                  if (existHBToken) {
                    // specify card image from arrHBTokens
                    cardImage = existHBToken.cardImage
                    iconImage = existHBToken.iconImage
                    tokenId = existHBToken.id ? existHBToken.id : ''
                  }
                }
                if (arrCustomToken.length > 0) {
                  let existCustomToken = arrCustomToken.find(e => e.owner.toLowerCase() === mainAccount.address.toLowerCase() && e.address.toLowerCase() === token.address.toLowerCase())
                  if (existCustomToken) {
                    // specify card image from arrCustomToken
                    cardImage = existCustomToken.cardImage
                  }
                }
                tempTokenData.push({
                  key: key,
                  tokenId,
                  name: token.name,
                  address: token.address.toLowerCase(),
                  cardImage,
                  iconImage,
                  symbol: token.symbol,
                  url: '',
                  balance: token.balance,
                  currencyBalance: Number(token.balance) * Number(token.priceCurrency),
                  fiatAmount: token.priceCurrency,
                  decimals: token.decimals,
                  isAutoAddedToken: true,
                  isCustomToken: token.isCustomToken,
                  isEnabled: token.isEnabled,
                  isDeleted: token.isDeleted
                })
              })
              if (tempTokenData.length === 0 || (tempTokenData.length > 0 && tempTokenData[0].symbol !== 'WETH')) {
                // import wrapper ether token as default
                const wethToken = arrHBTokens.find(e => e.symbol.toUpperCase() === 'WETH')
                tempTokenData.unshift({
                  key: 0,
                  tokenId: '',
                  name: 'Wrapped Ether',
                  address: WETH_ADDRESS,
                  cardImage: wethToken ? wethToken.cardImage : Images.wethCard,
                  iconImage: '',
                  symbol: 'WETH',
                  url: 'https://weth.io/',
                  balance: 0,
                  currencyBalance: 0,
                  fiatAmount: 0,
                  decimal: 18,
                  isCustomToken: false,
                  isAutoAddedToken: true,
                  isEnabled: true,
                  isDeleted: false
                })
              }
              store.dispatch(globalActions.setToken(tempTokenData))
            }
          } 
        }
      }
    } catch (err) {
      logDebugChatwork('refreshHoldingTokens', err)
    }
  }

  static async refreshUserAuthentication (arrCardData) {
    try {
      if (arrCardData && arrCardData.length > 0) {
        const mainAccount = filterMainAccount(arrCardData)
        const md5 = require('md5')
        if (mainAccount) {
          const auth = await DexAPI.initAuth(mainAccount.address, md5(mainAccount.address.toLowerCase()))
          if (auth && auth.data) {
            store.dispatch(globalActions.setUserAuth(auth.data))
          }
          DappAPI.initUser(mainAccount.address, md5(mainAccount.address.toLowerCase()))
        }
      }
    } catch (err) {
      logDebugChatwork('refreshUserAuthentication', err)
    }
  }

  static trackingTransaction = (account, hash, from, to, amount, rawTransaction = null, selectedToken = null, note = null, gameItem = null) => {
    try {
      const { trackingSendTxs } = reduxState
      const sendingObject = {
        account,
        hash: hash.toLowerCase(),
        fromAddr: from,
        toAddr: to,
        receiver: to,
        selectedToken,
        rawTransaction,
        amount,
        note,
        gameItem,
        isComplete: false,
        timeStamp: moment(new Date()).unix()
      }
      const newTrackingSend = trackingSendTxs.slice()
      newTrackingSend.push(sendingObject)
      store.dispatch(globalActions.setSendingProcess(newTrackingSend))
    } catch (err) {
      logDebugChatwork('trackingTransaction', err)
    }
  }

  static async refreshEtherTxsHistory (card) {
    try {
      const { pendingTx, pendingAirdrop, arrAccountHistoryDataAll } = reduxState
      let newArrTxs = []
      newArrTxs = await this.getEtherTxsHistory(card)
      arrAccountHistoryDataAll.cardsTxs[card.address] = newArrTxs
      store.dispatch(globalActions.setEtherHistory({
        isLoading: false,
        datas: newArrTxs
      }))
      store.dispatch(globalActions.setEtherHistoryAll(arrAccountHistoryDataAll))
      // update pending status if the transaction was done
      if (newArrTxs.length > 0 && pendingTx.isPending) {
        let resPending = newArrTxs.findIndex(i => i.hash.toLowerCase() === pendingTx.lastTxID.toLowerCase())
        if (resPending !== -1) {
          pendingTx.isPending = false
          store.dispatch(globalActions.setPendingTx(pendingTx))
        } 
      }
      if (newArrTxs.length > 0 && pendingAirdrop.isPending) {
        let resPending = newArrTxs.findIndex(i => i.hash.toLowerCase() === pendingAirdrop.lastTxID.toLowerCase())
        if (resPending !== -1) {
          pendingAirdrop.isPending = false
          store.dispatch(globalActions.setPendingAirdrop(pendingAirdrop))
        } 
      }
    } catch (err) {
      logDebugChatwork('refreshEtherTxsHistory', err)
    }
  }

  static async refreshEtherTxsHistoryAll (arrCardData, isShowRefresh) {
    if (!arrCardData) return
    let newArrTxs = []
    let cardsTxs = {}
    try {
      for (let i = 0; i < arrCardData.length; i++) {
        let card = arrCardData[i]
        let newArrTxsSingle = await this.getEtherTxsHistory(card)
        newArrTxs = newArrTxs.concat(newArrTxsSingle)
        cardsTxs[card.address] = newArrTxsSingle
      }
      let newT = await newArrTxs.sort(function (a, b) {
        return Number(b.date) - Number(a.date)
      })
      // update transaction index
      newT.map((item, index) => {
        item.id = newT.length - index
      })
      store.dispatch(globalActions.setEtherHistoryAll({
        isLoading: false,
        datas: newT,
        cardsTxs
      }))
    } catch (err) {
      logDebugChatwork('refreshEtherTxsHistoryAll', err)
    }
  }

  static async refreshTokenTxsHistoryAll (cardSelected) {
    const { arrTokenData } = reduxState
    let cardsTxs = {}
    try {
      // for (let i = 0; i < arrTokenData.length; i++) {
      //   let card = arrTokenData[i]
      //   let newArrTxsByOne = await this.getTokenTxsHistory(card, cardSelected)
      //   cardsTxs[card.address] = newArrTxsByOne
      // }
      let promise = arrTokenData.map(async (item, index) => {
        return new Promise(async (resolve, reject) => {
          let newArrTxsByOne = await this.getTokenTxsHistory(item, cardSelected)
          cardsTxs[item.address] = newArrTxsByOne
          resolve(cardsTxs)
        })
      })
      Promise.all(promise)
        .then(result => {
          store.dispatch(globalActions.setTokenHistoryAll({
            isLoading: false,
            cardsTxs: result[0] ? result[0] : []
          }))
        })
        .catch(err => {
          logDebugChatwork('refreshTokenTxsHistoryAll', err)
        })
    } catch (err) {
      logDebugChatwork('refreshTokenTxsHistoryAll', err)
    }
  }

  static async refreshTokenTxsHistory (token, cardSelected) {
    try {
      const { pendingTx, arrTokenHistoryDataAll, arrCardData } = reduxState
      const mainAccount = filterMainAccount(arrCardData)
      let newArrTxs = []
      if (token && mainAccount.address.toLowerCase() === cardSelected.address.toLowerCase()) {
        newArrTxs = await this.getTokenTxsHistory(token, cardSelected)
        arrTokenHistoryDataAll.cardsTxs[token.address] = newArrTxs
      }
      store.dispatch(globalActions.setTokenHistory({
        isLoading: false,
        datas: newArrTxs
      }))
      store.dispatch(globalActions.setTokenHistoryAll(arrTokenHistoryDataAll))
      // update pending status if the transaction was done
      if (newArrTxs.length > 0 && pendingTx.isPending) {
        let resPending = newArrTxs.findIndex(i => i.hash.toLowerCase() === pendingTx.lastTxID.toLowerCase())
        if (resPending !== -1) {
          store.dispatch(globalActions.setPendingTx({
            account: pendingTx.account,
            isPending: false, 
            lastTxID: pendingTx.lastTxID
          }))
        } 
      }
    } catch (err) {
      logDebugChatwork('refreshTokenTxsHistory', err)
    }
  }

  static async getEtherTxsHistory (card) {
    const { arrCardData, arrHBContract, trackingSendTxs } = reduxState
    let newArrTxs = []
    let clearHash = []
    let sendingHash = []
    try {
      
      if (trackingSendTxs.length > 0) {
        sendingHash = trackingSendTxs.map(itm => itm.hash)
      }

      let resTokenTx = await DexAPI.getAllTokenTransactions(card.address)
      let arrNewTxs = []
      let resTx = await DexAPI.getEtherTransactions(card.address)
      if (resTx && resTx.data) arrNewTxs = resTx.data

      if (arrNewTxs) {
        arrNewTxs = removeDuplicateObjectByKey(arrNewTxs, 'identify')
        for (const item of arrNewTxs) {
        // arrNewTxs.reverse().forEach(async (item, index) => {
          let fromAddr = ''
          let toAddr = ''
          let receiver = ''
          let sender = ''
          if (card.address === item.to) {
            toAddr = card.address
            receiver = card.cardName
    
            arrCardData.map(cardItem => {
              if (cardItem.address === item.from) {
                fromAddr = cardItem.address
                sender = cardItem.cardName
              }
            })
          } else {
            fromAddr = card.address
            sender = card.cardName
    
            arrCardData.map(cardItem => {
              if (cardItem.address === item.to) {
                toAddr = cardItem.address
                receiver = cardItem.cardName
              }
            })
          }

          let value = convertWeiToBalance(item.value)
          let oldIndex = newArrTxs[newArrTxs.length - 1]
          let isError = item.isError === '1'
          let feeValue = item.from === card.address ? convertWeiToBalance(item.gasPrice * item.gasUsed) : 0
          let gasPrice = convertWeiToBalance(item.gasPrice)
          let isSelfTransaction = item.from === card.address && item.to === card.address
          let isToken = false
          let tokenName = ''
          
          let contractName = ''
          let contract = null
          const functionContract = arrHBContract.find(e => e.address.toLowerCase() === item.to.toLowerCase() && e.type === 'function')
          if (functionContract && functionContract.functionList) {
            const ABI = await EtherscanServices.getABI(item.to)
            if (ABI && ABI.result) {
              const res = await DappAPI.decodeInput(item.input, JSON.parse(ABI.result))
              if (res && res.method) {
                let newListFunction = functionContract.functionList.slice()
                let findName = newListFunction.find(itm => itm.function.toLowerCase().includes(res.method.toLowerCase()))
                if (findName) {
                  contract = findName
                }
              }
            }
          }
          if (!contract) {
            contract = arrHBContract.find(e => e.address.toLowerCase() === item.to.toLowerCase())
            if (!contract) {
              contract = arrHBContract.find(e => e.address.toLowerCase() === item.from.toLowerCase())
            } 
          }
          if (contract && contract.name) {
            contractName = contract.name
          } else if (resTokenTx && Array.isArray(resTokenTx.data)) {
            let tx = resTokenTx.data.find(e => e.hash.toLowerCase() === item.hash.toLowerCase())
            if (tx) {
              isToken = true
              tokenName = tx.tokenName
            }
          }

          if (sendingHash.length > 0) {
            sendingHash.includes(item.hash.toLowerCase()) &&
              clearHash.push(item.hash.toLowerCase())
          }
    
          newArrTxs.push({
            // id: index === 0
            //   ? 1
            //   : oldIndex ? oldIndex.id + 1 : 1,
            nonce: item.nonce,
            symbol: HBCRYPTO.ETHEREUM,
            hash: item.hash,
            cardIndex: card.key,
            cardName: card.cardName,
            date: item.timeStamp,
            gasPrice: gasPrice,
            gasUsed: item.gasUsed,
            blockHeight: item.blockNumber,
            gasLimit: item.gas,
            fromAddr: fromAddr.length > 0 ? fromAddr : item.from,
            from: item.from,
            to: item.to,
            toAddr: toAddr.length > 0 
              ? toAddr 
              : (item.to === '' && item.contractAddress !== '' ? item.contractAddress : item.to),
            fee: feeValue,
            newBalance: item.from === card.address ? item.balanceFrom : item.balanceTo,
            // Balance show based on index before
            // balance: index === 0
            //   ? 0
            //   : oldIndex.newBalance,
            amount: isError ? 0 : value,
            sender: sender.length > 0 ? sender : item.from,
            receiver: receiver.length > 0 
              ? receiver 
              : (item.to === '' && item.contractAddress !== '' ? item.contractAddress : item.to),
            method: isSelfTransaction ? 'self' : (item.from === card.address ? 'sent' : 'receive'),
            isToken,
            tokenName,
            contractName,
            input: item.input,
            isError
          })
        }
        if (clearHash.length > 0) {
          clearHash.forEach(itm => this.clearTrackingTxs(itm, true))
        }
        // newArrTxs = newArrTxs.reverse()
      }
      return newArrTxs
    } catch (err) {
      logDebugChatwork('getEtherTxsHistory', err)
      return newArrTxs
    }
  }

  static async getTokenTxsHistory (token, cardSelected) {
    const { arrCardData, trackingSendTxs } = reduxState
    let newArrTxs = []
    let clearHash = []
    let sendingHash = []
    try {
      if (trackingSendTxs.length > 0) {
        sendingHash = trackingSendTxs.map(itm => itm.hash)
      }

      let tokenTxs = []
      let resTx = await DexAPI.getTokenTransactions(cardSelected.address, token.address)
      if (resTx && resTx.data) tokenTxs = resTx.data
      // }
      if (tokenTxs) {
        tokenTxs = removeDuplicateObjectByKey(tokenTxs, 'identify')
        tokenTxs.reverse().forEach((item, index) => {
          let fromAddr = ''
          let toAddr = ''
          let receiver = ''
          let sender = ''
          arrCardData.map(cardItem => {
            if (cardItem.address === item.from) {
              fromAddr = cardItem.address
              sender = cardItem.cardName
            }
            if (cardItem.address === item.to) {
              toAddr = cardItem.address
              receiver = cardItem.cardName
            }
          })

          if (sendingHash.length > 0) {
            sendingHash.includes(item.hash.toLowerCase()) &&
              clearHash.push(item.hash.toLowerCase())
          }

          let oldIndex = newArrTxs[newArrTxs.length - 1]
          let isError = false
          let feeValue = convertWeiToBalance(item.gasPrice * item.gasUsed)
          let gasPrice = convertWeiToBalance(item.gasPrice)
          let isSelfTransaction = item.from === cardSelected.address && item.to === cardSelected.address
    
          newArrTxs.push({
            id: index === 0 ? 1 : oldIndex ? oldIndex.id + 1 : 1,
            nonce: item.nonce,
            hash: item.hash,
            symbol: item.tokenSymbol,
            contractAddress: token.address,
            date: item.timeStamp,
            gasPrice,
            gasUsed: item.gasUsed,
            blockHeight: item.blockNumber,
            gasLimit: item.gas,
            fromAddr: fromAddr.length > 0 ? fromAddr : item.from,
            toAddr: toAddr.length > 0 ? toAddr : item.to,
            sender: sender.length > 0 ? sender : item.from,
            receiver: receiver.length > 0 ? receiver : item.to,
            fee: feeValue,
            // newBalance: index === 0
            //   ? value
            //   : isSelfTransaction ? (oldIndex ? oldIndex.newBalance : value)
            //     : item.from === cardSelected.address
            //       ? oldIndex ? Number(oldIndex.newBalance) - Number(value) : value
            //       : oldIndex ? Number(oldIndex.newBalance) + Number(value) : value,
            // balance: index === 0
            //   ? 0
            //   : oldIndex ? oldIndex.newBalance : 0,
            amount: convertWeiToBalanceCustom(item.value, item.tokenDecimal),
            method: isSelfTransaction ? 'self' : (item.from === cardSelected.address ? 'sent' : 'receive'),
            isToken: false,
            isError
          })
        })
        if (clearHash.length > 0) {
          clearHash.forEach(itm => this.clearTrackingTxs(itm, true))
        }
        newArrTxs = newArrTxs.reverse()
      }
      return newArrTxs
    } catch (err) {
      logDebugChatwork('getTokenTxsHistory', err)
      return newArrTxs
    }
  }

  static async clearTrackingTxs (hash, isDelete) {
    try {
      const { trackingSendTxs } = reduxState
      const newTrackingSend = trackingSendTxs.slice()

      if (hash) {
        if (isDelete) {
          const objIndex = newTrackingSend.findIndex((itm) => itm.hash.toLowerCase() === hash.toLowerCase())
          newTrackingSend.splice(objIndex, 1)
        } else {
          const objIndex = newTrackingSend.find((itm) => itm.hash.toLowerCase() === hash.toLowerCase())
          if (objIndex) {
            objIndex.isComplete = true
          }
        }
      } else {
        if (newTrackingSend && newTrackingSend.length > 0) {
          newTrackingSend[0].isComplete = null
        }
      }

      store.dispatch(globalActions.setSendingProcess(newTrackingSend))
    } catch (err) {
      logDebugChatwork('clearTrackingTxs', err)
    }
  }

  static async refreshAirdrop721 () {
    const { localeData } = reduxState
    let item721 = await NagemonAPI.getSetting()
    // let allItmes = false
    let item721V1 = await NagemonAPI.getAirdrop()
    let item721V2 = await NagemonAPI.getAirdropVersion2()
    let rateCoinCustomRedux = await DappAPI.getCompoundRate()
    console.log('rateCoinCustomRedux: ', rateCoinCustomRedux)
    console.log('item721item721item721: ', item721)
    console.log('item721V1: ', item721V1)
    console.log('item721V2: ', item721V2)
    let arr721 = []
    if (isObject(item721)) {
      item721.is721Drop = true
      item721.decimals = 2
      item721.expire_time = item721.airdrop_end_date
      item721.contractAddress = item721.airdrop_smart_contract_address.toLowerCase()
      item721.imageCard = item721.airdrop_image
      item721.imageLink = item721.airdrop_image
      item721.name = item721.airdrop_name
      item721.owner = item721.owner_address
      let timeStart = Date.parse(item721.airdrop_start_date)
      item721.start_time = timeStart
      item721._id = timeStart
      let timeEnd = Date.parse(item721.airdrop_end_date)
      item721.expire_time = timeEnd
      let timeNow = Date.now()
      if (timeEnd >= timeNow) {
        item721.isExpire = false
      } else {
        item721.isExpire = true
      }
      if (localeData === 'jp' && item721.airdrop_description.jp) {
        item721.description = item721.airdrop_description.jp
        item721.short_description = item721.airdrop_short_description.jp
      } else if (localeData === 'vn' && item721.airdrop_description.vi) {
        item721.description = item721.airdrop_description.vi
        item721.short_description = item721.airdrop_short_description.vi
      } else if (localeData === 'kr' && item721.airdrop_description.ko) {
        item721.description = item721.airdrop_description.ko
        item721.short_description = item721.airdrop_short_description.ko
      } else {
        item721.description = item721.airdrop_description.en
        item721.short_description = item721.airdrop_short_description.en
      }
      // let deadline = await this.getDeadLine(item721)
      // if (deadline) {
      //   item721.gdeadlineGacha = deadline.gdeadlineGacha
      //   item721.gfullTime = deadline.gfullTime
      // }
      arr721.push(item721)
    }
    if (Array.isArray(item721V1)) {
      for (let i = 0; i < item721V1.length; i++) {
      // item721V1.map(async e => {
        // e.is721DropV2 = true
        item721V1[i].prize.map(e => {
          if (e.otherAddress && rateCoinCustomRedux && rateCoinCustomRedux.data && rateCoinCustomRedux.data.length > 0) {
            console.log('findItemfindItemfindItem3: ', rateCoinCustomRedux)
            const findItem = rateCoinCustomRedux.data.find(itm => itm.address.toLowerCase() === e.otherAddress.toLowerCase())
            console.log('findItemfindItemfindItem4: ', findItem)
            if (findItem && findItem.rate && findItem.rateCoin && e.otherAmount) {
              let munberOfPrize = Number(e.otherAmount) * Number(findItem.rate)
              e.priceCustom = munberOfPrize.toString() + ' ' + findItem.rateCoin.toString()
            }
          }
        })
        item721V1[i].is721DropV1 = true
        item721V1[i].contractAddress = item721V1[i].address.toLowerCase()
        item721V1[i].imageCard = item721V1[i].icon_image
        item721V1[i].imageLink = item721V1[i].icon_image
        item721V1[i].owner = item721V1[i].address // plz check again
        let timeStart = Date.parse(item721V1[i].timeStart)
        item721V1[i].start_time = timeStart
        // e._id = timeStart
        let timeEnd = Date.parse(item721V1[i].timeEnd)
        item721V1[i].expire_time = timeEnd
        let timeNow = Date.now()
        if (timeEnd >= timeNow) {
          item721V1[i].isExpire = false
        } else {
          item721V1[i].isExpire = true
        }
        if (localeData === 'jp' && item721V1[i].description.jp) {
          item721V1[i].description = item721V1[i].description.jp
        } else if (localeData === 'vn' && item721V1[i].description.vi) {
          item721V1[i].description = item721V1[i].description.vi
        } else if (localeData === 'kr' && item721V1[i].description.ko) {
          item721V1[i].description = item721V1[i].description.ko
        } else {
          item721V1[i].description = item721V1[i].description.en
        }
        if (localeData === 'jp' && item721V1[i].prize_description.jp) {
          item721V1[i].prize_description = item721V1[i].prize_description.jp
        } else if (localeData === 'vn' && item721V1[i].prize_description.vi) {
          item721V1[i].prize_description = item721V1[i].prize_description.vi
        } else if (localeData === 'kr' && item721V1[i].prize_description.ko) {
          item721V1[i].prize_description = item721V1[i].prize_description.ko
        } else {
          item721V1[i].prize_description = item721V1[i].prize_description.en
        }
        if (localeData === 'jp' && item721V1[i].short_description.jp) {
          item721V1[i].short_description = item721V1[i].short_description.jp
        } else if (localeData === 'vn' && item721V1[i].short_description.vi) {
          item721V1[i].short_description = item721V1[i].short_description.vi
        } else if (localeData === 'kr' && item721V1[i].short_description.ko) {
          item721V1[i].short_description = item721V1[i].short_description.ko
        } else {
          item721V1[i].short_description = item721V1[i].short_description.en
        }
        if (localeData === 'jp' && item721V1[i].company_description.jp) {
          item721V1[i].company_description = item721V1[i].company_description.jp
        } else if (localeData === 'vn' && item721V1[i].company_description.vi) {
          item721V1[i].company_description = item721V1[i].company_description.vi
        } else if (localeData === 'kr' && item721V1[i].company_description.ko) {
          item721V1[i].company_description = item721V1[i].company_description.ko
        } else {
          item721V1[i].company_description = item721V1[i].company_description.en
        }
        // let deadline = await this.getDeadLine(item721V1[i])
        // if (deadline) {
        //   item721V1[i].gdeadlineGacha = deadline.gdeadlineGacha
        //   item721V1[i].gfullTime = deadline.gfullTime
        // }
      }
      arr721 = arr721.concat(item721V1)
    }
    if (Array.isArray(item721V2)) {
      for (let i = 0; i < item721V2.length; i++) {
      // item721V2.map(async e => {
        item721V2[i].prize.map(e => {
          if (e.otherAddress && rateCoinCustomRedux && rateCoinCustomRedux.data && rateCoinCustomRedux.data.length > 0) {
            console.log('findItemfindItemfindItem3: ', rateCoinCustomRedux)
            const findItem = rateCoinCustomRedux.data.find(itm => itm.address.toLowerCase() === e.otherAddress.toLowerCase())
            console.log('findItemfindItemfindItem4: ', findItem)
            if (findItem && findItem.rate && findItem.rateCoin && e.otherAmount) {
              let munberOfPrize = formatNumber((Number(e.otherAmount) * Number(findItem.rate)), 3)
              e.priceCustom = munberOfPrize.toString() + ' ' + findItem.rateCoin.toString()
            }
          }
        })
        item721V2[i].is721DropV2 = true
        item721V2[i].contractAddress = item721V2[i].address.toLowerCase()
        item721V2[i].imageCard = item721V2[i].icon_image
        item721V2[i].imageLink = item721V2[i].icon_image
        item721V2[i].owner = item721V2[i].address // plz check again
        let timeStart = Date.parse(item721V2[i].timeStart)
        item721V2[i].start_time = timeStart
        // e._id = timeStart
        let timeEnd = Date.parse(item721V2[i].timeEnd)
        item721V2[i].expire_time = timeEnd
        let timeNow = Date.now()
        if (timeEnd >= timeNow) {
          item721V2[i].isExpire = false
        } else {
          item721V2[i].isExpire = true
        }
        if (localeData === 'jp' && item721V2[i].description.jp) {
          item721V2[i].description = item721V2[i].description.jp
        } else if (localeData === 'vn' && item721V2[i].description.vi) {
          item721V2[i].description = item721V2[i].description.vi
        } else if (localeData === 'kr' && item721V2[i].description.ko) {
          item721V2[i].description = item721V2[i].description.ko
        } else {
          item721V2[i].description = item721V2[i].description.en
        }
        if (localeData === 'jp' && item721V2[i].prize_description.jp) {
          item721V2[i].prize_description = item721V2[i].prize_description.jp
        } else if (localeData === 'vn' && item721V2[i].prize_description.vi) {
          item721V2[i].prize_description = item721V2[i].prize_description.vi
        } else if (localeData === 'kr' && item721V2[i].prize_description.ko) {
          item721V2[i].prize_description = item721V2[i].prize_description.ko
        } else {
          item721V2[i].prize_description = item721V2[i].prize_description.en
        }
        if (localeData === 'jp' && item721V2[i].short_description.jp) {
          item721V2[i].short_description = item721V2[i].short_description.jp
        } else if (localeData === 'vn' && item721V2[i].short_description.vi) {
          item721V2[i].short_description = item721V2[i].short_description.vi
        } else if (localeData === 'kr' && item721V2[i].short_description.ko) {
          item721V2[i].short_description = item721V2[i].short_description.ko
        } else {
          item721V2[i].short_description = item721V2[i].short_description.en
        }
        if (localeData === 'jp' && item721V2[i].company_description.jp) {
          item721V2[i].company_description = item721V2[i].company_description.jp
        } else if (localeData === 'vn' && item721V2[i].company_description.vi) {
          item721V2[i].company_description = item721V2[i].company_description.vi
        } else if (localeData === 'kr' && item721V2[i].company_description.ko) {
          item721V2[i].company_description = item721V2[i].company_description.ko
        } else {
          item721V2[i].company_description = item721V2[i].company_description.en
        }
        // let deadline = await this.getDeadLineV2(item721V2[i])
        // if (deadline) {
        //   item721V2[i].gdeadlineGacha = deadline.gdeadlineGacha
        //   item721V2[i].gfullTime = deadline.gfullTime
        // }
      }
      arr721 = arr721.concat(item721V2)
    }
    return arr721
  }

  static async getDeadLine (item) {
    const { arrCardData } = reduxState
    const mainAccount = filterMainAccount(arrCardData)
    let gdeadlineGacha = false
    let gfullTime = false
    return new Promise(async (resolve, reject) => {
      const contractGacha = await getGachaAirdrop(AirdropABI721, item.contractAddress)
      contractGacha.methods.timeTrackUser(mainAccount.address).call().then(async (timeLastGetAward) => {
        await contractGacha.methods.periodToPlay().call().then((periodPlay) => {
          var seconds = Math.round(new Date().getTime() / 1000)
          const isOkCondition = (seconds - timeLastGetAward) >= periodPlay
          if (isOkCondition) {
            gfullTime = true
            gdeadlineGacha = false
          } else {
            gdeadlineGacha = Math.round((Number(timeLastGetAward) + Number(periodPlay)) * 1000)
            gfullTime = false
          }
          resolve({gdeadlineGacha, gfullTime})
        }).catch(() => {
          resolve(false)
        })
      }).catch(() => {
        resolve(false)
      })
    })
  }

  static async getDeadLineV2 (item) {
    const { arrCardData } = reduxState
    const mainAccount = filterMainAccount(arrCardData)
    let gdeadlineGacha = false
    let gfullTime = false
    return new Promise(async (resolve, reject) => {
      const contractGacha = await getGachaAirdrop(AirdropABI721v2, item.contractAddress)
      contractGacha.methods.getTimeTrackUser(item.airdropId, mainAccount.address).call().then(async (res) => {
        var seconds = Math.round(new Date().getTime() / 1000)
        const isOkCondition = (seconds - res['_timeTrackUser']) >= res['_periodToPlay']
        console.log('getDeadLineV2---res: ', res)
        console.log('getDeadLineV2---seconds: ', seconds)
        if (isOkCondition) {
          gfullTime = true
          gdeadlineGacha = false
        } else {
          gdeadlineGacha = Math.round((Number(res['_timeTrackUser']) + Number(res['_periodToPlay'])) * 1000)
          gfullTime = false
        }
        console.log('deadlineGacha--ne: ', gdeadlineGacha)
        console.log('fullTime--ne: ', gfullTime)
        resolve({gdeadlineGacha, gfullTime})
      }).catch(() => {
        resolve(false)
      })
    })
  }

  static async refreshGrabToken () {
    try {
      const { readGrab } = reduxState
      let now = new Date()
      let compareDate = new Date()
      let iNewCount = 0
      let newArrAirdrop = []
      let newArrTokenSale = []
      let listAirdrop = {}
      listAirdrop = await DexAPI.getAirdropList()
      let item721 = await this.refreshAirdrop721()
      if (listAirdrop && listAirdrop.data) {
        if (listAirdrop.data.length > 0) {
          for (let i = 0; i < listAirdrop.data.length; i++) {
            let item = listAirdrop.data[i]
            // check isExpire
            compareDate.setTime(item.expire_time)
            let isExpire = (compareDate.getTime() - now.getTime()) <= 0
            if (!isExpire && !readGrab.includes(item._id)) {
              iNewCount++
            } else {
              item.isRead = true
            }
            item.isExpire = isExpire
            newArrAirdrop.push(item)
          }
        }
        newArrAirdrop.length > 0 && newArrAirdrop.sort(function (a, b) {
          return b.start_time - a.start_time
        })
        console.log('newArrAirdrop-refresh: ', newArrAirdrop)
        store.dispatch(globalActions.setAirdrop(newArrAirdrop))
      }
      if (item721 && item721.length && (!newArrAirdrop || (newArrAirdrop && newArrAirdrop[0] && newArrAirdrop[0].is721Drop !== true))) {
        item721.map(e => {
          if ((!e.isExpire && (!e.hasOwnProperty('isActive') || e.isActive || e.is721Drop === true)) && !readGrab.includes(e._id)) {
            iNewCount++
          } else {
            e.isRead = true
          }
        })
        if (item721.length > 0) {
          let newArrAirdrop2 = item721.concat(newArrAirdrop)
          store.dispatch(globalActions.setAirdrop(newArrAirdrop2))
        }
      }

      // const listToken = await BacoorAPI.getTokenSale()
      // if (listToken) {
      //   if (listToken.length > 0) {
      //     for (let i = 0; i < listToken.length; i++) {
      //       const item = listToken[i]
      //       // Check isExpire
      //       compareDate.setTime(item.expire_time)
      //       let isExpire = (compareDate.getTime() - now.getTime()) <= 0
      //       if (!isExpire && !readGrab.includes(item._id)) {
      //         iNewCount++
      //       } else {
      //         item.isRead = true
      //       }
      //       item.isExpire = isExpire
      //       newArrTokenSale.push(item)
      //     }
      //   }
      //   store.dispatch(globalActions.setTokenSale(newArrTokenSale))
      // }

      store.dispatch(globalActions.setUnReadGrab(iNewCount))
    } catch (err) {
      logDebugChatwork('refreshGrabToken', err)
    }
  }

  static async refreshNoti () {
    const { readNotiNew, userAuth } = reduxState
    let notiItems
    if (userAuth && userAuth.createdAt) {
      notiItems = await DexAPI.getNoti(0, 0, userAuth.createdAt)
    }
    if (notiItems && notiItems.notifications && notiItems.notifications.length > 0) {
      let item = notiItems.notifications
      let iNewCount = 0
      for (let i = 0; i < notiItems.total; i++) {
        let check = !!readNotiNew[`${item[i]._id}`]
        if (!check) {
          iNewCount++
        }
        store.dispatch(globalActions.setUnReadNoti(iNewCount))
      }
      store.dispatch(globalActions.setDexNoti(notiItems))
      store.dispatch(globalActions.setUnReadNoti(iNewCount))
    } else {
      store.dispatch(globalActions.setDexNoti([]))
      store.dispatch(globalActions.setUnReadNoti(0))
    }
  }

  static async refreshDappAssests (gameSymbol, self, pageNum = 1) {
    return new Promise(async (resolve, reject) => {
      try {
        const { arrCardData, arrDappAssets } = reduxState
        const mainAccount = filterMainAccount(arrCardData)
        const arrAssets = await NagemonAPI.getInventoryByAddress(mainAccount.address, gameSymbol, self, pageNum)
        if (arrAssets && arrAssets.data && arrAssets.data.length > 0) {
          if (APP_ENVIROMENT === 'development') {
            const promise = arrAssets.data.map(async (item) => {
              const ownerAddress = await getOwnerOfGameItem(item.address, item.id, item.businessAddress, item.version)
              if (ownerAddress) {
                return ownerAddress.toLowerCase() === mainAccount.address ? item : null
              } else {
                return null
              }
            })

            const returnData = await Promise.all(promise)
            arrAssets.data = returnData.filter(itm => itm !== null)
          }
          let newDappAssets
          if (pageNum === 1) {
            newDappAssets = arrAssets.data
          } else {
            newDappAssets = arrDappAssets.concat(arrAssets.data)
          }
          resolve(arrAssets)
          store.dispatch(globalActions.setDappAssets(newDappAssets))
        } else {
          resolve([])
          pageNum === 1 && store.dispatch(globalActions.setDappAssets([]))
        }
      } catch (err) {
        reject(err)
        logDebugChatwork('refreshDappAssests', err)
      }
    })
  }

  static async refreshDappMarket (keyword, symbol, pageNum = 1, sort, direction) {
    return new Promise(async (resolve, reject) => {
      try {
        const { arrDappMarket } = reduxState
        const arrMarket = await NagemonAPI.getSaleGameItemV2(keyword, symbol, pageNum, sort, direction)
        if (arrMarket && arrMarket.data && arrMarket.data.length > 0) {
          let newDappMarket
          if (pageNum === 1) {
            newDappMarket = arrMarket.data
          } else {
            newDappMarket = arrDappMarket.concat(arrMarket.data)
          }
          resolve(arrMarket)
          store.dispatch(globalActions.setDappMarket(newDappMarket))
        } else {
          resolve([])
          pageNum === 1 && store.dispatch(globalActions.setDappMarket([]))
        }
      } catch (err) {
        reject(err)
        logDebugChatwork('refreshDappMarket', err)
      }
    })
  }

  static async refreshDappRequest (limit = NUM_REQUEST_NFT, skip = 0) {
    return new Promise(async (resolve, reject) => {
      try {
        const { arrCardData, arrDappRequest } = reduxState
        const mainAccount = filterMainAccount(arrCardData)
        const arrRequest = await DexAPI.getRequestGameItemAll(mainAccount.address, limit, skip)
        if (arrRequest && arrRequest.data && arrRequest.data.length > 0) {
          arrRequest.data.map((itm) => {
            if (itm.from.toLowerCase() === mainAccount.address.toLowerCase()) {
              itm.sent = true
            } else {
              itm.sent = false
            }
            let fromAddr = ''
            let toAddr = ''
            let receiver = ''
            let sender = ''
            arrCardData.map(cardItem => {
              if (cardItem.address.toLowerCase() === itm.from.toLowerCase()) {
                fromAddr = cardItem.address
                sender = cardItem.cardName
              }
              if (cardItem.address.toLowerCase() === itm.to.toLowerCase()) {
                toAddr = cardItem.address
                receiver = cardItem.cardName
              }
            })
            itm.fromAddr = fromAddr.length > 0 ? fromAddr : itm.from
            itm.toAddr = toAddr.length > 0 ? toAddr : itm.to
            itm.sender = sender.length > 0 ? sender : itm.from
            itm.receiver = receiver.length > 0 ? receiver : itm.to
          })
          let newDappRequest
          if (skip === 0) {
            newDappRequest = arrRequest.data
          } else {
            newDappRequest = arrDappRequest.concat(arrRequest.data)
          }
          resolve(arrRequest)
          store.dispatch(globalActions.setDappRequest(newDappRequest))
        } else {
          resolve([])
          skip === 0 && store.dispatch(globalActions.setDappRequest([]))
        }
      } catch (err) {
        reject(err)
        logDebugChatwork('refreshDappRequest', err)
      }
    })
  }

  static async refreshTotalSync () {
    try {
      const { arrCardData } = reduxState
      const mainAccount = filterMainAccount(arrCardData)
      let iNewCount = 0
      let totalSyncAsset
      if (mainAccount && mainAccount.address) {
        totalSyncAsset = await NagemonAPI.getTotalSync(mainAccount.address)
      }
      if (totalSyncAsset && totalSyncAsset.total) {
        iNewCount += Number(totalSyncAsset.total)
      }

      let totalSyncRequest
      if (mainAccount && mainAccount.address) {
        totalSyncRequest = await DexAPI.getTotalSyncRequestGame(mainAccount.address)
      }
      if (totalSyncRequest && totalSyncRequest.data) {
        iNewCount += Number(totalSyncRequest.data)
      }
      store.dispatch(globalActions.setUnReadGameItemSync(iNewCount))
    } catch (err) {
      logDebugChatwork('refreshTotalSync', err)
    }
  }

  static async saveReadNewFeature (newFeatureID, isCheck) {
    try {
      const { readNewFeature } = reduxState
      if (isCheck && !readNewFeature.includes(newFeatureID)) {
        readNewFeature.push(newFeatureID)
        store.dispatch(globalActions.setReadNewFeature(readNewFeature))
      }
    } catch (err) {
      logDebugChatwork('saveReadNewFeature', err)
    }
  }

  static async refreshGasStation () {
    try {
      let result = await DexAPI.getGasPrice()
      if (result && result.data && !result.error) {
        let arvgasTime = Math.round(result.data.block_time * 2)
        store.dispatch(globalActions.setGasStation({
          blockNum: result.data.blockNum,
          speed: result.data.speed,
          slow: result.data.safeLow / 10,
          fast: result.data.fastest / 10,
          medium: result.data.average / 10,
          gasTime_m: arvgasTime,
          gasTime_b: Math.round(arvgasTime / 16),
          gasUsed: 21000
        }))
      }
    } catch (err) {
      logDebugChatwork('refreshGasStation', err)
    }
  }
}
