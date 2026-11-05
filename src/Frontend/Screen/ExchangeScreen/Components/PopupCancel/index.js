import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'
import { convertWeiToBalance } from 'Utils/globalFunction'
import 'rc-slider/assets/index.css'

const PopupCancel = ({ t, cancel, checkUnlocked, popupGas, that, gasPrice, gasLimit }) => {
  let nextFunction = () => {
    popupGas.show()
    cancel.hide()
    that.setState({
      setWidthPrice: Number(gasPrice.slow + 5).toFixed(1),
      valueInputGas: Number(gasPrice.slow + 5).toFixed(1),
      transactionFee: convertWeiToBalance(Number(gasPrice.slow + 5) * gasLimit, 9)
    })
  }
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-wrap-amount-container'>
        <div className='pp-wrap-amount-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => cancel.hide()}><img src={Images.close} /></div>
            {t('cancel')}
          </div>
          <div className='pp-wrap-amount-body pp-confirm'>
            <div className='pp-info-lock'>
              <div className='pp-wrap-lock'>
                <div className='pp-wrap-convert'>
                  Are you sure you want to cancel?
                </div>
              </div>
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button className='exs-btn exs-pp-unwrap-btn' onClick={() => nextFunction()}>{t('Next')}</button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupCancel
