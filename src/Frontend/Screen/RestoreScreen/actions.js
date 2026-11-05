// import { validateSpace } from 'Utils/globalFunction'
import bip39 from 'bip39'
import swal from 'sweetalert2'
import { setMnemonic } from 'Backend/Redux/actions/mainActions'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const handleBackRoute = () => {
  return (dispatch, getState) => {
    dispatch(setMnemonic(''))
    THIS.props.history.push('/mainScreen')
  }
}

/**
* NAME: handleSubmit
* Handle submit mnemonic to term of service page
*/
export const handleSubmit = () => {
  return (dispatch, getState) => {
    const { strMnemonic } = THIS.state
    const { history, t } = THIS.props
    // Checking Mnemonic type
    if (bip39.validateMnemonic(strMnemonic)) {
      dispatch(setMnemonic(strMnemonic))
      // Redirect to TermOfServices
      history.push('/termsServiceScreen/RestoreScreen')
    } else {
      // Show alert error when invalid mnemonic type
      swal({
        width: '250px',
        text: t('MnemonicError'),
        type: 'error',
        showConfirmButton: false
      })
    }
  }
}

/**
* NAME: validateInput
* Validate mnemonic type from users input
*/
export const validateInput = (e) => {
  return (dispatch, getState) => {
    // var newMnemonic = e.target.value.trim()
    // if (validateSpace(newMnemonic)) {
    THIS.setState({
      // strMnemonic: newMnemonic.replace(/ +/g, ' '),
      // disabledBtn: newMnemonic.trim().split(' ').length !== 12
      strMnemonic: e.target.value
      // disabledBtn: newMnemonic.split(' ').length !== 12
    })
    // } else {
    //   THIS.setState({ strMnemonic: '', disabledBtn: true })
    // }
  }
}
