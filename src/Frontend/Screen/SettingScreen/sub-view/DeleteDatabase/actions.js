import { deleteData } from 'Utils/globalFunction'
import swal from 'sweetalert2'

var THIS

export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const deleteDatabase = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm.show()
  }
}

export const confirmDelete = (getOldTranslate) => {
  return (dispatch, getState) => {
    const { history, i18n } = THIS.props
    deleteData(dispatch, i18n)
    history.push('/')
    swal({
      width: '250px',
      text: getOldTranslate,
      type: 'success',
      showConfirmButton: false,
      timer: 5000
    })
  }
}
export const hideMdConfirm = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm.hide()
  }
}

export const onCompleteInputPINCode = (value, THIS) => {
  return (dispatch, getState) => {
    const {countInput} = THIS.state
    const {t} = THIS.props
    const { arrPinCodeData } = getState()

    if (countInput === -1) {
      if (arrPinCodeData === value) {
        THIS.props.setIsActiveScreen(true)
      } else {
        THIS.setState({ isErrorCurrentPIN: true, txtError: t('PinCodeNotMatched') })
        setTimeout(() => {
          THIS.pin.clear()
        }, 100)
        THIS.pin.focus()
      }
    }
  }
}
