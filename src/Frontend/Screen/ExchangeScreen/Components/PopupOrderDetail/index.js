import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'
import { formatNumber, openTxID, convertWeiToBalance } from 'Utils/globalFunction'
import { ORDER_STATUS, MIN_WETH_MAKE_ORDER } from 'Utils/globalConstants'
import moment from 'moment'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'

const PopupOrderDetail = ({ THIS }) => {
  const minWethMakeOrder = THIS.props.screenConfig.hb_dex.mininum_weth_make_order || MIN_WETH_MAKE_ORDER
  const { orderJSON, coinPair, wrapAllOrderJSON, allOrderJSON } = THIS.state
  const { etherPrice, openPopupCancel, localeData, t } = THIS.props
  const ORDER_STATE = {
    0: 'Open',
    1: 'Completed',
    2: 'canceled',
    3: 'Expired',
    4: 'Warning',
    5: 'Processing',
    6: 'Failed'
  }
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-order-detail pp-wrap-amount-container'>
        <div className='pp-wrap-amount-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => THIS.refs.md_exs_order_detail.hide()}><img src={Images.close} /></div>
            <div>{t('ppOrderDetail')}</div>
            {/* Order Status */}
            <div className="pp-hd-status">
              <div className="pp-hd-status-icon">
                <img src={Images.orderStatus[orderJSON.statusCode]} alt=""/>
              </div>
              <div className="pp-hd-status-txt">
                {orderJSON.statusCode === ORDER_STATUS.FILLED
                  ? (orderJSON.isMyOrder
                    ? (orderJSON.isSell ? t('makeSell') : t('makeBuy'))
                    : (orderJSON.isSell ? t('takeSell') : t('takeBuy')))
                  : orderJSON.statusCode === ORDER_STATUS.OPEN || orderJSON.statusCode === ORDER_STATUS.WARNING
                    ? orderJSON.isSell ? t('makeSell') : t('makeBuy')
                    : t(ORDER_STATE[orderJSON.statusCode])
                }
              </div>
            </div>
          </div>
          <div className="md-hd-content">
            <div className="md-hd-top">
              <div className="md-hd-top-left">
                <div className="md-hd-top-eth">
                  <div className="pp-hd-top-eth-balance"><FormatBalance balance={(wrapAllOrderJSON && wrapAllOrderJSON.balance) || orderJSON.balance} decimals={coinPair.first.decimals}/></div>
                  <div className="pp-hd-top-eth-text">{orderJSON.tokenSymbol}</div>
                </div>
                <div className="md-hd-top-money">
                  <div className="pp-hd-top-money-text">{THIS.currency}</div>
                  <div className="pp-hd-top-money-text"><FormatFiat balance={etherPrice.price * ((wrapAllOrderJSON && wrapAllOrderJSON.balance) || orderJSON.balance) * Math.abs(THIS.props.dexSelectedPair.lastPrice.price)}/></div>
                </div>
              </div>
              {(orderJSON.statusCode === ORDER_STATUS.OPEN) &&
                <div className="md-hd-top-right">
                  <div className="pp-hd-top-btn">
                    <button className="btn-default" onClick={() => openPopupCancel(allOrderJSON || orderJSON)}>{t('CancelThisOrder')}</button>
                  </div>
                </div>
              }
            </div>
            <div className="md-hd-bottom">
              <div className={'pp-hd-bottom' + (localeData === 'jp' ? ' locale-jp' : '')} id="HBScrollBar">

                {/* Create Date */}
                <div className="pp-hd-bottom-row">
                  <div className="pp-hd-bottom-row-label">{t('createdDate')}</div>
                  <div className="pp-hd-bottom-row-txt">{moment(orderJSON.createTimestamp * 1000).format('YYYY/MM/DD HH:mm')}</div>
                </div>

                {/* Expired Date */}
                {(orderJSON.statusCode === ORDER_STATUS.OPEN || orderJSON.statusCode === ORDER_STATUS.EXPIRED) &&
                  <div className="pp-hd-bottom-row">
                    <div className="pp-hd-bottom-row-label">{t('expireDate')}</div>
                    <div className="pp-hd-bottom-row-txt">{moment(orderJSON.expires * 1000).format('YYYY/MM/DD HH:mm')}</div>
                  </div>
                }

                {/* Filled Date */}
                {orderJSON.statusCode === ORDER_STATUS.FILLED &&
                  <div className="pp-hd-bottom-row">
                    <div className="pp-hd-bottom-row-label">{t('filledDate')}</div>
                    <div className="pp-hd-bottom-row-txt">{moment(orderJSON.filledTimestamp * 1000).format('YYYY/MM/DD HH:mm')}</div>
                  </div>
                }

                {/* Cancel Date */}
                {orderJSON.statusCode === ORDER_STATUS.CANCEL &&
                  <div className="pp-hd-bottom-row">
                    <div className="pp-hd-bottom-row-label">{t('canceledDate')}</div>
                    <div className="pp-hd-bottom-row-txt">{moment(orderJSON.closedTimeStamp * 1000).format('YYYY/MM/DD HH:mm')}</div>
                  </div>
                }

                {/* TxHash */}
                {(orderJSON.statusCode === ORDER_STATUS.FILLED || orderJSON.statusCode === ORDER_STATUS.CANCEL || orderJSON.statusCode === ORDER_STATUS.PROCESSING || orderJSON.statusCode === ORDER_STATUS.FAILED) && orderJSON.txID &&
                  <div className="pp-hd-bottom-row">
                    <div className="pp-hd-bottom-row-label">{t('HistoryDetail.TxHash')}</div>
                    <div className="pp-hd-bottom-row-txt" style={{textDecoration: 'underline', cursor: 'pointer'}}
                      onClick={() => openTxID(orderJSON.txID)}
                    >{orderJSON.txID.substr(0, 30)}...</div>
                  </div>
                }

                {/* Block Height */}
                {(orderJSON.statusCode === ORDER_STATUS.FILLED || orderJSON.statusCode === ORDER_STATUS.CANCEL || orderJSON.statusCode === ORDER_STATUS.FAILED) && orderJSON.blockNumber
                  ? <div className="pp-hd-bottom-row">
                    <div className="pp-hd-bottom-row-label">{t('HistoryDetail.BlockHeight')}</div>
                    <div className="pp-hd-bottom-row-txt">{orderJSON.blockNumber}</div>
                  </div>
                  : null
                }

                {/* Price */}
                <div className="pp-hd-bottom-row">
                  <div className="pp-hd-bottom-row-label">{t('price')}</div>
                  <div className="pp-hd-bottom-row-txt">{formatNumber(orderJSON.price, 8)} {coinPair.second.symbol}</div>
                </div>

                {/* Total */}
                <div className="pp-hd-bottom-row">
                  <div className="pp-hd-bottom-row-label">{t('total01')}</div>
                  <div className="pp-hd-bottom-row-txt">{formatNumber(((wrapAllOrderJSON && wrapAllOrderJSON.total) || orderJSON.total), coinPair.second.decimals)} {coinPair.second.symbol}</div>
                </div>

                {/* Gas limit */}
                {/* <div className="pp-hd-bottom-row">
                  <div className="pp-hd-bottom-row-label">{t('HistoryDetail.GasLimit')}</div>
                  <div className="pp-hd-bottom-row-txt">{objSelectItemHistoryDetail && objSelectItemHistoryDetail.gasLimit}</div>
                </div> */}

                {/* Gas used */}
                {/* <div className="pp-hd-bottom-row">
                  <div className="pp-hd-bottom-row-label">{t('HistoryDetail.GasUsed')}</div>
                  <div className="pp-hd-bottom-row-txt">{objSelectItemHistoryDetail && objSelectItemHistoryDetail.gasUsed}</div>
                </div> */}

                {/* Gas price */}
                {/* <div className="pp-hd-bottom-row">
                  <div className="pp-hd-bottom-row-label">{t('HistoryDetail.GasPrice')}</div>
                  <div className="pp-hd-bottom-row-txt">{objSelectItemHistoryDetail && formatNumberOld(objSelectItemHistoryDetail.gasPrice, 8)}</div>
                </div> */}

                {/* Actual Cost/Fee */}
                {(orderJSON.statusCode === ORDER_STATUS.FILLED || orderJSON.statusCode === ORDER_STATUS.CANCEL || orderJSON.statusCode === ORDER_STATUS.FAILED) && orderJSON.actualTxCost &&
                  <div className="pp-hd-bottom-row">
                    <div className="pp-hd-bottom-row-label">{t('HistoryDetail.Cost/Fee')}</div>
                    <div className="pp-hd-bottom-row-txt">{formatNumber(convertWeiToBalance(orderJSON.actualTxCost), 5)} ETH</div>
                  </div>
                }
              </div>
            </div>
            {/* Not enough volume to trade */}
            {orderJSON.statusCode === ORDER_STATUS.WARNING
              ? Number(orderJSON.total) < minWethMakeOrder
                ? <div className="pp-hd-bottom-row pp-for-warning">
                  <div className="pp-hd-bottom-row-center">
                    <img src={Images.orderStatus[ORDER_STATUS.WARNING]} />
                    {t('totalBalanceIsSmall', {symbol: coinPair.second.symbol, number: minWethMakeOrder})}
                  </div>
                  <div className="pp-for-warning-time">{moment(orderJSON.sortTimestamp * 1000).format('YYYY/MM/DD HH:mm')}</div>
                </div>
                : <div className="pp-hd-bottom-row pp-for-warning">
                  <div className="pp-hd-bottom-row-center">
                    <img src={Images.orderStatus[ORDER_STATUS.WARNING]} />
                    {orderJSON.warningReason
                      ? t(orderJSON.warningReason, {symbol: orderJSON.isSell ? coinPair.first.symbol : coinPair.second.symbol, number: minWethMakeOrder})
                      : orderJSON.isSell ? t('NotEnoughVolumneToMakeSell', {tokenName: coinPair.first.symbol}) : t('NotEnoughVolumneToMakeBuy', {tokenName: 'WETH'})}
                  </div>
                  <div className="pp-for-warning-time">{moment(orderJSON.sortTimestamp * 1000).format('YYYY/MM/DD HH:mm')}</div>
                </div>
              : ''
            }
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupOrderDetail
