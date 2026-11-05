import { setCurrency } from 'Backend/Redux/actions/globalActions'
import { getEtherPrice } from 'Backend/Redux/actionSaga/sagaActions'
import swal from 'sweetalert2'
let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
export const onChange = (e) => {
  return (dispatch, getState) => {
    const { t } = THIS.props
    dispatch(getEtherPrice(THIS.data[e.target.value].content))
    THIS.setState({
      value: e.target.value
    }, () => dispatch(setCurrency(THIS.data[e.target.value].content)))
    swal({
      width: '250px',
      text: t('CurrencyChange'),
      type: 'success',
      timer: 5000,
      showConfirmButton: false
    })
  }
}
