import React from 'react'
import WebView from 'react-electron-web-view'
import Images from 'Assets/Image'
import { HBInput } from 'Frontend/Components/HBInput'
import LoadingBar from 'react-redux-loading-bar'
import SignMessageScreen from '../SignMessageScreen'
import SignTransactionScreen from '../SignTransactionScreen'
import AccountSwitched from '../AccountSwitched'
import ConfirmPINCodeScreen from 'Frontend/Screen/SettingScreen/sub-view/ConfirmPINCodeScreen/view'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import { HBCURRENCY_SYMBOL, HBCURRENCY } from 'Utils/globalConstants'
import { formatNumberLeftZero, formatNumberDisplay, formatFiatDisplay, filterMainAccount, openBrowserInNewTab } from 'Utils/globalFunction' 
import { Form, Dropdown } from 'antd'
import StarRatings from 'react-star-ratings'
import moment from 'moment'
import './styles.css'
const appPath = window.require('electron').remote.app.getAppPath()
const ipc = window.require('electron').ipcRenderer

export default class BrowserScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      txtLinkTemp: '',
      txtLink: '',
      txtNonce: '',
      jsContent: '',
      payload: null,
      isMyFavorite: false,
      isCanBack: false,
      isCrash: false,
      isSend: false,
      sendData: null,
      isFeeErr: false,
      isLoadingPageSuccess: false,
      isLoadingSignMessage: false,
      isLoadingSignTransaction: false,
      isReloadPage: false,
      isReloadBalance: false,
      isVoted: false,
      isShowBrowserAddress: false,
      ratingValue: 0,
      transactionFee: 0,
      valueInputGas: 0,
      gasPrice: props.gasStation,
      switchedAccount: null,
      mainAccount: filterMainAccount(props.arrCardData)
    }
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.defaultThis(this)
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchRating()
    // listening trigger from main window
    ipc.on('switched-account', this.props.triggerSwitchedAccount)
    ipc.on('edit-account', this.props.triggerEditAccount)
    ipc.on('deleted-main-account', this.props.triggerDeletedMainAccount)
    const webview = document.querySelector('webview')
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
        { this.renderMainNav() }
        <div className="browser-view">
          <LoadingBar style={{ backgroundColor: '#067af7', height: '2px' }} />
          <WebView 
            ref={this.props.setRefWebView}
            className="browser-webview"
            style={{width: '100%', height: '100%'}}
            src={this.state.txtLink}
            preload={`file://${appPath}/src/Backend/Lib/Golden/Dapps.js`}
            allowpopups={true}
            onNewWindow={this.props.onNewWindow}
            onDidFinishLoad={this.props.onDidFinishLoad}
            onDidFailLoad={this.props.onDidFailLoad}
            onWillNavigate={this.props.onWillNavigate}
            onDidNavigate={this.props.onDidNavigate}
            onDidNavigateInPage={this.props.onDidNavigateInPage}
            onIpcMessage={this.props.onMessage}
          />
          { this.state.isCrash && this.renderCrashScreen() }
        </div>
        <Modal ref="md_sign_message" closeOnClick={false}>
          <SignMessageScreen 
            THIS={this}
            modalConfirmPinCode={this.refs.modalConfirmPinCode}
            PinCodeForDapp={true}
          />
        </Modal>
        <Modal ref="md_sign_transaction" closeOnClick={false}>
          <SignTransactionScreen THIS={this} renderWETHFormat={this.renderWETHFormat} renderPriceFormat={this.renderPriceFormat}/>
        </Modal>
        <Modal ref="modalConfirmPinCode" closeOnClick={false}>
          <ConfirmPINCodeScreen
            t={this.props.t}
            THIS={this}
            onChangeInputPINCode={this.funcChangeInputPINCode}
            onCompleteInputPINCode={this.funcCompleteInputPINCode}
            parent={'BrowserScreen'} // fix here
          />
        </Modal>
        <Modal ref="md_account_switched" closeOnClick={false}>
          <AccountSwitched THIS={this} switchedAccount={this.state.switchedAccount}/>
        </Modal>
      </div>
    )
  }
  renderMainNav () {
    const { isShowBrowserAddress, mainAccount } = this.state
    const { settingUrls, onCloseAdvertisement } = this.props
    return (
      <div className={'browser-main-nav ' + (this.props.localeData === 'vn' ? ' locale-vn ' : '') + (this.props.localeData === 'jp' || this.props.localeData === 'cn' ? ' locale-jp-cn' : '') + (isShowBrowserAddress ? ' is-show-address' : '')}>
        <div className="browser-back" onClick={this.props.onClickGoBack}>
          <img className="img-back" alt="imgBack" src={Images.tabNaviBack} />
        </div>
        <div className="browser-forward" onClick={this.props.onClickGoForward}>
          <img className="img-forward" alt="imgForward" src={Images.tabNaviNext} />
        </div>
        <div className="browser-home" onClick={this.props.backHome}>
          <img src={Images.ic_dapps} />
        </div>
        <div className='browser-favorite' onClick={this.props.handleChangeFavorite}>
          <img src={this.state.isMyFavorite ? Images.Like : Images.unLike} />
        </div>
        <div className={'browser-reload ' + (this.state.isReloadBrowser ? 'browser-reload-active' : '')} onClick={this.props.onClickRefreshPage}>
          <img src={Images.ic_reload} />
        </div>
        <div className={'browser-voting' + (!this.props.selectedGame ? ' browser-disabled' : '')}>
          <Dropdown overlay={this.renderVoting()}>
            <img src={this.state.ratingValue > 0 ? Images.ic_white_star : Images.ic_grey_star} />
          </Dropdown>
        </div>
        <div className="browser-balance">
          <div className="browser-balance-txt"><span className="browser-account">{mainAccount.cardName === 'Main Account' ? this.props.t('mainAccount') : mainAccount.cardName}</span><span className='browser-mainAccountBalance'>{this.props.t('Dapps.mainAccountBalance')}</span></div>
          <div className="browser-balance-value">
            {this.renderWETHFormat(mainAccount.balance, 8)}
            <div className="browser-balance-symbol">ETH</div>
          </div>
          <div className={'browser-balance-reload ' + (this.state.isReloadBalance ? 'browser-balance-reload-active' : '')} onClick={this.props.onClickReloadBalance}>
            <img src={Images.ic_reload_balance} />
          </div>
        </div>
        { settingUrls.bannerUrl5_status || settingUrls.bannerUrl6_status
          ? <div className="browser-advertisement">
            { settingUrls.bannerUrl5_status && <img 
              src={'https://s3-ap-northeast-1.amazonaws.com/hb-dex/banners/banner_5.png?t=' + moment(new Date()).unix()}
              onClick={() => settingUrls.bannerUrl5 && openBrowserInNewTab(settingUrls.bannerUrl5)}
            /> }
            { settingUrls.bannerUrl6_status && <img 
              src={'https://s3-ap-northeast-1.amazonaws.com/hb-dex/banners/banner_6.png?t=' + moment(new Date()).unix()}
              onClick={() => settingUrls.bannerUrl6 && openBrowserInNewTab(settingUrls.bannerUrl6)}
            /> }
            <img 
              src={Images.ic_close} 
              className="browser-advertisement-close"
              onClick={onCloseAdvertisement}
            />
          </div>
          : null
        }
        
        <div className="browser-address">
          <Form className="browser-form-address" onSubmit={this.props.onSubmitLink}>
            <HBInput
              placeholder={this.props.t('Dapps.searchDapps')}
              value={this.state.txtLinkTemp || this.state.txtLink}
              className="browser-input-address"
              onChange={this.props.onChangeLink}
              readOnly={true}
            />
          </Form>
        </div>
      </div>
    )
  }
  renderVoting () {
    return (
      <div className="browser-star">
        <StarRatings
          rating={this.state.ratingValue}
          numberOfStars={5}
          starRatedColor='rgb(255, 206, 0)'
          starEmptyColor='rgb(168, 168, 168)'
          starHoverColor='rgb(255, 206, 0)'
          starDimension='13px'
          starSpacing='2px'
          svgIconPath='M213.333 10.441l65.916 133.576 147.418 21.419L320 269.41l25.173 146.816-131.84-69.316-131.848 69.316 25.182-146.816L0 165.436l147.409-21.419z'
          svgIconViewBox='0 0 426.667 426.667'
          title={null}
          changeRating={this.props.onChangeRating}
        />
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
  renderAmountFormat (amount, decimals) {
    const firstNumber = formatNumberLeftZero(amount, decimals).toString().split('.')[0]
    const secondNumber = formatNumberLeftZero(amount, decimals).toString().split('.')[1]
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderWETHFormat (amount, decimals) {
    const { firstNumber, secondNumber } = formatNumberDisplay(amount, decimals)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderPriceFormat (price) {
    const { firstNumber, secondNumber } = formatFiatDisplay(price)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  funcCompleteInputPINCode = (value, self) => this.props.onCompleteInputPINCode(value, self, this)
  funcChangeInputPINCode =(value, index) => console.log(value, index)
}
