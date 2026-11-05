import { reset } from 'redux-form'
import DexAPI from 'Backend/Api/services/DexAPI'
import EtherGas from 'Backend/Api/services/EtherGas'
import swal from 'sweetalert2'
import EtherLibrary from 'Backend/HBLibrary/EtherLibrary'
import Settings from 'Backend/settings'
import { setPendingAirdrop, setScreenConfig } from 'Backend/Redux/actions/globalActions'
import { OBSERVER_KEY, HBWALLET, PENDING_TYPE } from 'Utils/globalConstants'
import Observer from 'Utils/HBObserver'
import { convertWeiToBalance, convertBalanceToWei, filterMainAccount, openBrowserInNewTab } from 'Utils/globalFunction'
import { getTokenBalance, buildSmartContractAirdrop } from 'Backend/Lib/Web3/index'
import moment from 'moment'
import { message } from 'antd'
const bufferSend = 0.0008
const { shell } = window.require('electron')

let THIS
export const funcDefaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const openExternal = (link) => {
  openBrowserInNewTab(link)
}

export const loadingInitial = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    const { gasLimit } = THIS.state
    if (internetData) {
      // fetch gas price from etherscan
      let gas = await EtherGas.getGasPrice()
      if (gas) {
        THIS.setState({
          gasPrice: gas,
          valueInputGas: gas.slow + 5,
          transactionFee: convertWeiToBalance(convertBalanceToWei(gas.slow + 5, 9) * gasLimit) + bufferSend
        })
      }
    }
  }
}

export const fetchRegistrationFee = () => {
  return async (dispatch, getState) => {
    const { internetData, screenConfig } = THIS.props
    const { etherPrice } = THIS.state
    if (internetData) {
      let fee = await DexAPI.getApplyForAirdropConfig()
      if (fee && fee.value) {
        THIS.setState({
          receiverAddress: fee.value.receiver_address,
          registrationFeeUsd: fee.value.registration_fee,
          registrationFee: Number(fee.value.registration_fee / etherPrice).toFixed(8)
        }, () => {
          screenConfig['apply_for_airdrop'] = fee.value
          dispatch(setScreenConfig(screenConfig))
        })
      } else if (screenConfig['apply_for_airdrop']) {
        THIS.setState({
          receiverAddress: screenConfig['apply_for_airdrop'].receiver_address,
          registrationFeeUsd: screenConfig['apply_for_airdrop'].registration_fee,
          registrationFee: Number(screenConfig['apply_for_airdrop'].registration_fee / etherPrice).toFixed(8)
        })
      }
    }
  }
}

export const fetchTokenPrice = () => {
  return async (dispatch, getState) => {
    const { internetData } = THIS.props
    const { etherPrice } = THIS.state
    if (internetData) {
      let token = await DexAPI.getTokenDataWithChart(HBWALLET)
      if (token && token.data) {
        THIS.setState({
          tokenPrice: Math.abs(token.data.lastPrice.price) * etherPrice
        })
      }
    }
  }
}

export const fetchTokenBalance = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      let balance = await getTokenBalance(HBWALLET, mainAccount.address, 2)
      if (balance) {
        THIS.setState({
          tokenBalance: balance
        })
      }
    }
  }
}

export const handleSubmit = (values) => {
  return (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const { tokenBalance, registrationFee, transactionFee, paymentType } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    // save form data into state avarible
    THIS.setState({
      formData: values
    })
    if (paymentType === 'ETH') {
      THIS.setState({
        totalFee: Number(registrationFee) + Number(transactionFee), // ether + transaction fee
        sufficientTokenBalance: true,
        sufficientEtherBalance: Number(mainAccount.balance) >= Number(registrationFee) + Number(transactionFee) // check ether balance is enough or not
      }, () => {
        // display confirm transactopn popup
        THIS.refs.md_exs_gas.show()
      })
    } else {
      THIS.setState({
        totalFee: transactionFee,
        sufficientTokenBalance: Number(tokenBalance) >= Number(registrationFee), // check token balance is enough or not
        sufficientEtherBalance: Number(mainAccount.balance) >= Number(transactionFee) // check ether balance is enough or not
      }, () => {
        // display confirm transactopn popup
        THIS.refs.md_exs_gas.show()
      })
    }
  }
}

export const handleChangePaymentType = (value) => {
  return async (dispatch, getState) => {
    const { registrationFeeUsd, valueInputGas, etherPrice, tokenPrice } = THIS.state
    THIS.setState({
      paymentType: value
    })
    if (value === 'ETH') {
      THIS.setState({
        gasLimit: Settings.gas.externalFee,
        transactionFee: convertWeiToBalance(convertBalanceToWei(valueInputGas, 9) * Settings.gas.externalFee) + bufferSend,
        registrationFee: Number(registrationFeeUsd / etherPrice).toFixed(8)
      })
    } else {
      THIS.setState({
        gasLimit: Settings.gas.externalLargeFeeToken,
        transactionFee: convertWeiToBalance(convertBalanceToWei(valueInputGas, 9) * Settings.gas.externalLargeFeeToken) + bufferSend,
        registrationFee: Number(0.5 * (registrationFeeUsd / tokenPrice)).toFixed(2) // discount 50% for HBWALLET token
      })
    }
  }
}

