import DexAPI from 'Backend/Api/services/DexAPI'
import ScamCoins from 'Backend/Api/services/ScamCoins'
import EtherscanServices from 'Backend/Api/services/EtherScan'
import { TOKEN_STATUS } from 'Utils/globalConstants'

const composeAsyncValidators = (validatorFns) => {
  return async (values, dispatch, props, field) => {
    let errors
    for (const validatorFn of validatorFns) {
      try {
        await validatorFn(values, dispatch, props, field)
      } catch (err) {
        errors = Object.assign({}, errors, err)
      }
    }

    if (errors) throw errors
  }
}

const uniqueAddress = (values /*, dispatch */) => {
  return DexAPI.getToken(values.address.toLowerCase()).then((response) => {
    // simulate server latency
    console.log('responseToken: ', response)
    if (response.token) {
      if (response.token.status === TOKEN_STATUS.REJECT) {
        throw { address: 'tklRejectWithThatToken' }
      } else if (response.token.status === TOKEN_STATUS.APPROVE) {
        throw { address: 'tklApproveWithThatToken' }
      } else {
        throw { address: 'tklRequestWithThatToken' }
      }
    }
  })
}

const validContractAddress = (values /*, dispatch */) => {
  return EtherscanServices.getCode(values.address.toLowerCase()).then((response) => {
    if (response === '0x') {
      // Final checking is contract address or not
      throw { address: 'SearchToken.errorContract' }
    }
  })
}

const validContractABI = (values) => {
  return EtherscanServices.getABI(values.address.toLowerCase()).then((response) => {
    if (response.message === 'NOTOK') {
      throw { address: 'tklContractNotVerified' }
    }
    if (response.message === 'OK') {
      let tokenABI = JSON.parse(response.result)
      let index = tokenABI.findIndex(i => i.type === 'function' && i.name === 'transferFrom')
      if (index === -1) {
        throw { address: 'tklNotSupportToken' }
      }
    }
  })
}

const checkInBlacklist = (values /*, dispatch */) => {
  return ScamCoins.getScamCoinsList().then((response) => {
    if (response && Array.isArray(response) && response.length > 0) {
      let scamCoins = response.filter(i => i.contract_address.toLowerCase() === values.address.toLowerCase())
      if (scamCoins && scamCoins[0]) {
        throw { address: 'AddTokenScreen.tokenInBlacklist' }
      }
    }
  })
}

const asyncValidate = composeAsyncValidators([uniqueAddress, validContractAddress, validContractABI, checkInBlacklist])

export default asyncValidate
