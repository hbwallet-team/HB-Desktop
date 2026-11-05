import EtherscanServices from 'Backend/Api/services/EtherScan'
import {
  setCard,
  setToken,
  setLanguage,
  setCurrency,
  setEtherHistory,
  setEtherHistoryAll,
  setAddressBook,
  setTokenHistory,
  setTokenHistoryAll,
  setArrPayment,
  setPINcode,
  setGasStation,
  setAirdrop,
  setTokenSale,
  setUnReadGrab,
  setUnReadNoti,
  setPendingTx,
  setPendingAirdrop,
  setDexData,
  setUserAuth,
  setDexLastTransaction,
  setDexSelectedPair,
  setDexFavorite,
  setDexTokenFavorite,
  setDappFavorite,
  setDappFavoriteOutSide,
  setDappAssets,
  setDappRequest,
  setSendingProcess,
  setUnReadGameItemSync,
  setDappAssetHistory
} from 'Backend/Redux/actions/globalActions'
import store from 'Backend/Server/Datas'
import moment from 'moment'
import converter from 'hex2dec'
import Ethplorer from 'Backend/Api/services/Ethplorer'
import FiatMoneyConvert from 'Backend/HBLibrary/FiatMoneyConvert'
import EtherLibrary from 'Backend/HBLibrary/EtherLibrary'
import {
  HBCRYPTO,
  OBSERVER_KEY,
  DEFAULT_CARD_URLS
} from './globalConstants'
import {
  setMnemonic
} from 'Backend/Redux/actions/mainActions'
// import { setMnemonic, setWebsocket, setTimerSocket } from 'Backend/Redux/actions/mainActions'
// import BackgroundTimer from 'Utils/BackgroundTimer'
import io from 'socket.io-client'
import {
  setSagaHBTokens,
  setSagaRealBoostTokens,
  searchMarketCoin
} from 'Backend/Redux/actionSaga/sagaActions'
import Images from 'Assets/Image'
import init from 'Backend/Redux/lib/initState'
import {
  KEYSTORE
} from 'Utils/globalConstants'
import BacoorAPI from 'Backend/Api/services/BacoorAPI'
import DexAPI from 'Backend/Api/services/DexAPI'
import ChatworkAPI from 'Backend/Api/services/ChatworkAPI'
import Observer from './HBObserver'
import Settings from 'Backend/settings'
import GraphemeSplitter from 'grapheme-splitter'
import firebase from 'Utils/FireBase'
const publicIp = require('public-ip')
const bigdecimal = require('bigdecimal')
const CryptoJS = require('crypto-js')
const { shell, electron } = window.require('electron')
const remote = window.require('electron').remote
const splitter = new GraphemeSplitter()
const notifier = window.require('electron-notifications')

let os = require('os')
const NOTIFICATION_SOUND = require('Assets/Sound/notification_message.mp3')

const request = require('requestretry')

let socket
let socketGasStation
let socketDex
let socketDexTopScreen

const requestRetryAsync = async ({
  url,
  opt
}) => {
  let reqOpt = {
    url: url,
    json: true,
    // The below parameters are specific to request-retry
    maxAttempts: 2, // (default) try 2 times
    retryDelay: 5000, // (default) wait for 5s before trying again
    fullResponse: false // (default) To resolve the promise with the full response or just the body
  }
  if (opt) {
    reqOpt = Object.assign(opt, reqOpt)
  }

  return new Promise(async (resolve, reject) => {
    try {
      let res = await request(reqOpt)
      if (res) {
        resolve(res)
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve(null)
      }
    } catch (err) {
      console.log('requestRetryAsync - error: ', err)
      reject(err)
    }
  })
}

export const requestRetry = ({
  url,
  opt
}) => {
  return requestRetryAsync({
    url,
    opt
  })
}

export const convertTimestampToDateTime = (strTimestamp) => {
  let strTime = '--:--'

  if (strTimestamp) {
    let strTemp = String(strTimestamp)
    const datas = strTemp.split('.')
    if (datas.length > 0) {
      strTemp = datas[0]
    }
    if (strTemp.length > 10) {
      strTime = moment(strTemp).format('YYYY/MM/DD h:mma')
    } else {
      strTime = moment(strTimestamp * 1000).format('YYYY/MM/DD h:mma')
    }
  }
  return strTime
}
export const convertTimestampToDate = (strTimestamp) => {
  let strTime = '--:--'
  if (strTimestamp) {
    if (String(strTimestamp).length > 10) {
      strTime = moment(strTimestamp).format('YYYY/MM/DD')
    } else {
      strTime = moment(strTimestamp * 1000).format('YYYY/MM/DD')
    }
  }
  return strTime
}
export const convertUtcToDateTime = (strDate) => {
  let strTime = '--:--'
  if (strDate) {
    let d = new Date(strDate)
    strTime = moment(d).format('YYYY/MM/DD h:mma')
  }
  return strTime
}
/**
 * NAME: validateAddress
 * PARAMS: strAddress
 * Validate address from users input
 * RULE: A-F, a-f, 0-9, x
 */
export const validateAddress = (strAddress) => {
  var reg = ''
  if (countDots(strAddress, '\\x') > 1) {
    reg = /^([A-Fa-f0-9_]+)$/
  } else {
    reg = /^([A-Fa-f0-9_x]+)$/
  }

  return reg.test(strAddress)
}

/**
 * NAME: countDots
 * PARAMS: strString, strLetter
 * Count dots in string receive from user input
 */
export const countDots = (strString, strLetter) => {
  return (String(strString).match(RegExp(strLetter, 'g')) || []).length
}

/**
 * NAME: sortArray
 * PARAMS: arrSort
 * Sort array id from user input
 */
export const sortArray = (arrSort) => {
  return arrSort.sort((a, b) => (a.id < b.id) ? 1 : -1)
}

/**
 * NAME: validateMnemonic
 * PARAMS: strMnemonic
 * Validate mnemonic type from users input
 * RULE: A-Z, a-z, space
 */
export const validateMnemonic = (strMnemonic) => {
  var reg = /^[a-zA-Z\s]*$/
  return reg.test(strMnemonic)
}

/**
 * NAME: validateNumber
 * PARAMS: strNumber
 * Validate number type from users input
 * RULE: 0-9, _
 */
export const validateNumber = (strNumber) => {
  const reg = /^[0-9]+(\.)?[0-9]*$/
  return reg.test(strNumber)
}

export const validateDigit = (strNumber) => {
  var reg = /^([0-9]+)$/
  return reg.test(strNumber)
}

/**
 * NAME: validateSpace
 * PARAMS: strString
 * Remove all space if string contain all space
 */
export const validateSpace = (strString) => {
  return /\S/.test(strString)
}

/**
 * NAME: convertWeiToBalance
 * PARAMS: strValue, iDecimal
 * Convert value from wei value to format value
 */
export const convertWeiToBalance = (strValue, iDecimal = 18) => {
  return convertSmallNumberToRegular(parseInt(strValue) / Math.pow(10, iDecimal))
}

export const convertWeiToBalanceCustom = (strValue, iDecimal = 18) => {
  var multiplyNum = new bigdecimal.BigDecimal(Math.pow(10, iDecimal))
  var convertValue = new bigdecimal.BigDecimal(String(strValue))
  return convertValue.divide(multiplyNum).toString()
}

/**
 * NAME: convertBalanceToWei
 * PARAMS: strValue, iDecimal
 * Convert value from balance value to wei value
 */
export const convertBalanceToWei = (strValue, iDecimal = 18) => {
  var multiplyNum = new bigdecimal.BigDecimal(Math.pow(10, iDecimal))
  var convertValue = new bigdecimal.BigDecimal(String(strValue))
  return multiplyNum.multiply(convertValue).toString().split('.')[0]
}

export const formatAddress = (strAddress) => {
  return strAddress.substring(0, 10)
}

export const getCardBalance = async (arrCardData, arrCurrencyData, dispatch) => {
  let arrFilterAddr = []
  arrCardData.map(item => item.address !== '' && item.isEnable && arrFilterAddr.push(item.address))
  let arrBalance = await EtherscanServices.getMultipleEthBalance(arrFilterAddr)
  let totalBalance = 0
  console.log('arrFilterAddr: ', arrFilterAddr, arrBalance)
  if (arrBalance && arrBalance.length > 0) {
    for (let i = 0; i < arrBalance.length; i++) {
      let balance = Number(convertWeiToBalance(arrBalance[i].balance))
      arrCardData[i].balance = balance
      arrCardData[i].fiatAmount = await FiatMoneyConvert.convertCrytoToMoney(HBCRYPTO.ETHEREUM, arrCurrencyData, balance)
      totalBalance += Number(convertWeiToBalance(arrBalance[i].balance))
      console.log('totalBalance: ', arrBalance[i].balance, Number(convertWeiToBalance(arrBalance[i].balance)), totalBalance)
    }
    arrCardData[0].totalBalance = formatNumber(totalBalance)
    arrCardData[0].totalFiatAmount = await FiatMoneyConvert.convertCrytoToMoney(HBCRYPTO.ETHEREUM, arrCurrencyData, totalBalance)
    console.log('totalFiatAmount: ', arrCurrencyData, totalBalance, arrCardData[0].totalFiatAmount)

    dispatch(setCard(arrCardData))
  }
}

export const getTokenBalance = async (arrCardData, arrTokenData, arrCurrencyData, etherPrice, dispatch) => {
  if (arrCardData.length > 0 && arrTokenData.length > 0) {
    let dexExchangeData = await DexAPI.getAllVolumeExchange()
    for (let i = 0; i < arrTokenData.length; i++) {
      let item = arrTokenData[i]
      try {
        const balance = await EtherLibrary.getTokenBalance(item.address, arrCardData[0].address, item.decimals)
        let fTokenConvert = 0
        if (Number(item.tokenId) > 0) {
          let fiatMoneyRes = await FiatMoneyConvert.convertTokenToMoneyV2(item.tokenId, arrCurrencyData)
          if (fiatMoneyRes && fiatMoneyRes.data) {
            fTokenConvert = fiatMoneyRes.data.quotes[arrCurrencyData].price
          }
        }
        if (!fTokenConvert) {
          if (dexExchangeData && dexExchangeData.length > 0) {
            const token = dexExchangeData.filter(e => e.token.address === item.address)
            if (token.length > 0) {
              fTokenConvert = Math.abs(Number(token[0].lastPrice.price) * Number(etherPrice.price))
            }
          }
        }
        item.balance = balance
        item.currencyBalance = balance * fTokenConvert
        console.log('token balance:', item.symbol, balance, fTokenConvert)
      } catch (error) {
        console.log(error)
      }
    }
    dispatch(setToken(arrTokenData))
  }
}
export const getUserAuthentication = async (arrCardData, dispatch) => {
  if (arrCardData.length > 0) {
    let mainAccount = arrCardData[0]
    const auth = await DexAPI.initAuth(mainAccount.address, mainAccount.privateKey.substr(0, (mainAccount.privateKey.length / 2) - 1))
    // console.log('userinfo', auth)
    if (auth) {
      dispatch(setUserAuth(auth))
    }
  }
}
export const getTxsHistoryAll = async (arrCardData, pendingTx, dispatch, isShowRefresh) => {
  console.log('getTxsHistoryAll...: ', arrCardData, arrCardData.length)
  let newArrTxs = []
  dispatch(setEtherHistoryAll({
    isLoading: isShowRefresh,
    isFirstLoad: false,
    datas: newArrTxs
  }))
  try {
    if (!arrCardData) return
    for (let i = 0; i < arrCardData.length; i++) {
      let card = arrCardData[i]
      let arrNewTxs = await EtherscanServices.getAllTransactionByAddress(card.address)
      if (arrNewTxs && arrNewTxs.length > 0) {
        arrNewTxs.reverse().forEach((item, index) => {
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
          let timeStamp = convertTimestampToDateTime(item.timeStamp)
          let feeValue = item.from === card.address ? convertWeiToBalance(item.gasPrice * item.gasUsed) : 0
          let gasPrice = convertWeiToBalance(item.gasPrice)

          newArrTxs.push({
            id: index === 0 ? 1 : oldIndex.id + 1,
            symbol: HBCRYPTO.ETHEREUM,
            hash: item.hash,
            cardIndex: card.key,
            date: timeStamp,
            gasPrice: gasPrice,
            gasUsed: item.gasUsed,
            blockHeight: item.blockNumber,
            gasLimit: item.gas,
            fromAddr: fromAddr.length > 0 ? fromAddr : item.from,
            toAddr: toAddr.length > 0 ? toAddr : item.to,
            from: item.from,
            to: item.to,
            fee: feeValue,
            // Get new Balance for next index
            newBalance: index === 0
              ? value
              : item.from === card.address
                ? isError
                  ? oldIndex.newBalance - feeValue
                  : oldIndex.newBalance - value - feeValue
                : oldIndex.newBalance + value,
            // Balance show based on index before
            balance: index === 0
              ? 0
              : oldIndex.newBalance,
            amount: isError ? 0 : value,
            sender: sender.length > 0 ? sender : item.from,
            receiver: receiver && receiver.length > 0 ? receiver : item.to,
            method: item.from === card.address ? 'send' : 'receive',
            isToken: Number(item.value) === 0,
            input: item.input,
            isError
          })
          if (item.from === card.address && item.to === card.address && !isError) {
            // Add more item if send to same address
            newArrTxs.push({
              id: oldIndex.id + 2,
              symbol: HBCRYPTO.ETHEREUM,
              newBalance: oldIndex.newBalance - feeValue,
              balance: oldIndex.newBalance - value - feeValue,
              amount: value,
              hash: item.hash,
              date: timeStamp,
              fromAddr: fromAddr.length > 0 ? fromAddr : item.from,
              toAddr: toAddr.length > 0 ? toAddr : item.to,
              from: item.from,
              to: item.to,
              sender: sender.length > 0 ? sender : item.from,
              receiver: receiver && receiver.length > 0 ? receiver : item.to,
              fee: feeValue,
              gasPrice: gasPrice,
              gasUsed: item.gasUsed,
              method: 'self',
              cardIndex: card.key,
              blockHeight: item.blockNumber,
              gasLimit: item.gas,
              isToken: Number(item.value) === 0,
              input: item.input,
              isError
            })
          }
        })
      }
    }
    newArrTxs = newArrTxs.reverse()
    let newT = await newArrTxs.sort(function (a, b) {
      return Number(b.timeStamp) - Number(a.timeStamp)
    })
    dispatch(setEtherHistoryAll({
      isLoading: false,
      datas: newT
    }))
    // check pending tx
    if (newArrTxs.length > 0) {
      let resPending = newArrTxs.findIndex(i => i.hash === pendingTx.lastTxID)
      if (resPending !== -1) {
        dispatch(setPendingTx({ account: pendingTx.account, isPending: false, lastTxID: pendingTx.lastTxID }))
      }
    }
  } catch (error) {
    console.log(error)
    dispatch(setEtherHistoryAll({
      isLoading: false,
      datas: newArrTxs
    }))
  }
}

