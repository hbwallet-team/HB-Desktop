import { setLanguage } from 'Backend/Redux/actions/globalActions'
import { triggerSendEventToAllWindow } from 'Utils/globalFunction'
let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
export const changeLanguage = (e) => {
  return (dispatch, getState) => {
    const { i18n } = THIS.props
    i18n.changeLanguage(THIS.data[e.target.value].language)
    dispatch(setLanguage(THIS.data[e.target.value].language))
    THIS.setState({value: e.target.value})
    triggerSendEventToAllWindow('change-language', THIS.data[e.target.value].language)
  }
}
