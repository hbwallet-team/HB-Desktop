import { setArrPayment } from '../../../../Backend/Redux/actions/globalActions'

var THIS

export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
export const selectCard = (card) => {
  return (dispatch, getState) => {
    const { arrPayment } = THIS.props

    if (!card.isSelected) {
      arrPayment.map(item => {
        if (item === card) {
          item.isSelected = true
        } else {
          item.isSelected = false
        }
      })
      dispatch(setArrPayment(arrPayment))
      THIS.forceUpdate()
    }
  }
}

export const setPrimary = (card) => {
  return (dispatch, getState) => {
    const { arrPayment } = THIS.props

    if (!card.isPrimary) {
      arrPayment.map(item => {
        if (item === card) {
          item.isPrimary = true
        } else {
          item.isPrimary = false
        }
      })
      dispatch(setArrPayment(arrPayment))
      THIS.forceUpdate()
    }
  }
}
export const deleteCard = (card) => {
  return (dispatch, getState) => {
    THIS.cardDelete = card
    THIS.refs.md_mab_confirm.show()
  }
}
export const confirmDelete = () => {
  return (dispatch, getState) => {
    if (!THIS.cardDelete.isPrimary) {
      const { arrPayment } = THIS.props

      let arrTemp = arrPayment.filter(item => item !== THIS.cardDelete)

      if (arrTemp.length === 1) {
        arrTemp[0].isSelected = true
      } else if (THIS.cardDelete.isSelected) {
        arrTemp.map(item => {
          if (item.isPrimary) {
            item.isSelected = true
          }
        })
      }
      THIS.refs.md_mab_confirm.hide()
      dispatch(setArrPayment(arrTemp))
      THIS.forceUpdate()
    }
  }
}
export const hideMdConfirm = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm.hide()
  }
}
