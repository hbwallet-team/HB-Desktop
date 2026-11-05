const translate = require('node-google-translate-skidz')

// https://github.com/RadarRelay/sdk/blob/481dc447ca9dc71dcd7e6342696edaa06ed1841b/src/errors/ZeroExErrors.ts
const ContractWrappersError = {
  ExchangeContractDoesNotExist: 'EXCHANGE_CONTRACT_DOES_NOT_EXIST',
  ZRXContractDoesNotExist: 'ZRX_CONTRACT_DOES_NOT_EXIST',
  EtherTokenContractDoesNotExist: 'ETHER_TOKEN_CONTRACT_DOES_NOT_EXIST',
  TokenTransferProxyContractDoesNotExist: 'TOKEN_TRANSFER_PROXY_CONTRACT_DOES_NOT_EXIST',
  TokenRegistryContractDoesNotExist: 'TOKEN_REGISTRY_CONTRACT_DOES_NOT_EXIST',
  TokenContractDoesNotExist: 'TOKEN_CONTRACT_DOES_NOT_EXIST',
  ContractNotDeployedOnNetwork: 'CONTRACT_NOT_DEPLOYED_ON_NETWORK',
  InsufficientAllowanceForTransfer: 'INSUFFICIENT_ALLOWANCE_FOR_TRANSFER',
  InsufficientBalanceForTransfer: 'INSUFFICIENT_BALANCE_FOR_TRANSFER',
  InsufficientEthBalanceForDeposit: 'INSUFFICIENT_ETH_BALANCE_FOR_DEPOSIT',
  InsufficientWEthBalanceForWithdrawal: 'INSUFFICIENT_WETH_BALANCE_FOR_WITHDRAWAL',
  InvalidJump: 'INVALID_JUMP',
  OutOfGas: 'OUT_OF_GAS',
  SubscriptionNotFound: 'SUBSCRIPTION_NOT_FOUND',
  SubscriptionAlreadyPresent: 'SUBSCRIPTION_ALREADY_PRESENT'
}
const OrderError = {
  InvalidSignature: 'INVALID_SIGNATURE'
}
const BlockchainCallErrs = {
  ContractDoesNotExist: 'CONTRACT_DOES_NOT_EXIST',
  UserHasNoAssociatedAddresses: 'USER_HAS_NO_ASSOCIATED_ADDRESSES',
  UnhandledError: 'UNHANDLED_ERROR',
  TokenAddressIsInvalid: 'TOKEN_ADDRESS_IS_INVALID'
}
const ExchangeContractErrs = {
  OrderFillExpired: 'ORDER_FILL_EXPIRED',
  OrderCancelExpired: 'ORDER_CANCEL_EXPIRED',
  OrderCancelAmountZero: 'ORDER_CANCEL_AMOUNT_ZERO',
  OrderAlreadyCancelledOrFilled: 'ORDER_ALREADY_CANCELLED_OR_FILLED',
  OrderFillAmountZero: 'ORDER_FILL_AMOUNT_ZERO',
  OrderRemainingFillAmountZero: 'ORDER_REMAINING_FILL_AMOUNT_ZERO',
  OrderFillRoundingError: 'ORDER_FILL_ROUNDING_ERROR',
  FillBalanceAllowanceError: 'FILL_BALANCE_ALLOWANCE_ERROR',
  InsufficientTakerBalance: 'INSUFFICIENT_TAKER_BALANCE',
  InsufficientTakerAllowance: 'INSUFFICIENT_TAKER_ALLOWANCE',
  InsufficientMakerBalance: 'INSUFFICIENT_MAKER_BALANCE',
  InsufficientMakerAllowance: 'INSUFFICIENT_MAKER_ALLOWANCE',
  InsufficientTakerFeeBalance: 'INSUFFICIENT_TAKER_FEE_BALANCE',
  InsufficientTakerFeeAllowance: 'INSUFFICIENT_TAKER_FEE_ALLOWANCE',
  InsufficientMakerFeeBalance: 'INSUFFICIENT_MAKER_FEE_BALANCE',
  InsufficientMakerFeeAllowance: 'INSUFFICIENT_MAKER_FEE_ALLOWANCE',
  TransactionSenderIsNotFillOrderTaker: 'TRANSACTION_SENDER_IS_NOT_FILL_ORDER_TAKER',
  MultipleMakersInSingleCancelBatchDisallowed: 'MULTIPLE_MAKERS_IN_SINGLE_CANCEL_BATCH_DISALLOWED',
  InsufficientRemainingFillAmount: 'INSUFFICIENT_REMAINING_FILL_AMOUNT',
  MultipleTakerTokensInFillUpToDisallowed: 'MULTIPLE_TAKER_TOKENS_IN_FILL_UP_TO_DISALLOWED',
  BatchOrdersMustHaveSameExchangeAddress: 'BATCH_ORDERS_MUST_HAVE_SAME_EXCHANGE_ADDRESS',
  BatchOrdersMustHaveAtLeastOneItem: 'BATCH_ORDERS_MUST_HAVE_AT_LEAST_ONE_ITEM'
}
// Human Readable Çontract Wrapper Errors
const ZeroExErrorMap = {
  [ContractWrappersError.ExchangeContractDoesNotExist]: 'Exchange contract does not exist',
  [ContractWrappersError.ZRXContractDoesNotExist]: 'ZRX contract does not exist',
  [ContractWrappersError.EtherTokenContractDoesNotExist]: 'EtherToken contract does not exist',
  [ContractWrappersError.TokenTransferProxyContractDoesNotExist]: 'TokenTransferProxy contract does not exist',
  [ContractWrappersError.TokenRegistryContractDoesNotExist]: 'TokenRegistry contract does not exist',
  [ContractWrappersError.TokenContractDoesNotExist]: 'Token contract does not exist',
  [ContractWrappersError.ContractNotDeployedOnNetwork]: 'Contract is not deployed on the detected network',
  [ContractWrappersError.InsufficientAllowanceForTransfer]: 'Insufficient allowance for transfer',
  [ContractWrappersError.InsufficientBalanceForTransfer]: 'Insufficient balance for transfer',
  [ContractWrappersError.InsufficientEthBalanceForDeposit]: 'Insufficient ETH balance for deposit',
  [ContractWrappersError.InsufficientWEthBalanceForWithdrawal]: 'Insufficient WETH balance for withdrawal',
  [ContractWrappersError.InvalidJump]: 'Invalid jump occured while executing the transaction',
  [ContractWrappersError.OutOfGas]: 'Transaction ran out of gas',
  [ContractWrappersError.SubscriptionNotFound]: 'Subscription not found',
  [ContractWrappersError.SubscriptionAlreadyPresent]: 'Subscription already present',
  [OrderError.InvalidSignature]: 'Order signature is not valid',
  [BlockchainCallErrs.ContractDoesNotExist]: 'Contract does not exist',
  [BlockchainCallErrs.UserHasNoAssociatedAddresses]: 'User has no addresses available',
  [BlockchainCallErrs.UnhandledError]: 'Unhandled Error',
  [BlockchainCallErrs.TokenAddressIsInvalid]: 'Token address is invalid',
  [ExchangeContractErrs.OrderFillExpired]: 'This order has expired',
  [ExchangeContractErrs.OrderCancelExpired]: 'This order has expired',
  [ExchangeContractErrs.OrderCancelAmountZero]: 'Order cancel amount can\'t be 0',
  [ExchangeContractErrs.OrderAlreadyCancelledOrFilled]: 'This order has already been completely filled or cancelled',
  [ExchangeContractErrs.OrderFillAmountZero]: 'Order fill amount can\'t be 0',
  [ExchangeContractErrs.OrderRemainingFillAmountZero]: 'This order has already been completely filled or cancelled',
  [ExchangeContractErrs.OrderFillRoundingError]: 'Rounding error will occur when filling this order. Please try filling a different amount.',
  [ExchangeContractErrs.InsufficientTakerBalance]: 'Taker no longer has a sufficient balance to complete this order',
  [ExchangeContractErrs.InsufficientTakerAllowance]: 'Taker no longer has a sufficient allowance to complete this order',
  [ExchangeContractErrs.InsufficientMakerBalance]: 'Maker no longer has a sufficient balance to complete this order',
  [ExchangeContractErrs.InsufficientMakerAllowance]: 'Maker no longer has a sufficient allowance to complete this order',
  [ExchangeContractErrs.InsufficientTakerFeeBalance]: 'Taker no longer has a sufficient balance to pay fees',
  [ExchangeContractErrs.InsufficientTakerFeeAllowance]: 'Taker no longer has a sufficient allowance to pay fees',
  [ExchangeContractErrs.InsufficientMakerFeeBalance]: 'Maker no longer has a sufficient balance to pay fees',
  [ExchangeContractErrs.InsufficientMakerFeeAllowance]: 'Maker no longer has a sufficient allowance to pay fees',
  [ExchangeContractErrs.TransactionSenderIsNotFillOrderTaker]: `This order can only be filled by the specified taker`,
  [ExchangeContractErrs.MultipleMakersInSingleCancelBatchDisallowed]: 'Multiple makes in a single cancel batch are disallowed',
  [ExchangeContractErrs.InsufficientRemainingFillAmount]: 'Insufficient remaining fill amount',
  [ExchangeContractErrs.MultipleTakerTokensInFillUpToDisallowed]: 'Multiple taker tokens in a fill up to call are disallowed',
  [ExchangeContractErrs.BatchOrdersMustHaveSameExchangeAddress]: 'Batch orders must have the same exchange address',
  [ExchangeContractErrs.BatchOrdersMustHaveAtLeastOneItem]: 'Batch orders cannot by empty'
}

let LANG = 'en'

const fetchErrContent = (err) => {

  let error = err.message ? err.message : err

  // Remove the "Error:" prefix
  error = error.toString().replace('Error:', '')

  // Remove all occurencies of underscore
  error = error.replace(/_/g, ' ')
  console.log('fetchErrContent: ', error)
  return error
}

const translateErr = async (errMsg) => {
  let errMsgLower = errMsg.toLowerCase()
  const myErrMsg = errMsgLower.replace(/^\w/, c => c.toUpperCase())
  if (LANG === 'en') {
    return myErrMsg
  }

  try {
    let res = await translate({text: myErrMsg, source: 'en', target: LANG})
    console.log('translateErr OK: ', res.translation)
    if (res.translation) {
      return res.translation
    } else {
      return myErrMsg
    }
  } catch (err) {
    console.log('translateErr failed: ', err)
    return myErrMsg
  }
}

export const getErrStr = async (err) => {
  console.log('getErrStr: ', err)
  let error = fetchErrContent(err)
  error = await translateErr(error)
  return error
}

export const setChosenLanguage = (lang) => {
  if (lang === 'jp') {
    LANG = 'ja'
  } else if (lang === 'cn') {
    LANG = 'zh-cn'
  } else if (lang === 'vn') {
    LANG = 'vi'
  } else {
    LANG = lang
  }

  console.log('setChosenLanguage: ', LANG)
}
