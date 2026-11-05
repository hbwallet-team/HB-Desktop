import React from 'react'
import { HBCRYPTO } from 'Utils/globalConstants'
import { formatNumber, convertTimestampToDateTime, openBrowserInNewTab } from 'Utils/globalFunction'
import Settings from 'Backend/settings'
import Images from 'Assets/Image'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'

const MdHistoryDetail = ({THIS}) => {
  const { t, etherPrice } = THIS.props
  const { objSelectItemHistoryDetail } = THIS.state
  return (
    <div className="md-hd-body transaction-body">
      <div className="md-hd-header">
        <div className="pp-close" onClick={() => THIS.refs.modalHistoryDetail.hide()}><img src={Images.close} /></div>
        {t('HistoryDetail.title')}
      </div>
      <div className="md-hd-content md-forHistory">
        <div className="md-hd-top">
          <div className='md-hd-top-eth'>
            <div className={(objSelectItemHistoryDetail.method === 'send')
              ? objSelectItemHistoryDetail.isToken
                ? 'md-color-token'
                : 'md-color-send'
              : 'md-color-received'}>
              {<FormatBalance balance={objSelectItemHistoryDetail.amount ? objSelectItemHistoryDetail.amount : objSelectItemHistoryDetail.fee}/>} {HBCRYPTO.ETHEREUM}
            </div>
          </div>
          <div className='md-hd-top-money'>
            <div className="md-hd-top-money-text">{THIS.currency}{<FormatFiat balance={etherPrice.price * (objSelectItemHistoryDetail.amount ? objSelectItemHistoryDetail.amount : objSelectItemHistoryDetail.fee)} />}</div>
          </div>
        </div>
        <div className="md-hd-wrapBottom">
          <div className="md-hd-bottom md-wrap-editForDetail" id="HBScrollBar">

            {/* Time stamp */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.TimeStamp')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectItemHistoryDetail && convertTimestampToDateTime(objSelectItemHistoryDetail.date)}</div>
            </div>

            {/* From */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.From')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text2">{objSelectItemHistoryDetail && objSelectItemHistoryDetail.sender}</div>
            </div>

            {/* To */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.To')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text2">{objSelectItemHistoryDetail && objSelectItemHistoryDetail.receiver}</div>
            </div>

            {/* TxHash */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.TxHash')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text" style={{textDecoration: 'underline'}}
                onClick={() => {
                  openBrowserInNewTab(Settings.server.etherscan.urlLookup + 'tx/' + objSelectItemHistoryDetail.hash)
                }}
              >{objSelectItemHistoryDetail && objSelectItemHistoryDetail.hash}</div>
            </div>

            {/* Block Height */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.BlockHeight')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectItemHistoryDetail && objSelectItemHistoryDetail.blockHeight}</div>
            </div>

            {/* Value */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.Value')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectItemHistoryDetail && formatNumber(objSelectItemHistoryDetail.amount)}</div>
            </div>

            {/* Gas limit */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasLimit')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectItemHistoryDetail && objSelectItemHistoryDetail.gasLimit}</div>
            </div>

            {/* Gas used */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasUsed')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectItemHistoryDetail && objSelectItemHistoryDetail.gasUsed}</div>
            </div>

            {/* Gas price */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasPrice')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectItemHistoryDetail && formatNumber(objSelectItemHistoryDetail.gasPrice, 10)} ETH</div>
            </div>

            {/* Actual Cost/Fee */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.Cost/Fee')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectItemHistoryDetail && formatNumber(objSelectItemHistoryDetail.fee)} ETH</div>
            </div>

            {/* Nonce */}
            <div className="md-hd-bottom-row md-editForDetail md-marginBottom">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.Nonce')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectItemHistoryDetail && objSelectItemHistoryDetail.nonce}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MdHistoryDetail
