import React from 'react'
import Images from 'Assets/Image'
import { Row, Col, Checkbox, Dropdown, Menu } from 'antd'
import { Spin } from 'Frontend/Components/HBLoader'
import HBGasSlider from 'Frontend/Components/HBGasSlider'
import { openBrowserInNewTab } from 'Utils/globalFunction'
 
const MdBuyAsset = ({ THIS }) => {
  const termServicesAction = (
    <Menu className="terms-service-dropdown">
      <Menu.Item key="0">{THIS.props.t('Dapps.buyer')}</Menu.Item>
      <Menu.Item key="1">{THIS.props.t('Dapps.seller')}</Menu.Item>
      <Menu.Item key="2">{THIS.props.t('Dapps.sendViaSmartContract')}</Menu.Item>
    </Menu>
  )
  return (
    <div className="md-body md-send-asset">
      <div className="md-header">
        <div className="pp-close" onClick={THIS.props.onCloseBuyAssetModal}>
          <img src={Images.close} />
        </div>
        {THIS.props.t('Dapps.buyAsset')}
      </div>
      <div className="md-content">
        <Row>
          <Col span={24}>{THIS.props.t('Dapps.areYouSureToBuyAsset')}</Col>
        </Row>
        <Row>
          <Col span={5}>
            <div className="md-accountName">{THIS.props.t('GasPRICE')}</div>
          </Col>
          <Col span={19}>
            <HBGasSlider
              transactionFee={THIS.state.transactionFee}
              gasInput={THIS.state.gasInput}
              gasLimit={THIS.state.gasLimit}
              gasPrice={THIS.state.gasPrice}
              gasDefault={THIS.state.gasPrice.slow + 5}
              handleResult={THIS.props.handleChangeGasPriceBuyAsset}
              t={THIS.props.t}
            />
          </Col>
        </Row>
        <Row className="md-termServices">
          <Col span={5}></Col>
          <Col span={19}>
            <div className='dapp-term-services'
              onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/nft-term')}
            >{THIS.props.t('Dapps.termOfServices')}</div>
            {/* <Dropdown overlay={termServicesAction} trigger={['click']} placement="topLeft">
              <div className="dapp-term-services">{THIS.props.t('Dapps.termOfServices')}</div>
            </Dropdown> */}
            <Checkbox onChange={THIS.props.onChangeAgreeTermsOfServices} checked={THIS.state.isAgreeTermsOfServices}>{THIS.props.t('Dapps.agreeTermOfServices')}</Checkbox>
          </Col>
        </Row>
      </div>
      <div className="md-footer">
        <button 
          id="btnHover"
          className="md-mab-btnFooter"
          onClick={THIS.props.onCloseBuyAssetModal}>{THIS.props.t('cancel')}</button>
        <button 
          id="btnHover" 
          className="md-btn-add md-mab-btnFooter"
          disabled={!THIS.state.isActiveSend}
          onClick={THIS.props.buyAsset}>
          {THIS.state.isSending 
            ? <Spin size={15} color={'white'}/> 
            : THIS.props.localeData === 'jp' ? THIS.props.t('buy1') : THIS.props.t('buy')
          }</button>
      </div>
    </div>
  )
}

export default MdBuyAsset