export const handleChangeGasPrice = (res) => {
  return (dispatch, getState) => {
    const { arrCardData } = THIS.props
    const { paymentType, registrationFee, tokenBalance, transactionFee } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    THIS.setState({
      valueInputGas: res.gasInput,
      transactionFee: res.transactionFee + bufferSend
    }, () => {
      if (paymentType === 'ETH') {
        THIS.setState({
          totalFee: Number(registrationFee) + Number(transactionFee), // ether + transaction fee,
          sufficientTokenBalance: true,
          sufficientEtherBalance: Number(mainAccount.balance) >= Number(registrationFee) + Number(transactionFee) // check ether balance is enough or not
        })
      } else {
        THIS.setState({
          totalFee: transactionFee,
          sufficientTokenBalance: Number(tokenBalance) >= Number(registrationFee), // check token balance is enough or not
          sufficientEtherBalance: Number(mainAccount.balance) >= Number(transactionFee) // check ether balance is enough or not
        })
      }
    })
  }
}

export const sendAction = () => {
  return async (dispatch, getState) => {
    const { internetData, arrCardData, t } = THIS.props
    const { formData, receiverAddress, registrationFee, paymentType, valueInputGas } = THIS.state
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      THIS.setState({ 
        isLoadingExcute: true 
      }, () => {
        let startDate = moment(new Date(formData.startDate)).unix()
        let endDate = moment(new Date(formData.endDate)).unix()
        // build new smart contract via user address
        buildSmartContractAirdrop(formData.address, mainAccount.privateKey, startDate, endDate, formData.amount)
          .then((txID) => {
            console.log('buildSmartContractAirdrop', txID)
            // hide gas modal
            THIS.refs.md_exs_gas.hide()
            // show notice
            swal({
              width: '400px',
              title: t('ApplyAirdrop.applyForAirdropSuccessfully'),
              html: t('ApplyAirdrop.systemIsBuildingSmartContract') + '<br/>' + t('ApplyAirdrop.thisWillTakeFiveMinutes') + '<br/>' + t('ApplyAirdrop.youCanCheckSmartContractOnEtherscan') + `<br/><a id="openExternal">${Settings.server.etherscan.orginUrl}tx/${txID}</a>`,
              type: 'success',
              showConfirmButton: false,
              onBeforeOpen: () => {
                const content = swal.getContent()
                const $ = content.querySelector.bind(content)
                const openExternal = $('#openExternal')
                openExternal.addEventListener('click', () => {
                  openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}tx/${txID}`)
                })
              }
            })
            // store pending tx
            formData.startDate = moment(new Date(formData.startDate)).unix()
            formData.endDate = moment(new Date(formData.endDate)).unix()
            formData.contractAddress = null
            formData.receiverAddress = receiverAddress
            formData.registrationFee = registrationFee
            formData.paymentType = paymentType
            formData.gasPrice = valueInputGas
            dispatch(setPendingAirdrop({
              account: mainAccount, 
              isPending: true, 
              lastTxID: txID,
              data: formData,
              type: PENDING_TYPE.APPLY_AIRDROP
            }))
            // trigger update data
            Observer.emit(OBSERVER_KEY.GET_DATA_AFTER_APPLY_AIRDROP)
            // reset form data
            dispatch(reset('applyAirdrop'))
          })
          .catch((error) => {
            console.log('buildSmartContractAirdrop error: ', error)
            swal({
              width: '250px',
              text: t('ApplyAirdrop.buildSmartContractFailed'),
              type: 'error',
              showConfirmButton: false
            })
            THIS.setState({ isLoadingExcute: false })
          })
      })
    } else {
      THIS.setState({ isLoadingExcute: false })
    }
  }
}

export const updateDataAfterApplyForAirdropSuccess = () => {
  return (dispatch, getState) => {
    THIS.setState({ isLoadingExcute: false })
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
async function getBase64 (img, callback) {
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
      getBase64(info.file.originFileObj, async (imageUrl) => {
        let str = imageUrl.toString().split(';base64,')
        let imageBase64 = str[1]
        let imgUPload = await DexAPI.imageUpload(info.file.originFileObj.name, imageBase64)
        THIS.setState({
          linkImgUpload: imgUPload.imageUrl
        })
      })
    } catch (error) {
      console.log('error upload 1', error)
    }
  }
}
