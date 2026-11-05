import React from 'react'
import { HBCURRENCY_SYMBOL, HBCURRENCY } from 'Utils/globalConstants'
import Images from 'Assets/Image'
import { Radio, List } from 'antd'
import FormatFiat from 'Frontend/Components/FormatFiat'
const RadioGroup = Radio.Group

const MdSelectCurrency = ({ THIS }) => {
  const currency = THIS.props.arrCurrencyData === undefined
    ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
    : HBCURRENCY_SYMBOL[THIS.props.arrCurrencyData]
  const cryptoCurrency = [
    { 
      'value': 'ETH*', 
      'name': THIS.props.t('Ethereum'),
      'symbol': 'ETH',
      'price': THIS.props.etherPrice.price
    },
    { 
      'value': 'TUSD*', 
      'name': THIS.props.t('TrueUSD'),
      'symbol': 'TUSD',
      'price': THIS.trueUSDPrice
    },
    { 
      'value': 'DAI', 
      'name': THIS.props.t('Dai'),
      'symbol': 'DAI',
      'price': THIS.daiPrice
    }
  ]
  return (
    <div className="md-body">
      <div className="md-header">
        <div className="pp-close" onClick={THIS.props.onCloseSelectCurrencyModal}>
          <img src={Images.close} />
        </div>
        {THIS.props.t('Dapps.selectCryptoCurrency')}
      </div>
      <div className="md-content">
        <div className="slc-desc">{THIS.props.t('Dapps.selectCurrencyDesc')}</div>
        <div className="slc-box">
          <div className="slc-header">
            <div>{THIS.props.t('Dapps.cryptoCurrency')}</div>
            <div>{THIS.props.t('amount01')}</div>
          </div>
          <div className="slc-body">
            <RadioGroup onChange={THIS.props.onChangeCryptoCurrency} defaultValue={THIS.state.selectedCurrency}>
              <List
                dataSource={cryptoCurrency}
                renderItem={(item) => 
                  <List.Item>
                    <Radio value={item.value}>
                      <span>{item.name}</span>
                      <span>
                        1 {item.symbol}
                        <span className="slc-fiat">{currency}{<FormatFiat balance={item.price}/>}</span>
                      </span>
                    </Radio>
                  </List.Item>}
              />
            </RadioGroup>
          </div>
        </div>
        <div className="slc-desc">{THIS.props.t('Dapps.selectCurrencyNotice')}</div>
      </div>
      <div className="md-footer">
        <div 
          id="btnHover"
          className="md-mab-btnFooter"
          onClick={THIS.props.onCloseSelectCurrencyModal}>{THIS.props.t('cancel')}</div>
        <div 
          id="btnHover" 
          className="md-btn-add md-mab-btnFooter"
          onClick={THIS.props.openSendAssetSmartContractModal}>{THIS.props.t('Select')}</div>
      </div>
    </div>
  )
}

export default MdSelectCurrency
