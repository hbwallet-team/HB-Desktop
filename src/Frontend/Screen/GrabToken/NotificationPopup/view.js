import React from 'react'
import Images from 'Assets/Image'
import './styles.css'

export default class NotificationPopup extends React.PureComponent {
  // constructor (props) {
  //   super(props)
  //   props.defaultThis(this)
  // }
  render () {
    const { handleAirdrop, cancelAirdrop, t, message, title } = this.props
    return (
      <div className="md-body md-small">
        <div className="md-header">
          <div className="pp-close" onClick={cancelAirdrop}>
            <img src={Images.close} />
          </div>
          {t(title)}
        </div>
        <div className="md-content">
          <div className="switch-account">
            <div className="switch-account-txt">{t('TransactionFeesWillBeRequired')}<br/>{t(message)}</div>
          </div>
        </div>
        <div className="md-footer">
          <div 
            id="btnHover" 
            className="md-mab-btnFooter"
            onClick={cancelAirdrop}
          >{t('cancel')}</div>
          <div 
            id="btnHover" 
            className={'md-btn-add md-mab-btnFooter'} 
            onClick={() => handleAirdrop()}
          >{t(title)}</div>
        </div>
      </div>
    )
  }
}
