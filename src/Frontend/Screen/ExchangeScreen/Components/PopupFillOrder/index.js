import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import { HBInput } from 'Frontend/Components/HBInput'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import { sumValueByKey } from 'Utils/globalFunction'
import Draggable from 'react-draggable'

const PopupFillOrder = ({ orderJSON, t, THIS }) => {
  const totalBalance = sumValueByKey(orderJSON, 'balance')
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-fillOrder pp-wrap-amount-container'>
        <div className='pp-wrap-amount-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => THIS.refs.md_exs_fill_order.hide()}><img src={Images.close} /></div>
            {THIS.isFillSell ? t('takeSellOrder') : t('takeBuyOrder')}
          </div>
          <div className='pp-wrap-amount-body'>
            <div className='pp-info-amount'>
              <div className='pp-wrap-row'>
                <div className='pp-wrap-amount-title'>{THIS.isFillSell ? t('AMOUNTYOUCANBUY') : t('AMOUNTYOUCANSELL')}</div>
                <div className='pp-wrap-amount-value'>
                  <FormatBalance balance={totalBalance} decimals={THIS.state.coinPair.first.decimals} /> {THIS.state.coinPair.first.symbol}
                </div>
              </div>
              {/* {(balanceMakerForCheck === 0 || balanceMakerForCheck < Number(totalBalance)) &&
              <div className='pp-wrap-row pp-editForBalanceMaker'>
                <div className='pp-wrap-amount-title'></div>
                <div className='pp-wrap-amount-value'>{(t(THIS.isFillSell ? 'SellerCanOnly' : 'BuyerCanOnly', {amountToken: formatNumber2(balanceMakerForCheck, decimalsAltCoin), tokenName: THIS.state.coinPair.first.symbol}))}</div>
              </div>
              } */}
              <div className='pp-wrap-row'>
                <div className='pp-wrap-amount-title'>{t('price')}</div>
                <div className='pp-wrap-amount-value'>
                  <span>1 {THIS.state.coinPair.first.symbol} = <FormatBalance balance={orderJSON[0].price}/> {THIS.state.coinPair.second.symbol}</span>
                  <span className='pp-wrap-price-usd'> {THIS.currency}<FormatFiat balance={orderJSON[0].price * THIS.props.etherPrice.price} /></span>
                </div>
              </div>
              <div className='pp-wrap-row'>
                <div className='pp-wrap-amount-title'>{THIS.isFillSell ? t('BUYUNIT') : t('SELLUNIT')}</div>
                <div className='pp-wrap-amount-value'>1 {THIS.state.coinPair.first.symbol}</div>
              </div>
              {/* <div className={'pp-wrap-row pp-mb-0' + (balanceMakerForCheck === 0 ? 'pp-disableValue' : '')}> */}
              <div className={'pp-wrap-row pp-mb-0'}>
                <div className='pp-wrap-amount-title'>{THIS.isFillSell ? t('BUYAMOUNT') : t('SELLAMOUNT')}</div>
                <div className='pp-wrap-amount-value pp-for-fillOrder'>
                  <HBInput
                    className='exs-input-balance pp-fill-order-input-view exs-mgBottom0'
                    value = {THIS.state.fillOrderInput}
                    onChange= {THIS.props.changeFillOrderInput}
                    symbol={THIS.state.coinPair.first.symbol}
                    onFocus={() => THIS.props.onFocusInputMyAmount()}
                    onBlur={() => THIS.props.onBlurInputMyAmount()}
                  >
                  </HBInput>
                </div>
              </div>
              <div className="pp-wrap-row">
                <div className="pp-wrap-amount-title"></div>
                <div className="pp-wrap-amount-value">
                  <div className='pp-btnBuyAll' onClick={() => THIS.props.getBuyAll(orderJSON, THIS.isFillSell)}>{THIS.isFillSell ? t('BUYALL') : t('SELLALL')}</div>
                </div>
              </div>
              {/* <div className={'pp-wrap-row ' + (balanceMakerForCheck === 0 ? 'pp-disableValue' : '')}> */}
              <div className={'pp-wrap-row'}>
                <div className='pp-wrap-amount-title'>
                  <div className='pp-title-total'>{THIS.isFillSell ? t('NECESSARYAMOUNT') : t('TOTALRECEIVED')}</div>
                </div>
                <div className='pp-wrap-amount-value pp-edit-value'>
                  <span className='pp-value-total'>
                    <FormatBalance balance={THIS.state.fillOrderTotal} /> {THIS.state.coinPair.second.symbol}
                  </span>
                  <span className='pp-usd-total'> {THIS.currency}<FormatFiat balance={THIS.state.fillOrderTotal * THIS.props.etherPrice.price} /></span>
                </div>
              </div>
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            {/* {balanceMakerForCheck === 0
              ? <button
                className='exs-btn exs-pp-unwrap-btn'
                onClick={() => popupFillOrder.hide()}
              >
                {t('Close')}
              </button>
              :  */}
            <div className="exs-pp-textTake">{t('textTake')}</div>
            <button
              disabled={Number(THIS.state.fillOrderInput) <= 0}
              className='exs-btn exs-pp-unwrap-btn exs-btn-primary'
              onClick={() => (Number(THIS.state.fillOrderInput) <= 0 ? {} : THIS.props.clickOnNextButtonFillOrder(orderJSON, THIS.isFillSell))}
            >
              {t('Next')}
            </button>
            {/* } */}
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupFillOrder
