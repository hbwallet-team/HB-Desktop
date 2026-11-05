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
    const {countInput, valueTemp} = THIS.state
    const { t } = THIS.props
    const { arrPinCodeData } = getState()

    if (countInput === -1) {
      if (arrPinCodeData === value) {
        THIS.setState({
          countInput: 0,
          txtTitleInput: t('EnterNewPINCode'),
          valueTemp: value,
          isErrorCurrentPIN: false
        })
      } else {
        THIS.setState({ isErrorCurrentPIN: true, txtError: t('PinCodeNotMatched') })
      }
      setTimeout(() => {
        THIS.pin.clear()
      }, 100)
      THIS.pin.focus()
    } else if (countInput === 0) {
      THIS.setState({ countInput: 1, txtTitleInput: t('ConfirmInput'), valueTemp: value })
      setTimeout(() => {
        THIS.pin.clear()
      }, 100)
      THIS.pin.focus()
    } else {
      if (valueTemp === value) {
        dispatch(setPINcode(value))
        THIS.setState({ isErrorConfirm: false, isSuccess: true, txtTitleSuccess: t('ChangePINCodeSuccessfully') })
        swal({
          width: '250px',
          text: t('ChangePINCodeSuccessfully'),
          showConfirmButton: false,
          type: 'success'
        })
      } else {
        THIS.setState({ isErrorConfirm: true, txtError: t('PinCodeNotMatched') })
        setTimeout(() => {
          THIS.pin.clear()
        }, 100)
        THIS.pin.focus()
      }
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
