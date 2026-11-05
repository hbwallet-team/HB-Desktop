import React from 'react'
import { List, Tooltip, Popover } from 'antd'
import Images from 'Assets/Image'
import './styles.css'
import { HBPopupConfirm } from 'Frontend/Components/HBPopup'
import PopupEditToken from './Components/PopupEditToken'
import HBSwitchAccount from 'Frontend/Components/HBSwitchAccount'
import MdEditAccount from './Components/MdEditAccount'
import MdDeleteAccount from './Components/MdDeleteAccount'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import { WETH_ADDRESS } from 'Utils/globalConstants'

export default class View extends React.Component {
  constructor (props) {
    super(props)
    props.funcDefautlThis(this)
    this.tokenDelete = null
    this.state = {
      tokenEdit: null,
      accountSelected: null
    }
  }
  render () {
    const { tokenEdit, accountSelected } = this.state
    const {
      arrCardData, arrTokenData, onClickCard,
      onClickToken, deleteToken, t,
      confirmDelete, hideMdConfirm,
      onClickEditToken, hideMdEdit,
      editAccount, switchAccount, removeAccount,
      closeSwitchAccountModal, closeEditAccountModal, closeDeleteAccountModal
    } = this.props
    return (
      <React.Fragment>
        <div className="sts-container ws-editContent">
          <div className="sts-header">
            <div className="sts-header-title">{t('WalletSettings')}</div>
          </div>
          <div className="wrap-ws-container">
            <div className="ws-container" id='ScrollBarCoin'>
              <div className="wrap-ws-forScroll">
                <div className="wrap-ws-panel">
                  <div className="ws-panel">
                    <div className="ws-panel-title">{t('Ethereum')}</div>
                    <List
                      className="ws-list-account ws-list-ether"
                      dataSource={arrCardData.filter(item => item.address.length > 0)}
                      renderItem={card => this.renderCellEther(card, onClickCard, editAccount, switchAccount, removeAccount, t)} />
                  </div>
                  <div className="ws-panel">
                    <div className="ws-panel-title">{t('Token')}</div>
                    {
                      arrTokenData.filter(tk => !tk.isCustomToken).length > 0
                        ? <List
                          className="ws-list-account"
                          dataSource={arrTokenData.filter(tk => !tk.isCustomToken && tk.address.length > 0)}
                          renderItem={token => this.renderCellToken(token, onClickToken, deleteToken, onClickEditToken, t)} />
                        : null
                    }
                  </div>
                  <div className="ws-panel">
                    <div className="ws-panel-title">{t('CustomToken')}</div>
                    {
                      arrTokenData.filter(tk => tk.isCustomToken).length > 0
                        ? <List
                          className="ws-list-account"
                          dataSource={arrTokenData.filter(tk => tk.isCustomToken)}
                          renderItem={token => this.renderCellToken(token, onClickToken, deleteToken, onClickEditToken, t)} />
                        : <div className="ws-add-custom-token">
                          <button 
                            className="ws-btn-add-custom-token"
                            onClick={this.props.onClickAddCustomToken}
                          >
                            {t('addCustomToken')}
                          </button>
                          <div className="ws-help-txt">{t('YouDontHaveCustomToken')}</div>
                        </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal ref="md_mab_confirm">
          <HBPopupConfirm onOk={confirmDelete} onCancel={hideMdConfirm} message={t('youWantToDelete')} t={t}/>
        </Modal>
        <Modal ref="md_edit_token">
          <PopupEditToken onHide={hideMdEdit} token={tokenEdit} t={t}/>
        </Modal>
        <Modal ref="md_edit_account">
          <MdEditAccount cardSelected={accountSelected} onCloseModal={closeEditAccountModal}/>
        </Modal>
        <Modal ref="md_delete_account">
          <MdDeleteAccount cardSelected={accountSelected} onCloseModal={closeDeleteAccountModal}/>
        </Modal>
        <Modal ref="md_switch_account">
          <HBSwitchAccount cardSelected={accountSelected} onCloseModal={closeSwitchAccountModal}/>
        </Modal>
      </React.Fragment>
    )
  }

  renderCellEther = (card, onClickCard, editAccount, switchAccount, removeAccount, t) => {
    return (
      <List.Item className="ws-list-item ws-cell-padding">
        <Popover
          overlayClassName="md-Popover"
          placement="topLeft"
          trigger="hover"
          content={
            card.key === 0
              ? <div className="md-bounce-option">
                {!card.isMain && <div className="md-option" onClick={() => switchAccount(card)}><img src={Images.btn_circle_check}/></div>}
              </div>
              : <div className="md-bounce-option">
                <div className="md-option" onClick={() => editAccount(card)}><img src={Images.ic_edit_black}/></div>
                {!card.isMain && <div className="md-option" onClick={() => switchAccount(card)}><img src={Images.btn_circle_check}/></div>}
                <div className="md-option" onClick={() => removeAccount(card)}><img src={Images.md_rubbish}/></div>
              </div>}
        >
          {card.isMain && <Tooltip placement="top" title={t('Ethereum.yourCurrentAccount')}><img className="ws-img" src={Images.btn_circle_check}/></Tooltip>}
          <div className="ws-cell-name">{card.cardName === 'Main Account' ? t('mainAccount') : card.cardName}</div>
        </Popover>
        <div className="ws-cell-enabled" onClick={() => !card.isMain ? onClickCard(card) : {}}><img src={card.isEnable ? Images.ic_enabled : Images.ic_disabled} alt="status"/></div>
      </List.Item>
    )
  }

  renderCellToken = (token, onClickToken, deleteToken, onClickEditToken, t) => {
    return (
      <List.Item className="ws-list-item">
        <Popover
          overlayClassName="md-Popover"
          placement="topLeft"
          trigger="hover"
          content={<div className="md-bounce-option">
            {token.isCustomToken && <div className="md-option" onClick={() => onClickEditToken(token)}><img src={Images.ic_edit_black}/></div>}
            {token.isCustomToken && <div className="md-option" onClick={() => deleteToken(token)}><img src={Images.md_rubbish}/></div>}
          </div>}
        >
          <div className="ws-cell-right-background ws-cell-padding">
            <span className="ws-cell-name">{token.name}</span>
            <span className="ws-cell-enabled" onClick={() => onClickToken(token)}><img src={token.isEnabled ? Images.ic_enabled : Images.ic_disabled} alt="status"/></span>
          </div>
        </Popover>
      </List.Item>
    )
  }
}
