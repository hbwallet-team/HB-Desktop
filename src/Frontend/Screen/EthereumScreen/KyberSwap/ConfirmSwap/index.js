import React from 'react'
import Images from 'Assets/Image'
import { Spin } from 'Frontend/Components/HBLoader'
import FormatBalance from 'Frontend/Components/FormatBalance'

const ConfirmSwap = ({ THIS }) => {
  return (
    <div className="md-body md-confirm-swap">
      <div className="md-header">
        <div className="pp-close" onClick={THIS.props.closeModalConfirmSwap}>
          <img src={Images.close} />
        </div>
        {THIS.props.t('KyberSwap.confirmSwap')}
      </div>
      <div className="md-content">
        <div className="confirm-swap-balance">
          <div className="confirm-swap-block">
            <div className="confirm-swap-from">{THIS.props.t('KyberSwap.from')}</div>
            <FormatBalance balance={THIS.state.txtFrom}/> {THIS.state.sourceCoin.symbol}
          </div>
          <div className="confirm-swap-arrow">
            <img src={Images.ic_arrow_left}/>
          </div>
          <div className="confirm-swap-block">
            <div className="confirm-swap-from">{THIS.props.t('KyberSwap.to')}</div>
            <FormatBalance balance={THIS.state.txtTo}/> {THIS.state.outputCoin.symbol}
          </div>
        </div>
        <div className="confirm-swap-fee">
          <div className="confirm-swap-tx-fee">{THIS.props.t('transactionFee')}</div>
          <FormatBalance balance={THIS.state.transactionFee}/> ETH
        </div>
      </div>
      <div className="md-footer">
        <button 
          className="btn btn-default"
          onClick={THIS.props.closeModalConfirmSwap} 
        >{THIS.props.t('cancel')}</button> 
        <button 
          disabled={THIS.state.isSending}
          className="btn btn-primary"
          onClick={THIS.props.swapAction} 
        >{THIS.state.isSending 
            ? <Spin size={15} color={'white'}/> 
            : THIS.props.t('Confirm')
          }</button>
      </div>
    </div>
  )
}

export default ConfirmSwap
