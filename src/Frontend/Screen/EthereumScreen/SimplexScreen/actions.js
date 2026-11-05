import DexAPI from 'Backend/Api/services/DexAPI'
import { getTokenBalance } from 'Backend/Lib/Web3/index'
import swal from 'sweetalert2'
import { HBWALLET } from 'Utils/globalConstants'
import { filterMainAccount, logDebugChatwork } from 'Utils/globalFunction'

var THIS
export const defaultThis = _this => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const backToTop = () => {
  return async (dispatch) => {
    THIS.setState({
      switchToBrowser: false
    }, () => THIS.props.getPaymentQuote(THIS.state.formData.usdAmount))
  }
}

export const getPaymentQuote = (value = 200, isUsdAmount = true) => {
  return async (dispatch, getState) => {
    const { fiatCurrency, selectedCoin, postData } = THIS.state
    const { userAuth, arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    try {
      THIS.setState({
        loading: true
      })
      const params = {
        digital_currency: selectedCoin,
        requested_amount: value,
        fiat_currency: fiatCurrency,
        end_user_id: userAuth._id,
        requested_currency: isUsdAmount ? fiatCurrency : selectedCoin
      }
      const result = await DexAPI.getPaymentQuote(params, mainAccount.address)
      if (result && !result.error && result.data) {
        postData.transaction_details.payment_details.quote_id = result.data.quote_id
        postData.transaction_details.payment_details.fiat_total_amount.currency = result.data.fiat_money.currency
        postData.transaction_details.payment_details.fiat_total_amount.amount = result.data.fiat_money.total_amount
        postData.transaction_details.payment_details.requested_digital_amount.currency = result.data.digital_money.currency
        postData.transaction_details.payment_details.requested_digital_amount.amount = result.data.digital_money.amount
        postData.transaction_details.payment_details.destination_wallet.currency = result.data.digital_money.currency
        postData.transaction_details.payment_details.destination_wallet.address = mainAccount.address
        THIS.setState({
          loading: false,
          postData,
          formData: {
            usdAmount: isUsdAmount ? value : result.data.fiat_money.total_amount,
            coinAmount: isUsdAmount ? result.data.digital_money.amount : value,
            receiveForm: document.getElementById('receiveForm') ? document.getElementById('receiveForm').value : '',
            tagField: document.getElementById('tagField') ? document.getElementById('tagField').value : ''
          }
        })
      } else {
        THIS.setState({
          loading: false
        })
      }
    } catch (err) {
      logDebugChatwork('getPaymentQuote', err)
      THIS.setState({
        loading: false
      })
    }
  }
}

export const getLocation = () => {
  return async (dispatch) => {
    const { postData } = THIS.state
    try {
      const result = await DexAPI.getLocation()
      if (result && !result.error && result.latitude && result.longitude) {
        postData.account_details.signup_login.location = `${result.latitude},${result.longitude}`
        THIS.setState({
          postData,
          location: result
        })
      }
    } catch (err) {
      logDebugChatwork('getLocation', err)
    }
  }
}

export const getHBTokenBalance = () => {
  return async (dispatch) => {
    const { arrCardData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    try {
      const balance = await getTokenBalance(HBWALLET, mainAccount.address, 2)
      if (balance) {
        THIS.setState({
          hbTokenBalance: balance
        })
      }
    } catch (err) {
      logDebugChatwork('getHBTokenBalance', err)
    }
  }
}

export const onSubmit = (values) => {
  return async (dispatch) => {
    const { formSubmiting, postData, hbTokenBalance, selectedCoin } = THIS.state
    const { arrCardData, t } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    try {
      if (formSubmiting) return
      THIS.setState({
        formSubmiting: true
      }, async () => {
        let paramData = postData
        paramData.transaction_details.payment_details.destination_wallet.address = selectedCoin === 'ETH' ? mainAccount.address : values.receiveForm
        paramData.transaction_details.payment_details.destination_wallet.tag = selectedCoin === 'XRP' ? values.tagField : ''
        const result = await DexAPI.requestPayment(paramData, mainAccount.address, Number(hbTokenBalance))
        if (result && !result.error && result.data) {
          THIS.setState({
            postPaymentData: result.data,
            formSubmiting: false,
            switchToBrowser: true
          })
        } else {
          THIS.setState({
            formSubmiting: false
          })
          swal({
            width: '300px',
            text: t('RequestFail'),
            type: 'error',
            showConfirmButton: true,
            customClass: 'simplex-popup'
          })
        }
      })
    } catch (err) {
      THIS.setState({
        formSubmiting: false
      })
      swal({
        width: '300px',
        text: t('RequestFail'),
        type: 'error',
        showConfirmButton: true,
        customClass: 'simplex-popup'
      })
      logDebugChatwork('onSubmit Simplex', err)
    }
  }
}
