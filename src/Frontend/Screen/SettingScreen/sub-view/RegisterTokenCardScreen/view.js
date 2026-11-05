import React from 'react'
import './styles.css'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import RegisterTokenCardForm from './Components/RegisterTokenCardForm'
import PopupGas from './Components/PopupGas'
import { OBSERVER_KEY, HBCURRENCY_SYMBOL, HBCURRENCY, OWNER_RECEIVER_ADDRESS } from 'Utils/globalConstants'
import Observer from 'Utils/HBObserver'
import Settings from 'Backend/settings'

export default class RegisterTokenCardScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    props.funcDefaultThis(this)
    this.state = {
      etherPrice: props.etherPrice.price_usd,
      tokenPrice: 0,
      tokenBalance: 0,
      formData: {},
      transactionFee: 0,
      valueInputGas: 0,
      gasPrice: props.gasStation,
      gasLimit: Settings.gas.externalFee,
      totalFee: 0,
      holdingTokenUsd: 1000, // US$1000
      registrationFeeUsd: 1000, // US$1000
      registrationFee: 1000, // US$1000
      sufficientEtherBalance: true,
      sufficientTokenBalance: true,
      paymentType: 'ETH',
      isLoadingExcute: false,
      cardPreview:'',
      receiverAddress: OWNER_RECEIVER_ADDRESS,

    }
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    Observer.on(OBSERVER_KEY.GET_DATA_AFTER_REGISTER_TOKEN_CARD, props.updateDataAfterRegisterTokenCard)
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchRegistrationFee()
    this.props.fetchTokenPrice()
    this.props.fetchTokenBalance()
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.GET_DATA_AFTER_REGISTER_TOKEN_CARD, this.props.updateDataAfterRegisterTokenCard)
  }
  render () {
    const { registrationFeeUsd, holdingTokenUsd } = this.state
    const { handleSubmit, handleChangePaymentType, arrHBTokens, t } = this.props
    return (
      <div className="sts-container">
        <div className="sts-header">
          <div className="sts-header-title">{t('registerTokenCard')}</div>
        </div>
        <div className="rtc-container">
          <RegisterTokenCardForm 
            onSubmit={handleSubmit}
            handleChangePaymentType={handleChangePaymentType} 
            arrHBTokens={arrHBTokens} 
            registrationFeeUsd={registrationFeeUsd}
            holdingTokenUsd={holdingTokenUsd}
            t={t}/>
        </div>
        <Modal ref="md_exs_gas">
          <PopupGas THIS={this}/>
        </Modal>
      </div>
    )
  }
}
