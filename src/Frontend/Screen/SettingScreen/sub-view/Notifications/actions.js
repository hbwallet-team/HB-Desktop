import { setReadNotiNew, setUnReadNoti } from 'Backend/Redux/actions/globalActions'
import DexAPI from 'Backend/Api/services/DexAPI'
import ReduxServices from 'Utils/globalRedux'
import { NUM_GET_NOTI } from 'Utils/globalConstants'

let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const loadingInitialData = () => {
  return async (dispatch, getState) => {
    const { readNotiNew, userAuth } = THIS.props
    await ReduxServices.refreshNoti()
    let notiItems = await DexAPI.getNoti(NUM_GET_NOTI, 0, userAuth.createdAt)
    if (notiItems && notiItems.notifications && notiItems.notifications.length > 0) {
      notiItems.notifications[0].firstHighlight = true
      notiItems.notifications.filter(val => {
        let check = !!readNotiNew[`${val._id}`]
        if (check) {
          val.dotUnRead = false
        } else {
          val.dotUnRead = true
        }
      })
      THIS.setState({
        viewing: '',
        notiItems,
        detailItems: notiItems.notifications[0],
        numberGameItem: notiItems.total,
        isLoadingMyRequests: false
      })
    } else {
      THIS.setState({
        isLoadingMyRequests: false
      })
    }
  }
}

export const onSocketNoti = (data) => {
  return (dispatch, getState) => {
    const { notiItems } = THIS.state
    let newNotiItems = notiItems
    if (data) {
      data.dotUnRead = true
      newNotiItems.notifications.unshift(data)
      THIS.setState({
        notiItems: newNotiItems,
        numberGameItem: notiItems.total + 1
      })
    }
  }
}

export const clickToReadNoti = (item) => {
  return async (dispatch, getState) => {
    const { unReadNoti, readNotiNew } = THIS.props
    const { notiItems } = THIS.state
    notiItems.notifications.map(val => {
      val.firstHighlight = false
    })
    THIS.setState({
      detailItems: item,
      viewing: item._id
    })
    let check = !!readNotiNew[`${item._id}`]
    console.log('clickToReadNoti--check: ', readNotiNew[`${item._id}`])
    let getReadNoti = readNotiNew
    if (!check) {
      if (!getReadNoti[`${item._id}`]) {
        getReadNoti[`${item._id}`] = true
      }
      dispatch(setReadNotiNew(getReadNoti))
      dispatch(setUnReadNoti(unReadNoti - 1))
    }
    // if (!readNoti.includes(item._id)) {
    //   readNoti.push(item._id)
    //   dispatch(setReadNotiNew(readNoti))
    //   dispatch(setUnReadNoti(unReadNoti - 1))
    // }
    notiItems.notifications.filter(val => {
      // if (readNoti.includes(val._id)) {
      //   val.dotUnRead = false
      // } else {
      //   val.dotUnRead = true
      // }
      let check1 = !check 
        ? !!getReadNoti[`${val._id}`]
        : !!readNotiNew[`${val._id}`]
      if (check1) {
        val.dotUnRead = false
      } else {
        val.dotUnRead = true
      }
    })
    THIS.setState({
      notiItems
    }, () => {
      THIS.forceUpdate()
    })
  }
}

export const readAll = () => {
  return async (dispatch, getState) => {
    const { userAuth } = THIS.props
    const { notiItems } = THIS.state
    let getAllId = {}
    let res = await DexAPI.getNoti(0, 0, userAuth.createdAt)
    if (res && res.notifications && res.notifications.length > 0) {
      res.notifications.map(val => {
        val.dotUnRead = false
        if (!getAllId[`${val._id}`]) {
          getAllId[`${val._id}`] = true
        }
      })
      dispatch(setReadNotiNew(getAllId))
      dispatch(setUnReadNoti(0))
    }
    if (notiItems && notiItems.notifications && notiItems.notifications.length > 0) {
      notiItems.notifications.map(val => {
        val.dotUnRead = false
      })
      THIS.setState({
        notiItems
      })
    }
  }
}

export const handleInfiniteOnLoadNoti = () => {
  return (dispatch, getState) => {
    const { pageNum, hasMore, isLoadMore, numberGameItem, notiItems } = THIS.state
    const { readNotiNew, userAuth } = THIS.props
    if (isLoadMore || !hasMore) return
    // Handle load more
    THIS.setState({
      isLoadMore: true
    }, async () => {
      if (numberGameItem <= (pageNum * NUM_GET_NOTI)) {
        THIS.setState({
          hasMore: false,
          isLoadMore: false
        })
      } else {
        DexAPI.getNoti(NUM_GET_NOTI, (pageNum * NUM_GET_NOTI), userAuth.createdAt)
          .then((newNotiRequest) => {
            newNotiRequest.notifications.filter(val => {
              let check = !!readNotiNew[`${val._id}`]
              if (check) {
                val.dotUnRead = false
              } else {
                val.dotUnRead = true
              }
            })
            notiItems.notifications = notiItems.notifications.concat(newNotiRequest.notifications)
            THIS.setState({
              notiItems
            }, () => {
              THIS.setState({
                pageNum: pageNum + 1,
                hasMore: true,
                isLoadMore: false
              })
            })
          })
          .catch((err) => {
            console.log(err)
            THIS.setState({
              hasMore: false,
              isLoadMore: false
            })
          })
      }
    })
  }
}
