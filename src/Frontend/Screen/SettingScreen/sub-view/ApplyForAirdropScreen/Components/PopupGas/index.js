import React from 'react'
import Draggable from 'react-draggable'
import HBGasSlider from 'Frontend/Components/HBGasSlider'
import { Spin } from 'Frontend/Components/HBLoader'
import 'rc-slider/assets/index.css'
import Images from 'Assets/Image'
import { formatNumberOld, formatSmallNumber, filterMainAccount } from 'Utils/globalFunction'
import { ORDER_STATUS } from 'Utils/globalConstants'

const PopupGas = ({ THIS }) => {
  let countClickSend = 0
  const send = () => {
    countClickSend++
    THIS.refs.md_exs_gas.hide()
    if (countClickSend === 1) {
      setTimeout(() => {
        THIS.props.sendAction()
      }, 1000)
    }
  }
  const { arrCardData, t } = THIS.props
  const mainAccount = filterMainAccount(arrCardData)
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-wrap-amount-container pp-newLayoutGas'>
        <div className='pp-wrap-amount-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => THIS.refs.md_exs_gas.hide()}>
              <img src={Images.close1} />
            </div>
            {t('ApplyAirdrop.confirmApplyForAirdrop')}
          </div>
          <div className="pp-wrap-amount-body pp-confirm pp-confirm-airdrop">
            <div className="pp-info-amount">
              <div className="pp-wrap-row pp-mgTop-10">
                <div className='pp-wrap-amount-title'>
                  <div className='pp-title-price'>{t('tklRegistrationFee')}</div>
                </div>
                <div className='pp-edit2Value'>
                  <div className='pp-wrap-amount-value pp-edit-value'>
                    <div className='pp-value-price'>
                      {formatSmallNumber(THIS.state.registrationFee, 8)} {THIS.state.paymentType}
                    </div>
                  </div>
                  <div className='pp-wrap-amount-usd'>
                    <div className='pp-usd-price'>${formatNumberOld(THIS.state.paymentType === 'HBWALLET' ? Number(THIS.state.registrationFeeUsd) * 0.5 : THIS.state.registrationFeeUsd, 2)}</div>
                  </div>
                </div>
              </div>
              <div className="pp-wrap-row">
                <div className="pp-wrap-amount-title"></div>
                <div className="pp-edit2Value">
                  {!THIS.state.sufficientTokenBalance &&
                  <div className="pp-wrap-amount-value pp-for-warning">
                    <img src={Images.orderStatus[ORDER_STATUS.WARNING]} />
                    {t('youDontHaveSufficient', {number: formatNumberOld(THIS.state.tokenBalance, 2), symbol: THIS.state.paymentType})}
                  </div>}
                </div>
              </div>
              <div className="pp-wrap-row pp-mgTop-40">
                <div className='pp-wrap-amount-title'>
                  <div className='pp-title-price pp-select-fee'>{t('GasPRICE')}</div>
                </div>
                <div className='pp-edit2Value'>
                  <HBGasSlider
                    transactionFee={THIS.state.transactionFee}
                    gasInput={THIS.state.valueInputGas}
                    gasLimit={THIS.state.gasLimit}
                    gasPrice={THIS.state.gasPrice}
                    gasDefault={THIS.state.gasPrice.slow + 5}
                    handleResult={THIS.props.handleChangeGasPrice}
                    t={t}
                  />
                </div>
              </div>
              <div className="pp-wrap-row pp-mgTop-40">
                <div className='pp-wrap-amount-title'>
                  <div className='pp-title-price'>{t('total')}</div>
                </div>
                <div className='pp-edit2Value'>
                  <div className='pp-wrap-amount-value pp-edit-value'>
                    <div className='pp-value-price'>
                      {formatSmallNumber(THIS.state.totalFee, 8)} ETH
                    </div>
                  </div>
                  <div className='pp-wrap-amount-usd'>
                    <div className='pp-usd-price'>{THIS.currency}{formatNumberOld(THIS.state.totalFee * THIS.state.etherPrice, 2)}</div>
                  </div>
                </div>
              </div>
              <div className="pp-wrap-row">
                <div className="pp-wrap-amount-title"></div>
                <div className="pp-edit2Value">
                  {!THIS.state.sufficientEtherBalance &&
                  <div className="pp-wrap-amount-value pp-for-warning">
                    <img src={Images.orderStatus[ORDER_STATUS.WARNING]} />
                    {t('youDontHaveSufficient', {number: formatSmallNumber(mainAccount.balance, 8), symbol: 'ETH'})}
                  </div>}
                </div>
              </div>
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button className='exs-btn exs-pp-unwrap-btn exs-pp-btnCancel edt-text-capitalize minWidth120' onClick={() => { THIS.refs.md_exs_gas.hide() }}>{t('cancel')}</button>
            <button 
              disabled={THIS.state.isLoadingExcute || !THIS.state.sufficientTokenBalance || !THIS.state.sufficientEtherBalance} 
              className='exs-btn exs-pp-unwrap-btn exs-btn-primary' 
              onClick={() => send()}
            >
              {THIS.state.isLoadingExcute ? <Spin size={15} color={'white'}/> : t('Send')}
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupGas
