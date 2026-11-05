/**
* NAME: Ethereum Screen
* CREATOR: Khiem, Chau Created
* Display Ethereum Screen
*/
import React, { PureComponent } from 'react'
import { List, Row, Tabs, Tooltip } from 'antd'
import { Wave } from 'better-react-spinkit'
import Slider from 'react-slick'
import MdAddAcount from './Components/MdAddAcount'
import MdHistoryDetail from './Components/MdHistoryDetail'
import './styles.css'
import TabLayoutContainer from 'Frontend/Container/TabLayoutContainer'
import { HBCRYPTO, HBCURRENCY_SYMBOL, HBCURRENCY, ONE_TIME, TAB_SELECTED, OBSERVER_KEY, ETH_COIN, MKR_COIN, DAI_COIN } from 'Utils/globalConstants'
import { openBrowserInNewTab } from 'Utils/globalFunction'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import HBChart from 'Frontend/Components/HBChart'
import HBCardEther from 'Frontend/Components/HBCardEther'
import HBSwitchAccount from 'Frontend/Components/HBSwitchAccount'
import ListTransaction from 'Frontend/Components/ListTransaction'
import AccountDetail from './AccountDetailScreen'
import SimplexView from './SimplexScreen'
import KyberSwap from './KyberSwap'
import HBGasClock from 'Frontend/Components/HBGasClock/viewClock'
import ImportAccountScreen from 'Frontend/Screen/SettingScreen/sub-view/ImportAccountScreen'
import Observer from 'Utils/HBObserver'
import moment from 'moment'
import Images from 'Assets/Image'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import 'animate.css/animate.min.css'

const TabPane = Tabs.TabPane

const CustomNextArrow = (props) => {
  const { className, onClick } = props
  return (
    <div
      className={className + ' eth-slickNext'}
      onClick={onClick}
    >
      <img src={Images.tabNaviNext} />
    </div>
  )
}

const CustomPrevArrow = (props) => {
  const { className, onClick } = props
  return (
    <div
      className={className + ' eth-slickPrev'}
      onClick={onClick}
    >
      <img src={Images.tabNaviBack} />
    </div>
  )
}

