import {setPINcode} from '../../../../../Backend/Redux/actions/globalActions'
import swal from 'sweetalert2'
import Images from '../../../../../Assets/Image'

let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
const SETUP = 'SetupPINCode'
// const CHANGE = 'ChangePINCode'
// const REMOVE = 'RemovePINCode'
// const CONFIRM = 'ConfirmPINCode'

export const funcInitLoadData = () => {
  return (dispatch, getState) => {
    const { parent } = THIS.props.match.params
    const { t } = THIS.props

    if (parent === SETUP) {
      THIS.setState({ countInput: 0, txtTitleInput: t('EnterCurrentPINCode') })
    } else {
      THIS.setState({ countInput: -1, txtTitleInput: t('EnterCurrentPINCode') })
    }
  }
}
export const onCompleteInputPINCode = (value) => {
  return (dispatch, getState) => {
    const {countInput, valueTemp, txtTitleSuccess} = THIS.state
    const { t } = THIS.props

    if (countInput === 0) {
      THIS.setState({ countInput: 1, txtTitleInput: t('ConfirmPinCode'), valueTemp: value })
      setTimeout(() => {
        THIS.pin.clear()
      }, 500)
      THIS.pin.focus()
    } else {
      if (valueTemp === value) {
        dispatch(setPINcode(valueTemp))
        THIS.setState({ isErrorConfirm: false, isSuccess: true, txtTitleSuccess: t('SetupPINCodeSuccessfully') })
        swal({
          text: t('SetupPINCodeSuccessfully'),
          showConfirmButton: false,
          width: '250px',
          type: 'success'
        })
      } else {
        THIS.setState({ isErrorConfirm: true })
        setTimeout(() => {
          THIS.pin.clear()
        }, 500)
        THIS.pin.focus()
      }
    }
  }
}
export const onChangeInputPINCode = (value) => {
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
