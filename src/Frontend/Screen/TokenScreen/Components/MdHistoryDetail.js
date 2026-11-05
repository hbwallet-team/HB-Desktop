import React from 'react'
import { HBCURRENCY_SYMBOL } from 'Utils/globalConstants'
import { formatNumberOld, formatNumberDisplay, formatFiatDisplay, convertTimestampToDateTime, openBrowserInNewTab } from 'Utils/globalFunction'
import Settings from 'Backend/settings'
import Images from 'Assets/Image'
const {shell} = window.require('electron')

const MdHistoryDetail = ({THIS}) => {
  const { fTokenConvert } = THIS
  const { t, cardSelected, arrCurrencyData } = THIS.props
  const { tokenTxtInfo } = THIS.state
  const renderWETHFormat = (price, decimals) => {
    const { firstNumber, secondNumber } = formatNumberDisplay(price, decimals)
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
    <div className="md-hd-body transaction-body">
      <div className="md-hd-header">
        <div className="pp-close" onClick={() => THIS.refs.modalHistoryDetail.hide()}><img src={Images.close} /></div>
        {t('HistoryDetail.title')}
      </div>
      <div className="md-hd-content md-forHistory">
        <div className="md-hd-top">
          <div className="md-hd-top-eth">
            <div className={(tokenTxtInfo.method === 'send') ? 'md-color-send' : 'md-color-received'}>
              {renderWETHFormat(tokenTxtInfo.amount, cardSelected.decimals)} {cardSelected.symbol}
            </div>
          </div>
          <div className="md-hd-top-money">
            <div className="md-hd-top-money-text">
              {HBCURRENCY_SYMBOL[arrCurrencyData]}{tokenTxtInfo.amount && renderPriceFormat(fTokenConvert * tokenTxtInfo.amount)}
            </div>
          </div>
        </div>
        <div className="md-hd-wrapBottom">
          <div className="md-hd-bottom md-wrap-editForDetail" id="HBScrollBar">

            {/* time stamp */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.TimeStamp')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{tokenTxtInfo && convertTimestampToDateTime(tokenTxtInfo.date)}</div>
            </div>
            {/* from */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.From')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text2">{tokenTxtInfo && tokenTxtInfo.sender}</div>
            </div>
            {/* to */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.To')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text2">{tokenTxtInfo && tokenTxtInfo.receiver}</div>
            </div>
            {/* txHash */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.TxHash')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text" style={{textDecoration: 'underline'}}
                onClick={() => {
                  openBrowserInNewTab(Settings.server.etherscan.urlLookup + 'tx/' + tokenTxtInfo.hash)
                }}
              >{tokenTxtInfo && tokenTxtInfo.hash}</div>
            </div>
            {/* Block Height */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.BlockHeight')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{tokenTxtInfo && tokenTxtInfo.blockHeight}</div>
            </div>
            {/* value */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.Value')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{tokenTxtInfo && formatNumberOld(tokenTxtInfo.amount, 8)}</div>
            </div>
            {/* gas limit */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasLimit')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{tokenTxtInfo && tokenTxtInfo.gasLimit}</div>
            </div>
            {/* gas used */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasUsed')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{tokenTxtInfo && tokenTxtInfo.gasUsed}</div>
            </div>
            {/* gas price */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasPrice')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{tokenTxtInfo && formatNumberOld(tokenTxtInfo.gasPrice, 10)} ETH</div>
            </div>
            {/* actual */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.Cost/Fee')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{tokenTxtInfo && formatNumberOld(tokenTxtInfo.fee, 8)} ETH</div>
            </div>
            {/* nonce */}
            <div className="md-hd-bottom-row md-editForDetail md-marginBottom">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.Nonce')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{tokenTxtInfo && tokenTxtInfo.nonce}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MdHistoryDetail
