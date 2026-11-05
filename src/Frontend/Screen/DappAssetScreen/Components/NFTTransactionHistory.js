import React from 'react'
import { formatNumber, convertUtcToDateTime, convertWeiToBalance, openBrowserInNewTab } from 'Utils/globalFunction'
import Settings from 'Backend/settings'
import Images from 'Assets/Image'
import HBImage from 'Frontend/Components/HBImage'
const {shell} = window.require('electron')

const NFTTransactionHistory = ({THIS}) => {
  const { t } = THIS.props
  const { objSelectNFT } = THIS.state

  return (
    <div className="md-hd-body transaction-body NFT-popupDetail">
      <div className="md-hd-header">
        <div className="pp-close" onClick={() => THIS.refs.modalNFTTransactionHistory.hide()}><img src={Images.close} /></div>
        {t('Dapps.transactionHistory')}
      </div>
      <div className="md-hd-content md-forHistory">
        <div className="NFT-header-top">
          <div className="NFT-header-left">
            {objSelectNFT.image && objSelectNFT.image.length > 0
              ? <div className="NFT-img dapp-asset-thumbnail"><HBImage logo={objSelectNFT.image} imgDefault={Images.ic_default_monster} addClass={'dapp-width149'}/></div>
              : <div className="NFT-img dapp-asset-thumbnail">
                <img src={Images.ic_default_monster}/>
                <div className="dapp-asset-no-img">{t('Dapps.thisItemHasNoImage')}</div>
              </div>
            }
          </div>
          <div className="NFT-header-right">
            <div className={'NFT-status ' + (objSelectNFT.type ? `NFT-${objSelectNFT.type === 'request' ? 'accepted' : 'sent'}` : (objSelectNFT.sent ? 'NFT-sent' : 'NFT-received'))}>{objSelectNFT.type ? t(`Dapps.${objSelectNFT.type === 'request' ? 'accepted' : 'sent'}`) : (objSelectNFT.sent ? t('Sent') : t('Received'))}</div>
            <div className="NFT-name"><span><img src={objSelectNFT.icon}/></span>{objSelectNFT.game}</div>
            <div className="NFT-id">#{objSelectNFT.id}</div>
          </div>
        </div>
        <div className="md-hd-wrapBottom">
          <div className="md-hd-bottom md-wrap-editForDetail" id="HBScrollBar">

            {/* Time stamp */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.TimeStamp')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{convertUtcToDateTime(objSelectNFT.createdAt)}</div>
            </div>

            {/* From */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.From')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text2">{objSelectNFT.sender}</div>
            </div>

            {/* To */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.To')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text2">{objSelectNFT.receiver}</div>
            </div>

            {/* TxHash */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.TxHash')}</div>
              <div className="md-hd-bottom-row-text2 md-edit-text" style={{textDecoration: 'underline'}}
                onClick={() => {
                  openBrowserInNewTab(Settings.server.etherscan.urlLookup + 'tx/' + objSelectNFT.hash)
                }}
              >{objSelectNFT.hash}</div>
            </div>

            {/* Block Height */}
            {/* <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.BlockHeight')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectNFT && objSelectNFT.blockHeight}</div>
            </div> */}

            {/* Value */}
            {
              objSelectNFT.price
                ? <div className="md-hd-bottom-row md-editForDetail">
                  <div className="md-hd-bottom-row-text1">{t('price')}</div>
                  <div className="md-hd-bottom-row-text2 md-upperCase">{formatNumber(objSelectNFT.price, 8)}</div>
                </div>
                : null
            }

            {/* Gas limit */}
            {/* <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasLimit')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectNFT && objSelectNFT.gasLimit}</div>
            </div> */}

            {/* Gas used */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasUsed')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectNFT.gasUsed}</div>
            </div>

            {/* Gas price */}
            <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.GasPrice')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{formatNumber(convertWeiToBalance(objSelectNFT.gasPrice, 18), 10)} ETH</div>
            </div>

            {/* Actual Cost/Fee */}
            {/* <div className="md-hd-bottom-row md-editForDetail">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.Cost/Fee')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectNFT && formatNumber(objSelectNFT.fee, 8)} ETH</div>
            </div> */}

            {/* Nonce */}
            {/* <div className="md-hd-bottom-row md-editForDetail md-marginBottom">
              <div className="md-hd-bottom-row-text1">{t('HistoryDetail.Nonce')}</div>
              <div className="md-hd-bottom-row-text2 md-upperCase">{objSelectNFT && objSelectNFT.nonce}</div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NFTTransactionHistory
