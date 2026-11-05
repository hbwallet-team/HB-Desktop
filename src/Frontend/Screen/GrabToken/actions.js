/* eslint-disable no-empty */
import swal from 'sweetalert2'
import { validateAddress, validateNumber, countDots, formatNumber, formatNumber1, convertWeiToBalance, convertBalanceToWei, filterMainAccount, showNotification, roundingNumber, openBrowserInNewTab } from 'Utils/globalFunction'
import { OBSERVER_KEY, APP_ENVIROMENT, NUM_PAGE_GACHA } from 'Utils/globalConstants'
import EtherLibrary from 'Backend/HBLibrary/EtherLibrary'
import { setToken, setAirdrop, setTokenSale, setUnReadGrab, setReadGrab } from 'Backend/Redux/actions/globalActions'
import { sendEthTokenTxs, sendAirdropTxs, sendAirdropTxs721, pauseAirdrop, withDrawAirdrop, getGachaAirdrop, getTokenBalance, getTokenSymbol } from 'Backend/Lib/Web3/index'
import DexAPI from 'Backend/Api/services/DexAPI'
import EtherGas from 'Backend/Api/services/EtherGas'
import Settings from 'Backend/settings'
import ReduxServices from 'Utils/globalRedux'
import AirdropABI from 'Utils/airDropSmartContractABI'
import AirdropABI721 from 'Utils/airDropSmartContractABI721'
import AirdropABI721v2 from 'Utils/airDropSmartContractABI721v2'
import Observer from 'Utils/HBObserver'
import OxObject from 'Backend/Lib/0x/index'
import NagemonAPI from 'Backend/Api/services/NagemonAPI'
import Images from 'Assets/Image'
import Ethplorer from 'Backend/Api/services/Ethplorer'
import DappAPI from 'Backend/Api/services/DappAPI'
const { shell } = window.require('electron')
const TAB_SELECTED = {
  AIRDROP: '1',
  TOKEN_SALE: '2',
  CLOSED: '3'
}
const NOTIFICATION_SOUND1 = require('Assets/Sound/sub.mp3')
const NOTIFICATION_SOUND1G = require('Assets/Sound/sub1.mp3')
const NOTIFICATION_SOUND2G = require('Assets/Sound/sub2.mp3')
const NOTIFICATION_SOUND3G = require('Assets/Sound/sub3.mp3')
const NOTIFICATION_SOUND4G = require('Assets/Sound/sub4.mp3')
const NOTIFICATION_SOUND2 = require('Assets/Sound/main.mp3')
const audio1 = new Audio(NOTIFICATION_SOUND1)
const audio2 = new Audio(NOTIFICATION_SOUND2)
const audio3 = [
  new Audio(NOTIFICATION_SOUND1G),
  new Audio(NOTIFICATION_SOUND2G),
  new Audio(NOTIFICATION_SOUND3G),
  new Audio(NOTIFICATION_SOUND4G)
]

var Web3 = require('web3')
var web3 = new Web3()
// web3.setProvider(new web3.providers.HttpProvider(Settings.server.networkInfura.url))

var THIS

export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const fetchInitData = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData, localeData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      ReduxServices.refreshGrabToken().then(async () => {
        const { arrAirdrop } = getState()
        // let item721 = await ReduxServices.refreshAirdrop721()
        // console.log('listAirdrop1234444: ', item721)
        // if (item721 && item721.airdrop_smart_contract_address !== arrAirdrop[0]._id) {
        //   arrAirdrop.unshift(item721)
        // }
        console.log('fetchInitData---arrAirdrop: ', arrAirdrop)
        if (arrAirdrop.length > 0) {
          let arrCountdown = []
          let newArrAirdrop = arrAirdrop.filter(e => (!e.isExpire && (!e.hasOwnProperty('isActive') || e.isActive)) || (!e.isExpire && e.is721Drop === true))
          let arrDeadLineGacha = newArrAirdrop.filter(async e => {
            // if (e.hasOwnProperty('gdeadlineGacha') && e.gdeadlineGacha !== false) {
            if (e.is721Drop || e.is721DropV1) {
              let deadline = await getDeadLine(e)
              if (deadline) {
                e.gdeadlineGacha = deadline.gdeadlineGacha
                e.gfullTime = deadline.gfullTime
                let itemAdd = {
                  gdeadlineGacha: deadline.gdeadlineGacha,
                  gfullTime: deadline.gfullTime,
                  _idNew: e._id
                }
                arrCountdown.push(itemAdd)
              }
            }
            if (e.is721DropV2) {
              let deadline = await getDeadLineV2(e)
              if (deadline) {
                e.gdeadlineGacha = deadline.gdeadlineGacha
                e.gfullTime = deadline.gfullTime
                let itemAdd = {
                  gdeadlineGacha: deadline.gdeadlineGacha,
                  gfullTime: deadline.gfullTime,
                  _idNew: e._id
                }
                arrCountdown.push(itemAdd)
              }
            }
          })
          if (arrCountdown) {
            THIS.setState({
              deadlineAllGacha: arrCountdown
            })
          }
          // continue in here
          let isExpireAirdrops = arrAirdrop.filter(e => !((!e.isExpire && (!e.hasOwnProperty('isActive') || e.isActive)) || (!e.isExpire && e.is721Drop === true)))
          if (isExpireAirdrops) {
            THIS.setState({
              isExpireAirdrops
            })
          }
          if (newArrAirdrop.length > 0) {
            let indexAirdrop = arrAirdrop.findIndex(e => e._id === newArrAirdrop[0]._id)

            // check remaining start time
            let compareDate = new Date()
            compareDate.setTime(newArrAirdrop[0].start_time)
            let now = new Date()
            let difference = compareDate.getTime() - now.getTime()

            THIS.setState({
              deadline: newArrAirdrop[0].start_time,
              isEnableRequest: difference > 0,
              selectedAirdrop: newArrAirdrop[0]
            })

            // validate airdrop
            if (newArrAirdrop[0].is721Drop || newArrAirdrop[0].is721DropV1 || newArrAirdrop[0].is721DropV2) {
              arrAirdrop[indexAirdrop] = await validateAirdrop721(newArrAirdrop[0])
              let tokenInfo
              if (!(newArrAirdrop[0] && newArrAirdrop[0].airdropId)) {
                tokenInfo = await Ethplorer.getAddressInfo(newArrAirdrop[0].contractAddress)
              }
              if (tokenInfo) {
                THIS.setState({
                  countTxs: tokenInfo.countTxs
                })
              }
            } else {
              arrAirdrop[indexAirdrop] = await validateAirdrop(newArrAirdrop[0])
            }
            dispatch(setAirdrop(newArrAirdrop))
          } 
          // filter my airdrop
          let arrMyAirdrop = arrAirdrop && arrAirdrop.filter(e => e.owner && e.owner.toLowerCase() === mainAccount.address.toLowerCase())

          THIS.setState({
            isLoading: false,
            arrMyAirdrop
          })
        } else {
          THIS.setState({
            isLoading: false
          })
        }
      })
    } else {
      THIS.setState({
        isLoading: false
      })
    }
  }
}

export const getDeadlineAllGacha = () => {
  return (dispatch, getState) => {
    const { arrAirdrop } = getState()
    if (arrAirdrop.length > 0) {
      let arrCountdown = []
      let newArrAirdrop = arrAirdrop.filter(e => (!e.isExpire && (!e.hasOwnProperty('isActive') || e.isActive)) || (!e.isExpire && e.is721Drop === true))
      let arrDeadLineGacha = newArrAirdrop.filter(async e => {
        // if (e.hasOwnProperty('gdeadlineGacha') && e.gdeadlineGacha !== false) {
        if (e.is721Drop || e.is721DropV1) {
          let deadline = await getDeadLine(e)
          if (deadline) {
            e.gdeadlineGacha = deadline.gdeadlineGacha
            e.gfullTime = deadline.gfullTime
            let itemAdd = {
              gdeadlineGacha: deadline.gdeadlineGacha,
              gfullTime: deadline.gfullTime,
              _idNew: e._id
            }
            arrCountdown.push(itemAdd)
          }
        }
        if (e.is721DropV2) {
          let deadline = await getDeadLineV2(e)
          if (deadline) {
            e.gdeadlineGacha = deadline.gdeadlineGacha
            e.gfullTime = deadline.gfullTime
            let itemAdd = {
              gdeadlineGacha: deadline.gdeadlineGacha,
              gfullTime: deadline.gfullTime,
              _idNew: e._id
            }
            arrCountdown.push(itemAdd)
          }
        }
      })
      if (arrCountdown) {
        THIS.setState({
          deadlineAllGacha: arrCountdown
        })
      }
      console.log('getDeadlineAllGacha---arrAirdrop: ', arrDeadLineGacha)
    }
  }
}

const getDeadLine = async (item) => {
  const { arrCardData } = THIS.props
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

const getDeadLineV2 = async (item) => {
  const { arrCardData } = THIS.props
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

const validateAirdrop = async (item) => {
  const { arrCardData } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)
  // check isEnabledRequest 
  let contract = await getGachaAirdrop(AirdropABI, item.contractAddress)
  let invalidAirDrop = await contract.methods.invalidAirDrop(mainAccount.address).call()
  console.log('invalidAirDrop', invalidAirDrop)
  let isValidAirDropForIndividual = await contract.methods.isValidAirDropForIndividual().call()
  console.log('isValidAirDropForIndividual', isValidAirDropForIndividual)
  let isValidAirDropForAll = await contract.methods.isValidAirDropForAll().call()
  console.log('isValidAirDropForAll', isValidAirDropForAll)
  let remainingToken = await contract.methods.getRemainingToken().call()
  console.log('remainingToken', remainingToken)
  let stop = await contract.methods.stop().call()
  console.log('stop', stop)
  item.isEnabledRequest = false
  item.stop = stop
  if (isValidAirDropForIndividual && isValidAirDropForAll && !invalidAirDrop && Number(remainingToken) > 0 && !stop) {
    item.isEnabledRequest = true
  }
  return item
}

const validateAirdrop721 = async (item) => {
  const { arrCardData } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)
  // check isEnabledRequest 
  console.log('resGacha123: ', item)
  let isConditionErr = false
  let conditionBalance
  let tokenNeeded
  if (item.amount_need > 0) {
    conditionBalance = await getTokenBalance(item.amount_need_address, mainAccount.address)
    tokenNeeded = await getTokenSymbol(item.amount_need_address)
    let convertConditionBalance = Number(conditionBalance) > 0 ? Number(conditionBalance) : 0
    isConditionErr = Number(item.amount_need) > convertConditionBalance
    console.log('convertConditionBalance-gacha: ', convertConditionBalance)
    console.log('isConditionErr-gacha: ', isConditionErr)
    console.log('item.amount_need-gacha: ', item.amount_need)
    if (isConditionErr) {
      THIS.setState({
        gcName: tokenNeeded,
        gcBalance: item.amount_need
      })
    } else {
      THIS.setState({
        gcName: false,
        gcBalance: false
      })
    }
  } else {
    THIS.setState({
      gcName: false,
      gcBalance: false
    })
  }
  if (item.airdropId) {
    return new Promise(async (resolve, reject) => {
      const contractGacha = await getGachaAirdrop(AirdropABI721v2, item.contractAddress)
      contractGacha.methods.getTimeTrackUser(item.airdropId, mainAccount.address).call().then(async (res) => {
        var seconds = Math.round(new Date().getTime() / 1000)
        const isOkCondition = (seconds - res['_timeTrackUser']) >= res['_periodToPlay']
        item.isEnabledRequest = isOkCondition && !isConditionErr
        console.log('res_countCallTime: ', res['_countCallTime'])
        if (isOkCondition) {
          THIS.setState({
            isEnableRequest: false,
            fullTime: true,
            countTxs: res['_countCallTime']
          })
        } else {
          THIS.setState({
            isEnableRequest: true,
            deadline: Math.round((Number(res['_timeTrackUser']) + Number(res['_periodToPlay'])) * 1000),
            deadlineGacha: Math.round((Number(res['_timeTrackUser']) + Number(res['_periodToPlay'])) * 1000),
            fullTime: false,
            countTxs: res['_countCallTime']
          })
        }
        resolve(item)
      }).catch(() => {
        resolve(false)
      })
    })
  } else {
    return new Promise(async (resolve, reject) => {
      const contractGacha = await getGachaAirdrop(AirdropABI721, item.contractAddress)
      contractGacha.methods.timeTrackUser(mainAccount.address).call().then(async (timeLastGetAward) => {
        await contractGacha.methods.periodToPlay().call().then((periodPlay) => {
          var seconds = Math.round(new Date().getTime() / 1000)
          const isOkCondition = (seconds - timeLastGetAward) >= periodPlay
          item.isEnabledRequest = isOkCondition && !isConditionErr
          console.log('validateAirdrop721---res2: ', timeLastGetAward)
          console.log('validateAirdrop721---seconds2: ', seconds)
          if (isOkCondition) {
            THIS.setState({
              isEnableRequest: false,
              fullTime: true
            })
          } else {
            THIS.setState({
              isEnableRequest: true,
              deadline: Math.round((Number(timeLastGetAward) + Number(periodPlay)) * 1000),
              deadlineGacha: Math.round((Number(timeLastGetAward) + Number(periodPlay)) * 1000),
              fullTime: false
            })
          }
          resolve(item)
        }).catch(() => {
          resolve(false)
        })
      }).catch(() => {
        resolve(false)
      })
    })
  }
}

const validateAirdrop721OLD = async (item) => {
  const { arrCardData } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)
  // check isEnabledRequest 
  let firstTime = false
  let secondTime = false
  let waitingTime = 0
  let timeStart = 0
  let contract = await getGachaAirdrop(AirdropABI721, item.contractAddress)
  timeStart = await contract.methods.timeTrackUser(mainAccount.address).call()
  timeStart = Number(timeStart.toString().substr(0, 10))
  let periodToPlay = await contract.methods.periodToPlay().call()
  // just for test
  // let periodToPlay = 30
  periodToPlay = Number(periodToPlay)
  let isValidToPlay = await contract.methods.isValidToPlay().call()
  // if this is the first time user click to get AirDrop 721
  if (timeStart === 0) {
    firstTime = true
  } else {
    // if this is the second time or more
    let timeNow = Math.round(Date.now() / 1000)
    waitingTime = timeNow - timeStart
    if (waitingTime > periodToPlay) {
      secondTime = true
    } else {
      secondTime = false
    }
  }
  if ((firstTime && isValidToPlay) || (secondTime && isValidToPlay)) {
    item.isEnabledRequest = true
    THIS.setState({
      isEnableRequest: false,
      fullTime: true
    })
  } else {
    item.isEnabledRequest = false
    THIS.setState({
      isEnableRequest: true,
      deadline: Math.round((timeStart + periodToPlay) * 1000),
      deadlineGacha: Math.round((timeStart + periodToPlay) * 1000),
      fullTime: false
    })
  }
  return item
}

export const backTo721 = (result, item) => {
  return async (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    let checkAddress
    if (item && (item.is721DropV2 || item.is721DropV1)) { 
      checkAddress = await NagemonAPI.getGachaHistorySub(mainAccount.address, item.contractAddress, 1, item.airdropId)
    } else {
      checkAddress = await NagemonAPI.getHistoryByAddress(mainAccount.address, 1)
    }
    if (checkAddress) {
      THIS.setState({
        hasMore: true,
        isLoadMore: false,
        pageNum: 1,
        isLoadingHistory721: false,
        history721: result,
        listHistory: checkAddress.data,
        totalNumGacha: checkAddress.itemsCount
      }, () => {
        console.log('backTo721: ', THIS.state.history721)
        console.log('totalNumGacha: ', THIS.state.totalNumGacha)
        console.log('listHistory: ', THIS.state.listHistory)
      })
    }
  }
}

