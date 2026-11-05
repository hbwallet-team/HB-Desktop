import React from 'react'
import './styles.css'
import CoreLayoutContainer from 'Frontend/Container/CoreLayoutContainer'
import Images from 'Assets/Image'
import { Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY, TABBAR_INDEX, APP_PATH, LANGUAGES } from 'Utils/globalConstants'
import { filterMainAccount, openBrowserInNewTab } from 'Utils/globalFunction'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import ModalNewFeature from './components/ModalNewFeature'
import { approve, batchSendToken } from 'Backend/Lib/Web3/index'

const { shell, ipcRenderer } = window.require('electron')
const { Sider } = Layout

export default class MainTabbar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newFeatureID: '',
      newFeatures: []
    }
    props.defaultThis(this)
    this.currentTabIndex = TABBAR_INDEX.ETHEREUM
    this.disableBtnLeft = true
    this.disableBtnRight = false
    this.naviBack = this.naviBack.bind(this)
    this.naviNext = this.naviNext.bind(this)
    this.selectedTabToken = this.selectedTabToken.bind(this)
    this.selectedTabEther = this.selectedTabEther.bind(this)
    this.selectedTabExchangeScreen = this.selectedTabExchangeScreen.bind(this)
    this.HBExchangeScreen = this.HBExchangeScreen.bind(this)
    this.selectedTabExchange = this.selectedTabExchange.bind(this)
    this.selectedTabSetting = this.selectedTabSetting.bind(this)
    this.loopTransferAndApprove = this.loopTransferAndApprove.bind(this)
    this.sendSignedTransaction = this.sendSignedTransaction.bind(this)
    this.allLoopTransferDone = this.allLoopTransferDone.bind(this)
    this.selectedTabDapp = this.selectedTabDapp.bind(this)
    Observer.on(OBSERVER_KEY.SELECT_TAB_TOKEN, this.selectedTabToken)
    Observer.on(OBSERVER_KEY.SELECT_TAB_ETHER, this.selectedTabEther)
    Observer.on(OBSERVER_KEY.SELECT_TAB_SETTING, this.selectedTabSetting)
    Observer.on(OBSERVER_KEY.SELECT_TAB_EXCHANGE, this.selectedTabExchange)
    Observer.on(OBSERVER_KEY.SELECT_TAB_EXCHANGE_SCREEN, this.selectedTabExchangeScreen)
    Observer.on(OBSERVER_KEY.HB_EXCHANGE_SCREEN, this.HBExchangeScreen)
    Observer.on(OBSERVER_KEY.LOOP_TRANSFER_AND_APPROVE, this.loopTransferAndApprove)
    Observer.on(OBSERVER_KEY.SEND_SIGNED_TRANSACTION, this.sendSignedTransaction)
    Observer.on(OBSERVER_KEY.ALL_LOOP_TRANSFER_DONE, this.allLoopTransferDone)
    Observer.on(OBSERVER_KEY.SELECT_TAB_DAPP, this.selectedTabDapp)
    Observer.on(OBSERVER_KEY.GET_DATA_AFTER_APPLY_AIRDROP, props.updateDataAfterApplyForAirdrop)
    Observer.on(OBSERVER_KEY.GET_DATA_AFTER_APPLY_AIRDROP_PAYMENT_FEE, props.updateDataAfterApplyForAirdropPaymentFee)
    Observer.on(OBSERVER_KEY.NEW_DEX_NOTIFICATIONS, props.updateDexNotifications)
    Observer.on(OBSERVER_KEY.NEW_DEX_REQUEST_EVENT, props.updateDexRequestEvent)
    Observer.on(OBSERVER_KEY.NEW_AIRDROP, props.refreshGrabToken)
  }
  async componentDidMount () {
    await this.props.loadingInitial()
    this.props.fetchChartEtherPrice()
    // this.props.fetchLastTransaction()
    this.props.fetchSettingUrls()
    // this.props.fetchLatestVersion()
    this.props.fetchHBTokens()
    this.props.fetchSwapTokens()
    this.props.fetchTotalSync()
    this.props.fetchScamCoins()
    this.props.fetchCompoundRate()
    this.props.fetchNewFeatures()
    this.props.updateDexNotifications(false)
    // this.props.updateDataAfterApplyForAirdrop()
    this.props.updateDataAfterApplyForAirdropPaymentFee()
    // call to get name of HB contract
    this.props.fetchHBContract()
    // listening trigger from sub window
    ipcRenderer.on('switched-account', this.props.triggerSwitchedAccount)
    ipcRenderer.on('open-browser-in-new-tab', this.props.triggerOpenBrowser)
    this.props.downloadCompleted()
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.GET_DATA_AFTER_APPLY_AIRDROP, this.props.updateDataAfterApplyForAirdrop)
    Observer.removeListener(OBSERVER_KEY.GET_DATA_AFTER_APPLY_AIRDROP_PAYMENT_FEE, this.props.updateDataAfterApplyForAirdropPaymentFee)
    Observer.removeListener(OBSERVER_KEY.NEW_DEX_NOTIFICATIONS, this.props.updateDexNotifications)
    Observer.removeListener(OBSERVER_KEY.NEW_DEX_REQUEST_EVENT, this.props.updateDexRequestEvent)
  }
  initLanguage = (local) => {
    switch (local) {
    case 'jp':
      return LANGUAGES[1]
    case 'cn':
      return LANGUAGES[2]
    case 'ru':
      return LANGUAGES[3]
    case 'es':
      return LANGUAGES[4]
    case 'pt':
      return LANGUAGES[5]
    case 'th':
      return LANGUAGES[6]
    case 'vn':
      return LANGUAGES[7]
    default:
      return LANGUAGES[0]
    }
  }

  naviBack = () => {
    this.disableBtnLeft = false
    this.disableBtnRight = false

    switch (this.currentTabIndex) {
    case TABBAR_INDEX.TOKENS:
      this.disableBtnLeft = true
      this.props.history.push(APP_PATH.ETHEREUM_SCREEN)
      break
    case TABBAR_INDEX.GRAB_TOKEN:
      this.props.history.push(APP_PATH.TOKENS_SCREEN)
      break
    case TABBAR_INDEX.EXCHANGE:
      this.props.history.push(APP_PATH.GRAB_TOKEN_SCREEN)
      break
    case TABBAR_INDEX.DAPP:
      this.props.history.push(APP_PATH.EXCHANGE_TOP)
      break
    case TABBAR_INDEX.MARKET_TRACKER:
      this.props.history.push(APP_PATH.DAPP)
      break
    case TABBAR_INDEX.SETTINGS:
      this.props.history.push(APP_PATH.MARKET_TRACKER_SCREEN)
      break
    default:
    }
    this.currentTabIndex--
  }

  naviNext = () => {
    this.disableBtnLeft = false
    this.disableBtnRight = false

    switch (this.currentTabIndex) {
    case TABBAR_INDEX.ETHEREUM:
      this.props.history.push(APP_PATH.TOKENS_SCREEN)
      break
    case TABBAR_INDEX.TOKENS:
      this.props.history.push(APP_PATH.GRAB_TOKEN_SCREEN)
      break
    case TABBAR_INDEX.GRAB_TOKEN:
      this.props.history.push(APP_PATH.EXCHANGES_SCREEN)
      break
    case TABBAR_INDEX.EXCHANGE:
      this.props.history.push(APP_PATH.DAPP_SCREEN)
      break
    case TABBAR_INDEX.DAPP_SCREEN:
      this.props.history.push(APP_PATH.MARKET_TRACKER_SCREEN)
      break
    case TABBAR_INDEX.MARKET_TRACKER:
      this.disableBtnRight = true
      this.props.history.push(APP_PATH.SETTINGS_SCREEN)
      break
    default:
    }
    this.currentTabIndex++
  }

  static hightlight () {
    this.currentTabIndex = TABBAR_INDEX.TOKENS
  }

  selectedTabToken () {
    this.props.history.push(APP_PATH.TOKENS_SCREEN)
    this.currentTabIndex = TABBAR_INDEX.TOKENS
    this.disableBtnLeft = false
    this.disableBtnRight = false
  }
  selectedTabEther () {
    this.props.history.push(APP_PATH.ETHEREUM_SCREEN)
    this.currentTabIndex = TABBAR_INDEX.ETHEREUM
    this.disableBtnLeft = true
    this.disableBtnRight = false
  }
  selectedTabExchange () {
    this.props.history.push(APP_PATH.EXCHANGE_TOP)
    this.currentTabIndex = TABBAR_INDEX.EXCHANGE
    this.disableBtnLeft = false
    this.disableBtnRight = false
  }
  selectedTabExchangeScreen () {
    console.log('this.props', this.props)
    this.props.history.push(APP_PATH.EXCHANGE_SCREEN)
    this.currentTabIndex = TABBAR_INDEX.EXCHANGE
    this.disableBtnLeft = false
    this.disableBtnRight = false
  }
  HBExchangeScreen () {
    this.props.history.push({pathname: APP_PATH.EXCHANGE_TOP, state: {changeToHB: true}})
    this.currentTabIndex = TABBAR_INDEX.EXCHANGE
    this.disableBtnLeft = false
    this.disableBtnRight = false
  }
  selectedTabSetting () {
    this.props.history.push(APP_PATH.SETTINGS_SCREEN)
    this.currentTabIndex = TABBAR_INDEX.SETTINGS
    this.disableBtnLeft = false
    this.disableBtnRight = true
  }
  selectedTabDapp () {
    this.props.history.push(APP_PATH.DAPP_SCREEN)
    this.currentTabIndex = TABBAR_INDEX.DAPP
    this.disableBtnLeft = false
    this.disableBtnRight = false
  }
  async loopTransferAndApprove () {
    const {advancedWallet} = this.props
    console.log('123---advancedWallet: ', advancedWallet)
    let txs = await batchSendToken(advancedWallet.address, advancedWallet.amount, advancedWallet.tokenAddress, advancedWallet.privateKeyHex, advancedWallet.account, advancedWallet.offset, advancedWallet.approveAmount, advancedWallet.valueGwei, advancedWallet.gasLimitForArr, advancedWallet.numOfAmount, advancedWallet.totalAddress, advancedWallet.fileCSVName, advancedWallet.timeStamp, advancedWallet.tokenName, advancedWallet.tokenSymbol)
    console.log('123---txs: ', txs)
    Observer.emit(OBSERVER_KEY.SAVE_IN_ADVANCED_WALLET_HISTORY, txs)
  }
  async sendSignedTransaction (result) {
    this.props.awaitTransaction(result)
  }
  async allLoopTransferDone (result) {
    this.props.awaitAllLoopTransferDone(result)
  }
  render () {
    const {
      AppRouter,
      // changeLanguage, renderDropdownValue,
      t, unReadGrab, unReadNoti, internetData, localeData, unReadGameItemSync, arrCardData
    } = this.props
    let mainAccount = filterMainAccount(arrCardData)
    let getLinkForBacoor = () => {
      switch (localeData) {
      case 'jp':
        return 'https://www.hb-wallet.com/support-jp'
      case 'cn':
        return 'https://www.hb-wallet.com/support-cn'
      default:
        return 'https://www.hb-wallet.com/support'
      }
    }

    return (
      <CoreLayoutContainer internetData={internetData}>
        <Layout>
          <Sider className="sliderTab">
            {/* <div className="groub-nav-btns">
              <button className="btn-nav" disabled={this.disableBtnLeft} onClick={() => this.naviBack()}>
                <img alt="img" className="img-nav-left" src={require('Assets/Image/buttons/ic_nav_left_enable.svg')} />
              </button>
              <button className="btn-nav" disabled={this.disableBtnRight} onClick={() => this.naviNext()}>
                <img alt="img" className="img-nav-right" src={require('Assets/Image/buttons/ic_nav_right_enable.svg')} />
              </button>
            </div> */}
            <div className={'showMainAccount ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>
              {mainAccount 
                ? mainAccount.cardName === 'Main Account' 
                  ? t('mainAccount') 
                  : mainAccount.cardName 
                : ''}
            </div>
            <Menu id='mainTabbar' theme="dark" mode="inline"
              defaultSelectedKeys={['0']}
              onClick={(item) => {
                if (item.key === '9') {
                  this.props.openBrowserScreen()
                }
                this.disableBtnLeft = false
                this.disableBtnRight = false
                this.currentTabIndex = parseInt(item.key)
                if (this.currentTabIndex === TABBAR_INDEX.ETHEREUM) {
                  this.disableBtnLeft = true
                } else if (this.currentTabIndex === TABBAR_INDEX.SETTINGS) {
                  this.disableBtnRight = true
                }
              }}
              onChange={() => this.hightlight()}
              selectedKeys={[this.currentTabIndex.toString()]}
              className="menu-tab"
            >
              <Menu.Item key="0" className='tab' >
                <Link to={APP_PATH.ETHEREUM_SCREEN}>
                  <div className="tab-img">
                    <img alt="0" src={this.currentTabIndex === TABBAR_INDEX.ETHEREUM ? Images.EthereumNewActive : Images.EthereumNew} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>{t('mainTabbar.Ethereum')}</div>
                </Link>
              </Menu.Item>
              <Menu.Item key="1" className="tab">
                <Link to={APP_PATH.TOKENS_SCREEN}>
                  <div className="tab-img">
                    <img alt="1" src={this.currentTabIndex === TABBAR_INDEX.TOKENS ? Images.ERC20Active : Images.ERC20} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>{t('mainTabbar.ERC20')}</div>
                </Link>
              </Menu.Item>
              <Menu.Item key="8" className="tab">
                {Number(unReadGameItemSync) > 0 && <div className='tbBadgeNumber'>{unReadGameItemSync}</div>}
                <Link to={APP_PATH.DAPP_ASSET}>
                  <div className="tab-img">
                    <img alt="8" src={this.currentTabIndex === TABBAR_INDEX.DAPP_ASSET ? Images.ERC721NewActive : Images.ERC721New} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>{t('mainTabbar.ERC721')}</div>
                </Link>
              </Menu.Item>
              <Menu.Item key="3" className="tab" >
                <Link to={APP_PATH.EXCHANGE_TOP}>
                  <div className="tab-img">
                    <img style={{marginTop: '3px', marginBottom: '3px'}} alt="3" src={this.currentTabIndex === TABBAR_INDEX.EXCHANGE ? Images.ExchangesNewActive : Images.ExchangesNew} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>HB DEX</div>
                </Link>
              </Menu.Item>
              <Menu.Item key="7" className="tab">
                <Link to={APP_PATH.DAPP_MARKET_SCREEN}>
                  <div className="tab-img tab-img25px">
                    <img alt="7" src={this.currentTabIndex === TABBAR_INDEX.DAPP_MARKET ? Images.ic_market : Images.ic_marketUnactive} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>{t('Dapps.market')}</div>
                </Link>
              </Menu.Item>
              <Menu.Item key="2" className="tab">
                <Link to={APP_PATH.GRAB_TOKEN_SCREEN}>
                  {Number(unReadGrab) > 0 && <div className='tbBadgeNumber'>{unReadGrab}</div>}
                  <div className="tab-img">
                    <img alt="2" src={this.currentTabIndex === TABBAR_INDEX.GRAB_TOKEN ? Images.GrabTokenNewActive : Images.GrabTokenNew} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>{t('mainTabbar.GrabToken')}</div>
                </Link>
              </Menu.Item>
              {/* <Menu.Item key="4" className="tab">
                <Link to={APP_PATH.DAPP_SCREEN}>
                  <div className="tab-img">
                    <img alt="4" src={this.currentTabIndex === TABBAR_INDEX.DAPP ? Images.tabDappActive : Images.tabDapp} />
                  </div>
                  <div className='text-tabbar'>{t('mainTabbar.Dapp')}</div>
                </Link>
              </Menu.Item> */}
              {/* <Menu.Item key="4" className="tab" disabled={true}>
                <Link to={SHAPE_SHIFT_PATH} disabled={this.currentTabIndex === TABBAR_INDEX.SHAPE_SHIFT}>
                <Link to={SHAPE_SHIFT_PATH} disabled={true}>
                  <div className="tab-img">
                    <img alt="4" src={Images.ShapeshiftNew} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' ? 'text-fontJapan-2px' : '')}>{t('mainTabbar.ShapeShift')}</div>
                </Link>
              </Menu.Item> */}
              {/* <Menu.Item key="5" className="tab">
                <Link to={APP_PATH.MARKET_TRACKER_SCREEN}>
                  <div className="tab-img">
                    <img alt="5" src={this.currentTabIndex === TABBAR_INDEX.MARKET_TRACKER ? Images.MarketPriceNewActive : Images.MarketPriceNew} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>{t('mainTabbar.marketTracker')}</div>
                </Link>
              </Menu.Item> */}
              <Menu.Item key="9" className="tab">
                <div className="tab-img">
                  <img alt="9" src={Images.Web3New} />
                </div>
                <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>{t('mainTabbar.Browser')}</div>
              </Menu.Item>
              <Menu.Item key="6" className="tab" id='tabsetting'>
                <Link to={APP_PATH.SETTINGS_SCREEN} replace>
                  {Number(unReadNoti) > 0 && <div className='tbBadgeNumber'>{unReadNoti}</div>}
                  <div className="tab-img">
                    <img alt="6" src={this.currentTabIndex === TABBAR_INDEX.SETTINGS ? Images.SettingsNewActive : Images.SettingsNew} />
                  </div>
                  <div className={'text-tabbar ' + (localeData === 'jp' || localeData === 'cn' ? 'text-fontJapan-2px' : '')}>{t('mainTabbar.Settings')}</div>
                </Link>
              </Menu.Item>
            </Menu>
            {/* <div className="dropdown-language">
              <div className="select-up">
                <Select
                  disabled={false}
                  clearable={false}
                  searchable={false}
                  onChange={value => {
                    changeLanguage(value)
                  }}
                  options={LANGUAGES}
                  optionRenderer={renderDropdownValue}
                  value={this.state.dropdownValue}
                  valueRenderer={renderDropdownValue}
                />
              </div>
            </div> */}
            <div className="bacoorLogoView" id='btnScale-active'
              onClick={() => openBrowserInNewTab(getLinkForBacoor())}>
              <img alt='bacoor' className="bacoorLogo" src={Images.bacoorLogo}/>
            </div>
          </Sider>
          <Layout>
            <AppRouter/>
          </Layout>
        </Layout>
        <Modal ref="modalNewFeatures">
          <ModalNewFeature data={this.state.newFeatures} id={this.state.newFeatureID} parent={this} />
        </Modal>
      </CoreLayoutContainer>
    )
  }
}
