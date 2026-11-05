import React from 'react'
import './styles.css'
import { List, Tooltip, Pagination } from 'antd'
import { formatPriceNumber, formatNumber, formatNumberLeftZero, formatFiatDisplay, filterMainAccount, sumValueByKey, openBrowserInNewTab } from 'Utils/globalFunction'
import Images from 'Assets/Image'
import InfiniteScroll from 'react-infinite-scroller'
import { HBCURRENCY_SYMBOL, HBCURRENCY, ORDER_STATUS, USD_STATUS, OBSERVER_KEY, LIMIT_PRICE_TICKER } from 'Utils/globalConstants'
import { TwitterTimelineEmbed } from 'react-twitter-embed'
import ExchangeScreen from '../ExchangeScreen'
import ExchangeFavoriteEdit from '../ExchangeFavoriteEdit'
import { Spin } from 'Frontend/Components/HBLoader'
import Observer from 'Utils/HBObserver'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import FormatPrice from 'Frontend/Components/FormatPrice'
const { ipcRenderer } = window.require('electron')

const ORDER_STATE = {
  0: 'Open',
  1: 'Completed',
  2: 'canceled',
  3: 'Expired',
  4: 'Warning',
  5: 'Processing',
  6: 'Failed'
}
export default class ExchangeFavorite extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isLoadMoreAllToken: false,
      isLoadMoreTokenFavorite: false,
      isFavorite: false,
      hasMoreAllToken: true,
      hasMoreTokenFavorite: true,
      isLoadingOrder: true,
      isLoadingOrderFavorite: true,
      tradeHistory: [],
      tradeHistoryFavorite: [],
      lightingTradeHistory: false,
      lightingOrderBookFilling: false,
      lightingOrderBookSellId: '',
      lightingOrderBookBuyId: '',
      allTokenOffset: 0,
      favoriteList: [],
      favoriteListPerPage: [],
      currentPage: 1,
      defaultPageSize: 8,
      isActiveUSD: false,
      isLoadingFavorite: true,
      isLoadingRecentNews: true,
      isLoadedEdit: false,
      mostRecentNews: [],
      pageFavorite: 1
    }
    Observer.on(OBSERVER_KEY.NEW_DEX_ORDER_FAVORITE, props.updateNewDexOrderFavorite)
    Observer.on(OBSERVER_KEY.DEX_UPDATE_FAVORITE, props.updateDexSummaryFavorite)
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.funcDefautlThis(this)
  }
  componentDidMount () {
    this.props.loadInitData()
    this.props.getFavoriteList()
    // this.props.fetchMostRecentNews()
    window.addEventListener('resize', this.props.updateDimensions)
    // listening trigger from main window
    ipcRenderer.on('switched-account', this.props.triggerSwitchedAccount)
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.NEW_DEX_ORDER_FAVORITE, this.props.updateNewDexOrderFavorite)
    Observer.removeListener(OBSERVER_KEY.DEX_UPDATE_FAVORITE, this.props.updateDexSummaryFavorite)
    window.removeEventListener('resize', this.props.updateDimensions)
  }
  onChange = (page) => {
    console.log(page)
    this.setState({
      currentPage: page
    })
  }
  setRef = (ref) => {
    if (ref) {
      this.refTest = ref
      const scrollHeight = ref.scrollHeight
      const height = ref.clientHeight
      const maxScrollTop = scrollHeight - height
      ref.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
      // this.refTest && this.refTest.hide()
    }
  }
  render () {
    const { backToTop, dexAnnounce, arrListCoin, t, setIsFavorite, localeData, dexFavorite,
      handleInfiniteOnLoadAllToken, onChangePage, etherPrice, favoriteEdit, backFromFavoriteEdit,
      getPriceUSD, arrTokenData, clickOnCell, helpUrl, arrCardData, arrCurrencyData, handleFilterFavoriteToken, openExchangeScreen, handleInfiniteOnLoadTokenFavorite, dexTokenFavorite
    } = this.props
    const { isLoadMoreAllToken, isLoadMoreTokenFavorite, isFavorite, isLoadingOrder, isLoadingOrderFavorite, hasMoreAllToken, tradeHistory, tradeHistoryFavorite, hasMoreTokenFavorite,
      lightingTradeHistory, favoriteList, defaultPageSize, currentPage, favoriteListPerPage,
      isActiveUSD, isLoadingFavorite, isLoadedEdit, lightingOrderBookSellId, lightingOrderBookBuyId, isLoadingRecentNews, mostRecentNews
    } = this.state
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
    const mainAccount = filterMainAccount(arrCardData)
    return (
      isLoadedEdit 
        ? <ExchangeFavoriteEdit backFromFavoriteEdit={backFromFavoriteEdit}/>
        : openExchangeScreen 
          ? <ExchangeScreen backToTop={backToTop} limitPriceTicker={LIMIT_PRICE_TICKER} handleFilterFavoriteToken={handleFilterFavoriteToken} openExchangeScreen={openExchangeScreen} helpUrl={helpUrl}/>
          : <div className={'exf-contain ' + (localeData === 'jp' || localeData === 'cn' ? 'locale-jp-cn' : '') + (localeData === 'vn' ? ' locale-vn' : '')}>
            <div className="exs-wrap-scroll-txt">
              <div className="exs-scroll-txt">
                <div className='exs-wrap-marquee'>
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
            <div className="exf-topEdit">
              <div className="exf-backAndPaging">
                <button className="exs-btn-Back" onClick={backToTop}>
                  <img className="img-back"
                    alt='imgBack'
                    src={Images.tabNaviBack} />
                  {t('back')}
                </button>
                {!isLoadingFavorite && favoriteList.length > 0 && favoriteListPerPage.length > 0 && <React.Fragment>
                  <Pagination size="small" total={favoriteList.length > 0 ? favoriteList.length : defaultPageSize} pageSize={defaultPageSize} current={currentPage} onChange={(current) => onChangePage(current)}/>
                  <div className="exf-WethSwitch">
                    <div className={'exf-Weth ' + (isActiveUSD ? 'exf-gray' : '')} onClick={() => getPriceUSD(USD_STATUS.WETH)}>WETH</div>
                    <div className={'exf-USD ' + (isActiveUSD ? '' : 'exf-gray')} onClick={() => getPriceUSD(USD_STATUS.USD)}>{arrCurrencyData}</div>
                  </div>
                </React.Fragment>}
              </div>
              <div className="exf-favoriteEdit">
                <div className="exf-USD" onClick={() => favoriteEdit()}>{t('editFavorite')}</div>
              </div>
            </div>
            <div className='exf-full-side'>
              <div className='exf-left-side'>
                <div className="exf-left-content">
                  {isLoadingFavorite || dexTokenFavorite.isLoading
                    ? <div className='exs-history-loading'><Spin/></div>
                    : favoriteListPerPage && favoriteListPerPage.length > 0
                      ? <List
                        className="exf-wrap-favoriteInfo"
                        dataSource={favoriteListPerPage}
                        renderItem={(item, key) => this.renderFavoriteList(item, key, mainAccount.address, etherPrice, arrTokenData, isActiveUSD, clickOnCell, lightingOrderBookSellId, lightingOrderBookBuyId, this.currency, t)} />
                      : <div className="exf-favorite-empty">{t('NoData')}</div>
                  }
                </div>
              </div>
              <div className='exf-right-side'>
                <div className={'exf-trade-info' + ' exs-' + localeData}>
                  <div className='text-title-panner'>
                    <div className='exs-trade-title'>
                      <Tooltip placement="topLeft" title={t('ttTradeInformation')} mouseEnterDelay={1}>
                        <div className='exs-title-balance exs-title-trade-information exc-set-font'>{t('tradeInformation')}</div>
                      </Tooltip>
                      <Tooltip placement="topLeft" title={t('ttAll')} mouseEnterDelay={1}>
                        <div onClick={() => setIsFavorite(false)} className={'exs-all-coin exc-set-font ' + (isFavorite ? 'exs-color-hidden' : 'exs-color-gray')}>{t('all')}</div>
                      </Tooltip>
                      <Tooltip placement="topLeft" title={t('ttFavoriteList')} mouseEnterDelay={1}>
                        <div onClick={() => setIsFavorite(true)} className={'exs-favorite-coin exc-set-font ' + (isFavorite ? 'exs-color-gray' : 'exs-color-hidden')}>{t('favorite')}</div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className='exs-list-trade-info'>
                    {isFavorite
                      ? !isLoadingOrderFavorite
                        ? <InfiniteScroll
                          className="exs-list-coin"
                          initialLoad={false}
                          pageStart={0}
                          loadMore={handleInfiniteOnLoadTokenFavorite}
                          hasMore={hasMoreTokenFavorite}
                          useWindow={false}>
                          {tradeHistoryFavorite && tradeHistoryFavorite.total > 0
                            ? <List
                              className="exs-list-coin"
                              dataSource={tradeHistoryFavorite.data}
                              renderItem={(item, idx) => this.renderTradeHistoryAllToken(item, idx, t, lightingTradeHistory, isFavorite, dexFavorite)} />
                            : <div className='exs-list-empty-text'>{t('NoData')}</div>
                          }
                          {isLoadMoreTokenFavorite && 
                              <div className='exs-load-more fv-height50'><Spin/></div>
                          }
                        </InfiniteScroll>
                        : <div className='exs-history-loading'><Spin/></div>
                      : !isLoadingOrder
                        ? <InfiniteScroll
                          className="exs-list-coin"
                          initialLoad={false}
                          pageStart={0}
                          loadMore={handleInfiniteOnLoadAllToken}
                          hasMore={hasMoreAllToken}
                          useWindow={false}>
                          {tradeHistory.length > 0
                            ? <List
                              className="exs-list-coin"
                              dataSource={tradeHistory}
                              renderItem={(item, idx) => this.renderTradeHistoryAllToken(item, idx, t, lightingTradeHistory, isFavorite, dexFavorite)} />
                            : <div className='exs-list-empty-text'>{t('NoData')}</div>
                          }
                          {isLoadMoreAllToken && 
                            <div className='exs-load-more fv-height50'><Spin/></div>
                          }
                        </InfiniteScroll>
                        : <div className='exs-history-loading'><Spin/></div>
                    }
                  </div>
                </div>
                <div className="centerContent">
                  <div className="selfCenter standardWidth">
                    <TwitterTimelineEmbed
                      theme="dark"
                      sourceType="profile"
                      screenName={this.props.settingUrls.twitterUrl ? this.props.settingUrls.twitterUrl : 'HBWallet_ETH'}
                      noHeader
                      noFooter
                      noScrollbar
                      options={{height: 447}}
                    />
                  </div>
                </div>
                {/* <div className="recent-news">
                  <div className="recent-title">{t('mostRecentNews')}</div>
                  <div className="recent-body">
                    {isLoadingRecentNews
                      ? <div className='exs-history-loading'>
                        <Spin/>
                      </div>
                      : mostRecentNews.length > 0
                        ? <List
                          className="news-list"
                          dataSource={mostRecentNews}
                          renderItem={(item) => this.renderRecentNews(item, shell)} />
                        : <div className='exs-list-empty-text'>{t('NoData')}</div>}
                  </div>
                </div>  */}
              </div>
            </div>
          </div>
    )
  }
  renderRecentNews (item, shell) {
    return (
      <div className="news-item">
        <div className="news-title" onClick={() => openBrowserInNewTab(item.url)}>{item.post_title}</div>
        <div className="news-img">
          <div className="news-img-view" style={{backgroundImage: "url('" + item.meta_data.post_featured_image.toString() + "')"}}></div>
        </div>
      </div>
    )
  }
  renderMarketCoin (item, index) {
    return (
      <div className='exs-top-balance-value' key={index}>
        {item.symbol} {this.currency}{<FormatFiat balance={item.priceCurrency} />} {Number(item.percent_change_1h) > 0 ? <img className="icon-trend" src={Images.ArrowUpSmallNew} /> : <img className="icon-trend" src={Images.ArrowDownSmallNew} />}
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
  renderUsdPriceFormat (price) {
    const { firstNumber, secondNumber } = formatFiatDisplay(price)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderTradeHistoryAllToken (item, index, t, lightingTradeHistory, isFavorite, dexFavorite) {
    const colorLightning = 
      this.state.lightingOrderBookFilling
        ? 'exc-animation-first-white '
        : item.statusCode === ORDER_STATUS.OPEN
          ? item.isSell ? 'exc-animation-first-red ' : 'exc-animation-first-green '
          : 'exc-animation-first-white '
    return (
      <div key={index} className={'exs-list-trade exc-animation ' + (lightingTradeHistory ? colorLightning : '') + (item.statusCode === ORDER_STATUS.OPEN ? 'exs-color-gray' : (item.statusCode === ORDER_STATUS.FILLED ? (item.isSell ? 'exs-color-green' : 'exs-color-red') : ''))}>
        <div className='exs-name-trade'>
          <Tooltip placement="topLeft" title={item.tokenSymbol} mouseEnterDelay={1}>
            {item.tokenSymbol.length > 4 ? item.tokenSymbol.substr(0, 4) + '...' : item.tokenSymbol}
          </Tooltip>
        </div>
        <div className='exs-right-trade'>
          <div className='exs-name-status'>
            {item.statusCode === ORDER_STATUS.FILLED ? (item.isSell ? t('takeSell') : t('takeBuy'))
              : (item.statusCode === ORDER_STATUS.OPEN ? (item.isSell ? t('makeSell') : t('makeBuy')) : t(ORDER_STATE[item.statusCode]))
            }
          </div>
          <div className='exs-name-number'>
            { this.renderAmountFormat(item.statusCode === ORDER_STATUS.OPEN ? item.amount : item.balance, item.isSell ? item.metadata.makerToken.decimals : item.metadata.takerToken.decimals) }
          </div>
        </div>
      </div>
    )
  }
  renderFavoriteList (item, key, mainAddress, etherPrice, arrTokenData, isActiveUSD, clickOnCell, lightingOrderBookBuyId, lightingOrderBookSellId, currency, t) {
    return (
      <div className="exf-favoriteInfo" onClick={() => clickOnCell(item)}>
        <div className="exf-favoriteInfo-name">{item.token.name}</div>
        <div className="exf-favoriteInfo-currentPrice">
          <div>{t('currentPrice')}</div>
          <div className={Number(item.lastPriceBalanceGWei) === 0 ? 'exs-color-gray' : (Number(item.lastPriceBalanceGWei) > 0 ? 'exs-color-green' : 'exs-color-red')}>
            { isActiveUSD
              ? <div className="exf-favoriteInfo-currentPrice-value">{currency}<FormatFiat balance={Math.abs(item.lastPriceBalanceGWei * etherPrice.price)}/></div>
              : <div><FormatPrice price={Math.abs(item.lastPriceBalanceGWei)}/> WETH</div>
            }
          </div>
        </div>
        <div className="exf-favoriteInfo-change24h">
          <div>{t('24change')}</div>
          <div className={Number(item.day.change) === 0 ? 'exs-color-gray' : (Number(item.day.change) > 0 ? 'exs-color-green' : 'exs-color-red')}>{formatNumber(item.day.change, 2)}%</div>
        </div>
        <div className="exf-favoriteInfo-transaction">
          <div>{t('24hTransactions')}</div>
          <div>{formatNumber(item.day.noOfTx, 0)}</div>
        </div>
        <div className="exf-favoriteInfo-volume">
          <div>{t('24hVolume')}</div>
          <div>
            { isActiveUSD
              ? <div className="exf-favoriteInfo-currentPrice-value">{currency}<FormatFiat balance={item.volume24hBalanceGWei * etherPrice.price} /></div>
              : <div><FormatBalance balance={item.volume24hBalanceGWei} decimals={2}/> WETH</div>
            }
          </div>
        </div>
        <div className="exf-wrap-order">
          <div className="exf-order-title">
            <div className='exs-column35 exs-text-left'>{t('price')}</div>
            <div className='exs-column65 exs-text-right'>{t('amount01')}</div>
          </div>
          <div className="exf-takeSell" id='exf-takeSell-id' ref={this.setRef}>
            {(item.orderBookSell && item.orderBookSell.length === 0
              ? <div className='exs-list-empty-text'>{t('NoData')}</div>
              : <List
                className="exs-list-order-book exs-list-coin"
                dataSource={item.orderBookSell}
                renderItem={(i, index) => this.renderOrderBookSell(i, index, mainAddress, etherPrice, isActiveUSD, item.largestAmountOrder, lightingOrderBookBuyId)} />)
            }
          </div>
          <div className="exf-order-spread">
            <Tooltip placement="topLeft" title={t('ttSpread')} mouseEnterDelay={1}>
              <div className='exf-order-spreadNumber'>
                {Number(item.spread) > 0 ? (isActiveUSD ? <FormatFiat balance={item.spread * etherPrice.price} /> : <FormatPrice price={item.spread} />) : '---'}
              </div>
            </Tooltip>
            <Tooltip placement="topLeft" title={t('ttSpread')} mouseEnterDelay={1}>
              <div className='exs-text-right exf-order-spreadName'>{t('realtime')} {t('spread')}</div>
            </Tooltip>
          </div>
          <div className="exf-takeBuy">
            {(item.orderBookBuy && item.orderBookBuy.length === 0
              ? <div className='exs-list-empty-text'>{t('NoData')}</div>
              : <List
                className="exs-list-order-book exs-list-coin"
                dataSource={item.orderBookBuy}
                renderItem={(i, index) => this.renderOrderBookBuy(i, index, mainAddress, etherPrice, isActiveUSD, item.largestAmountOrder, lightingOrderBookSellId)} />)
            }
          </div>
        </div>
      </div>
    )
  }
  renderOrderBookSell (item, index, mainAddress, etherPrice, isActiveUSD, largestAmountOrder, lightingOrderBookSellId) {
    const totalBalance = sumValueByKey(item, 'balance')
    const colorLightning = 
      this.state.lightingOrderBookFilling
        ? 'exc-animation-white-lightning'
        : 'exc-animation-red-lightning'
    return (
      <div key={index} className={'exf-takeSell-info exs-orderBook-sell ' + (item.findIndex(e => e.signedOrder.makerAddress.toLowerCase() === mainAddress) !== -1 ? ' exs-myorder-row ' : '') + (item.findIndex(e => e._id === lightingOrderBookSellId) !== -1 ? colorLightning : '')}>
        <div className='exs-order-volume' style={{width: ((totalBalance / largestAmountOrder) * 95).toString() + '%'}}></div>
        <div>
          { isActiveUSD
            ? this.renderUsdPriceFormat(item[0].price * etherPrice.price, 4)
            : this.renderPriceFormat(item[0].price, 8)
          }
        </div>
        <div className='exs-text-right'>
          { this.renderAmountFormat(totalBalance, item[0].metadata.makerToken.decimals) }
        </div>
      </div>
    )
  }
  renderOrderBookBuy (item, index, mainAddress, etherPrice, isActiveUSD, largestAmountOrder, lightingOrderBookBuyId) {
    const totalBalance = sumValueByKey(item, 'balance')
    const colorLightning = 
      this.state.lightingOrderBookFilling
        ? 'exc-animation-white-lightning'
        : 'exc-animation-green-lightning'
    return (
      <div key={index} className={'exf-takeBuy-info exs-orderBook-buy ' + (item.findIndex(e => e.signedOrder.makerAddress.toLowerCase() === mainAddress) !== -1 ? ' exs-myorder-row ' : '') + (item.findIndex(e => e._id === lightingOrderBookBuyId) !== -1 ? colorLightning : '')}>
        <div className='exs-order-volume' style={{width: ((totalBalance / largestAmountOrder) * 95).toString() + '%'}}></div>
        <div>
          { isActiveUSD
            ? this.renderUsdPriceFormat(item[0].price * etherPrice.price, 4)
            : this.renderPriceFormat(item[0].price, 8)
          }
        </div>
        <div className='exs-text-right'>
          { this.renderAmountFormat(totalBalance, item[0].metadata.takerToken.decimals) }
        </div>
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
}
