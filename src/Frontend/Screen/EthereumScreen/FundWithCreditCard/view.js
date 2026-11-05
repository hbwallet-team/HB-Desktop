import React from 'react'
import { HBInput } from '../../../Components/HBInput'
import { Menu, Dropdown, Icon, Row, Col } from 'antd'
import { ARR_HBCURRENCY, HBCURRENCY_SYMBOL } from '../../../../Utils/globalConstants'
import { Button } from 'react-bootstrap'
import './styles.css'

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)

    this.state = ({
      txtCurrency: ''
    })
  }

  render () {
    const { onChangeDropdown, arrCurrencyData, onChangeCurrency, t, backToAccountDetail,
      gotoPaymentView } = this.props
    const { txtCurrency } = this.state

    return (
      <div>
        <Row className="fwc-row-container">
          <Col span={2} offset={1}>
            <Dropdown overlay={this.renderDropdownFilter(onChangeDropdown)} trigger={['click']} placement="bottomCenter">
              <div className="fwc-dropdown" >
                <span className="mab-dropdown-token-text">{arrCurrencyData} </span> <Icon type="down" />
              </div>
            </Dropdown>
          </Col>
          <Col span={8}>
            <div className="fwc-txtCurrency">
              <HBInput
                value={txtCurrency}
                symbol={HBCURRENCY_SYMBOL[arrCurrencyData]}
                onChange={value => onChangeCurrency(value)}
              /></div>
          </Col>
        </Row>
        <Row className="fwc-row-container">
          <Col span={2} offset={1}>
            <div className="fwc-text-14">{t('youGet')}</div>
          </Col>
          <Col span={8}>
            <div className="fwc-amountEth">
              ~ 3.69079 <span className="fwc-text-14">ETH</span>
            </div>
          </Col>
        </Row>
        <Row className="fwc-row-container">
          <Col span={10} offset={1}>
            <div className="fwc-btn-group">
              <div className="fwc-container-btn-cancle">
                <Button onClick={backToAccountDetail} className="btn-init-screen edt-button">{t('cancel')}</Button>
              </div>
              <div className="fwc-container-btn-buy">
                <Button onClick={gotoPaymentView} className="btn-init-screen fwc-buy">{'Buy 80 USD of ETH'}</Button>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="fwc-row-container">
          <Col span={10} offset={1}>
            <div className="fwc-text-agree">{t('fwc_text_agree')}<u>{t('TermsAndConditions')}</u></div>
          </Col>
        </Row>
      </div>
    )
  }

  renderDropdownFilter (onChangeDropdown) {
    return (
      <Menu onClick={(item) => onChangeDropdown(item)}>
        {ARR_HBCURRENCY.map((curr, index) => {
          return (
            <Menu.Item className="mab-menu-item" key={index}>{curr.name}</Menu.Item>
          )
        })}
      </Menu>
    )
  }
}
