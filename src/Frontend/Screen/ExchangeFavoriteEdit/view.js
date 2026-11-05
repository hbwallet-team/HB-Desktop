import React from 'react'
import './styles.css'
import { List } from 'antd'
import { formatPriceNumber, formatNumberLeftZero, formatFiatDisplay } from 'Utils/globalFunction'
import Images from 'Assets/Image'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Container from './Components/Container'
import { LIMIT_PRICE_TICKER } from 'Utils/globalConstants'
import { Spin } from 'Frontend/Components/HBLoader'
const { ipcRenderer } = window.require('electron')

class ExchangeFavoriteEdit extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      defaultPageSize: 8,
      editFavoriteList: null,
      editFavoriteListPerPage: null,
      countPage: 0,
      loadingEditFavoriteList: true
    }
    props.funcDefautlThis(this)
  }
  componentDidMount () {
    this.props.loadInitData()
    // listening trigger from main window
    ipcRenderer.on('switched-account', this.props.triggerSwitchedAccount)
  }
  onChange = page => {
    console.log(page)
    this.setState({
      currentPage: page
    })
  }
  setRef = ref => {
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
    const {
      backFromFavoriteEdit, dexAnnounce, arrListCoin,
      t, handleChangeFavorite, setChangeEditFavorite, localeData
    } = this.props
    const { editFavoriteList, defaultPageSize, countPage, loadingEditFavoriteList } = this.state
    let lengthAnnounce =
      dexAnnounce.message !== undefined
        ? dexAnnounce.message.toString().length
        : 0
    let countCycle =
      dexAnnounce.message !== undefined
        ? 10000 / dexAnnounce.message.toString().length
        : 0
    let styles = {
      animationTime1: {
        fontFamily: 'MeiryUI-01',
        animationName: 'marquee',
        animationDuration:
          50 + (lengthAnnounce / 3.8) * Math.trunc(countCycle) + 's',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite'
      }
    }
    return (
      <div className={'exf-contain ' + (localeData === 'jp' || localeData === 'cn' ? 'locale-jp-cn' : '') + (localeData === 'vn' ? ' locale-vn' : '')}>
        <div className="exs-wrap-scroll-txt">
          <div className="exs-scroll-txt">
            <div className="exs-wrap-marquee">
              <div className="marquee">
                <span style={styles.animationTime1}>
                  {dexAnnounce.message !== undefined
                    ? dexAnnounce.message
                      .toString()
                      .repeat(Math.trunc(countCycle))
                    : ''}
                </span>
              </div>
            </div>
            {arrListCoin.length > 0 ? (
              <List
                className="exs-top-balance exs-left"
                dataSource={arrListCoin.slice(0, LIMIT_PRICE_TICKER - 1)}
                renderItem={item => this.renderMarketCoin(item)}
              />
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="exf-backAndPaging">
          <button
            className="exs-btn-Back"
            onClick={backFromFavoriteEdit}
          >
            <img className="img-back" alt="imgBack" src={Images.tabNaviBack} />
            {t('back')}
          </button>
        </div>
        <div className="exfd-full-side">
          <div className="exfd-title-EditFavorite">{t('editFavoriteTokenList')}</div>
          <div className="exfd-table">
            <div className="exfd-favoriteList">
              {loadingEditFavoriteList
                ? <div className='exs-history-loading'><Spin/></div>
                : editFavoriteList && editFavoriteList.length
                  ? this.renderPageOption(editFavoriteList, countPage, defaultPageSize, handleChangeFavorite, setChangeEditFavorite, t)
                  : <div className="exfd-favoriteNoData">{t('NoData')}</div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
  renderPageOption (list, countPage, defaultPageSize, handleChangeFavorite, setChangeEditFavorite, t) {
    let html = []
    for (let i = 1; i <= countPage; i++) {
      let items = list.slice((defaultPageSize * i - defaultPageSize), (defaultPageSize * i))
      html.push(<div key={i} className='exfd-favoriteItem'>
        <div className="exfd-titleItem">{t('page')} {i}</div>
        <Container id={i} list={items} handleChangeFavorite={handleChangeFavorite} setChangeEditFavorite={setChangeEditFavorite}/>
      </div>)
    }
    
    return html
  }
  renderMarketCoin (item) {
    return (
      <div className='exs-top-balance-value'>
        {item.symbol} ${this.renderUsdPriceFormat(item.price_usd)} {Number(item.percent_change_1h) > 0 ? <img className="icon-trend" src={Images.ArrowUpSmallNew} /> : <img className="icon-trend" src={Images.ArrowDownSmallNew} />}
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
  renderPriceFormat (price, decimals) {
    const firstNumber = formatPriceNumber(price, decimals)
      .toString()
      .split('.')[0]
    const secondNumber = formatPriceNumber(price, decimals)
      .toString()
      .split('.')[1]
    return (
      <div style={{ display: 'inline-block' }}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">
          {secondNumber ? '.' + secondNumber : ''}
        </span>
      </div>
    )
  }
  renderAmountFormat (amount, decimals) {
    const firstNumber = formatNumberLeftZero(amount, decimals)
      .toString()
      .split('.')[0]
    const secondNumber = formatNumberLeftZero(amount, decimals)
      .toString()
      .split('.')[1]
    return (
      <div style={{ display: 'inline-block' }}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">
          {secondNumber ? '.' + secondNumber : ''}
        </span>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(ExchangeFavoriteEdit)
