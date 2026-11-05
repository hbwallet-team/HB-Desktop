import EtherScan from 'Backend/Api/services/EtherScan'
import ScamCoins from 'Backend/Api/services/ScamCoins'

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

const validContractAddress = (values /*, dispatch */) => {
  return EtherScan.getCode(values.address.toLowerCase()).then((response) => {
    if (response === '0x') {
      // Final checking is contract address or not
      throw { address: 'SearchToken.errorContract' }
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

const asyncValidate = composeAsyncValidators([validContractAddress, checkInBlacklist])

export default asyncValidate