export default class EthereumScreen extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isActiveDetai: false,
      objSelectItem: null,
      switchSelectItem: null,
      isLoadingCard: true,
      objSelectItemHistoryDetail: null,
      arrTransaction: [],
      strCardName: '',
      arrCardImage: [],
      cardSelected: null,
      isSimplex: false,
      isKyberSwap: false,
      selectedCoinSwap: null,
      outputCoinSwap: null,
      historyData: [],
      pageTxt: 0,
      hasMore: true,
      isLoadMore: false,
      isOpenCreate: false,
      isNameErr: false,
      chartTime: ONE_TIME.ONE_DAY,
      simplexInfo: '',
      activeKey: '.$' + TAB_SELECTED.TAB_1
    }
    this.arrFilterName = []
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.defaultThis(this)

    Observer.on(OBSERVER_KEY.GET_DATA_AFTER_SEND_ETH, props.updateDataAfterSendETH)
    Observer.on(OBSERVER_KEY.REFRESH_ETH_HISTORY_ALL, props.handleUpdateHistoryDataAll)
    Observer.on(OBSERVER_KEY.OPEN_KYBER_SWAP, props.onSwitchKyberSwap)
    // autoUpdater.on('checking-for-update', props.checkForUpdate)
    // ipc.on('add-new-account', () => {
    //   console.log('hello EthereumScreen')
    // })
  }

  componentDidMount () {
    this.props.checkForUpdate()
  }

  componentWillMount () {
    this.props.loadingInitial()
    this.props.fetchEtherGasStation()
    this.props.fetchEtherTxs()
    this.props.fetchSimplexInfo()
  }

  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.GET_DATA_AFTER_SEND_ETH, this.props.updateDataAfterSendETH)
    Observer.removeListener(OBSERVER_KEY.REFRESH_ETH_HISTORY_ALL, this.props.handleUpdateHistoryDataAll)
    Observer.removeListener(OBSERVER_KEY.OPEN_KYBER_SWAP, this.props.onSwitchKyberSwap)
  }
  // Top Left overview render
  get renderTopLeft () {
    const { t, etherPrice, gasStation, settingUrls } = this.props
    return (
      <div >
        <Row className='eth-header-padding'>
          {settingUrls.bannerUrl1_status || settingUrls.bannerUrl2_status
            ? <div className='eth-header-group-banner'>
              {settingUrls.bannerUrl1_status && <img id='btnScale-active'
                onClick={() => settingUrls.bannerUrl1 && openBrowserInNewTab(settingUrls.bannerUrl1)}
                className='eth-ad-img1' alt='ad' src={'https://s3-ap-northeast-1.amazonaws.com/hb-dex/banners/banner_1.png?t=' + moment(new Date()).unix()} />}
              {settingUrls.bannerUrl2_status && <img id='btnScale-active'
                onClick={() => settingUrls.bannerUrl2 && openBrowserInNewTab(settingUrls.bannerUrl2)}
                className='eth-ad-img2' alt='ad' src={'https://s3-ap-northeast-1.amazonaws.com/hb-dex/banners/banner_2.png?t=' + moment(new Date()).unix()} />}
            </div>
            : null
          }
          <div className='eth-block-text'><span className="eth-block-LastUpdate">{t('Lastupdate')} </span><span className="eth-block-content">{t('Block')} {gasStation.blockNum}</span></div>
          <div className='eth-gas-container'>
            <div className='eth-gas-cell'>
              <div className='eth-height-54'>{t('StdCostforTransfer')}</div>
              <div className='eth-gas-text-24'>$<FormatFiat balance={(gasStation.medium * Math.pow(10, -9) * gasStation.gasUsed) * etherPrice.price_usd} /></div>
            </div>
            <div className='eth-gas-cell'>
              <div className='eth-height-54'>{t('GasPriceStd')}</div>
              <div className='eth-gas-text-24'><FormatBalance balance={gasStation.medium} decimals={2} /></div>
            </div>
            <div className='eth-gas-cell'>
              <div className='eth-height-54'>{t('SafeLowCostforTransfer')}</div>
              <div className='eth-gas-text-24-green'>$<FormatFiat balance={(gasStation.slow * Math.pow(10, -9) * gasStation.gasUsed) * etherPrice.price_usd} /></div>
            </div>
            <div className='eth-gas-cell'>
              <div className='eth-height-54'>{t('GasPriceSafeLow')}</div>
              <div className='eth-gas-text-24-green'><FormatBalance balance={gasStation.slow} decimals={2}/></div>
            </div>
            <div className='eth-gas-cell'>
              <div className='eth-height-54'>{t('MedianWaitS')}</div>
              <div className='eth-gas-text-24'>{gasStation.gasTime_m}</div>
            </div>
            <div className='eth-gas-cell'>
              <div className='eth-height-54'>{t('MedianWaitBlocks')}</div>
              <div className='eth-gas-text-24'>{gasStation.gasTime_b < 1 ? 1 : Math.round(gasStation.gasTime_b)}</div>
            </div>
            <div className='eth-gas-clock-cell'>
              <div className='eth-gas-clock-text'>{t('RealTimeGasUse')}</div>
              <div className='eth-gas-clock-text'>{t('BlockLimit10')}</div>
              <div className='eth-gas-clock-view'>
                <HBGasClock gasPercent={gasStation.speed * 100} />
                <div className='eth-gas-speed-value'>{Math.round(gasStation.speed * 100)}</div>
              </div>
            </div>
          </div>
        </Row>
      </div>
    )
  }

  // Top Right chart Render
  get renderTopRight () {
    const { arrChartEtherPrice, arrChartEtherPriceYear, etherPrice, t, changeChartTime } = this.props
    const { chartTime } = this.state
    const colorExchange = Number(etherPrice.percent_change_24h) >= 0 ? 'green' : 'red'
    let datas = []
    let count = 0
    switch (chartTime) {
    case ONE_TIME.ONE_DAY:
      for (let i = arrChartEtherPrice.datas.length; i > 0 && count <= 24; i--, count++) {
        datas.unshift(arrChartEtherPrice.datas[i])
      }
      break
    case ONE_TIME.ONE_WEEK:
      for (let i = arrChartEtherPrice.datas.length; i > 0 && count <= 170; i--, count++) { // 24 * 7 + 2 = 170
        datas.unshift(arrChartEtherPrice.datas[i])
      }
      break
    case ONE_TIME.ONE_MONTH:
      for (let i = arrChartEtherPrice.datas.length; i > 0 && count <= 720; i--, count++) { // 24 * 30 = 720
        datas.unshift(arrChartEtherPrice.datas[i])
      }
      break
    default:
      datas = arrChartEtherPriceYear.datas
      break
    }
    return (
      <div className="e-top-right">
        <div className="e-top-right-info">
          <div className='eth-change24-first'>
            <div className='etherPrice12'>{t('etherPrice')}</div>
            <div className='eth-text14-right upPerCase'>{t('Change(24)')}</div>
          </div>
          <div className='eth-change24-right'>
            <div className='text20-yellow'>
              {etherPrice.isLoading
                ? <Wave size={28} color='white' />
                : <span>{this.currency}{<FormatFiat balance={etherPrice.price}/>}</span>
              }
            </div>
            {etherPrice.isLoading
              ? <Wave size={25} color='white' />
              : <div className={'eth-text14-right ' + colorExchange}>{Number(etherPrice.percent_change_24h) >= 0 ? '+' : ''}{<FormatFiat balance={etherPrice.percent_change_24h} decimals={2}/>}%</div>}
          </div>
        </div>
        <div className="e-top-right-graph">
          <div id='btnScale-active' onClick={() => changeChartTime(ONE_TIME.ONE_DAY)} className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_DAY ? 'activeTime' : 'unactiveTime')}>{t('1day')}</div>
          <div id='btnScale-active' onClick={() => changeChartTime(ONE_TIME.ONE_WEEK)} className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_WEEK ? 'activeTime' : 'unactiveTime')}>{t('1week')}</div>
          <div id='btnScale-active' onClick={() => changeChartTime(ONE_TIME.ONE_MONTH)} className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_MONTH ? 'activeTime' : 'unactiveTime')}>{t('1month')}</div>
          <div id='btnScale-active' onClick={() => changeChartTime(ONE_TIME.ONE_YEAR)} className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_YEAR ? 'activeTime' : 'unactiveTime')}>{t('1year')}</div>
        </div>
        {datas.length > 0
          ? <div className="eth-container-chart"><HBChart datas={datas} dataKey='close' /></div>
          : <div className="e-loading-chart exc-center-chart e-empty-color">{t('ChartEmpty')}</div>
        }
      </div>
    )
  }

  // Render Right view historyTxs
  get renderRightView () {
    const { clickOnCell, etherPrice, handleInfiniteOnLoad, arrAccountHistoryDataAll, onChangeTab, t, trackingSendTxs } = this.props
    const { hasMore, historyData, activeKey } = this.state
    return (
      <div className='eth-right-view'>
        <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={(key) => onChangeTab(key)}>
          <TabPane tab={t('LatestTransactions')} key={TAB_SELECTED.TAB_1}>
            <div className='eth-right-view-list-container'>
              <ListTransaction
                isTop={true}
                isLoading={arrAccountHistoryDataAll.isLoading}
                currency={this.currency}
                handleInfiniteOnLoad={handleInfiniteOnLoad}
                hasMore={hasMore}
                tokenPrice={etherPrice.price}
                historyTxs={historyData}
                clickOnCell={clickOnCell}
                arrTrackingSending={trackingSendTxs}
              />
            </div>
          </TabPane>
          <TabPane tab={t('Information')} key={TAB_SELECTED.TAB_2}>
            <div className='eth-right-view-list-container'>
              <div className='eth-right-view-list-information' id='HBScrollBar'>
                <div className='eth-informationContent'>{t('informationContent')}</div>
                <div className='eth-wrapDashed'>
                  <div>・March 20th, 2018 - HB Desktop ver. 1.0.1 was released.</div>
                  <div>・March 21st, 2018 - HB Desktop ver. 1.1.0 was released.</div>
                  <div>・May 24th, 2018 - HB Desktop ver. 1.1.1 was released.</div>
                  <div>・Jun 6th, 2018 - HB Desktop ver. 1.2.0 was released.</div>
                  <div>・Oct 23th, 2018 - HB Desktop ver. 1.2.1 was released.</div>
                  <div>・Nov 11th, 2018 - HB Wallet Desktop ver. 2.0.0 was released.</div>
                  <div>・Jan 18th, 2019 - HB Wallet Desktop ver. 2.0.1 was released.</div>
                  <div>・Jan 21th, 2019 - HB Wallet Desktop ver. 2.0.2 was released.</div>
                  <div>・Jan 24th, 2019 - HB Wallet Desktop ver. 2.0.3 was released.</div>
                  <div>・March 8th, 2019 - HB Wallet Desktop ver. 3.0.0 was released.</div>
                  <div>・March 27th, 2019 - HB Wallet Desktop ver. 3.1.0 was released.</div>
                  <div>・April 8th, 2019 - HB Wallet Desktop ver. 3.1.1 was released.</div>
                  <div>・April 24th, 2019 - HB Wallet Desktop ver. 3.1.2 was released.</div>
                  <div>・Jun 3rd, 2019 - HB Wallet Desktop ver. 3.2.0 was released.</div>
                  <div>・Jun 10th, 2019 - HB Wallet Desktop ver. 3.2.1 was released.</div>
                  <div>・July 2nd, 2019 - HB Wallet Desktop ver. 3.2.2 was released.</div>
                  <div>・Aug 8th, 2019 - HB Wallet Desktop ver. 3.3.0 was released.</div>
                  <div>・Aug 15th, 2019 - HB Wallet Desktop ver. 3.3.1 was released.</div>
                  <div>・Aug 22th, 2019 - HB Wallet Desktop ver. 3.3.1A was released.</div>
                  <div>・Aug 27th, 2019 - HB Wallet Desktop ver. 3.3.2 was released.</div>
                  <div>・Oct 14th, 2019 - HB Wallet Desktop ver. 3.3.3 was released.</div>
                  <div>・Nov 5th, 2019 - HB Wallet Desktop ver. 3.3.4 was released.</div>
                  <div>・Nov 27th, 2019 - HB Wallet Desktop ver. 3.3.5 was released.</div>
                  <div>・Jan 20th, 2020 - HB Wallet Desktop ver. 3.3.6 was released.</div>
                  <div>・Mar 6th, 2020 - HB Wallet Desktop ver. 3.3.7 was released.</div>
                  <div>・April 6th, 2020 - HB Wallet Desktop ver. 3.3.8 was released.</div>
                </div>
                <div className='eth-plzDownload'>{t('plzDownload')}</div>
                <div className='edt-label-16 eth-cursorPointer eth-linkDownload' id='btnScale-active'
                  onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/download')}
                >https://www.hb-wallet.com/download</div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
  // click to switch account 
  onClickSwitchAccount = (itm) => () => this.props.handleSwitchAccount(itm)
  // Render card Item
  renderCardItem = (item, index) => {
    const { isLoadingCard } = this.state
    const { t, internetData, onClickCard } = this.props
    const { currency } = this

    return (
      <List.Item className='eth-list-item' key={index}>
        <Tooltip placement="top" title={item.isMain ? t('Ethereum.yourCurrentAccount') : ''}>
          <div className="eth-ctn-card-item">
            <HBCardEther
              item={item}
              isLoadingCard={isLoadingCard}
              internetData={internetData}
              currency={currency}
              openCardDetail={onClickCard}
              t={t}
            />
          </div>
          <div className="card-name" id="nameColor">
            {item.cardName === 'Main Account' ? t('mainAccount') : item.cardName}
          </div>
          {!item.isMain &&
            <div className="card-button">
              <button
                className="btn-add-sub-acount"
                onClick={this.onClickSwitchAccount(item)}
              >{t('Ethereum.switchAcount')}</button>
            </div>}
        </Tooltip>
      </List.Item>
    )
  }
  renderCenterView () {
    const { arrCardData, openAddModal, openImportAccountModal, t } = this.props
    const { isLoadingCard } = this.state
    const { currency } = this
    const enabledArrCardData = arrCardData.filter(card => card.isEnable)
    const infinite4 = enabledArrCardData.length > 4
    const infinite5 = enabledArrCardData.length > 5
    const infinite6 = enabledArrCardData.length > 6
    const infinite7 = enabledArrCardData.length > 7
    const settingsSliderAccount = {
      lazyLoad: true,
      dots: false,
      infinite: infinite7,
      slidesToShow: 7,
      speed: 200,
      slidesToScroll: 1,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1800,
          settings: {
            infinite: infinite6,
            slidesToShow: 6,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 1650,
          settings: {
            infinite: infinite5,
            slidesToShow: 5,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 1450,
          settings: {
            infinite: infinite4,
            slidesToShow: 4,
            slidesToScroll: 1
          }
        }
      ]
    }

    return (
      <div className="eth-center-body">
        <div className='eth-header-title-view'>
          <div className="eth-header-title" >
            {t('AccountSummary')}
          </div>
          <div className="eth-import-account">
            <button
              className="btn-add-sub-acount"
              onClick={openAddModal}
            >{t('AddSubAccount')}</button>
            <button
              className="btn-add-sub-acount"
              onClick={openImportAccountModal}
            >{t('Ethereum.importAccount')}</button>
          </div>
          <div className='eth-total-balance-group'>
            <div className="eth-text-13">
              <span className="eth-TotalBalance-title">{t('TotalBalance')} </span>
              <span className="eth-text-14-gray">
                {isLoadingCard
                  ? <span className="eth-WaveLoading"><Wave size={15} color='white' /></span>
                  : <span>({currency}<FormatFiat balance={arrCardData[0].totalFiatAmount}/>)</span>
                }
              </span>
            </div>
            <div className="eth-total-balance">
              {isLoadingCard
                ? <Wave size={30} color='white' />
                : <span>{<FormatBalance balance={arrCardData[0].totalBalance}/>} {HBCRYPTO.ETHEREUM}</span>
              }
            </div>
          </div>
        </div>
        <div className="eth-center-desc">{t('Ethereum.youCanChooseAccount')}</div>
        {/* Display List card in wallet */}
        <div className={'eth-center-container' + (arrCardData.length === 1 ? ' eth-center-single' : '')} id="HBScrollBar">
          <div className="ctn-slider-simplex">
            <div className="card-container">
              <div className="ctn-eth-card-center">
                <div className="simplex-card ant-list-item eth-list-item" onClick={() => this.onSwitchSimplex()}>
                  <div className="ctn-img-visa">
                    <img className='simplex-img visa' src={Images.visa} />
                    <div className="simplex-txt">{t('Simplex.cardDesc')}</div>
                  </div>
                  <div className="card-name card-txtleft" id="nameColor">
                    {this.state.simplexInfo}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ctn-slider-account">
            <Slider {...settingsSliderAccount}>
              {arrCardData.filter(card => card.isEnable).map((item, index) => this.renderCardItem(item, index))}
            </Slider>
          </div>
        </div>
        {arrCardData.length === 1 && <div className="eth-center-notice">
          <div className="eth-notice-txt">{t('Ethereum.warningTextAfterRestore1')}</div>
          <div className="eth-notice-txt">{t('Ethereum.warningTextAfterRestore2')}</div>
          <div className="eth-notice-txt">{t('Ethereum.warningTextAfterRestore3')}</div>
        </div>
        }
      </div>
    )
  }
  renderCenterBottomView () {
    return (
      <div className="eth-center-bottom">
        <div className="kyber-swap">
          <div className="kyber-swrap-title">Kyber Network</div>
          <div className="kyber-swap-list">
            <div className="kyber-swap-item" onClick={() => this.props.onSwitchKyberSwap(ETH_COIN)}><img src={Images.ic_eth_request}/> ETH &#8594; <img src={DAI_COIN.iconImage}/> DAI ({this.props.t('Ethereum.stableCoin')})</div>
            <div className="kyber-swap-item" onClick={() => this.props.onSwitchKyberSwap(ETH_COIN, MKR_COIN)}><img src={Images.ic_eth_request}/> ETH &#8594; <img src={MKR_COIN.iconImage}/> MKR</div>
          </div>
        </div>
      </div>
    )
  }
  // Simplex
  onSwitchSimplex = () => {
    this.setState(function (prevState, props) {
      return { isSimplex: !prevState.isSimplex }
    })
  }
  onBackEthPage = () => {
    this.setState({ isActiveDetai: false })
  }
  // Render Main view display all cards
  render () {
    const { isActiveDetai, cardSelected, switchSelectItem, isSimplex, isKyberSwap, selectedCoinSwap, outputCoinSwap } = this.state
    const { handleBackToTop, closeSwitchAccountModal, closeImportAccountModal } = this.props
    return (
      isActiveDetai
        ? <AccountDetail cardSelected={cardSelected} backToDetail={handleBackToTop} /> 
        : isSimplex 
          ? <div className="simplex-layout"><SimplexView backToDetail={() => this.onSwitchSimplex()} /></div>
          : (
            <TabLayoutContainer
              topLeft={isKyberSwap ? null : this.renderTopLeft}
              topLeftHeight={isKyberSwap ? 0 : 157}
              topRight={this.renderTopRight}
              centerRight={this.renderRightView}>
              {
                isKyberSwap
                  ? <KyberSwap selectedCoin={selectedCoinSwap} targetCoin={outputCoinSwap} backToTop={handleBackToTop}/>
                  : <React.Fragment>
                    {this.renderCenterView()}
                    {this.renderCenterBottomView()}
                  </React.Fragment>
              }
              {/* Modal switch account */}
              <Modal ref="modalSwitchAccount">
                <HBSwitchAccount
                  cardSelected={switchSelectItem}
                  onCloseModal={closeSwitchAccountModal}
                />
              </Modal>
              {/* Modal import account */}
              <Modal ref="modalImportAccount">
                <ImportAccountScreen
                  parent={this}
                  isModal={true}
                  onCloseModal={closeImportAccountModal}
                />
              </Modal>
              {/* Modal add account */}
              <Modal ref="modalAddAccount">
                <MdAddAcount THIS={this} />
              </Modal>
              {/* Modal History Detail */}
              <Modal ref="modalHistoryDetail">
                <MdHistoryDetail THIS={this} />
              </Modal>
            </TabLayoutContainer>
          )
    )
  }
}
