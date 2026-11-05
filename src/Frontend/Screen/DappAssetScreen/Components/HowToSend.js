import React from 'react'
import Images from 'Assets/Image'
import { formatNumber, roundingNumber, openBrowserInNewTab } from 'Utils/globalFunction'

const HowToSend = ({ THIS }) => {
  const { t } = THIS.props
  const { limitFeeTxs, limitHBForSale, highlightFee, selectedCoin, percentDiscount } = THIS.state
  return (
    <React.Fragment>
      <div className="dapp-search">
        <div className="dapp-back" onClick={THIS.props.backToAssetDetail}>
          <img className="img-back" alt="imgBack" src={Images.tabNaviBack} />
          {t('back')}
        </div>
      </div>
      <div className="dapp-left-body">
        <div className="sendNFT-wrap">
          <div className="sts-container sendNFT-scroll">
            <div className="sts-header">
              <div className="sts-header-title">{t('Dapps.howToUse')}</div>
            </div>
            <div className="dapp-how-to-use">
              {!THIS.state.isViaSmartContract
                ? <div>
                  <h2 className="title">{t('Dapps.Fees')}</h2>
                  <h2 className="title">{t('Dapps.ComissionFee')}</h2>
                  <div>{t('Dapps.ComissionContents', {EthLimit: formatNumber(limitFeeTxs), HBLimit: formatNumber(limitHBForSale, 2), Percent: roundingNumber(percentDiscount, 2), Currency: selectedCoin.symbol})}</div>
                  <h2>{t('Dapps.HighlightFee')}</h2>
                  <div>{t('Dapps.HighlightFeeContents', {highlightFee: formatNumber(highlightFee), Currency: selectedCoin.symbol})}</div>
                  <h2>{t('Dapps.ChangeSellingPrice')}</h2>
                  <div>{t('Dapps.ChangeSellingPriceContents')}</div>
                  <h2>{t('Dapps.CancelSelling')}</h2>
                  <div>{t('Dapps.CancelSellingContents')}</div>
                  <h2>{t('Dapps.NFTAssetSendingFee')}</h2>
                  <div>{t('Dapps.NFTAssetSendingFeeContents')}</div>
                </div>
                : <div>
                  <div>{t('Dapps.ifYourSend')}</div>
                  <div className='Dapp-link' onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/download')}>https://www.hb-wallet.com/download</div>
                  <h2>{t('Dapps.WhatIsSending')}</h2>
                  <div>{t('Dapps.WhatIsSendingContents', {EthLimit: formatNumber(limitFeeTxs), HBLimit: formatNumber(limitHBForSale, 2), Percent: roundingNumber(percentDiscount, 2), Currency: selectedCoin.symbol})}</div>
                  <h2>{t('Dapps.IfThatBuyer')}</h2>
                  <div>{t('Dapps.IfThatBuyerContents')}</div>
                </div>
              }
            </div>
            <div className="sts-footer">
              <button className="btn btn-primary" onClick={THIS.props.handleNextHowToSend}>{t('Next')}</button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default HowToSend
