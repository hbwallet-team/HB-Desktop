import {setPINcode} from '../../../../../Backend/Redux/actions/globalActions'
import swal from 'sweetalert2'
import Images from '../../../../../Assets/Image'

let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const onCompleteInputPINCode = (value) => {
  return (dispatch, getState) => {
    const { arrPinCodeData } = getState()
    const { t } = THIS.props

    if (arrPinCodeData === value) {
      dispatch(setPINcode(''))
      THIS.setState({ isSuccess: true, isErrorCurrentPIN: false, txtTitleSuccess: t('RemovePinCodeSuccess') })
      swal({
        text: t('RemovePinCodeSuccess'),
        showConfirmButton: false,
        width: '320px',
        type: 'success'
      })
    } else {
      THIS.setState({ isSuccess: false, isErrorCurrentPIN: true })
      setTimeout(() => {
        THIS.pin.clear()
      }, 500)
      THIS.pin.focus()
    }
  }
}
export const onChangeInputPINCode = () => {
  return (dispatch, getState) => {

  }
}
export const onClickOutPINCode = (value) => {
  return (dispatch, getState) => {
    if (THIS.pin) {
      THIS.pin.clear()
      THIS.pin.focus()
    }
  }
}