export const getTxsHistory = async (card, arrCardData, pendingTx, dispatch) => {
  let newArrTxs = []
  dispatch(setEtherHistory({
    isLoading: true,
    isFirstLoad: false,
    datas: newArrTxs
  }))
  try {
    let arrNewTxs = await EtherscanServices.getAllTransactionByAddress(card.address)
    if (arrNewTxs && arrNewTxs.length > 0) {
      arrNewTxs.reverse().forEach((item, index) => {
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
        let timeStamp = convertTimestampToDateTime(item.timeStamp)
        let feeValue = item.from === card.address ? convertWeiToBalance(item.gasPrice * item.gasUsed) : 0
        let gasPrice = convertWeiToBalance(item.gasPrice)

        newArrTxs.push({
          id: index === 0 ? 1 : oldIndex.id + 1,
          symbol: HBCRYPTO.ETHEREUM,
          hash: item.hash,
          cardIndex: card.key,
          date: timeStamp,
          gasPrice: gasPrice,
          gasUsed: item.gasUsed,
          blockHeight: item.blockNumber,
          gasLimit: item.gas,
          fromAddr: fromAddr.length > 0 ? fromAddr : item.from,
          toAddr: toAddr.length > 0 ? toAddr : item.to,
          from: item.from,
          to: item.to,
          fee: feeValue,
          // Get new Balance for next index
          newBalance: index === 0
            ? value
            : item.from === card.address
              ? isError
                ? oldIndex.newBalance - feeValue
                : oldIndex.newBalance - value - feeValue
              : oldIndex.newBalance + value,
          // Balance show based on index before
          balance: index === 0
            ? 0
            : oldIndex.newBalance,
          amount: isError ? 0 : value,
          sender: sender.length > 0 ? sender : item.from,
          receiver: receiver && receiver.length > 0 ? receiver : item.to,
          method: item.from === card.address ? 'send' : 'receive',
          isToken: Number(item.value) === 0,
          input: item.input,
          isError
        })
        if (item.from === card.address && item.to === card.address && !isError) {
          // Add more item if send to same address
          newArrTxs.push({
            id: oldIndex.id + 2,
            symbol: HBCRYPTO.ETHEREUM,
            newBalance: oldIndex.newBalance - feeValue,
            balance: oldIndex.newBalance - value - feeValue,
            amount: value,
            hash: item.hash,
            date: timeStamp,
            fromAddr: fromAddr.length > 0 ? fromAddr : item.from,
            toAddr: toAddr.length > 0 ? toAddr : item.to,
            from: item.from,
            to: item.to,
            sender: sender.length > 0 ? sender : item.from,
            receiver: receiver && receiver.length > 0 ? receiver : item.to,
            fee: feeValue,
            gasPrice: gasPrice,
            gasUsed: item.gasUsed,
            method: 'self',
            cardIndex: card.key,
            blockHeight: item.blockNumber,
            gasLimit: item.gas,
            isToken: Number(item.value) === 0,
            input: item.input,
            isError
          })
        }
      })
      dispatch(setEtherHistory({
        isLoading: false,
        datas: newArrTxs.reverse()
      }))
      // check pending tx
      if (newArrTxs.length > 0) {
        let resPending = newArrTxs.findIndex(i => i.hash === pendingTx.lastTxID)
        if (resPending !== -1) {
          dispatch(setPendingTx({ account: pendingTx.account, isPending: false, lastTxID: pendingTx.lastTxID }))
        }
      }
    } else {
      dispatch(setEtherHistory({
        isLoading: false,
        datas: newArrTxs
      }))
    }
  } catch (error) {
    console.log(error)
    dispatch(setEtherHistory({
      isLoading: false,
      datas: newArrTxs
    }))
  }
}

