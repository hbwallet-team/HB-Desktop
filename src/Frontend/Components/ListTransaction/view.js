import React from 'react'
import './styles.css'
import { List, Tooltip } from 'antd'
import InfiniteScroll from 'react-infinite-scroller'
import { Spin } from 'Frontend/Components/HBLoader'
import { DotDotDotLoader } from 'react-dotdotdotloader'
import { HBCRYPTO } from 'Utils/globalConstants'
import Images from 'Assets/Image'
import moment from 'moment'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import HBSpeedUpTxs from 'Frontend/Components/HBSpeedUpTxs'
import Modal from 'Frontend/Components/HBModal/FadeModal'

export default class ListTransaction extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selectedTx: null 
    }
    props.defaultThis(this)
  }
  componentDidMount () {
    this.props.loadingInitial()
  }
  render () {
    const { arrTrackingSending, isLoading, hasMore, historyTxs, handleInfiniteOnLoad, t } = this.props
    return (
      <React.Fragment>
        <div className="list-container">
          <div className="fake-list">
            {(arrTrackingSending && arrTrackingSending.length > 0) && <List
              dataSource={arrTrackingSending}
              renderItem={this.renderTrackingSendTxs}
            />}
          </div>
          <div className={'list-view-txt ' + ((arrTrackingSending && arrTrackingSending.length > 0) ? 'has-fake-list' : '')} id='HBScrollBar'>
            { isLoading
              ? <div className="e-txt-loading">
                <Spin/>
              </div>
              : historyTxs && historyTxs.length > 0
                ? <InfiniteScroll
                  initialLoad={false}
                  pageStart={0}
                  loadMore={handleInfiniteOnLoad}
                  hasMore={hasMore}
                  useWindow={false}>
                  <List
                    dataSource={historyTxs}
                    renderItem={(item, index) => this.renderHistoryTxs(item, index)}
                  />
                </InfiniteScroll>
                : <div className="list-txt-loading">
                  <div className="list-view-txtCenter">{t('YouHaventReceived')}</div>
                </div>
            }
          </div>
        </div>
        {/* Modal Speed up txs */}
        <Modal ref="modalSpeedUpTxs">
          <HBSpeedUpTxs 
            selectedTx={this.state.selectedTx} 
            onCloseModal={this.props.onCloseModalSpeedUpTxs}
          />
        </Modal>
      </React.Fragment>
    )
  }
  renderTrackingSendTxs = (item) => {
    const { currency, tokenPrice, tokenSelected, t, clickOnSpeedUp } = this.props
    return (
      <div className="cell-txt-container">
        <div className="cell-txt-status">
          {t(`History.${item.isComplete ? 'pending' : 'issueTxs'}`)}
          <DotDotDotLoader 
            show={true}
            amount={10}
            interval={300}
            repeat={true}
          />
          {item.isComplete && <div className="cell-txt-speedUp">
            <button className="btn btn-primary" onClick={() => clickOnSpeedUp(item)}>{t('History.speedUp')}</button>
          </div>}
          {item.isComplete && <Tooltip placement="topRight" title={t('History.sentRequestToEtherNetwork')}>
            <img src={Images.orderStatus[1]} />
          </Tooltip>}
        </div>
        <div className={'cell-txt-status-txt' + (item.isComplete === null ? ' cell-color-brown' : '')}>
          {t(`History.${item.isComplete ? 'waitingHistory' : (item.isComplete === null ? 'transmissionFail' : 'txsComplete')}`)}
        </div>
        <div className="cell-txt-method-send">{item.isComplete ? t('Sent') : t('History.sending')} </div>
        <div className="cellNew-date">
          <div className="cell-txt-date">
            <div className="cell-txt-time">{moment(item.timeStamp * 1000).fromNow()}</div>
          </div>
          <div className="cell-txt-address cell-color-red">
            <span className="cell-txt-amount">-<FormatBalance balance={item.amount} decimals={tokenSelected ? tokenSelected.decimals : 8} /> {item.selectedToken ? item.selectedToken.symbol : HBCRYPTO.ETHEREUM}</span>
          </div>
        </div>
        <div className="cellNew-address">
          <div className="cell-txt-wrapTitle">
            <span className="cell-txt-addressFrom">{t('HistoryDetail.to')}</span>
            <span className="cell-txt-addressTo">{item.receiver}</span>
          </div>
          <div className="cellNew-fee">
            <span className="cell-txt-USD">{currency}<FormatFiat balance={(Number(item.selectedToken ? item.selectedToken.fiatAmount : tokenPrice) * Number(item.amount))} /></span>
          </div>
        </div>
      </div>
    )
  }
  renderHistoryTxs = (item, index) => {
    const { currency, tokenPrice, clickOnCell, isTop, isToken, tokenSelected, t } = this.props
    const generateInfoTxs = (key) => {
      let name = 'received'
      switch (key) {
      case 'sent':
        name = 'sent'
        break
      case 'token':
        name = 'tokenTxs'
        break
      case 'smartContract':
        name = 'callSmart'
        break
      case 'self':
        name = 'selfTxs'
        break
      }
      return name
    }
    let txsInfo = generateInfoTxs(item.isToken ? 'token' : (item.input && item.input !== '0x' ? 'smartContract' : item.method))
    return (
      <div 
        className="cell-txt-container" 
        id="btnScale-active" 
        onClick={() => clickOnCell(item, txsInfo)} 
        key={index}
      >
        {
          isToken
            ? null
            : <div className="cell-txt-balance">
              {
                isTop 
                  ? (item.cardName || '') 
                  : null
              }
            </div>
        }
        {txsInfo === 'sent'
          ? <span className="cell-txt-method-send">{t('Sent')} </span>
          : txsInfo === 'tokenTxs'
            ? <span className="cell-txt-method-token">{t('TokenTransmissionFee')} </span>
            : txsInfo === 'callSmart'
              ? <div className="cell-txt-titleCallSC">{t('callSmart')}</div>
              : txsInfo === 'selfTxs'
                ? <span className="cell-txt-method-self">{t('selfTransaction')} </span>
                : <span className="cell-txt-method-receive">{t('Received')} </span>
        }
        <div className="cellNew-date">
          <div className="cell-txt-date">
            {/* <div className="cell-txt-index">{item.id}</div> */}
            <div className="cell-txt-time">{moment(item.date * 1000).format('MM/DD h:mma')}</div>
          </div>
          <div className={'cell-txt-address ' + (!item.isToken && item.method === 'self' ? 'cell-color-green' : item.method === 'sent' ? (!item.amount ? 'cell-color-yellow' : 'cell-color-red') : 'cell-color-green')}>
            <span className="cell-txt-amount">{!item.isToken && item.method === 'self' ? '±' : (item.method === 'sent' ? '-' : '+')}<FormatBalance balance={item.amount ? item.amount : item.fee} decimals={tokenSelected ? tokenSelected.decimals : 8}/></span>
          </div>
          <div className="cellNew-special">
            {item.isError && <span className="cell-txt-failed">{t('History.failed')}</span>}
            {!item.isToken && item.method === 'self' && <span className="cell-txt-self">{t('History.self')}</span>}
          </div>
        </div>
        <div className="cellNew-address">
          <div className="cell-txt-wrapTitle">
            <span className="cell-txt-addressFrom">
              {txsInfo === 'callSmart' 
                ? item.contractName
                  ? null
                  : t('callTo')
                : !item.isToken && item.method === 'self' 
                  ? <span><span className="cell-txt-method-receive">{t('Received')}</span> {t('HistoryDetail.from')}</span>
                  : item.isToken
                    ? null
                    : item.method === 'receive' ? t('HistoryDetail.from') : t('HistoryDetail.to')}
            </span>
            <span className="cell-txt-addressTo">
              {txsInfo === 'callSmart'
                ? item.contractName
                  ? item.contractName
                  : item.toAddr
                : item.isToken
                  ? item.tokenName
                  : item.method === 'receive' ? item.sender : (item.receiver === 'Main Account' ? t('mainAccount') : item.receiver)}
            </span>
          </div>
          <div className="cellNew-fee">
            {item.method === 'sent' && item.amount
              ? <div className="cell-txt-fee">{t('fee')} <FormatBalance balance={item.fee}/> {HBCRYPTO.ETHEREUM}</div>
              : <span className="cell-txt-USD">{currency}<FormatFiat balance={Number(tokenPrice) * (item.symbol === HBCRYPTO.ETHEREUM ? Number(item.amount ? item.amount : item.fee) : Number(item.amount))}/></span>}
          </div>
        </div>
      </div>
    )
  }
}
