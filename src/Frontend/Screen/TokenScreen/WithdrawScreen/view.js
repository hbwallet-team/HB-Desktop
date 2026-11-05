import React from 'react'
import { StyleRoot } from 'radium'
import './styles.css'
import { Spin } from 'Frontend/Components/HBLoader'
import { Button } from 'react-bootstrap'
import { formatNumber, formatSmallNumber } from 'Utils/globalFunction'

export default class WithdrawScreen extends React.Component {
  // ================START=================
  //    Start region for lifeCycle function
  // ======================================
  constructor (props) {
    super(props)
    this.state = {
      isLoadingExcute: false,
      ethAmount: 0
    }
    props.defaultThis(this)
  }
  componentWillMount () {
    this.props.initialData()
  }
  // ================END===================
  //    End region for lifeCycle function
  // ======================================
  // |------------------------------|
  // |--- RENDER MAIN VIEW START ---|
  // |------------------------------|
  render () {
    const { isLoadingExcute, ethAmount } = this.state
    const { cancelAction, t, withdrawAction } = this.props
    return (
      <StyleRoot className="styleRoot-container send-form confirmation-form for-withdraw"
        style={{pointerEvents: (isLoadingExcute ? 'none' : 'unset')}}>
        <div className="styleRoot-container wtd-container">
          <div className="wtd-container-text">
            <div className="wtd-txt-title">{t('withdraw')}</div>
            <div className="wtd-txt-wrap-tip">
              <div className="wtd-txt-tip">{t('tipWithdraw')}</div>
              <div className="wtd-txt-amount-symbol"><span className="wtd-txt-amount">{this.renderWETHFormat(ethAmount, 8)}</span>{' ETH'}</div>
            </div>
          </div>
          <div className="wtd-container-button">
            <Button onClick={cancelAction} className="btn-init-screen edt-button">{t('cancel')}</Button>
            <Button disabled={isLoadingExcute || ethAmount === 0} onClick={withdrawAction} className="btn-init-screen edt-button cfs-center">{isLoadingExcute ? <Spin size={15} color={'white'}/> : t('withdraw')}</Button>
          </div>
        </div>
      </StyleRoot>
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
