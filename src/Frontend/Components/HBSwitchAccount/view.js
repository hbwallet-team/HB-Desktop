import React from 'react'
import Images from 'Assets/Image'
import './styles.css'

export default class HBSwitchAccount extends React.PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)
  }
  render () {
    const { cardSelected, handleSwitchAccount, onCloseModal, t } = this.props
    return (
      <div className="md-body md-small">
        <div className="md-header">
          <div className="pp-close" onClick={onCloseModal}>
            <img src={Images.close} />
          </div>
          {t('Ethereum.switchAcount')}
        </div>
        <div className="md-content">
          <div className="switch-account">
            <div className="switch-account-txt">{t('Ethereum.areYouWantToSwitchAccount')}</div>
            <div className="switch-account-addr">{cardSelected.address}</div>
          </div>
        </div>
        <div className="md-footer">
          <div 
            id="btnHover" 
            className="md-mab-btnFooter"
            onClick={onCloseModal} 
          >{t('cancel')}</div>
          <div 
            id="btnHover" 
            className={'md-btn-add md-mab-btnFooter'} 
            onClick={handleSwitchAccount}
          >{t('Ethereum.switch')}</div>
        </div>
      </div>
    )
  }
}
