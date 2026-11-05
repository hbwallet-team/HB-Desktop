import NagemonAPI from 'Backend/Api/services/NagemonAPI'
import OxObject from 'Utils/OxObject'
import { setCard, setDapps, setPendingTx, setDappMediaNews, setDappFavorite } from 'Backend/Redux/actions/globalActions'
import { showNotification, logDebugChatwork, openBrowserInSameTab } from 'Utils/globalFunction'
import { GA_ID, APP_ENVIROMENT } from 'Utils/globalConstants'
import { filter, includes } from 'lodash'
import ReduxServices from 'Utils/globalRedux'
import DexAPI from 'Backend/Api/services/DexAPI'
import ReactGA from 'react-ga'
const SCREEN_WIDTH = 1280
const SCREEN_HEIGHT = 790
const SCREEN_HEIGHT_WIN = 857
const SCREEN_WIDTH_WIN = 1320
const electron = window.require('electron')
let secondWindow
let convert = require('xml-js')
const urlMetadata = require('url-metadata')
const getWidth = window.innerWidth

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    try {
      const { internetData, arrDapps } = THIS.props
      if (internetData) {
        if (arrDapps && arrDapps.length > 0) {
          // let arrTopAppShuffleArray = shuffleArray(filterTopApp(arrDapps))
          // let arrListHotTopShuffleArray = shuffleArray(filterListHotTop(arrDapps))
          THIS.setState({
            arrListApp: arrDapps.filter(i => !i.isDeleted && i.rank && i.iconUrl && i.iconUrl.trim() !== '').sort((a, b) => a.rank > b.rank ? 1 : -1),
            // arrTopApp: arrTopAppShuffleArray,
            // arrListHotTop: arrListHotTopShuffleArray,
            arrListGenre: filterListGenre(arrDapps),
            arrMyDapps: filterMyDapps(arrDapps),
            isLoading: false,
            isLoadingMyDapps: false
          }, () => {
            // runGAForFirstTime(arrTopAppShuffleArray, 3, 2, false)
            // runGAForFirstTime(arrListHotTopShuffleArray, 10, 6, true)
          })
        }
        // fetch list Dapps from server
        let newArrDapps = await NagemonAPI.getDappList()
        if (newArrDapps && newArrDapps.data && newArrDapps.data.length > 0) { // case of get new data
          // store data to local
          // let arrTopAppShuffleArray = shuffleArray(filterTopApp(newArrDapps.data))
          // let arrListHotTopShuffleArray = shuffleArray(filterListHotTop(newArrDapps.data))
          dispatch(setDapps(newArrDapps.data))
          THIS.setState({
            arrListApp: newArrDapps.data.filter(i => !i.isDeleted && i.rank && i.iconUrl && i.iconUrl.trim() !== '').sort((a, b) => a.rank > b.rank ? 1 : -1),
            // arrTopApp: arrTopAppShuffleArray,
            // arrListHotTop: arrListHotTopShuffleArray,
            arrListGenre: filterListGenre(newArrDapps.data),
            arrMyDapps: filterMyDapps(newArrDapps.data),
            isLoading: false,
            isLoadingMyDapps: false
          }, () => {
            // runGAForFirstTime(arrTopAppShuffleArray, 3, 2, false)
            // runGAForFirstTime(arrListHotTopShuffleArray, 10, 6, true)
          })
        }
      }
    } catch (err) {
      THIS.setState({ 
        isLoading: false,
        isLoadingMyDapps: false
      })
      logDebugChatwork('DappScreen loadingInitial', err)
    }
  }
}

export const onChangeSearchKeyword = (value) => {
  return (dispatch, getState) => {
    try {
      const { arrDapps } = THIS.props
      THIS.setState({
        strSearch: value
      }, () => {
        THIS.setState({
          arrSearch: value.trim() !== '' ? filterDapp(arrDapps) : null
        })
      })
    } catch (err) {
      logDebugChatwork('onChangeSearchKeyword', err)
    }
  }
}

const filterTopApp = (listApp) => {
  if (!listApp) return null
  const res = listApp.filter(i => i.top && !i.isDeleted).sort((a, b) => a.rank > b.rank ? 1 : -1)
  return res
}

const filterListHotTop = (listApp) => {
  if (!listApp) return null
  const res = listApp.filter(i => !i.top && !i.isDeleted && i.isHot).sort((a, b) => a.rank > b.rank ? 1 : -1)
  return res
}

const filterListGenre = (listApp) => {
  if (!listApp) return null
  const listGenreFilter = listApp.filter(i => i.genre.trim() !== '' && !i.isDeleted).map(item => item.genre).filter((value, index, self) => {
    return self.indexOf(value) === index
  })
  const newListGenre = listGenreFilter.slice()
  const idxOther = newListGenre.findIndex(i => i === 'Other' || i.trim() === '')
  if (idxOther !== -1) {
    newListGenre.splice(idxOther, 1)
  }
  if (idxOther !== -1) {
    newListGenre.push(listGenreFilter[idxOther])
  }
  return newListGenre
}

const filterDappGenre = (genre, listApp) => {
  if (!listApp) return null
  const res = listApp.filter(i => (i.genre === genre) && !i.top && !i.isDeleted && !i.isHot && i.iconUrl && i.iconUrl.trim() !== '').sort((a, b) => a.rank > b.rank ? 1 : -1)
  return res
}

const filterDappRanking = (listApp) => {
  if (!listApp) return null
  const res = listApp.filter(i => !i.isDeleted && i.rank && i.iconUrl && i.iconUrl.trim() !== '').sort((a, b) => a.rank > b.rank ? 1 : -1).slice(0, 50)
  return res
}

const filterDapp = (listApp) => {
  if (!listApp) return null
  const { strSearch } = THIS.state
  // search by keywords
  const dapps = filter(listApp, (item) => {
    return !item.isDeleted && item.iconUrl && item.iconUrl.trim() !== '' && includes(item.name.toLowerCase(), strSearch.toLowerCase())
  })
  return dapps
}

const filterMyDapps = (listApp) => {
  if (!listApp) return null
  const { dappFavorites } = THIS.props
  dappFavorites.map(i => {
    let listAppSort = listApp.sort((a, b) => a.rank > b.rank ? 1 : -1)
    let dappFind = listAppSort.find(e => e._id === i._id)
    if (dappFind) {
      i.avgRating = dappFind.avgRating
    }
  })
  return dappFavorites
}

export const handleSeeAll = (genre) => {
  return (dispatch, getState) => {
    try {
      const { arrDapps } = THIS.props
      THIS.setState({
        selectedGenre: genre,
        arrListAppGenre: filterDappGenre(genre, arrDapps)
      }, () => {
        THIS.setState({
          openDappGenreScreen: true
        })
      })
    } catch (err) {
      logDebugChatwork('handleSeeAll', err)
    }
  }
}

export const handleSeeAllHotTop = () => {
  return (dispatch, getState) => {
    try {
      const { arrDapps } = THIS.props
      THIS.setState({
        selectedHotTop: true,
        arrListAppGenre: filterListHotTop(arrDapps)
      }, () => {
        THIS.setState({
          openDappGenreScreen: true
        })
      })
    } catch (err) {
      logDebugChatwork('handleSeeAllHotTop', err)
    }
  }
}

export const backToTop = () => {
  return (dispatch, getState) => {
    THIS.setState({
      openDappGenreScreen: false,
      openDappSettingScreen: false,
      openDappAssetScreen: false,
      openDappMarketScreen: false,
      selectedGenre: null,
      selectedHotTop: false,
      arrListAppGenre: [],
      isRanking: false
    })
  }
}

export const backToDappScreen = (itemName) => {
  return (dispatch, getState) => {
    try {
      const { arrDapps } = THIS.props
      const { strSearch } = THIS.state
      let itemFromDetail = arrDapps.filter(e => e.name.toLowerCase().replace(/\s+/g, '') === itemName.toLowerCase().replace(/\s+/g, ''))
      THIS.setState({
        openDappGenreScreen: false,
        openDappSettingScreen: false,
        openDappAssetScreen: false,
        openDappMarketScreen: false,
        selectedGenre: null,
        selectedHotTop: false,
        arrListAppGenre: [],
        isRanking: false,
        dappLink: (itemFromDetail[0] && itemFromDetail[0].homepage) || strSearch,
        itemFromDetail: itemFromDetail[0],
        detailToGame: !!itemFromDetail[0]
      })
    } catch (err) {
      logDebugChatwork('backToDappScreen', err)
    }
  }
}

export const backHome = () => {
  return (dispatch, getState) => {
    THIS.setState({
      dappLink: '',
      strSearch: '',
      arrSearch: null,
      arrListApp: [],
      arrTopApp: [],
      arrListGenre: [],
      selectedGame: null,
      isRanking: false,
      isSwitchPlay: false,
      isLoading: true,
      isLoadingMyDapps: true,
      openDappGenreScreen: false,
      selectedGenre: null,
      selectedHotTop: false,
      arrListAppGenre: [],
      detailToGame: false
    }, () => {
      THIS.props.loadingInitial()
    })
  }
}

export const onClickRanking = () => {
  return (dispatch, getState) => {
    try {
      const { arrDapps, t } = THIS.props
      THIS.setState({
        isRanking: true,
        selectedGenre: t('Dapps.ranking'),
        arrListAppGenre: filterDappRanking(arrDapps)
      }, () => {
        THIS.setState({
          openDappGenreScreen: true
        })
      })
    } catch (err) {
      logDebugChatwork('onClickRanking', err)
    }
  }
}

export const onClickSetting = () => {
  return (dispatch, getState) => {
    THIS.setState({
      openDappSettingScreen: true
    })
  }
}

export const onClickAsset = () => {
  return (dispatch, getState) => {
    THIS.setState({
      openDappAssetScreen: true
    })
  }
}

export const onClickMarket = () => {
  return (dispatch, getState) => {
    THIS.setState({
      openDappMarketScreen: true
    })
  }
}

export const openDapp = (item) => {
  return (dispatch, getState) => {
    const { strSearch } = THIS.state
    THIS.setState({
      selectedGame: item,
      dappLink: (item && item.homepage) || strSearch,
      isSwitchPlay: true
    })
  }
}

export const openDappGacha = (url) => {
  return (dispatch, getState) => {
    THIS.setState({
      dappLink: url || 'https://nagemon.com',
      isSwitchPlay: true,
      detailToGame: false
    })
  }
}

export const handleSearchOnWeb = () => {
  return (dispatch) => {
    const { strSearch } = THIS.state
    THIS.setState({
      dappLink: strSearch,
      isSwitchPlay: true
    })
  }
}

export const updateDataAfterBuyDappItem = () => {
  return async (dispatch, getState) => {
    try {
      const { pendingTx, t } = THIS.props
      const { selectedGame } = THIS.state
      console.log('awaitTransactionMinedAsync: ', pendingTx.lastTxID)
      // update status of tracking transanction to pending
      setTimeout(() => {
        ReduxServices.clearTrackingTxs(pendingTx.lastTxID)
      }, 5000)

      // waiting transaction in ethereum network
      const txReceipt = await OxObject.awaitTransactionMinedAsync(pendingTx.lastTxID)
      console.log('txReceipt: ', txReceipt, txReceipt.logs)
      if (txReceipt && txReceipt.status === 1) { // transaction successfully
        // update pending status
        pendingTx.isPending = false
        dispatch(setPendingTx(pendingTx))

        // refresh dapp assets
        ReduxServices.refreshDappAssests()

        const { arrCardData } = getState()

        // update transaction history
        ReduxServices.refreshEtherTxsHistory(pendingTx.account)

        // update transaction history for all account
        ReduxServices.refreshEtherTxsHistoryAll(arrCardData.filter(card => card.isEnable), false)

        // update card balance
        ReduxServices.refreshCardBalance(arrCardData)

        // specify notice message
        let notice = t('Dapps.purchaseItemSuccessfully', { name: selectedGame ? selectedGame.name : 'Dapp' })

        // show notification to notice user
        showNotification(notice, t)
      } else { // transaction failed
        ReduxServices.clearTrackingTxs()
      }
    } catch (err) {
      ReduxServices.clearTrackingTxs()
      logDebugChatwork('updateDataAfterBuyDappItem', err)
    }
  }
}

export const openNewWindow = () => {
  return (dispatch) => {
    try {
      // if (process.platform === 'darwin') {
      secondWindow = new electron.remote.BrowserWindow({
        width: SCREEN_WIDTH,
        minWidth: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        minHeight: SCREEN_HEIGHT,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          webviewTag: true
        },
        title: 'HB WALLET DESKTOP',
        x: Math.floor(Math.random() * (+300 - +0)) + +0,
        y: Math.floor(Math.random() * (+300 - +0)) + +0
      })
      // } else {
      //   secondWindow = new electron.remote.BrowserWindow({
      //     width: SCREEN_WIDTH_WIN,
      //     minWidth: SCREEN_WIDTH_WIN,
      //     height: SCREEN_HEIGHT_WIN,
      //     minHeight: SCREEN_HEIGHT_WIN,
      //     webPreferences: {
      //       webSecurity: false
      //     },
      //     title: 'HB WALLET DESKTOP',
      //     x: Math.floor(Math.random() * (+300 - +0)) + +0,
      //     y: Math.floor(Math.random() * (+300 - +0)) + +0
      //   })
      // }

      const currentUrl = electron.remote.getCurrentWindow().getURL()
      let index = currentUrl.indexOf('localhost:3000') + 14
      if (process.env.NODE_ENV === 'production') {
        index = currentUrl.indexOf('build/index.html') + 16
      }
      let rootUrl = currentUrl.substr(0, index)
      secondWindow.loadURL(`${rootUrl}#/dappScreen`)
      secondWindow.webContents.on('did-finish-load', () => {
        secondWindow.show()
        secondWindow.focus()
      })
      secondWindow.once('ready-to-show', () => {
        secondWindow.show()
      })
      secondWindow.on('closed', () => {
        secondWindow = null
      })
    } catch (err) {
      logDebugChatwork('openNewWindow', err)
    }
  }
}

export const triggerAddNewAccount = (event, data) => {
  return (dispatch, getState) => {
    if (data) {
      dispatch(setCard(data))
    }
  }
}

export const triggerImportAccount = (event, data) => {
  return (dispatch, getState) => {
    if (data) {
      dispatch(setCard(data))
    }
  }
}

export const triggerSwitchedAccount = (event, data) => {
  return (dispatch, getState) => {
    if (data) {
      ReduxServices.switchAccount(data)
    }
  }
}

export const triggerEditAccount = (event, data) => {
  return (dispatch, getState) => {
    if (data) {
      dispatch(setCard(data))
    }
  }
}

export const triggerDeletedAccount = (event, data) => {
  return (dispatch, getState) => {
    if (data) {
      dispatch(setCard(data))
    }
  }
}

export const triggerAddFavorites = (event, data) => {
  return (dispatch) => {
    console.log('triggerAddFavorites', data)
    THIS.setState({
      arrMyDapps: data
    }, () => {
      dispatch(setDappFavorite(data))
    })
  }
}

export const triggerResetWallet = (event, data) => {
  return (dispatch) => {
    let allWindows = electron.remote.BrowserWindow.getAllWindows()
    if (allWindows.length > 0) {
      allWindows = allWindows.filter(w => w.id !== 1) // remove main window
      allWindows.map(w => {
        w.destroy()
      })
    }
  }
}

export const getDappsmarket = () => {
  return async (dispatch) => {
    try {
      let xml = await DexAPI.getDappsmarket()
      let result1 = convert.xml2json(xml, { compact: true, spaces: 4 })
      let result2 = JSON.parse(result1)
      if (result2 && result2.rss && result2.rss.channel && result2.rss.channel.item) {
        let getLength = result2.rss.channel.item.length
        let arrMediaFromUrl = []
        for (let i = 0; i < getLength; i++) {
          let itemMedia = {}
          itemMedia.title = result2.rss.channel.item[i].title._text
          itemMedia.pubDate = result2.rss.channel.item[i].pubDate._text
          itemMedia.description = result2.rss.channel.item[i].description._cdata
          itemMedia.link = result2.rss.channel.item[i].link._text
          let metadata = await urlMetadata(result2.rss.channel.item[i].link._text)
          if (metadata) {
            itemMedia.image = metadata.image
          } else {
            itemMedia.image = ''
          }
          arrMediaFromUrl.push(itemMedia)
          if ((i > 2 && getLength > 3) || (i <= 2 && getLength <= 3)) {
            THIS.setState({
              arrMedia: arrMediaFromUrl,
              isLoadingMedia: false
            }, () => {
              THIS.forceUpdate()
            })
          }
        }
        dispatch(setDappMediaNews(arrMediaFromUrl))
      } else {
        THIS.setState({
          isLoadingMedia: false
        })
      }
    } catch (err) {
      THIS.setState({
        isLoadingMedia: false
      })
      logDebugChatwork('getDappsmarket', err)
    }
  }
}

export const getUnblock = () => {
  return async (dispatch) => {
    try {
      let data = await DexAPI.getUnblock()
      if (data && data.length && data.length > 0) {
        let getLength = data.length
        if (getLength > 10) {
          getLength = 10
        }
        for (let i = 0; i < getLength; i++) {
          let dataUnblockContent = data[i].post_content.replace(/(<([^>]+)>)/ig, '')
          data[i].post_content = dataUnblockContent
        }
        THIS.setState({
          isLoadingUnblockNews: false,
          arrUnblock: data
        })
      } else {
        THIS.setState({
          isLoadingUnblockNews: false
        })
      }
    } catch (err) {
      THIS.setState({
        isLoadingUnblockNews: false
      })
      logDebugChatwork('getUnblock', err)
    }
  }
}

export const fetchTotalSync = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    if (internetData) {
      ReduxServices.refreshTotalSync()
    }
  }
}

const slideToUpdateGA = (indexSlide, arrOfList, numberWidthMax, numberWidthMin, slidesToScroll = false, HotTop = false) => {
  try {
    if (arrOfList && arrOfList[0]) {
      let itemsShow = numberWidthMin
      if (getWidth > 1600) {
        itemsShow = numberWidthMax
        if (numberWidthMax > arrOfList.length) {
          itemsShow = arrOfList.length
        }
      } else {
        if (numberWidthMin > arrOfList.length) {
          itemsShow = arrOfList.length
        }
      }
      let slidePerNumber = indexSlide + itemsShow
      if (slidePerNumber > arrOfList.length) {
        let slidePerNumberLoop = slidePerNumber - arrOfList.length
        slidePerNumber = arrOfList.length
        // The code below will send the top item of list to google analitics because this slide is infinity
        if (slidesToScroll === 1) {
          for (let i = 0; i < slidePerNumberLoop; i++) {
            if (HotTop) {
              GAHotTop(arrOfList[i].name, arrOfList[i].description)
            } else {
              GATopAppItem(arrOfList[i].name, arrOfList[i].description)
            }
          }
          for (let i = indexSlide; i < slidePerNumber; i++) {
            if (HotTop) {
              GAHotTop(arrOfList[i].name, arrOfList[i].description)
            } else {
              GATopAppItem(arrOfList[i].name, arrOfList[i].description)
            }
          }
        } else {
          for (let i = (arrOfList.length - itemsShow); i < arrOfList.length; i++) {
            if (HotTop) {
              GAHotTop(arrOfList[i].name, arrOfList[i].description)
            } else {
              GATopAppItem(arrOfList[i].name, arrOfList[i].description)
            }
          }
        }
      } else {
        for (let i = indexSlide; i < slidePerNumber; i++) {
          if (HotTop) {
            GAHotTop(arrOfList[i].name, arrOfList[i].description)
          } else {
            GATopAppItem(arrOfList[i].name, arrOfList[i].description)
          }
        }
      }
    }
  } catch (err) {
    logDebugChatwork('slideToUpdateGA', err)
  }
}

export const afterChangeTopAppItem = (currentSlide) => {
  return (dispatch, getState) => {
    const { arrTopApp } = THIS.state
    slideToUpdateGA(currentSlide, arrTopApp, 3, 2, 1, false)
  }
}

export const afterChangeHotTop = (currentSlide) => {
  return (dispatch, getState) => {
    const { arrListHotTop } = THIS.state
    slideToUpdateGA(currentSlide, arrListHotTop, 10, 6, false, true)
  }
}

const runGAForFirstTime = (arrList, numberWidthMax, numberWidthMin, HotTop = false) => {
  try {
    if (arrList && arrList[0]) {
      let getLength = numberWidthMin
      if (getWidth > 1600) {
        getLength = numberWidthMax
        if (arrList.length < numberWidthMax) {
          getLength = arrList.length
        }
      } else {
        if (arrList.length < numberWidthMin) {
          getLength = arrList.length
        }
      }
      for (let i = 0; i < getLength; i++) {
        if (HotTop) {
          GAHotTop(arrList[i].name, arrList[i].description)
        } else {
          GATopAppItem(arrList[i].name, arrList[i].description)
        }
      }
    }
  } catch (err) {
    logDebugChatwork('runGAForFirstTime', err)
  }
}

const GATopAppItem = (name, description) => {
  ReactGA.initialize(GA_ID)
  ReactGA.event({
    category: 'DAPPS - TOP APP',
    action: name,
    label: description
  })
}

const GAHotTop = (name, description) => {
  ReactGA.initialize(GA_ID)
  ReactGA.event({
    category: 'DAPPS - HOT LIST',
    action: name,
    label: description
  })
}

const shuffleArray = (array) => {
  let i = array.length - 1
  for (; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

export const handleRemoveFavorites = (item) => {
  return (dispatch) => {
    THIS.setState({
      selectedGame: item
    }, () => THIS.refs.md_remove_favorites.show())
  }
}

export const onCloseRemoveFavoriteModal = () => {
  return (dispatch) => {
    THIS.refs.md_remove_favorites.hide()
  }
}

export const onRemoveFavorites = () => {
  return (dispatch) => {
    const { dappFavorites } = THIS.props
    const { selectedGame } = THIS.state
    let newDappFavorite
    newDappFavorite = dappFavorites.filter(i => i.homepage.toLowerCase().replace(/\s+/g, '') !== selectedGame.homepage.toLowerCase().replace(/\s+/g, ''))
    newDappFavorite.sort((a, b) => a.rank > b.rank ? 1 : -1)
    THIS.setState({
      arrMyDapps: newDappFavorite
    }, () => {
      dispatch(setDappFavorite(newDappFavorite))
      THIS.refs.md_remove_favorites.hide()
    })
  }
}
