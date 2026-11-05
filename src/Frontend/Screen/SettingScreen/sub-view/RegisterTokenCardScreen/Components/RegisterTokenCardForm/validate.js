const validate = (values, props) => {
  const errors = {}
  if (!values.address || values.address.trim() === '') {
    errors.address = 'tklContractAddressIsRequired'
  } else if (!/^(0x)?[0-9a-f]{40}$/i.test(values.address)) {
    errors.address = 'tklMustBeACorrectAddress'
  }
  if (!values.name || values.name.trim() === '') {
    errors.name = 'tklTokenNameIsRequired'
  }
  if (!values.symbol || values.symbol.trim() === '') {
    errors.symbol = 'tklTokenSymbolIsRequired'
  }
  if (values.decimals === '') {
    errors.decimals = 'tklTokenDecimalsIsRequired'
  } else if (!/^[0-9]*$/gm.test(values.decimals)) {
    errors.decimals = 'tklMustBeANumber'
  }
  if (!values.email || values.email.trim() === '') {
    errors.email = 'tklEmailIsRequired'
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'tklInvalidEmailAddress'
  }
  if (values.iconImage && values.iconImage.trim() !== '' && !/((ftp|https?):\/\/.+\.(gif|png|jpg|jpeg))$/i.test(values.iconImage)) {
    errors.iconImage = 'tklInvalidUrl'
  }
  if (!values.cardImage || values.cardImage.trim() === '') {
    errors.cardImage = 'tklCardImageIsRequired'
  } else if (!/((ftp|https?):\/\/.+\.(gif|png|jpg|jpeg))$/i.test(values.cardImage)) {
    errors.cardImage = 'tklInvalidUrl'
  }
  return errors
}

export default validate
