import React from 'react'
import WebView from 'react-electron-web-view'
import LoadingBar from 'react-redux-loading-bar'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import Images from 'Assets/Image'
const appPath = window.require('electron').remote.app.getAppPath()

export default class SimplexForm extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      txtLink: `data: text/html, <form id='payment_form' name='payment_form' action='https://checkout.simplexcc.com/payments/new' method='POST' target='_self'><input type='hidden' className='form-control' name='version' value='1' /><input type='hidden' className='form-control' name='partner' value='bacoor' /><input type='hidden' className='form-control' name='payment_flow_type' value='wallet' /><input type='hidden' className='form-control' name='return_url' id='return_url' value=${props.postData.data.transaction_details.payment_details.original_http_ref_url} /><input type='hidden' className='form-control' name='quote_id' id='quote_id' value=${props.postData.data.transaction_details.payment_details.quote_id} /><input type='hidden' className='form-control' name='payment_id' id='payment_id' value=${props.postData.data.payment_id} /><input type='hidden' className='form-control' name='user_id' id='user_id' value=${props.postData.data.account_details.app_end_user_id} /><input type='hidden' className='form-control' name='destination_wallet[address]' id='destination_wallet_address' value=${props.postData.data.transaction_details.payment_details.destination_wallet.address} /><input type='hidden' className='form-control' name='destination_wallet[currency]' id='destination_wallet_currency' value=${props.postData.data.transaction_details.payment_details.destination_wallet.currency} /><input type='hidden' className='form-control' name='fiat_total_amount[amount]' id='fiat_total_amount' value=${props.postData.data.transaction_details.payment_details.fiat_total_amount.amount} /><input type='hidden' className='form-control' name='fiat_total_amount[currency]' id='fiat_total_amount_currency' value=${props.postData.data.transaction_details.payment_details.fiat_total_amount.currency} /><input type='hidden' className='form-control' name='digital_total_amount[amount]' id='digital_total_amount' value=${props.postData.data.transaction_details.payment_details.requested_digital_amount.amount} /> <input type='hidden' className='form-control' name='digital_total_amount[currency]' id='digital_total_amount_currency' value=${props.postData.data.transaction_details.payment_details.requested_digital_amount.currency}  /></form>`,
      isCrash: false,
      isLoadingPageSuccess: false
    }
    props.defaultThis(this)
  }
  componentDidMount () {
    const webview = document.querySelector('webview')
    // webview.addEventListener('dom-ready', () => {
    //   webview.openDevTools()
    // })
    webview.addEventListener('did-start-loading', this.props.loadingStart)
    webview.addEventListener('did-stop-loading', this.props.loadingStop)
  }
  componentWillUnmount () {
    const webview = document.querySelector('webview')
    webview.removeEventListener('did-start-loading', this.props.loadingStart)
    webview.removeEventListener('did-stop-loading', this.props.loadingStop)
    this.props.loadingStop()
  }
  render () {
    return (
      <div className="browser-container">
        <Header title={this.props.t('Simplex.Title')} leftAction={this.props.backToTop} />
        <div className="browser-view">
          <LoadingBar style={{ backgroundColor: '#067af7', height: '2px' }} />
          <WebView 
            ref={this.props.setRefWebView}
            className="browser-webview"
            style={{width: '100%', height: '100%'}}
            src={this.state.txtLink}
            preload={`file://${appPath}/src/Frontend/Screen/EthereumScreen/SimplexScreen/components/SimplexForm/paymentSubmit.js`}
            allowpopups={true}
            onNewWindow={this.props.onNewWindow}
            onDidFinishLoad={this.props.onDidFinishLoad}
            onDidFailLoad={this.props.onDidFailLoad}
          />
          { this.state.isCrash && this.renderCrashScreen() }
        </div>
      </div>
    )
  }
  renderCrashScreen () {
    return (
      <div className="browser-crash">
        <img className="browser-crash-img" src={Images.appLogoDark} />
        <div className="browser-crash-txt">{this.props.t('Dapps.noResult')}</div>
        <div className="browser-crash-txt">{this.props.t('Dapps.checkUrlAndTryAgain')}</div>
      </div>
    )
  }
}
