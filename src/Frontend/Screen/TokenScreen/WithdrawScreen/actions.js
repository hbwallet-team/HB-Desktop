import { convertWeiToBalance, filterMainAccount } from 'Utils/globalFunction'
import { BOOST_ADDRESS } from 'Utils/globalConstants'
import { sendAirdropTxs } from 'Backend/Lib/Web3/index'
import Settings from 'Backend/settings'
import abiArray from './abiBoost'
import swal from 'sweetalert2'

var Web3 = require('web3')
var web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(Settings.server.hbScan.urlProvider))
var contractAddress = BOOST_ADDRESS
var contract = new web3.eth.Contract(abiArray, contractAddress)
/**
* @name : defaultThis
* @param : THIS
* @description : set default this for parameter
*/
let _this
export const defaultThis = (THIS) => {
  return (dispatch, getState) => {
    _this = THIS
  }
}

export const initialData = () => {
  return (dispatch, getState) => {
    const { arrCardData } = getState()
    const mainAccount = filterMainAccount(arrCardData)
    contract.methods.getWithdrawValue(mainAccount.address).call().then(result => {
      _this.setState({ ethAmount: convertWeiToBalance(result) })
    }).catch(err => {
      console.log(err)
    })
  }
}
/**
* @name : cancelAction
* @param :
* @description : back to account detail screen
*/
export const cancelAction = () => {
  return (dispatch, getState) => {
    _this.props.backToAccountDetail()
  }
}

/**
* @name : withdrawAction
* @param :
* @description : excuse function withdraw
*/
export const withdrawAction = () => {
  return async (dispatch, getState) => {
    const { arrCardData } = getState()
    const mainAccount = filterMainAccount(arrCardData)
    const {t} = _this.props
    _this.setState({ isLoadingExcute: true })
    let data = contract.methods.withdraw().encodeABI()
    sendAirdropTxs(mainAccount.privateKey, contractAddress, data)
      .then(value => {
        _this.setState({ isLoadingExcute: false })
        console.log('value')
        _this.props.backToAccountDetail()
        swal({
          width: '250px',
          text: t('withdrawSuccess'),
          type: 'success',
          timer: 5000,
          showConfirmButton: false
        })
      })
      .catch(err => {
        console.log(err)
        _this.props.backToAccountDetail()
        swal({
          width: '250px',
          text: t('withdrawError'),
          type: 'error',
          showConfirmButton: false
        })
      })
  }
}
