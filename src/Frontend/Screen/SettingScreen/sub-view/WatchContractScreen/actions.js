
import EtherscanServices from '../../../../../Backend/Api/services/EtherScan'
import Ethplorer from '../../../../../Backend/Api/services/Ethplorer'
import { validateAddress } from '../../../../../Utils/globalFunction'

var THIS

export const funcDefautlThis = (_this) => {
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
    THIS.setState({isLoadingTokenInfo: false})
  }
}
// export const onChangeContractAddress = (contractAddress) => {
//   return (dispatch, getState) => {
//     THIS.setState({
//       contractAddress
//     })
//   }
// }
export const onChangeContractAddress = (txtNewAddr) => {
  return async (dispatch, getState) => {
    const { arrHBTokens, arrFilterTokenData } = THIS
    const { isDisableInformation } = THIS.state
    // const { objTokenData } = THIS.props
    // Check valid format address ethereum
    THIS.setState({
      isAddressErr: false,
      isDisableSave: true,
      isAlreadyCreate: false,
      isDisableInformation: false,
      isCustomToken: true,
      isNotContractAddr: false,
      txtContractAddr: txtNewAddr,
      txtTokenName: '',
      objDataJson: ''
    }, async () => {
      if (!validateAddress(txtNewAddr)) {
        // Clear data and error when no input
        if (txtNewAddr.length === 0) {
          if (isDisableInformation) {
            THIS.setState({
              isAddressErr: false,
              isDisableSave: true,
              isAlreadyCreate: false,
              isDisableInformation: false,
              isCustomToken: true,
              isNotContractAddr: false,
              txtContractAddr: '',
              txtTokenName: '',
              objDataJson: ''
            })
          } else {
            THIS.setState({
              // isDisableSave: true,
              isAddressErr: false,
              isCustomToken: true,
              isNotContractAddr: false,
              txtContractAddr: '',
              txtTokenId: ''
            })
          }
        }
      } else {
        if ((txtNewAddr.startsWith('0x') && txtNewAddr.length === 42)) {
          THIS.setState({isLoadingTokenInfo: true})
          let code = await EtherscanServices.getCode(txtNewAddr)

          if (code !== '0x') {
            // if (objTokenData && (objTokenData.address === txtNewAddr)) {
            //   setChoosenItem()
            // } else {
            let objExistHbToken, objExistTokenData

            // Check exist token data
            arrHBTokens && arrHBTokens.map(item => {
              if (item.tokenAddress.toLowerCase() === txtNewAddr) objExistHbToken = item
            })
            arrFilterTokenData && arrFilterTokenData.map(item => {
              if (item.address.toLowerCase() === txtNewAddr) objExistTokenData = item
            })
            if (objExistTokenData) {
              THIS.setState({
                isNameErr: false,
                isAddressErr: false,
                isLoadingTokenInfo: false,
                isAlreadyCreate: true,
                isCustomToken: false,
                isNotContractAddr: false,
                isDisableInformation: true,
                isDisableSave: true,
                txtContractAddr: txtNewAddr,
                txtTokenName: objExistTokenData.name,
                objDataJson: objExistTokenData
              })
            } else if (objExistHbToken) {
              THIS.setState({
                isAddressErr: false,
                isNotContractAddr: false,
                isAlreadyCreate: false,
                isLoadingTokenInfo: false,
                isCustomToken: false,
                isDisableInformation: true,
                txtContractAddr: txtNewAddr,
                txtTokenName: objExistHbToken.name,
                objDataJson: objExistHbToken
              }, () => {
                // THIS.slDecimal.snapToItem(parseInt(objExistHbToken.decimal))
                checkOpenSave()
              })
            } else {
              let data = await Ethplorer.getTokenInfo(txtNewAddr)
              THIS.setState({ objDataJson: data })
              if (data && !data.error) {
                if (data.name.length > 0 && data.symbol.length > 0) {
                  THIS.setState({ isDisableInformation: true,
                    txtContractAddr: txtNewAddr,
                    txtTokenId: '',
                    txtTokenName: data.name,
                    txtTokenSymbol: data.symbol,
                    isLoadingTokenInfo: false,
                    isAddressErr: false,
                    isNotContractAddr: false,
                    isCustomToken: true
                  }, () => {
                    // THIS.slDecimal.snapToItem(data.decimals)
                    checkOpenSave()
                  })
                } else {
                  THIS.setState({ txtContractAddr: txtNewAddr,
                    isAddressErr: false,
                    txtTokenId: '',
                    isLoadingTokenInfo: false,
                    isNotContractAddr: false,
                    isCustomToken: true }, () => {
                    checkOpenSave()
                  })
                }
              } else {
                THIS.setState({
                  txtContractAddr: txtNewAddr,
                  isAddressErr: false,
                  isLoadingTokenInfo: false,
                  isNotContractAddr: false,
                  isCustomToken: true
                }, () => {
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
              isLoadingTokenInfo: false,
              isNotContractAddr: true,
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
              isDisableInformation: false,
              txtContractAddr: txtNewAddr,
              txtTokenName: '',
              objDataJson: ''
            })
          } else {
          // Final fail checking
            THIS.setState({
              txtTokenId: '',
              isDisableSave: true,
              isCustomToken: true,
              txtContractAddr: txtNewAddr,
              isAddressErr: true,
              isNotContractAddr: false
            })
          }
        }
      }
    })
  }
}

const checkOpenSave = () => {
  const { txtContractAddr, isAddressErr, isAlreadyCreate, isNotContractAddr } = THIS.state
  if (txtContractAddr.length > 0 && !isAddressErr && !isAlreadyCreate && !isNotContractAddr) {
    THIS.setState({isDisableSave: false})
  } else {
    THIS.setState({isDisableSave: true})
  }
}
export const clearAll = () => {
  return (dispatch, getState) => {
    THIS.setState({
      txtContractAddr: '',
      txtTokenName: '',
      objDataJson: ''
    })
  }
}