export const getTokenTxsHistory = async (token, arrCardData, pendingTx, dispatch) => {
  let newArrTxs = []
  dispatch(setTokenHistory(newArrTxs))
  let address = arrCardData[0].address
  let contractAddress = token.address
  let limit = 1000
  let datas = await Ethplorer.getTokenTransactions(address, contractAddress, limit)
  console.log('getTokenTxsHistory: ', datas)
  try {
    if (datas && datas.operations) {
      datas.operations.map((item, index) => {
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
        newArrTxs.push({
          id: index,
          hash: item.transactionHash,
          symbol: item.tokenInfo.symbol,
          date: convertTimestampToDateTime(item.timestamp),
          fromAddr: fromAddr.length > 0 ? fromAddr : item.from,
          toAddr: toAddr.length > 0 ? toAddr : item.to,
          from: item.from,
          to: item.to,
          sender: sender.length > 0 ? sender : item.from,
          receiver: receiver && receiver.length > 0 ? receiver : item.to,
          amount: convertWeiToBalance(Number(item.value), item.tokenInfo.decimals),
          input: item.input,
          method: item.from === arrCardData[0].address ? 'send' : 'receive'
        })
      })
      dispatch(setTokenHistory(newArrTxs))
      // check pending transaction
      let resPending = newArrTxs.findIndex(i => i.hash === pendingTx.lastTxID)
      if (resPending !== -1) {
        dispatch(setPendingTx({ account: arrCardData, isPending: false, lastTxID: pendingTx.lastTxID }))
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getLatestTx = async (THIS, latestTx, dispatch) => {
  const { arrCardData, arrTokenData, arrCurrencyData, dexLastTransaction, t, pendingTx, etherPrice } = THIS.props
  if (latestTx && latestTx.tx) {
    if (latestTx.tx.length > 0 && latestTx.blockNumber !== dexLastTransaction.blockNumber) {
      // save block number into local store
      dexLastTransaction.blockNumber = latestTx.blockNumber
      dispatch(setDexLastTransaction(dexLastTransaction))

      for (let i = 0; i < latestTx.tx.length; i++) {
        let item = latestTx.tx[i]
        if (pendingTx.lastTxID === item.hash && pendingTx.isPending === false) {
          continue
        }
        let tempTx = dexLastTransaction
        let notice = ''
        switch (item.type) {
        case HBCRYPTO.ETHEREUM: {
          if (tempTx.etherTx && latestTx.timeStamp < tempTx.etherTx.timeStamp) {
            continue
          }
          tempTx.etherTx = {
            timeStamp: latestTx.timeStamp,
            received: item.to === arrCardData[0].address,
            balance: item.value
          }
          // specify notice message
          if (item.from === arrCardData[0].address) {
            // Get message
            notice = t('Sentnew', { number: formatNumberLeftZero(convertWeiToBalance(item.value)), Symbol: HBCRYPTO.ETHEREUM, cardName: arrCardData[0].cardName })
          } else {
            // Get message
            notice = t('receivedEth', { number: formatNumberLeftZero(convertWeiToBalance(item.value)), Token: HBCRYPTO.ETHEREUM, cardName: arrCardData[0].cardName })
          }
          break
        }
        case HBCRYPTO.ERC20: {
          let tempTx = dexLastTransaction
          if (tempTx.tokenTx[item.address] && latestTx.timeStamp < tempTx.tokenTx[item.address].timeStamp) {
            continue
          }
          tempTx.tokenTx[item.address] = {
            timeStamp: latestTx.timeStamp,
            received: item.to === arrCardData[0].address,
            balance: item.value,
            token: {
              name: item.token.name,
              decimal: item.token.decimals.toNumber(),
              address: item.address,
              symbol: item.token.symbol
            }
          }
          // specify notice message
          if (item.from === arrCardData[0].address) {
            // Get message
            notice = t('Sentnew', { number: formatNumberLeftZero(convertWeiToBalance(item.value, item.token.decimals.toNumber())), Symbol: item.token.symbol, cardName: arrCardData[0].cardName })
          } else {
            // Get message
            notice = t('receivedEth', { number: formatNumberLeftZero(convertWeiToBalance(item.value, item.token.decimals.toNumber())), Token: item.token.symbol, cardName: arrCardData[0].cardName })
          }
          break
        }
        case HBCRYPTO.WRAP: {
          let tempTx = dexLastTransaction
          if (tempTx.tokenTx[item.address] && latestTx.timeStamp < tempTx.tokenTx[item.address].timeStamp) {
            continue
          }
          tempTx.tokenTx[item.address] = {
            timeStamp: latestTx.timeStamp,
            received: true,
            balance: item.value,
            token: {
              name: item.token.name,
              decimal: item.token.decimals.toNumber(),
              address: item.address,
              symbol: item.token.symbol
            }
          }
          notice = t('wrapETHsuccess', { number: formatNumberLeftZero(convertWeiToBalance(item.value, item.token.decimals.toNumber())) })
          break
        }
        case HBCRYPTO.UNWRAP: {
          let tempTx = dexLastTransaction
          if (tempTx.tokenTx[item.address] && latestTx.timeStamp < tempTx.tokenTx[item.address].timeStamp) {
            continue
          }
          tempTx.tokenTx[item.address] = {
            timeStamp: latestTx.timeStamp,
            received: false,
            balance: item.value,
            token: {
              name: item.token.name,
              decimal: item.token.decimals.toNumber(),
              address: item.address,
              symbol: item.token.symbol
            }
          }
          notice = t('unwrapETHsuccess', { number: formatNumberLeftZero(convertWeiToBalance(item.value, item.token.decimals.toNumber())) })
          break
        }
        }
        // save last transactions into local store
        dispatch(setDexLastTransaction(tempTx))
        dispatch(setPendingTx({
          account: arrCardData[0],
          isPending: false,
          lastTxID: item.hash
        }))
        // update card balance
        await getCardBalance(arrCardData, arrCurrencyData, dispatch)
        // update token balance
        await getTokenBalance(arrCardData, arrTokenData, arrCurrencyData, etherPrice, dispatch)
        // show notification to notice user
        showNotification(notice, t)
        // update transaction history
        setTimeout(() => {
          getTxsHistoryAll(arrCardData, pendingTx, dispatch, true)
        }, 5000)
      }
    }
  }
}

export const formatNumberOld = (strNumber, decimalFormat = 8, checkExchange = false) => {
  if (!strNumber) return 0
  strNumber = Number(strNumber).toFixed(10).replace(/\.?0+$/, '')
  let dotsCountStr = countDots(strNumber.toString(), '\\.')
  if (dotsCountStr === 1) {
    let arrNum = strNumber.toString().split('.')
    if (arrNum[1].length > 2) {
      arrNum[1] = arrNum[1].substring(0, decimalFormat)
    }
    strNumber = arrNum.join('.')
  }

  var strFormatNum = ''
  let dotsCount = countDots(String(strNumber), '\\.')
  if (dotsCount === 1) {
    // let decimalCount = strNumber.length - String(strNumber).indexOf('.') - 1
    strFormatNum = Number(strNumber) >= 0.01
      ? Number(strNumber).toFixed(2)
      : Number(strNumber).toFixed(decimalFormat).replace(/\.?0+$/, '')
  } else {
    strFormatNum = decimalFormat <= 2
      ? Number(strNumber).toFixed(2)
      : Number(strNumber).toFixed(decimalFormat).replace(/\.?0+$/, '')
  }

  if (Number(strFormatNum) === 0 && checkExchange === false) {
    strFormatNum = '0.00'
  }
  if (Number(strFormatNum) === 0 && checkExchange === true) {
    strFormatNum = '0'
  }
  return numberWithCommas(strFormatNum)
}

export const formatNumber1 = (strNumber, decimalFormat = 8) => {
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  strNumber = Number(strNumber).toFixed(10).replace(/\.?0+$/, '')
  let dotsCountStr = countDots(strNumber.toString(), '\\.')
  if (dotsCountStr === 1) {
    let arrNum = strNumber.toString().split('.')
    if (arrNum[1].length > 2) {
      arrNum[1] = arrNum[1].substring(0, 8)
    }
    strNumber = arrNum.join('.')
  }

  var strFormatNum = ''
  let dotsCount = countDots(String(strNumber), '\\.')
  if (dotsCount === 1) {
    let decimalCount = strNumber.length - String(strNumber).indexOf('.') - 1
    strFormatNum = decimalCount <= 2
      ? Number(strNumber).toFixed(2)
      : Number(strNumber).toFixed(decimalFormat).replace(/\.?0+$/, '')
  } else {
    strFormatNum = decimalFormat <= 2
      ? Number(strNumber).toFixed(2)
      : Number(strNumber).toFixed(decimalFormat).replace(/\.?0+$/, '')
  }
  return strFormatNum
}

export const formatNumber2 = (strNumber, decimalFormat = 8) => {
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  strNumber = Number(strNumber).toFixed(10).replace(/\.?0+$/, '')
  let dotsCountStr = countDots(strNumber.toString(), '\\.')
  if (dotsCountStr === 1) {
    let arrNum = strNumber.toString().split('.')
    arrNum[1] = arrNum[1].substring(0, decimalFormat)
    strNumber = arrNum.join('.')
  }
  var strFormatNum = ''
  strFormatNum = Number(strNumber).toFixed(decimalFormat)
  return strFormatNum
}

export const formatNumberLeftZero = (strNumber, decimalFormat = 8) => {
  let first = '0'
  let second = ''
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  isNaN(Number(strNumber)) && (strNumber = 0)
  strNumber = Number(strNumber).toFixed(10)
  let arrDigit = String(strNumber).split('.')
  first = arrDigit[0]
  if (arrDigit.length > 1 && decimalFormat > 0) {
    second = arrDigit[1]
    if (first.length + second.length > 9) { // length of integer part and decimal part greater than 9
      second = arrDigit[1].substring(0, 9 - first.length).replace(/\.?0+$/, '')
    }
    if (second.length === 0) {
      second = '00'
    } else if (second.length === 1) {
      second = second + '0'
    }
  }
  first = numberWithCommasInt(first)
  return second.length === 0 ? first : [first, second].join('.')
}
export const formatNumberLeftZeroCal = (strNumber, decimalFormat = 8) => {
  let first = '0'
  let second = ''
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  isNaN(Number(strNumber)) && (strNumber = 0)
  strNumber = Number(strNumber).toFixed(decimalFormat)
  let arrDigit = String(strNumber).split('.')
  first = arrDigit[0]
  if (arrDigit.length > 1) {
    second = arrDigit[1]
    if (first.length + second.length > 9) { // length of integer part and decimal part greater than 9
      second = arrDigit[1].substring(0, 9 - first.length).replace(/\.?0+$/, '')
    }
  }
  return second.length === 0 ? first : [first, second].join('.')
}
export const formatPriceNumber = (strNumber, decimalFormat = 8) => {
  let first = '0'
  let second = ''
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  isNaN(Number(strNumber)) && (strNumber = 0)
  strNumber = Number(strNumber).toFixed(decimalFormat)
  let arrDigit = String(strNumber).split('.')
  first = arrDigit[0]
  if (arrDigit.length > 1) {
    second = arrDigit[1]
    if (first.length + second.length > 9) { // length of integer part and decimal part greater than 9
      second = arrDigit[1].substring(0, 9 - first.length)
    }
  }
  first = numberWithCommasInt(first)
  return second.length === 0 ? first : [first, second].join('.')
}
export const formatNumberCalOld = (strNumber, decimalFormat = 8) => {
  let first = '0'
  let second = '00'
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  isNaN(Number(strNumber)) && (strNumber = 0)
  strNumber = Number(strNumber).toFixed(10)
  let arrDigit = String(strNumber).split('.')
  if (arrDigit.length > 1) {
    first = arrDigit[0]
    second = arrDigit[1].substring(0, decimalFormat)
  } else if (arrDigit.length === 1) {
    first = arrDigit[0]
  }
  return second.length === 0 ? first : [first, second].join('.')
}
export const formatNumberCal = (strNumber, decimalFormat = 8) => {
  let first = '0'
  let second = '00'
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  isNaN(Number(strNumber)) && (strNumber = 0)
  strNumber = Number(strNumber).toFixed(10)
  let arrDigit = String(strNumber).split('.')
  if (arrDigit.length > 1) {
    first = arrDigit[0]
    second = arrDigit[1].substring(0, decimalFormat).replace(/\.?0+$/, '')
  } else if (arrDigit.length === 1) {
    first = arrDigit[0]
  }
  return second.length === 0 ? first : [first, second].join('.')
}

export const numberWithCommasInt = (strNumber) => {
  return strNumber ? strNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0
}

export const formatNumber = (strNumber, decimalFormat = 8) => {
  let first = '0'
  let second = ''
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  isNaN(Number(strNumber)) && (strNumber = 0)
  strNumber = Number(strNumber).toFixed(10)
  let arrDigit = String(strNumber).split('.')
  if (arrDigit.length > 1 && decimalFormat > 0) {
    first = numberWithCommasInt(arrDigit[0])
    second = arrDigit[1].substring(0, decimalFormat).replace(/\.?0+$/, '')
    if (second.length === 0) {
      second = '00'
    } else if (second.length === 1) {
      second = second + '0'
    }
  } else {
    first = numberWithCommasInt(arrDigit[0])
  }
  return second.length === 0 ? first : [first, second].join('.')
}

export const formatNumberDisplay = (strNumber, decimalFormat = 8) => {
  let first = '0'
  let second = ''
  decimalFormat = decimalFormat < 8 ? decimalFormat : 8
  isNaN(Number(strNumber)) && (strNumber = 0)
  strNumber = Number(strNumber).toFixed(10)
  let arrDigit = String(strNumber).split('.')
  if (arrDigit.length > 1 && decimalFormat > 0) {
    first = numberWithCommasInt(arrDigit[0])
    second = arrDigit[1].substring(0, decimalFormat).replace(/\.?0+$/, '')
    if (second.length === 0) {
      second = '00'
    } else if (second.length === 1) {
      second = second + '0'
    }
  } else {
    first = numberWithCommasInt(arrDigit[0])
  }
  return {
    firstNumber: first,
    secondNumber: second
  }
}

export const formatFiatDisplay = (strNumber, decimalFormat = 6) => {
  let first = '0'
  let second = '00'
  decimalFormat = decimalFormat < 6 ? decimalFormat : 6
  isNaN(Number(strNumber)) && (strNumber = 0)
  strNumber = Number(strNumber).toFixed(10)
  let arrDigit = String(strNumber).split('.')
  if (arrDigit.length > 1) {
    first = numberWithCommasInt(arrDigit[0])
    second = arrDigit[1].substring(0, decimalFormat).replace(/\.?0+$/, '')
    if (second.length === 0) {
      second = '00'
    } else if (second.length === 1) {
      second = second + '0'
    }
  } else {
    first = numberWithCommasInt(arrDigit[0])
  }
  return {
    firstNumber: first,
    secondNumber: second
  }
}

const numberWithCommas = (x) => {
  var parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

// Delete database
export const deleteData = (dispatch, i18n) => {
  dispatch(setToken([]))
  dispatch(setCard([]))
  dispatch(setAddressBook([]))
  dispatch(setArrPayment([]))
  dispatch(setMnemonic(''))
  dispatch(setPINcode(''))
  dispatch(setSagaHBTokens([]))
  dispatch(setSagaRealBoostTokens([]))
  dispatch(setCurrency(init.currencyInit))
  dispatch(setLanguage('en'))
  dispatch(searchMarketCoin([], ''))
  i18n.changeLanguage('en')
  dispatch(setEtherHistory(init.accountHistoryInit))
  dispatch(setEtherHistoryAll(init.accountHistoryAllInit))
  dispatch(setTokenHistory(init.tokenHistoryInit))
  dispatch(setTokenHistoryAll(init.tokenHistoryInitAll))
  dispatch(setAirdrop([]))
  dispatch(setTokenSale([]))
  dispatch(setUnReadGrab(0))
  dispatch(setUnReadNoti(0))
  dispatch(setPendingTx(init.pendingTx))
  dispatch(setPendingAirdrop(init.pendingAirdrop))
  dispatch(setDexData(init.dexData))
  dispatch(setUserAuth({}))
  dispatch(setDexLastTransaction({
    etherTx: {},
    tokenTx: [],
    blockNumber: 0
  }))
  dispatch(setDexSelectedPair({}))
  dispatch(setDexFavorite([]))
  dispatch(setDexTokenFavorite(init.dexTokenFavorite))
  dispatch(setDappFavorite([]))
  dispatch(setDappFavoriteOutSide([]))
  dispatch(setDappAssets([]))
  dispatch(setDappRequest([]))
  dispatch(setSendingProcess([]))
  dispatch(setUnReadGameItemSync(0))
  dispatch(setDappAssetHistory([]))
  store.set(KEYSTORE.ACCOUNT_HISTORY, init.accountHistoryInit)
  store.set(KEYSTORE.ACCOUNT_HISTORY_ALL, init.accountHistoryInit)
  store.set(KEYSTORE.TOKEN_HISTORY, init.tokenHistoryInit)
  store.set(KEYSTORE.TOKEN_HISTORY_ALL, init.tokenHistoryInitAll)
  store.set(KEYSTORE.PENDING_TX, init.pendingTx)
  store.set(KEYSTORE.PENDING_AIRDROP, init.pendingAirdrop)
  store.set(KEYSTORE.UN_READ_GRAB, init.unReadGrab)
  store.set(KEYSTORE.UN_READ_NOTI, init.unReadNoti)
  store.set(KEYSTORE.TOKEN_SALE, init.arrTokenSale)
  store.set(KEYSTORE.AIR_DROP, init.arrAirdrop)
  store.set(KEYSTORE.LANGUAGE, init.languageInit)
  store.set(KEYSTORE.TOKEN_DATA, init.tokenInit)
  store.set(KEYSTORE.CARD_DATA, init.cardInit)
  store.set(KEYSTORE.PINCODE, init.PINInit)
  store.set(KEYSTORE.CURRENCY, init.currencyInit)
  store.set(KEYSTORE.ADDRESS_BOOK, init.accountBook)
  store.set(KEYSTORE.ARR_PAYMENT, init.payment)
  store.set(KEYSTORE.USER_AUTH, init.userAuth)
  store.set(KEYSTORE.DAPP_FAVORITES, init.dappFavorites)
  store.set(KEYSTORE.DAPP_FAVORITES_OUT_SIDE, init.dappFavoritesOutSide)
  store.set(KEYSTORE.DAPP_ASSETS, init.arrDappAssets)
  store.set(KEYSTORE.SENDING_PROCESS, init.trackingSendTxs)
  store.set(KEYSTORE.ADVANCED_WALLET_HISTORY, init.advancedWalletHistory)
  store.set(KEYSTORE.CUSTOM_TOKEN, init.arrCustomToken)
  store.set(KEYSTORE.UN_READ_GAME_ITEM_SYNC, init.unReadGameItemSync)
  store.clear()

  // Clear on socket
  socket && socket.disconnect()
  socketDex && socketDex.disconnect()

  // trigger send event to all windows
  triggerSendEventToAllWindow('reset-wallet')
}

export const zeroPadLeft = (text, length = 64) => {
  while (text.length < length) {
    text = '0' + text
  }
  return text
}

export const convertObjectToArray = (objConvert) => {
  return Object.keys(objConvert).map(function (key) {
    return objConvert[key]
  })
}

export const activeSocketGasStation = async (dispatch) => {
  console.log('WebSocket start gas ...')

  if (socketGasStation) {
    socketGasStation.disconnect()
    socketGasStation = null
  }
  // 18.179.26.249:3000
  // 54.249.78.25:3009
  socketGasStation = io.connect('http://18.179.26.249:3000/eth_gas_ets', {
    transports: ['websocket'],
    forceNew: true,
    query: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjE3YTQzYTMwOTBlZmY2NjE3MTUyOGYiLCJleHBpcmVfdGltZSI6IjEwMDAwMDAwMDAwMDAwMDAwMDAwMCIsIm5hbWUiOiJ0YWl0dDEyMyIsImF1dGhUeXBlIjoiYXBpIiwiaWF0IjoxNTI4Mjc2MDI2LCJleHAiOjE4NDM4NTIwMjYsImlzcyI6IkJBQ09PUiJ9.lTUnd6yAlsrbnQ5DGnhZkqNVjsMU9u7ZrWa0CRCaiHk'
      // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjE3N2YzOTMwOTBlZmY2NjE3MTRjODkiLCJleHBpcmVfdGltZSI6Ijk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTkiLCJuYW1lIjoiYmFjb29yIiwiYXV0aFR5cGUiOiJhcGkiLCJpYXQiOjE1MjgyNjY1NTMsImV4cCI6MTg0Mzg0MjU1MywiaXNzIjoiQkFDT09SIn0.VN7IgHl_D_CdvEGbV1o6IA8CDyNIqkAU4LCfdAWr3cs'
    }
  })
  socketGasStation.on('event', (newEvent) => {
    console.log('Message from server gas ', newEvent)
    if (newEvent && newEvent.data && newEvent.data.gasPrices && newEvent.data.timeWait) {
      let result = newEvent.data
      dispatch(setGasStation({
        block: result.gasPrices.block,
        speed: result.gasPrices.speed,
        gasPrice: result.gasPrices.standard_gwei,
        gasPrice_safeLow: result.gasPrices.safelow_gwei,
        gasTime_m: Number(result.timeWait.median_wait_s),
        gasTime_b: Number(result.timeWait.median_wait_b),
        gasUsed: 21000
      }))
    }
  })
  // Call Pia gas station for first time
  callApiGasStation(dispatch)
}

export const activeSocketDex = async (dispatch) => {
  if (socketDex) {
    socketDex.disconnect()
    socketDex = null
  }
  let ip = await publicIp.v4()
  socketDex = io.connect(Settings.server.dexApi.socket, {
    transports: ['websocket'],
    query: {
      token: 'bacoor2018',
      address: ip
    },
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionAttempts: 10
  })
  socketDex.on('dexTestNotiEvent', (object) => {
    console.log('Message from server dexTestNotiEvent ', object)
    Observer.emit(OBSERVER_KEY.NEW_DEX_NOTIFICATIONS, object)
  })
  socketDex.on('dexNotificationEvent', (object) => {
    console.log('Message from server dexNotificationEvent ', object)
    Observer.emit(OBSERVER_KEY.NEW_DEX_NOTIFICATIONS, object)
  })
  socketDex.on('dexOrderEvent', (object) => {
    console.log('Message from server dexOrderEvent ', object)
    Observer.emit(OBSERVER_KEY.NEW_DEX_ORDER, object)
    Observer.emit(OBSERVER_KEY.NEW_DEX_ORDER_FAVORITE, object)
  })
  socketDex.on('dexGameEvent', (object) => {
    console.log('Message from server dexGameEvent ', object)
    Observer.emit(OBSERVER_KEY.NEW_DEX_GAME_EVENT, object)
  })
  socketDex.on('dexRequestEvent', (object) => {
    console.log('Message from server dexRequestEvent ', object)
    Observer.emit(OBSERVER_KEY.NEW_DEX_REQUEST_EVENT, object)
  })
  socketDex.on('dexOrderEventTopScreen', (object) => {
    console.log('Message from server dexOrderEventTopScreen ', object)
    Observer.emit(OBSERVER_KEY.DEX_UPDATE_PRICE_CHART, object)
    Observer.emit(OBSERVER_KEY.DEX_UPDATE_FAVORITE, object)
  })
  socketDex.on('dexOrderEventTopScreen1H', (object) => {
    console.log('Message from server dexOrderEventTopScreen1H', object)
    Observer.emit(OBSERVER_KEY.DEX_UPDATE_PRICE_CHART_1H, object)
  })
  socketDex.on('connect', function () {
    const sessionid = socketDex.id
    console.log('sessionid socketDex: ', sessionid)
  })
}

export const activeFirebase = (dispatch) => {
  const database = firebase.database()
  database.ref('services').on('value', function (snapshot) {
    const data = snapshot.val()
    if (data && data.airdrop) {
      Observer.emit(OBSERVER_KEY.NEW_AIRDROP, data)
    }
  })
}

const callApiGasStation = async (dispatch) => {
  let newEvent = await BacoorAPI.getGasStation()
  console.log('Call Api from server gas ', newEvent)

  if (newEvent && newEvent.data && newEvent.data.gasPrices && newEvent.data.timeWait) {
    let result = newEvent.data
    dispatch(setGasStation({
      block: result.gasPrices.block,
      speed: result.gasPrices.speed,
      gasPrice: result.gasPrices.standard_gwei,
      gasPrice_safeLow: result.gasPrices.safelow_gwei,
      gasTime_m: Number(result.timeWait.median_wait_s),
      gasTime_b: Number(result.timeWait.median_wait_b),
      gasUsed: 21000
    }))
  }
}

export const activeWebsocket = (dispatch, oldWebsocketData, oldTimerSocketData, arrCardData, t, arrCurrencyData) => {
  console.log('WebSocket start ...')
  if (socket) {
    socket.disconnect()
    socket = null
  }
  let arrStrCardAddress = []
  arrCardData.map(e => e.address !== '' && e.isEnable && arrStrCardAddress.push(e.address))

  socket = io.connect('http://18.179.26.249:3000/transaction', {
    transports: ['websocket'],
    forceNew: true,
    query: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjE2NjQ4YjY1NzJmYTZkY2ZmOGMzOTciLCJleHBpcmVfdGltZSI6Ijk5OTk5OTk5OTk5IiwibmFtZSI6InRhaXR0MTIzIiwiYXV0aFR5cGUiOiJhcGkiLCJpYXQiOjE1MjgxOTQxODcsImV4cCI6MTg0Mzc3MDE4NywiaXNzIjoiQkFDT09SIn0.7vgy9sYDqhMUtup1CNi_Uc4B95-fLpbfs_rh-libaiE',
      address: arrStrCardAddress
    }
  })

  socket.on('connect', () => {
    socket.emit('room', arrStrCardAddress)
    // activeSocketGasStation(dispatch) //We will leave this socket
  })
  // Listen for messages
  socket.on('event', (newEvent) => {
    console.log('Message from server ', newEvent)

    const result = newEvent.data
    const type = newEvent.type
    if (result.hash) {
      if (type && type.type === 'send') {
        let message = ''
        for (let i = 0; i < arrCardData.length; i++) {
          const item = arrCardData[i]
          if (item.address === result.from) {
            let value = result.value
            let symbol = HBCRYPTO.ETHEREUM
            let decimals = 18
            // Check if transfer token
            if (result.transactionType === 'token_transfer') {
              const tokenObject = result.transferToken
              value = tokenObject.value
              symbol = tokenObject.tokenInfo.symbol
              decimals = tokenObject.tokenInfo.decimals
              console.log('token transfer: ', symbol, ' ', value)
            }
            // Show notification & sound
            if (os.release().includes('Mac')) {
              // Get message
              message = t('Sentnew', { number: formatNumber(convertWeiToBalance(value, decimals)), Symbol: symbol, cardName: (i === 0 ? t('mainAccount') : item.cardName) })
              // Show notifi
              const notification = new Notification('HB-DEX', {
                // icon: Images.icApp,
                body: message
              })
              notification.addEventListener('click', function () {
                console.log('Notification clicked')
              })
            } else {
              // Get message
              message = t('Sentnew', { number: formatNumber(convertWeiToBalance(value, decimals)), Symbol: symbol, cardName: (i === 0 ? t('mainAccount') : item.cardName) })
              // Show noti
              showWindowNoti(message, t)
            }
            break
          }
        }
      } else if (type && type.type === 'receive') {
        let message = ''
        for (let i = 0; i < arrCardData.length; i++) {
          const item = arrCardData[i]
          if (item.address === result.to) {
            let value = result.value
            let symbol = HBCRYPTO.ETHEREUM
            let decimals = 18

            // Check if transfer token
            if (result.transactionType === 'token_transfer') {
              const tokenObject = result.transferToken
              value = tokenObject.value
              symbol = tokenObject.tokenInfo.symbol
              decimals = tokenObject.tokenInfo.decimals
            }

            if (os.release().includes('Mac')) {
              message = t('receivedEth', { number: formatNumber(convertWeiToBalance(value, decimals)), Token: symbol, cardName: item.cardName })
              const notification = new Notification('HB-DEX', {
                // icon: Images.icApp,
                body: message
              })
              notification.addEventListener('click', function () {
                console.log('Notification clicked')
              })
            } else {
              message = t('receivedEth', { number: formatNumber(convertWeiToBalance(value, decimals)), Token: symbol, cardName: item.cardName })
              showWindowNoti(message, t)
            }
            break
          }
        }
      }
    }
  })
}

const showWindowNoti = (message, t) => {
  console.log('showWindowNoti')
  // Play sound
  var audio = new Audio(NOTIFICATION_SOUND)
  audio.play()
  // Show noti
  if (notifier) {
    const noti = notifier.notify('HB WALLET DESKTOP', {
      message: message,
      icon: Images.icApp,
      buttons: [t('Close')]
    })
    noti.on('swipedRight', () => {
      noti.close()
    })
    noti.on('buttonClicked', (text, buttonIndex, options) => {
      noti.close()
    })
  }
}

export const sort = (arr, key) => {
  return arr.sort((a, b) => (a[key] < b[key]) ? 1 : -1)
}

export const EncodeData = (str, key) => {
  let ciphertext = CryptoJS.AES.encrypt(str, key + key)
  ciphertext = CryptoJS.AES.encrypt(ciphertext.toString(), key)
  return ciphertext.toString()
}

export const DecodeData = (str, key) => {
  let bytes = CryptoJS.AES.decrypt(str, key)
  let plaintext = bytes.toString(CryptoJS.enc.Utf8)
  bytes = CryptoJS.AES.decrypt(plaintext, key + key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export const isEmpty = (obj) => {
  // null and undefined are "empty"
  if (obj == null) return true

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false
  if (obj.length === 0) return true

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== 'object') return true

  return true
}

export const isEmptyObject = (obj) => {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false
    }
  }
  return JSON.stringify(obj) === JSON.stringify({})
}

export const increaseNumber = (number) => {
  if (number !== '') {
    let numberInString = number.toString()
    let index = numberInString.indexOf('.')
    let unit
    let result
    if (index === -1) {
      unit = 1
      result = parseFloat(numberInString) + parseFloat(1)
      return result.toString()
    } else { // index must be = 1, otherwise some thing wrong
      let numberInSplit = numberInString.split('.')
      let aa = Math.pow(10, numberInSplit[1].length)
      unit = 1 / aa
      result = parseFloat(numberInString) + parseFloat(unit.toString())
      return result.toFixed(numberInSplit[1].length).toString()
    }
  }
  return formatNumber(1, 1)
}

export const decreaseNumber = (number) => {
  if (number !== '') {
    let numberInString = number.toString()
    let index = numberInString.indexOf('.')
    let unit
    let result
    if (index === -1) {
      unit = 1
      result = parseFloat(numberInString) - parseFloat(1)
      return result <= 0 ? formatNumber(0, 1).toString() : result.toString()
    } else { // index must be = 1, otherwise some thing wrong
      let numberInSplit = numberInString.split('.')
      let aa = Math.pow(10, numberInSplit[1].length)
      unit = 1 / aa
      result = parseFloat(numberInString) - parseFloat(unit.toString())
      return result <= 0 ? formatNumber(0, 1).toString() : result.toFixed(numberInSplit[1].length).toString()
    }
  }
  return ''
}

export const convertSmallNumberToRegular = (x) => {
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split('e-')[1])
    if (e) {
      x *= Math.pow(10, e - 1)
      x = '0.' + (new Array(e)).join('0') + x.toString().substring(2)
    }
  } else {
    let e = parseInt(x.toString().split('+')[1])
    if (e > 20) {
      e -= 20
      x /= Math.pow(10, e)
      x += (new Array(e + 1)).join('0')
    }
  }
  return x
}