export const selectedCellAirdrop = (item) => {
  return async (dispatch, getState) => {
    const { arrAirdrop, unReadGrab, readGrab } = THIS.props
    THIS.setState({
      history721: false
    })
    try {
      if (!item) {
        THIS.setState({
          selectedAirdrop: null,
          deadline: 1554076800000, // April 4 2019
          isEnableRequest: false
        })
        return
      }
      let indexAirdrop = arrAirdrop.findIndex(e => e._id === item._id)
      // check remaining start time
      let compareDate = new Date()
      compareDate.setTime(item.start_time)
      let now = new Date()
      let difference = compareDate.getTime() - now.getTime()
      THIS.setState({
        isGetting721: false,
        selectedAirdrop: item,
        deadline: item.start_time,
        isEnableRequest: difference > 0
      })
      // set airdrop was read
      if (!readGrab.includes(item._id)) {
        readGrab.push(item._id)
        dispatch(setReadGrab(readGrab))
        dispatch(setUnReadGrab(unReadGrab - 1))
        arrAirdrop[indexAirdrop].isRead = true
      }
      // validate airdrop
      if (item.is721Drop || item.is721DropV1 || item.is721DropV2) {
        let getNewInfo = await validateAirdrop721(item)
        if (getNewInfo) {
          arrAirdrop[indexAirdrop] = getNewInfo
        }
        let tokenInfo
        if (!(item && item.airdropId)) {
          tokenInfo = await Ethplorer.getAddressInfo(item.contractAddress)
        }
        console.log('tokenInfo1234: ', tokenInfo)
        console.log('tokenInfo12345: ', getNewInfo)
        if (tokenInfo) {
          THIS.setState({
            countTxs: tokenInfo.countTxs
          })
        }
      } else {
        arrAirdrop[indexAirdrop] = await validateAirdrop(item)
      }
      console.log('tokenInfo123: ', item)
      dispatch(setAirdrop(arrAirdrop))
      THIS.forceUpdate()
    } catch (error) {
      console.log(error)
    }
  }
}

export const selectedCellAirdropPerSecond = (item) => {
  return async (dispatch, getState) => {
    try {
      // check remaining start time
      let compareDate = new Date()
      compareDate.setTime(item.start_time)
      let now = new Date()
      let difference = compareDate.getTime() - now.getTime()
      THIS.setState({
        isGetting721: false,
        selectedAirdrop: item,
        deadline: item.start_time,
        isEnableRequest: difference > 0
      })
    } catch (error) {
      console.log(error)
    }
  }
}

export const selectedExpireCellAirdrop = (item) => {
  return async (dispatch, getState) => {
    const { unReadGrab, readGrab } = THIS.props
    const { isExpireAirdrops } = THIS.state
    THIS.setState({
      history721: false
    })
    try {
      if (!item) {
        THIS.setState({
          selectedAirdrop: null,
          deadline: 1554076800000, // April 4 2019
          isEnableRequest: false
        })
        return
      }
      let indexAirdrop = isExpireAirdrops.findIndex(e => e._id === item._id)
      // check remaining start time
      let compareDate = new Date()
      compareDate.setTime(item.start_time)
      let now = new Date()
      let difference = compareDate.getTime() - now.getTime()
      THIS.setState({
        selectedAirdrop: item,
        deadline: item.start_time,
        isEnableRequest: difference > 0
      })
      // validate airdrop
      if (item.is721Drop || item.is721DropV1 || item.is721DropV2) {
        let getNewInfo = await validateAirdrop721(item)
        if (getNewInfo) {
          isExpireAirdrops[indexAirdrop] = getNewInfo
        }
        let tokenInfo
        if (!(item && item.airdropId)) {
          tokenInfo = await Ethplorer.getAddressInfo(item.contractAddress)
        }
        console.log('tokenInfo123: ', item)
        console.log('tokenInfo123: ', tokenInfo)
        if (tokenInfo) {
          THIS.setState({
            countTxs: tokenInfo.countTxs
          })
        }
      } else {
        isExpireAirdrops[indexAirdrop] = await validateAirdrop(item)
      }
      THIS.forceUpdate()
    } catch (error) {
      console.log(error)
    }
  }
}

export const selectedCellTokenSale = (indexTokenSale) => {
  return async (dispatch, getState) => {
    const { arrTokenSale, unReadGrab, readGrab } = THIS.props

    let compareDate = new Date()
    compareDate.setTime(arrTokenSale[indexTokenSale].start_time)
    var now = new Date()
    var difference = compareDate.getTime() - now.getTime()
    THIS.setState({
      indexTokenSale,
      isTermScreen: false,
      isConfirmScreen: false,
      deadline: arrTokenSale[indexTokenSale].start_time,
      isEnableJoin: difference > 0
    })
    if (!arrTokenSale[indexTokenSale].isRead) {
      arrTokenSale[indexTokenSale].isRead = true
      dispatch(setUnReadGrab(unReadGrab - 1))
    }
    // set airdrop was read
    if (!readGrab.includes(arrTokenSale[indexTokenSale]._id)) {
      readGrab.push(arrTokenSale[indexTokenSale]._id)
      dispatch(setReadGrab(readGrab))
      dispatch(setUnReadGrab(unReadGrab - 1))
      arrTokenSale[indexTokenSale].isRead = true
    }
    dispatch(setTokenSale(arrTokenSale))
  }
}

export const onChangeTab = (tabSelected) => {
  return async (dispatch, getState) => {
    const { arrAirdrop, arrTokenSale } = THIS.props
    const { indexTokenSale, selectedAirdrop } = THIS.state
    THIS.setState({ tabSelected, isTermScreen: false, isConfirmScreen: false })
    if (tabSelected === TAB_SELECTED.TOKEN_SALE) {
      if (arrTokenSale.length > 0) {
        // check remaining start time
        let compareDate = new Date()
        compareDate.setTime(arrTokenSale[indexTokenSale].start_time)
        let now = new Date()
        let difference = compareDate.getTime() - now.getTime()
  
        THIS.setState({
          deadline: arrTokenSale[indexTokenSale].start_time,
          isEnableJoin: difference > indexTokenSale
        })
      }
    } else {
      let newArrAirdrop = arrAirdrop.filter(e => (!e.isExpire && (!e.hasOwnProperty('isActive') || e.isActive)) || (!e.isExpire && e.is721Drop === true))
      if (newArrAirdrop.length > 0) {
        let indexAirdrop = selectedAirdrop && arrAirdrop.findIndex(e => e._id === selectedAirdrop._id)
        // check remaining start time
        let compareDate = new Date()
        compareDate.setTime(selectedAirdrop.start_time)
        let now = new Date()
        let difference = compareDate.getTime() - now.getTime()

        THIS.setState({
          deadline: selectedAirdrop.start_time,
          isEnableRequest: difference > 0
        })

        // validate airdrop
        if (selectedAirdrop.is721Drop || selectedAirdrop.is721DropV1 || selectedAirdrop.is721DropV2) {
          arrAirdrop[indexAirdrop] = await validateAirdrop721(selectedAirdrop)
        } else {
          arrAirdrop[indexAirdrop] = await validateAirdrop(selectedAirdrop)
        }
        dispatch(setAirdrop(newArrAirdrop))
      } 
    }
  }
}

export const requestAirDrop = () => {
  return (dispatch, getState) => {
    const { arrTokenSale, indexAirdrop } = THIS.state
    const { t } = THIS.props

    const item = arrTokenSale[indexAirdrop]
    if (item) {
      console.log(item.name)
    }
    swal({
      width: '250px',
      text: t('AirDropRequested'),
      type: 'success',
      timer: 5000,
      showConfirmButton: false
    })
  }
}

export const onChangeEthereumAmount = (ethAmount) => {
  return (dispatch, getState) => {
    const { arrTokenSale, indexTokenSale } = THIS.state

    const item = arrTokenSale[indexTokenSale]
    if (item) {
      THIS.setState({
        ethAmount,
        tokenAmount: formatNumber(ethAmount * item.rate, 8)
      })
    }
  }
}
export const onChangeTokenAmount = (tokenAmount) => {
  return (dispatch, getState) => {
    const { arrTokenSale, indexTokenSale } = THIS.state

    const item = arrTokenSale[indexTokenSale]
    if (item) {
      THIS.setState({
        ethAmount: formatNumber(tokenAmount / item.rate, 8),
        tokenAmount
      })
    }
  }
}
export const joinBuyToken = () => {
  return (dispatch, getState) => {
    THIS.setState({isTermScreen: true})
  }
}
export const gotoConfirmScreen = () => {
  return (dispatch, getState) => {
    const { arrTokenSale } = THIS.props
    const { indexTokenSale } = THIS.state

    let item = arrTokenSale[indexTokenSale]
    let newAddress = item.contractAddress
    THIS.setState({
      isConfirmScreen: true,
      ethConfirmAmount: '',
      currencyConfirmAmount: '',
      tokenConfirmAmount: '',
      isSendAmountErr: false,
      isErrorMindeposit: false
    }, () => {
      if (!validateAddress(newAddress)) {
        THIS.setState({
          isDisableSend: true
        })
      } else {
        if ((newAddress.startsWith('0x') && newAddress.length === 42)) {
        // Final success checking
          THIS.setState({ receiverAccount: newAddress }, () => {
            calculateFeeETH()
          })
        } else {
        // Final fail checking
          THIS.setState({
            receiverAccount: newAddress,
            isDisableSend: true
          })
        }
      }
    })
  }
}
export const onChangeReceiverAccount = (newAddress) => {
  return (dispatch, getState) => {
    // Check valid format address ethereum
    console.log('onChangeReceiverAccount: ', newAddress)
  }
}
const calculateFeeETH = async (isSetMax = false) => {
  console.log('calculateFeeETH')
  const { ethConfirmAmount, indexTokenSale } = THIS.state
  const { internetData, arrCardData, arrTokenSale } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)

  let item = arrTokenSale[indexTokenSale]
  if (internetData) {
    THIS.setState({ isLoadingSpendable: true })
    // Check send type MAX
    if (isSetMax) {
      let fSpendable = mainAccount.balance
      let fNewFee = 0
      if (item.contractAddress.length > 0) {
        fNewFee = (convertWeiToBalance(await EtherLibrary.getFeeGasStation(item.contractAddress, 1))).toFixed(8)
        fSpendable = (fSpendable - fNewFee) < 0 ? 0 : (fSpendable - fNewFee)
      }

      THIS.setState({
        fSpendable: formatNumber(fSpendable)
      }, () => {
        THIS.props.calculateSendAmount(formatNumber1(fSpendable, 8))
      })
    } else {
      let fSpendable = mainAccount.balance
      let fNewFee = 0

      if (item.contractAddress.length > 0) {
        fNewFee = convertWeiToBalance(await EtherLibrary.getFeeGasStation(item.contractAddress, 1)).toFixed(8)
        // Check send type ACCOUNT
        fSpendable = (fSpendable - fNewFee) < 0 ? 0 : (fSpendable - fNewFee)

        // Check eth amount and condition for open sending
        THIS.setState({
          fSpendable: formatNumber(fSpendable)
        }, () => {
          THIS.props.calculateSendAmount(ethConfirmAmount)
        })
      } else {
        let fTotalBalance = mainAccount.balance
        THIS.setState({ fSpendable: formatNumber(fTotalBalance) })
      }
    }
    THIS.setState({ isLoadingSpendable: false })
  } else {
    THIS.setState({ isLoadingSpendable: false })
  }
}
export const calculateSendAmount = (newAmount, newMoneyAmount, tokenAmount) => {
  return (dispatch, getState) => {
    const { fSpendable, indexTokenSale } = THIS.state
    const { internetData, arrTokenSale, etherPrice } = THIS.props
    let item = arrTokenSale[indexTokenSale]

    if (internetData) {
      // Check format number only
      if (!validateNumber(newAmount)) {
      // Clear data and error when no input
        if (newAmount.length === 0) {
          THIS.setState({
            isDisableSend: true,
            isSendAmountErr: false,
            isErrorMindeposit: false,
            tokenConfirmAmount: '',
            ethConfirmAmount: '',
            currencyConfirmAmount: ''
          })
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
              if (newAmountNum > (fSpendable)) {
                // Final fail checking
                THIS.setState({
                  isSendAmountErr: true,
                  isErrorMindeposit: false,
                  ethConfirmAmount: newAmount,
                  currencyConfirmAmount: txtFiatAmount,
                  tokenConfirmAmount: tokenAmount || newAmount * item.rate,
                  isDisableSend: true
                })
              } else if (newAmountNum < item.minDeposit) {
                THIS.setState({
                  isErrorMindeposit: true,
                  isSendAmountErr: true,
                  ethConfirmAmount: newAmount,
                  currencyConfirmAmount: txtFiatAmount,
                  tokenConfirmAmount: tokenAmount || newAmount * item.rate,
                  isDisableSend: true
                })
              } else {
              // Final success checking
                THIS.setState({
                  isErrorMindeposit: false,
                  isSendAmountErr: false,
                  ethConfirmAmount: newAmount,
                  tokenConfirmAmount: tokenAmount || newAmount * item.rate,
                  currencyConfirmAmount: txtFiatAmount
                }, () => { checkOpenSending() })
              }
            }
          }
        }
      }
    } else {
      THIS.setState({ ethConfirmAmount: newAmount, tokenConfirmAmount: newAmount * item.rate })
    }
  }
}

export const onChangeCurrency = (newAmount) => {
  return (dispatch, getState) => {
    const { internetData, etherPrice } = THIS.props

    if (internetData) {
      // Check format number only
      if (!validateNumber(newAmount)) {
        // Clear data and error when no input
        if (newAmount.length === 0) {
          THIS.setState({ isSendAmountErr: false, isErrorMindeposit: false, tokenConfirmAmount: '', ethConfirmAmount: '', currencyConfirmAmount: '' })
        }
      } else {
        // Check clear first dots
        if (newAmount.toString() !== '.') {
          let dotsCount = countDots(newAmount, '\\.')
          // Check only accept 1 dots
          if (dotsCount <= 1) {
            let isError = false
            let decimalCount = newAmount.length - newAmount.indexOf('.') - 1

            if (dotsCount === 1 && decimalCount > 2) {
              // Check if money decimal greater than 2
              isError = true
            }
            if (!isError) {
              // Convert to token amount format based on token Decimal
              let ethConfirmAmount = (Number(newAmount) / etherPrice.price).toFixed(8)

              THIS.props.calculateSendAmount(ethConfirmAmount, newAmount)
            }
          }
        }
      }
    } else {
      THIS.setState({ currencyConfirmAmount: newAmount })
    }
  }
}
const checkOpenSending = () => {
  const { isSendAmountErr, ethConfirmAmount, isErrorMindeposit } = THIS.state
  if (!isSendAmountErr && !isErrorMindeposit) {
    if (ethConfirmAmount.length > 0) {
      THIS.setState({ isDisableSend: false })
    } else {
      THIS.setState({ isDisableSend: true })
    }
  } else {
    THIS.setState({ isDisableSend: true })
  }
}
export const onClickMax = () => {
  return (dispatch, getState) => {
    console.log('onClickMax')
    calculateFeeETH(true)
  }
}
export const cancelConfirm = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isConfirmScreen: false,
      isTermScreen: true
    })
  }
}

/**
* @name : handleInput
* @param : mnemonic
* @description : Validate mnemonic type from users input
*/
export const cancelTerm = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isTermScreen: false
    })
  }
}
export const sendEth = () => {
  return async (dispatch, getState) => {
    console.log('sendEth')
    const { internetData, t, arrCardData, arrTokenData, arrHBTokens } = THIS.props
    const { arrTokenSale, indexTokenSale, ethConfirmAmount } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)

    let item = arrTokenSale[indexTokenSale]
    THIS.setState({ isLoadingExcute: true })
    THIS.forceUpdate()
    if (internetData) {
      let gas = await EtherGas.getGasPrice()
      sendEthTokenTxs(mainAccount.privateKey, item.contractAddress, ethConfirmAmount, null, gas.fast)
        .then((txHash) => {
          swal({
            width: '250px',
            text: t('purchasedSuccessful'),
            type: 'success',
            timer: 5000,
            showConfirmButton: false
          })
          THIS.setState({ isLoadingExcute: false, isTermScreen: false, isConfirmScreen: false })
          // Get list token from server
          let tokenWillAdd = null
          arrTokenData.map(tk => {
            if (tk.symbol === item.symbol) { // Check if token wasn't added to local token list
              tokenWillAdd = tk
            }
          })
          if (!tokenWillAdd) {
            arrHBTokens.map(tk => { // Check if token on server, add it to local
              if (tk.symbol === item.symbol) {
                arrTokenData.push({
                  key: arrTokenData.length === 0 ? 0 : arrTokenData[arrTokenData.length - 1].key + 1,
                  tokenId: tk.id,
                  name: tk.name,
                  address: tk.tokenAddress,
                  cardImage: tk.cardImage,
                  iconImage: tk.iconImage,
                  symbol: tk.symbol,
                  url: tk.url,
                  balance: 0,
                  decimals: tk.decimals,
                  isEnabled: true,
                  isAutoAddedToken: true,
                  isCustomToken: false,
                  currencyBalance: 0,
                  fiatAmount: 0
                })
                dispatch(setToken(arrTokenData))
              }
            })
          }
        })
        .catch((error) => {
          console.log(error)
          swal({
            width: '250px',
            text: t('purchasedFail'),
            type: 'error',
            showConfirmButton: false
          })
          THIS.setState({ isLoadingExcute: false })
        })
    } else {
      THIS.setState({ isLoadingExcute: false })
    }
  }
}
export const onChangeTokenConfirm = (value) => {
  return (dispatch, getState) => {
    const { arrTokenSale, indexTokenSale } = THIS.state

    let item = arrTokenSale[indexTokenSale]
    if (value.length === 0) {
      THIS.setState({ isSendAmountErr: false, isErrorMindeposit: false, tokenConfirmAmount: '', ethConfirmAmount: '', currencyConfirmAmount: '' })
    } else {
      let ethAmount = (Number(value) / item.rate).toFixed(8)
      THIS.props.calculateSendAmount(ethAmount, null, value)
    }
  }
}

/**
* @name : clickAirDrop
* @param :
* @description : excuse function airdrop
*/
export const clickAirDrop = () => {
  return async (dispatch, getState) => {
    THIS.refs.md_mab_confirm.hide()
    const { arrCardData, arrAirdrop } = getState()
    const { selectedAirdrop, gasInput, awardGamev2 } = THIS.state
    const { t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (mainAccount && mainAccount.balance <= 0.00013 && selectedAirdrop && (selectedAirdrop.is721Drop || selectedAirdrop.is721DropV1 || selectedAirdrop.is721DropV2)) {
      THIS.refs.md_mab_confirmGacha && THIS.refs.md_mab_confirmGacha.hide()
      THIS.refs.md_mab_confirm4 && THIS.refs.md_mab_confirm4.show()
    } else {
      const tokenContractAddress = selectedAirdrop.contractAddress
      console.log('selectedAirdrop123', selectedAirdrop)
      // THIS.props.clickOpenAirdrop721()

      if (selectedAirdrop && (selectedAirdrop.is721Drop || selectedAirdrop.is721DropV1 || selectedAirdrop.is721DropV2)) {
        THIS.refs.md_mab_confirmGacha && THIS.refs.md_mab_confirmGacha.hide()
        THIS.refs.md_mab_confirm2 && THIS.refs.md_mab_confirm2.show()
        THIS.setState({
          isGetting721: true,
          timeRequestGacha: 5 // set seconds time for watting to get gacha drop
        })
        let contract
        let toggle
        if (selectedAirdrop.is721DropV2) {
          contract = await getGachaAirdrop(AirdropABI721v2, tokenContractAddress)
          toggle = contract.methods.getAward(selectedAirdrop.airdropId)
        } else {
          contract = await getGachaAirdrop(AirdropABI721, tokenContractAddress)
          toggle = contract.methods.getAward()
        }
        const withDrawData = toggle && toggle.encodeABI()
        console.log('withDrawData', withDrawData)
        console.log('clickAirDropGacha---history1', THIS.state.history721)
        sendAirdropTxs721(mainAccount.privateKey, tokenContractAddress, withDrawData, gasInput)
          .then(async (res) => {
            console.log('clickAirDropGacha', res)
            DexAPI.triggerGetEtherTransactions(mainAccount.address)
            let txID = await OxObject.awaitTransactionMinedAsync(res.txID)
            let result = {}
            if (txID && txID.status) {
              if (selectedAirdrop.is721DropV1 || selectedAirdrop.is721DropV2) {
                result = await NagemonAPI.getRewardAirdropSub(res.txID)
              } else {
                result = await NagemonAPI.getHistoryByHash(res.txID)
              }
            }
            console.log('clickAirDropGacha---result', result)
            if (result && result.result) {
              let notice = t('gachaNoti')
              showNotification(notice, t)
              THIS.refs.md_mab_confirm2 && THIS.refs.md_mab_confirm2.hide()
              THIS.refs.md_mab_confirm3 && THIS.refs.md_mab_confirm3.hide()
              THIS.refs.md_mab_confirm4 && THIS.refs.md_mab_confirm4.hide()
              console.log('clickAirDropGacha---history2', THIS.state.history721)
              let randomFailGacha = Number(Math.floor(Math.random() * 2))
              console.log('randomFailGacha1: ', randomFailGacha)
              if (!THIS.state.history721 && THIS._isMounted) {
                console.log('forcheck1: ')
                console.log('forcheck2: ')
                if (selectedAirdrop.is721DropV1 || selectedAirdrop.is721DropV2) {
                  console.log('forcheck3: ')
                  let numAudio
                  let takeAwardGamev2 = {}
                  if (result.award === -1) {
                    audio3[randomFailGacha].play()
                    numAudio = randomFailGacha
                  } else {
                    if (result.award === 1) {
                      audio3[3].play()
                      numAudio = 3
                    }
                    if (result.award !== 1) {
                      audio3[2].play()
                      numAudio = 2
                    }
                  }
                  console.log('forcheck4: ')
                  takeAwardGamev2.image = (result.award === -1) ? null : (selectedAirdrop && selectedAirdrop.prize[result.award - 1].image)
                  takeAwardGamev2.numAudio = numAudio
                  takeAwardGamev2.amount = result.awardAmount
                  takeAwardGamev2.name = result.awardName
                  THIS.setState({ 
                    awardGamev2: takeAwardGamev2,
                    isGetting721: false,
                    timeRequestGacha: 0
                  }, () => {
                    console.log('awardGamev2', THIS.state.awardGamev2)
                    console.log('takeAwardGamev2', takeAwardGamev2)
                    THIS.forceUpdate()
                  })
                  THIS.props.clickOpenAirdrop721()
                  THIS.props.getDeadlineAllGacha()
                  await NagemonAPI.putHistoryByHashSub(result.trnx, true)
                } else {
                  console.log('forcheck5: ')
                  THIS.setState({ 
                    awardGamev2: {}
                  })
                  if (result.award === 0 || result.award === 1 || result.award === 2) {
                    audio2.play()
                  } else {
                    audio1.play()
                  }
                  await NagemonAPI.putHistoryByHash(result.trnx, true)
                  if (selectedAirdrop.airdrop_awards && selectedAirdrop.airdrop_awards[0] &&
                    result.awardName.toLowerCase() === selectedAirdrop.airdrop_awards[0].name.toLowerCase() && 
                    Number(result.awardAmount) === Number(selectedAirdrop.airdrop_awards[0].amount)) { 
                    THIS.setState({
                      awardImage: 1
                    })
                  } else if (selectedAirdrop.airdrop_awards && selectedAirdrop.airdrop_awards[1] &&
                    result.awardName.toLowerCase() === selectedAirdrop.airdrop_awards[1].name.toLowerCase() && 
                    Number(result.awardAmount) === Number(selectedAirdrop.airdrop_awards[1].amount)) { 
                    THIS.setState({
                      awardImage: 2
                    })
                  } else if (selectedAirdrop.airdrop_awards && selectedAirdrop.airdrop_awards[2] &&
                    result.awardName.toLowerCase() === selectedAirdrop.airdrop_awards[2].name.toLowerCase() && 
                    Number(result.awardAmount) === Number(selectedAirdrop.airdrop_awards[2].amount)) { 
                    THIS.setState({
                      awardImage: 3
                    })
                  } else if (selectedAirdrop.airdrop_awards && selectedAirdrop.airdrop_awards[3] &&
                    result.awardName.toLowerCase() === selectedAirdrop.airdrop_awards[3].name.toLowerCase() && 
                    Number(result.awardAmount) === Number(selectedAirdrop.airdrop_awards[3].amount)) { 
                    THIS.setState({
                      awardImage: 4
                    })
                  } else {
                    THIS.setState({
                      awardImage: 5
                    })
                  }
                  THIS.setState({ 
                    awardGame: {
                      amount: result.awardAmount,
                      name: result.awardName
                    },
                    isGetting721: false,
                    timeRequestGacha: 0
                  }, () => {
                    console.log('awardGame', THIS.state.awardGame)
                    THIS.props.clickOpenAirdrop721()
                    THIS.props.getDeadlineAllGacha()
                  })
                }
                console.log('getHistoryByHash', result)
                
              }
            } else {
              THIS.setState({
                isGetting721: false,
                isErrorGas: true
              })
              // swal({
              //   width: '250px',
              //   text: t('RequestFail'),
              //   type: 'error',
              //   showConfirmButton: false
              // })
              THIS.refs.md_mab_confirm2 && THIS.refs.md_mab_confirm2.hide()
              THIS.refs.md_mab_confirm3 && THIS.refs.md_mab_confirm3.hide()
              THIS.refs.md_mab_confirm4 && THIS.refs.md_mab_confirm4.show()
            }
            let indexAirdrop = arrAirdrop.findIndex(e => e._id === selectedAirdrop._id)
            arrAirdrop[indexAirdrop].isEnabledRequest = false
            dispatch(setAirdrop(arrAirdrop))
            THIS.forceUpdate()
          })
          .catch((err) => {
            console.log('clickAirDropGacha-err: ', err)
            THIS.setState({
              isGetting721: false,
              isErrorGas: true
            })
            // swal({
            //   width: '250px',
            //   text: t('RequestFail'),
            //   type: 'error',
            //   showConfirmButton: false
            // })
            THIS.refs.md_mab_confirm2 && THIS.refs.md_mab_confirm2.hide()
            THIS.refs.md_mab_confirm3 && THIS.refs.md_mab_confirm3.hide()
            THIS.refs.md_mab_confirm4 && THIS.refs.md_mab_confirm4.show()
          })
      } else {
        sendAirdropTxs(mainAccount.privateKey, tokenContractAddress)
          .then((res) => {
            console.log('clickAirDrop', res)
            DexAPI.triggerGetEtherTransactions(mainAccount.address)
            swal({
              width: '250px',
              text: t('AirDropRequested'),
              type: 'success',
              timer: 5000,
              showConfirmButton: false
            })
            let indexAirdrop = arrAirdrop.findIndex(e => e._id === selectedAirdrop._id)
            arrAirdrop[indexAirdrop].isEnabledRequest = false
            dispatch(setAirdrop(arrAirdrop))
            THIS.forceUpdate()
          })
          .catch((err) => {
            console.log('clickAirDrop: ', err)
            swal({
              width: '250px',
              text: t('RequestFail'),
              type: 'error',
              showConfirmButton: false
            })
          })
      }
        
    }
  }
}
export const click2AirDrop = () => {
  return (dispatch, getState) => {
    // THIS.refs.md_mab_confirm2 && THIS.refs.md_mab_confirm2.hide()
    // THIS.refs.md_mab_confirm3 && THIS.refs.md_mab_confirm3.show()
  }
}
export const click3AirDrop = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm2 && THIS.refs.md_mab_confirm2.hide()
    THIS.refs.md_mab_confirm3 && THIS.refs.md_mab_confirm3.hide()
  }
}
export const click4AirDrop = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirmGacha && THIS.refs.md_mab_confirmGacha.hide()
    THIS.refs.md_mab_confirm4 && THIS.refs.md_mab_confirm4.hide()
  }
}
export const onCancel2 = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm2 && THIS.refs.md_mab_confirm2.hide()
  }
}
export const onCancel3 = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm3 && THIS.refs.md_mab_confirm3.hide()
  }
}
export const onCancel4 = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm4 && THIS.refs.md_mab_confirm4.hide()
  }
}

export const clickOpenAirdrop721 = () => {
  return (dispatch, getState) => {
    THIS.refs.modalPriceAirdrop && THIS.refs.modalPriceAirdrop.show()
  }
}

export const clickOpenHistoryAirdrop721 = (prize, amount, name, hash, contractAddress, airdropId, is721DropV1, is721DropV2, prizeItem) => {
  return async (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const { awardGamev2, awardGame } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    let checkAddress
    let randomFailGacha = Math.floor(Math.random() * 2)
    console.log('randomFailGacha2: ', randomFailGacha)
    console.log('randomFailGacha2-awardGamev2: ', awardGamev2)
    console.log('randomFailGacha2-awardGame: ', awardGame)
    let numAudio
    let takeAwardGamev2 = {}
    if (is721DropV1 || is721DropV2) {
      if (prize === -1) {
        audio3[randomFailGacha].play()
        numAudio = randomFailGacha
      } else {
        if (prize === 1) {
          audio3[3].play()
          numAudio = 3
        }
        if (prize !== 1) {
          audio3[2].play()
          numAudio = 2
        }
      }
      takeAwardGamev2.image = prizeItem && prizeItem.image
      takeAwardGamev2.numAudio = numAudio
      takeAwardGamev2.amount = amount
      takeAwardGamev2.name = name
      THIS.setState({
        awardGamev2: takeAwardGamev2
      })
      await NagemonAPI.putHistoryByHashSub(hash, true)
      checkAddress = await NagemonAPI.getGachaHistorySub(mainAccount.address, contractAddress, 1, airdropId)
    } else {
      THIS.setState({
        awardGamev2: {},
        awardGame: {
          amount: amount,
          name: name
        }
      })
      if (prize === 0 || prize === 1 || prize === 2) {
        audio2.play()
      } else {
        audio1.play()
      }
      await NagemonAPI.putHistoryByHash(hash, true)
      checkAddress = await NagemonAPI.getHistoryByAddress(mainAccount.address, 1)
    }
    console.log('clickOpenHistoryAirdrop721-----', checkAddress)
    // let checkAddress = await NagemonAPI.getGachaHistorySub(mainAccount.address, contractAddress, pageNum, airdropId)
    THIS.setState({
      getHistoryPrize: (prize === -1) ? -1 : (prize + 1),
      getHistoryAmount: amount,
      getHistoryName: name
    }, () => {
      THIS.props.clickOpenAirdrop721()
    })
    setTimeout(() => {
      THIS.setState({
        hasMore: true,
        isLoadMore: false,
        pageNum: 1,
        listHistory: checkAddress.data || null
      })
    }, 8000)
    // THIS.refs.modalPriceAirdrop && THIS.refs.modalPriceAirdrop.show()
  }
}

/**
* @name : handleInput
* @param : mnemonic
* @description : Validate mnemonic type from users input
*/
export const clickOpenModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm.show()
  }
}

export const clickOpenModalGacha = (gachaCode = false) => {
  return async (dispatch, getState) => {
    let iRandom = Math.floor(Math.random() * 16)
    await THIS.props.fetchGasPrice()
    console.log('gachaCodegachaCode: ', gachaCode)
    if (THIS.props.localeData === 'jp') {
      THIS.setState({
        randomImages: Images.gachaRandomJP[iRandom],
        awardGame: {},
        awardImage: null,
        getHistoryPrize: null,
        getHistoryAmount: null,
        getHistoryName: null,
        gachaCode: !!gachaCode,
        getGachaCode: gachaCode,
        isGachaErr: false,
        valueGachaCode: ''
      })
    } else {
      THIS.setState({
        randomImages: Images.gachaRandomEN[iRandom],
        awardGame: {},
        awardImage: null,
        getHistoryPrize: null,
        getHistoryAmount: null,
        getHistoryName: null,
        gachaCode: !!gachaCode,
        getGachaCode: gachaCode,
        isGachaErr: false,
        valueGachaCode: ''
      })
    }
    THIS.refs.md_mab_confirmGacha.show()
  }
}

export const onChangeGachaCode = (e) => {
  return (dispatch, getState) => {
    THIS.setState({
      valueGachaCode: e
    })
    if (e === THIS.state.getGachaCode) {
      THIS.setState({
        isGachaErr: false
      })
    } else {
      THIS.setState({
        isGachaErr: true
      })
    }
    console.log('THIS.state.getGachaCode: ', THIS.state.getGachaCode)
  }
}

export const fetchGasPrice = () => {
  return async (dispatch) => {
    const { internetData } = THIS.props
    const { gasLimit } = THIS.state
    let getGas = await DappAPI.getSettingOther()
    console.log('getGasgetGasgetGas: ', getGas)
    let setGasPrice = {slowest: 1, slow: 2, medium: 3, fast: 4, fastest: 5}
    let gasPriceToShow = {slowest: 1, slow: 2, medium: 3, fast: 4, fastest: 5}
    if (getGas && getGas.others) {
      let getGasMedium = convertWeiToBalance(getGas.others.GWEI_GACHA) * 1000000000
      let getGasMediumGwei = getGas.others.GWEI_GACHA
      setGasPrice.slowest = getGasMedium * 0.5
      setGasPrice.slow = getGasMedium
      setGasPrice.medium = getGasMedium * 1.5
      setGasPrice.fast = getGasMedium * 2
      setGasPrice.fastest = getGasMedium * 2.5

      gasPriceToShow.slowest = convertWeiToBalance(convertBalanceToWei(getGasMedium * 0.5, 9) * gasLimit)
      gasPriceToShow.slow = convertWeiToBalance(convertBalanceToWei(getGasMedium, 9) * gasLimit)
      gasPriceToShow.medium = convertWeiToBalance(convertBalanceToWei(getGasMedium * 1.5, 9) * gasLimit)
      gasPriceToShow.fast = convertWeiToBalance(convertBalanceToWei(getGasMedium * 2, 9) * gasLimit)
      gasPriceToShow.fastest = convertWeiToBalance(convertBalanceToWei(getGasMedium * 2.5, 9) * gasLimit)
    }
    console.log('getGasgetGasgetGas: ', setGasPrice)
    if (internetData) {
      THIS.setState({
        gasPrice: setGasPrice,
        gasInput: setGasPrice.medium,
        gasPriceToShow: gasPriceToShow,
        transactionFee: convertWeiToBalance(convertBalanceToWei(setGasPrice.medium, 9) * gasLimit)
      })
    }
  }
}

export const handleChangeGasPriceAirdrop = (res) => {
  return (dispatch, getState) => {
    THIS.setState({
      gasInput: res.gasInput,
      transactionFee: res.transactionFee,
      sufficientEtherBalance: THIS.fWalletBalance - roundingNumber(res.transactionFee) >= 0 // check ether balance is enough or not
    }, () => checkOpenGetAirdrop())
  }
}

const checkOpenGetAirdrop = () => {
  // THIS.refs.md_mab_confirm.hide()
  // THIS.refs.md_mab_confirmGacha.hide()
}

/**
* @name : clickCancel
* @param :
* @description :
*/
export const clickCancel = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm.hide()
    THIS.refs.md_mab_confirmGacha.hide()
  }
}

export const onClickApplyForAirdrop = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isApplyForAirdrop: true,
      isMyAirdrop: false,
      isUpdateMyAirdrop: false
    })
  }
}

export const onClickMyAirdrop = (value) => {
  return (dispatch, getState) => {
    const { arrAirdrop } = THIS.props
    const { arrMyAirdrop } = THIS.state
    let newAirDrop = arrAirdrop.filter(e => (!e.isExpire && (!e.hasOwnProperty('isActive') || e.isActive)) || (!e.isExpire && e.is721Drop === true))
    THIS.setState({
      isMyAirdrop: value,
      isApplyForAirdrop: false,
      isUpdateMyAirdrop: false,
      tabSelected: TAB_SELECTED.AIRDROP,
      detailMyAirdrop: {},
      indexAirdrop: 0
    }, async () => {
      if (value) {
        THIS.props.selectedCellAirdrop(arrMyAirdrop[0] ? arrMyAirdrop[0] : null)
      } else {
        THIS.props.selectedCellAirdrop(newAirDrop[0] ? newAirDrop[0] : null)
      }
      if (arrMyAirdrop.length > 0) {
        for (let i = 0; i < arrMyAirdrop.length; i++) {
          let item = arrMyAirdrop[i]
          let contract = await getGachaAirdrop(AirdropABI, item.contractAddress)
          let remainingToken = await contract.methods.getRemainingToken().call()
          if (Number(remainingToken) <= 0 && Number(item.expire_time) > Date.now()) {
            item.isNotSendTokenToSmartContract = true
          } else {
            item.isNotSendTokenToSmartContract = false
          }
        }
        THIS.setState({
          arrMyAirdrop
        }, () => {
          THIS.forceUpdate()
        })
      }
    })
  }
}

export const onUpdateMyAirdrop = (value, item) => {
  return (dispatch, getState) => {
    THIS.setState({
      isUpdateMyAirdrop: value,
      isMyAirdrop: false,
      isApplyForAirdrop: true,
      isAddressErr: false,
      txtReceiveAddr: ''
    }, () => {
      THIS.props.getDetailUpdate(item)
    })
  }
}

export const onClickPauseAirdrop = () => {
  return (dispatch, getState) => {
    console.log('onClickPauseAirdrop')
    THIS.refs.modalNotificationPopupPause.show()
  }
}

export const handlePauseAirdrop = (item) => {
  return async (dispatch, getState) => {
    console.log('item', item)
    const { arrCardData, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)

    THIS.refs.modalNotificationPopupPause.hide()
    THIS.setState({
      loadingPause: true
    }, () => {
      pauseAirdrop(item.contractAddress, mainAccount.privateKey)
        .then((txID) => {
          THIS.props.updateDataAfterToggleAirdrop(txID)
        }).catch((err) => {
          console.log(err)
          THIS.setState({
            loadingPause: false
          })
          swal({
            width: '250px',
            text: t('AdvancedWallet.InsufficientTransactionFee'),
            type: 'error',
            showConfirmButton: false
          })
        })
    })

    // await contract.methods.toggle().call().then(() => {
    //   THIS.setState({
    //     loadingPause: false
    //   }, () => {
    //     console.log('loadingPause-handlePauseAirdrop2: ', loadingPause)
    //   })
    // })
  }
}

export const updateDataAfterToggleAirdrop = (txID) => {
  return async (dispatch, getState) => {
    const { detailMyAirdrop } = THIS.state
    const { t } = THIS.props
    console.log('awaitTransactionMinedAsync: ', txID)
    // waiting transaction in ethereum network
    const txReceipt = await OxObject.awaitTransactionMinedAsync(txID)
    console.log('txReceipt: ', txReceipt, txReceipt.logs)
    if (txReceipt && txReceipt.status === 1) { // transaction successfully
      detailMyAirdrop.stop = !detailMyAirdrop.stop
      THIS.setState({
        detailMyAirdrop,
        loadingPause: false
      })
    } else {
      THIS.setState({
        loadingPause: false
      })
      swal({
        width: '250px',
        text: t('RequestFail'),
        type: 'error',
        showConfirmButton: false
      })
    }
  }
}

export const onClickStopAirdrop = () => {
  return (dispatch, getState) => {
    console.log('onClickStopAirdrop')
    THIS.refs.modalNotificationPopupStop.show()
  }
}

export const handleStopAirdrop = () => {
  return (dispatch, getState) => {
    console.log('handleStopAirdrop')
  }
}

export const getDetailUpdate = (item) => {
  return async (dispatch, getState) => {
    let detailMyAirdrop = {}
    let contract = await getGachaAirdrop(AirdropABI, item.contractAddress)
    let stop = await contract.methods.stop().call()
    detailMyAirdrop.stop = stop
    let airDropAmount = await contract.methods.airDropAmount().call()
    let remainingToken = await contract.methods.getRemainingToken().call()
    let getTotalAirDroppedAmount = await contract.methods.getTotalAirDroppedAmount().call()
    if (!isNaN(Number(item.decimals))) {
      detailMyAirdrop.airDropAmount = convertWeiToBalance(airDropAmount, item.decimals)
      detailMyAirdrop.remainingToken = convertWeiToBalance(remainingToken, item.decimals)
      detailMyAirdrop.getTotalAirDroppedAmount = convertWeiToBalance(getTotalAirDroppedAmount, item.decimals)
    }
    let getTotalNumberOfAddressesReceivedAirDrop = await contract.methods.getTotalNumberOfAddressesReceivedAirDrop().call()
    detailMyAirdrop.getTotalNumberOfAddressesReceivedAirDrop = getTotalNumberOfAddressesReceivedAirDrop
    THIS.setState({
      detailMyAirdrop
    })
  }
}

