import React from 'react'
import { Row, Col } from 'antd'
import { Button } from 'react-bootstrap'
import { slideInRight } from 'react-animations'
import Radium, { StyleRoot } from 'radium'
import './styles.css'
import { HBCRYPTO, HBCURRENCY_SYMBOL, HBCURRENCY } from '../../../../Utils/globalConstants'
import { formatNumber, formatSmallNumber, filterMainAccount } from '../../../../Utils/globalFunction'
import { Spin } from 'Frontend/Components/HBLoader'
import Images from '../../../../Assets/Image'

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)
    this.state = {
      isLoadingExcute: false
    }
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
  }

  render () {
    const {
      arrCardData, cancelAction, sendAction, txtReceiveAddr,
      txtSendAmount, minerFee, fTokenConvert, fEthConvert, transactionFee,
      cardSelected, arrCurrencyData, t, THIS
    } = this.props
    const {
      isLoadingExcute
    } = this.state
    const mainAccount = filterMainAccount(arrCardData)

    return (
      <div className="styleRoot-container send-form confirmation-form" style={{pointerEvents: (isLoadingExcute ? 'none' : 'unset')}}>
        <div className="styleRoot-container">
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => cancelAction(THIS)}><img src={Images.close1} /></div>
            {t('confirmSend')}
          </div>
          <div className='edt-wrapInfor'>
            <Row className="edt-row-container">
              <Col span={5} offset={1}>
                <div className="edt-label-14-3">{t('senderAccount')}</div>
              </Col>
              <Col span={12}>
                <div className="edt-value-14">{mainAccount.address}</div>
              </Col>
            </Row>
            <Row className="edt-row-container edt-value-margin-top-5 ">
              <Col span={5} offset={1}>
                <div className="edt-label-14-3">{t('ReceiveAccount')}</div>
              </Col>
              <Col span={12}>
                <div className="edt-value-14">{txtReceiveAddr}</div>
              </Col>
            </Row>
            <Row className="edt-row-container edt-value-margin-top-5 ">
              <Col span={5} offset={1}>
                <div className="edt-label-14-3">{t('amount01')}</div>
              </Col>
              <Col span={12}>
                <div className="edt-value-confirm">{this.renderWETHFormat(Number(txtSendAmount), 8)}{' ' + cardSelected.symbol}</div>
                <div className="edt-value-confirmUSD">{this.currency}{this.renderWETHFormat(fTokenConvert * txtSendAmount, 2)}{' ' + arrCurrencyData}</div>
              </Col>
            </Row>
            <Row className="edt-row-container edt-value-margin-top-5 ">
              <Col span={5} offset={1}>
                <div className="edt-label-14-3">{t('Miner_Fee')}</div>
              </Col>
              <Col span={12}>
                <div className="edt-value-confirm">{formatNumber(Number(transactionFee), 8) + ' ' + HBCRYPTO.ETHEREUM} </div>
                <div className="edt-value-confirmUSD">{this.currency}{formatNumber(fEthConvert * transactionFee, 2)}</div>
              </Col>
            </Row>
          </div>
          <Row className="edt-row-container edt-value-margin-top-5 edt-bottomSpecial">
            <Col span={5} offset={1} className="cse-group-btn">
              <Button onClick={() => cancelAction(THIS)} className="btn-init-screen edt-button">{t('cancel')}</Button>
              <div className="edt-space"/>
              <Button disabled={isLoadingExcute} onClick={() => sendAction(THIS)} className="btn-init-screen edt-button cfs-center">{isLoadingExcute ? <Spin size={15} color={'white'}/> : t('Confirm')}</Button>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
  renderWETHFormat = (balance, decimals) => {
    const firstNumber = formatSmallNumber(balance, decimals).toString().split('.')[0]
    const secondNumber = formatSmallNumber(balance, decimals).toString().split('.')[1]
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
}
