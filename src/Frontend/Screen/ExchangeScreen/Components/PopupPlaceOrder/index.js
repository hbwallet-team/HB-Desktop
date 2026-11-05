import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'
import moment from 'moment'
import FormatBalance from 'Frontend/Components/FormatBalance'
import 'rc-slider/assets/index.css'

const PopupPlaceOrder = ({ that, t, isSell, amountInput, coinPair, priceInput, date, totalInput, nextPlaceOrder, localeData }) => {
  let countClickSend = 0
  let send = () => {
    countClickSend++
    that.refs.md_exs_place_order.hide()
    if (countClickSend === 1) {
      setTimeout(() => {
        nextPlaceOrder()
      }, 1000)
    }
  }
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-place-order pp-wrap-amount-container'>
        <div className='pp-wrap-amount-content pp-placeOrder-editWidth'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => that.refs.md_exs_place_order.hide()}><img src={Images.close} /></div>
            {t('ConfirmThisOrder')}
            <span className="pp-header-sub-title" style={{color: isSell ? '#FF295C' : '#24E37D'}}>{isSell ? t('ppSELL') : t('ppBUY')}</span>
          </div>
          <div className='pp-wrap-amount-body pp-confirm pp-placeOrder'>
            <div className='pp-info-lock'>
              <div className="pp-placeOrder-wrapContent">
                <div className={'pp-placeOrder-content ' + ((localeData === 'jp' || localeData === 'cn') ? 'pp-forJP-CN' : '')}>
                  <div className="pp-placeOrder-content-left">{t('amount01')}</div>
                  <div className="pp-placeOrder-content-right"><span><FormatBalance balance={amountInput} decimals={coinPair.first.decimals} /> {coinPair.first.symbol}</span></div>
                </div>
                <div className={'pp-placeOrder-content ' + ((localeData === 'jp' || localeData === 'cn') ? 'pp-forJP-CN' : '')}>
                  <div className="pp-placeOrder-content-left">{t('price')}</div>
                  <div className="pp-placeOrder-content-right"><span><FormatBalance balance={priceInput} /> {coinPair.second.symbol}</span></div>
                </div>
                <div className={'pp-placeOrder-content ' + ((localeData === 'jp' || localeData === 'cn') ? 'pp-forJP-CN' : '')}>
                  <div className="pp-placeOrder-content-left">{t('ppEXPIRESIN')}</div>
                  <div className="pp-placeOrder-content-right"><span>{moment(date).format('YYYY/MM/DD HH:mm')}</span></div>
                </div>
                <div className={'pp-placeOrder-content ' + ((localeData === 'jp' || localeData === 'cn') ? 'pp-forJP-CN' : '')}>
                  <div className="pp-placeOrder-content-left">{t('fee')}</div>
                  <div className="pp-placeOrder-content-right"><span>{t('Free')}</span></div>
                </div>
              </div>
              <div className={'pp-placeOrder-total ' + ((localeData === 'jp' || localeData === 'cn') ? 'pp-forJP-CN' : '')}>
                <div className="pp-placeOrder-total-left">{t('total')}</div>
                <div className="pp-placeOrder-total-right"><span><FormatBalance balance={totalInput} /> {coinPair.second.symbol}</span></div>
              </div>
              <div className="pp-placeOrder-bottom">{t('TransactionFreeWillBeCharged')}</div>
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button className='exs-btn exs-pp-unwrap-btn' onClick={() => that.refs.md_exs_place_order.hide()}>{t('cancel')}</button>
            <button className='exs-btn exs-pp-unwrap-btn exs-btn-primary' onClick={() => send()}>{t('Make')}</button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupPlaceOrder
