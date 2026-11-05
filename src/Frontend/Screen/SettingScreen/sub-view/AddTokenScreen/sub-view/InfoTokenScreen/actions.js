import { setToken } from 'Backend/Redux/actions/globalActions'
import FiatMoneyConvert from 'Backend/HBLibrary/FiatMoneyConvert'
import {formatNumber} from 'Utils/globalFunction'
import swal from 'sweetalert2'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'

let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
export const onAddNewToken = () => {
  return async (dispatch, getState) => {
    const { arrTokenData, objDataPreview, t } = THIS.props

    arrTokenData.push({
      key: arrTokenData.length === 0 ? 0 : arrTokenData[arrTokenData.length - 1].key + 1,
      tokenId: objDataPreview[0].tokenId,
      name: objDataPreview[0].name,
      address: objDataPreview[0].address,
      cardImage: objDataPreview[0].cardImage,
      iconImage: objDataPreview[0].iconImage,
      symbol: objDataPreview[0].symbol,
      url: objDataPreview[0].url,
      balance: objDataPreview[0].balance,
      decimals: objDataPreview[0].decimal,
      checked: objDataPreview[0].checked,
      isCustomToken: objDataPreview[0].isCustomToken
    })
    dispatch(setToken(arrTokenData))
    swal({
      text: t('createTokenSuccess'),
      width: '320px',
      type: 'success',
      showConfirmButton: false
    })
    Observer.emit(OBSERVER_KEY.SELECT_TAB_TOKEN)
  }
}
