import React from 'react'
import './styles.css'
import { Row, Col, Button } from 'antd'
import { HBCURRENCY_SYMBOL, HBCURRENCY } from '../../../../../../../Utils/globalConstants'
import { formatNumber } from '../../../../../../../Utils/globalFunction'

export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.funcDefaultThis(this)
  }
  render () {
    const { objDataPreview, onAddNewToken, onCancel, t } = this.props
    let countClickSend = 0
    let setOnlyOneClick = () => {
      countClickSend++
      if (countClickSend === 1) {
        onAddNewToken()
      }
    }
    return (
      <div className="its-container">
        <Row>
          <Col lg={11} xl={11}>
            <img className="its-container-img" src={objDataPreview[0].cardImage}/>
          </Col>
          <Col lg={13} xl={13} className="its-container-info-row">
            <div className="its-container-info-txt-name">{objDataPreview[0].name}</div>
            <div className="its-container-info-txt">{formatNumber(objDataPreview[0].balance, 2) + ' ' + this.currency}</div>
            <div className="its-container-info-txt">{objDataPreview[0].address}</div>
          </Col>
        </Row>
        <Row className="its-container-row">
          <Col lg={8} xl={8} >
            <div className="its-container-row-col-btn">
              <Button onClick={() => onCancel()} className="its-container-btn">
                <div className="its-container-btn-txt">
                  {t('cancel')}
                </div>
              </Button>
              <Button onClick={() => setOnlyOneClick()} className="its-container-btn">
                <div className="its-container-btn-txt">
                  {t('ok')}
                </div>
              </Button>
            </div>
          </Col>
          <Col lg={16} xl={16}></Col>
        </Row>
      </div>
    )
  }
}
