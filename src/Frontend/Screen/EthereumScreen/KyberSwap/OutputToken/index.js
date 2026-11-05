import React from 'react'
import Images from 'Assets/Image'
import { HBInput } from 'Frontend/Components/HBInput'
import { List } from 'antd'

const OutputToken = ({ THIS }) => {
  let dataSource = THIS.state.arrSearch || THIS.props.arrKyberSwapToken
  dataSource = dataSource.filter(itm => itm.address.toLowerCase() !== THIS.state.sourceCoin.address.toLowerCase())
  return (
    <div className="md-body md-large md-output-token">
      <div className="md-header">
        <div className="pp-close" onClick={THIS.props.closeModalOutputToken}>
          <img src={Images.close} />
        </div>
        {THIS.props.t('KyberSwap.outputToken')}
      </div>
      <div className="md-content">
        <HBInput
          iconLeft={Images.search1}
          placeholder={THIS.props.t('KyberSwap.cryptoName')}
          value={THIS.state.txtSearchCoin}
          onChange={THIS.props.onSearchCoin}
        />
        {
          dataSource.length > 0
            ? <List
              id="HBScrollBar"
              className="kyber-swap-token"
              grid={{ gutter: 12, column: 3 }}
              dataSource={dataSource}
              renderItem={item => (
                <List.Item className={'kyber-swap-token-item' + (THIS.state.objSelectCoin.symbol === item.symbol ? ' selected' : '')} onClick={() => THIS.props.selectCoin(item)}>
                  <div className="kyber-swap-token-icon"><img src={item.symbol === 'ETH' ? Images.ic_eth_request : item.iconImage}/></div>
                  <div className="kyber-swap-token-name">{item.name} ({item.symbol})</div>
                  {THIS.state.objSelectCoin.symbol === item.symbol && <img src={Images.itemSelect} className="kyber-swap-selected-img"/>}
                </List.Item>
              )} />
            : <div className="kyber-swap-no-data">{THIS.props.t('NoData')}</div>
        }
      </div>
      <div className="md-footer">
        <button 
          className="btn btn-default"
          onClick={THIS.props.closeModalOutputToken} 
        >{THIS.props.t('cancel')}</button> 
        <button 
          className="btn btn-primary"
          onClick={THIS.props.onSelectOutputToken} 
        >{THIS.props.t('Select')}</button>
      </div>
    </div>
  )
}

export default OutputToken