export const formatSmallNumber = (x, decimals) => {
  return formatNumberLeftZero(convertSmallNumberToRegular(x), decimals)
}

export const openTxID = (txID) => {
  openBrowserInNewTab(Settings.server.etherscan.urlLookup + 'tx/' + txID)
}

/**
 * Show notification & sound
 */
export const showNotification = (message, t) => {
  console.log('notice message', message)
  if (message !== '') {
    if (os.release().includes('Mac')) { // case of Mac OS
      console.log('showMacNoti')
      // Show notifi
      const notification = new Notification('HB WALLET DESKTOP', {
        icon: Images.icApp,
        body: message
      })
      notification.addEventListener('click', function () {
        console.log('Notification clicked')
      })
    } else { // case of another OS
      // Show noti
      showWindowNoti(message, t)
    }
  }
}

/**
 * Check exists a url link
 * @param {*} url 
 */
export const checkUrlLink = (url) => {
  return new Promise(async (resolve, reject) => {
    if (url.trim() !== '') {
      if (!/^(f|ht)tps?:\/\//i.test(url)) {
        if (!/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi.test(url)) {
          resolve(`https://www.google.com/search?q=${url}&oq=${url}`)
        } else {
          let newUrl = 'https://' + url
          let xhr = new XMLHttpRequest()
          xhr.open('HEAD', newUrl)
          xhr.send()
          xhr.onload = function () {
            if (xhr.status >= 400) { // analyze HTTP status of the response
              resolve(`https://www.google.com/search?q=${url}&oq=${url}`)
            } else { // show the result
              resolve(newUrl)
            }
          }
        }
      } else {
        resolve(url)
      }
    } else {
      resolve('')
    }
  })
}