export const cancelAirdrop = () => {
  return (dispatch, getState) => {
    THIS.refs.modalNotificationPopupPause.hide()
    THIS.refs.modalNotificationPopupWithdraw.hide()
  }
}

export const onCheckWithdraw = (value) => {
  return (dispatch, getState) => {
    let check = web3.utils.isAddress(value)
    THIS.setState({
      txtReceiveAddr: value,
      isAddressErr: !check
    })
  }
}

export const onClickWithdrawAirdrop = () => {
  return (dispatch, getState) => {
    console.log('onClickPauseAirdrop')
    THIS.refs.modalNotificationPopupWithdraw.show()
  }
}

export const handleWithdrawAirdrop = (item) => {
  return async (dispatch, getState) => {
    const { arrCardData, t } = THIS.props
    const { txtReceiveAddr } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    THIS.refs.modalNotificationPopupWithdraw.hide()
    THIS.setState({
      loadingWithdraw: true
    }, () => {
      withDrawAirdrop(item.contractAddress, txtReceiveAddr, mainAccount.privateKey)
        .then((txID) => {
          THIS.setState({
            txtReceiveAddr: ''
          })
          THIS.props.updateDataAfterWithdrawAirdrop(txID)
        })
        .catch((err) => {
          console.log(err)
          THIS.setState({
            loadingWithdraw: false
          })
          swal({
            width: '250px',
            text: t('AdvancedWallet.InsufficientTransactionFee'),
            type: 'error',
            showConfirmButton: false
          })
        })
    })
  }
}

export const updateDataAfterWithdrawAirdrop = (txID) => {
  return async (dispatch, getState) => {
    const { t } = THIS.props
    const { detailMyAirdrop } = THIS.state
    console.log('awaitTransactionMinedAsync: ', txID)
    // waiting transaction in ethereum network
    const txReceipt = await OxObject.awaitTransactionMinedAsync(txID)
    console.log('txReceipt: ', txReceipt, txReceipt.logs)
    if (txReceipt && txReceipt.status === 1) { // transaction successfully
      detailMyAirdrop.remainingToken = 0
      THIS.setState({
        detailMyAirdrop,
        loadingWithdraw: false
      })
      swal({
        width: '250px',
        text: t('withdrawSuccess'),
        type: 'success',
        timer: 5000,
        showConfirmButton: false
      })
    } else {
      THIS.setState({
        loadingWithdraw: false
      })
      swal({
        width: '250px',
        text: t('withdrawError'),
        type: 'error',
        showConfirmButton: false
      })
    }
  }
}

export const backToTop = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isApplyForAirdrop: false
    })
  }
}

export const sendTokenToSmartContract = (token) => {
  return (dispatch, getState) => {
    const { arrTokenData } = THIS.props
    let tokenFind = arrTokenData.find(e => e.address.toLowerCase() === token.erc20.toLowerCase())
    if (tokenFind) {
      tokenFind.airdropSmartContract = token.contractAddress
      Observer.emit(OBSERVER_KEY.SELECT_TAB_TOKEN)
      setTimeout(() => {
        Observer.emit(OBSERVER_KEY.SELECT_TAB_TOKEN_DETAIL, tokenFind)
      }, 100)
    } else {
      Observer.emit(OBSERVER_KEY.SELECT_TAB_TOKEN)
    }
  }
}

export const goToNagemon = () => {
  return (dispatch, getState) => {
    // const { arrDapps } = THIS.props
    let gameFind = 'https://nagemon.com/'
    // gameFind = arrDapps.find(e => e._id.toLowerCase() === '5ca422a617208e22b37fd92a')
    // console.log('goToNagemon123 ', gameFind)
    Observer.emit(OBSERVER_KEY.SELECT_TAB_DAPP)
    if (gameFind) {
      setTimeout(() => {
        Observer.emit(OBSERVER_KEY.SELECT_TAB_DAPP_TO_GACHA, gameFind)
      }, 500)
    }
  }
}

export const goToGame = (url) => {
  return (dispatch, getState) => {
    Observer.emit(OBSERVER_KEY.SELECT_TAB_DAPP)
    if (url) {
      setTimeout(() => {
        Observer.emit(OBSERVER_KEY.SELECT_TAB_DAPP_TO_GACHA, url)
      }, 500)
    }
  }
}

export const openExternalContract = (address) => {
  return (dispatch, getState) => {
    openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}address/${address}`)
  }
}

export const openExternalPending = () => {
  return (dispatch, getState) => {
    // openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}address/${mainAccount.address}`)
    openBrowserInNewTab(`https://etherscan.io/chart/pendingtx`)
  }
}

export const openTransactionHistory = () => {
  return (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}address/${mainAccount.address}`)
  }
}

export const openViewTransaction = (txHash) => {
  return (dispatch, getState) => {
    openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}tx/${txHash}`)
  }
}

export const openWinnerList = () => {
  return async (dispatch, getState) => {
    THIS.refs.modalWinnerList && THIS.refs.modalWinnerList.show()
    let winnerList = await NagemonAPI.getListWinner()
    if (winnerList) {
      // getWinnerList = winnerList.slice(0, 2)
      THIS.setState({
        getWinnerList: winnerList,
        isLoadingWinnerList: false
      })
    }
    console.log('winnerListwinnerListwinnerList: ', winnerList)
  }
}

export const openWinnerListSub = (item) => {
  return async (dispatch, getState) => {
    THIS.refs.modalWinnerList && THIS.refs.modalWinnerList.show()
    let winnerList = await NagemonAPI.getListWinnerSub(item.address, item.airdropId)
    if (winnerList) {
      // getWinnerList = winnerList.slice(0, 2)
      THIS.setState({
        getWinnerList: winnerList,
        isLoadingWinnerList: false
      })
    }
    console.log('winnerListwinnerListwinnerList: ', winnerList)
    console.log('winnerListwinnerListwinnerList2222: ', item)
  }
}

export const openTransactionFee = () => {
  return (dispatch, getState) => {
    THIS.refs.modalTransactionFee && THIS.refs.modalTransactionFee.show()
  }
}

export const handleInfiniteOnLoad = () => {
  return (dispatch, getState) => {
    const { pageNum, hasMore, isLoadMore, totalNumGacha, listHistory, selectedAirdrop } = THIS.state
    const { arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    console.log('gacha-handleInfiniteOnLoad', selectedAirdrop)
    if (isLoadMore || !hasMore) return
    // Handle load more
    THIS.setState({
      isLoadMore: true
    }, async () => {
      if (totalNumGacha <= pageNum * NUM_PAGE_GACHA) {
        THIS.setState({
          hasMore: false,
          isLoadMore: false
        })
      } else {
        let checkAddress
        if (selectedAirdrop && (selectedAirdrop.is721DropV2 || selectedAirdrop.is721DropV1)) { 
          checkAddress = await NagemonAPI.getGachaHistorySub(mainAccount.address, selectedAirdrop.contractAddress, pageNum + 1, selectedAirdrop.airdropId)
        } else {
          checkAddress = await NagemonAPI.getHistoryByAddress(mainAccount.address, pageNum + 1)
        }
        if (checkAddress) {
          THIS.setState({
            totalNumGacha: checkAddress.itemsCount,
            pageNum: pageNum + 1,
            hasMore: true,
            isLoadMore: false,
            listHistory: listHistory.concat(checkAddress.data)
          }, () => {
            console.log('listHistory--listHistory', THIS.state.listHistory)
          })
        } else {
          THIS.setState({
            hasMore: false,
            isLoadMore: false
          })
        }
      }
    })
  }
}

export const saveGasFee = (res) => {
  return (dispatch, getState) => {
    THIS.setState({
      gasInput: res.gasInput,
      transactionFee: res.transactionFee,
      getGasFee: res.perValue || 50
    })
  }
}
