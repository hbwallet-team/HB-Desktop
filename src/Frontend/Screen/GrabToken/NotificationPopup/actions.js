import ReduxServices from 'Utils/globalRedux'
import swal from 'sweetalert2'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const handleSwitchAccount = () => {
  return (dispatch) => {
    const { cardSelected, onCloseModal, t } = THIS.props
    ReduxServices.switchAccount(cardSelected).then(() => {
      swal({
        width: '280px',
        text: t('Ethereum.switchAccountSuccess'),
        type: 'success',
        timer: 5000,
        showConfirmButton: false
      })
      // close modal
      onCloseModal()
    })
  }
}
