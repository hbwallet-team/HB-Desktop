import React from 'react'
import Images from 'Assets/Image'
import { Row, Col } from 'antd'
import HBGasSlider from 'Frontend/Components/HBGasSlider'
import Settings from 'Backend/settings'
import { Spin } from 'Frontend/Components/HBLoader'

export default class HBSpeedUpTxs extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      transactionFee: 0,
      gasInput: 0,
      gasLimit: Settings.gas.externalFeeToken,
      gasPrice: props.gasStation,
      isLoadingExcute: false
    }
    props.defaultThis(this)
  }
  componentDidMount () {
    this.props.loadingInitial()
  }
  render () {
    return (
      <div className="md-body md-send-asset">
        <div className="md-header">
          <div className="pp-close" onClick={this.props.onCloseModal}>
            <img src={Images.close} />
          </div>
          {this.props.t('History.speedUp')}
        </div>
        <div className="md-content">
          <Row>
            <Col span={24}>{this.props.t('Ethereum.changeGasPrice')}</Col>
          </Row>
          <Row>
            <Col span={5}>
              <div className="md-accountName">{this.props.t('GasPRICE')}</div>
            </Col>
            <Col span={19}>
              <HBGasSlider
                transactionFee={this.state.transactionFee}
                gasInput={this.state.gasInput}
                gasLimit={this.state.gasLimit}
                gasPrice={this.state.gasPrice}
                gasDefault={this.state.gasPrice.slow + 5}
                handleResult={this.props.handleChangeGasPrice}
                t={this.props.t}
              />
            </Col>
          </Row>
        </div>
        <div className="md-footer">
          <button 
            id="btnHover" 
            className="md-mab-btnFooter"
            onClick={this.props.onCloseModal} 
          >{this.props.t('cancel')}</button>
          <button 
            id="btnHover" 
            disabled={this.state.isLoadingExcute}
            className={'md-btn-add md-mab-btnFooter'} 
            onClick={() => this.props.sendAction()}
          >{this.state.isLoadingExcute ? <Spin size={15} color={'white'}/> : this.props.t('Send')}</button>
        </div>
      </div>
    )
  }
}
