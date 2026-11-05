import React from 'react'
import './styles.css'
import { Menu, Dropdown, Icon, List, Popover, Button } from 'antd'
import { HBCRYPTO } from 'Utils/globalConstants'
import { HBInput } from 'Frontend/Components/HBInput'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import { FaTrash, FaCopy, FaEdit, FaQrcode } from 'react-icons/lib/fa'
import { copyText } from 'Utils/globalFunction'
import QRCode from 'qrcode.react'
import { HBPopupConfirm } from 'Frontend/Components/HBPopup'
import Images from 'Assets/Image'

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.funcDefautlThis(this)
    this.state = ({
      strFilter: HBCRYPTO.ETHEREUM,
      txtSearch: '',
      arrSearch: [],
      // Modal add address
      txtAccount: '',
      isAccountError: false,
      accountErrorMsg: '',
      txtAccountName: '',
      isAccountNameError: false,
      // Modal account actions
      AccountSelected: null,
      isEditAccount: false,
      activeCopied: false
    })
  }

  componentWillMount () {
    this.props.filter(this.state.strFilter, this.state.txtSearch)
  }

  render () {
    const { strFilter, txtSearch, arrSearch, txtAccount, txtAccountName, isAccountError, isAccountNameError,
      AccountSelected, isEditAccount, accountErrorMsg, activeCopied } = this.state
    const { arrTokenData, onChangeTxt, onChangeDropdown, showMdAddAddress, registerAccountBook,
      onChangeTxtAccount, t, onClickAccount, deleteAccount, hideMdConfirm,
      activeEditAccount, copyAccount, showQRCodeAccount, removeAccount } = this.props
    const isValid = txtAccountName.length > 0 && txtAccount.length > 0 && !isAccountError && !isAccountNameError
    return (
      <div className="wrap-mab-container">
        <div className="sts-header">
          <div className="sts-header-title">{t('ManageAccountBook')}</div>
        </div>
        <div className="mab-container">
          <div className="mab-row-top">
            <span className="mab-btn-add" id="btnHover" onClick={() => showMdAddAddress()}><img className="mab-add_button" src={Images.add_button} /></span>
            <div className="mab-row-text-search">
              <HBInput
                className={'mh-input-41'}
                autoFocus={true}
                iconLeft={Images.search1}
                placeholder={t('EnterAccountName')}
                value={txtSearch}
                onChange={(value) => onChangeTxt(value)}/>
            </div>
            <Dropdown overlay={this.renderDropdownFilter(arrTokenData, onChangeDropdown)} trigger={['click']} placement="bottomCenter">
              <div className="mab-dropdown-token" >
                <span className="mab-dropdown-token-text">{strFilter} </span> <Icon type="down" />
              </div>
            </Dropdown>
          </div>
          
          <div className="mab-list-account-container" id="HBScrollBar">
            {arrSearch.length === 0
              ? <div className="mdToken-noInternet">
                <img alt='img' src={Images.noInternet} className={'mdToken-imgNoInternet'} />
              </div>
              : <div className="mdToken-wrapList">
                <div className="mdToken-headList">
                  <div className="hl-name">{t('Name')}</div>
                  <div className="hl-account">{t('Account')}</div>
                  <div className="hl-type">{t('type')}</div>
                </div>
                <List
                  className="mab-list-account"
                  dataSource={arrSearch}
                  renderItem={item => (
                    <List.Item className="mab-list-item">
                      <Popover
                        overlayClassName="md-Popover"
                        content={
                          AccountSelected && 
                          (activeCopied
                            ? <div className="md-bounce-Copied">
                              <img src={Images.md_copied}/>{t('Copied')}
                            </div>
                            : <div className="md-bounce-option">
                              <div className="md-option" onClick={activeEditAccount}><img src={Images.md_contract}/></div>
                              <div className="md-option" onClick={copyAccount}>
                                <div onClick={() => copyText(AccountSelected.address)}>
                                  <img src={Images.md_paper}/>
                                </div>
                              </div>
                              <div className="md-option" onClick={showQRCodeAccount}><img src={Images.md_QR}/></div>
                              <div className="md-option" onClick={removeAccount}><img src={Images.md_rubbish}/></div>
                            </div>
                          )
                        }
                        placement="topRight"
                        trigger="click"
                      >
                        <Button className="mab-list-wrapAll" onClick={() => onClickAccount(item)}>
                          <span className="mab-list-item-name">{item.name}</span>
                          <span className="mab-list-item-address">{item.address}</span>
                          <span className="mab-list-item-symbol">{item.symbol}</span>
                        </Button>
                      </Popover>
                    </List.Item>
                  )} />
              </div>
            }
          </div>
          <Modal ref="md_mab_add_address">
            <div className="md-mab-add-address">
              <div className="md-mab-add-address-header">
                <div className="pp-close" onClick={() => this.refs.md_mab_add_address.hide()}><img src={Images.close1} /></div>
                {isEditAccount ? t('EditAccount') : t('RegisterAccountBook')}
              </div>
              <div className="md-mab-add-address-content">
                <div className="md-mab-add-address-row md-mab-add-margin">
                  <span className="md-mab-add-address-label">{t('Account')}</span>
                  <HBInput
                    autoFocus={true}
                    countMax={42}
                    isError={isAccountError}
                    className="md-mab-add-address-txt mh-input-41"
                    messageError={accountErrorMsg}
                    value={txtAccount}
                    onChange={(txtAccount) => onChangeTxtAccount(txtAccount)}/>
                </div>
                <div className="md-mab-add-address-row">
                  <span className="md-mab-add-address-label">{t('AccountName')}</span>
                  <HBInput
                    isError={isAccountNameError}
                    className="md-mab-add-address-txt mh-input-41"
                    value={txtAccountName}
                    messageError = {t('AccountNameErrorMsg')}
                    onChange={(txtAccountName) => this.setState({txtAccountName: txtAccountName.length > 25 ? txtAccountName.substring(0, 25) : txtAccountName, isAccountNameError: false})}/>
                </div>
              </div>
              <div className="md-mab-add-address-footer">
                <div onClick={() => this.refs.md_mab_add_address.hide()} id="btnHover" className="md-mab-btnFooter">{t('cancel')}</div>
                <div id="btnHover" className={isValid ? 'md-mab-btnFooter md-btnBlue' : 'md-mab-btnFooter-disable md-btnBlue'} onClick={() => isValid && registerAccountBook()}>{isEditAccount ? t('update') : t('Register')}</div>
              </div>
            </div>
          </Modal>

          {/* <Modal ref="md_mab_account_actions">
            {AccountSelected &&
            <div className='nd-mab-account-actions-container'>
              <div className="md-mab-account-actions">
                <div className="md-mab-add-address-header">
                  <div className="pp-close" onClick={() => this.refs.md_mab_account_actions.hide()}><img src={Images.close1} /></div>
                  {AccountSelected.name}
                </div>
                <div className="md-mab-account-actions-content">
                  <div className="md-mab-text-center">{AccountSelected.symbol}</div>
                  <div className="md-mab-text-center">{AccountSelected.address}</div>
                  <div className="md-mab-account-actions-btn-group">
                    <div className="md-mab-btn-actions" onClick={activeEditAccount}>
                      <div className="md-mab-btn-actions-img">
                        <FaEdit size={25}/>
                      </div>{t('Edit')}</div>
                    <CopyToClipboard text={AccountSelected.address} >
                      <div className="md-mab-btn-actions" onClick={copyAccount}>
                        <div className="md-mab-btn-actions-img">
                          <FaCopy size={25}/>
                        </div>{t('Copy')}
                      </div>
                    </CopyToClipboard>
                    <div className="md-mab-btn-actions" onClick={showQRCodeAccount}>
                      <div className="md-mab-btn-actions-img">
                        <FaQrcode size={25} />
                      </div>QR</div>
                    <div className="md-mab-btn-actions" onClick={removeAccount}>
                      <div className="md-mab-btn-actions-img">
                        <FaTrash size={25}/>
                      </div>{t('Remove')}</div>
                  </div>
                </div>
              </div>
            </div>
            }
          </Modal>
           */}

          <Modal ref="modalTokenRequestReceive" className="md-mab-request">
            {AccountSelected &&
          <div className="wrapPopup-request">
            <div className="edt-md-header">
              <div className="pp-close" onClick={() => this.refs.modalTokenRequestReceive.hide()}><img src={Images.close1} /></div>
              {AccountSelected.name}
            </div>
            <div className="edt-md-center">
              <div className="edt-md-row-address" >{AccountSelected.address}</div>
              <div className="edt-md-row-address mgT-30">
                <div className="edt-md-qrCode">
                  <QRCode size={160} value = {AccountSelected.address} bgColor="#fff" fgColor="#1D2B47"/>
                </div>
              </div>
            </div>
          </div>
            }
          </Modal>

          <Modal ref="md_mab_confirm">
            {AccountSelected && <HBPopupConfirm 
              onOk={deleteAccount}
              onCancel={hideMdConfirm}
              header={t('RemoveAccount')}
              message={t('youWantToDelete')}
              t={t}/>
            }
          </Modal>
        </div>
      </div>
    )
  }

  renderDropdownFilter (arrTokenData, onChangeDropdown) {
    return (
      <Menu className='tk-dropdown-container mab-dropdown-container' onClick={(item) => onChangeDropdown(item)}>
        <Menu.Item className="mab-menu-item" title={'ETH'}>{'ETH'}</Menu.Item>
        {arrTokenData.map((token, index) => {
          return (
            <Menu.Item className="mab-menu-item" key={index} title={token.symbol}>{token.symbol}</Menu.Item>
          )
        })}
      </Menu>
    )
  }
}
