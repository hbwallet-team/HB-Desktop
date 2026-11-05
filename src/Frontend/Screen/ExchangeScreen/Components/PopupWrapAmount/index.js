import React from 'react'
import './styles.css'
import { HBInput } from 'Frontend/Components/HBInput'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'
import { formatNumberDisplay, formatFiatDisplay, convertWeiToBalance, openBrowserInNewTab } from 'Utils/globalFunction'

const PopupWrapAmount = ({ isWrap = true, strAmount, onChangePPWrapAmount, t, popupGas, getBalance, that, gasPrice, gasLimit, isFillSell, orderJSON, etherPrice, localeData, currency, wethToken, mainAccount, currentAccount }) => {
  const header = isWrap ? t('wrapETH') : t('unwrapETH')
  const isEth = isWrap ? 'ETH' : 'WETH'
  const isWeth = isWrap ? 'WETH' : 'ETH'
  const isErr = Number(getBalance) < (strAmount.length === 0 ? 0 : Number(strAmount))
  let nextFunction = () => {
    that.refs.md_exs_wrap_amount.hide()
    popupGas.show()
    that.setState({
      setWidthPrice: Number(gasPrice.slow + 5),
      valueInputGas: Number(gasPrice.slow + 5),
      transactionFee: convertWeiToBalance(Number(gasPrice.slow + 5) * gasLimit, 9)
    })
  }
  let linkForLanguage = () => {
    switch (localeData) {
    case 'jp':
      return 'https://bacoor.zendesk.com/hc/ja/articles/360020105291-WETH'
    case 'cn':
      return 'https://bacoor.zendesk.com/hc/zh-cn/articles/360020409372-%E4%BB%80%E4%B9%88%E6%98%AFWETH-'
    default:
      return 'https://bacoor.zendesk.com/hc/en-us/articles/360020103891-Why-WETH-'
    }
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
      <div className='pp-wrap-amount-container pp-allWrap-popup'>
        <div className='pp-wrap-amount-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => that.refs.md_exs_wrap_amount.hide()}><img src={Images.close1} /></div>
            {header}
          </div>
          <div className='pp-wrap-amount-body'>
            <div className="pp-header-amount">
              <div className="pp-header-eth">
                <div className="pp-YourMainAccount">{currentAccount || t('YourMainAccount')}</div>
                <div className="pp-YourMainAccount pp-nameOfToken">{isWrap
                  ? <div>{renderWETHFormat(mainAccount.balance)} ETH</div>
                  : <div>{renderWETHFormat(wethToken.balance)} {wethToken.symbol}</div>
                }</div>
                {isWrap ? <img src={Images.ethCard} /> : <img src={wethToken.cardImage} />}
                <div className='pp-centerText'>{renderWETHFormat(strAmount)} {isEth}</div>
                <div className='pp-centerText'>{currency}{renderPriceFormat(strAmount * etherPrice.price)}</div>
              </div>
              <div className="pp-header-convert">
                <img src={Images.ethConvert1} />
              </div>
              <div className="pp-header-weth">
                <div className="pp-YourMainAccount">{currentAccount || t('YourMainAccount')}</div>
                <div className="pp-YourMainAccount pp-nameOfToken">{isWrap
                  ? <div>{renderWETHFormat(wethToken.balance)} {wethToken.symbol}</div>
                  : <div>{renderWETHFormat(mainAccount.balance)} ETH</div>
                }</div>
                {isWrap ? <img src={wethToken.cardImage} /> : <img src={Images.ethCard} />}
                <div className='pp-centerText'>{renderWETHFormat(strAmount)} {isWeth}</div>
                <div className='pp-centerText'>{currency}{renderPriceFormat(strAmount * etherPrice.price)}</div>
              </div>
            </div>
            <div className='pp-info-amount'>
              <div className='pp-wrap-row pp-edit-input pp-wrap-inputAmount'>
                <div className='pp-wrap-amount-title'>{isWrap ? t('ETHAmountWrapped') : t('WETHAmountUnwrapped')}</div>
                <div className='pp-wrap-amount-value'>
                  <HBInput
                    className={'pp-wrap-input mh-input-35'}
                    value={strAmount}
                    onChange={onChangePPWrapAmount}
                    symbol={isEth}
                    messageError={t('InsufficientAmount', {tokenName: isWrap ? 'Ether' : 'WETH'})}
                    isError={isErr}
                    onFocus={() => {}}
                    onBlur={() => {}}
                  />
                </div>
              </div>
              <div className='pp-wrap-row pp-text-center'><img onClick={() => openBrowserInNewTab(linkForLanguage())} className='pp-pointer' src={Images.circleHelp} /></div>
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button
              disabled={Number(strAmount) <= 0 || isErr}
              className='exs-btn exs-pp-unwrap-btn exs-btn-primary'
              onClick={() => ((Number(strAmount) <= 0 || isErr) ? {} : nextFunction())}
            >
              {t('Next')}
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupWrapAmount
