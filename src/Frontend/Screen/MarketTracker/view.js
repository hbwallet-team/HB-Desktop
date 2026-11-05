import React from 'react'
import './styles.css'
import { List } from 'antd'
import { Spin } from 'Frontend/Components/HBLoader'
import InfiniteScroll from 'react-infinite-scroller'
import { HBInput } from 'Frontend/Components/HBInput'
import { formatNumber, formatNumberOld } from 'Utils/globalFunction'
import { HBCURRENCY_SYMBOL, HBCURRENCY } from 'Utils/globalConstants'
import Images from 'Assets/Image'
import LazyLoad from 'react-lazy-load'

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = ({
      arrCoin: [],
      isLoading: true,
      page: 1,
      hasMore: true,
      isLoadMore: false,
      txtSearch: '',
      isSignal1h: null,
      isSignal24h: null,
      isSignal1w: null
    })
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.funcDefautlThis(this)
    props.fetchListCoin(0)
  }

  render () {
    const { isLoading,
      hasMore, txtSearch,
      isSignal1h, isSignal1w, isSignal24h
    } = this.state
    const { handleInfiniteOnLoad, onChangeSearchCoin, t,
      onSortChange1h,
      onSortChange24h,
      onSortChange1W,
      arrMarketCoin
    } = this.props
    let txtSignal1h = isSignal1h === null ? '▼▲' : isSignal1h ? '▼' : '▲'
    let txtSignal24h = isSignal24h === null ? '▼▲' : isSignal24h ? '▼' : '▲'
    let txtSignal1w = isSignal1w === null ? '▼▲' : isSignal1w ? '▼' : '▲'
    return (
      <div className="cmt-container">
        <div className="cmt-row-text-search">
          <HBInput
            iconLeft={Images.search1}
            className={'mh-input-41'}
            autoFocus={true}
            placeholder={t('mt.search')}
            value={txtSearch}
            onChange={(value) => onChangeSearchCoin(value)}/>
        </div>
        <div className='cmt-cell-header-container'>
          <div className='cmt-cell-col-1'>
            <div className='cmt-cell-index-header'>{t('Rank')}</div>
          </div>
          <div className='cmt-cell-col-3'>
            <div className='cmt-cell-header-name'>{t('Name')}</div>
          </div>
          <div className='cmt-cell-col-2a'>
            <div className='cmt-cell-price'>{t('mt.price')}</div>
          </div>
          <div className='cmt-cell-col-2'>
            <div onClick={() => onSortChange1h(isSignal1h === null ? true : !isSignal1h)} className='cmt-cell-price cmt-cursorPointer'>{t('Change(1h)')} <div className="cmt-txt-signal">{txtSignal1h}</div> </div>
          </div>
          <div className='cmt-cell-col-2'>
            <div onClick={() => onSortChange24h(isSignal24h === null ? true : !isSignal24h)} className='cmt-cell-price cmt-cursorPointer'>{t('Change(24)')} <div className="cmt-txt-signal">{txtSignal24h}</div></div>
          </div>
          <div className='cmt-cell-col-2'>
            <div onClick={() => onSortChange1W(isSignal1w === null ? true : !isSignal1w)} className='cmt-cell-price cmt-cursorPointer'>{t('Change(7d)')} <div className="cmt-txt-signal">{txtSignal1w}</div></div>
          </div>
        </div>
        {isLoading
          ? <div className='cmt-loading'><Spin/></div>
          : arrMarketCoin && arrMarketCoin.length === 0
            ? <div className="cmt-noresult">
              <img alt='img' src={Images.noInternet} className={'mdToken-imgNoInternet'} />
              <div className="txtNoResult">{t('noResult')}</div>
            </div>
            : <div className='cmt-list-container' id='ScrollBarCoin'>
              <InfiniteScroll
                className="cmt-list-coin"
                initialLoad={true}
                pageStart={0}
                loadMore={handleInfiniteOnLoad}
                hasMore={hasMore}
                useWindow={false}>
                <List
                  className="cmt-list-coin"
                  dataSource={arrMarketCoin}
                  renderItem={(item) => this.renderCellCoin(item)} />
              </InfiniteScroll>
            </div>
        }
      </div>
    )
  }

  renderCellCoin (item) {
    return (
      <List.Item className="cmt-list-item">
        <div className='cmt-cell-card'>
          <div className='cmt-cell-col-1'>
            <div className='cmt-cell-index'>{item.cmc_rank}</div>
          </div>
          <div className="cmt-cell-col-3">
            <div className='cmt-cell-img'>
              <LazyLoad height={25}>
                <img className='cmt-cell-img' alt='img' src={'https://s2.coinmarketcap.com/static/img/coins/32x32/' + item.id + '.png'}/>
              </LazyLoad>
            </div>
            <div className='cmt-cell-name-col'>
              <div className='cmt-cell-name'>
                {item.name}
                <span className="cmt-cell-symbol">({item.symbol})</span>
              </div>
            </div>
          </div>
          <div className='cmt-cell-col-2a'>
            <div className='cmt-cell-text-16'>{this.currency}{formatNumberOld(item.priceCurrency)}</div>
          </div>
          <div className='cmt-cell-col-2'>
            <div className='cmt-cell-price'><span className={Number(item.percent_change_1h) > 0 ? 'cmt-cell-price-positive' : 'cmt-cell-price-nagative'}>{item.percent_change_1h !== null ? formatNumber(item.percent_change_1h, 2) + '%' : '?'}</span> </div>
          </div>
          <div className='cmt-cell-col-2'>
            <div className='cmt-cell-price'><span className={Number(item.percent_change_24h) > 0 ? 'cmt-cell-price-positive' : 'cmt-cell-price-nagative'}>{item.percent_change_24h !== null ? formatNumber(item.percent_change_24h, 2) + '%' : '?'}</span> </div>
          </div>
          <div className='cmt-cell-col-2'>
            <div className='cmt-cell-price'><span className={Number(item.percent_change_7d) > 0 ? 'cmt-cell-price-positive' : 'cmt-cell-price-nagative'}>{item.percent_change_7d !== null ? formatNumber(item.percent_change_7d, 2) + '%' : '?'}</span> </div>
          </div>
        </div>
      </List.Item>
    )
  }
}
