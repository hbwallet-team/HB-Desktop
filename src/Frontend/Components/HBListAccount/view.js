import React from 'react'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import HBCardEther from 'Frontend/Components/HBCardEther'
import HBSwitchAccount from 'Frontend/Components/HBSwitchAccount'
import Images from 'Assets/Image'
import { List, Tooltip } from 'antd'
import { HBCURRENCY_SYMBOL, HBCURRENCY } from 'Utils/globalConstants'
import './styles.css'

export default class HBListAccount extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      switchSelectItem: null
    }
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.defaultThis(this)
  }

  // click to switch account 
  onClickSwitchAccount = (itm) => () => this.props.handleSwitchAccount(itm)
  
  // Render card Item
  renderCardItem = (item) => {
    const { isLoadingCard } = this.state
    const { t, internetData } = this.props
    const { currency } = this

    return (
      <List.Item className='eth-list-item'>
        <Tooltip placement="top" title={item.isMain ? t('Ethereum.yourCurrentAccount') : ''}>
          <HBCardEther 
            item={item}
            isLoadingCard={isLoadingCard}
            internetData={internetData}
            currency={currency}
            openCardDetail={() => {}}
            t={t}
          />
          <div className="card-name" id="nameColor">
            {item.cardName === 'Main Account' ? t('mainAccount') : item.cardName}
          </div>
          {!item.isMain && 
          <div className="card-button">
            <button 
              className="btn-add-sub-acount" 
              onClick={this.onClickSwitchAccount(item)}
            >{t('Ethereum.switchAcount')}</button>
          </div>}
        </Tooltip>
      </List.Item>
    )
  }

  render () {
    const { arrCardData, onCloseModal, closeSwitchAccountModal, t } = this.props
    const { switchSelectItem } = this.state
    return (
      <React.Fragment>
        <div className="md-body md-large md-list-account">
          <div className="md-header">
            <div className="pp-close" onClick={onCloseModal}>
              <img src={Images.close} />
            </div>
            {t('Ethereum.switchAcount')}
          </div>
          <div className="md-content">
            <div className="eth-center-desc">{t('Ethereum.youCanSwitchAccount')}</div>
            {/* Display List card in wallet */}
            <div className="eth-center-container" id="HBScrollBar">
              <List
                className={'list-token'}
                split={false}
                dataSource={arrCardData.filter(card => card.isEnable)}
                renderItem={this.renderCardItem}/>
            </div>
          </div>
          <div className="md-footer">
            <div 
              id="btnHover" 
              className="md-mab-btnFooter"
              onClick={onCloseModal} 
            >{t('cancel')}</div>
          </div>
        </div>
        {/* Modal switch account */}
        <Modal ref="modalSwitchAccount">
          <HBSwitchAccount 
            cardSelected={switchSelectItem}
            onCloseModal={closeSwitchAccountModal}
          />
        </Modal>
      </React.Fragment>
    )
  }
}
