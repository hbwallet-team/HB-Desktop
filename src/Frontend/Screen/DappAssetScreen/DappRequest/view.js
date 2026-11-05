import React from 'react'
import { List } from 'antd'
import { HBPopupConfirm } from 'Frontend/Components/HBPopup'
import { Spin } from 'Frontend/Components/HBLoader'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import NFTTransactionHistory from 'Frontend/Screen/DappAssetScreen/Components/NFTTransactionHistory'
import { HBCURRENCY_SYMBOL, HBCURRENCY, OBSERVER_KEY, arrCryptoCurrency, REQUEST_STATUS } from 'Utils/globalConstants'
import { formatNumberDisplay, formatFiatDisplay, convertTimestampToDateTime } from 'Utils/globalFunction'
import Observer from 'Utils/HBObserver'
import Images from 'Assets/Image'
import InfiniteScroll from 'react-infinite-scroller'
import './styles.css'
import BoxRequest from '../../DappScreen/Components/BoxRequest'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import { DotDotDotLoader } from 'react-dotdotdotloader'
import HBImage from 'Frontend/Components/HBImage'

export default class DappRequest extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isLoadingMyRequests: false,
      selectedItem: null,
      isExecuting: false,
      objSelectNFT: null,
      pageNum: 1,
      hasMore: true,
      isLoadMore: false,
      numberGameItem: 0
    }
    this.fRate = {
      ETH: props.etherPrice.price,
      TUSD: 1,
      DAI: 1
    }
    Observer.on(OBSERVER_KEY.NEW_DEX_GAME_EVENT, props.updateNewDexGameEvent)
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.defaultThis(this)
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchTrueUSDPrice()
    this.props.fetchDaiUSDPrice()
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.NEW_DEX_GAME_EVENT, this.props.updateNewDexGameEvent)
  }
  render () {
    const { onAcceptRequest, onCloseAcceptRequestModal, onDeleteRequest, onCloseDeleteRequestModal, t } = this.props
    return (
      <React.Fragment>
        <div className="dapp-my-assets">{t('Dapps.myRequests')}</div>
        <div className="dapp-right-body">
          { this.renderMyRequests() }
        </div>
        <Modal ref="md_accept_request">
          <HBPopupConfirm 
            onOk={onAcceptRequest} 
            onCancel={onCloseAcceptRequestModal} 
            header={t('Dapps.acceptRequest')} 
            titleOk={t('Accept')}
            t={t}>
            <p>{t('Dapps.areYouSureToAcceptRequest')}</p>
          </HBPopupConfirm>
        </Modal>
        <Modal ref="md_delete_request">
          <HBPopupConfirm 
            message={t('Dapps.areYouSureToDeleteRequest')}
            onOk={onDeleteRequest} 
            onCancel={onCloseDeleteRequestModal} 
            header={t('Dapps.deleteRequest')} 
            titleOk={t('Delete')}
            isDelete={true}
            t={t}/>
        </Modal>
        <Modal ref="modalNFTTransactionHistory">
          <NFTTransactionHistory THIS={this}/>
        </Modal>
      </React.Fragment>
    )
  }
  renderWETHFormat (amount, decimals) {
    const { firstNumber, secondNumber } = formatNumberDisplay(amount, decimals)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderPriceFormat (price) {
    const { firstNumber, secondNumber } = formatFiatDisplay(price)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  renderMyRequests () {
    const { arrDappRequest, handleInfiniteOnLoad } = this.props
    const { isLoadingMyRequests, hasMore, isLoadMore } = this.state
    const { t } = this.props
    return (
      <React.Fragment>
        { isLoadingMyRequests
          ? <div className="dapp-loading"><Spin/></div>
          : arrDappRequest && arrDappRequest.length > 0
            ? <div id="HBScrollBar" className="dapp-InfiniteScroll">
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={handleInfiniteOnLoad}
                hasMore={hasMore}
                useWindow={false}>
                <List 
                  id="HBScrollBar"
                  className="dapp-request-list"
                  dataSource={arrDappRequest} 
                  renderItem={(item) => this.renderRequest(item)} />
              </InfiniteScroll>
              {isLoadMore && <div className="dapp-Spin"><Spin/></div>}
            </div>
            : <div className="dapp-no-item">
              <img src={Images.ic_interview}/>
              {t('Dapps.noRequestToShow')}
            </div>
        }
      </React.Fragment>
    )
  }
  onClickRequest = (itm) => () => this.props.onClickHistory(itm)
  renderRequest (item) {
    const { handleAcceptRequest, hanldeDeleteRequest, t } = this.props
    const { isExecuting } = this.state
    const priceGame = item.amount
    const selectedCoin = arrCryptoCurrency.find(e => e.value.includes(item.crypto || 'ETH'))
    return (
      <List.Item>
        <div className="dapp-request-header">
          <div className="dapp-request-icon">
            <img src={Images.cryptoIcon[selectedCoin.symbol]} />
          </div>
          <div className="dapp-request-type">{item.type === 'pay' ? t('Dapps.pay') : t('Request')}</div>
          <div className="dapp-request-amount"><FormatBalance balance={priceGame}/> {selectedCoin.symbol}</div>
          <div className="dapp-request-fiat">{this.currency}<FormatFiat balance={priceGame * this.fRate[selectedCoin.symbol]}/></div>
        </div>
        <div className="dapp-request-body">
          <div className="dapp-request-txt">{item.type === 'pay' ? t('Dapps.youPaidToSender', { sender: item.from }) : t('Dapps.senderRequestedYou', { sender: item.from })}</div>
          {
            item.type !== 'pay'
              ? <React.Fragment>
                {item.image && item.image.length > 0
                  ? <div className="dapp-asset-thumbnail"><HBImage logo={item.image} imgDefault={Images.ic_default_monster} addClass={'dapp-width149'}/></div>
                  : <div className="dapp-asset-thumbnail">
                    <img src={Images.ic_default_monster}/>
                    <div className="dapp-asset-no-img">{t('Dapps.thisItemHasNoImage')}</div>
                  </div>
                }
                <div className="dapp-asset-content">
                  <div className="dapp-asset-game">
                    <img src={item.icon} className="dapp-game-icn"/>
                    {item.game}
                  </div>
                  <div className="dapp-asset-name">{item.name}</div>
                </div>
              </React.Fragment>
              : null
          }
        </div>
        <div className="dapp-request-action">
          {
            item.type === 'pay'
              ? item.status === REQUEST_STATUS.COMPLETED
                ? <div className="dapp-request-sent" onClick={this.onClickRequest(item)}><img src={Images.ic_request_sent}/><span>{t('Dapps.sent')}</span></div>
                : item.status === REQUEST_STATUS.FAILED
                  ? <div className="dapp-request-pending">{t('Dapps.transactionFailed')}</div>
                  : <div className="dapp-request-pending">
                    {t('Dapps.pending')}
                    <DotDotDotLoader 
                      show={true}
                      amount={3}
                      interval={300}
                      repeat={true}
                    />
                  </div>
              : item.isAccepted
                ? <div className="dapp-request-accepted" onClick={this.onClickRequest(item)}><img src={Images.ic_request_accepted}/><span>{t('Dapps.accepted')}</span></div>
                : item.status === REQUEST_STATUS.FAILED
                  ? <div className="dapp-request-pending">{t('Dapps.sendInvalid')}</div>
                  : item.status === REQUEST_STATUS.PENDING
                    ? <div className="dapp-request-pending">
                      {t('Dapps.pending')}
                      <DotDotDotLoader 
                        show={true}
                        amount={3}
                        interval={300}
                        repeat={true}
                      />
                    </div>
                    : <React.Fragment>
                      {
                        item.gameItem.version && item.gameItem.version === 2
                          ? <React.Fragment>
                            <button 
                              className="btn btn-success" 
                              disabled={isExecuting}
                              onClick={() => handleAcceptRequest(item)}>{isExecuting ? <Spin size={15} color={'white'}/> : t('Accept')}</button>
                            <button className="btn btn-danger" onClick={() => hanldeDeleteRequest(item)}>{t('Delete')}</button>
                          </React.Fragment>
                          : <div className="dapp-request-pending">{t('Dapps.sendInvalid')}</div>
                      }
                    </React.Fragment>
          }
          {
            ((item.type === 'pay' && item.status === REQUEST_STATUS.COMPLETED) || (item.type === 'request' && item.isAccepted)) && item.createdAtTs
              ? <div className="dapp-request-timestamp">{convertTimestampToDateTime(item.createdAtTs)}</div>
              : null
          }
        </div>
      </List.Item>
    )
  }
}
