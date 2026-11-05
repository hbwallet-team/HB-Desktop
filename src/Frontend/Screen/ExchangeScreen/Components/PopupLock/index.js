import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'
import { convertWeiToBalance, formatNumberOld, formatNumberDisplay, formatFiatDisplay } from 'Utils/globalFunction'
import 'rc-slider/assets/index.css'

const PopupLock = ({ t, lock, checkUnlocked, popupGas, that, gasPrice, gasLimit, getImageToken, balanceForPPLock, balancePriceForPPLock, checkarrToken, currency, nameToken = false, currentAccount }) => {
  let nextFunction = () => {
    popupGas.show()
    lock.hide()
    that.setState({
      setWidthPrice: Number(gasPrice.slow + 5).toFixed(1),
      valueInputGas: Number(gasPrice.slow + 5).toFixed(1),
      transactionFee: convertWeiToBalance(Number(gasPrice.slow + 5) * gasLimit, 9)
    })
  }
  const renderWETHFormat = (amount, decimals) => {
    const { firstNumber, secondNumber } = formatNumberDisplay(amount, decimals)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  const renderPriceFormat = (price) => {
    const { firstNumber, secondNumber } = formatFiatDisplay(price)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-wrap-amount-container'>
        <div className='pp-wrap-amount-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => lock.hide()}><img src={Images.close} /></div>
            {checkUnlocked ? t('lock') : t('unlock')}
          </div>
          <div className='pp-wrap-amount-body pp-confirm'>
            <div className='pp-info-lock'>
              <div className="pp-lock-account">
                <div className="pp-lock-title">{checkUnlocked ? t('LockYourWETHAccount', {tokenName: checkarrToken.symbol.toUpperCase()}) : t('UnlockYourWETHAccount', {tokenName: checkarrToken.symbol.toUpperCase()})}</div>
                <div className="pp-lock-description">{checkUnlocked ? t('ByLockingWETHAccount', {tokenName: checkarrToken.symbol.toUpperCase()}) : t('ByUnlockingWETHAccount', {tokenName: checkarrToken.symbol.toUpperCase()})}</div>
              </div>
              <div className='pp-wrap-lock'>
                <div className="pp-header-amount pp-pdTop-10">
                  <div className="pp-header-eth">
                    <div className="pp-YourMainAccount">{currentAccount || t('YourMainAccount')}</div>
                    <div className="pp-wrap-imgLock">
                      {checkarrToken.symbol.toUpperCase() === 'WETH' ? <img src={Images.wethCard}/> : (getImageToken 
                        ? <img src={getImageToken}/> 
                        : <div className="txt-noImage txt-editWidth">
                          <div className="txt-noImageContent">
                            <div className="txt-noImageTitle">Token ERC-20</div>
                            <div className="txt-noImageName">{nameToken}</div>
                          </div>
                        </div>)}
                      {checkUnlocked ? <img src={Images.unlock} /> : <img src={Images.padlock} />}
                    </div>
                    <div className='pp-centerText'>{renderWETHFormat(balanceForPPLock, checkarrToken.decimals)} {checkarrToken.symbol.toUpperCase()}</div>
                    <div className='pp-centerText pp-currence-price'>{currency}{renderPriceFormat(balancePriceForPPLock)}</div>
                  </div>
                  <div className="pp-header-convert">
                    <img src={Images.ethConvert1} />
                  </div>
                  <div className="pp-header-weth">
                    <div className="pp-YourMainAccount">{currentAccount || t('YourMainAccount')}</div>
                    <div className="pp-wrap-imgLock">
                      {checkarrToken.symbol.toUpperCase() === 'WETH' ? <img src={Images.wethCard}/> : (getImageToken 
                        ? <img src={getImageToken}/> 
                        : <div className="txt-noImage txt-editWidth">
                          <div className="txt-noImageContent">
                            <div className="txt-noImageTitle">Token ERC-20</div>
                            <div className="txt-noImageName">{nameToken}</div>
                          </div>
                        </div>)}
                      {checkUnlocked ? <img src={Images.padlock} /> : <img src={Images.unlock} />}
                    </div>
                    <div className='pp-centerText'>{renderWETHFormat(balanceForPPLock, checkarrToken.decimals)} {checkarrToken.symbol.toUpperCase()}</div>
                    <div className='pp-centerText pp-currence-price'>{currency}{renderPriceFormat(balancePriceForPPLock)}</div>
                  </div>
                </div>
              </div>
              <div className="pp-lock-bottom">{t('ThisActionDoesNotSendYourWETH', {tokenName: checkarrToken.symbol.toUpperCase()})}</div>
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button className='exs-btn exs-pp-unwrap-btn exs-btn-primary' onClick={() => nextFunction()}>{t('Next')}</button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupLock
