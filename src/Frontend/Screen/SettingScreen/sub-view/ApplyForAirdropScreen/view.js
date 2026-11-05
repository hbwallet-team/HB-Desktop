import React from 'react'
import './styles.css'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import ApplyAirdropForm from './Components/ApplyAirdropForm'
import PopupGas from './Components/PopupGas'
import { HBCURRENCY_SYMBOL, HBCURRENCY, OWNER_RECEIVER_ADDRESS, OBSERVER_KEY } from 'Utils/globalConstants'
import Settings from 'Backend/settings'
import Observer from 'Utils/HBObserver'

export default class ApplyForAirdropScreen extends React.PureComponent {
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
      registrationFeeUsd: 1000, // US$1000
      registrationFee: 1000, // US$1000
      sufficientEtherBalance: true,
      sufficientTokenBalance: true,
      paymentType: 'ETH',
      isLoadingExcute: false,
      receiverAddress: OWNER_RECEIVER_ADDRESS
    }
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    Observer.on(OBSERVER_KEY.APPLY_AIRDROP_SUCCESSFULLY, props.updateDataAfterApplyForAirdropSuccess)
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchRegistrationFee()
    this.props.fetchTokenPrice()
    this.props.fetchTokenBalance()
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.APPLY_AIRDROP_SUCCESSFULLY, this.props.updateDataAfterApplyForAirdropSuccess)
  }
  render () {
    const { registrationFeeUsd, isLoadingExcute } = this.state
    const { handleSubmit, handleChangePaymentType, arrHBTokens, pendingAirdrop, t, beforeUpload, handleChange } = this.props
    return (
      <div className="sts-container afa-container">
        <div className="sts-header">
          <div className="sts-header-title">{t('ApplyForAirdrop')}</div>
        </div>
        <div className="rtc-container">
          <ApplyAirdropForm 
            onSubmit={handleSubmit}
            handleChangePaymentType={handleChangePaymentType} 
            arrHBTokens={arrHBTokens} 
            registrationFeeUsd={registrationFeeUsd}
            isLoadingExcute={isLoadingExcute}
            pendingAirdrop={pendingAirdrop}
            t={t}/>
        </div>
        <Modal ref="md_exs_gas">
          <PopupGas THIS={this}/>
        </Modal>
      </div>
    )
  }
}