export const convertHexToDecimal = (hexNum) => {
  return converter.hexToDec(hexNum)
}

export const roundingNumber = (number, rounding = 8) => {
  const powNumber = Math.pow(10, parseInt(rounding))
  return Math.floor(number * powNumber) / powNumber
}

// Only send address if you want to generate data for send
export const generateDataToken = (amount = 0, address) => {
  const transferOpCode = '0xa9059cbb'
  const ABIValueToTransfer = zeroPadLeft(converter.decToHex(amount.toString().split('.')[0]).replace('0x', ''), 64)

  if (address) {
    const ethNakedAddress = address.toLowerCase().replace('0x', '')
    const ABIAddressTarget = zeroPadLeft(ethNakedAddress, 64)
    return transferOpCode + ABIAddressTarget + ABIValueToTransfer
  } else {
    return transferOpCode + ABIValueToTransfer
  }
}

export const getHoldingToken = async (arrCardData, arrTokenData, dispatch) => {
  if (arrCardData && arrCardData.length > 0) {
    const mainAccount = arrCardData[0]
    let tempTokenData = arrTokenData
    if (mainAccount) {
      const holdingContractAdresses = tempTokenData && tempTokenData.length > 0 ? arrTokenData.map(item => item.address) : []
      const addressInfo = await Ethplorer.getAddressInfo(mainAccount.address)
      if (addressInfo) {
        const holdingTokens = addressInfo.tokens
        if (holdingTokens && holdingTokens.length > 0) {
          const autoAddTokens = holdingTokens.filter(item => !holdingContractAdresses.includes(item.tokenInfo.address))
          autoAddTokens.map(token => {
            let key = tempTokenData.length === 0 ? 0 : tempTokenData[tempTokenData.length - 1].key + 1
            let cardImage = DEFAULT_CARD_URLS[key % DEFAULT_CARD_URLS.length]
            let isCustomToken = true
            tempTokenData.push({
              key: key,
              tokenId: '',
              name: token.tokenInfo.name,
              address: token.tokenInfo.address.toLowerCase(),
              cardImage: cardImage,
              iconImage: '',
              symbol: token.tokenInfo.symbol,
              url: '',
              balance: token.balance / (10 ** token.tokenInfo.decimals),
              decimal: token.tokenInfo.decimals,
              isCustomToken: isCustomToken,
              isAutoAddedToken: true,
              checked: true
            })
          })
        }
      }
      dispatch(setToken(tempTokenData))
    }
  }
}

