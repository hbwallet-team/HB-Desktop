import React from 'react'
import './styles.css'
import { HBInput } from 'Frontend/Components/HBInput'
import { List, Select } from 'antd'
import Images from 'Assets/Image'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import PopupWrapAmount from '../ExchangeScreen/Components/PopupWrapAmount'
import PopupGas from '../ExchangeScreen/Components/PopupGas'
import PopupTokenListingRequest from './Components/PopupTokenListingRequest'
import ExchangeScreen from '../ExchangeScreen'
import { formatNumber, openBrowserInNewTab, filterMainAccount, isEmpty } from 'Utils/globalFunction'
import { OBSERVER_KEY, HBCURRENCY_SYMBOL, HBCURRENCY, LIMIT_PRICE_TICKER, WETH_TOKEN } from 'Utils/globalConstants'
import HBChart from '../../Components/HBChart'
import { Wave } from 'better-react-spinkit'
import { Spin } from 'Frontend/Components/HBLoader'
import Observer from 'Utils/HBObserver'
import {setChosenLanguage} from 'Utils/0xError'
import PopupTour from '../ExchangeScreen/Components/PopupTour'
import PopupPolyci from './Components/PopupPolyci'
import PopupPolyciOne from './Components/PopupPolyci/1'
import PopupPolyciTwo from './Components/PopupPolyci/2'
import ExchangeFavorite from '../ExchangeFavorite'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import FormatPrice from 'Frontend/Components/FormatPrice'
import Settings from 'Backend/settings'

const SORT_PERIOD = ['et24H', 'et1W', 'et1M', 'etALL']
const SORT_TYPE = {
  TRANSACTION: 'transaction',
  CHANGE_HIGH: 'perChangeHigh',
  CHANGE_LOW: 'perChangeLow',
  VOLUME_HIGH: 'volumeHigh'
}
const Option = Select.Option
export default class ExchangeTop extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      strSearch: '',
      isWrap: true,
      strPPAmount: '',
      isSending: false,
      openExchangeScreen: false,
      isLoadingExchange: false,
      isMyFavoriteToken: false,
      selectedPair: {},
      sortPeriod: 'etALL',
      sortType: SORT_TYPE.TRANSACTION,
      dexTokenSearch: props.dexTokenList,
      setWidthPrice: 0,
      transactionFee: 0,
      orderJSON: {},
      gasPrice: props.gasStation,
      isLoadingToken: true,
      gasAmount: 0,
      valueInputGas: 0,
      isSendingTokenRequest: false,
      helpUrl: '',
      openExchangeFavorite: false,
      toHBWallet: false,
      HBtoFavorite: false,
      wethToken: WETH_TOKEN
    }
    Observer.on(OBSERVER_KEY.DEX_UPDATE_PRICE_CHART, props.updateDexSummary)
    Observer.on(OBSERVER_KEY.DEX_UPDATE_PRICE_CHART_1H, props.updateDexSummaryEveryHour)
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.funcDefautlThis(this)
    this.gasLimit = Settings.gas.externalFeeToken
    setChosenLanguage(this.props.localeData)
  }

  componentDidMount () {
    this.props.loadInitData()
    this.props.openPopupBeforeGoToExchange()
    this.props.loadingTokenbalance()
    this.props.fetchAnnounceMessage()
    this.props.fetchListCoin()
    this.props.fetchGasPrice()
    this.props.fetchDexConfig()
  }

  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.DEX_UPDATE_PRICE_CHART, this.props.updateDexSummary)
    Observer.removeListener(OBSERVER_KEY.DEX_UPDATE_PRICE_CHART_1H, this.props.updateDexSummaryEveryHour)
  }

  render () {
    const {strSearch, isWrap, strPPAmount, isSending, openExchangeScreen, isLoadingExchange,
      sortPeriod, sortType, dexTokenSearch, setWidthPrice, orderJSON, transactionFee, gasPrice,
      gasAmount, isMyFavoriteToken, isLoadingToken, valueInputGas, isSendingTokenRequest, helpUrl,
      openExchangeFavorite, toHBWallet, HBtoFavorite, wethToken
    } = this.state
    const {clickOnCell, onChangePPWrapAmount, arrCardData, wrapAction, openOpupWrap,
      openOpupUnwrap, pendingTx, arrTokenData, backToTop, etherPrice, arrListCoin, onChangeSearchKeyword, onChangeSortPeriod, onChangeSortType, t,
      dragVolume, dexAnnounce, dexTokenList, dexTokenSummary, localeData,
      handleFilterFavoriteToken, focusInputGasPrice, unFocusInputGasPrice,
      openPopupTokenListingRequest, handleSubmitTokenListingRequest, openPopupTour, setUserAuthentication, arrCurrencyData,
      settingUrls
    } = this.props
    const mainAccount = filterMainAccount(arrCardData)
    let lengthAnnounce = dexAnnounce.message !== undefined ? dexAnnounce.message.toString().length : 0
    let countCycle = dexAnnounce.message !== undefined ? 10000 / dexAnnounce.message.toString().length : 0
    let repeatListCoin = ''
    let coinList = arrListCoin.slice(0, LIMIT_PRICE_TICKER - 1)
    for (let i = 0; i < coinList.length; i++) {
      repeatListCoin += coinList[i].symbol + coinList[i].price_usd + 'USD' + ' '
    }
    let styles = {
      animationTime1: {
        fontFamily: 'MeiryUI-01',
        animationName: 'marquee',
        animationDuration: 50 + (lengthAnnounce / 3.8) * Math.trunc(countCycle) + 's',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite'
      }
    }
    let supportLink = 'https://www.hb-wallet.com/dex-faq'
    if (localeData === 'jp') {
      supportLink = 'https://www.hb-wallet.com/dex-faq-jp'
    } else if (localeData === 'cn') {
      supportLink = 'https://www.hb-wallet.com/dex-faq-cn'
    } else {
      supportLink = 'https://www.hb-wallet.com/dex-faq'
    }
    return (
      (this.props.location.state && this.props.location.state.changeToHB && !HBtoFavorite)
        ? <ExchangeScreen backToTop={backToTop} limitPriceTicker={LIMIT_PRICE_TICKER} handleFilterFavoriteToken={handleFilterFavoriteToken} openExchangeScreen={true} helpUrl={helpUrl}/>
        : openExchangeScreen
          ? <ExchangeScreen backToTop={backToTop} limitPriceTicker={LIMIT_PRICE_TICKER} handleFilterFavoriteToken={handleFilterFavoriteToken} openExchangeScreen={openExchangeScreen} helpUrl={helpUrl}/>
          : openExchangeFavorite
            ? <ExchangeFavorite backToTop={backToTop} limitPriceTicker={LIMIT_PRICE_TICKER} handleFilterFavoriteToken={handleFilterFavoriteToken} openExchangeScreen={openExchangeScreen} clickOnCell={clickOnCell} helpUrl={helpUrl}/>
            : <div className={'exc-container ' + (localeData === 'jp' || localeData === 'cn' ? 'locale-jp-cn' : '') + (localeData === 'vn' ? ' locale-vn' : '')}>
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
                      renderItem={(item) => this.renderMarketCoin(item)} />
                    : ''}
                </div>
              </div>
              <div className='exc-top-help'>
                <div className='exc-help panner'>
                  <div className='exc-hbdex-title'>HB DEX</div>
                  <div className='exc-help-text-left'>
                    <div className='exc-help-text' onClick={() => openPopupTour()}>{t('tour')}</div>
                    <div className='exc-help-text' onClick={() => openBrowserInNewTab(supportLink)}>{t('support')}</div>
                  </div>
                  <div className='exc-help-text-right'>
                    <div className='exc-help-text' onClick={() => openBrowserInNewTab(helpUrl)}>{t('help')}</div>
                    <div className='exc-help-text' onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/api')}>API</div>
                  </div>
                  <div className='exc-help-text exc-tokenRequest' style={{position: 'relative'}} onClick={() => openPopupTokenListingRequest()}>
                    {t('tokenListingRequest')}
                    {isSendingTokenRequest ? <div style={{position: 'absolute', right: '-9px', top: '13px'}}>
                      <Spin size={15} color={'white'}/>
                    </div> : ''}
                  </div>
                </div>
                <div className='exc-main-account panner'>
                  <div className='exc-main-account-label'>{mainAccount.cardName === 'Main Account' ? t('mainAccount') : mainAccount.cardName}:</div>
                  <div className='exc-wrap-group'>
                    <div className='exc-wrap-txt'>
                      {isLoadingToken
                        ? <div className='exs-token-loading'><Wave size={20} color='white' /></div>
                        : <div>
                          <FormatBalance balance={mainAccount.balance} />
                          <span className="exs-wrap-symbol">ETH</span>
                        </div>
                      }
                    </div>
                    <button onClick={() => isSending ? {} : openOpupWrap()} className = {'exc-wrap-btn ' + (localeData === 'jp' ? 'exs-fontSize10' : '')}> {t('wrapETH')}</button>
                    {(isWrap && isSending) && <div style={{display: 'flex', position: 'relative', right: '-12px'}}>
                      <Spin size={15} color={'white'} />
                    </div>
                    }
                  </div>
                  <div className='exc-wrap-group'>
                    <div className='exc-wrap-txt'>
                      {isLoadingToken
                        ? <div className='exs-token-loading'><Wave size={20} color='white' /></div>
                        : <div>
                          <FormatBalance balance={wethToken.balance} />
                          <span className="exs-wrap-symbol">WETH</span>
                        </div>
                      }
                    </div>
                    <button onClick={() => isSending ? {} : openOpupUnwrap()} className = {'exc-unwrap-btn ' + (localeData === 'jp' ? 'exs-fontSize10' : '')}> {t('unwrapETH')}</button>
                    {(!isWrap && isSending) && <div style={{display: 'flex', position: 'relative', right: '-10px'}}>
                      <Spin size={15} color={'white'}/>
                    </div>
                    }
                  </div>
                </div>
              </div>
              <div className='exc-center'>
                <div className = 'exc-five-cell'>
                  <div className = 'exc-cell panner'>
                    <div className = 'exc-title-cell'>{t('registeredToken')}</div>
                    <div className = 'exc-balance-cell exc-registered'>
                      {isLoadingExchange
                        ? <div className='exs-token-loading'><Wave size={30} color='white' /></div>
                        : <div>{dexTokenList.length}</div>
                      }
                    </div>
                  </div>
                  <div className = 'exc-cell panner'>
                    <div className = 'exc-title-cell'>{t('24hVolume')}</div>
                    <div className = 'exc-balance-cell'>
                      {isLoadingExchange
                        ? <div className='exs-token-loading'><Wave size={30} color='white' /></div>
                        : <div className = 'exc-balance-cell'>
                          <div className="exc-top-balance-cell">
                            <FormatBalance balance={dexTokenSummary.volume24h} decimals={2}/>
                            <span className="exs-balance-symbol">WETH</span>
                          </div>
                          <div className = 'exc-sub-balance-cell'>
                            <span className="exs-balance-symbol">{this.currency}</span>
                            {formatNumber(dexTokenSummary.volume24h * etherPrice.price, 0)}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                  <div className = 'exc-cell panner'>
                    <div className = 'exc-title-cell'>{t('totalVolume')}</div>
                    <div className = 'exc-balance-cell'>
                      {isLoadingExchange
                        ? <div className='exs-token-loading'><Wave size={30} color='white' /></div>
                        : <div className = 'exc-balance-cell'>
                          <div className="exc-top-balance-cell">
                            <FormatBalance balance={dexTokenSummary.totalVolume} decimals={2}/>
                            <span className="exs-balance-symbol">WETH</span>
                          </div>
                          <div className = 'exc-sub-balance-cell'>
                            <span className="exs-balance-symbol">{this.currency}</span>
                            {formatNumber(dexTokenSummary.totalVolume * etherPrice.price, 0)}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                  <div className = 'exc-cell panner'>
                    <div className = 'exc-title-cell'>{t('24hTransactions')}</div>
                    <div className = 'exc-balance-cell'>
                      {isLoadingExchange
                        ? <div className='exs-token-loading'><Wave size={30} color='white' /></div>
                        : <div>
                          {formatNumber(dexTokenSummary.transaction24h, 0)}
                        </div>
                      }
                    </div>
                  </div>
                  <div className = 'exc-cell panner'>
                    <div className = 'exc-title-cell'>{t('totalTransactions')}</div>
                    <div className = 'exc-balance-cell'>
                      {isLoadingExchange
                        ? <div className='exs-token-loading'><Wave size={30} color='white' /></div>
                        : <div>
                          {formatNumber(dexTokenSummary.totalTransaction, 0)}
                        </div>
                      }
                    </div>
                  </div>
                </div>
                <div className="exc-wrap-TokenList">
                  <div className= 'exc-search-token'>
                    <div className='exc-search-first'>
                      <Select className="exc-sort-by" defaultValue={t(sortPeriod)} dropdownClassName={'exc-select-options'} >
                        {this.renderOptionSort(sortPeriod, onChangeSortPeriod, t)}
                      </Select>
                      <div className={'exc-search-label' + (sortType === SORT_TYPE.TRANSACTION ? ' exs-active-label' : '')} onClick={() => onChangeSortType(SORT_TYPE.TRANSACTION)}>{t('transaction')}</div>
                      <div className={'exc-search-label' + (sortType === SORT_TYPE.CHANGE_HIGH ? ' exs-active-label' : '')} onClick={() => onChangeSortType(SORT_TYPE.CHANGE_HIGH)}>{t('perChangeHigh')}</div>
                      <div className={'exc-search-label' + (sortType === SORT_TYPE.CHANGE_LOW ? ' exs-active-label' : '')} onClick={() => onChangeSortType(SORT_TYPE.CHANGE_LOW)}>{t('perChangeLow')}</div>
                      <div className={'exc-search-label' + (sortType === SORT_TYPE.VOLUME_HIGH ? ' exs-active-label' : '')} onClick={() => onChangeSortType(SORT_TYPE.VOLUME_HIGH)}>{t('volumeHigh')}</div>
                    </div>
                    <div className='exc-search-second'>
                      <div className={'exc-search-label exc-favorite-label' + (isMyFavoriteToken ? ' exc-my-favorite' : '')} onClick={() => handleFilterFavoriteToken()}>
                        <img className="icon-whiteHeart" src={Images.whiteHeart} />{t('favorite')}
                      </div>
                      <div style={{width: '346px', paddingLeft: '10px', paddingTop: '6px'}}>
                        <HBInput
                          iconLeft={Images.search1}
                          onClickIcon={() => {}}
                          isSpacing={true}
                          placeholder={t('extAddressNameSymbol')}
                          value={strSearch}
                          textSymbol={'exs-textSymbol'}
                          className='exc-input-search'
                          onChange={(value) => onChangeSearchKeyword(value)}
                          onFocus={() => {}}
                          onBlur={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='exc-summary'>
                    <div className='exc-summary-header'>
                      <div className='exs-first-column exc-column-1'>#</div>
                      <div className='exc-column-2-6 exc-text-upCase'>{t('TokenName')}</div>
                      <div className='exc-column-Pair exc-text-upCase'>{t('Pair')}</div>
                      <div className='exc-column-14per exc-text-upCase exc-text-right'>{t('lastPrice')}</div>
                      <div className='exc-column-14per exc-text-upCase exc-text-right'>{t('volume')}</div>
                      <div className='exc-column-14per exc-text-upCase exc-text-right'>{t('totalVolume')}</div>
                      <div className='exc-column-10per exc-al-right exc-text-upCase'>% {t('change01')}</div>
                      <div className='exc-column-13per exc-al-right exc-text-upCase'>{t('transactions')}</div>
                      <div className='exc-column-chart exc-text-upCase'>{t('priceGraph01')}</div>
                    </div>
                    {!isLoadingExchange
                      ? <List
                        id="HBScrollBar"
                        className="exst-list-balance exs-list-coin"
                        dataSource={dexTokenSearch}
                        renderItem={(item, index) => this.renderCell(item, index, arrTokenData, etherPrice, clickOnCell, t, this.currency)} />
                      : <div className='exs-token-loading'><Spin/></div>
                    }
                  </div>
                </div>
              </div>
              <Modal ref="md_exs_token_listing_request">
                <PopupTokenListingRequest
                  that={this}
                  t={t}
                  handleSubmit={handleSubmitTokenListingRequest}
                />
              </Modal>
              <Modal ref="md_exs_wrap_amount">
                <PopupWrapAmount
                  getBalance={isWrap ? mainAccount.balance : wethToken.balance}
                  isWrap={isWrap}
                  strAmount={strPPAmount}
                  onChangePPWrapAmount={onChangePPWrapAmount}
                  mainAccount={mainAccount}
                  wethToken={wethToken}
                  popupGas={this.refs.md_exs_gas}
                  dragVolume={dragVolume}
                  that={this}
                  t={t}
                  etherPrice={etherPrice}
                  gasPrice={gasPrice}
                  gasLimit={this.gasLimit}
                  localeData={localeData}
                  currency={this.currency}
                  currentAccount={mainAccount.cardName === 'Main Account' ? t('mainAccount') : mainAccount.cardName}
                />
              </Modal>
              <Modal ref="md_exs_gas">
                <PopupGas
                  orderJSON={orderJSON}
                  onChangePPWrapAmount={onChangePPWrapAmount}
                  mainAccount={mainAccount}
                  wethToken={wethToken}
                  dragVolume={dragVolume}
                  setWidthPrice={setWidthPrice}
                  gasLimit={this.gasLimit}
                  transactionFee={transactionFee}
                  etherPrice={etherPrice.price}
                  that={this}
                  t={t}
                  strAmount={strPPAmount}
                  isWrap={isWrap}
                  wrapAction={wrapAction}
                  popupGas={this.refs.md_exs_gas}
                  clickPopUp={'wrapOption'}
                  gasAmount={gasAmount}
                  gasPrice={gasPrice}
                  focusInputGasPrice={focusInputGasPrice}
                  unFocusInputGasPrice={unFocusInputGasPrice}
                  valueInputGas={valueInputGas}
                  balanceWETH={wethToken.balance}
                  balanceETH={mainAccount.balance}
                  localeData={this.props.localeData}
                  currency={this.currency}
                />
              </Modal>
              <Modal ref="md_exs_tour">
                <PopupTour THIS={this}/>
              </Modal>
              <Modal ref="md_exs_polyci" closeOnClick={false}>
                <PopupPolyci
                  parent={this}
                  t={t}
                />
              </Modal>
              <Modal ref="md_exs_polyci_one" closeOnClick={false}>
                <PopupPolyciOne
                  parent={this}
                  t={t}
                />
              </Modal>
              <Modal ref="md_exs_polyci_two" closeOnClick={false}>
                <PopupPolyciTwo
                  parent={this}
                  t={t}
                  setUserAuthentication={setUserAuthentication}
                />
              </Modal>
              <Modal 
                ref="md_isLockedUser" 
                className='md-lu-wrap' 
                closeOnClick={false}
                backdropStyle={{left: '104px', zIndex: '940'}}
                modalStyle={{left: 'calc(50% + 52px)'}}
              >
                <div className='lu-container'>
                  <img src={Images.ic_locked_user} />
                  <div className='lu-content'>You are locked</div>
                </div>
              </Modal>
            </div>
    )
  }

  renderCell (item, index, arrTokenData, etherPrice, clickOnCell, t, currency) {
    return (
      <div className={'exc-cell-balance-container btnOpacity exs-cursor-pointer'} onClick={() => clickOnCell(item)}>
        <div className='exs-first-column exc-column-1 exs-color-gray'>{index + 1}</div>
        <div className='exc-column-2-6'>{item.token.name}</div>
        <div className='exc-column-Pair'>{item.token.symbol}/WETH</div>
        <div className={'exc-column-14per exc-text-right ' + (Number(item.lastPriceBalanceGWei) === 0 ? 'exs-color-gray' : (Number(item.lastPriceBalanceGWei) > 0 ? 'exs-color-green' : 'exs-color-red'))}>
          <div className='exc-last-price'>
            <FormatPrice price={Math.abs(item.lastPriceBalanceGWei)} />
            <span className='exc-width-38'> WETH</span>
          </div>
          <div className='exc-usd-price'>
            {currency}<FormatFiat balance={Math.abs(item.lastPriceBalanceGWei) * etherPrice.price} />
          </div>
        </div>
        <div className='exc-column-14per exc-text-right exs-color-yellow'>
          <div className='exc-usd-price'>
            <FormatBalance balance={item.volumeBalanceGWei} decimals={2} />
            <span className='exc-width-38'> WETH</span></div>
          <div className='exc-usd-price'>
            {currency}{formatNumber(item.volumeBalanceGWei * etherPrice.price, 0)}
          </div>
        </div>
        <div className='exc-column-14per exc-text-right exs-color-yellow'>
          <div className='exc-usd-price'>
            <FormatBalance balance={item.volumeTotalBalanceGWei} decimals={2} />
            <span className='exc-width-38'> WETH</span></div>
          <div className='exc-usd-price'>
            {currency}{formatNumber(item.volumeTotalBalanceGWei * etherPrice.price, 0)}
          </div>
        </div>
        <div className={'exc-column-10per exc-al-right ' + (Number(item.change) === 0 ? 'exs-color-gray' : (Number(item.change) > 0 ? 'exs-color-green' : 'exs-color-red'))}>
          { (Number(item.change) > 0 ? '+' : '') + formatNumber(item.change, 2) } %
        </div>
        <div className='exc-column-13per exc-al-right'>{formatNumber(item.noOfTx, 0)}</div>
        <div className='exc-column-chart exs-color-gray'>
          { !isEmpty(item.priceChart) && item.priceChart.length > 0
            ? <div className="exc-container-chart exc-widthCustom-chart"><HBChart datas={item.priceChart} dataKey='price' widthCustom={210} heightCustom={50} symbol='WETH' decimal={8}/></div>
            : <div className="e-loading-chart exc-center-chart">{t('ChartEmpty')}</div>
          }
        </div>
      </div>
    )
  }
  renderOptionSort (sortPeriod, onChangeSortPeriod, t) {
    return (
      SORT_PERIOD.map((item) => {
        return (<Option className={item === parseInt(sortPeriod) ? 'exc-sort-menu-active' : ''} onClick={onChangeSortPeriod} key={item}>{t(item)}</Option>)
      })
    )
  }
  renderMarketCoin (item) {
    return (
      <div className='exs-top-balance-value'>
        {item.symbol + ' '} ${<FormatFiat balance={item.price_usd} />} {Number(item.percent_change_1h) > 0 ? <img className="icon-trend" src={Images.ArrowUpSmallNew} /> : <img className="icon-trend" src={Images.ArrowDownSmallNew} />}
      </div>
    )
  }
}
