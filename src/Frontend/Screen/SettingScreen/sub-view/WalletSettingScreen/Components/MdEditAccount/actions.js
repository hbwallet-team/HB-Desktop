import ReduxServices from 'Utils/globalRedux'
import swal from 'sweetalert2'
import { validateSpace, triggerSendEventToAllWindow, checkKanjiCharacter } from 'Utils/globalFunction'
import { LIMIT_NUMBER } from 'Utils/globalConstants'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const onChangeAccountName = (newAccountName) => {
  return (dispatch, getState) => {
    const { strAccountName } = THIS.state
    const { arrCardData, cardSelected } = THIS.props
    let accountName = ''
    let existAccountName = false
    if (validateSpace(newAccountName)) {
      accountName = newAccountName
      if (checkKanjiCharacter(newAccountName) > LIMIT_NUMBER.CARD_NAME) {
        accountName = strAccountName
      }
      let arrFilterName = []
      arrCardData.map(item => item.address !== cardSelected.address && arrFilterName.push(item.cardName))
      if (arrFilterName.includes(accountName)) {
        existAccountName = true
      }
    } else {
      accountName = ''
    }
    THIS.setState({
      existAccountName, 
      strAccountName: accountName
    }, () => {
      THIS.props.checkOpenEdit()
    })
  }
}

export const checkOpenEdit = () => {
  return (dispatch, getState) => {
    const { strAccountName, existAccountName } = THIS.state
    if (strAccountName.length > 0 && !existAccountName) {
      THIS.setState({
        isDisabledEdit: false
      })
    } else {
      THIS.setState({
        isDisabledEdit: true
      })
    }
  }
}

export const handleEditAccount = () => {
  return (dispatch, getState) => {
    const { strAccountName } = THIS.state
    const { cardSelected, onCloseModal, t } = THIS.props
    cardSelected.cardName = strAccountName
    ReduxServices.editAccount(cardSelected).then((newCardData) => {
      swal({
        text: t('Ethereum.accountUpdated'),
        width: '250px',
        type: 'success',
        timer: 5000,
        showConfirmButton: false
      })
      // trigger send event to all windows
      triggerSendEventToAllWindow('edit-account', newCardData)
    })
    onCloseModal()
  }
}