export const filterListSending = (data, selectedToken, fromAddress) => {
  return data.filter(itm => {
    if (selectedToken) {
      return itm.selectedToken && (itm.selectedToken.address === selectedToken.address)
    } else {
      return (itm.fromAddr.toLowerCase() === fromAddress.toLowerCase() && !itm.selectedToken)
    }
  }) || null
}

export const removeDuplicateObjectByKey = (arr, key) => {
  const unique = arr
    .map(e => e[key].toString())

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e])

  return unique
}

export const filterMainAccount = (arrCardData) => {
  return arrCardData.find(card => card.isMain)
}

export const formatFloorNumber = (strNumber, decimals) => {
  let strNumberDot = strNumber.toString().replace(',', '')
  console.log('strNumberDot: ', strNumberDot)
  let arrNum = strNumberDot.toString().split('.')
  if (arrNum[1]) {
    arrNum[1] = arrNum[1].substring(0, decimals)
    strNumberDot = arrNum.join('.')
  }
  return strNumberDot
}

export const getRootUrl = (fullUrl) => {
  const url = window.require('url')
  return url.parse(fullUrl).protocol + '//' + url.parse(fullUrl).host
}

export const triggerSendEventToAllWindow = (message, data) => {
  // get all windows
  let allWindows = remote.BrowserWindow.getAllWindows()
  if (allWindows.length > 0) {
    allWindows.map(w => {
      // send message includes data for each window
      w.webContents.send(message, data)
    })
  }
}

