import React from 'react'
import './styles.css'

const AccountSwitched = ({ THIS, switchedAccount }) => {
  const { t } = THIS.props
  return (
    <div className='pp-wrap-amount-container pp-sign-message'>
      <div className="pp-wrap-amount-content">
        <div className='pp-wrap-amount-header'>
          {t('Dapps.accountSwitched')}
        </div>
        <div className="pp-wrap-amount-body">
          <div className="account-switched-txt">{t('Dapps.yourCurrentAccountSwitchedToNewAddress')}</div>
          <div className="account-switched-txt">{t('Dapps.wouldYouLikeToKeepCurrentAddress')}</div>
        </div>
        <div className="pp-wrap-amount-bottom">
          <button 
            className='exs-btn exs-pp-unwrap-btn' 
            onClick={() => THIS.props.onDisagreeKeepCurrentAccount()}
          >{t('No')}</button>
          <button 
            className='exs-btn exs-pp-unwrap-btn exs-btn-primary' 
            onClick={() => THIS.props.onAgreeKeepCurrentAccount()}
          >{t('Yes')}</button>
        </div>
      </div>
    </div>
  )
}

export default AccountSwitched
