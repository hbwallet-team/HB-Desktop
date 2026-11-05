import React, { PureComponent } from 'react'
import Images from 'Assets/Image'
import './styles.css'
import TabLayoutContainer from 'Frontend/Container/TabLayoutContainer'
import { Menu, Dropdown, List, Row, Col, Tabs } from 'antd'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import HBChart from 'Frontend/Components/HBChart'
import AccountDetail from './TokenDetailScreen'
import { Wave, ThreeBounce } from 'better-react-spinkit'
import { Spin } from 'Frontend/Components/HBLoader'
import MDAddToken from './Components/MdAddToken'
import { formatNumber, formatNumberDisplay, formatFiatDisplay, numberWithCommasInt, filterMainAccount, openBrowserInNewTab } from 'Utils/globalFunction'
import { HBCURRENCY_SYMBOL, HBCURRENCY, ONE_TIME, TAB_SELECTED, OBSERVER_KEY } from 'Utils/globalConstants'
import Observer from 'Utils/HBObserver'
import moment from 'moment'
import QRCode from 'qrcode.react'
import MDQrCode from 'Frontend/Screen/EthereumScreen/Components/MdQrcode'
const { shell, ipcRenderer } = window.require('electron')
const TabPane = Tabs.TabPane

export default class View extends PureComponent {
  constructor (props) {
    super(props)
    this.ALL_TOKEN = props.t('allToken')
    this.state = {
      isActiveDetai: false,
      objSelectItem: null,
      animation: null,
      isLoadingCard: true,
      arrItems: [],
      arrShowItems: [],
      arrResults: undefined,
      strCardName: '',
      strSearch: '',
      tokenSelected: null,
      isOpenCreate: false,
      totalFiatBalance: 0,
      chartTime: ONE_TIME.ONE_DAY,
      strFilter: this.ALL_TOKEN,
      activeKey: '.$' + TAB_SELECTED.TAB_1,
      txtReceiveAmount: '',
      txtReceiveFiatAmount: '',
      receiverAddr: null
    }
    props.defaultThis(this)

    this.fTokenConvert = 0
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    this.datasOld = null
    Observer.on(OBSERVER_KEY.GET_DATA_AFTER_SEND_TOKEN, props.updateDataAfterSendToken)
    Observer.on(OBSERVER_KEY.SELECT_TAB_TOKEN_DETAIL, props.selectedTabTokenDetail)
  }
  componentDidMount () {
    this.props.loadingInitialData()
    this.props.fetchTopToken()
    // listening trigger from main window
    ipcRenderer.on('switched-account', this.props.triggerSwitchedAccount)
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.GET_DATA_AFTER_SEND_TOKEN, this.props.updateDataAfterSendToken)
  }
  get renderTopLeft () {
    const { t, arrCardData, settingUrls, openModalReceive } = this.props
    const mainAccount = filterMainAccount(arrCardData)
    return (
      <div className='tk-header-container editQR'>
        <Row className='eth-header-padding'>
          { settingUrls.bannerUrl3_status || settingUrls.bannerUrl4_status
            ? <div className='eth-header-group-banner'>
              { settingUrls.bannerUrl3_status && <img id='btnScale-active'
                onClick={() => settingUrls.bannerUrl3 && openBrowserInNewTab(settingUrls.bannerUrl3)}
                className='eth-ad-img1' alt='ad' src={'https://s3-ap-northeast-1.amazonaws.com/hb-dex/banners/banner_3.png?t=' + moment(new Date()).unix()}/> }
              { settingUrls.bannerUrl4_status && <img id='btnScale-active'
                onClick={() => settingUrls.bannerUrl4 && openBrowserInNewTab(settingUrls.bannerUrl4)}
                className='eth-ad-img2' alt='ad' src={'https://s3-ap-northeast-1.amazonaws.com/hb-dex/banners/banner_4.png?t=' + moment(new Date()).unix()}/> }
            </div>
            : null
          }
          <div className="tk-wrapToken-Overview">
            <div className="tk-text-header">
              {t('Dapps.erc20overview')}
            </div>
            <div className='tk-sub-header'>
              <div className="tk-sub-header-account">
                {t('myToken')}
              </div>
              <div className="tk-sub-header-content">
                {t('DisplayPrivateKey.noteContent')}
              </div>
              <div className='tk-sub-header-amount'>{mainAccount.address}</div>
            </div>
            <div className="edt-qrcode" id="btnHover" onClick={openModalReceive}>
              <QRCode value={mainAccount.address} size={80} bgColor="#fff" fgColor="#172540"/>
            </div>
          </div>
          <Modal ref="modalRequestReceive" className="md-request fix-layoutQR">
            <MDQrCode {...this.props}/>
          </Modal>
        </Row>
      </div>
    )
  }

  get renderTopRight () {
    const {
      totalFiatBalance, chartTime, strFilter, isLoadingCard
    } = this.state
    const {
      arrChartTokenAll, arrChartTokenAllYear, changeChartTime, arrTokenData,
      onChangeDropdown, arrChartTokenSingle, arrChartTokenSingleYear, t
    } = this.props
    const {firstNumber, secondNumber} = totalFiatBalance ? formatFiatDisplay(totalFiatBalance) : [0, 0]
    const dataTemp = [{close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}, {close: 0}]
    let dataShow = []
    if (chartTime === ONE_TIME.ONE_YEAR) {
      dataShow = strFilter === this.ALL_TOKEN
        ? arrChartTokenAllYear
        : !arrChartTokenSingleYear.isLoading
          ? arrChartTokenSingleYear
          : this.datasOld
    } else {
      dataShow = strFilter === this.ALL_TOKEN
        ? arrChartTokenAll
        : !arrChartTokenSingle.isLoading
          ? arrChartTokenSingle
          : this.datasOld
    }

    this.datasOld = dataShow

    let datas = []
    let count = 0
    switch (chartTime) {
    case ONE_TIME.ONE_DAY:
      for (let i = dataShow.datas.length; i > 0 && count <= 24; i--, count++) {
        datas.unshift(dataShow.datas[i])
      }
      break
    case ONE_TIME.ONE_WEEK:
      for (let i = dataShow.datas.length; i > 0 && count <= 170; i--, count++) { // 24 * 7 + 2 = 170
        datas.unshift(dataShow.datas[i])
      }
      break
    case ONE_TIME.ONE_MONTH:
      for (let i = dataShow.datas.length; i > 0 && count <= 720; i--, count++) { // 24 * 30 = 720
        datas.unshift(dataShow.datas[i])
      }
      break
    default:
      datas = dataShow.datas
      break
    }

    return (
      <div className="e-top-right">
        <div className="e-top-right-info">
          <Dropdown overlay={this.renderDropdownFilter(arrTokenData.filter(token => token.isEnabled), onChangeDropdown)} trigger={['click']} placement="bottomCenter">
            <div className="tk-dropdown-token" >
              <span className="tk-dropdown-token-text tk-dropdown-text-12">{strFilter} </span> <img src={Images.iconDropDown} />
            </div>
          </Dropdown>
          <div className='etherPrice12 tokenPorfolio'>{t('tokenPorfolio')}</div>
          <div className='text20-yellow'>
            {isLoadingCard
              ? <Wave size={25} color='white'/>
              : <div >{this.currency}{numberWithCommasInt(firstNumber)}
                <span>.</span>
                <span className='balance-lastNumber-currency'>{secondNumber || '00'}</span>
              </div>}
          </div>
        </div>
        <div className="tk-top-right-graph-view">
          <div className="e-top-right-graph">
            <div id='btnScale-active' onClick={() => changeChartTime(ONE_TIME.ONE_DAY)} className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_DAY ? 'eth-switch-active' : 'eth-switch-unActive')}>{t('1day')}</div>
            <div id='btnScale-active' onClick={() => changeChartTime(ONE_TIME.ONE_WEEK)} className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_WEEK ? 'eth-switch-active' : 'eth-switch-unActive')}>{t('1week')}</div>
            <div id='btnScale-active' onClick={() => changeChartTime(ONE_TIME.ONE_MONTH)} className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_MONTH ? 'eth-switch-active' : 'eth-switch-unActive')}>{t('1month')}</div>
            <div id='btnScale-active' onClick={() => changeChartTime(ONE_TIME.ONE_YEAR)} className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_YEAR ? 'eth-switch-active' : 'eth-switch-unActive')}>{t('1year')}</div>
          </div>
        </div>
        {datas.length > 0
          ? <HBChart datas={datas} dataKey='close'/>
          : <HBChart paddingBottom={0} datas={dataTemp} dataKey='close'/>
        }
      </div>
    )
  }

  renderDropdownFilter (datas, onChangeDropdown) {
    const { t } = this.props
    return (
      <Menu className='tk-dropdown-container' onClick={(item, index) => onChangeDropdown(item, index)}>
        <Menu.Item className="mab-menu-item tk-dropdown-text-12" key={'#' + this.ALL_TOKEN}>{t('allToken')}</Menu.Item>
        {datas.map((token) => {
          return (
            <Menu.Item className="mab-menu-item tk-dropdown-text-12" key={'#' + token.symbol}>{token.symbol}</Menu.Item>
          )
        })}
      </Menu>
    )
  }

  get renderRightView () {
    const { arrTopTokenCap, arrTopTokenTrade, onChangeTab, t } = this.props
    const { activeKey } = this.state

    return (
      <div className='tk-right-view'>
        <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={(key) => onChangeTab(key)}>
          <TabPane tab={t('CapitalizationRanking')} key={TAB_SELECTED.TAB_1}>
            <div className='tk-rightView-list'>
              {
                arrTopTokenCap.isLoading
                  ? <div className='tk-rightView-loading' ><Spin/></div>
                  : <div>
                    <div className='tk-list-topToken-item'>
                      <span style={{width: '25px'}}>#</span>
                      <span style={{width: 'calc(100% - 125px'}}>{t('Token')}</span>
                      <span style={{width: '100px', textAlign: 'right'}}>{t('Cap')}</span>
                    </div>
                    <List
                      className={'list-token'}
                      split={false}
                      dataSource={arrTopTokenCap ? arrTopTokenCap.datas : []}
                      renderItem={(item, index) => (
                        <List.Item className='tk-list-topToken-item-text'>
                          <span style={{width: '25px', color: '#535E7A'}}>{index === 0 ? '' : index}</span>
                          <span className='tk-itemName'>{item.name} <span className='tk-itemSymbol'>({item.symbol})</span></span>
                          <span className='tk-itemVolume'>$ {formatNumber(Math.round(item.cap / 1000000), 0)} M</span>
                        </List.Item>
                      )} />
                  </div>
              }
            </div>
          </TabPane>
          <TabPane tab={t('TradeVolumeRanking')} key={TAB_SELECTED.TAB_2}>
            <div className='tk-rightView-list'>
              {
                arrTopTokenTrade.isLoading
                  ? <div className='tk-rightView-loading' ><Spin/></div>
                  : <div>
                    <div className='tk-list-topToken-item'>
                      <span style={{width: '25px'}}>#</span>
                      <span style={{width: 'calc(100% - 115px'}}>{t('Token')}</span>
                      <span style={{width: '95px', textAlign: 'right'}}>{t('volume')}</span>
                    </div>
                    <List
                      className={'list-token'}
                      split={false}
                      dataSource={arrTopTokenTrade ? arrTopTokenTrade.datas : []}
                      renderItem={(item, index) => (
                        <List.Item className='tk-list-topToken-item-text'>
                          <span style={{width: '25px', color: '#535E7A'}}>{index === 0 ? '' : index}</span>
                          <span className='tk-itemName'>{item.name} <span className='tk-itemSymbol'>({item.symbol})</span></span>
                          <span className='tk-itemVolume'>$ {formatNumber(Math.round(item.volume / 1000000), 0)} M</span>
                        </List.Item>
                      )} />
                  </div>
              }
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }

  handleClickToken=(item) => () => this.props.onClickToken(item)

  renderCardItem = (item) => {
    const { arrCompoundRate, openMdAddToken, t } = this.props
    const balance = formatNumberDisplay(item.balance, item.decimals)
    let fiatAmount = formatFiatDisplay(item.currencyBalance)
    const compoundToken = arrCompoundRate.length > 0 ? arrCompoundRate.find(e => e.address === item.address) : null
    if (compoundToken) {
      fiatAmount = formatNumberDisplay(item.balance * compoundToken.rate, compoundToken.decimals)
    }
    return (
      <List.Item className='tk-list-item'>
        {
          item.addCard
            ? <div className="eth-default-cell">
              <img alt='img' src={Images.cardEmpty1} id="btnHover"
                className="img-card-tk-default"
                onClick={openMdAddToken}/>
              <div className="txt-normal txt-Absolute" id="nameColor">
                {t('addToken')}
              </div>
            </div>
            : <div className="itemContainer-tk">
              {item.cardImage
                ? <img alt='img' src={item.cardImage} id="btnHover" className="img-card-tk"
                  onClick={this.handleClickToken(item)}/>
                : <div className="txt-noImage" onClick={this.handleClickToken(item)}>
                  <div className="txt-noImageContent">
                    <div className="txt-noImageTitle">Token ERC-20</div>
                    <div className="txt-noImageName">{item.name}</div>
                  </div>
                </div>
              }
              <div className="txt-normal" id="nameColor">
                {item.cardName === 'Main Account' ? t('mainAccount') : item.cardName}
              </div>
              <div className="txt-normal txt-balance">
                <div style={{display: 'inline-block'}}>
                  <span className="exc-usd-first">{balance.firstNumber}</span>
                  <span className="exc-usd-second">{balance.secondNumber ? '.' + balance.secondNumber : ''} {item.symbol}</span>
                </div>
              </div>
              <div className="txt-normal txt-withCurrency">
                {compoundToken
                  ? <div style={{display: 'inline-block'}}>
                    <span className="exc-usd-first">{fiatAmount.firstNumber}</span>
                    <span className="exc-usd-second">.{fiatAmount.secondNumber} {compoundToken.rateCoin}</span>
                  </div>
                  : item.currencyBalance 
                    ? <div style={{display: 'inline-block'}}>
                      <span className="exc-usd-first">{this.currency}{fiatAmount.firstNumber}</span>
                      <span className="exc-usd-second">.{fiatAmount.secondNumber}</span>
                    </div>
                    : '-'
                }
              </div>
            </div>
        }
      </List.Item>
    )
  }
  get renderCenterView () {
    const { openMdAddToken, arrTokenData, t, addCustomToken } = this.props
    const { objSelectItem } = this.state
    let dataTemp = [...arrTokenData]
    dataTemp.push({addCard: true})
    return (
      <div className="ts-wrapContent">
        <TabLayoutContainer
          topLeft={this.renderTopLeft} 
          topRight={this.renderTopRight}
          ScreenAnimation={this.state.animation}
          isCenterRight={true}
          centerRight={this.renderRightView}
        >
          <div className="tk-center-container" id="HBScrollBar">
            <div className="tk-wrapAll-card">
              {
                dataTemp.filter(token => token.isEnabled).length > 0
                  ? <List
                    className={'list-token'}
                    split={false}
                    dataSource={dataTemp.filter(token => token.isEnabled || token.addCard)}
                    renderItem={this.renderCardItem} />
                  : <div className="eth-default-cell">
                    <img alt='img' src={Images.cardEmpty1} id="btnHover"
                      className="img-card-tk-default"
                      onClick={openMdAddToken}/>
                    <div className="txt-normal txt-Absolute" id="nameColor">
                      {t('addToken')}
                    </div>
                  </div>
              }
            </div>
          </div>
          <Modal ref="modalAddToken">
            <MDAddToken THIS={this} addCustomToken={addCustomToken} objSelectItem={objSelectItem}/>
          </Modal>
        </TabLayoutContainer>
      </div>
    )
  }

  render () {
    const { isActiveDetai, cardSelected, receiverAddr } = this.state
    const { handleBackToDetail } = this.props
    return (
      isActiveDetai
        ? <AccountDetail cardSelected={cardSelected} backToDetail={handleBackToDetail} receiverAddr={receiverAddr}/>
        : this.renderCenterView

    )
  }
}
