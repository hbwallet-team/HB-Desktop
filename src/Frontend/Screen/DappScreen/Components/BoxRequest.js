import React from 'react'
import { getPriceGameItem } from 'Backend/Lib/Web3/index'
import { REQUEST_STATUS, arrCryptoCurrency } from 'Utils/globalConstants'
import { convertWeiToBalance, convertTimestampToDateTime } from 'Utils/globalFunction'
import Images from 'Assets/Image'
import { DotDotDotLoader } from 'react-dotdotdotloader'
import HBImage from 'Frontend/Components/HBImage'
import { Spin } from 'Frontend/Components/HBLoader'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'

export default class BoxRequest extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      priceGame: props.item.amount,
      crypto: props.item.crypto || 'ETH',
      selectedCoin: arrCryptoCurrency.find(e => e.value.includes(props.item.crypto || 'ETH'))
    }
  }
  async componentDidMount () {
    const priceGame = await getPriceGameItem(
      this.props.item.gameItem.address,
      this.props.item.gameItem.id,
      this.props.item.gameItem.businessAddress,
      this.props.item.gameItem.version
    )
    if (priceGame && Number(priceGame._Price) > 0 && ((this.props.item.type === 'request' && !this.props.item.isAccepted && this.props.item.status !== REQUEST_STATUS.FAILED) || (this.props.item.type === 'pay' && this.props.item.status === REQUEST_STATUS.PENDING))) {
      this.setState({
        priceGame: convertWeiToBalance(priceGame._Price),
        crypto: priceGame._crypto,
        selectedCoin: arrCryptoCurrency.find(e => e.value.includes(priceGame._crypto))
      })
    }
  }
  render () {
    const { priceGame, selectedCoin } = this.state
    const {
      onClickRequest,
      handleAcceptRequest,
      hanldeDeleteRequest,
      item,
      isExecuting,
      fRate,
      currency,
      t
    } = this.props
    return (
      <React.Fragment>
        <div className="dapp-request-header">
          <div className="dapp-request-icon">
            <img src={Images.cryptoIcon[selectedCoin.symbol]} />
          </div>
          <div className="dapp-request-type">{item.type === 'pay' ? t('Dapps.pay') : t('Request')}</div>
          <div className="dapp-request-amount"><FormatBalance balance={priceGame}/> {selectedCoin.symbol}</div>
          <div className="dapp-request-fiat">{currency}<FormatFiat balance={priceGame * fRate[selectedCoin.symbol]}/></div>
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
                ? <div className="dapp-request-sent" onClick={onClickRequest(item)}><img src={Images.ic_request_sent}/><span>{t('Dapps.sent')}</span></div>
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
                ? <div className="dapp-request-accepted" onClick={onClickRequest(item)}><img src={Images.ic_request_accepted}/><span>{t('Dapps.accepted')}</span></div>
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
      </React.Fragment>
    )
  }
}
