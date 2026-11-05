import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import Images from 'Assets/Image'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'

import './styles.css'
const { Sider } = Layout
const SubMenu = Menu.SubMenu
const appVersion = window.require('electron').remote.app.getVersion()

class TabLayoutContainerSettings extends PureComponent {
  constructor (props) {
    super(props)
    props.funcDefautlThis(this)
    this.state = {
      iChangeView: 1,
      isOpenSubMenu: false,
      selectedKeys: '1'
    }
    this.selectedTabAddToken = this.selectedTabAddToken.bind(this)
    Observer.on(OBSERVER_KEY.SELECT_TAB_ADD_TOKEN, this.selectedTabAddToken)
  }
  selectedTabAddToken () {
    this.props.history.push('/mainTabbar/settingScreen/addTokenScreen')
    this.setState({
      selectedKeys: '8'
    })
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.SELECT_TAB_ADD_TOKEN, this.selectedTabAddToken)
  }
  componentWillUpdate () {
    console.log('componentWillUpdate', this.props.history.location.pathname)
    if (this.props.history.location.pathname === '/mainTabbar/settingScreen') {
      this.props.history.push('/mainTabbar/settingScreen/notifications')
    }
  }
  componentDidMount () {
    this.props.history.push('/mainTabbar/settingScreen/notifications')
  }
  render () {
    const { AppRouter, arrPinCodeData, gotoEtherTab, t, unReadNoti } = this.props
    const { selectedKeys } = this.state

    return (
      <div className="tabContainerSettings">
        <Layout className="viewSettingLayout">
          <Sider width={236} className="viewSettingSider">
            <div>
              <div className="titleSettingSider">
                <img className='st-image' alt='img' src={Images.appLogo} onClick={gotoEtherTab}/>
              </div>
              <div className='st-title'>HB Wallet Desktop</div>
              <div className="st-version">Version {appVersion}</div>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              className="menu-setting-menu"
              id="HBScrollBar"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['1']}
              selectedKeys={[selectedKeys]}
              onClick={(item) => {
                this.setState({
                  selectedKeys: item.key
                })
              }}
            >
              <Menu.Item key="1"><Link to="/mainTabbar/settingScreen/notifications" className="menu-setting-menu-item">
                <div className='menu-wrapNoti'>
                  {t('notifications')}
                  {Number(unReadNoti) > 0 && <div className='notiNumber'>{unReadNoti}</div>}
                </div></Link>
              </Menu.Item>
              <Menu.Item key="15"><Link to="/mainTabbar/settingScreen/language" className="menu-setting-menu-item">{t('language')}</Link></Menu.Item>
              <Menu.Item key="20"><Link to="/mainTabbar/settingScreen/walletSettingScreen" className="menu-setting-menu-item">{t('WalletSettings')}</Link></Menu.Item>
              {
                arrPinCodeData.length > 0
                  ? <SubMenu className="menu-setting-menu-item" key="sub1"
                    title={<span onClick={() => {
                      if (this.state.isOpenSubMenu === false) {
                        this.props.history.push('/mainTabbar/settingScreen/changePINCodeScreen')
                        this.setState({
                          selectedKeys: 'sub11'
                        })
                      }
                      this.setState({
                        isOpenSubMenu: !this.state.isOpenSubMenu
                      })
                    }}
                    >{t('Security')}</span>}>

                    <Menu.Item key="sub11">
                      <Link to={'/mainTabbar/settingScreen/changePINCodeScreen'} >{t('ChangePINCode')}</Link>
                    </Menu.Item>
                    <Menu.Item key="sub12">
                      <Link to={'/mainTabbar/settingScreen/removePINCodeScreen'} >{t('RemovePINCode')}</Link>
                    </Menu.Item>
                  </SubMenu>
                  : <SubMenu className="menu-setting-menu-item" key="sub1"
                    title={<span onClick={() => {
                      if (this.state.isOpenSubMenu === false) {
                        this.props.history.push('/mainTabbar/settingScreen/setupPINCodeScreen')
                        this.setState({
                          selectedKeys: 'sub11'
                        })
                      }
                      this.setState({
                        isOpenSubMenu: !this.state.isOpenSubMenu
                      })
                    }}
                    >{t('Security')}</span>}>
                    <Menu.Item key="sub11">
                      <Link to={'/mainTabbar/settingScreen/setupPINCodeScreen'} >{t('SetupPINCode')}</Link>
                    </Menu.Item>
                  </SubMenu>
              }
              <Menu.Item key="11"><Link to="/mainTabbar/settingScreen/regionalCurrencyScreen" className="menu-setting-menu-item">{t('RegionalCurrency')}</Link></Menu.Item>
              <Menu.Item key="12"><Link to="/mainTabbar/settingScreen/manageAccountBookScreen" className="menu-setting-menu-item">{t('ManageAccountBook')}</Link></Menu.Item>
              <Menu.Item key="5"><Link to="/mainTabbar/settingScreen/displayPassphraseScreen" className="menu-setting-menu-item">{t('DisplayPasspharase')}</Link></Menu.Item>
              <Menu.Item key="6"><Link to="/mainTabbar/settingScreen/displayPrivateKeyScreen" className="menu-setting-menu-item">{t('DisplayPrivateKey')}</Link></Menu.Item>
              <Menu.Item key="18"><Link to="/mainTabbar/settingScreen/importAccountScreen" className="menu-setting-menu-item">{t('Ethereum.importAccount')}</Link></Menu.Item>
              <Menu.Item key="8"><Link to="/mainTabbar/settingScreen/addTokenScreen" className="menu-setting-menu-item">{t('addCustomToken')}</Link></Menu.Item>
              <Menu.Item key="16"><Link to="/mainTabbar/settingScreen/registerTokenCardScreen" className="menu-setting-menu-item">{t('registerTokenCard')}</Link></Menu.Item>
              {/* <Menu.Item key="17"><Link to="/mainTabbar/settingScreen/advancedWalletScreen" className="menu-setting-menu-item">{t('AdvancedWallet')}</Link></Menu.Item> */}
              <Menu.Item key="19"><Link to="/mainTabbar/settingScreen/applyForAirdropScreen" className="menu-setting-menu-item">{t('ApplyForAirdrop')}</Link></Menu.Item>
              <Menu.Item key="7"><Link to="/mainTabbar/settingScreen/watchContractScreen" className="menu-setting-menu-item">{t('WatchContract')}</Link></Menu.Item>
              <Menu.Item key="9"><Link to="/mainTabbar/settingScreen/deleteDatabase" className="menu-setting-menu-item">{t('WalletInitialize')}</Link></Menu.Item>
              <Menu.Item key="10"><Link to="/mainTabbar/settingScreen/howToSend" className="menu-setting-menu-item">{t('HowtoSendReceive')}</Link></Menu.Item>
              <Menu.Item key="13"><Link to="/mainTabbar/settingScreen/aboutScreen" className="menu-setting-menu-item">{t('AboutHBBlockchainInterface')}</Link></Menu.Item>
              <Menu.Item key="14"><Link to="/mainTabbar/settingScreen/helpScreen" className="menu-setting-menu-item">{t('Help')}</Link></Menu.Item>
              <Menu.Item key="21"><Link to="/mainTabbar/settingScreen/operationSystem" className="menu-setting-menu-item">{t('operationSystem')}</Link></Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <AppRouter/>
          </Layout>
        </Layout>
      </div>
    )
  }
}
export default TabLayoutContainerSettings
