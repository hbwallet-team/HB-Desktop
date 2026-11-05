import React from 'react'
import CoreLayoutContainer from 'Frontend/Container/CoreLayoutContainer'
import { HBInput } from 'Frontend/Components/HBInput'
import LoadingBar from 'react-redux-loading-bar'
import DappScreen from 'Frontend/Screen/DappScreen'
import SignMessageScreen from 'Frontend/Screen/DappScreen/sub-view/SignMessageScreen'
import SignTransactionScreen from 'Frontend/Screen/DappScreen/sub-view/SignTransactionScreen'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import ConfirmPINCodeScreen from 'Frontend/Screen/SettingScreen/sub-view/ConfirmPINCodeScreen/view'
import FormatBalance from 'Frontend/Components/FormatBalance'
import { filterMainAccount } from 'Utils/globalFunction'
import { Form, Tooltip } from 'antd'
import Images from 'Assets/Image'
import './styles.css'
import 'electron-tabs/electron-tabs.css'
import 'dragula/dist/dragula.min.css'
const ipc = window.require('electron').ipcRenderer

export default class BrowserScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      txtLink: '',
      txtNonce: '',
      jsContent: '',
      selectedGame: null,
      payload: null,
      sendData: null,
      isSend: false,
      isFeeErr: false,
      isNewTab: true,
      isMyFavorite: false,
      isCanBack: false,
      isCanForward: false,
      isCanAddFavorite: false,
      isCanReloadPage: false,
      isCrash: false,
      isReloadPage: false,
      isReloadBalance: false,
      isShowBrowserAddress: false,
      isLoadingSignMessage: false,
      isLoadingSignTransaction: false,
      switchedAccount: null,
      transactionFee: 0,
      valueInputGas: 0
    }
    props.defaultThis(this)
  }
  componentDidMount () {
    setTimeout(() => {
      this.props.loadingInitial()
    }, 1000)
    // listening trigger from main window
    ipc.on('open-browser-in-new-tab', this.props.openNewTab)
    ipc.on('open-browser-in-same-tab', this.props.openSameTab)
    ipc.on('switched-account', this.props.triggerSwitchAccount)
    ipc.on('reset-wallet', this.props.triggerResetWallet)
    ipc.on('change-language', this.props.triggerChangeLanguage)
  }
  componentWillUnmount () {
    const webview = document.querySelector('webview')
    if (webview) {
      webview.removeEventListener('did-start-loading', this.props.loadingStart)
      webview.removeEventListener('did-stop-loading', this.props.loadingStop)
    }
    this.props.loadingStop()
  }
  render () {
    const { t } = this.props
    return (
      <CoreLayoutContainer title={t('mainTabbar.Browser')}>
        <div className="browser-container">
          { this.renderMainNav() }
          <div className="browser-view">
            {/* { this.state.isCrash && this.renderCrashScreen() } */}
            <div className="etabs-tabgroup">
              <div className="etabs-tabs"></div>
              <div className="etabs-buttons"></div>
            </div>
            <LoadingBar style={{ backgroundColor: '#067af7', height: '2px' }} />
            {this.state.isNewTab && <DappScreen />}
            <div className="etabs-views"></div>
          </div>
          <Modal ref="md_sign_message" closeOnClick={false}>
            <SignMessageScreen 
              THIS={this}
              modalConfirmPinCode={this.refs.modalConfirmPinCode}
              PinCodeForDapp={true}
            />
          </Modal>
          <Modal ref="md_sign_transaction" closeOnClick={false}>
            <SignTransactionScreen THIS={this}/>
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
        </div>
      </CoreLayoutContainer>
    )
  }
  renderMainNav () {
    const { isShowBrowserAddress, isCanBack, isCanForward, isMyFavorite, isCanAddFavorite, isReloadBrowser, isCanReloadPage } = this.state
    const { arrCardData } = this.props
    const mainAccount = filterMainAccount(arrCardData)
    return (
      <div className={'browser-main-nav ' + (this.props.localeData === 'vn' ? ' locale-vn ' : '') + (this.props.localeData === 'jp' || this.props.localeData === 'cn' ? ' locale-jp-cn' : '') + (isShowBrowserAddress ? ' is-show-address' : '')}>
        <div className="browser-btn">
          <Tooltip placement="bottom" title={this.props.t('Browser.showThePreviousPage')}>
            <div className={'browser-back' + (isCanBack ? '' : ' disable')} onClick={this.props.onClickGoBack}>
              <img className="img-back" alt="imgBack" src={isCanBack ? Images.tabNaviBack : Images.tabNaviBackDisable} />
            </div>
          </Tooltip>
          <Tooltip placement="bottom" title={this.props.t('Browser.showTheNextPage')}>
            <div className={'browser-forward' + (isCanForward ? '' : ' disable')} onClick={this.props.onClickGoForward}>
              <img className="img-forward" alt="imgForward" src={isCanForward ? Images.tabNaviNext : Images.tabNaviNextDisable} />
            </div>
          </Tooltip>
          <Tooltip placement="bottom" title={this.props.t('Browser.addToFavorites')}>
            <div className={'browser-favorite' + (isCanAddFavorite ? '' : ' disable')} onClick={this.props.handleChangeFavorite}>
              <img src={isCanAddFavorite ? (isMyFavorite ? Images.Like : Images.whiteHeart) : Images.unLike} />
            </div>
          </Tooltip>
        </div>
        <div className="browser-address">
          <Form className="browser-form-address" onSubmit={this.props.onSubmitLink}>
            <HBInput
              placeholder={this.props.t('Browser.searchWebsite')}
              value={this.state.txtLink}
              className="browser-input-address"
              onChange={this.props.onChangeLink}
            />
          </Form>
          <Tooltip placement="bottom" title={this.props.t('Browser.reloadThisPage')}>
            <div className={'browser-reload' + (isCanReloadPage ? '' : ' disable') + (isReloadBrowser ? ' browser-reload-active' : '')} onClick={this.props.onClickRefreshPage}>
              <img src={isCanReloadPage ? Images.refresh : Images.refreshBalance} />
            </div>
          </Tooltip>
        </div>
        <div className="browser-balance">
          <div className="browser-balance-txt"><span className="browser-account">{mainAccount.cardName === 'Main Account' ? this.props.t('mainAccount') : mainAccount.cardName}</span><span className='browser-mainAccountBalance'>{this.props.t('Dapps.mainAccountBalance')}</span></div>
          <div className="browser-balance-value">
            <FormatBalance balance={mainAccount.balance} />
            <div className="browser-balance-symbol">ETH</div>
          </div>
          <div className={'browser-balance-reload ' + (this.state.isReloadBalance ? 'browser-balance-reload-active' : '')} onClick={this.props.onClickReloadBalance}>
            <img src={Images.ic_reload_balance} />
          </div>
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
  funcCompleteInputPINCode = (value, self) => this.props.onCompleteInputPINCode(value, self, this)
  funcChangeInputPINCode =(value, index) => console.log(value, index)
}
