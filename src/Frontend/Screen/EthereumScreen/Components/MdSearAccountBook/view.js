
import Images from 'Assets/Image'
import React from 'react'
import { List, Dropdown, Icon, Menu } from 'antd'
import { HBInput } from 'Frontend/Components/HBInput'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import { HBCRYPTO } from 'Utils/globalConstants'

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)
    this.state = ({
      txtAccountName: '',
      isExistAddress: false,
      isAccountError: false,
      isAccountNameError: false,
      txtAccount: '',
      accountErrorMsg: '',
      strSearchAccount: '',
      strFilter: HBCRYPTO.ETHEREUM
    })
  }

  componentWillMount () {
    this.props.filter(this.state.strFilter, this.state.txtSearch)
  }

  render () {
    const { t, searchAccountBook, selectAccountBook, arrAddressBook, showMdAddAddress, onChangeDropdown, arrTokenData, that, onChangeTxtAccount, registerAccountBook } = this.props
    const { txtAccountName, isExistAddress, isAccountError, isAccountNameError, accountErrorMsg, txtAccount, strSearchAccount, strFilter } = this.state

    // let arrSearchAccountBook = arrAddressBook.filter(item => item.name.toLowerCase().includes(strSearchAccount.toLowerCase()))
    let arrSearchAccountBook = arrAddressBook.filter(account =>
      (account.symbol === strFilter) &&
      (account.name.toLowerCase().includes(strSearchAccount.toLowerCase()))
    )
    const isValid = txtAccountName.length > 0 && txtAccount.length > 0 && !isAccountError && !isAccountNameError
    return (
      <div className="mdToken-body">
        <div className="mdToken-header">
          <div className={'mdToken-txtToken'}>
            <div className="pp-close" onClick={() => that.refs.modalAccountBook.hide()}><img src={Images.close1} /></div>
            {t('searchAccount')}
          </div>
        </div>
        <div className="md-accb-content">
          <div className="md-accb-top">
            <span className="mab-btn-add" id="btnHover" onClick={() => showMdAddAddress()}><img className="mab-add_button" src={Images.add_button} /></span>
            <div className='inputSearch-Container'>
              <HBInput
                iconLeft={Images.search1}
                placeholder={t('search')}
                value={strSearchAccount}
                className='inputSearch-Token'
                onChange={searchAccountBook}
                autoFocus={true}
              />
            </div>
            <Dropdown overlay={this.renderDropdownFilter(arrTokenData, onChangeDropdown)} trigger={['click']} placement="bottomCenter">
              <div className="mab-dropdown-token popupDropdown" >
                <span className="mab-dropdown-token-text">{strFilter} </span> <Icon type="down" />
              </div>
            </Dropdown>
          </div>
          {arrSearchAccountBook.length === 0
            // ? <div className="mab-list-no-data">{t('NoData')}</div>
            ? <div className="mdToken-noInternet">
              <img alt='img' src={Images.noInternet} className={'mdToken-imgNoInternet'} />
              <div className="txtNoResult">{t('noResult')}</div>
            </div>
            : <div className="mdToken-listToken">
              <div className="mdToken-headList">
                <div className="hl-name">{t('AccountName')}</div>
                <div className="hl-account">{t('Account')}</div>
                <div className="hl-type">{t('type')}</div>
              </div>
              <List
                id="HBScrollBar"
                className="mab-list-account"
                dataSource={arrSearchAccountBook}
                renderItem={item => (
                  <List.Item className="mab-list-item" onClick={() => selectAccountBook(item)}>
                    <span className="mab-list-item-name">{item.name}</span>
                    <span className="mab-list-item-address">{item.address}</span>
                    <span className="mab-list-item-symbol">{item.symbol}</span>
                  </List.Item>
                )} />
            </div>
          }
        </div>
        <div className="md-footer">
          <div onClick={() => that.refs.modalAccountBook.hide()} id="btnHover" className="md-mab-btnFooter">{t('cancel')}</div>
        </div>
        <Modal ref="md_mab_add_address">
          <div className="md-mab-add-address">
            <div className="md-mab-add-address-header">
              <div className="pp-close" onClick={() => this.refs.md_mab_add_address.hide()}><img src={Images.close1} /></div>
              {t('RegisterAccountBook')}
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
              <div id="btnHover" className={isValid ? 'md-mab-btnFooter md-btnBlue' : 'md-mab-btnFooter-disable md-btnBlue'} onClick={() => isValid && registerAccountBook()}>{t('Register')}</div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
  renderDropdownFilter = (arrTokenData, onChangeDropdown) => {
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
