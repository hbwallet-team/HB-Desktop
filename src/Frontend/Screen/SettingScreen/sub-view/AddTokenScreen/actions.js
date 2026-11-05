
import EtherscanServices from 'Backend/Api/services/EtherScan'
import Ethplorer from 'Backend/Api/services/Ethplorer'
import { validateSpace, validateAddress, validateNumber, filterMainAccount } from 'Utils/globalFunction'
import { message } from 'antd'
import swal from 'sweetalert2'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import { setToken, setCustomToken } from 'Backend/Redux/actions/globalActions'
import DexAPI from 'Backend/Api/services/DexAPI'

let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { arrTokenData, objTokenData } = THIS.props
    let arrFilterTokenData = []

    if (objTokenData) {
      arrTokenData.map(item => (item.address !== objTokenData.address) &&
      arrFilterTokenData.push(item))
      THIS.arrFilterTokenData = arrFilterTokenData
      // setChoosenItem()
    } else {
      THIS.arrFilterTokenData = arrTokenData
    }
    THIS.setState({isLoadingTokenInfo: false, isPoiter: false})
  }
}
export const onChangeAddress = (txtNewAddr) => {
  return async (dispatch, getState) => {
    const { arrFilterTokenData } = THIS
    const { arrHBTokens, arrScamCoins } = THIS.props
    const { isDisableInformation, txtContractAddr } = THIS.state
    console.log('arrFilterTokenData: ', arrFilterTokenData)
    // const { objTokenData } = THIS.props
    // Check valid format address ethereum
    THIS.setState({
      isAddressErr: false,
      isDisableSave: true,
      isAlreadyCreate: false,
      isDisableInformation: false,
      isCustomToken: true,
      isNotContractAddr: false,
      isInBlacklist: false,
      txtContractAddr: txtNewAddr,
      txtTokenName: '',
      txtTokenSymbol: '',
      txtTokenUrl: '',
      txtTokenId: '',
      txtImgUrl: '',
      txtDecimal: ''
    }, async () => {
      if (!validateAddress(txtNewAddr)) {
        // Clear data and error when no input
        console.log('you are in validateAddress')
        if (txtNewAddr.length === 0) {
          if (isDisableInformation) {
            THIS.setState({
              isAddressErr: false,
              isDisableSave: true,
              isAlreadyCreate: false,
              isDisableInformation: false,
              isCustomToken: true,
              isNotContractAddr: false,
              isInBlacklist: false,
              txtContractAddr: '',
              txtTokenName: '',
              txtTokenSymbol: '',
              txtTokenUrl: '',
              txtTokenId: '',
              txtImgUrl: '',
              txtDecimal: ''
            })
          } else {
            THIS.setState({
              // isDisableSave: true,
              isAlreadyCreate: false,
              isDisableInformation: false,
              isAddressErr: false,
              isCustomToken: true,
              isNotContractAddr: false,
              isInBlacklist: false,
              txtContractAddr: '',
              txtTokenId: ''
            })
          }
        } else {
          THIS.setState({ txtContractAddr, isAddressErr: true })
        }
      } else {
        if ((txtNewAddr.startsWith('0x') && txtNewAddr.length === 42)) {
          THIS.setState({ isLoadingTokenInfo: true })
          let code = await EtherscanServices.getCode(txtNewAddr)

          if (code !== '0x') {
            // if (objTokenData && (objTokenData.address === txtNewAddr)) {
            //   setChoosenItem()
            // } else {
            let objExistScamCoins, objExistHbToken, objExistTokenData

            // Check exist token data
            arrScamCoins.length > 0 && arrScamCoins.map(item => {
              if (item.contract_address.toLowerCase() === txtNewAddr) objExistScamCoins = item
            })
            console.log('objExistScamCoins', objExistScamCoins)
            arrHBTokens.map(item => {
              if (item.tokenAddress.toLowerCase() === txtNewAddr) objExistHbToken = item
            })
            arrFilterTokenData && arrFilterTokenData.map(item => {
              if (item.address.toLowerCase() === txtNewAddr) objExistTokenData = item
            })
            if (objExistScamCoins) {
              THIS.setState({
                isNameErr: false,
                isAddressErr: true,
                isLoadingTokenInfo: false,
                isAlreadyCreate: false,
                isCustomToken: false,
                isNotContractAddr: false,
                isInBlacklist: true,
                isDisableInformation: true,
                isDisableSave: true,
                txtContractAddr: txtNewAddr,
                txtTokenName: objExistScamCoins.token_name,
                txtTokenSymbol: objExistScamCoins.symbol,
                txtDecimal: objExistScamCoins.decimal
              })
            } else if (objExistTokenData) {
              THIS.setState({
                isNameErr: false,
                isAddressErr: false,
                isLoadingTokenInfo: false,
                isAlreadyCreate: true,
                isCustomToken: false,
                isNotContractAddr: false,
                isInBlacklist: false,
                isDisableInformation: true,
                isDisableSave: true,
                txtContractAddr: txtNewAddr,
                txtTokenName: objExistTokenData.name,
                txtTokenSymbol: objExistTokenData.symbol,
                txtTokenUrl: objExistTokenData.url,
                txtTokenId: objExistTokenData.tokenId,
                txtImgUrl: objExistTokenData.cardImage,
                txtDecimal: objExistTokenData.decimals
              })
            } else if (objExistHbToken) {
              console.log('update image: ', objExistHbToken.cardImage)
              THIS.setState({
                isNameErr: false,
                isAddressErr: false,
                isNotContractAddr: false,
                isInBlacklist: false,
                isAlreadyCreate: false,
                isLoadingTokenInfo: false,
                isCustomToken: false,
                isDisableSave: false,
                isDisableInformation: true,
                txtContractAddr: txtNewAddr,
                txtTokenName: objExistHbToken.name,
                txtTokenSymbol: objExistHbToken.symbol,
                txtTokenUrl: objExistHbToken.url,
                txtTokenId: objExistHbToken.id,
                txtImgUrl: objExistHbToken.cardImage,
                txtDecimal: objExistHbToken.decimals}, () => {
                // THIS.slDecimal.snapToItem(parseInt(objExistHbToken.decimal))
                checkOpenSave()
              })
            } else {
              let data = await Ethplorer.getTokenInfo(txtNewAddr)
              console.log(data)
              if (data && !data.error) {
                if (data.name.length > 0 && data.symbol.length > 0) {
                  THIS.setState({
                    txtContractAddr: txtNewAddr,
                    txtTokenId: '',
                    txtTokenName: data.name,
                    txtTokenSymbol: data.symbol,
                    isLoadingTokenInfo: false,
                    isAddressErr: false,
                    isNotContractAddr: false,
                    isInBlacklist: false,
                    isDisableInformation: true, // disable when app can get token name and symbol from server
                    isCustomToken: true,
                    isAlreadyCreate: false,
                    txtDecimal: data.decimals.toString()}, () => {
                    // THIS.slDecimal.snapToItem(data.decimals)
                    checkOpenSave()
                  })
                } else {
                  THIS.setState({ txtContractAddr: txtNewAddr,
                    isAddressErr: false,
                    txtTokenId: '',
                    isAlreadyCreate: false,
                    isDisableInformation: false,
                    isLoadingTokenInfo: false,
                    isNotContractAddr: false,
                    isInBlacklist: false,
                    isCustomToken: true }, () => {
                    checkOpenSave()
                  })
                }
              } else {
                THIS.setState({
                  txtContractAddr: txtNewAddr,
                  isAddressErr: false,
                  txtTokenId: '',
                  isLoadingTokenInfo: false,
                  isNotContractAddr: false,
                  isInBlacklist: false,
                  isAlreadyCreate: false,
                  isDisableInformation: false,
                  isCustomToken: true }, () => {
                  checkOpenSave()
                })
              }
            }
            // }
          } else {
          // Final checking is contract address or not
            THIS.setState({
              txtTokenId: '',
              isDisableSave: true,
              isCustomToken: true,
              isAlreadyCreate: false,
              isDisableInformation: false,
              isLoadingTokenInfo: false,
              isNotContractAddr: true,
              isInBlacklist: false,
              txtContractAddr: txtNewAddr,
              isAddressErr: true
            })
          }
        } else {
          if (isDisableInformation) {
            THIS.setState({
              isAddressErr: true,
              isDisableSave: true,
              isAlreadyCreate: false,
              isCustomToken: true,
              isNotContractAddr: false,
              isInBlacklist: false,
              isDisableInformation: false,
              txtContractAddr: txtNewAddr,
              txtTokenName: '',
              txtTokenSymbol: '',
              txtTokenUrl: '',
              txtTokenId: '',
              txtImgUrl: '',
              txtDecimal: ''
            })
          } else {
          // Final fail checking
            THIS.setState({
              txtTokenId: '',
              isDisableSave: true,
              isCustomToken: true,
              isDisableInformation: false,
              isAlreadyCreate: false,
              txtContractAddr: txtNewAddr,
              isAddressErr: true,
              isNotContractAddr: false,
              isInBlacklist: false
            })
          }
        }
      }
    })
  }
}

const checkOpenSave = () => {
  const {txtImgUrl, txtContractAddr,
    txtTokenName, txtTokenSymbol, isDecimalErr, txtDecimal,
    isAddressErr, isNameErr, isAlreadyCreate, isNotContractAddr } = THIS.state

  if (txtContractAddr.length > 0 && txtTokenName.length > 0 && txtTokenSymbol.length > 0 &&
       txtImgUrl.length > 0 && txtDecimal.toString().length > 0 && !isAddressErr && !isNameErr && !isAlreadyCreate && !isNotContractAddr && !isDecimalErr) {
    THIS.setState({isDisableSave: false})
  } else {
    THIS.setState({isDisableSave: true})
  }
}

export const onChangeTokenName = (txtNewTokenName) => {
  return (dispatch, getState) => {
    const { arrFilterTokenData } = THIS
    const { txtTokenName } = THIS.state
    const { objTokenData, arrHBTokens } = THIS.props

    var nameTemp = ''
    let isNameErr = false
    if (validateSpace(txtNewTokenName)) {
      if (txtNewTokenName.length === 0) {
        nameTemp = txtNewTokenName
      } else {
        if (txtNewTokenName.length > 25) {
          nameTemp = txtTokenName
        } else {
          nameTemp = txtNewTokenName
          // Check exist token data
          arrHBTokens.map((item, index) => {
            if (item.name.toLowerCase() === txtNewTokenName.toLowerCase()) {
              isNameErr = true
              console.log(index)
            }
          })
          arrFilterTokenData && arrFilterTokenData.map((item, index) => {
            if (item.name && item.name.toLowerCase() === txtNewTokenName.toLowerCase()) {
              isNameErr = true
            }
          })
        }
      }
    } else {
      nameTemp = ''
    }

    THIS.setState({txtTokenName: nameTemp, isNameErr}, () => {
      if (objTokenData) {
        checkIsNotChangeInformation()
          ? THIS.setState({ isDisableSave: true })
          : checkOpenSave()
      } else {
        checkOpenSave()
      }
    })
  }
}
export const onChangeSymbol = (txtNewSymbol) => {
  return (dispatch, getState) => {
    const { txtTokenSymbol } = THIS.state
    const { objTokenData } = THIS.props
    var symbolTemp = ''

    if (validateSpace(txtNewSymbol)) {
      if (txtNewSymbol.length === 0) {
        symbolTemp = txtNewSymbol
      } else {
        if (txtNewSymbol.length > 10) {
          symbolTemp = txtTokenSymbol
        } else {
          symbolTemp = txtNewSymbol
        }
      }
    } else {
      symbolTemp = ''
    }
    THIS.setState({txtTokenSymbol: symbolTemp}, () => {
      if (objTokenData) {
        checkIsNotChangeInformation()
          ? THIS.setState({isDisableSave: true})
          : checkOpenSave()
      } else {
        checkOpenSave()
      }
    })
  }
}
const checkIsNotChangeInformation = () => {
  const { objTokenData } = THIS.props
  const { txtContractAddr, txtTokenName, txtTokenSymbol, txtImgUrl, txtDecimal } = THIS.state
  if (objTokenData) {
    if (txtContractAddr === objTokenData.address && txtTokenName === objTokenData.name &&
    txtTokenSymbol === objTokenData.symbol && txtImgUrl === objTokenData.cardImage &&
    txtDecimal === objTokenData.decimals) {
      return true
    } else {
      return false
    }
  }
}
export const onChangeDemcimal = (txtNewDecimal) => {
  return (dispatch, getState) => {
    const newDecimal = txtNewDecimal.toString()
    if (!validateNumber(newDecimal)) {
      if (newDecimal.length === 0) {
        THIS.setState({
          txtDecimal: '',
          isDecimalErr: false
        }, () => THIS.forceUpdate())
      }
    } else {
      THIS.setState({
        txtDecimal: newDecimal, 
        isDecimalErr: newDecimal && Number(newDecimal) > 18
      }, () => checkOpenSave())
    }
  }
}
export const onAddNewToken = () => {
  return async (dispatch, getState) => {
    const { txtImgUrl, txtContractAddr, txtTokenName, txtTokenId,
      txtTokenSymbol, txtDecimal, txtTokenUrl, isCustomToken } = THIS.state
    const { arrCardData, arrTokenData, arrCustomToken, internetData, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    // add new token into local
    const newTokenToLocal = {
      key: arrTokenData.length === 0 ? 0 : arrTokenData[arrTokenData.length - 1].key + 1,
      tokenId: txtTokenId.length > 0 ? txtTokenId : txtTokenName.toLowerCase().replace(/ /g, '-'),
      name: txtTokenName,
      address: txtContractAddr.toLowerCase(),
      symbol: txtTokenSymbol,
      url: txtTokenUrl,
      cardImage: txtImgUrl,
      iconImage: txtImgUrl,
      balance: 0,
      currencyBalance: 0,
      fiatAmount: 0,
      decimal: txtDecimal,
      isEnabled: true,
      isDeleted: false,
      isAutoAddedToken: false,
      isCustomToken
    }
    arrTokenData.push(newTokenToLocal)
    dispatch(setToken(arrTokenData))

    // store new custom token into localStorage
    if (isCustomToken) {
      const newTokenToStore = {
        owner: mainAccount.address,
        address: txtContractAddr.toLowerCase(),
        name: txtTokenName,
        symbol: txtTokenSymbol,
        cardImage: txtImgUrl,
        iconImage: txtImgUrl
      }
      const isExistCustomToken = arrCustomToken.find(e => e.owner.toLowerCase() === mainAccount.address.toLowerCase() && e.address.toLowerCase() === txtContractAddr.toLowerCase())
      if (!isExistCustomToken) {
        arrCustomToken.push(newTokenToStore)
        dispatch(setCustomToken(arrCustomToken))
      }
    }

    // show notice
    swal({
      text: t('createTokenSuccess'),
      width: '320px',
      type: 'success',
      showConfirmButton: false
    })

    // save new token to server
    if (internetData) {
      const newTokenToServer = {
        name: txtTokenName,
        address: txtContractAddr.toLowerCase(),
        symbol: txtTokenSymbol,
        url: txtTokenUrl,
        balance: 0,
        priceCurrency: 0,
        price_usd: 0,
        decimals: txtDecimal,
        isEnabled: true,
        isDeleted: false,
        isCustomToken
      }
      await DexAPI.addCustomToken(mainAccount.address, newTokenToServer)
    }
    Observer.emit(OBSERVER_KEY.SELECT_TAB_TOKEN)
  }
}
export const onCancel = () => {
  return (dispatch, getState) => {
    THIS.setState({
      isActiveInfoScreen: false
      // txtContractAddr: '',
      // txtTokenName: '',
      // txtTokenSymbol: '',
      // txtDecimal: '',
      // txtImgUrl: '',
      // txtTokenId: '',
      // txtTokenUrl: '',
      // isDisableSave: true
    })
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
          loading: false,
          txtImgUrl: imageUrl,
          cardPreview: imageUrl
        }, () => checkOpenSave())
      })
    } catch (error) {
      console.log('error upload 1', error)
    }
  }
}

export const reset = () => {
  return (dispatch, getState) => {
    THIS.setState({
      txtContractAddr: '',
      txtTokenName: '',
      txtTokenSymbol: '',
      txtDecimal: '',
      txtImgUrl: ''
    })
  }
}
