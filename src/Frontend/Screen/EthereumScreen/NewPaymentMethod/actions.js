import { setArrPayment } from '../../../../Backend/Redux/actions/globalActions'
import swal from 'sweetalert2'
import { validateDigit } from '../../../../Utils/globalFunction'

var THIS

export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const onChangeMonth = (item) => {
  return (dispatch, getState) => {
    THIS.setState({monthSelected: item.key})
  }
}
export const onChangeYear = (item) => {
  return (dispatch, getState) => {
    THIS.setState({yearSelected: item.key})
  }
}
export const onChangeNameOnCard = (txtNameCard) => {
  return (dispatch, getState) => {
    if (txtNameCard.length > 25) {
      txtNameCard = txtNameCard.substring(0, 25)
    }
    THIS.setState({txtNameCard})
  }
}

export const onChangeCardNumber = (txtCardNumber) => {
  return (dispatch, getState) => {
    let isCardNumberErr = 0
    if (!(txtCardNumber.startsWith('4') || txtCardNumber.startsWith('5'))) {
      isCardNumberErr = 1 // error with start number
      THIS.setState({txtCardNumber, isCardNumberErr})
      return
    }
    if (txtCardNumber.length !== 16) {
      isCardNumberErr = 2 // error length
    }
    if (txtCardNumber.length === 0) {
      isCardNumberErr = 0
    }
    THIS.setState({txtCardNumber, isCardNumberErr})
  }
}

export const onChangeCVC = (txtCVCNew) => {
  return (dispatch, getState) => {
    let isCVCErrNew = false
    if (txtCVCNew.length > 3) {
      txtCVCNew = txtCVCNew.substring(0, 3)
    }

    if (txtCVCNew.length === 0) {
      isCVCErrNew = false
    } else {
      if (!validateDigit(txtCVCNew)) {
        return
      }
      if (txtCVCNew.length === 3) {
        isCVCErrNew = false
      } else {
        isCVCErrNew = true
      }
    }

    THIS.setState({txtCVC: txtCVCNew, isCVCErr: isCVCErrNew})
  }
}

export const saveThisCard = () => {
  return (dispatch, getState) => {
    if (THIS.state.isEnableBtnSave) {
      THIS.setState({isSaveCard: !THIS.state.isSaveCard})
    }
  }
}

export const setAsPrimary = () => {
  return (dispatch, getState) => {
    if (!THIS.state.isSetPrimary) {
      THIS.setState({isSetPrimary: true, isSaveCard: true, isEnableBtnSave: false})
    } else {
      THIS.setState({isSetPrimary: false, isEnableBtnSave: true})
    }
  }
}

export const payment = () => {
  return (dispatch, getState) => {
    const {
      txtNameCard, txtCardNumber, txtCVC,
      monthSelected, yearSelected, isSetPrimary, isSaveCard
    } = THIS.state

    const {
      arrPayment, backToAccountDetail, t
    } = THIS.props

    if (txtCardNumber.length === 0 || txtNameCard.length === 0 || txtCVC.length === 0) {
      return
    }

    // TODO: charge

    swal({
      width: '250px',
      text: t('Boughtsuccessfully'),
      type: 'success',
      showConfirmButton: false
    })

    if (isSaveCard) {
      let paymentCard = {
        nameCard: txtNameCard,
        cardNumber: txtCardNumber,
        expriresMonth: monthSelected,
        expriresYear: yearSelected,
        cvc: txtCVC,
        isPrimary: arrPayment.length === 0 ? true : isSetPrimary,
        isSelected: false
      }
      if (isSetPrimary) {
        arrPayment.map(pm => { pm.isPrimary = false })
      }
      arrPayment.push(paymentCard)
      arrPayment.sort(function (o1, o2) {
        return o1.nameCard > o2.nameCard
      })
      dispatch(setArrPayment(arrPayment))
      THIS.forceUpdate()
    }
    backToAccountDetail()
  }
}
