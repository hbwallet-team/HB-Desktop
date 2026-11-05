import React from 'react'
import { openBrowserInNewTab } from 'Utils/globalFunction'
import Images from 'Assets/Image'
import { Spin } from 'Frontend/Components/HBLoader'
import './styles.css'

const SignMessageScreen = ({ THIS, modalConfirmPinCode = false, PinCodeForDapp = false }) => {
  const { t } = THIS.props
  const funcOpenPINCode = () => {
    modalConfirmPinCode.show()
  }
  const homepage = THIS.state.selectedGame ? THIS.state.selectedGame.homepage : THIS.state.txtLink
  return (
    <div className='pp-wrap-amount-container pp-sign-message'>
      <div className="pp-wrap-amount-content">
        <div className='pp-wrap-amount-header'>
          {t('Dapps.signMessage')}
          <div className="pp-close" onClick={() => THIS.props.closeSignModal()}>
            <img src={Images.close1} />
          </div>
        </div>
        <div className="pp-wrap-amount-body">
          <div className="pp-sign-message-txt">{t('Dapps.signMessageOnlyAuthorize')}</div>
          <div className="md-hd-bottom">
            <div className="pp-hd-bottom" id="HBScrollBar">
              <div className="pp-hd-bottom-row">
                <div className="pp-hd-bottom-row-label">{t('Dapps.requester')}</div>
                <div 
                  className="pp-hd-bottom-row-txt pp-sign-mesage-link"
                  onClick={() => openBrowserInNewTab(homepage)}
                >{homepage}</div>
              </div>
              {THIS.state.selectedGame && <div className="pp-hd-bottom-row">
                <div className="pp-hd-bottom-row-label">{t('Dapps.message')}</div>
                <div className="pp-hd-bottom-row-txt">{t('Dapps.signAuthenticateTxt', { name: THIS.state.selectedGame.name })}</div>
              </div>}
            </div>
          </div>
        </div>
        <div className="pp-wrap-amount-bottom">
          <button 
            className='exs-btn exs-pp-unwrap-btn' 
            onClick={() => THIS.props.closeSignModal()}
          >{t('cancel')}</button>
          <button 
            className='exs-btn exs-pp-unwrap-btn exs-btn-primary' 
            onClick={() => THIS.props.arrPinCodeData.length > 0 ? (PinCodeForDapp ? funcOpenPINCode() : THIS.props.openConfirmPinCodeModal()) : THIS.props.onSignPersonalMessage()}
            disabled={THIS.state.isLoadingSignMessage}
          >
            {
              THIS.state.isLoadingSignMessage
                ? <Spin color='white' size={15}/>
                : t('Dapps.signBtn')
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignMessageScreen
