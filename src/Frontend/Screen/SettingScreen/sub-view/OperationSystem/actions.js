import { setLanguage } from 'Backend/Redux/actions/globalActions'
let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
