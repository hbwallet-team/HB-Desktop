import React from 'react'
import Images from 'Assets/Image'
import { Spin } from 'Frontend/Components/HBLoader'
import HBGasSlider from 'Frontend/Components/HBGasSlider'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import { openBrowserInNewTab } from 'Utils/globalFunction'
import './styles.css'

const SignTransactionScreen = ({ THIS }) => {
  const { t, handleChangeGasPrice, gasStation } = THIS.props
  const { selectedGame, sendData, txtNonce, transactionFee, valueInputGas } = THIS.state
  return (
    <div className="pp-wrap-amount-container pp-sign-transaction">
      <div className="pp-wrap-amount-content">
        <div className='pp-wrap-amount-header'>
          {t('Dapps.signConfirm')}
          <div className="pp-close" onClick={() => THIS.props.closeSignTransactionModal()}>
            <img src={Images.close1} />
          </div>
        </div>
        <div className="pp-wrap-amount-body">
          <div className="md-hd-top">
            <div className="md-hd-top-left">
              <div className="md-hd-top-eth">
                <div className="pp-hd-top-eth-balance"><FormatBalance balance={sendData.value}/></div>
                <div className="pp-hd-top-eth-text">ETH</div>
              </div>
              <div className="md-hd-top-money">
                <div className="pp-hd-top-money-text">{THIS.currency}</div>
                <div className="pp-hd-top-money-text"><FormatFiat balance={sendData.fiatMoney}/></div>
              </div>
            </div>
          </div>
          <div className="md-hd-bottom">
            <div className="pp-hd-bottom" id="HBScrollBar">
              <div className="pp-hd-bottom-row">
                <div className="pp-hd-bottom-row-label">{t('HistoryDetail.From')}</div>
                <div className="pp-hd-bottom-row-txt">{sendData.from}</div>
              </div>
              <div className="pp-hd-bottom-row">
                <div className="pp-hd-bottom-row-label">{t('HistoryDetail.To')}</div>
                <div className="pp-hd-bottom-row-txt">{sendData.to}</div>
              </div>
              {selectedGame && <div className="pp-hd-bottom-row">
                <div className="pp-hd-bottom-row-label">{t('Dapps')}</div>
                <div 
                  className="pp-hd-bottom-row-txt pp-sign-mesage-link"
                  onClick={() => openBrowserInNewTab(selectedGame.homepage)}
                >{selectedGame.homepage}</div>
              </div>}
              <div className="pp-hd-bottom-row">
                <div className="pp-hd-bottom-row-label">{t('GasPRICE')}</div>
                <div className="pp-hd-bottom-row-txt">
                  <HBGasSlider
                    t={t}
                    transactionFee={transactionFee}
                    gasInput={valueInputGas}
                    gasLimit={sendData.gas}
                    gasPrice={gasStation}
                    gasDefault={sendData.gasPriceGwei}
                    handleResult={handleChangeGasPrice}
                  />
                </div>
              </div>
              <div className="pp-hd-bottom-row">
                <div className="pp-hd-bottom-row-label">{t('HistoryDetail.Nonce')}</div>
                <div className="pp-hd-bottom-row-txt">{txtNonce}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="pp-wrap-amount-middle">
          { THIS.state.isFeeErr ? <div className="pp-error">{t('Dapps.insufficientBalance')}</div> : null }
        </div>
        <div className="pp-wrap-amount-bottom">
          <button 
            className='exs-btn exs-pp-unwrap-btn' 
            onClick={() => THIS.props.closeSignTransactionModal()}
          >{t('cancel')}</button>
          <button 
            className='exs-btn exs-pp-unwrap-btn exs-btn-primary' 
            onClick={() => THIS.props.arrPinCodeData.length > 0 ? THIS.props.openConfirmPinCodeModal() : THIS.props.onSignTransaction()}
            disabled={THIS.state.isLoadingSignTransaction || THIS.state.isFeeErr}
          >
            {
              THIS.state.isLoadingSignTransaction
                ? <Spin color='white' size={15}/>
                : t('Send')
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignTransactionScreen
