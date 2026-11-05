import EtherscanServices from 'Backend/Api/services/EtherScan'
import DexAPI from 'Backend/Api/services/DexAPI'
import Ethplorer from 'Backend/Api/services/Ethplorer'
import { checkTokenAddress, batchSendToken, getTokenBalanceOfUser } from 'Backend/Lib/Web3/index'
import OxObject from 'Backend/Lib/0x/index'
import { validateAddress, convertWeiToBalance, validateNumber, formatNumber, countDots, formatNumber1, formatFloorNumber, showNotification, filterMainAccount } from 'Utils/globalFunction'
import { setDexTokenList, setDexSelectedPair, setAdvancedWallet, setadvancedWalletHistory, setPendingTx } from 'Backend/Redux/actions/globalActions'
import { message } from 'antd'
import EtherLibrary from 'Backend/HBLibrary/EtherLibrary'
import swal from 'sweetalert2'
import { HBWALLET, OBSERVER_KEY } from 'Utils/globalConstants'
import Observer from 'Utils/HBObserver'
import { convertBalanceToWei } from '../../../../../Utils/globalFunction'

let THIS
const SIXTY_MINUTES = 3600000
let tryAgain = 1
let size = 10
let testAddress = HBWALLET
let testName = 'HBWALLET'

export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return async (dispatch) => {
    const { pendingTx, arrCardData } = THIS.props
    const mainAccountOfFilter = filterMainAccount(arrCardData)
    let listwalletAdvancedHistory = await DexAPI.walletAdvancedHistory(mainAccountOfFilter.address)
    console.log('just test for listwalletAdvancedHistory: ', listwalletAdvancedHistory)
    THIS.setState({
      walletAdvancedHistory: listwalletAdvancedHistory
    })
    if (pendingTx.isPending) {
      THIS.setState({
        isPendingTx: true
      })
    } else {
      THIS.setState({
        isPendingTx: false
      })
    }
  }
}

export const sendAll2 = () => {
  return async (dispatch, getState) => {
    const { arrCardData, t, pendingTx, advancedWalletHistory } = THIS.props
    const { txtContractAddr, arrOnlyAmount, arrOnlyAddress, transactionFee, balanceAndDecimalOfUser, fileCSVName, valueInputGas, gasLimitForArr } = THIS.state
    const mainAccountOfFilter = filterMainAccount(arrCardData)
    swal({
      width: '320px',
      text: t('ItMayTakeAFewMomentsToProcess'),
      type: 'info',
      showConfirmButton: false
    })
    let timeStamp = Date.now()
    let tokenAddress = txtContractAddr
    let account = mainAccountOfFilter.address
    let privateKey = mainAccountOfFilter.privateKey
    let arr = arrOnlyAddress
    // plz check decimal
    let powDecimal
    if (balanceAndDecimalOfUser.decimal) {
      powDecimal = Math.pow(10, balanceAndDecimalOfUser.decimal)
    } else {
      console.log('cant get balanceAndDecimalOfUser.decimal')
      return
    }
    let arrAmountWithDecimal = arrOnlyAmount.map(i => i * powDecimal)
    let numOfAmount = 0
    arrOnlyAmount.map(i => (numOfAmount = numOfAmount + Number(i)))
    let address = []
    let amount = []
    let amountOfEther = mainAccountOfFilter.balance
    // check for fail
    // let approveAmount = numOfAmount * powDecimal * 1.1
    let approveAmount = numOfAmount * 2
    // let approveAmount = 0
    
    let offset = Math.floor(arrOnlyAddress.length / size)
    if (offset === Number(arrOnlyAddress.length / size)) {
      offset = offset - 1
    }
    console.log('offset1234: ', offset)
    // console.log('amountOfEther: ', amountOfEther)
    // console.log('transactionFee: ', transactionFee)
    console.log('numOfAmount: ', numOfAmount)
    console.log('balanceAndDecimalOfUser: ', balanceAndDecimalOfUser)
    // console.log('balanceAndDecimalOfUser--balance: ', Number(balanceAndDecimalOfUser.balance))
    let balanceOfUser = Number(balanceAndDecimalOfUser.balance) / powDecimal
    console.log('balanceOfUser: ', balanceOfUser)
    let gasLimit1 = OxObject.getGasLimit()
    if ((transactionFee / gasLimit1 * gasLimitForArr * (offset + 1)) > amountOfEther) {
      swal({
        width: '320px',
        text: t('AdvancedWallet.youDontHaveETH'),
        type: 'error',
        showConfirmButton: false
      })
    } else if (numOfAmount > balanceOfUser) {
      swal({
        width: '320px',
        text: t('AdvancedWallet.youDontHaveTOKEN'),
        type: 'error',
        showConfirmButton: false
      })
    } else {
      for (let i = 0; i < arr.length; i += size) {
        address.push(arr.slice(i, i + size))
        amount.push(arrAmountWithDecimal.slice(i, i + size))
      }
      // console.log('tokenAddress: ', tokenAddress)
      console.log('account: ', account)
      // console.log('privateKey: ', privateKey)
      // console.log('address: ', address)
      // console.log('amount: ', amount)
      let tokenName = balanceAndDecimalOfUser.tokenName
      let tokenSymbol = balanceAndDecimalOfUser.tokenSymbol
      const privateKeyHex = new Buffer(privateKey, 'hex')
      let valueGwei = Number(valueInputGas)
      let isSending = true
      let totalAddress = arrOnlyAddress.length
      let advancedWallet = {address, amount, tokenAddress, privateKeyHex, account, offset, approveAmount, tryAgain, timeStamp, valueGwei, isSending, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, tokenName, tokenSymbol}
      console.log('just test for timeStamp: ', timeStamp)
      await dispatch(setAdvancedWallet(advancedWallet))
      // check valied address from CSV file
      // check user's balance token >= Sum(amount)
      // check eth balance
      // 

      Observer.emit(OBSERVER_KEY.LOOP_TRANSFER_AND_APPROVE)
      if (pendingTx.isPending) {
        THIS.setState({
          isPendingTx: true
        })
      } else {
        THIS.setState({
          isPendingTx: false
        })
      }
      let walletAdvancedHistory = await DexAPI.walletAdvancedHistory(account)
      console.log('just test for walletAdvancedHistory: ', walletAdvancedHistory)
      let objectFailAddress2 = []
      let objectFailAmount2 = []
      let arrFailAddress2 = []
      let arrFailAmount2 = []
      const saveInAdvancedWalletHistory = async (txs) => {
        let arrSuccess = []
        let arrSuccessAddress = []
        let arrSuccessAmount = []
        let arrFail = []
        let arrFailAddress = []
        let arrFailAmount = []
        console.log('just test for txs: ', JSON.stringify(txs, undefined, 2))
        // Create redux for advanced wallet history
        if (txs && txs.data) {
          if (THIS.props.advancedWallet.tryAgain === 2) {
            for (let i = 0; i < objectFailAddress2.length; i++) {
              arrFailAddress2 = arrFailAddress2.concat(objectFailAddress2[i])
              arrFailAmount2 = arrFailAmount2.concat(objectFailAmount2[i])
            }
            console.log('just test for arrFailAddress2: ', arrFailAddress2)
            console.log('just test for arrFailAmount2: ', arrFailAmount2)
            for (let i = 0; i < txs.data.length; i++) {
              if (txs && txs.data[i] && txs.data[i].tx && txs.data[i].tx.status) {
                arrSuccessAddress.push(arrFailAddress2.slice(i * size, i * size + size))
                arrSuccessAmount.push(arrFailAmount2.slice(i * size, i * size + size))
              } else {
                arrFailAddress.push(arrFailAddress2.slice(i * size, i * size + size))
                arrFailAmount.push(arrFailAmount2.slice(i * size, i * size + size))
              }
            }
          } else {
            for (let i = 0; i < txs.data.length; i++) {
              if (txs && txs.data[i] && txs.data[i].tx && txs.data[i].tx.status) {
                arrSuccessAddress.push(arrOnlyAddress.slice(i * size, i * size + size))
                arrSuccessAmount.push(arrOnlyAmount.slice(i * size, i * size + size))
              } else {
                arrFailAddress.push(arrOnlyAddress.slice(i * size, i * size + size))
                arrFailAmount.push(arrOnlyAmount.slice(i * size, i * size + size))
              }
            }
            objectFailAddress2 = arrFailAddress
            objectFailAmount2 = arrFailAmount
          }
        }
        let lineSuccess = {arrSuccessAddress, arrSuccessAmount}
        let lineFail = {arrFailAddress, arrFailAmount}
        arrSuccess.push(lineSuccess)
        arrFail.push(lineFail)
        console.log('just test for arrFail: ', arrFail)
        console.log('just test for arrSuccess: ', arrSuccess)
        // check again
        let numberOfSuccess = []
        let numberOfSuccessAmounts = []
        if (arrSuccessAddress && arrSuccessAddress.length) {
          for (let i = 0; i < arrSuccessAddress.length; i++) {
            numberOfSuccess = numberOfSuccess.concat(arrSuccessAddress[i])
            numberOfSuccessAmounts = numberOfSuccessAmounts.concat(arrSuccessAmount[i])
          }
        }
        let numberOfFail = []
        let numberOfFailAmounts = []
        if (arrFailAddress && arrFailAddress.length) {
          for (let i = 0; i < arrFailAddress.length; i++) {
            numberOfFail = numberOfFail.concat(arrFailAddress[i])
            numberOfFailAmounts = numberOfFailAmounts.concat(arrFailAmount[i])
          }
        }
        console.log('just test for numberOfSuccess: ', arrSuccessAddress)
        console.log('just test for numberOfSuccess1: ', arrOnlyAddress)
        console.log('just test for numberOfSuccess2: ', numberOfSuccess)
        console.log('just test for numberOfFail: ', numberOfFail)
        let feeETH = 0
        if (txs && txs.data && txs.data.length > 0) {
          for (let i = 0; i < txs.data.length; i++) {
            if (txs.data[i].tx) {
              feeETH = feeETH + txs.data[i].tx.gasUsed
            }
          }
        }
        // 0.0000000104 Ether (10.4 Gwei)
        feeETH = feeETH * convertWeiToBalance(valueInputGas, 9)
        console.log('just test for feeETH: ', feeETH)
        console.log('just test for timeStamp1: ', timeStamp)
        let reason = 'Please check address again!'
        let firstTry = true
        if (THIS.props.advancedWallet.tryAgain === 2) {
          firstTry = false
        }
        if (numberOfSuccess.length > 0) {
          let walletAdvancedSuccessResponse = await DexAPI.walletAdvancedSuccess(account, feeETH, timeStamp, firstTry, numberOfSuccess, numberOfSuccessAmounts)
          console.log('walletAdvancedSuccessResponse: ', walletAdvancedSuccessResponse)
        }
        if (numberOfFail.length > 0) {
          if (THIS.props.advancedWallet.tryAgain === 2) {
            for (let i = 0; i < arrFailAddress.length; i++) {
              let k = 0
              if (txs && txs.data) {
                for (let j = 0; j < txs.data.length; j++) {
                  if (txs.error) {
                    if (k === i) {
                      reason = txs.error
                    }
                    k++
                  }
                }
              }
              numberOfFail = arrFailAddress[i]
              numberOfFailAmounts = arrFailAmount[i]
              let walletAdvancedFailResponse = await DexAPI.walletAdvancedFail(account, feeETH, timeStamp, reason, numberOfFail, numberOfFailAmounts)
              console.log('walletAdvancedFailResponse: ', walletAdvancedFailResponse)
            }
          } else {
            let walletAdvancedFailResponse = await DexAPI.walletAdvancedFail(account, feeETH, timeStamp, reason, numberOfFail, numberOfFailAmounts)
            console.log('walletAdvancedFailResponse: ', walletAdvancedFailResponse)
          }
        }
        // let listAdvancedWalletHistory = advancedWalletHistory
        // let itemHistory = {timeStamp, tokenName, tokenSymbol, fileCSVName, numberOfSuccess, numOfAmount, feeETH, arrFail, arrSuccess}
        // listAdvancedWalletHistory.push(itemHistory)
        // await dispatch(setadvancedWalletHistory(listAdvancedWalletHistory))
        console.log('just test for numberOfFail4: ', numberOfFail)
        console.log('just test for advancedWallet.tryAgain4: ', THIS.props.advancedWallet)
        // resend second time
        // if (numberOfFail.length > 0 && THIS.props.advancedWallet.tryAgain === 1) {
        //   console.log('just test for timeStamp2: ', timeStamp)
        //   advancedWallet.offset = Math.floor(arrFailAddress.length / size)
        //   advancedWallet.tryAgain = 2
        //   advancedWallet.isSending = true
        //   advancedWallet.address = arrFailAddress
        //   advancedWallet.amount = arrFailAmount
        //   await dispatch(setAdvancedWallet(advancedWallet))
        //   Observer.emit(OBSERVER_KEY.LOOP_TRANSFER_AND_APPROVE)
        // }
        showNotiWhenAllDone()
        console.log('just test for timeStamp4: ', timeStamp)
      }
      Observer.on(OBSERVER_KEY.SAVE_IN_ADVANCED_WALLET_HISTORY, saveInAdvancedWalletHistory)
      const showNotiWhenAllDone = () => {
        // specify notice message
        let notice = 'Sending ' + balanceAndDecimalOfUser.tokenName + ' by Advanced Wallet was completed.'
        // show notification to notice user
        showNotification(notice, t)
      }
      // let txs = await batchSendToken(address, amount, tokenAddress, privateKeyHex, account, offset, approveAmount)
      // (address, amount, tokenAddress, privateKeyHex, account, offset, approveAmount)
      // console.log('txsSendAll: ', txs)
      // getTokenBalanceOfUser(tokenAddress, account)
      // rootTreansfer(address, amount, tokenAddress, privateKeyHex, account)
    }
  }
}

export const sendAll = () => {
  return async (dispatch, getState) => {
    const { arrCardData, t, pendingTx, advancedWalletHistory } = THIS.props
    const { txtContractAddr, arrOnlyAmount, arrOnlyAddress, transactionFee, balanceAndDecimalOfUser, fileCSVName, valueInputGas, gasLimitForArr } = THIS.state
    const mainAccountOfFilter = filterMainAccount(arrCardData)
    swal({
      width: '320px',
      text: t('ItMayTakeAFewMomentsToProcess'),
      type: 'info',
      showConfirmButton: false
    })
    let timeStamp = Date.now()
    let tokenAddress = txtContractAddr
    let account = mainAccountOfFilter.address
    let privateKey = mainAccountOfFilter.privateKey
    let arr = arrOnlyAddress
    // plz check decimal
    let powDecimal
    if (balanceAndDecimalOfUser.decimal) {
      powDecimal = Math.pow(10, balanceAndDecimalOfUser.decimal)
    } else {
      console.log('cant get balanceAndDecimalOfUser.decimal')
      return
    }
    let arrAmountWithDecimal = arrOnlyAmount.map(i => i * powDecimal)
    let numOfAmount = 0
    arrOnlyAmount.map(i => (numOfAmount = numOfAmount + Number(i)))
    let address = []
    let amount = []
    let amountOfEther = mainAccountOfFilter.balance
    // check for fail
    // let approveAmount = numOfAmount * powDecimal * 1.1
    let approveAmount = numOfAmount
    // let approveAmount = 0
    
    let offset = Math.floor(arrOnlyAddress.length / size)
    if (offset === Number(arrOnlyAddress.length / size)) {
      offset = offset - 1
    }
    console.log('offset1234: ', offset)
    // console.log('amountOfEther: ', amountOfEther)
    // console.log('transactionFee: ', transactionFee)
    console.log('numOfAmount: ', numOfAmount)
    console.log('balanceAndDecimalOfUser: ', balanceAndDecimalOfUser)
    // console.log('balanceAndDecimalOfUser--balance: ', Number(balanceAndDecimalOfUser.balance))
    let balanceOfUser = Number(balanceAndDecimalOfUser.balance) / powDecimal
    console.log('balanceOfUser: ', balanceOfUser)
    let gasLimit1 = OxObject.getGasLimit()
    if ((transactionFee / gasLimit1 * gasLimitForArr * (offset + 1)) > amountOfEther) {
      swal({
        width: '320px',
        text: t('AdvancedWallet.youDontHaveETH'),
        type: 'error',
        showConfirmButton: false
      })
    } else if (numOfAmount > balanceOfUser) {
      swal({
        width: '320px',
        text: t('AdvancedWallet.youDontHaveTOKEN'),
        type: 'error',
        showConfirmButton: false
      })
    } else {
      for (let i = 0; i < arr.length; i += size) {
        address.push(arr.slice(i, i + size))
        amount.push(arrAmountWithDecimal.slice(i, i + size))
      }
      // console.log('tokenAddress: ', tokenAddress)
      console.log('account: ', account)
      // console.log('privateKey: ', privateKey)
      // console.log('address: ', address)
      // console.log('amount: ', amount)
      let tokenName = balanceAndDecimalOfUser.tokenName
      let tokenSymbol = balanceAndDecimalOfUser.tokenSymbol
      const privateKeyHex = new Buffer(privateKey, 'hex')
      let valueGwei = Number(valueInputGas)
      let isSending = true
      let totalAddress = arrOnlyAddress.length
      let advancedWallet = {address, amount, tokenAddress, privateKeyHex, account, offset, approveAmount, tryAgain, timeStamp, valueGwei, isSending, gasLimitForArr, numOfAmount, totalAddress, fileCSVName, tokenName, tokenSymbol}
      console.log('just test for timeStamp: ', timeStamp)
      await dispatch(setAdvancedWallet(advancedWallet))
      // check valied address from CSV file
      // check user's balance token >= Sum(amount)
      // check eth balance
      // 

      Observer.emit(OBSERVER_KEY.LOOP_TRANSFER_AND_APPROVE)
      if (pendingTx.isPending) {
        THIS.setState({
          isPendingTx: true
        })
      } else {
        THIS.setState({
          isPendingTx: false
        })
      }
      let walletAdvancedHistory = await DexAPI.walletAdvancedHistory(account)
      console.log('just test for walletAdvancedHistory: ', walletAdvancedHistory)

      const saveInAdvancedWalletHistory = async (txs) => {
        console.log('just test for txs: ', txs)
        // Create redux for advanced wallet history
        for (let i = 0; i < txs.data.length; i++) {
          const record = txs.data[i] // {status : 'success || fail', data : success data || fail data}
          console.log('record from singleTranfer :', record)

          if (record.status === 'success') { // if success
            let walletAdvancedSuccessResponse = await DexAPI.walletAdvancedSuccess(account, record.tx.gasUsed, timeStamp, true, record.tx.arrAddress, record.tx.arrAmount)
            console.log('walletAdvancedSuccessResponse_success :', walletAdvancedSuccessResponse)
          } else if (record.status === 'fail') { // if failed 
            let failedTxResponse = await DexAPI.walletAdvancedFail(account, record.tx.gasUsed, timeStamp, record.tx.reason, record.tx.arrAddress, record.tx.arrAmount)
            console.log('failedTxResponse :', failedTxResponse)
          } else { // cant send to server
            console.log('failedTxResponse_later :')
          }
        }
        showNotiWhenAllDone()
        console.log('just test for timeStamp4: ', timeStamp)
      }
      Observer.on(OBSERVER_KEY.SAVE_IN_ADVANCED_WALLET_HISTORY, saveInAdvancedWalletHistory)
      const showNotiWhenAllDone = () => {
        // specify notice message
        let notice = 'Sending ' + balanceAndDecimalOfUser.tokenName + ' by Advanced Wallet was completed.'
        // show notification to notice user
        showNotification(notice, t)
      }
      // let txs = await batchSendToken(address, amount, tokenAddress, privateKeyHex, account, offset, approveAmount)
      // (address, amount, tokenAddress, privateKeyHex, account, offset, approveAmount)
      // console.log('txsSendAll: ', txs)
      // getTokenBalanceOfUser(tokenAddress, account)
      // rootTreansfer(address, amount, tokenAddress, privateKeyHex, account)
    }
  }
}
export const downloadSuccess = () => {
  return async (dispatch, getState) => {
    const { arrSuccess } = THIS.state
    console.log('arrSuccess123: ', arrSuccess)
    if (arrSuccess.length > 0) {
      let arrSuccessJSON = JSON.stringify(arrSuccess)
      let csv = ConvertToCSV(arrSuccessJSON)
      console.log('arrSuccess1232222: ', csv)
      if (csv == null) return
      let filename = 'successFile.csv'
      if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv
      }
      let data = encodeURI(csv)
      let link = document.createElement('a')
      link.setAttribute('href', data)
      link.setAttribute('download', filename)
      link.click()
    }
  }
}

export const downloadFail = () => {
  return async (dispatch, getState) => {
    const { arrFail } = THIS.state
    console.log('arrFail123: ', arrFail)
    if (arrFail.length > 0) {
      let arrFailJSON = JSON.stringify(arrFail)
      let csv = ConvertToCSV(arrFailJSON)
      console.log('arrFail1232222: ', csv)
      if (csv == null) return
      let filename = 'failFile.csv'
      if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv
      }
      let data = encodeURI(csv)
      let link = document.createElement('a')
      link.setAttribute('href', data)
      link.setAttribute('download', filename)
      link.click()
    }
  }
}

function ConvertToCSV (objArray) {
  let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
  let str = 'ADDRESS,TOKEN AMOUNT' + '\r\n'
  for (let i = 0; i < array.length; i++) {
    let line = ''
    for (let index in array[i]) {
      if (line !== '') line += ','
      line += array[i][index]
    }
    str += line + '\r\n'
  }
  return str
}

export const checkPendingTx = (result) => {
  return async (dispatch, getState) => {
    const { pendingTx } = THIS.props
    await OxObject.awaitTransactionMinedAsync(result)
    pendingTx.isPending = false
    dispatch(setPendingTx(pendingTx))
    console.log('pendingTx123: ', pendingTx)
  }
}

export const loadingHBWIT = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData, etherPrice } = THIS.props
    const { amountToken, checkBalance, wattingBalance } = THIS.state
    const mainAccountOfFilter = filterMainAccount(arrCardData)
    if (internetData) {
      // get exchange data
      let amountAdvancedWallet = await DexAPI.getAmountAdvancedWallet()
      let token = await DexAPI.getTokenDataWithChart(testAddress)
      console.log('token123: ', token)
      THIS.setState({
        amountAdvancedWallet: amountAdvancedWallet.value.hold_usd_amount
        // tokenDecimal: token.data.token.decimals
      })
      let amountToken1 = 0
      if (token && token.data) {
        console.log('token124: ', token)
        if (token.data.lastPrice.price) {
          amountToken1 = Number(amountAdvancedWallet.value.hold_usd_amount) / (Math.abs(token.data.lastPrice.price) * Number(etherPrice.price_usd))
        } else {
          amountToken1 = Number(amountAdvancedWallet.value.hold_usd_amount)
        }
        amountToken1 = formatFloorNumber(amountToken1, token.data.token.decimals)
        THIS.setState({
          amountToken: amountToken1
        })
      }
      let exchangeData = await DexAPI.getAllVolumeExchange()
      if (exchangeData && exchangeData.length > 0) {
        exchangeData.map(e => {
          e.lastPriceBalanceGWei = e.lastPrice.price
          e.highestPrice24hBalanceGWei = e.highestPrice24h.price
          e.lowestPrice24hBalanceGWei = e.lowestPrice24h.price
          e.volume24hBalanceGWei = e.day.volume
          e.volumeBalanceGWei = e.day.volume
          e.volumeTotalBalanceGWei = e.all.volume
          e.change = e.day.change
          e.noOfTx = e.day.noOfTx
        })
        await dispatch(setDexTokenList(exchangeData))
        console.log('exchangeData: ', exchangeData)
        let HBWIT = exchangeData.filter(i => i.token.symbol.includes(testName))
        if (HBWIT[0]) {
          await dispatch(setDexSelectedPair(HBWIT[0]))
          const balance1 = await EtherLibrary.getTokenBalance(HBWIT[0].token.address, mainAccountOfFilter.address, HBWIT[0].token.decimals)
          console.log('amountToken1: ', amountToken1)
          console.log('balance1: ', balance1)
          console.log('HBWIT: ', HBWIT[0])
          if (balance1 < amountToken1) {
            THIS.setState({
              // must be true
              checkBalance: false
            })
          }
        } else {
          THIS.setState({
            // must be true
            checkBalance: false
          })
        }
        console.log('HBWIT: ', HBWIT[0])
        THIS.setState({
          wattingBalance: false
        })
      }
    }
  }
}

export const clickToHBWIT = (item) => {
  return async (dispatch, getState) => {
    const { userAuth } = THIS.props
    await THIS.props.loadingHBWIT()
    console.log('you are in clickToHBWIT: ')
    if (!userAuth.isConfirmDex) {
      Observer.emit(OBSERVER_KEY.SELECT_TAB_EXCHANGE)
    } else {
      Observer.emit(OBSERVER_KEY.SELECT_TAB_EXCHANGE_SCREEN)
    }
    // THIS.setState({
    //   toExchangeScreen: true
    // })
  }
}

const validContractABI = async (values) => {
  console.log('validContractABI1: ')
  let contractNotVerified = false
  let notSupportToken = false
  let isAddressErr = false
  let response = await EtherscanServices.getABI(values.toLowerCase())
  console.log('validContractABI2: ')
  if (response.message === 'NOTOK') {
    console.log('validContractABI3: ')
    contractNotVerified = true
    isAddressErr = true
  }
  if (response.message === 'OK') {
    console.log('validContractABI4: ')
    let tokenABI = JSON.parse(response.result)
    let index = tokenABI.findIndex(i => i.type === 'function' && i.name === 'transferFrom')
    if (index === -1) {
      console.log('validContractABI5: ')
      notSupportToken = true
      isAddressErr = true
    }
  }
  THIS.setState({
    contractNotVerified,
    notSupportToken,
    isAddressErr
  }, () => {
    console.log('contractNotVerified123: ', contractNotVerified)
    console.log('notSupportToken123: ', notSupportToken)
    checkOpenSave()
  })
  
}

export const onChangeAddress = (txtNewAddr) => {
  return async (dispatch, getState) => {
    const { arrFilterTokenData } = THIS
    const { arrHBTokens } = THIS.props
    const { isDisableInformation, txtContractAddr, isAddressErr } = THIS.state
    console.log('arrFilterTokenData: ', arrFilterTokenData)
    // const { objTokenData } = THIS.props
    // Check valid format address ethereum
    THIS.setState({
      isAddressErr: false,
      isDisableSave: true,
      isAlreadyCreate: false,
      isDisableInformation: false,
      isCustomToken: true,
      isNotContractAddr: false,
      contractNotVerified: false,
      notSupportToken: false,
      txtContractAddr: txtNewAddr,
      txtTokenName: '',
      txtTokenSymbol: '',
      txtTokenUrl: '',
      txtTokenId: '',
      txtImgUrl: '',
      txtDecimal: ''
    }, async () => {
      if (!validateAddress(txtNewAddr)) {
        // Clear data and error when no input
        console.log('you are in validateAddress')
        if (txtNewAddr.length === 0) {
          if (isDisableInformation) {
            THIS.setState({
              isAddressErr: false,
              isDisableSave: true,
              isAlreadyCreate: false,
              isDisableInformation: false,
              isCustomToken: true,
              isNotContractAddr: false,
              txtContractAddr: '',
              txtTokenName: '',
              txtTokenSymbol: '',
              txtTokenUrl: '',
              txtTokenId: '',
              txtImgUrl: '',
              txtDecimal: ''
            })
          } else {
            THIS.setState({
              // isDisableSave: true,
              isAlreadyCreate: false,
              isDisableInformation: false,
              isAddressErr: false,
              isCustomToken: true,
              isNotContractAddr: false,
              txtContractAddr: '',
              txtTokenId: ''
            })
          }
        } else {
          THIS.setState({ txtContractAddr, isAddressErr: true })
        }
      } else {
        if ((txtNewAddr.startsWith('0x') && txtNewAddr.length === 42)) {
          THIS.setState({ isLoadingTokenInfo: true })
          let code = await EtherscanServices.getCode(txtNewAddr)

          if (code !== '0x') {
            // if (objTokenData && (objTokenData.address === txtNewAddr)) {
            //   setChoosenItem()
            // } else {
            let objExistHbToken, objExistTokenData

            // Check exist token data
            arrHBTokens.map(item => {
              if (item.tokenAddress.toLowerCase() === txtNewAddr) objExistHbToken = item
            })
            arrFilterTokenData && arrFilterTokenData.map(item => {
              if (item.address.toLowerCase() === txtNewAddr) objExistTokenData = item
            })
            if (objExistTokenData) {
              THIS.setState({
                isNameErr: false,
                isAddressErr: false,
                isLoadingTokenInfo: false,
                isAlreadyCreate: true,
                isCustomToken: false,
                isNotContractAddr: false,
                isDisableInformation: true,
                isDisableSave: true,
                txtContractAddr: txtNewAddr,
                txtTokenName: objExistTokenData.name,
                txtTokenSymbol: objExistTokenData.symbol,
                txtTokenUrl: objExistTokenData.url,
                txtTokenId: objExistTokenData.tokenId,
                txtImgUrl: objExistTokenData.cardImage,
                txtDecimal: objExistTokenData.decimal
              })
            } else if (objExistHbToken) {
              console.log('update image: ', objExistHbToken.cardImage)
              THIS.setState({
                isNameErr: false,
                isAddressErr: false,
                isNotContractAddr: false,
                isAlreadyCreate: false,
                isLoadingTokenInfo: false,
                isCustomToken: false,
                isDisableSave: false,
                isDisableInformation: true,
                txtContractAddr: txtNewAddr,
                txtTokenName: objExistHbToken.name,
                txtTokenSymbol: objExistHbToken.symbol,
                txtTokenUrl: objExistHbToken.url,
                txtTokenId: objExistHbToken.id,
                txtImgUrl: objExistHbToken.cardImage,
                txtDecimal: objExistHbToken.decimal}, () => {
                // THIS.slDecimal.snapToItem(parseInt(objExistHbToken.decimal))
                validContractABI(txtNewAddr)
              })
            } else {
              let data = await Ethplorer.getTokenInfo(txtNewAddr)
              console.log('getTokenInfo: ', data)
              if (data && !data.error) {
                if (data.name.length > 0 && data.symbol.length > 0) {
                  THIS.setState({
                    txtContractAddr: txtNewAddr,
                    txtTokenId: '',
                    txtTokenName: data.name,
                    txtTokenSymbol: data.symbol,
                    isLoadingTokenInfo: false,
                    isAddressErr: false,
                    isNotContractAddr: false,
                    isDisableInformation: true, // disable when app can get token name and symbol from server
                    isCustomToken: true,
                    isAlreadyCreate: false,
                    txtDecimal: data.decimals.toString()}, () => {
                    // THIS.slDecimal.snapToItem(data.decimals)
                    validContractABI(txtNewAddr)
                  })
                } else {
                  THIS.setState({ txtContractAddr: txtNewAddr,
                    isAddressErr: false,
                    txtTokenId: '',
                    isAlreadyCreate: false,
                    isDisableInformation: false,
                    isLoadingTokenInfo: false,
                    isNotContractAddr: false,
                    isCustomToken: true }, () => {
                    validContractABI(txtNewAddr)
                  })
                }
              } else {
                THIS.setState({
                  txtContractAddr: txtNewAddr,
                  isAddressErr: false,
                  txtTokenId: '',
                  isLoadingTokenInfo: false,
                  isNotContractAddr: false,
                  isAlreadyCreate: false,
                  isDisableInformation: false,
                  isCustomToken: true }, () => {
                  validContractABI(txtNewAddr)
                })
              }
            }
            // }
          } else {
          // Final checking is contract address or not
            THIS.setState({
              txtTokenId: '',
              isDisableSave: true,
              isCustomToken: true,
              isAlreadyCreate: false,
              isDisableInformation: false,
              isLoadingTokenInfo: false,
              isNotContractAddr: true,
              txtContractAddr: txtNewAddr,
              isAddressErr: true
            })
          }
        } else {
          if (isDisableInformation) {
            THIS.setState({
              isAddressErr: true,
              isDisableSave: true,
              isAlreadyCreate: false,
              isCustomToken: true,
              isNotContractAddr: false,
              isDisableInformation: false,
              txtContractAddr: txtNewAddr,
              txtTokenName: '',
              txtTokenSymbol: '',
              txtTokenUrl: '',
              txtTokenId: '',
              txtImgUrl: '',
              txtDecimal: ''
            })
          } else {
          // Final fail checking
            THIS.setState({
              txtTokenId: '',
              isDisableSave: true,
              isCustomToken: true,
              isDisableInformation: false,
              isAlreadyCreate: false,
              txtContractAddr: txtNewAddr,
              isAddressErr: true,
              isNotContractAddr: false
            })
          }
        }
      }
    })
  }
}

export const onCheckAddress = (value) => {
  return (dispatch, getState) => {
    handleValidateAddr(value)
  }
}

const handleValidateAddr = (txtNewAddr) => {
  if (checkTokenAddress(txtNewAddr)) {
    checkOpenSending()
  } else {
    THIS.setState({
      failAboutAddress: true
    })
  }
}

const handleValidateAddrOLD = (newAddress) => {
  // Check valid format address ethereum
  if (!validateAddress(newAddress)) {
    THIS.setState({
      failAboutAddress: true
    })
  } else {
    if ((newAddress.startsWith('0x') && newAddress.length === 42)) {
      // Final success checking
      checkOpenSending()
    } else {
      // Final fail checking
      THIS.setState({
        failAboutAddress: true
      })
    }
  }
}

export const onCheckAddress1 = (txtNewAddr) => {
  return async (dispatch, getState) => {
    const { arrFilterTokenData } = THIS
    const { arrHBTokens } = THIS.props
    const { failAboutAddress } = THIS.state
    if (!validateAddress(txtNewAddr)) {
      THIS.setState({
        failAboutAddress: true
      })
      console.log('checkAddress-in validateAddress')
    } else {
      console.log('checkAddress-pass !validateAddress')
      if ((txtNewAddr.startsWith('0x') && txtNewAddr.length === 42)) {
        let code = await EtherscanServices.getCode(txtNewAddr)

        if (code !== '0x') {
          let objExistHbToken, objExistTokenData

          // Check exist token data
          arrHBTokens.map(item => {
            if (item.tokenAddress.toLowerCase() === txtNewAddr) objExistHbToken = item
          })
          arrFilterTokenData && arrFilterTokenData.map(item => {
            if (item.address.toLowerCase() === txtNewAddr) objExistTokenData = item
          })
          if (objExistTokenData) {
            THIS.setState({
              failAboutAddress: true
            })
          } else if (objExistHbToken) {
            console.log('update image: ', objExistHbToken.cardImage)
            THIS.setState({
              failAboutAddress: txtNewAddr}, () => {
              // THIS.slDecimal.snapToItem(parseInt(objExistHbToken.decimal))
              checkOpenSave()
            })
          } else {
            let data = await Ethplorer.getTokenInfo(txtNewAddr)
            console.log(data)
            if (data && !data.error) {
              if (data.name.length > 0 && data.symbol.length > 0) {
                THIS.setState({
                  failAboutAddress: txtNewAddr}, () => {
                  // THIS.slDecimal.snapToItem(data.decimals)
                  checkOpenSave()
                })
              } else {
                THIS.setState({ failAboutAddress: txtNewAddr }, () => {
                  checkOpenSave()
                })
              }
            } else {
              THIS.setState({
                failAboutAddress: txtNewAddr }, () => {
                checkOpenSave()
              })
            }
          }
          // }
        } else {
        // Final checking is contract address or not
          THIS.setState({
            failAboutAddress: true
          })
        }
      } else {
        THIS.setState({
          failAboutAddress: true
        })
      }
    }
  }
}

const checkOpenSave = () => {
  const {txtImgUrl, txtContractAddr,
    txtTokenName, txtTokenSymbol, isDecimalErr, txtDecimal,
    isAddressErr, isNameErr, isAlreadyCreate, isNotContractAddr, failAboutAddress, failAboutAmount, failAboutDupAddress, failAboutTitle, fallOfAll, balanceAndDecimalOfUser } = THIS.state

  console.log('checkOpenSave123: ')
  console.log('checkOpenSave123--txtContractAddr.length: ', txtContractAddr.length)
  console.log('checkOpenSave123--fallOfAll: ', fallOfAll)
  console.log('checkOpenSave123--failAboutAddress: ', failAboutAddress)
  console.log('checkOpenSave123--failAboutAmount: ', failAboutAmount)
  console.log('checkOpenSave123--failAboutDupAddress: ', failAboutDupAddress)
  console.log('checkOpenSave123--failAboutTitle: ', failAboutTitle)
  console.log('checkOpenSave123--txtTokenName.length: ', txtTokenName.length)
  console.log('checkOpenSave123--txtTokenSymbol.length: ', txtTokenSymbol.length)
  console.log('checkOpenSave123--txtImgUrl.length: ', txtImgUrl.length)
  console.log('checkOpenSave123--txtDecimal.toString().length: ', txtDecimal.toString().length)
  console.log('checkOpenSave123--isAddressErr: ', isAddressErr)
  console.log('checkOpenSave123--isNameErr: ', isNameErr)
  console.log('checkOpenSave123--isAlreadyCreate: ', isAlreadyCreate)
  console.log('checkOpenSave123--isNotContractAddr: ', isNotContractAddr)
  console.log('checkOpenSave123--isDecimalErr: ', isDecimalErr)

  if (balanceAndDecimalOfUser && txtContractAddr.length > 0 && fallOfAll === true && failAboutAddress === false && failAboutAmount === false && failAboutDupAddress === false && failAboutTitle === false && txtTokenName.length > 0 && txtTokenSymbol.length > 0 && txtDecimal.toString().length >= 0 && !isAddressErr && !isAlreadyCreate && !isNotContractAddr) {
    THIS.setState({isDisableSave: false})
  } else {
    THIS.setState({isDisableSave: true})
  }
}

export const fetchGasPrice = () => {
  return (dispatch, getState) => {
    console.log('fetchGasPrice: restart after 60 minutes')
    THIS.props.loadingGasPrice()
    if (THIS.backgroundTimerGasPrice) {
      clearInterval(THIS.backgroundTimerGasPrice)
    }
    THIS.backgroundTimerGasPrice = setInterval(() => THIS.props.loadingGasPrice(), SIXTY_MINUTES)
  }
}

export const loadingGasPrice = () => {
  return async (dispatch, getState) => {
    let gasLimit = OxObject.getGasLimit()
    let gas = await OxObject.getGasPrice()
    if (!gas) {
      return
    }
    console.log('gasPrice', gas)
    THIS.setState({
      gasPrice: gas,
      setWidthPrice: Number(gas.fast).toFixed(1),
      valueInputGas: Number(gas.fast).toFixed(1),
      transactionFee: convertWeiToBalance(Number(gas.fast) * gasLimit, 9)
    })
  }
}

export const dragVolume = (e) => {
  return async (dispatch, getState) => {
    const { fWalletBalance } = THIS
    let gasLimit = OxObject.getGasLimit()
    THIS.setState({
      setWidthPrice: e,
      valueInputGas: e,
      transactionFee: convertWeiToBalance(e * gasLimit, 9),
      feeError: convertWeiToBalance(e * gasLimit, 9) > fWalletBalance
    }, () => calculateFeeETH())
  }
}

export const focusInputGasPrice = (value) => {
  return (dispatch, getState) => {
    if (validateNumber(value)) {
      if (value.toString() !== '.') {
        let dotsCount = countDots(value, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let decimalCount = value.length - value.indexOf('.') - 1
          if ((dotsCount !== 1 && decimalCount <= 3) || (dotsCount === 1 && decimalCount <= 1)) {
            THIS.setState({
              valueInputGas: value
            }, () => THIS.forceUpdate())
          }
        }
      }
    } else if (value.length === 0) {
      THIS.setState({
        valueInputGas: ''
      })
    }
    calculateFeeETH()
  }
}

export const unFocusInputGasPrice = () => {
  return async (dispatch, getState) => {
    const { valueInputGas, gasPrice } = THIS.state
    let gasLimit = OxObject.getGasLimit()
    if (valueInputGas === '' || valueInputGas === 0 || Number(valueInputGas) < Number(gasPrice.slow)) {
      THIS.setState({
        setWidthPrice: Number(gasPrice.slow).toFixed(1),
        valueInputGas: Number(gasPrice.slow).toFixed(1),
        transactionFee: convertWeiToBalance(Number(gasPrice.slow) * gasLimit, 9)
      })
    } else if (valueInputGas > (Number(gasPrice.fast) * 1.5)) {
      THIS.setState({
        setWidthPrice: Number(Number(gasPrice.fast) * 1.5).toFixed(1),
        valueInputGas: Number(Number(gasPrice.fast) * 1.5).toFixed(1),
        transactionFee: convertWeiToBalance(Number(gasPrice.fast) * 1.5 * gasLimit, 9)
      })
    } else {
      THIS.setState({
        setWidthPrice: Number(valueInputGas),
        valueInputGas: Number(valueInputGas),
        transactionFee: convertWeiToBalance(Number(valueInputGas) * gasLimit, 9)
      })
    }
    calculateFeeETH()
  }
}

export const clearAll = () => {
  return (dispatch, getState) => {
    THIS.setState({
      txtContractAddr: '',
      fileCSVName: '',
      fallOfAll: false,
      failAboutAddress: false,
      failAboutAmount: false,
      failAboutDupAddress: false,
      failAboutTitle: false,
      isDisableSave: true
    })
  }
}

let isCSV = false
let isLt2M = false
export const beforeUpload = (file) => {
  return (dispatch, getState) => {
    const listCSVTypes = 'CSV'
    const { t } = THIS.props
    let fileType = file.type.split('/')[1] ? file.type.split('/')[1].toUpperCase() : 'NOT_EXIST_FILE_TYPE'
    console.log('file type: ', file.type, fileType)
    console.log('file content: ', file)
    isCSV = listCSVTypes.includes(fileType)
    THIS.setState({
      failAboutAddress: false,
      failAboutAmount: false,
      failAboutDupAddress: false,
      failAboutTitle: false,
      fileCSVName: file.name
    })
    if (!isCSV) {
      message.error(t('notSupport'))
    }
    // isLt2M = file.size / 1024 / 1024 < 50
    // if (isCSV && !isLt2M) {
    //   message.error(t('smallerThan2MB'))
    // }
    // return isCSV & isLt2M
    return isCSV
  }
}

export const handleChange1 = (files) => {
  return (dispatch, getState) => {
    console.log('handleChange333333', files)
    var reader = new FileReader()
    reader.onload = function (e) {
      console.log('handleFiles', reader.result)
    }
    reader.readAsText(files.file.originFileObj)
  }
}

async function checkCSVFile (files, callback) {
  const { arrCardData } = THIS.props
  const mainAccountOfFilter = filterMainAccount(arrCardData)
  const { txtContractAddr } = THIS.state
  let contractAddressToken = txtContractAddr
  let account = mainAccountOfFilter.address
  const reader = new FileReader()
  reader.onload = async function (e) {
    console.log('handleFiles', reader.result)
    let allText = reader.result
    let allTextLines = allText.split(/\r\n|\n/)
    let headers = allTextLines[0].split(',')
    if (headers.length > 2 || headers[0].toLowerCase() !== 'address' || headers[1].toLowerCase() !== 'token amount') {
      THIS.setState({
        failAboutTitle: true
      })
    }
    let lines = []
    let arrOnlyAddress = []
    let arrOnlyAmount = []
    for (let i = 1; i < allTextLines.length; i++) {
      let data = allTextLines[i].split(',')
      if (data.length === headers.length) {
        let tarr = []
        for (let j = 0; j < headers.length; j++) {
          tarr.push(data[j])
          if (j === 0) {
            arrOnlyAddress.push(data[0])
          }
          if (j === 1) {
            arrOnlyAmount.push(data[1])
          }
        }
        lines.push(tarr)
      }
    }
    if (lines.length === 0 || arrOnlyAddress.length === 0 || arrOnlyAmount.length === 0) {
      THIS.setState({
        failAboutAddress: true
      })
    }
    console.log('contractAddressToken--loadingHBWIT: ', contractAddressToken)
    console.log('account--loadingHBWIT: ', account)
    let balanceAndDecimalOfUser = await getTokenBalanceOfUser(contractAddressToken, account)
    
    let offset = Math.floor(arrOnlyAddress.length / size)
    if (offset === Number(arrOnlyAddress.length / size)) {
      offset = offset - 1
    }
    let gasLimitForArr1 =
      arrOnlyAddress.length > 300
        ? 7000000
        : arrOnlyAddress.length <= 300 && arrOnlyAddress.length > 200
          ? 5000000
          : arrOnlyAddress.length <= 200 && arrOnlyAddress.length > 100
            ? 3500000
            : arrOnlyAddress.length <= 100 && arrOnlyAddress.length > 50
              ? 3500000
              : 3000000
    THIS.setState({
      arrOnlyAmount: arrOnlyAmount,
      arrOnlyAddress: arrOnlyAddress,
      balanceAndDecimalOfUser: balanceAndDecimalOfUser,
      offset: offset,
      gasLimitForArr: gasLimitForArr1
    }, () => checkOpenSave())
    console.log('offset123: ', offset)

    console.log('arrOnlyAmount: ', arrOnlyAmount)
    console.log('arrOnlyAddress: ', arrOnlyAddress)
    arrOnlyAddress.filter(function (value, index, self) {
      let checkDuplicate = self.indexOf(value) !== index
      if (checkDuplicate === true) {
        console.log('checkDublicate: TRUE')
        THIS.setState({
          failAboutDupAddress: true
        })
      }
    })
    for (let i = 0; i < lines.length; i++) {
      // console.log('checkNumberlines: ', lines[i][1])
      let checkComma = lines[i][1].toString().indexOf(',')
      // console.log('checkComma: ', checkComma)
      let arrNum = lines[i][1].toString().split('.')
      let checkArrNumErr = false
      if (arrNum[1] && balanceAndDecimalOfUser && (arrNum[1].length > balanceAndDecimalOfUser.decimal)) {
        checkArrNumErr = true
      }
      if (Number(lines[i][1]) <= 0 ||
        Number(lines[i][1]) === null ||
        checkComma !== -1 ||
        checkArrNumErr ||
        !Number(lines[i][1])
      ) {
        THIS.setState({
          failAboutAmount: true
        })
      } else if (lines[i][0] && lines[i][0] !== null) {
        THIS.props.onCheckAddress(lines[i][0])
      }
    }
    console.log('allTextLines: ', allTextLines)
    console.log('headers: ', headers)
    console.log('lines: ', lines)
  }
  try {
    reader.addEventListener('load', () => callback(reader.result))
    if (isCSV) reader.readAsText(files.file.originFileObj)
  } catch (error) {
    console.log('error upload', error)
  }
}

export const handleChange = (info) => {
  return (dispatch, getState) => {
    try {
      checkCSVFile(info, imageUrl => {
        THIS.setState({
          loading: false,
          fallOfAll: true
        }, () => checkOpenSave())
      })
    } catch (error) {
      console.log('error upload 1', error)
    }
  }
}

const calculateFeeETH = async (isSetMax = false) => {
  const { txtReceiveAddr, isAddressErr, txtSendAmount, transactionFee } = THIS.state
  const { internetData } = THIS.props
  const { fWalletBalance } = THIS
  if (internetData) {
    THIS.setState({ isLoadingSpendable: true })
    // Check send type MAX
    if (isSetMax) {
      let fSpendable = fWalletBalance
      let fNewFee = 0
      fNewFee = transactionFee
      if (!fSpendable || !fNewFee) {
        THIS.setState({ isLoadingSpendable: false })
        return
      }
      fSpendable = (fSpendable - fNewFee) < 0 ? 0 : (fSpendable - fNewFee)
      
      THIS.setState({
        fSpendable: formatNumber(fSpendable),
        fGasFee: fNewFee,
        isFeeErr: fWalletBalance < fNewFee
      }, () => {
        calculateSendAmount(formatNumber1(fSpendable, 8))
      })
    } else {
      let fSpendable = fWalletBalance
      let fNewFee = 0

      if (!isAddressErr && txtReceiveAddr.length > 0) {
        fNewFee = transactionFee
        // Check send type ACCOUNT
        fSpendable = (fSpendable - fNewFee) < 0 ? 0 : (fSpendable - fNewFee)

        // Check eth amount and condition for open sending
        THIS.setState({
          fSpendable: formatNumber(fSpendable),
          fGasFee: fNewFee,
          isFeeErr: fSpendable === 0
        }, () => {
          calculateSendAmount(txtSendAmount)
        })
      } else {
        let fTotalBalance = fWalletBalance
        THIS.setState({ fSpendable: formatNumber(fTotalBalance) })
      }
    }
    THIS.setState({ isLoadingSpendable: false })
  } else {
    THIS.setState({ isLoadingSpendable: false })
  }
}

const calculateSendAmount = (newAmount, newMoneyAmount) => {
  const { fSpendable } = THIS.state
  const { internetData, etherPrice } = THIS.props

  if (internetData) {
    // Check format number only
    if (!validateNumber(newAmount)) {
      // Clear data and error when no input
      if (newAmount.length === 0) {
        THIS.setState({ isDisableSend: true, isSendAmountErr: false, txtSendAmount: '', txtFiatAmount: '' })
      }
    } else {
      // Check clear first dots
      if (newAmount.toString() !== '.') {
        let dotsCount = countDots(newAmount, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let isError = false
          let decimalCount = newAmount.length - newAmount.indexOf('.') - 1

          if (dotsCount === 1 && decimalCount > 8) {
            isError = true
          }

          if (!isError) {
            // User can input if pass all previous condition
            let newAmountNum = Number(newAmount)
            // Convert to Money amount format max 2 decimal
            let txtFiatAmount = newMoneyAmount || (etherPrice.price * newAmountNum).toFixed(2)
            if (newAmountNum > (fSpendable) || newAmountNum <= 0) {
              // Final fail checking
              THIS.setState({
                isSendAmountErr: true,
                txtSendAmount: newAmount,
                txtFiatAmount,
                isDisableSend: true
              })
            } else {
              // Final success checking
              THIS.setState({
                isSendAmountErr: false,
                txtSendAmount: newAmount,
                txtFiatAmount
              }, () => { checkOpenSending() })
            }
          }
        }
      }
    }
  } else {
    THIS.setState({ txtSendAmount: newAmount })
  }
}

const checkOpenSending = () => {
  const { isAddressErr, isSendAmountErr, isFeeErr, txtReceiveAddr, fGasFee, txtSendAmount } = THIS.state

  if (!isAddressErr && !isSendAmountErr && isFeeErr === false) {
    if (txtReceiveAddr.length > 0 && fGasFee.toString().length > 0 && txtSendAmount.length > 0) {
      THIS.setState({ isDisableSend: false })
    } else {
      THIS.setState({ isDisableSend: true })
    }
  } else {
    THIS.setState({ isDisableSend: true })
  }
}

export const getDetail = (item) => {
  return (dispatch, getState) => {
    THIS.setState({ 
      arrFail: item.failedTx,
      arrSuccess: item.successTx
    }, () => { THIS.refs.modaladwDetail.show() })
  }
}
