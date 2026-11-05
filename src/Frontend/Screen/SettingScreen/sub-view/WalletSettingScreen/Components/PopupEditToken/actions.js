import { setToken, setCustomToken } from 'Backend/Redux/actions/globalActions'
import { message } from 'antd'
import swal from 'sweetalert2'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import { filterMainAccount } from 'Utils/globalFunction'
var THIS

export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

let isJPG = false
let isLt2M = false
export const beforeUpload = (file) => {
  return (dispatch, getState) => {
    const listImageTypes = 'SVG+XML, SVG, ANI, BMP, CAL, FAX, GIF, IMG, JBG, JPE, JPEG, JPG, MAC, PBM, PCD, PCX, PCT, PGM, PNG, PPM, PSD, RAS, TGA, TIFF, WMF'
    const { t } = THIS.props
    let fileType = file.type.split('/')[1] ? file.type.split('/')[1].toUpperCase() : 'NOT_EXIST_FILE_TYPE'
    console.log('file type: ', file.type, fileType)
    isJPG = listImageTypes.includes(fileType)

    if (!isJPG) {
      message.error(t('notSupport'))
    }
    isLt2M = file.size / 1024 / 1024 < 2
    if (isJPG && !isLt2M) {
      message.error(t('smallerThan2MB'))
    }
    return isJPG & isLt2M
  }
}
function getBase64 (img, callback) {
  const reader = new FileReader()
  try {
    reader.addEventListener('load', () => callback(reader.result))
    if (isJPG & isLt2M) reader.readAsDataURL(img)
  } catch (error) {
    console.log('error upload', error)
  }
}

export const handleChange = (info) => {
  return (dispatch, getState) => {
    try {
      getBase64(info.file.originFileObj, imageUrl => {
        THIS.setState({
          txtImgUrl: imageUrl
        })
      })
    } catch (error) {
      console.log('error upload 1', error)
    }
  }
}

export const editToken = (token, txtImgUrl) => {
  return (dispatch, getState) => {
    const { arrCardData, arrTokenData, arrCustomToken, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    let index = arrTokenData.findIndex(i => i.address === token.address)
    if (index !== -1) {
      arrTokenData[index].cardImage = txtImgUrl
      dispatch(setToken(arrTokenData))
      // update custom token into localStorage
      const newCardData = arrCustomToken.slice()
      const isExistCustomToken = arrCustomToken.find(e => e.owner.toLowerCase() === mainAccount.address.toLowerCase() && e.address.toLowerCase() === token.address.toLowerCase())
      if (isExistCustomToken) {
        isExistCustomToken.cardImage = txtImgUrl
        dispatch(setCustomToken(newCardData))
      } else {
        newCardData.push({
          owner: mainAccount.address,
          address: token.address.toLowerCase(),
          name: token.name,
          symbol: token.symbol,
          cardImage: txtImgUrl
        })
        dispatch(setCustomToken(newCardData))
      }
      swal({
        text: t('editTokenSuccess'),
        width: '250px',
        type: 'success',
        showConfirmButton: false,
        timer: 3000
      })
      Observer.emit(OBSERVER_KEY.SELECT_TAB_TOKEN)
    }
  }
}
