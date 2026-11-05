import { filter, includes } from 'lodash'
import { logDebugChatwork } from 'Utils/globalFunction'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const onChangeSearchKeyword = (value) => {
  return (dispatch, getState) => {
    try {
      const { arrListApp } = THIS.props
      THIS.setState({
        strSearch: value
      }, () => {
        THIS.setState({
          arrSearch: value.trim() !== '' ? filterDapp(arrListApp) : null
        })
      })
    } catch (err) {
      logDebugChatwork('onChangeSearchKeyword', err)
    }
  }
}

const filterDapp = (listApp) => {
  if (!listApp) return null
  const { strSearch } = THIS.state
  // search by keywords
  const dapps = filter(listApp, (item) => {
    return !item.isDeleted && item.iconUrl.trim() !== '' && includes(item.name.toLowerCase(), strSearch.toLowerCase())
  })
  return dapps
}
