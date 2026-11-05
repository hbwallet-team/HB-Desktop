import React from 'react'
import './styles.css'
import { Menu, Dropdown, List, Icon, Select, Tooltip, Tabs } from 'antd'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { HBInput } from 'Frontend/Components/HBInput'
import StarRatings from 'react-star-ratings'
import Images from 'Assets/Image'
import { formatNumber, formatPriceNumber, formatNumberDisplay, formatNumberOld, formatNumberLeftZero, formatNumberLeftZeroCal, formatFiatDisplay, formatSmallNumber, zeroPadLeft, convertWeiToBalance, filterMainAccount, sumValueByKey, openBrowserInNewTab } from 'Utils/globalFunction'
import { OBSERVER_KEY, PERIOD_CHART, CHART_TYPE, ORDER_STATUS, ORDER_FILTER, HBCURRENCY_SYMBOL, HBCURRENCY, LIMIT_PRICE_TICKER } from 'Utils/globalConstants'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import PopupGas from './Components/PopupGas'
import PopupLock from './Components/PopupLock'
import PopupPlaceOrder from './Components/PopupPlaceOrder'
import PopupTour from './Components/PopupTour'
import PopupFillOrder from './Components/PopupFillOrder'
import PopupOrderDetail from './Components/PopupOrderDetail'
import { Spin } from 'Frontend/Components/HBLoader'
import { Wave } from 'better-react-spinkit'
import InfiniteScroll from 'react-infinite-scroller'
import moment from 'moment'
import Observer from 'Utils/HBObserver'
import Chart from './Components/CandleStickChart'
import {setChosenLanguage} from 'Utils/0xError'
import ExchangeFavorite from '../ExchangeFavorite'
import Settings from 'Backend/settings'
const TabPane = Tabs.TabPane
const { shell } = window.require('electron')

const Option = Select.Option
// const MAX_DATE = 2524582800000 // 2050
const TAB_SELECTED = {
  MY_BALANCE: '1',
  NEW_ORDER: '2'
}

const ORDER_STATE = {
  0: 'Open',
  1: 'Completed',
  2: 'canceled',
  3: 'Expired',
  4: 'Warning',
  5: 'Processing',
  6: 'Failed'
}
const MIN = 'MIN'
const HOUR = 'HOUR'
const PERIOD_MUNITE = ['5M', '30M']
const PERIOD_HOURS = ['1H', '6H', '12H']
const MARKET_PRICE = ['CMC']
const USD_ETH_PRICE = ['ETH', 'USD']
const USD_WETH_PRICE = ['WETH', 'USD']
const ORDER_FILTER_STATE = ['Open orders', 'Closed orders', 'Filled orders']
const ORDER_BOARD = {
  MY_HISTORY: 1,
  BOARD_HISTORY: 2
}
const BOARD_HISTORY_FILTER = {
  ALL: 'all',
  TAKE_BUY: 'takeBuy',
  TAKE_SELL: 'takeSell',
  MAKE_BUY: 'makeBuy',
  MAKE_SELL: 'makeSell'
}

export default class ExchangeScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      coinPair: props.renderCoinPair(this),
      dexData: {
        orderBookSell: [],
        orderBookBuy: [],
        tradeHistory: [],
        myOrderHistory: [],
        boardHistory: []
      },
      boardHistoryType: BOARD_HISTORY_FILTER.ALL,
      priceInput: '',
      amountInput: '',
      totalActiveSell: 0,
      totalActiveBuy: 0,
      isFocused: false,
      totalInput: '',
      isWrap: true,
      strPPAmount: '',
      lastTxID: '',
      isSending: false,
      heightCalendar: 0,
      date: moment(new Date()).add(7, 'd'), // current day + a week,
      selectedDate: moment(new Date()).add(7, 'd'), // current day + a week
      hourSelect: moment(new Date()).add(7, 'd').format('HH'),
      minuteSelect: moment(new Date()).add(7, 'd').format('mm'),
      isSell: false,
      isActive: true,
      isPlacing: false,
      orderJSON: {},
      fillOrderInput: '',
      fillOrderError: false,
      fillOrderTotal: '',
      valueInputGas: 0,
      chartData: null,
      isLoadingChart: true,
      // chart period
      periodNode: 24, // each node is an hour for 24h
      periodChart: PERIOD_CHART.ONE_DAY,
      periodChartType: PERIOD_CHART.ONE_DAY,
      chartType: CHART_TYPE.CHART_LINE,
      isZoomChart: false,
      isShowMyOrder: true,
      myOrderFilter: ORDER_FILTER.OPEN,
      tabNewOrder: true,
      tabSelected: TAB_SELECTED.MY_BALANCE,
      activeOrderBoard: 0,
      rateAndFavorite: {
        one_star: 0,
        two_star: 0,
        three_star: 0,
        four_star: 0,
        five_star: 0,
        avarageRate: 0,
        myRate: null
      },
      totalRate: 0,
      lightingOrderBookSellId: '',
      lightingOrderBookBuyId: '',
      lightingOrderBookFilling: false,
      lightingMyOrder: false,
      lightingMyHistory: false,
      lightingBoardHistory: false,
      lightingTradeHistory: false,
      isLoadingOrder: true,
      isLoadingSummary: true,
      isLoadingCMC: true,
      atcResultEth: null,
      coinToEth: true,
      marketPricePair: ['ETH', props.arrCurrencyData],
      pricePair: ['WETH', props.arrCurrencyData],
      unitOfCoin: 'ETH',
      unitOfCoin2: 'WETH',
      largestAmountOrder: 0,
      setLanguage: '',
      setWidthPrice: 0,
      transactionFee: 0,
      checkarrToken: null,
      checkUnlocked: null,
      clickPopUp: null,
      gasAmount: 0,
      gasPrice: props.gasStation,
      isFocusedMyAmount: false,
      isMyFavorite: false,
      isFavorite: false,
      isLoadedTokenBalance: false,
      hasMoreAllToken: true,
      hasMoreMyHistory: true,
      hasMoreBoardHistory: true,
      allTokenOffset: 0,
      myHistoryOffset: 0,
      boardHistoryOffset: 0,
      isLoadMoreAllToken: false,
      isLoadMoreMyHistory: false,
      isLoadMoreBoardHistory: false,
      isLoadingSpread: true,
      spreadValue: 0,
      isCancelingOrder: false,
      orderCanceling: '',
      isNumberHoverRating: 0,
      isLoadingLastTransaction: true,
      openPopupCancelByID: null,
      isErrorFillInput: false,
      minAmountFillInput: 0,
      getImageToken: null,
      balanceForPPLock: 0,
      balancePriceForPPLock: 0,
      balanceMakerForCheck: 0,
      tokenSelectedPair: {},
      orderFilledHistory: [],
      hbTokenBalance: 0,
      isDisabledMakeOrder: false,
      wrapAllOrderJSON: null,
      allOrderJSON: null
    }
    Observer.on(OBSERVER_KEY.NEW_DEX_ORDER, props.updateNewDexOrder)
    this.hours = []
    for (let index = 0; index < 24; index++) {
      this.hours.push(zeroPadLeft(index.toString(), 2))
    }
    this.minutes = []
    for (let index = 0; index < 60; index++) {
      this.minutes.push(zeroPadLeft(index.toString(), 2))
    }
    this.isUnLocking = false
    this.gasLimit = Settings.gas.externalFeeToken
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    setChosenLanguage(this.props.localeData)
    props.funcDefautlThis(this)
  }
  componentWillMount () {
    // this.props.getExchangeTokens()
    this.props.fetchListCoin()
    this.props.fetchAnnounceMessage()
  }
  componentDidMount () {
    this.props.loadInitData()
    this.props.fetchChart()
    this.props.fetchTokenInfo()
    this.props.fetchRateAndFavorite()
    this.props.fetchGasPrice()
    this.props.fetchFavoriteTokens()
    this.props.fetchLastTransaction()
    this.props.fetchOrderedAmount()
    this.props.fetchDexConfig()
    this.props.fetchHBTokenBalance()
    this.props.loadingTokenUnlock()
    this.props.loadingTokenbalance()
    this.props.scrollOrderSellToBottom()
    this.props.getCoinInfo(this.props.dexSelectedPair.token.symbol, this.props.dexSelectedPair.token.name)
    this.props.onChangeLanguage(this.props.localeData)
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.NEW_DEX_ORDER, this.props.updateNewDexOrder)
  }
  componentDidUpdate () {
    this.scrollToBottom()
  }
  onSelect = (date) => {
    this.setState({
      date,
      selectedDate: date
    })
  }
  onPanelChange = (date) => {
    this.setState({ date })
  }
  disabledDate = (current) => {
    if (!current) {
      // allow empty select
      return false
    }
    const date = moment()
    date.hour(0)
    date.minute(0)
    date.second(0)
    return current.valueOf() < date.valueOf() // can not select days before today
  }
  handleChangeHour = (value) => {
    const { date, minuteSelect } = this.state

    const y = date.format('YYYY')
    const m = date.format('MM') - 1
    const d = date.format('DD')
    this.setState({
      hourSelect: value,
      date: moment(new Date(y, m, d, value, minuteSelect, 0, 0)),
      selectedDate: moment(new Date(y, m, d, value, minuteSelect, 0, 0))
    })
  }
  handleChangeMinute = (value) => {
    const { date, hourSelect } = this.state

    const y = date.format('YYYY')
    const m = date.format('MM') - 1
    const d = date.format('DD')
    this.setState({
      minuteSelect: value,
      date: moment(new Date(y, m, d, hourSelect, value, 0, 0)),
      selectedDate: moment(new Date(y, m, d, hourSelect, value, 0, 0))
    })
  }
  scrollToBottom () {
    if (this.orderSellList123456) {
      const scrollHeight = this.orderSellList123456.scrollHeight
      const height = this.orderSellList123456.clientHeight
      const maxScrollTop = scrollHeight - height
      this.orderSellList123456.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
    }
  }
  render () {
    const {
      onChangePrice, onChangeAmount,
      onChangeTotal, wrapAction, onChangePPWrapAmount, arrCardData,
      arrTokenData, pendingTx, openTxID,
      clickOnCellOrder, clickCancel,
      unlock, openCalender, closeCalender, clickPlaceOrder,
      fillAction, changeFillOrderInput,
      setIsSell, backToTop, changeChartType, setIsActive,
      handleChangePeriod, onInputAmount, etherPrice, t,
      changeTabNewOrder, changeTabMyBalance,
      handleChangeRating, handleChangeFavorite, getMarketEth,
      dragVolume, openPopupLock, openPopupTour, dexSelectedPair,
      handleChangeActiveBoard, handleFilterBoardHistory,
      onFocusInputMyAmount, onBlurInputMyAmount, setIsFavorite,
      dexAnnounce, arrListCoin, limitPriceTicker, dexFavorite, reloadTokenBalance,
      handleInfiniteOnLoadAllToken, handleInfiniteOnLoadMyHistory, handleInfiniteOnLoadBoardHistory,
      focusInputGasPrice, unFocusInputGasPrice,
      onChangeIncreaseAmount, onChangeDecreaseAmount, onChangeIncreasePrice, onChangeDecreasePrice,
      cancelOrderByUser, hoverOnRating, hoverOffRating, dexLastTransaction, localeData, getBuyAll,
      nextPlaceOrder, clickOnOrderHistory, settingUrls, helpUrl, arrCurrencyData, openExchangeScreen,
      handleFilterFavoriteToken, toHBWallet
    } = this.props
    const {
      dexData, coinPair, priceInput, amountInput,
      strPPAmount, totalInput, isWrap,
      isSending, heightCalendar, date,
      selectedDate, isSell, isActive, unitOfCoin2,
      isPlacing, fillOrderInput, orderJSON,
      fillOrderError, fillOrderTotal,
      chartData, periodChartType, periodChart, periodNode,
      chartType, isZoomChart, isLoadingChart,
      lightingMyHistory, lightingBoardHistory,
      setWidthPrice, checkarrToken, checkUnlocked, transactionFee,
      lightingTradeHistory, isLoadingSpread, spreadValue,
      tabNewOrder, activeOrderBoard,
      atcResultEth, coinToEth, unitOfCoin, largestAmountOrder,
      boardHistory, boardHistoryType, isLoadingOrder, clickPopUp, gasAmount, gasPrice,
      rateAndFavorite, isFocusedMyAmount, isMyFavorite, isFavorite, totalRate,
      isLoadedTokenBalance, hasMoreAllToken, isLoadMoreAllToken,
      hasMoreMyHistory, isLoadMoreMyHistory, hasMoreBoardHistory, isLoadMoreBoardHistory,
      myOrderHistory, tradeHistory,
      valueInputGas, isLoadingSummary, hourSelect, minuteSelect, isNumberHoverRating,
      lightingOrderBookSellId, lightingOrderBookBuyId, isLoadingLastTransaction, openPopupCancelByID,
      isLoadingCMC, isErrorFillInput, minAmountFillInput, getImageToken,
      balanceForPPLock, balancePriceForPPLock, isCancelingOrder, orderCanceling, balanceMakerForCheck
    } = this.state
    const mainAccount = filterMainAccount(arrCardData)
    const mainAddress = mainAccount.address
    let lengthAnnounce = dexAnnounce.message !== undefined ? dexAnnounce.message.toString().length : 0
    let countCycle = dexAnnounce.message !== undefined ? 10000 / dexAnnounce.message.toString().length : 0
    let styles = {
      animationTime1: {
        fontFamily: 'MeiryUI-01',
        animationName: 'marquee',
        animationDuration: 50 + (lengthAnnounce / 3.8) * Math.trunc(countCycle) + 's',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite'
      }
    }
    return (
      !openExchangeScreen
        ? <ExchangeFavorite backToTop={backToTop} limitPriceTicker={LIMIT_PRICE_TICKER} handleFilterFavoriteToken={handleFilterFavoriteToken} openExchangeScreen={openExchangeScreen} helpUrl={helpUrl}/>
        : <div className={'exs-container ' + (localeData === 'jp' || localeData === 'cn' ? 'locale-jp-cn' : '') + (localeData === 'vn' ? 'locale-vn' : '')}>
          <div className='exs-center'>
            <div className='exs-newOrder-balances'>
              <div className='panner exs-top-dropdown'>
                <div className='exs-title-dropdown'>
                  <Tooltip placement="topLeft" title={t('ttBack')} mouseEnterDelay={1}>
                    <button className="exs-btn-Back" onClick={this.props.backToTop}>
                      <img className="img-back"
                        alt='imgBack'
                        src={Images.tabNaviBack} />
                      {t('back')}
                    </button>
                  </Tooltip>
                  <div className="exs-btn-right">
                    <div className="exs-btn-tour" onClick={() => this.props.handleFilterFavoriteToken()}>{t('favorite')}</div>
                  </div>
                </div>
                <div className='exs-token-favorite'>
                  <Tooltip placement="topLeft" title={t('ttToken')} mouseEnterDelay={1}>
                    <div className="exs-dropdown-token exc-set-font" >
                      <span className="exs-dropdown-token-text">{this.state.coinPair.first.symbol + ' / ' + this.state.coinPair.second.symbol} </span>
                    </div>
                  </Tooltip>
                  <Tooltip placement="topLeft" title={t('ttFavorite')} mouseEnterDelay={1}>
                    <div className='exs-heart' onClick={() => this.props.handleChangeFavorite()}>
                      {this.state.isMyFavorite
                        ? <img src={Images.Like}/>
                        : <img src={Images.unLike}/>
                      }
                    </div>
                  </Tooltip>
                </div>
                { this.renderRating() }
                { this.renderSocial(this.state.tokenSelectedPair) }
              </div>
              <div className={'panner exs-your-balances' + ' exs-' + this.props.localeData}>
                <Tabs defaultActiveKey="1" activeKey={this.state.tabSelected} onChange={(key) => this.props.onChangeTab(key)}>
                  <TabPane tab={t('myBalance')} key={TAB_SELECTED.MY_BALANCE}>
                    { this.renderMyBalance() }
                  </TabPane>
                  <TabPane tab={t('newOrder')} key={TAB_SELECTED.NEW_ORDER}>
                    { this.renderNewOrder() }
                  </TabPane>
                </Tabs>
              </div>
            </div>
            <div className='exs-right-side'>
              <div className="exs-wrap-scroll-txt">
                <div className="exs-scroll-txt">
                  <div className='exs-wrap-marquee exc-set-font'>
                    <div className='marquee'>
                      <span style={styles.animationTime1}>
                        {dexAnnounce.message !== undefined ? dexAnnounce.message.toString().repeat(Math.trunc(countCycle)) : ''}
                      </span>
                    </div>
                  </div>
                  {arrListCoin.length > 0
                    ? <List
                      className="exs-top-balance exs-left"
                      dataSource={arrListCoin.slice(0, LIMIT_PRICE_TICKER - 1)}
                      renderItem={(item, index) => this.renderMarketCoin(item, index)} />
                    : ''}
                </div>
              </div>
              <div className='exs-top'>
                <div className='exs-top-market-price panner'>
                  <Tooltip placement="topLeft" title={t('ttAnotherMarketPrice')} mouseEnterDelay={1}>
                    <div className='exs-market-part'>
                      <div className={'exs-market-title exc-text-upCase exs-color-gray exc-set-font ' + (localeData === 'jp' ? 'exs-fontJapan-2px' : '')}>{t('anotherMarketPrice')}</div>
                      {/* <div className={'exs-convert-eth exc-set-font ' + (coinToEth ? 'exs-color-gray' : 'exs-color-hidden')} onClick={() => getMarketEth(1)}>ETH</div>
                    <div className={'exs-convert-usd exc-set-font ' + (coinToEth ? 'exs-color-hidden' : 'exs-color-gray')} onClick={() => getMarketEth(2)}>USD</div> */}
                      <Select className={'exs-period-munite exs-select-unit exc-set-font exs-color-gray exs-mgTop-1px'}
                        defaultValue={unitOfCoin}
                        value={unitOfCoin}
                        onChange={() => getMarketEth(unitOfCoin)}
                      >
                        {this.renderSwitchPrice()}
                      </Select>
                    </div>
                  </Tooltip>
                  <div className='exs-market-price-container'>
                    <Select className={'exs-period-munite exs-select-market exc-set-font'}
                      defaultValue={'CMC'}
                      value={'CMC'}
                      onChange={() => {}}
                      dropdownClassName={'exs-another-market'}
                    >
                      {this.renderMarket()}
                    </Select>
                    {isLoadingCMC
                      ? <div className='exs-balance-loading-currency'><Wave size={20} color='white' /></div>
                      : <div className='exs-wrap-currency'>
                        <div className='exs-market-currency-value'>
                          <Tooltip placement="topLeft" title={coinPair.first.symbol} mouseEnterDelay={1}>
                          1{coinPair.first.symbol.length > 4 ? coinPair.first.symbol.substr(0, 4) + '...' : coinPair.first.symbol} = 
                          </Tooltip>
                        </div>
                        <div className={'exs-market-price-value'}>{atcResultEth === null
                          ? <span className='exc-text-upCase'>{this.renderPriceFormat(0, coinToEth ? 8 : 2)} {coinToEth ? ' ETH' : ' ' + arrCurrencyData} 0%</span>
                          : <div className={atcResultEth.percent_change_24h === 0 ? 'exs-color-white' : (atcResultEth.percent_change_24h > 0 ? 'exs-color-green' : 'exs-color-red')}>
                            {this.renderWETHFormat(atcResultEth.priceCurrency, 8)} {coinToEth ? 'ETH' : arrCurrencyData}
                            {atcResultEth.percent_change_24h === null ? '' : (' ' + (atcResultEth.percent_change_24h >= 0 ? '+' : '') + formatNumber(atcResultEth.percent_change_24h, 2) + '%')}
                          </div>
                        }
                        </div>
                      </div>
                    }
                  </div>
                </div>
                <div className='exs-top-24h panner'>
                  <Tooltip placement="topLeft" title={t('ttCurrentPrice')} mouseEnterDelay={1}>
                    <div className='exs-top-block'>
                      <div className={'exs-market-title exs-mg-10 exc-text-upCase exs-text-center exs-color-gray '}>{t('currentPrice')}</div>
                      {isLoadingSummary
                        ? <div className='exs-balance-loading'><Wave size={20} color='white' /></div>
                        : <div className='exs-market-curren-price-container'>
                          <div className={'exs-market-price-value exs-upFont-2px ' + (Number(dexSelectedPair.lastPriceBalanceGWei) === 0 ? 'exs-color-gray' : (Number(dexSelectedPair.lastPriceBalanceGWei) > 0 ? 'exs-color-green' : 'exs-color-red'))}>
                            { this.renderPriceFormat(Math.abs(dexSelectedPair.lastPriceBalanceGWei), 8) }
                          </div>
                        </div>
                      }
                    </div>
                  </Tooltip>
                  <Tooltip placement="topLeft" title={t('ttHigh')} mouseEnterDelay={1}>
                    <div className='exs-top-block'>
                      <div className='exs-market-title exs-mg-10 exs-text-center exc-text-upCase exs-color-gray'>{t('24hHigh')}</div>
                      {isLoadingSummary
                        ? <div className='exs-balance-loading'><Wave size={20} color='white' /></div>
                        : <div className='exs-market-curren-price-container'>
                          <div className='exs-market-price-value exs-upFont-2px exs-color-green'>
                            { this.renderPriceFormat(Math.abs(dexSelectedPair.highestPrice24hBalanceGWei), 8) }
                          </div>
                        </div>
                      }
                    </div>
                  </Tooltip>
                  <Tooltip placement="topLeft" title={t('ttLow')} mouseEnterDelay={1}>
                    <div className='exs-top-block'>

                      <div className='exs-market-title exs-mg-10 exs-text-center exc-text-upCase exs-color-gray'>{t('24hLow')}</div>
                      {isLoadingSummary
                        ? <div className='exs-balance-loading'><Wave size={20} color='white' /></div>
                        : <div className='exs-market-curren-price-container'>
                          <div className='exs-market-price-value exs-upFont-2px exs-text-red'>
                            { this.renderPriceFormat(Math.abs(dexSelectedPair.lowestPrice24hBalanceGWei), 8) }
                          </div>
                        </div>
                      }
                    </div>
                  </Tooltip>
                  <Tooltip placement="topLeft" title={t('ttVolume')} mouseEnterDelay={1}>
                    <div className='exs-top-block'>
                      <div className={'exs-market-title exs-mg-10 exs-text-center exc-text-upCase exs-color-gray '}>{t('24hVolume')}</div>
                      {isLoadingSummary
                        ? <div className='exs-balance-loading'><Wave size={20} color='white' /></div>
                        : <div className='exs-market-curren-price-container'>
                          <div className='exs-market-price-value exs-upFont-2px exs-text-volume'>
                            { this.renderVolumeFormat(Math.abs(dexSelectedPair.volume24hBalanceGWei), 2) }
                          </div>
                        </div>
                      }
                    </div>
                  </Tooltip>
                  <Tooltip placement="topLeft" title={t('ttTotalVolume')} mouseEnterDelay={1}>
                    <div className='exs-top-block'>
                      <div className={'exs-market-title exs-mg-10 exs-text-center exc-text-upCase exs-color-gray '}>{t('totalVolume')}</div>
                      {isLoadingSummary
                        ? <div className='exs-balance-loading'><Wave size={20} color='white' /></div>
                        : <div className='exs-market-curren-price-container'>
                          <div className='exs-market-price-value exs-upFont-2px exs-text-volume'>
                            { this.renderVolumeFormat(Math.abs(dexSelectedPair.volumeTotalBalanceGWei), 2) }
                          </div>
                        </div>
                      }
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className='exs-wrap-info'>
                <div className='exs-order-book panner'>
                  <div className='exs-title-header'>
                    <Tooltip placement="topLeft" title={t('ttOrderBook')} mouseEnterDelay={1}>
                      <div className={'text-title-panner ' + (localeData === 'jp' ? 'exc-spJP-title' : '')}>{t('orderBook')}</div>
                    </Tooltip>
                    <Tooltip placement="topLeft" title={t('ttWETHUSD')} mouseEnterDelay={1}>
                      <Select 
                        className={'exs-period-munite exs-select-unit exc-set-font exs-color-gray'}
                        defaultValue={unitOfCoin2}
                        value={unitOfCoin2}
                        onChange={() => setIsActive(isActive)}
                        dropdownClassName={'exs-switch-price2'}
                      >
                        {this.renderSwitchPrice2()}
                      </Select>
                    </Tooltip>
                  </div>
                  <div className='exs-table-header'>
                    <Tooltip placement="topLeft" title={t('ttPrice')} mouseEnterDelay={1}>
                      <div className='exs-first-column exc-text-upCase exc-set-font'>{t('price')} <span className='exs-token-name'>{isActive ? coinPair.second.symbol : arrCurrencyData}</span></div>
                    </Tooltip>
                    <Tooltip placement="topLeft" title={t('ttAmount')} mouseEnterDelay={1}>
                      <div className='exs-last-column exc-text-upCase exc-set-font'>{t('amount')} <span className='exs-token-name'>{coinPair.first.symbol}</span></div>
                    </Tooltip>
                  </div>
                  <div className='exs-list-order-book-container ' id='exs-list-sell' ref={(div) => { this.orderSellList123456 = div }}>
                    {!isLoadingOrder
                      ? (dexData.orderBookSell.length === 0
                        ? <div className='exs-list-empty-text'>{t('NoData')}</div>
                        : <List
                          className="exs-list-order-book exs-list-coin"
                          dataSource={dexData.orderBookSell}
                          renderItem={(item, index) => this.renderOrderBookSell(item, index, coinPair, clickOnCellOrder, mainAddress, isActive, etherPrice, largestAmountOrder, lightingOrderBookSellId)} />)
                      : <div className='exs-history-loading'><Spin/></div>
                    }
                    <div ref='hello1'></div>
                  </div>
                  <div className='exs-table-header exs-order-spread exs-background-faded'>
                    <Tooltip placement="topLeft" title={t('ttSpread')} mouseEnterDelay={1}>
                      <div className='exs-first-column exs-color-spread'>
                        {isLoadingSpread
                          ? <div className='exs-loading-spread'><Wave size={20} color='white' /></div>
                          : Number(spreadValue) > 0 ? (isActive ? this.renderPriceFormat(spreadValue, 8) : this.renderUsdPriceFormat(spreadValue * etherPrice.price_usd)) : '---'
                        }
                      </div>
                    </Tooltip>
                    <Tooltip placement="topLeft" title={t('ttSpread')} mouseEnterDelay={1}>
                      <div className='exs-last-column exs-color-spread exs-text-right  exc-set-font'>{t('realtime')} {t('spread')}</div>
                    </Tooltip>
                  </div>
                  <div className='exs-list-order-book-container-2' id='HBScrollBar'>
                    {!isLoadingOrder
                      ? (dexData.orderBookBuy.length === 0
                        ? <div className='exs-list-empty-text'>{t('NoData')}</div>
                        : <List
                          className="exs-list-order-book exs-list-coin"
                          dataSource={dexData.orderBookBuy}
                          renderItem={(item, index) => this.renderOrderBookBuy(item, index, coinPair, clickOnCellOrder, mainAddress, isActive, etherPrice, largestAmountOrder, lightingOrderBookBuyId)} />)
                      : <div className='exs-history-loading'><Spin/></div>
                    }
                  </div>
                </div>
                <div className='exs-center-right'>
                  <div className={(isZoomChart ? 'exs-chart-container-zoom' : 'exs-chart-container') + ' panner'}>
                    <div className='exs-chart-time-bar'>
                      <Tooltip placement="topLeft" title={t('ttTime')} mouseEnterDelay={1}>
                        <div className='exs-chart-time-flex'>
                          <Select className={periodChartType === PERIOD_CHART.MUNITE ? 'exs-period-munite-selected' : 'exs-period-munite'}
                            defaultValue={PERIOD_MUNITE[0]}
                            value={periodChartType === PERIOD_CHART.MUNITE ? periodChart : t(MIN)}
                            onChange={(value) => handleChangePeriod(PERIOD_CHART.MUNITE, value)}
                            dropdownClassName={'exs-select-options-min'}
                          >
                            {this.renderSelectMunites(t)}
                          </Select>
                          <Select className={periodChartType === PERIOD_CHART.HOUR ? 'exs-period-munite-selected' : 'exs-period-munite'}
                            defaultValue={HOUR}
                            value={periodChartType === PERIOD_CHART.HOUR ? periodChart : t(HOUR)}
                            onChange={(value) => handleChangePeriod(PERIOD_CHART.HOUR, value)}
                            dropdownClassName={'exs-select-options-hours'}
                          >
                            {this.renderSelectHours(t)}
                          </Select>
                          <button onClick={() => handleChangePeriod(PERIOD_CHART.ONE_DAY, PERIOD_CHART.ONE_DAY)}
                            className={periodChartType === PERIOD_CHART.ONE_DAY ? 'exs-period-btn-selected' : 'exs-period-btn'}>1{t('D')}</button>
                          <button onClick={() => handleChangePeriod(PERIOD_CHART.ONE_WEEK, PERIOD_CHART.ONE_WEEK)}
                            className={periodChartType === PERIOD_CHART.ONE_WEEK ? 'exs-period-btn-selected' : 'exs-period-btn'}>1{t('W')}</button>
                          <button onClick={() => handleChangePeriod(PERIOD_CHART.ONE_MONTH, PERIOD_CHART.ONE_MONTH)}
                            className={periodChartType === PERIOD_CHART.ONE_MONTH ? 'exs-period-btn-selected' : 'exs-period-btn'}>1{t('M')}</button>
                          { chartType === CHART_TYPE.CHART_LINE &&
                        <button onClick={() => handleChangePeriod(PERIOD_CHART.ALL, PERIOD_CHART.ALL)}
                          className={periodChartType === PERIOD_CHART.ALL ? 'exs-period-btn-selected exs-edit-allChart' : 'exs-period-btn exs-edit-allChart'}>{t('chartAll')}</button>
                          }
                          <div>
                          </div>
                        </div>
                      </Tooltip>
                      <div className='exs-chart-time-flex'>
                        <Tooltip placement="topLeft" title={t('ttLineCandlesticks')} mouseEnterDelay={1}>
                          <button onClick={() => changeChartType(CHART_TYPE.CHART_LINE)}
                            className={chartType === CHART_TYPE.CHART_LINE ? 'exs-chart-type-btn-selected' : 'exs-chart-type-btn'}>{t('line')}</button>
                          <button onClick={() => changeChartType(CHART_TYPE.CHART_CANDLE_STICK)}
                            className={(chartType === CHART_TYPE.CHART_CANDLE_STICK ? 'exs-chart-type-btn-selected' : 'exs-chart-type-btn')}>{t('candlesticks')}</button>
                        </Tooltip>
                        <Tooltip placement="topLeft" title={t('ttSizeChange')} mouseEnterDelay={1}>
                          <img onClick={() => this.setState({isZoomChart: !isZoomChart})} alt='img' src={Images.icZoom} className='exs-ic-zoom'/>
                        </Tooltip>
                      </div>
                    </div>
                    <div id={'exs-chart-container'} className='exs-chart-exchange-container'>
                      <Chart data={chartData} type={chartType} isLoadingChart={isLoadingChart} isZoom={isZoomChart} period={periodNode} t={t}/>
                    </div>
                  </div>
                  <div className={'exs-order-chart ' + (activeOrderBoard === ORDER_BOARD.MY_HISTORY ? 'exs-my-history-up' : (activeOrderBoard === ORDER_BOARD.BOARD_HISTORY ? 'exs-trade-history-up' : ''))
                  }>
                    <div className='exs-trade-history exs-my-history panner'>
                      <div className='exs-title-header'>
                        <Tooltip placement="topLeft" title={t('ttMyHistory')} mouseEnterDelay={1}>
                          <div className='text-title-panner'>{t('myHistory')}</div>
                        </Tooltip>
                        <div className="exs-ic-arrow" onClick={() => handleChangeActiveBoard(ORDER_BOARD.MY_HISTORY)}>
                          {activeOrderBoard === ORDER_BOARD.MY_HISTORY ? <div className='exs-iconUp-order'></div> : <div className='exs-iconDown-order'></div>}
                        </div>
                      </div>
                      <div className='exs-table-header exc-text-upCase'>
                        <div className='exs-first-column exs-column18 exs-text-left'>{t('time')}</div>
                        <div className='exs-column15'>{t('price')} <span className='exs-token-name'>{coinPair.second.symbol}</span></div>
                        <div className='exs-column18'>{t('amount')} <span className='exs-token-name'>{coinPair.first.symbol}</span></div>
                        <div className='exs-column18'>{t('totalAmount')} <span className='exs-token-name'>{coinPair.second.symbol}</span></div>
                        <div className='exs-column18'>{t('fee')}</div>
                        <div className='exs-last-column exs-column18'>{t('type')}</div>
                      </div>
                      <div className='exs-list-trade-history-container' id='HBScrollBar'>
                        {!isLoadingOrder
                          ? <InfiniteScroll
                            className="exs-list-coin"
                            initialLoad={false}
                            pageStart={0}
                            loadMore={handleInfiniteOnLoadMyHistory}
                            hasMore={hasMoreMyHistory}
                            useWindow={false}>
                            {dexData.myOrderHistory.length === 0
                              ? <div className='exs-list-empty-text'>{t('NoData')}</div>
                              : <List
                                className="exs-list-trade-history exs-list-coin"
                                dataSource={dexData.myOrderHistory}
                                renderItem={(item, index) => this.renderMyHistory(item, index, coinPair, clickOnOrderHistory, t, lightingMyHistory, localeData, isCancelingOrder, orderCanceling)} />}
                            {isLoadMoreMyHistory
                              ? <div className='exs-load-more'><Spin/></div>
                              : ''
                            }
                          </InfiniteScroll>
                          : <div className='exs-history-loading'><Spin/></div>
                        }
                      </div>
                    </div>
                    <div className='exs-trade-history exs-board-history panner'>
                      <div className='exs-title-header'>
                        <Tooltip placement="topLeft" title={t('ttBoardHistory')} mouseEnterDelay={1}>
                          <div className='text-title-panner'>{t('boardHistory')}</div>
                        </Tooltip>
                        <Tooltip placement="topLeft" title={t('ttType')} mouseEnterDelay={1}>
                          <div className={'exs-filter-boardHistory' + (boardHistoryType === BOARD_HISTORY_FILTER.ALL ? ' exs-active-filter' : '')} onClick={() => handleFilterBoardHistory(BOARD_HISTORY_FILTER.ALL)}>{t('all')}</div>
                        </Tooltip>
                        <Tooltip placement="topLeft" title={t('ttType')} mouseEnterDelay={1}>
                          <div className={'exs-filter-boardHistory' + (boardHistoryType === BOARD_HISTORY_FILTER.MAKE_BUY ? ' exs-active-filter' : '')} onClick={() => handleFilterBoardHistory(BOARD_HISTORY_FILTER.MAKE_BUY)}>{t('makeBuy')}</div>
                        </Tooltip>
                        <Tooltip placement="topLeft" title={t('ttType')} mouseEnterDelay={1}>
                          <div className={'exs-filter-boardHistory' + (boardHistoryType === BOARD_HISTORY_FILTER.MAKE_SELL ? ' exs-active-filter' : '')} onClick={() => handleFilterBoardHistory(BOARD_HISTORY_FILTER.MAKE_SELL)}>{t('makeSell')}</div>
                        </Tooltip>
                        <Tooltip placement="topLeft" title={t('ttType')} mouseEnterDelay={1}>
                          <div className={'exs-filter-boardHistory' + (boardHistoryType === BOARD_HISTORY_FILTER.TAKE_BUY ? ' exs-active-filter' : '')} onClick={() => handleFilterBoardHistory(BOARD_HISTORY_FILTER.TAKE_BUY)}>{t('takeBuy')}</div>
                        </Tooltip>
                        <Tooltip placement="topLeft" title={t('ttType')} mouseEnterDelay={1}>
                          <div className={'exs-filter-boardHistory' + (boardHistoryType === BOARD_HISTORY_FILTER.TAKE_SELL ? ' exs-active-filter' : '')} onClick={() => handleFilterBoardHistory(BOARD_HISTORY_FILTER.TAKE_SELL)}>{t('takeSell')}</div>
                        </Tooltip>
                        <Tooltip placement="topLeft" title={t('ttType')} mouseEnterDelay={1}>
                          <div className="exs-ic-arrow" onClick={() => handleChangeActiveBoard(ORDER_BOARD.BOARD_HISTORY)}>
                            {activeOrderBoard === ORDER_BOARD.BOARD_HISTORY ? <div className='exs-iconDown-order'></div> : <div className='exs-iconUp-order'></div>}
                          </div>
                        </Tooltip>
                      </div>
                      <div className='exs-table-header exc-text-upCase'>
                        <div className='exs-first-column exs-column18 exs-text-left'>{t('time')}</div>
                        <div className='exs-column15'>{t('price')} <span className='exs-token-name'>{coinPair.second.symbol}</span></div>
                        <div className='exs-column18'>{t('amount')} <span className='exs-token-name'>{coinPair.first.symbol}</span></div>
                        <div className='exs-column18'>{t('totalAmount')} <span className='exs-token-name'>{coinPair.second.symbol}</span></div>
                        <div className='exs-column18'>{t('block')}</div>
                        <div className='exs-last-column exs-column18'>{t('type')}</div>
                      </div>
                      <div className='exs-list-trade-history-container' id='HBScrollBar'>
                        {!isLoadingOrder
                          ? <InfiniteScroll
                            className="exs-list-coin"
                            initialLoad={false}
                            pageStart={0}
                            loadMore={handleInfiniteOnLoadBoardHistory}
                            hasMore={hasMoreBoardHistory}
                            useWindow={false}>
                            {dexData.boardHistory.length === 0
                              ? <div className='exs-list-empty-text'>{t('NoData')}</div>
                              : <List
                                className="exs-list-trade-history exs-list-coin"
                                dataSource={dexData.boardHistory}
                                renderItem={(item, index) => this.renderBoardHistory(item, index, coinPair, mainAddress, t, lightingBoardHistory, localeData)} />
                            }
                            {isLoadMoreBoardHistory
                              ? <div className='exs-load-more'><Spin/></div>
                              : ''
                            }
                          </InfiniteScroll>
                          : <div className='exs-history-loading'><Spin/></div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Modal ref="md_exs_gas">
            <PopupGas
              orderJSON={orderJSON}
              onChangePPWrapAmount={onChangePPWrapAmount}
              wethToken={arrTokenData[0]}
              dragVolume={dragVolume}
              setWidthPrice={setWidthPrice}
              gasLimit={this.gasLimit}
              transactionFee={transactionFee}
              etherPrice={etherPrice.price}
              that={this}
              t={t}
              isFillSell={this.isFillSell}
              unlock={() => unlock(checkarrToken)}
              isWrap={isWrap}
              wrapAction={wrapAction}
              popupGas={this.refs.md_exs_gas}
              fillOrderAction={fillAction}
              clickPopUp={clickPopUp}
              gasAmount={gasAmount}
              gasPrice={gasPrice}
              atcResultEth={atcResultEth}
              fillOrderTotal={fillOrderTotal}
              strAmount={strPPAmount}
              valueInputGas={valueInputGas}
              focusInputGasPrice={focusInputGasPrice}
              unFocusInputGasPrice={unFocusInputGasPrice}
              amountAltCoin={coinPair.first.balance}
              balanceWETH={coinPair.second.balance}
              balanceETH={mainAccount.balance}
              cancelOrderByUser={cancelOrderByUser}
              clickCancel={clickCancel}
              openPopupCancelByID={openPopupCancelByID}
              checkarrToken={checkarrToken}
              checkUnlocked={checkUnlocked}
              getImageToken={getImageToken}
              fillOrderInput={fillOrderInput}
              localeData={this.props.localeData}
              currency={this.currency}
              coinPair={coinPair}
              handleChangeGasPrice={this.props.handleChangeGasPrice}
              nameToken={coinPair.first.name}
            />
          </Modal>
          <Modal ref="md_exs_lock">
            <PopupLock
              lock={this.refs.md_exs_lock}
              that={this}
              t={t}
              checkUnlocked={checkUnlocked}
              popupGas={this.refs.md_exs_gas}
              gasPrice={gasPrice}
              gasLimit={this.gasLimit}
              getImageToken={getImageToken}
              balanceForPPLock={balanceForPPLock}
              balancePriceForPPLock={balancePriceForPPLock}
              checkarrToken={checkarrToken}
              balanceOfALTcoin={Math.abs(dexSelectedPair.lastPrice.price)}
              currency={this.currency}
              nameToken={coinPair.first.name}
              currentAccount={mainAccount.cardName === 'Main Account' ? t('mainAccount') : mainAccount.cardName}
            />
          </Modal>
          <Modal ref="md_exs_place_order">
            <PopupPlaceOrder
              that={this}
              t={t}
              isSell={isSell}
              amountInput={amountInput}
              coinPair={coinPair}
              priceInput={priceInput}
              date={date}
              totalInput={totalInput}
              nextPlaceOrder={nextPlaceOrder}
              localeData={localeData}
            />
          </Modal>
          <Modal ref="md_exs_tour">
            <PopupTour THIS={this}/>
          </Modal>
          <Modal ref="md_exs_fill_order">
            <PopupFillOrder
              orderJSON={orderJSON}
              THIS={this}
              t={t}
            />
          </Modal>
          <Modal ref="md_exs_order_detail">
            <PopupOrderDetail 
              THIS={this}
              renderAmountFormat={this.renderAmountFormat}
            />
          </Modal>
        </div>
    )
  }
  renderDropdownCoin (pairs, onChangeDropdownCoin) {
    return (
      <Menu className='exs-dropdown-container' onClick={(pair) => onChangeDropdownCoin(pair)}>
        {pairs.map((p, index) => {
          return (
            <Menu.Item className="exs-menu-item" key={index} data={p}>{p.first.symbol + ' / ' + p.second.symbol}</Menu.Item>
          )
        })}
      </Menu>
    )
  }
  renderRating () {
    const { t } = this.props
    return (
      <div className="exs-rate">
        <Tooltip placement="topLeft" title={t('ttRate')} mouseEnterDelay={1} className="exs-wrap-star">
          <Dropdown overlay={this.state.rateAndFavorite.myRate === null ? this.renderFavorite() : this.renderNotThing()}>
            <Dropdown overlay={this.state.rateAndFavorite.myRate === null ? this.renderNotThing() : this.renderAllFavorite()}>
              <div>
                <StarRatings
                  className='exs-star'
                  rating={this.state.rateAndFavorite.averageRate}
                  starRatedColor='rgb(239, 219, 158)'
                  starEmptyColor='rgb(168, 168, 168)'
                  starDimension='13px'
                  starSpacing='2px'
                  numberOfStars={5}
                  svgIconPath='M213.333 10.441l65.916 133.576 147.418 21.419L320 269.41l25.173 146.816-131.84-69.316-131.848 69.316 25.182-146.816L0 165.436l147.409-21.419z'
                  svgIconViewBox='0 0 426.667 426.667'
                  name='rating'
                  title={null}
                />
                <img className='exs-caret-down' src={Images.nav_down_grey} />
              </div>
            </Dropdown>
          </Dropdown>
          <div className="exs-number-rate">{formatNumber(this.state.rateAndFavorite.averageRate, 1)}</div>
        </Tooltip>
        <Tooltip placement="topLeft" title={t('ttPeople')} mouseEnterDelay={1} className="exs-wrap-icon-user">
          <div className="exs-people-rate">{t('votes', { number: formatNumber(this.state.totalRate, 0) })}</div>
        </Tooltip>
      </div>
    )
  }
  renderMyBalance () {
    const { dexLastTransaction, pendingTx, arrCardData, t } = this.props
    const { coinPair, gasPrice, isSending, isLoadedTokenBalance, isLoadingLastTransaction, totalActiveBuy, totalActiveSell } = this.state
    const mainAccount = filterMainAccount(arrCardData)
    return (
      <React.Fragment>
        <div className='exs-table-header'>
          <Tooltip placement="topLeft" title={t('ttAsset')} mouseEnterDelay={1}>
            <div className='exs-first-column exs-column50 exs-text-left exc-text-upCase exc-set-font exs-one-line exs-color-white'>{mainAccount.cardName === 'Main Account' ? t('mainAccount') : mainAccount.cardName}</div>
          </Tooltip>
          <Tooltip placement="topLeft" title={t('ttBalance')} mouseEnterDelay={1}>
            <div className='exs-last-column exs-column50 exc-text-upCase exc-set-font exs-color-white'>
              <img className={'ic-reload ' + (!isLoadedTokenBalance ? 'ic-reload-active' : '') } src={Images.refresh} onClick={() => this.props.reloadTokenBalance()} /> {t('balance')}
            </div>
          </Tooltip>
        </div>
        <div className='exs-list-balance-container'>
          <div className='exs-list-balance-sub-container' id='HBScrollBar'>
            <div className='exs-list-balance exs-list-coin'>
              <div className='exs-cell-balance-container exs-cell-balance-border'>
                {
                  <div className={'exs-asset-balance ' + (coinPair.second.unlocked ? 'exs-unlock-status' : 'exs-lock-status')}>
                    {dexLastTransaction.tokenTx[coinPair.second.address]
                      ? <div className='exs-asset'>
                        <div className='exs-column60'>
                          <div className='exs-time-wrap exs-color-gray exc-set-font'>{moment(dexLastTransaction.tokenTx[coinPair.second.address].timeStamp * 1000).fromNow()}</div>
                        </div>
                        <div className='exs-column40'>
                          <div className={'exs-number-wrap exs-text-right exs-amount-change ' + (dexLastTransaction.tokenTx[coinPair.second.address].received ? 'exs-text-green' : 'exs-text-red')}>
                            { dexLastTransaction.tokenTx[coinPair.second.address].received ? '+' : '-' }
                            { this.renderAmountFormat(convertWeiToBalance(dexLastTransaction.tokenTx[coinPair.second.address].balance, dexLastTransaction.tokenTx[coinPair.second.address].token.decimals), dexLastTransaction.tokenTx[coinPair.second.address].token.decimals) }
                          </div>
                        </div>
                      </div>
                      : <div></div>
                    }
                    <div className='exs-balance'>
                      <div className='exs-font-20px'>WETH</div>
                      <div className='exs-text-right exs-mgLeft-auto exs-amount-coin'>
                        {!isLoadedTokenBalance
                          ? <div className='exs-balance-loading'><Wave size={20} color='white' /></div>
                          : this.renderWETHFormat(coinPair.second.balance, 8)
                        }
                      </div>
                    </div>
                    {coinPair.second.unlocked &&
                    <div className='exs-available-amount'>
                      <div className="exs-ordered-amount">
                        <div>{t('orderedAmount')}</div>
                        <div>{this.renderWETHFormat(totalActiveBuy, 8)}</div>
                      </div>
                      <div className="exs-can-order">
                        <div>{t('canOrderMore')}</div>
                        <div>{(Number(coinPair.second.balance) - Number(totalActiveBuy)) > 0 ? this.renderWETHFormat(Number(coinPair.second.balance) - Number(totalActiveBuy), 8) : this.renderWETHFormat(0, coinPair.second.decimals)}</div>
                      </div>
                    </div>}
                    <div className='exs-lock-unclock'>
                      {coinPair.second.unlocked
                        ? <React.Fragment>
                          {coinPair.second.unLocking
                            ? <div className='exs-column-14'><Spin size={15} color={'white'}/></div>
                            : <Tooltip placement="topLeft" title={t('ttButton')} mouseEnterDelay={1}>
                              <div>
                                <img alt='img' onClick={() => this.props.openPopupLock(1)} className="exs-lock-btn btnOpacity exs-cursor-pointer" src={Images.toggle_selected}/>
                                {t('unlock')}
                              </div>
                            </Tooltip>}
                          <div>{t('YouCanTrade')}</div>
                        </React.Fragment>
                        : <React.Fragment>
                          {coinPair.second.unLocking
                            ? <div className='exs-column-14'><Spin size={15} color={'white'}/></div>
                            : <Tooltip placement="topLeft" title={t('ttButton')} mouseEnterDelay={1}>
                              <div>
                                <img alt='img' onClick={() => this.props.openPopupLock(1)} className="exs-lock-btn btnOpacity exs-cursor-pointer" src={Images.toggle}/>
                                {t('lock')}
                              </div>
                            </Tooltip>}
                          <div>{t('YouCanTrade')}</div>
                        </React.Fragment>
                      }
                    </div>
                  </div>
                }
              </div>
              <div className='exs-cell-balance-container exs-cell-balance-border'>
                {
                  <div className={'exs-asset-balance ' + (coinPair.first.unlocked ? 'exs-unlock-status' : 'exs-lock-status')}>
                    {dexLastTransaction.tokenTx[coinPair.first.address]
                      ? <div className='exs-asset'>
                        <div className='exs-column60'>
                          <div className='exs-time-wrap exs-color-gray exc-set-font'>{moment(dexLastTransaction.tokenTx[coinPair.first.address].timeStamp * 1000).fromNow()}</div>
                        </div>
                        <div className='exs-column40'>
                          <div className={'exs-number-wrap exs-text-right exs-amount-change ' + (dexLastTransaction.tokenTx[coinPair.first.address].received ? 'exs-text-green' : 'exs-text-red')}>
                            { dexLastTransaction.tokenTx[coinPair.first.address].received ? '+' : '-' }
                            { this.renderAmountFormat(convertWeiToBalance(dexLastTransaction.tokenTx[coinPair.first.address].balance, dexLastTransaction.tokenTx[coinPair.first.address].token.decimals), dexLastTransaction.tokenTx[coinPair.first.address].token.decimals) }
                          </div>
                        </div>
                      </div>
                      : <div></div>
                    }
                    <div className='exs-balance'>
                      <div className='exs-font-20px'>{coinPair.first.symbol}</div>
                      <div className='exs-text-right exs-mgLeft-auto exs-amount-coin'>
                        {!this.state.isLoadedTokenBalance
                          ? <div className='exs-balance-loading'><Wave size={20} color='white' /></div>
                          : this.renderAmountFormat(coinPair.first.balance, coinPair.first.decimals)
                        }
                      </div>
                    </div>
                    {coinPair.first.unlocked &&
                    <div className='exs-available-amount'>
                      <div className="exs-ordered-amount">
                        <div>{t('orderedAmount')}</div>
                        <div>{this.renderAmountFormat(totalActiveSell, coinPair.first.decimals)}</div>
                      </div>
                      <div className="exs-can-order">
                        <div>{t('canOrderMore')}</div>
                        <div>{(Number(coinPair.first.balance) - Number(totalActiveSell)) > 0 ? this.renderAmountFormat(Number(coinPair.first.balance) - Number(totalActiveSell), coinPair.first.decimals) : this.renderWETHFormat(0, coinPair.first.decimals)}</div>
                      </div>
                    </div>}
                    <div className='exs-lock-unclock'>
                      {coinPair.first.unlocked
                        ? <React.Fragment>
                          {coinPair.first.unLocking
                            ? <div className='exs-column-14'><Spin size={15} color={'white'}/></div>
                            : <Tooltip placement="topLeft" title={t('ttButton')} mouseEnterDelay={1}>
                              <div>
                                <img alt='img' onClick={() => this.props.openPopupLock(0)} className="exs-lock-btn btnOpacity exs-cursor-pointer" src={Images.toggle_selected}/>
                                {t('unlock')}
                              </div>
                            </Tooltip>}
                          <div>{t('YouCanTrade')}</div>
                        </React.Fragment>
                        : <React.Fragment>
                          {coinPair.first.unLocking
                            ? <div className='exs-column-14'><Spin size={15} color={'white'}/></div>
                            : <Tooltip placement="topLeft" title={t('ttButton')} mouseEnterDelay={1}>
                              <div>
                                <img alt='img' onClick={() => this.props.openPopupLock(0)} className="exs-lock-btn btnOpacity exs-cursor-pointer" src={Images.toggle}/>
                                {t('lock')}
                              </div>
                            </Tooltip>}
                          <div>{t('YouCanTrade')}</div>
                        </React.Fragment>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          <div className='exs-tx-fee'>
            <div className='exs-tx-fee-title'>{t('ApproximateTransactionFee')}</div>
            <div className={'exs-tx-fee-make ' + (this.props.localeData === 'jp' ? 'exc-font-jp-10px' : '')}><span className='exs-tx-fee-take-title'>{t('Make')}, {t('Expired')}</span></div>
            <div className={'exs-tx-fee-make-txt ' + (this.props.localeData === 'jp' ? 'exc-font-jp-10px' : '')}><span>{t('Free')}</span></div>
            <div className={'exs-tx-fee-take'}>
              <span className='exs-tx-fee-take-title'>Take, Wrap, Unwrap, Cancel, Lock, Unlock</span>
            </div>
            <div className={'exs-tx-fee-take-txt ' + (this.props.localeData === 'jp' ? 'exc-font-jp-10px' : '')}>
              <span className='exs-tx-fee-take-price'>{this.currency}{this.renderUsdPriceFormat(convertWeiToBalance(Number(gasPrice.medium) * this.gasLimit, 9) * this.props.etherPrice.price)}</span>
              <div className='exs-tx-fee-description'>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 1 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 2 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 3 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 5 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 8 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 13 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 21 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 34 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 55 ? 'active-yellow' : ''))}></span>
                <span className={'exs-tx-fee-square ' + (gasPrice.medium >= 89 ? 'active-red' : (gasPrice.medium >= 89 ? 'active-yellow' : ''))}></span>
              </div>
            </div>
          </div>
          <Tooltip placement="topLeft" title={t('ttLastTransaction')} mouseEnterDelay={1}>
            {pendingTx.lastTxID && pendingTx.lastTxID.length > 0
              ? <div className='exs-tx-info'>
                <div>
                  <div className='exs-tx-info-header exs-color-gray exc-set-font'>{t('lastTransaction')}:
                    {(pendingTx.isPending || isSending) && <div style={{display: 'flex', marginLeft: '12px'}}>
                      <Spin size={15} color={'white'}/>
                      <span className='exs-pending'>{isSending ? t('sending') : t('pending')}</span>
                    </div>
                    }
                  </div>
                  {!isSending && <div onClick={() => this.props.openTxID(pendingTx.lastTxID)} className='exs-txID-title exs-cursor-pointer'>{pendingTx.lastTxID}</div>}
                </div>
              </div>
              : ''
            }
          </Tooltip>
        </div>
      </React.Fragment>
    )
  }
  renderNewOrder () {
    const { localeData, etherPrice, screenConfig, t } = this.props
    const { coinPair, amountInput, priceInput, date, hourSelect, minuteSelect, totalInput, isPlacing, isSell, isDisabledMakeOrder } = this.state
    return (
      <div className='exs-new-order'>
        {isDisabledMakeOrder
          ? <div className="exs-disable-make-order">
            <div className="exs-disable-wrapper">
              <div className="exs-disable-txt">{t('disableMakeOrder', { number: screenConfig.hb_dex.hold_limit_hbwallet || 3 })}</div>
              <button className="exs-disable-btn" onClick={() => this.props.switchToHBWalletExchangeScreen()}>{t('buyHBToken')}</button>
            </div>
          </div>
          : null
        }
        <div className='exs-groub-btns exs-group-buy'>
          <button onClick={() => this.props.setIsSell(false)} className={'exs-btn buy-order-btn exc-set-font ' + (localeData === 'jp' || localeData === 'cn' ? 'exs-JP-font ' : '') + (isSell ? '' : ' exs-btn-active')}><span>{t('buy')}</span></button>
          <button onClick={() => this.props.setIsSell(true)} className={'exs-btn sell-btn exc-set-font ' + (localeData === 'jp' || localeData === 'cn' ? 'exs-JP-font ' : '') + (isSell ? ' exs-btn-active' : '')}><span>{t('sell')}</span></button>
        </div>
        <div className={'exs-new-order-wrapper' + (isDisabledMakeOrder ? ' exs-disable-new-order' : '')}>
          <div className="exs-amount-group">
            <div className="exs-input-label exs-nowrap">{t('amount')}</div>
            <div className="exs-groub-btns exs-quick-choise-balance">
              <button className='exs-btn' onClick={() => this.props.onInputAmount(0.25)}>25%</button>
              <button className='exs-btn' onClick={() => this.props.onInputAmount(0.5)}>50%</button>
              <button className='exs-btn' onClick={() => this.props.onInputAmount(0.75)}>75%</button>
              <button className='exs-btn' onClick={() => this.props.onInputAmount(1)}>100%</button>
            </div>
          </div>
          <div className="exs-input-group">
            <div className="exs-input-left">
              <HBInput
                className={'exs-input-balance exc-text-upCase exc-set-font'}
                symbol={coinPair.first.symbol}
                isSpacing={true}
                placeholder=''
                value={amountInput}
                textSymbol={'exs-textSymbol'}
                onChange={(value) => this.props.onChangeAmount(value)}
                messageError={'Invalid amount'}>
              </HBInput>
            </div>
            <div className="exs-input-right">
              <button className="exs-input-btn exs-btn-increase" onClick={() => this.props.onChangeIncreaseAmount()}><span>+</span></button>
              <button className="exs-input-btn exs-btn-decrease" onClick={() => this.props.onChangeDecreaseAmount()}><span>－</span></button>
            </div>
          </div>
          <div className="exs-input-label">{t('price')}</div>
          <div className="exs-input-group">
            <div className="exs-input-left">
              <HBInput
                className={'exs-input-balance exc-text-upCase exc-set-font'}
                symbol={coinPair.second.symbol}
                isSpacing={true}
                placeholder=''
                value={priceInput}
                textSymbol={'exs-textSymbol'}
                onChange={(value) => this.props.onChangePrice(value)}/>
            </div>
            <div className="exs-input-right">
              <button className="exs-input-btn exs-btn-increase" onClick={() => this.props.onChangeIncreasePrice()}><span>+</span></button>
              <button className="exs-input-btn exs-btn-decrease" onClick={() => this.props.onChangeDecreasePrice()}><span>－</span></button>
            </div>
          </div>
          <div className="exs-input-label">{t('expiresIn')}</div>
          <div className='exs-text-expires exc-set-font'>
            <DatePicker
              inline
              selected={date}
              onSelect={this.onSelect}
              onChange={this.onPanelChange}
              minDate={new Date()}
              showDisabledMonthNavigation
            />
            <Select 
              className='exs-select-hour' 
              defaultValue={hourSelect} 
              onChange={(value) => this.handleChangeHour(value)}
            >
              {this.renderOptionHours()}
            </Select>
            <span className='exs-select-hour-two-dot'>:</span>
            <Select 
              className='exs-select-minute' 
              defaultValue={minuteSelect} 
              onChange={(value) => this.handleChangeMinute(value)}
            >
              {this.renderOptionMinute()}
            </Select>
          </div>
          <div className={'exs-input-label exs-input-total exs-yellow ' + localeData}>
            {t('total01')}
            <span className="exs-dollarHiden">{Number(totalInput) > 0 ? (<span>{this.currency}{this.renderUsdPriceFormat(Number(totalInput) * Number(etherPrice.price))}</span>) : ''}</span>
          </div>
          <HBInput
            className={'exs-input-balance exc-text-upCase exc-set-font exc-textWhite'}
            symbol={coinPair.second.symbol}
            isSpacing={true}
            placeholder=''
            value={Number(totalInput) > 0 ? formatNumberLeftZeroCal(totalInput) : ''}
            textSymbol={'exs-textSymbol'}
            onFocus={() => {}}
            onBlur={() => {}}
            readOnly={true}
            onChange={(value) => this.props.onChangeTotal(value)}/>
          <button
            disabled={isPlacing}
            className={'exs-btn place-sell-order-btn exc-set-font ' + (localeData === 'jp' || localeData === 'cn' ? 'exs-JPSell-pdTop0px ' : ' ') + (isSell ? ' editColorSell ' : ' editColorBuy ')}
            onClick={() => this.props.clickPlaceOrder()}>
            {isPlacing ? <Spin size={15} color={'white'}/> : isSell ? <span>{t('placeSellOrder')}</span> : <span>{t('placeBuyOrder')}</span>}
          </button>
        </div>
      </div>
    )
  }
  renderOrderBookSell (item, index, coinPair, clickOnCellOrder, mainAddress, isActive, etherPrice, largestAmountOrder, lightingOrderBookSellId) {
    const totalBalance = sumValueByKey(item, 'balance')
    const colorLightning = 
      this.state.lightingOrderBookFilling
        ? 'exc-animation-white-lightning'
        : 'exc-animation-red-lightning'
    return (
      item[0]
        ? <div className={'exs-cell-balance-container btnOpacity exs-orderBook-sell ' + (item.findIndex(e => e.signedOrder.makerAddress.toLowerCase() === mainAddress) !== -1 ? 'exs-myorder-row ' : '') + (item.findIndex(e => e._id === lightingOrderBookSellId) !== -1 ? colorLightning : '')} onClick={() => clickOnCellOrder(item)}>
          <div className='exs-order-volume' style={{width: ((totalBalance / largestAmountOrder) * 100).toString() + '%'}}></div>
          <div className='exs-color-silver'>
            { isActive
              ? this.renderPriceFormat(item[0].price, 8)
              : this.renderUsdPriceFormat(item[0].price * etherPrice.price, 4)
            }
          </div>
          <div className='exs-color-silver exs-text-right'>
            { this.renderAmountFormat(totalBalance, coinPair.first.decimals) }
          </div>
        </div>
        : null
    )
  }
  renderOrderBookBuy (item, index, coinPair, clickOnCellOrder, mainAddress, isActive, etherPrice, largestAmountOrder, lightingOrderBookBuyId) {
    const totalBalance = sumValueByKey(item, 'balance')
    const colorLightning = 
      this.state.lightingOrderBookFilling
        ? 'exc-animation-white-lightning'
        : 'exc-animation-green-lightning'
    return (
      item[0]
        ? <div className={'exs-cell-balance-container btnOpacity exs-orderBook-buy ' + (item.findIndex(e => e.signedOrder.makerAddress.toLowerCase() === mainAddress) !== -1 ? 'exs-myorder-row ' : '') + (item.findIndex(e => e._id === lightingOrderBookBuyId) !== -1 ? colorLightning : '')} onClick={() => clickOnCellOrder(item, false)}>
          <div className='exs-order-volume' style={{width: ((totalBalance / largestAmountOrder) * 100).toString() + '%'}}></div>
          <div className='exs-color-silver'>
            { isActive
              ? this.renderPriceFormat(item[0].price, 8)
              : this.renderUsdPriceFormat(item[0].price * etherPrice.price, 4)
            }
          </div>
          <div className='exs-color-silver exs-text-right'>
            { this.renderAmountFormat(totalBalance, coinPair.first.decimals) }
          </div>
        </div>
        : null
    )
  }
  renderMyOrders (item, coinPair, clickCancel, orderCanceling, isCancelingOrder, t, lightingMyOrder, openPopupCancel, localeData) {
    return (
      <div className={'exs-cell-balance-container exs-cell-noPadding ' + (lightingMyOrder ? ' exc-animation-white-lightningt' : '')}>
        <div className='exs-first-column exs-column15 exs-color-gray'>{moment(item.expires * 1000).format('MM/DD HH:mm')}</div>
        <div className='exs-column15 exs-text-right exs-color-gray'>
          { this.renderAmountFormat(item.balance, coinPair.first.decimals) }
        </div>
        <div className='exs-column15 exs-text-right exs-color-gray'>
          { this.renderPriceFormat(item.price, 8) }
        </div>
        <div className='exs-column20 exs-text-right exs-color-gray'>
          { this.renderAmountFormat(item.total, 8) }
        </div>
        <div className='exs-column12 exs-text-right exs-color-gray'>0</div>
        <div className={item.statusCode === ORDER_STATUS.OPEN ? 'exs-column12 exs-text-cancel btnOpacity exs-text-center exs-color-gray' : 'exs-column15 exs-color-gray'} onClick={() => item.statusCode === ORDER_STATUS.OPEN ? openPopupCancel(item) : {}}>
          <div className={'exs-btn-cancel ' + (localeData === 'jp' ? 'exs-font-85' : '')}>
            {isCancelingOrder && orderCanceling === item._id
              ? <div className='exs-balance-loading'><Spin size={10}/></div>
              : t(ORDER_STATE[item.statusCode])
            }
          </div>
        </div>
        <div className={'exs-column12 exs-text-left exs-color-gray ' + (localeData === 'jp' ? 'exs-font-11' : '')}>{item.isSell ? t('makeSell') : t('makeBuy')}</div>
      </div>
    )
  }
  renderMyHistory (item, index, coinPair, clickOnOrderHistory, t, lightingMyHistory, localeData, isCancelingOrder, orderCanceling) {
    let canceling = false
    if (orderCanceling.length > 1) {
      canceling = orderCanceling.includes(item._id)
    } else {
      if (orderCanceling === item._id) {
        canceling = true
      }
    }
    const colorStatus = 
      item.statusCode === ORDER_STATUS.OPEN || item.statusCode === ORDER_STATUS.WARNING
        ? 'exs-color-white'
        : item.statusCode === ORDER_STATUS.PROCESSING
          ? 'exs-color-yellow'
          : item.statusCode === ORDER_STATUS.FILLED && !item.isMyOrder 
            ? (item.isSell ? 'exs-color-green' : 'exs-color-red') 
            : 'exs-color-silver'
    const colorLightning = 
      this.state.lightingOrderBookFilling
        ? 'exc-animation-first-white'
        : item.statusCode === ORDER_STATUS.OPEN
          ? item.isSell ? 'exc-animation-first-red' : 'exc-animation-first-green'
          : 'exc-animation-first-white'
    return (
      <Tooltip placement="topRight" overlayClassName={item.statusCode === ORDER_STATUS.WARNING ? 'tooltip-warning' : ''} title={
        item.statusCode === ORDER_STATUS.CANCEL && Number(item.actualTxCost) <= 0 && Number(item.blockNumber) === 0
          ? t('Cancelling')
          : item.balanceFilling 
            ? t('beingFilled', { balance: convertWeiToBalance(item.balanceFilling, item.isSell ? item.metadata.makerToken.decimals : item.metadata.takerToken.decimals), token: item.tokenSymbol })
            : t(ORDER_STATE[item.statusCode])
      }>
        <div className={'exs-cell-balance-wrapper ' + colorStatus + ((item.statusCode === ORDER_STATUS.OPEN && item.balanceFilling) || item.statusCode === ORDER_STATUS.PROCESSING ? ' exc-animation-neon' : '')}>
          <div className={'exs-cell-balance-container exs-cell-noPadding ' + (index % 2 === 1 ? 'exs-ChangeBG ' : '') + (lightingMyHistory ? colorLightning : '')} onClick={() => clickOnOrderHistory(item)}>
            <div className='exs-first-column exs-column18'>{moment(item.sortTimestamp * 1000).format('MM/DD HH:mm')}</div>
            <div className='exs-column15 exs-text-right exs-price-history'>
              { this.renderPriceFormat(item.price, 8) }
              {(item.statusCode === ORDER_STATUS.FILLED || item.statusCode === ORDER_STATUS.PROCESSING) && !item.isMyOrder &&
                (item.isSell ? <Icon className='exs-icon-history' type="arrow-up" />
                  : <Icon className='exs-icon-history' type="arrow-down" />)
              }
            </div>
            <div className='exs-column18 exs-text-right'>
              { this.renderAmountFormat(item.balance, coinPair.first.decimals) }
            </div>
            <div className='exs-column18 exs-text-right'>
              { this.renderWETHFormat(item.total, 8) }
            </div>
            <div className='exs-column18 exs-text-right'>{(item.statusCode === ORDER_STATUS.FILLED || item.statusCode === ORDER_STATUS.CANCEL || item.statusCode === ORDER_STATUS.FAILED) ? (item.actualTxCost ? this.renderWETHFormat(convertWeiToBalance(item.actualTxCost), 8) : '0.00') : '0.00'}</div>
            <div className={'exs-last-column exs-order-status exs-column18 exs-text-right' + (localeData === 'jp' ? ' exs-font-11' : '')}>
              {isCancelingOrder && canceling
                ? <div style={{display: 'inline-block', right: '8px', top: '-5px', position: 'relative'}}><Spin size={10} color={'white'}/></div>
                : item.statusCode === ORDER_STATUS.CANCEL && Number(item.actualTxCost) <= 0 && Number(item.blockNumber) === 0
                  ? <div style={{display: 'inline-block', right: '8px', top: '-5px', position: 'relative'}}><Spin size={10} color={'white'}/></div>
                  : ''
              }
              {item.isMyOrder
                ? (item.isSell ? t('makeSell') : t('makeBuy'))
                : (item.isSell 
                  ? item.statusCode === ORDER_STATUS.PROCESSING ? t('takeSell1') : t('takeSell') 
                  : item.statusCode === ORDER_STATUS.PROCESSING ? t('takeBuy1') : t('takeBuy'))
              }
              <span className="exs-order-status-icon">
                <img src={Images.orderStatus[item.statusCode]} alt=""/>
              </span>
            </div>
          </div>
        </div>
      </Tooltip> 
    )
  }
  renderBoardHistory (item, index, coinPair, mainAddress, t, lightingBoardHistory, localeData) {
    const colorStatus = 
      item.statusCode === ORDER_STATUS.OPEN
        ? 'exs-color-silver'
        : item.statusCode === ORDER_STATUS.FILLED
          ? (item.isSell ? 'exs-color-green' : 'exs-color-red') 
          : ''
    const colorLightning = 
      this.state.lightingOrderBookFilling
        ? 'exc-animation-first-white'
        : item.statusCode === ORDER_STATUS.OPEN
          ? item.isSell ? 'exc-animation-first-red' : 'exc-animation-first-green'
          : 'exc-animation-first-white'
    return (
      <div className={'exs-cell-balance-wrapper ' + colorStatus}>
        <div className={'exs-cell-balance-container exs-cell-noPadding ' + (index % 2 === 1 ? 'exs-ChangeBG ' : '') + (lightingBoardHistory ? colorLightning : '')}>
          <div className='exs-first-column exs-column18'>{moment(item.sortTimestamp * 1000).format('MM/DD HH:mm')}</div>
          <div className='exs-column15 exs-text-right exs-price-history'>
            { this.renderPriceFormat(item.price, 8) }
            {item.statusCode === ORDER_STATUS.FILLED &&
              (item.isSell 
                ? <Icon className='exs-icon-history' type="arrow-up" />
                : <Icon className='exs-icon-history' type="arrow-down" />)
            }
          </div>
          <div className='exs-column18 exs-text-right'>
            { this.renderAmountFormat(item.statusCode === ORDER_STATUS.OPEN ? item.amount : item.balance, coinPair.first.decimals) }
          </div>
          <div className='exs-column18 exs-text-right'>
            { this.renderWETHFormat(item.statusCode === ORDER_STATUS.OPEN ? Number(item.amount) * Number(item.price) : item.total, 8) }
          </div>
          <div className='exs-column18 exs-text-right'>{item.statusCode === ORDER_STATUS.FILLED ? item.blockNumber : 0}</div>
          <div className={'exs-last-column exs-column18 exs-text-right ' + (localeData === 'jp' ? 'exs-font-11' : '')}>
            {item.statusCode === ORDER_STATUS.FILLED ? (item.isSell ? t('takeSell') : t('takeBuy'))
              : (item.statusCode === ORDER_STATUS.OPEN ? (item.isSell ? t('makeSell') : t('makeBuy')) : t(ORDER_STATE[item.statusCode]))
            }
          </div>
        </div>
      </div>
    )
  }
  renderOptionHours () {
    return (
      this.hours.map(item => {
        return (<Option key={item} value={item}>{item}</Option>)
      })
    )
  }
  renderOptionMinute () {
    return (
      this.minutes.map(item => {
        return (<Option key={item} value={item}>{item}</Option>)
      })
    )
  }
  renderSelectMunites (t) {
    return (
      PERIOD_MUNITE.map(item => {
        return (<Option key={item} value={item}>{t(item)}</Option>)
      })
    )
  }
  renderSelectHours (t) {
    return (
      PERIOD_HOURS.map(item => {
        return (<Option key={item} value={item}>{t(item)}</Option>)
      })
    )
  }
  renderMarket () {
    return (
      MARKET_PRICE.map(item => {
        return (<Option style={{fontSize: '12px'}} key={item} value={item}>{item}</Option>)
      })
    )
  }
  renderSwitchPrice () {
    return (
      this.state.marketPricePair.map(item => {
        return (<Option style={{fontSize: '12px'}} key={item} value={item}>{item}</Option>)
      })
    )
  }
  renderSwitchPrice2 () {
    return (
      this.state.pricePair.map(item => {
        return (<Option style={{fontSize: '12px'}} key={item} value={item}>{item}</Option>)
      })
    )
  }

  renderMyOrdersFilter () {
    return (
      ORDER_FILTER_STATE.map((item, key) => {
        return (<Option style={{fontSize: '12px'}} key={key} value={key}>{item}</Option>)
      })
    )
  }

  renderFavorite () {
    return (
      <div className='exs-drop-favorite'>
        <div className="exs-star-evaluate">
          <img className='exs-star-unset' 
            src={this.state.isNumberHoverRating > 4 ? Images.Rate : Images.unRate} 
            onMouseEnter={() => this.props.hoverOnRating(5)} 
            onMouseLeave={() => this.props.hoverOffRating()} 
            onClick={() => this.props.handleChangeRating(5)}/>
          <img className='exs-star-unset' 
            src={this.state.isNumberHoverRating > 3 ? Images.Rate : Images.unRate} 
            onMouseEnter={() => this.props.hoverOnRating(4)} 
            onMouseLeave={() => this.props.hoverOffRating()} 
            onClick={() => this.props.handleChangeRating(4)}/>
          <img className='exs-star-unset' 
            src={this.state.isNumberHoverRating > 2 ? Images.Rate : Images.unRate} 
            onMouseEnter={() => this.props.hoverOnRating(3)} 
            onMouseLeave={() => this.props.hoverOffRating()} 
            onClick={() => this.props.handleChangeRating(3)}/>
          <img className='exs-star-unset' 
            src={this.state.isNumberHoverRating > 1 ? Images.Rate : Images.unRate} 
            onMouseEnter={() => this.props.hoverOnRating(2)} 
            onMouseLeave={() => this.props.hoverOffRating()} 
            onClick={() => this.props.handleChangeRating(2)}/>
          <img className='exs-star-unset' 
            src={this.state.isNumberHoverRating > 0 ? Images.Rate : Images.unRate} 
            onMouseEnter={() => this.props.hoverOnRating(1)} 
            onMouseLeave={() => this.props.hoverOffRating()} 
            onClick={() => this.props.handleChangeRating(1)}/>
        </div>
        <div className="exs-evaluate">{this.props.t('evaluateThisToken')}</div>
      </div>
    )
  }

  renderAllFavorite () {
    return (
      <div className='exs-drop-favorite'>
        <div className="exs-5-star">
          <span className='exs-per-rate'>{formatNumber((this.state.rateAndFavorite.five_star / this.state.totalRate * 100), 0)}%</span>
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
        </div>
        <div className="exs-4-star">
          <span className='exs-per-rate'>{formatNumber((this.state.rateAndFavorite.four_star / this.state.totalRate * 100), 0)}%</span>
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
        </div>
        <div className="exs-3-star">
          <span className='exs-per-rate'>{formatNumber((this.state.rateAndFavorite.three_star / this.state.totalRate * 100), 0)}%</span>
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
        </div>
        <div className="exs-2-star">
          <span className='exs-per-rate'>{formatNumber((this.state.rateAndFavorite.two_star / this.state.totalRate * 100), 0)}%</span>
          <img className='exs-star exs-star-active' src={Images.Rate} />
          <img className='exs-star exs-star-active' src={Images.Rate} />
        </div>
        <div className="exs-1-star">
          <span className='exs-per-rate'>{formatNumber((this.state.rateAndFavorite.one_star / this.state.totalRate * 100), 0)}%</span>
          <img className='exs-star exs-star-active' src={Images.Rate} />
        </div>
      </div>
    )
  }
  renderNotThing () {
    return (
      <div></div>
    )
  }

  renderMarketCoin (item, index) {
    return (
      <div key={index} className='exs-top-balance-value'>
        {item.symbol + ' '} ${this.renderUsdPriceFormat(item.price_usd)} {Number(item.percent_change_1h) > 0 ? <img className="icon-trend" src={Images.ArrowUpSmallNew} /> : <img className="icon-trend" src={Images.ArrowDownSmallNew} />}
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
  renderPriceFormat (price, decimals) {
    const firstNumber = formatPriceNumber(price, decimals).toString().split('.')[0]
    const secondNumber = formatPriceNumber(price, decimals).toString().split('.')[1]
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderUsdPriceFormat (price) {
    const { firstNumber, secondNumber } = formatFiatDisplay(price)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderWETHFormat (balance, decimals) {
    const { firstNumber, secondNumber } = formatNumberDisplay(balance, decimals)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderPriceFormat2 (price, decimals) {
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{parseInt(Number(price).toFixed(8)).toLocaleString()}</span>
        {Number(price) > 1000000
          ? <span className="exc-usd-second">{(formatNumberOld(price, decimals, true)).toString().split('.')[1] ? '.' + (formatNumberOld(price, 5, true)).toString().split('.')[1] : ''}</span>
          : <span className="exc-usd-second">{(formatNumberOld(price, decimals, true)).toString().split('.')[1] ? '.' + (formatNumberOld(price, decimals, true)).toString().split('.')[1] : ''}</span>
        }
      </div>
    )
  }
  renderPriceWEthFormat (price, decimals) {
    const firstNumber = formatSmallNumber(Number(price)).toString().split('.')[0]
    const secondNumber = formatSmallNumber(Number(price)).toString().split('.')[1]
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{parseInt(firstNumber)}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + ((firstNumber.length + secondNumber.length) > decimals ? secondNumber.substr(0, decimals - firstNumber.length) : secondNumber) : ''}</span>
      </div>
    )
  }
  renderVolumeFormat (amount, decimals) {
    const firstNumber = formatNumber(amount, decimals).toString().split('.')[0]
    const secondNumber = formatNumber(amount, decimals).toString().split('.')[1]
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderSocial (selectedPair) {
    const { t } = this.props
    return (
      <div className='exs-social'>
        {selectedPair.homePage && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.homePage})} mouseEnterDelay={1}>
          <img alt='img' src={Images.home} className={'ic-social' + (selectedPair.homePage ? ' ic-social-active' : '')} onClick={() => selectedPair.homePage ? openBrowserInNewTab(selectedPair.homePage) : {}} />
        </Tooltip>}
        {selectedPair.blog && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.blog})} mouseEnterDelay={1}>
          <img alt='img' src={Images.blogger} className={'ic-social' + (selectedPair.blog ? ' ic-social-active' : '')} onClick={() => selectedPair.blog ? openBrowserInNewTab(selectedPair.blog) : {}} />
        </Tooltip>}
        {selectedPair.slack && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.slack})} mouseEnterDelay={1}>
          <img alt='img' src={Images.slack} className={'ic-social' + (selectedPair.slack ? ' ic-social-active' : '')} onClick={() => selectedPair.slack ? openBrowserInNewTab(selectedPair.slack) : {}} />
        </Tooltip>}
        {selectedPair.facebook && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.facebook})} mouseEnterDelay={1}>
          <img alt='img' src={Images.facebook} className={'ic-social' + (selectedPair.facebook ? ' ic-social-active' : '')} onClick={() => selectedPair.facebook ? openBrowserInNewTab(selectedPair.facebook) : {}} />
        </Tooltip>}
        {selectedPair.twitter && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.twitter})} mouseEnterDelay={1}>
          <img alt='img' src={Images.twitter} className={'ic-social' + (selectedPair.twitter ? ' ic-social-active' : '')} onClick={() => selectedPair.twitter ? openBrowserInNewTab(selectedPair.twitter) : {}} />
        </Tooltip>}
        {selectedPair.github && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.github})} mouseEnterDelay={1}>
          <img alt='img' src={Images.github} className={'ic-social' + (selectedPair.github ? ' ic-social-active' : '')} onClick={() => selectedPair.github ? openBrowserInNewTab(selectedPair.github) : {}} />
        </Tooltip>}
        {selectedPair.telegram && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.telegram})} mouseEnterDelay={1}>
          <img alt='img' src={Images.telegram} className={'ic-social' + (selectedPair.telegram ? ' ic-social-active' : '')} onClick={() => selectedPair.telegram ? openBrowserInNewTab(selectedPair.telegram) : {}} />
        </Tooltip>}
        {selectedPair.whitepaper && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.whitepaper})} mouseEnterDelay={1}>
          <img alt='img' src={Images.layer} className={'ic-social' + (selectedPair.whitepaper ? ' ic-social-active' : '')} onClick={() => selectedPair.whitepaper ? openBrowserInNewTab(selectedPair.whitepaper) : {}} />
        </Tooltip>}
        {selectedPair.reddit && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.reddit})} mouseEnterDelay={1}>
          <img alt='img' src={Images.reddit} className={'ic-social' + (selectedPair.reddit ? ' ic-social-active' : '')} onClick={() => selectedPair.reddit ? openBrowserInNewTab(selectedPair.reddit) : {}} />
        </Tooltip>}
        {selectedPair.discord && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.discord})} mouseEnterDelay={1}>
          <img alt='img' src={Images.discord} className={'ic-social' + (selectedPair.discord ? ' ic-social-active' : '')} onClick={() => selectedPair.discord ? openBrowserInNewTab(selectedPair.discord) : {}} />
        </Tooltip>}
        {selectedPair.linkedin && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.linkedin})} mouseEnterDelay={1}>
          <img alt='img' src={Images.linkedin} className={'ic-social' + (selectedPair.linkedin ? ' ic-social-active' : '')} onClick={() => selectedPair.linkedin ? openBrowserInNewTab(selectedPair.linkedin) : {}} />
        </Tooltip>}
        {selectedPair.youtube && <Tooltip placement="topLeft" title={t('ttSNS', {linkSNS: selectedPair.youtube})} mouseEnterDelay={1}>
          <img alt='img' src={Images.youtube} className={'ic-social' + (selectedPair.youtube ? ' ic-social-active' : '')} onClick={() => selectedPair.youtube ? openBrowserInNewTab(selectedPair.youtube) : {}} />
        </Tooltip>}
      </div>
    )
  }
}
