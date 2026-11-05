import React from 'react'
import { Row, Col } from 'antd'
import { Button } from 'react-bootstrap'
import './styles.css'
import { HBCURRENCY_SYMBOL, HBCURRENCY, HBCRYPTO } from 'Utils/globalConstants'
import { Spin } from 'Frontend/Components/HBLoader'
import Images from 'Assets/Image'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'

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
    const { t, cancelAction, sendAction, txtReceiveAddr, txtSendAmount, transactionFee, fEthConvert, cardSelected, THIS } = this.props
    const { isLoadingExcute } = this.state

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
                <div className="edt-value-14">{cardSelected.address}</div>
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
                <div className="edt-value-confirm"><FormatBalance balance={txtSendAmount}/> {HBCRYPTO.ETHEREUM}</div>
                <div className="edt-value-confirmUSD">{this.currency}<FormatFiat balance={fEthConvert * txtSendAmount}/></div>
              </Col>
            </Row>
            <Row className="edt-row-container edt-value-margin-top-5 edt-marginTop">
              <Col span={5} offset={1}>
                <div className="edt-label-14-3">{t('Miner_Fee')}</div>
              </Col>
              <Col span={12}>
                <div className="edt-value-confirm"><FormatBalance balance={transactionFee}/> {HBCRYPTO.ETHEREUM}</div>
                <div className="edt-value-confirmUSD">{this.currency}<FormatFiat balance={fEthConvert * transactionFee}/></div>
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
}
