import React from 'react'
import { Spin } from 'Frontend/Components/HBLoader'
import './styles.css'
import Images from 'Assets/Image'
import HBGasSlider from 'Frontend/Components/HBGasSlider'
import { HBInput } from 'Frontend/Components/HBInput'

const HBPopupConfirm = ({ t, onCancel, onOk, header = 'Confirm', message, children, titleCancel = 'No', titleOk = 'Yes', isExecuting = false, isShowCheckBox = false, isDelete = false, removeWallet = false, addClass = false, imagesIntro = false, noCancel = false, HBHasGas = false, handleChangeGasPriceAirdrop = false, THIS = false, HBHasGasForView = false, gachaCode = false, isGachaErr = false, valueGachaCode = false, getGachaCode = false}) => {
  return (
    <div className='hbpopup-container'>
      <div className='hbpp-content'>
        <div className='hbpp-header'>
          {removeWallet && <img className='warning_sign' src={Images.warning_sign} />}
          {t(header)}
          <div className="hbpp-close" onClick={onCancel || console.log('')}><img src={Images.close1} /></div>
        </div>
        <div className='hbpp-body'>
          <div className='hbpp-right'>
            <div className={'hbpp-body-content ' + (addClass)}>
              <div className='hbpp-message'>{message}</div>
              {imagesIntro && <div className='hbpp-imagesIntro'><img src={imagesIntro} /></div>}
              <div className="hbpp-message">{children}</div>
              {gachaCode && <div className="HBGachaCode">
                <div className="HBHasGas-title">{t('gachaCode')}</div>
                <HBInput
                  className='gas-input-value'
                  value={THIS.state.valueGachaCode}
                  onChange={THIS.props.onChangeGachaCode}
                  isError={isGachaErr}
                  messageError={t('gachaMatch')}
                />
              </div>}
              {HBHasGas && <div className={'HBHasGas ' + (HBHasGasForView && 'HBHasGasForView')}>
                <div className="HBHasGas-title mt4">{t('selectFee')}</div>
                <HBGasSlider
                  transactionFee={THIS.state.transactionFee}
                  gasInput={THIS.state.gasInput}
                  gasLimit={THIS.state.gasLimit}
                  gasPrice={THIS.state.gasPrice}
                  gasDefault={THIS.state.gasPrice.medium}
                  handleResult={handleChangeGasPriceAirdrop}
                  slideGacha={1}
                  t={t}
                />
              </div>}
              {HBHasGas && <div className="HBHasGas-desc">{t('gachaFeeDesc')}</div>}
              {
                isShowCheckBox
                  ? <div className='hbpp-checkbox-container'>
                    <div className='hbpp-checkbox'/>
                    <div className='hbpp-checkbox-tex'>{t('dontShowAgain')}</div>
                  </div>
                  : null
              }
            </div>
            <div className='hbpp-btn-groub'>
              {!noCancel && <div onClick={onCancel || console.log('')} className="md-mab-btnFooter hbpp-btn">{t(titleCancel)}</div>}
              <div
                className={'md-mab-btnFooter ' + 
                  (isDelete ? 'hbpp-btn-delete ' : 'hbpp-btn-yes ') + 
                  (gachaCode && ' btn-disableGacha ') + 
                  (gachaCode && !isGachaErr && valueGachaCode.toString() === getGachaCode.toString() && ' btn-enableGacha ')}
                onClick={onOk || console.log('')}>{isExecuting ? <Spin size={15} color={'white'}/> : t(titleOk)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HBPopupConfirm
