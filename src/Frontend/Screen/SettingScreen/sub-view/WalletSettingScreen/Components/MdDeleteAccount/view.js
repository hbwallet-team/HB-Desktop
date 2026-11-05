import React from 'react'
import Images from 'Assets/Image'
import './styles.css'

export default class MdAccount extends React.PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)
  }
  render () {
    const { cardSelected, handleDeleteAccount, onCloseModal, t } = this.props
    return (
      <div className="md-body md-small">
        <div className="md-header">
          <div className="pp-close" onClick={onCloseModal}>
            <img src={Images.close} />
          </div>
          {t('Ethereum.deleteAccount')}
        </div>
        <div className="md-content">
          <div className="delete-account">
            <div className="delete-account-txt">{t('Ethereum.areYouWantToDeleteAccount')}</div>
            <div className="delete-account-addr">{cardSelected.address}</div>
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
            className="md-btn-add md-mab-btnFooter"
            onClick={handleDeleteAccount}
          >{t('Delete')}</div>
        </div>
      </div>
    )
  }
}
