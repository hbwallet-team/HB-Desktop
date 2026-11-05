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
  // & !/((ftp|https?):\/\/.+\.(gif|png|jpg|jpeg))$/i.test(values.imageLink)
  if (values.imageLink !== '' && values.imageLink !== undefined && !/((ftp|https?):\/\/.+\.(.*))$/i.test(values.imageLink) && values.imageLink.length !== 0) {
    errors.imageLink = 'tklInvalidUrl'
  }
  if (!values.totalSupply || values.totalSupply.trim() === '') {
    errors.totalSupply = 'afa-TotalSupplyOfTokens'
  } else if (!/^[0-9]*$/gm.test(values.totalSupply) || Number(values.totalSupply) === 0) {
    errors.totalSupply = 'InputIntegerAmountOnly1'
  }
  if (!values.amount || values.amount.trim() === '') {
    errors.amount = 'afa-TokenAmountPerPerson'
  } else if (!/^[0-9]*$/gm.test(values.amount) || Number(values.amount) === 0) {
    errors.amount = 'InputIntegerAmountOnly1'
  } else if (Number(values.amount) > Number(values.totalSupply)) {
    errors.amount = 'ApplyAirdrop.tokenAmountMustBeLessThanTotalSupply'
  }
  let startDate = new Date(values.startDate)
  let endDate = new Date(values.endDate)
  let dateNow = Date.now()
  let dateAfter10 = dateNow.valueOf() + 864000000
  let dateAfter15 = startDate.valueOf() + 1296000000
  let dateAfter1 = startDate.valueOf() + 86400000
  if (!values.startDate || (values.startDate && values.startDate.trim() === '')) {
    errors.startDate = 'afa-StartDateIsRequired'
  } else if (startDate.valueOf() < dateNow.valueOf()) {
    errors.startDate = 'afa-StartDateIsWrong'
  } else if (startDate.valueOf() > dateAfter10) {
    errors.startDate = 'afa-StartDateIsWrong10'
  } else if (startDate.valueOf() > endDate.valueOf()) {
    errors.startDate = 'afa-StartDate2'
  }
  if (!values.endDate || (values.endDate && values.endDate.trim() === '')) {
    errors.endDate = 'afa-EndDateIsRequired'
  } else if (endDate.valueOf() > dateAfter15) {
    errors.endDate = 'afa-EndDateIsWrong'
  } else if (endDate.valueOf() < dateAfter1) {
    errors.endDate = 'afa-EndDateIsWrong2'
  }
  if (!values.website || values.website.trim() === '') {
    errors.website = 'afa-HomepageUrlIsRequired'
  } else if (!values.website || values.website.trim() === '' || !/((ftp|https?):\/\/.+\.(.*))$/i.test(values.website)) {
    errors.website = 'tklInvalidUrl'
  }
  if (!values.title || values.title.trim() === '') {
    errors.title = 'afa-TitleIsRequired'
  }
  if (!values.description || values.description.trim() === '') {
    errors.description = 'afa-ServicesDetailsIsRequired'
  }
  if (!values.email || values.email.trim() === '') {
    errors.email = 'tklEmailIsRequired'
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'tklInvalidEmailAddress'
  }

  return errors
}

export default validate
