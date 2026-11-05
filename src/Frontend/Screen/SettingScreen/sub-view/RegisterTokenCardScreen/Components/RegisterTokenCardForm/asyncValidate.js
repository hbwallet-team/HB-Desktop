import DexAPI from 'Backend/Api/services/DexAPI'
import EtherscanServices from 'Backend/Api/services/EtherScan'

const imageExists = (url, timeoutT) => {
  return new Promise((resolve, reject) => {
    let timeout = timeoutT || 5000
    let timer
    let img = new Image()
    img.onerror = img.onabort = function () {
      clearTimeout(timer)
      resolve(false)
    }
    img.onload = function () {
      clearTimeout(timer)
      resolve(true)
    }
    timer = setTimeout(function () {
      // reset .src to invalid URL so it stops previous
      // loading, but doesn't trigger new load
      img.src = '//!!!!/test.jpg'
      resolve(false)
    }, timeout)
    img.src = url
  })
}

const checkImageSize = function (url, width, height) {
  return new Promise((resolve, reject) => {
    let i = new Image()
    i.src = url
    i.onload = function () {
      if (i.width === width && i.height === height) {
        resolve(true)
      } else {
        resolve(false)
      }
    }
  })
}

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
  return EtherscanServices.getCode(values.address.toLowerCase()).then((response) => {
    if (response === '0x') {
      // Final checking is contract address or not
      throw { address: 'SearchToken.errorContract' }
    }
  })
}

const uniqueAddress = (values /*, dispatch */) => {
  return DexAPI.getAllTokenDB().then((response) => {
    if (response && response.data && Array.isArray(response.data)) {
      let token = response.data.filter(i => i.contract_address.toLowerCase() === values.address.toLowerCase())
      if (token[0] && token[0].card_file_path && token[0].card_file_path !== '') {
        throw { address: 'tklRegisteredTokenCard' }
      }
    }
  })
}

const validImageExist = (values) => {
  return imageExists(values.cardImage).then((response) => {
    if (!response) {
      throw { cardImage: 'tklCardImageDoesntExists' }
    }
  })
}

const validCardImageSize = (values) => {
  return checkImageSize(values.cardImage, 850, 529).then((response) => {
    if (!response) {
      throw { cardImage: 'tklCardImageHelpText' }
    }
  })
}

const validIconImageSize = (values) => {
  return checkImageSize(values.iconImage, 28, 28).then((response) => {
    if (!response) {
      throw { iconImage: 'tklIconImageHelpText' }
    }
  })
}

const asyncValidate = composeAsyncValidators([validContractAddress, uniqueAddress])

export default asyncValidate
