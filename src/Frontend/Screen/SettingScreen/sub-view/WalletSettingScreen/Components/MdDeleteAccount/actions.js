import ReduxServices from 'Utils/globalRedux'
import swal from 'sweetalert2'
import { triggerSendEventToAllWindow } from 'Utils/globalFunction'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const handleDeleteAccount = () => {
  return (dispatch, getState) => {
    const { cardSelected, onCloseModal, t } = THIS.props
    ReduxServices.deleteAccount(cardSelected).then((newCardData) => {
      swal({
        text: t('Ethereum.accountDeleted'),
        width: '250px',
        type: 'success',
        timer: 5000,
        showConfirmButton: false
      })
      // trigger send event to all windows
      triggerSendEventToAllWindow('deleted-account', newCardData)
      cardSelected.isMain && triggerSendEventToAllWindow('deleted-main-account', cardSelected)
    })
    onCloseModal()
  }
}
