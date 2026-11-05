import React from 'react'
import './styles.css'
import { Row, Col, Dropdown, Icon, Menu, Tooltip } from 'antd'
import { HBInput } from '../../../Components/HBInput'
import { zeroPadLeft } from '../../../../Utils/globalFunction'
import Images from '../../../../Assets/Image'

const MONTHS = ['12',
  '11', '10',
  '09', '08',
  '07', '06',
  '05', '04',
  '03', '02',
  '01']

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)
    this.state = ({
      txtNameCard: '',
      txtCardNumber: '',
      txtCVC: '',
      monthSelected: '',
      yearSelected: '',
      isSaveCard: true,
      isSetPrimary: false,
      isEnableBtnSave: true,
      isCVCErr: false,
      isCardNumberErr: 0
    })
    this.renderDropdownMonth = this.renderDropdownMonth.bind(this)
    this.renderDropdownYear = this.renderDropdownYear.bind(this)
  }

  componentWillMount () {
    this.setState({
      monthSelected: zeroPadLeft(String(new Date().getMonth() + 1), 2),
      yearSelected: String(new Date().getFullYear())
    })
  }

  renderDropdownMonth () {
    const { monthSelected } = this.state
    const { onChangeMonth } = this.props
    return (
      <Menu className="npm-menu-dropdown" onClick={(m) => onChangeMonth(m)} >
        {MONTHS.map((m, index) => {
          return (
            m === monthSelected
              ? <Menu.Item className='npm-menu-item-selected' key={m}>{m}</Menu.Item>
              : <Menu.Item className='npm-menu-item' key={m}>{m}</Menu.Item>
          )
        })}
      </Menu>
    )
  }
  renderDropdownYear () {
    const { yearSelected } = this.state
    const { onChangeYear } = this.props
    return (
      <Menu className="npm-menu-dropdown" onClick={(m) => onChangeYear(m)}>
        {this.renderYear().map((m, index) => {
          return (
            m === yearSelected
              ? <Menu.Item className="npm-menu-item-selected" key={m}>{m}</Menu.Item>
              : <Menu.Item className="npm-menu-item" key={m}>{m}</Menu.Item>
          )
        })}
      </Menu>
    )
  }

  renderYear () {
    let years = []
    var currentYear = new Date().getFullYear()
    for (let i = currentYear; i <= currentYear + 50; i++) {
      years.push(String(i))
    }
    return years
  }

  render () {
    const {
      t, onChangeNameOnCard, onChangeCardNumber, onChangeCVC, saveThisCard,
      setAsPrimary, backToAccountDetail, payment
    } = this.props

    const {
      txtNameCard, txtCardNumber, txtCVC, isCVCErr, monthSelected, yearSelected,
      isSaveCard, isSetPrimary, isEnableBtnSave, isCardNumberErr
    } = this.state

    return (
      <div className="pm-container">
        <div className="npm-text-payment fwc-text-14">A payment of $80 will be charged to this card.</div>
        <div className='npm-content'>
          <div className="npm-content-left">
            <Row className="edt-row-container">
              <Col span={6}>
                <div className="edt-label-14">{'NAME ON CARD'}</div>
              </Col>
              <Col span={18}>
                <HBInput
                  value={txtNameCard}
                  onChange={(value) => onChangeNameOnCard(value)}/>
              </Col>
            </Row>
            <Row className="edt-row-container">
              <Col span={6}>
                <div className="edt-label-14">{'CARD NUMBER'}</div>
              </Col>
              <Col span={18}>
                <HBInput
                  isError={isCardNumberErr !== 0}
                  messageError={isCardNumberErr === 1 ? 'We currently support Visa or Master Card' : isCardNumberErr === 2 ? 'Your credit card number is not valid' : null}
                  value={txtCardNumber}
                  onChange={(value) => onChangeCardNumber(value)}/>
              </Col>
            </Row>
            <Row className="edt-row-container npm-row-margin-bottom">
              <Col span={6}>
                <div className="edt-label-14">{'EXPIRES'}</div>
              </Col>
              <Col span={4}>
                <Dropdown overlay={this.renderDropdownMonth()} trigger={['click']} placement="bottomCenter">
                  <div className="npm-dropdown-month" >
                    <span className="npm-dropdown-token-text">{monthSelected} </span> <Icon type="down" className="npm-down-icon"/>
                  </div>
                </Dropdown>
              </Col>
              <Col span={4} className="npm-dropdown-margin-left">
                <Dropdown overlay={this.renderDropdownYear()} trigger={['click']} placement="bottomCenter">
                  <div className="npm-dropdown-month" >
                    <span className="npm-dropdown-token-text">{yearSelected} </span> <Icon type="down" className="npm-down-icon" />
                  </div>
                </Dropdown>
              </Col>
            </Row>
            <Row className="edt-row-container">
              <Col span={6}>
                <div className="edt-label-14">{'CVC'}</div>
              </Col>
              <Col span={4}>
                <HBInput
                  isError={isCVCErr}
                  // messageError='Your CVC is not valid'
                  value={txtCVC}
                  onChange={(value) => onChangeCVC(value)}/>
              </Col>

              <Col span={2}>
                <div className="npm-explain-cvc-tooltip">
                  <Tooltip placement="right" title={<div style={{
                    textAlign: 'justify',
                    padding: '5px 5px 5px 5px',
                    fontFamily: 'var(--font-roboto)',
                    fontSize: '14px'}}>
                    {t('CVCTooltip')}</div>}>
                    <img alt='img' src={Images.ic_question}/>
                  </Tooltip>
                </div>
              </Col>
              <Col span={8}>
                <div className='npm-cvc-err-mess'>{isCVCErr ? 'Your CVC is not valid' : ''}</div>
              </Col>
            </Row>
            <Row className="edt-row-container">
              <Col span={6}>
                <div className="edt-label-14">{'SAVE THIS CARD'}</div>
              </Col>
              <Col span={2}>
                <div className='npm-save-card checkbox-input' id={isEnableBtnSave ? 'btnScale-active' : 'btnDisable'} onClick={saveThisCard}>
                  {isSaveCard
                    ? <img alt='img' src={Images.btn_circle_check}/>
                    : <img alt='img' src={Images.btn_circle_uncheck}/>}
                </div>
              </Col>
            </Row>
            <Row className="edt-row-container npm-row-margin-bottom-20">
              <Col span={6}>
                <div className="edt-label-14">{'SET AS PRIMARY'}</div>
              </Col>
              <Col span={2}>
                <div className='npm-save-card' id={'btnScale-active'} onClick={setAsPrimary}>
                  {isSetPrimary
                    ? <img alt='img' src={Images.toggle_selected}/>
                    : <img alt='img' src={Images.toggle}/>}
                </div>
              </Col>
            </Row>
            <Row className="edt-row-container npm-row-margin-bottom-20">
              <Col span={24}>
                <div className="npm-notes">Notes: All charges are in USD</div>
              </Col>
            </Row>
            <Row className="edt-row-container">
              <Col span={18} offset={6}>
                <div className="npm-btn-group">
                  <div className="fwc-container-btn-cancle">
                    <button onClick={backToAccountDetail} className="btn-init-screen edt-button">{t('cancel')}</button>
                  </div>
                  <div className="fwc-container-btn-buy">
                    <button disabled={isCardNumberErr !== 0} onClick={payment} className={'btn-init-screen fwc-buy'}>{'Charge This Card'}</button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <div className="npm-secure-form">
            <div className="npm-secure-content">
              <div className="npm-secure-row1">
                <div className="npm-label-14-bold">{'Secure Payment Form'}</div>
                <img alt='img' src={Images.ic_Lock}/>
              </div>
              <div className="npm-secure-row2">
                <img alt='img' src={Images.ic_masterCard}/> <span style={{width: '5px'}}/>
                <img alt='img' src={Images.ic_visaCard}/>
              </div>
              <div className="npm-secure-row2">
                <div className="npm-label-14-bold">{'Security Assurance'}</div>
              </div>
              <div className="npm-secure-row2">
                <div className="npm-label-14-justify">{'Your billing information is not stored by us, and is transferred over an encrypted connection to certified third party payment processing servers.'}</div>
              </div>
              <div className="npm-secure-row3">
                <div className="npm-label-14-justify">{'The technology is the same used by online banking, so you can rest assured that it’s safe.'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
