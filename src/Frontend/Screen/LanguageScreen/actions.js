import { setLanguage } from 'Backend/Redux/actions/globalActions'
export const routeToMainScreen = (language, props) => {
  return (dispatch, getState) => {
    const {i18n, history} = props
    i18n.changeLanguage(language)
    dispatch(setLanguage(language))
    history.push('/mainScreen')
  }
}