export const copyText = (data) => {
  let textField = document.createElement('textarea')
  textField.innerText = data
  document.body.appendChild(textField)
  textField.select()
  document.execCommand('copy')
  textField.remove()
}

export const checkKanjiCharacter = (message) => {
  const newMess = splitter.splitGraphemes(message)
  let countLength = 0
  newMess.map(item => {
    const REGEX_JAPANESE = /[\u3000-\u303f]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uff00-\uff9f]|[\u4e00-\u9faf]|[\u3400-\u4dbf]/
    const isJapanese = REGEX_JAPANESE.test(item)

    const REGEX_CHINESE = /\s*(?:\uD805\uDC4D|\uD836\uDE87|[\u002C\u02BB\u060C\u2E32\u2E34\u2E41\u2E49\u3001\uFE10\uFE11\uFE50\uFE51\uFF0C\uFF64\u00B7\u055D\u07F8\u1363\u1802\u1808\uA4FE\uA60D\uA6F5\u02BD\u0312\u0313\u0314\u0315\u0326\u201A])\s*/
    const isChinese = REGEX_CHINESE.test(item)

    const REGEX_KOREAN = /[\u3131-\uD79D]/
    const isKorean = REGEX_KOREAN.test(item)
    countLength = countLength + ((isJapanese || isChinese || isKorean) ? 2 : 1)
  })

  return countLength
}

export const checkIsOnSell = (owner, price) => {
  if (price && owner && owner.length > 0) {
    return owner.toLowerCase() === price[0].toLowerCase() && price[1] > 0
  } else {
    return false
  }
}

export const sumValueByKey = (arr, column) => {
  return arr.reduce(function (a, b) {
    return a + Number(b[column])
  }, 0)
}

export const sumValueInObject = (obj) => {
  return Object.keys(obj).reduce((sum, key) => sum + parseFloat(obj[key] || 0), 0)
}

export const findIndexWithAttr = (array, attr, value) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (array[i][j][attr] === value) {
        return i
      }
    }
  }
  return -1
}

export const removeItemWithAttr = (array, attr, value) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (array[i][j][attr] === value) {
        if (array[i].length - 1 <= 0) {
          delete array[i]
        } else {
          array[i].splice(j, 1)
        }
        break
      }
    }
  } 
  return Object.values(array)
}

export const updateArrayWithAttr = (array, attr, value, data) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (array[i][j][attr] === value) {
        if (Number(data.remainBalance) > 0) {
          array[i][j] = data
        } else {
          if (array[i].length - 1 <= 0) {
            delete array[i]
          } else {
            array[i].splice(j, 1)
          }
        }
        break
      }
    }
  } 
  return Object.values(array)
}

export const saveTransactionEther = async (account, txReceipt) => {
  try {
    const gasLimit = Settings.gas.externalFee
    if (!txReceipt.timeStamp) {
      txReceipt.timeStamp = Math.floor(Date.now() / 1000)
    }
    if (!txReceipt.gas) {
      txReceipt.gas = gasLimit
    }
    if (txReceipt.transactionHash) {
      txReceipt.hash = txReceipt.transactionHash
    }
    if (txReceipt.status) {
      txReceipt.txreceipt_status = txReceipt.status
    }
    DexAPI.saveTransactionEther(txReceipt, account.address)
  } catch (error) {
    console.log('saveTransactionEther', error)
    return null
  }
}

export const saveTransactionToken = async (account, txReceipt) => {
  try {
    const gasLimit = Settings.gas.externalFeeToken
    if (!txReceipt.timeStamp) {
      txReceipt.timeStamp = Math.floor(Date.now() / 1000)
    }
    if (!txReceipt.gas) {
      txReceipt.gas = gasLimit
    }
    if (txReceipt.transactionHash) {
      txReceipt.hash = txReceipt.transactionHash
    }
    if (txReceipt.status) {
      txReceipt.txreceipt_status = txReceipt.status
    }
    if (txReceipt.token.decimals) {
      txReceipt.tokenDecimal = txReceipt.token.decimals.toString()
    }
    if (txReceipt.token.name) {
      txReceipt.tokenName = txReceipt.token.name
    }
    if (txReceipt.token.symbol) {
      txReceipt.tokenSymbol = txReceipt.token.symbol
    }
    DexAPI.saveTransactionToken(txReceipt, account.address)
  } catch (error) {
    console.log('', error)
  }
}

export const closeTabBrower = () => {
  let allWindows = remote.BrowserWindow.getAllWindows()
  if (allWindows.length > 0) {
    allWindows = allWindows.filter(w => w.id !== 1) // remove main window
    allWindows.map(w => {
      w.destroy()
    })
  }
}

export const openBrowserInNewTab = (newLink, data = null) => {
  triggerSendEventToAllWindow('open-browser-in-new-tab', {
    newLink,
    data
  })
}

export const openBrowserInSameTab = (newLink, data = null) => {
  triggerSendEventToAllWindow('open-browser-in-same-tab', {
    newLink,
    data
  })
}

export const isObject = (value) => {
  return value && typeof value === 'object' && value.constructor === Object
}

export const randomIntFromInterval = (min, max) => { // min and max included 
  const rs = Math.floor(Math.random() * (max - min + 1) + min)
  return rs
}

export const logDebugChatwork = (screen, error) => {
  ChatworkAPI.postMessage(screen + ': ' + ((isObject(error) ? JSON.stringify(error, undefined, 2) : error)))
}

export const scientificToDecimal = (num) => {
  const sign = Math.sign(num)
  // if the number is in scientific notation remove it
  if (/\d+\.?\d*e[\+\-]*\d+/i.test(num)) {
    const zero = '0'
    const parts = String(num).toLowerCase().split('e') // split into coeff and exponent
    const e = parts.pop() // store the exponential part
    let l = Math.abs(e) // get the number of zeros
    const direction = e / l // use to determine the zeroes on the left or right
    const coeffArray = parts[0].split('.')

    if (direction === -1) {
      coeffArray[0] = Math.abs(coeffArray[0])
      num = zero + '.' + new Array(l).join(zero) + coeffArray.join('')
    } else {
      const dec = coeffArray[1]
      if (dec) l = l - dec.length
      num = coeffArray.join('') + new Array(l + 1).join(zero)
    }
  }

  if (sign < 0) {
    num = -num
  }

  return num
}

export const randomInfuraKey = () => {
  const keys = []
  for (let index = 0; index < 23; index++) {
    const infuraIndex = 'REACT_APP_INFURA_KEY_' + index
    keys.push(process.env[infuraIndex])
  }
  const key = keys[Math.floor(Math.random() * keys.length)]
  return key
}
