import React from 'react'
import './styles.css'
import OxObject from 'Backend/Lib/0x/index'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'
import Slider from 'rc-slider'
import { formatNumber, formatNumberOld, convertWeiToBalance, formatNumberLeftZero, formatNumberDisplay, formatFiatDisplay } from 'Utils/globalFunction'
import { HBInput } from 'Frontend/Components/HBInput'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import 'rc-slider/assets/index.css'
import swal from 'sweetalert2'

const PopupGas = ({ isWrap = true, wrapAction, strAmount, that, t, popupGas, dragVolume, setWidthPrice, transactionFee, etherPrice, gasLimit, fillOrderAction = () => {}, orderJSON, unlock = () => {}, clickPopUp, gasAmount, isFillSell, gasPrice, atcResultEth, fillOrderTotal, focusInputGasPrice, unFocusInputGasPrice, valueInputGas, amountAltCoin, balanceWETH, balanceETH, cancelOrderByUser, clickCancel, openPopupCancelByID, checkarrToken, checkUnlocked, getImageToken, fillOrderInput, localeData, currency, coinPair, nameToken = false }) => {
  if (valueInputGas === '' || valueInputGas === 0 || Number(valueInputGas) < Number(gasPrice.slow)) {
    that.setState({
      setWidthPrice: Number(gasPrice.slow).toFixed(1),
      transactionFee: convertWeiToBalance(Number(gasPrice.slow) * gasLimit, 9)
    })
  } else if (valueInputGas > (Number(gasPrice.fast) * 1.5)) {
    that.setState({
      setWidthPrice: (Number(gasPrice.fast) * 1.5).toFixed(1),
      transactionFee: convertWeiToBalance((Number(gasPrice.fast) * 1.5) * gasLimit, 9)
    })
  } else {
    that.setState({
      setWidthPrice: Number(valueInputGas).toFixed(1),
      transactionFee: convertWeiToBalance(Number(valueInputGas) * gasLimit, 9)
    })
  }
  let restartGas = () => {
    popupGas.hide()
    setTimeout(() => {
      that.setState({
        setWidthPrice: Number(gasPrice.slow + 5).toFixed(1),
        transactionFee: convertWeiToBalance(Number(gasPrice.slow + 5) * gasLimit, 9),
        valueInputGas: Number(gasPrice.slow + 5).toFixed(1)
      })
    }, 1500)
  }
  let countClickSend = 0
  let send = () => {
    countClickSend++
    popupGas.hide()
    if (countClickSend === 1) {
      setTimeout(() => {
        handleToSend()
      }, 1000)
    }
  }
  let handleToSend = async () => {
    if (clickPopUp === 'cancelOption') {
      OxObject.setGasPrice(setWidthPrice)
      clickCancel(openPopupCancelByID)
    } else if (clickPopUp === 'wrapOption') {
      if ((isWrap && (Number(strAmount) + Number(transactionFee)) > Number(balanceETH)) || (!isWrap && Number(transactionFee) > balanceETH)) {
        swal({
          width: '250px',
          text: t('InsufficientAmount', {tokenName: 'Ether'}),
          type: 'error',
          showConfirmButton: false
        })
      } else {
        wrapAction(isWrap)
        OxObject.setGasPrice(setWidthPrice)
      }
    } else if (clickPopUp === 'lockOption') {
      if (Number(transactionFee) > balanceETH) {
        swal({
          width: '250px',
          text: t('InsufficientAmount', {tokenName: 'Ether'}),
          type: 'error',
          showConfirmButton: false
        })
      } else {
        unlock()
        OxObject.setGasPrice(setWidthPrice)
      }
    } else {
      // if maker has not enough money
      // await getBalanceMaker(orderJSON)
      // let balanceMaker = await getTokenBalance(orderJSON.metadata.makerToken.address, orderJSON.signedOrder.makerAddress, orderJSON.metadata.makerToken.decimals)
      // balanceMaker = isFillSell ? balanceMaker : (Number(balanceMaker) / Number(orderJSON.price))
      // console.log('balanceMakerFILL:', balanceMaker, fillOrderInput)
      // if (Number(balanceMaker) < formatNumber(fillOrderInput) && isFillSell) {
      //   swal({
      //     width: '250px',
      //     text: t('InsufficientAmountMaker', {tokenName: orderJSON.tokenSymbol}),
      //     type: 'error',
      //     showConfirmButton: false
      //   })
      //   // await cancelOrderByUser(orderJSON)
      //   console.log('Maker Selling and just take care about Token Name:', balanceMaker)
      //   restartGas()
      //   return
      // } else if (Number(balanceMaker) < formatNumber(fillOrderTotal) && !isFillSell) {
      //   swal({
      //     width: '250px',
      //     text: t('InsufficientAmountMaker', {tokenName: 'WETH'}),
      //     type: 'error',
      //     showConfirmButton: false
      //   })
      //   // await cancelOrderByUser(orderJSON)
      //   console.log('Maker Buying and just take care about WETH:', balanceMaker)
      //   restartGas()
      //   return
      // } else 
      if (isFillSell === true && Number(fillOrderTotal) > Number(balanceWETH)) {
        swal({
          width: '250px',
          text: t('InsufficientAmount', {tokenName: coinPair.second.symbol}),
          type: 'error',
          showConfirmButton: false
        })
      } else if (isFillSell === false && Number(fillOrderInput) > amountAltCoin) {
        swal({
          width: '250px',
          text: t('InsufficientAmount', {tokenName: coinPair.first.symbol}),
          type: 'error',
          showConfirmButton: false
        })
      } else if (Number(transactionFee) > Number(balanceETH)) {
        swal({
          width: '250px',
          text: t('InsufficientAmount', {tokenName: 'Ether'}),
          type: 'error',
          showConfirmButton: false
        })
      } else {
        fillOrderAction(orderJSON)
        OxObject.setGasPrice(setWidthPrice)
      }
    }
    restartGas()
  }
  let btnSend = () => {
    if (clickPopUp === 'wrapOption') {
      if (isWrap) {
        return t('Wrap')
      } else {
        return t('Unwrap')
      }
    } else if (clickPopUp === 'lockOption') {
      if (checkUnlocked) {
        return t('lock')
      } else {
        return t('unlock')
      }
    } else if (clickPopUp === 'fillOption') {
      return t('ppTake')
    } else if (clickPopUp === 'cancelOption') {
      return t('ppConfirm')
    } else {
      return t('Send')
    }
  }
  let confirmTransation = () => {
    if (clickPopUp === 'wrapOption') {
      if (isWrap) {
        return t('ConfirmWrapETH')
      } else {
        return t('ConfirmUnwrapWETH')
      }
    } else if (clickPopUp === 'lockOption') {
      if (checkUnlocked) {
        return t('ConfirmLock')
      } else {
        return t('ConfirmUnlock')
      }
    } else if (clickPopUp === 'fillOption') {
      if (isFillSell) {
        return t('ConfirmTakeSellOrder')
      } else {
        return t('ConfirmTakeBuyOrder')
      }
    } else if (clickPopUp === 'cancelOption') {
      return t('ConfirmOrderCancellation')
    } else {
      return t('confirmTransation')
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
      <div className='pp-wrap-amount-container pp-newLayoutGas'>
        <div className='pp-wrap-amount-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => popupGas.hide()}><img src={Images.close1} /></div>
            {confirmTransation()}
          </div>
          <div className={'pp-wrap-amount-body pp-confirm ' + (clickPopUp === 'fillOption' ? 'pp-fillOption' : '')}>
            <div className='pp-info-amount'>
              {clickPopUp === 'cancelOption'
                ? <div className="pp-wrapForCancelOption">
                  <div className="pp-forCancelOption">{t('AreYouSure')}</div>
                  <div className="pp-forCancelDetail">{t('TransactionFreeWillBeCharged')}</div>
                </div>
                : ''
              }
              {clickPopUp === 'lockOption'
                ? <div className='pp-hide-amount'>{clickPopUp === 'cancelOption' ? t('youWantToDelete') : t('YourWETHisNotSent', {tokenName: checkarrToken.symbol}) }</div>
                : <div className="pp-header-amount pp-pdTop-10">
                  <div className="pp-header-eth">
                    {clickPopUp === 'cancelOption'
                      ? ''
                      : <div className="pp-YourMainAccount">{t('YourMainAccount')}</div>
                    }
                    {clickPopUp === 'fillOption'
                      ? (isFillSell
                        ? <div className='pp-wrap-2pic'>
                          <img src={Images.wethCard} />
                          {getImageToken 
                            ? <img src={getImageToken} /> 
                            : <div className="txt-noImage txt-editWidth">
                              <div className="txt-noImageContent">
                                <div className="txt-noImageTitle">Token ERC-20</div>
                                <div className="txt-noImageName">{nameToken}</div>
                              </div>
                            </div>}
                        </div>
                        : <div className='pp-wrap-2pic'>
                          {getImageToken 
                            ? <img src={getImageToken} /> 
                            : <div className="txt-noImage txt-editWidth">
                              <div className="txt-noImageContent">
                                <div className="txt-noImageTitle">Token ERC-20</div>
                                <div className="txt-noImageName">{nameToken}</div>
                              </div>
                            </div>}
                          <img src={Images.wethCard} />
                        </div>
                      )
                      : (clickPopUp === 'cancelOption'
                        ? getImageToken 
                          ? <img src={getImageToken} /> 
                          : <div className="txt-noImage txt-editWidth">
                            <div className="txt-noImageContent">
                              <div className="txt-noImageTitle">Token ERC-20</div>
                              <div className="txt-noImageName">{nameToken}</div>
                            </div>
                          </div>
                        : isWrap ? <img src={Images.ethCard} /> : <img src={Images.wethCard} />
                      )
                    }
                    {clickPopUp === 'fillOption' || clickPopUp === 'cancelOption'
                      ? ''
                      : <div className='pp-wrap2centerText'>
                        <div className='pp-centerText'>{renderWETHFormat(gasAmount, 8)} {isWrap ? 'WETH' : 'ETH'}</div>
                        <div className='pp-centerText'>{currency}{renderPriceFormat(strAmount * etherPrice)}</div>
                      </div>
                    }
                  </div>
                  <div className="pp-header-convert">
                    {clickPopUp === 'fillOption'
                      ? <div className="pp-wrap2Convert">
                        <div className='pp-wrap2Convert-title'>{t('SEND')}</div>
                        <div className='pp-adjustText'>{renderWETHFormat(isFillSell ? fillOrderTotal : gasAmount, isFillSell ? coinPair.second.decimals : coinPair.first.decimals)} {isFillSell ? coinPair.second.symbol : coinPair.first.symbol}</div>
                        <img className="pp-imgFirstConvert" src={Images.ethConvert1} />
                        <div className='pp-wrap2Convert-title'>{t('RECEIVE')}</div>
                        <div className='pp-adjustText'>{renderWETHFormat(isFillSell ? gasAmount : fillOrderTotal, isFillSell ? coinPair.first.decimals : coinPair.second.decimals)} {isFillSell ? coinPair.first.symbol : coinPair.second.symbol}</div>
                        <img className="pp-imgSecondConvert" src={Images.ethConvert1} />
                      </div>
                      : <img className={clickPopUp === 'cancelOption' ? 'pp-cancelOptionConvert' : ''} src={Images.ethConvert1} />
                    }
                  </div>
                  <div className="pp-header-weth">
                    {clickPopUp === 'cancelOption'
                      ? ''
                      : <div className="pp-YourMainAccount">{clickPopUp === 'fillOption' ? (isFillSell ? t('SellerMainAccount') : t('BuyerMainAccount')) : t('YourMainAccount')}</div>
                    }
                    {clickPopUp === 'fillOption'
                      ? (isFillSell
                        ? <div className='pp-wrap-2pic'>
                          <img src={Images.wethCard} />
                          {getImageToken 
                            ? <img src={getImageToken} /> 
                            : <div className="txt-noImage txt-editWidth">
                              <div className="txt-noImageContent">
                                <div className="txt-noImageTitle">Token ERC-20</div>
                                <div className="txt-noImageName">{nameToken}</div>
                              </div>
                            </div>}
                        </div>
                        : <div className='pp-wrap-2pic'>
                          {getImageToken 
                            ? <img src={getImageToken} /> 
                            : <div className="txt-noImage txt-editWidth">
                              <div className="txt-noImageContent">
                                <div className="txt-noImageTitle">Token ERC-20</div>
                                <div className="txt-noImageName">{nameToken}</div>
                              </div>
                            </div>}
                          <img src={Images.wethCard} />
                        </div>
                      )
                      : (clickPopUp === 'cancelOption'
                        ? <img className='pp-imgBlockchain' src={Images.blockchain2} />
                        : isWrap ? <img src={Images.wethCard} /> : <img src={Images.ethCard} />
                      )
                    }
                    {clickPopUp === 'fillOption' || clickPopUp === 'cancelOption'
                      ? ''
                      : <div className='pp-wrap2centerText'>
                        <div className='pp-centerText'>{renderWETHFormat(gasAmount, 8)} {isWrap ? 'WETH' : 'ETH'}</div>
                        <div className='pp-centerText'>{currency}{renderPriceFormat(strAmount * etherPrice)}</div>
                      </div>
                    }
                  </div>
                </div>
              }
              <div className={'pp-wrap-row pp-mgTop-40 ' + (clickPopUp === 'cancelOption' ? 'pp-mgTop-cancelOption' : '')}>
                <div className='pp-wrap-amount-title'>
                  <div className='pp-title-price'>{t('TransactionFEE')}</div>
                </div>
                <div className='pp-edit2Value'>
                  <div className='pp-wrap-amount-value pp-edit-value'>
                    <div className='pp-value-price'>
                      {renderWETHFormat(transactionFee, 8)} ETH
                    </div>
                  </div>
                  <div className='pp-wrap-amount-usd'>
                    <div className='pp-usd-price'>{currency}{renderPriceFormat(transactionFee * etherPrice)}</div>
                  </div>
                </div>
              </div>
              <div className='pp-wrap-row pp-mgBottom-6'>
                <div className='pp-wrap-amount-title'>{t('GasPRICE')}</div>
                <div className="pp-price-adjust">
                  <Slider defaultValue={Number(gasPrice.slow + 5)} value={Number(Number(setWidthPrice).toFixed(1))} min={Number(gasPrice.slow)} max={Number(gasPrice.fast) * 1.5} step={0.1} onChange={(value) => dragVolume(value > (Number(gasPrice.fast) * 1.5) ? (Number(gasPrice.fast) * 1.5) : (value < Number(gasPrice.slow) ? Number(gasPrice.slow) : value))}/>
                </div>
                <div className="pp-recent-price">
                  <HBInput
                    className='pp-input-recent-price'
                    value={Number(Number(valueInputGas).toFixed(1))}
                    onChange={focusInputGasPrice}
                    onBlur={unFocusInputGasPrice}
                    symbol={'Gwei'}
                    symbolGwei={'symbolGwei'}
                  />
                </div>
              </div>
              <div className='pp-wrap-row'>
                <div className='pp-wrap-amount-title'></div>
                <div className='pp-wrap-level'>
                  <div className="pp-slow-level">{t('Slower')}</div>
                  <div className="pp-medium-level">{t('medium')}</div>
                  <div className="pp-fast-level">{t('Faster')}</div>
                </div>
              </div>
              {clickPopUp === 'lockOption'
                ? <div className='pp-take-minutes'>{checkUnlocked ? t('ItMayTakeAFewMinutesToLock') : t('ItMayTakeAFewMinutesToUnlock')}</div>
                : ''
              }
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button className='exs-btn exs-pp-unwrap-btn exs-pp-btnCancel edt-text-capitalize' onClick={() => { popupGas.hide() }}>{t('cancel')}</button>
            <button className='exs-btn exs-pp-unwrap-btn exs-btn-primary' onClick={() => send()}>{btnSend()}</button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupGas
