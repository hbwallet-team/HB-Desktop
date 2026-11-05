import React from 'react'
import { Row, Col, Menu, Radio, Checkbox } from 'antd'
import { HBInput } from 'Frontend/Components/HBInput'
import { HBCURRENCY_SYMBOL, HBCURRENCY } from 'Utils/globalConstants'
import { formatNumber, roundingNumber, openBrowserInNewTab } from 'Utils/globalFunction'
import { Spin } from 'Frontend/Components/HBLoader'
import { Wave } from 'better-react-spinkit'
import Images from 'Assets/Image'
import HBImage from 'Frontend/Components/HBImage'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'

const MdSendAssetSmartContract = ({ THIS }) => {
  const { t, localeData, getCommisionFee } = THIS.props
  const { selectedCoin, priceGame, highlightFee, commissionFee, crypto, showBuyHBtoken, strSendAmount, isViaSmartContract, isChangePrice, isAlreadyHighlight, isHighlight, totalPaymentAmount, totalPaymentUSD, sentComissionFee, isSentRequest, isOnStore, limitHBForSale } = THIS.state
  const isActiveHighlight = isViaSmartContract ? false : (isChangePrice ? (!isAlreadyHighlight && isOnStore) : true)
  const percentDiscount = getCommisionFee() * 100
  const currency = THIS.props.arrCurrencyData === undefined
    ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
    : HBCURRENCY_SYMBOL[THIS.props.arrCurrencyData]
  const termServicesAction = (
    <Menu className="terms-service-dropdown">
      <Menu.Item key="0" onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/nft-term')}>{THIS.props.t('Dapps.buyer')}</Menu.Item>
      <Menu.Item key="1" onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/nft-term')}>{THIS.props.t('Dapps.seller')}</Menu.Item>
      <Menu.Item key="2" onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/nft-term')}>{THIS.props.t('Dapps.sendViaSmartContract')}</Menu.Item>
    </Menu>
  )
  return (
    <React.Fragment>
      <div className="dapp-search">
        <div className="dapp-back" onClick={THIS.props.backToAssetDetail}>
          <img className="img-back" alt="imgBack" src={Images.tabNaviBack} />
          {t('back')}
        </div>
      </div>
      <div className="dapp-left-body">
        <div className="sendNFT-wrap">
          <div className="sts-container sendNFT-scroll">
            <div className="sts-header">
              <div className="sts-header-title">{isViaSmartContract ? t('Dapps.sendAsset') : (isChangePrice ? t('Dapps.changePrice') : t('Dapps.sellAsset'))}</div>
            </div>
            <div className="md-content md-send-smart-contract" id="HBScrollBar">
              {isViaSmartContract &&
                <div>
                  <div className="sendNFT-buyer">{t('Dapps.BuyerAddress')}</div>
                  <Row className="editPaddingBottom2">
                    <Col span={7}>
                      <div className="md-receiver-account">
                        {t('ReceiveAccount')}
                      </div>
                    </Col>
                    <Col span={17}>
                      <HBInput
                        className={'receiver-asset'}
                        autoFocus={true}
                        icon={Images.ic_contacts1}
                        onClickIcon={THIS.props.openAddressBook}
                        isError={THIS.state.isReceiverErr}
                        isSpacing={true}
                        countMax={42}
                        messageError = {THIS.state.isSameAccount ? t('Dapps.isSameAccount') : t('errorAddress42')}
                        value={THIS.state.strReceiverAddr}
                        onChange={THIS.props.onChangeReceiverAddr}
                      />
                    </Col>
                  </Row>
                </div>
              }
              {
                isChangePrice &&
                  <Row>
                    <Col span={7}>
                      <div className="md-accountName">{t('Dapps.oldPrice')}</div>
                    </Col>
                    <Col span={17}><FormatBalance balance={priceGame}/> {selectedCoin.symbol}</Col>
                  </Row>
              }
              {
                isChangePrice &&
                  <Row>
                    <Col span={7}>
                      <div className="md-accountName">{t('Dapps.sentCommissionFee')}</div>
                    </Col>
                    <Col span={17}><FormatBalance balance={sentComissionFee}/> {selectedCoin.symbol}</Col>
                  </Row>
              }
              <div className={'sendNFT-buyer ' + ((isViaSmartContract || isChangePrice) ? 'borderTop1px' : '')}>{t('Dapps.SellingPrice')}</div>
              <Row>
                <Col span={7}>
                  <div className="md-accountName">
                    {t(isChangePrice ? 'Dapps.newPrice' : 'Dapps.amount', { token: selectedCoin.name })}
                  </div>
                </Col>
                <Col span={17}>
                  <HBInput
                    symbol={selectedCoin.symbol}
                    isSpacing={true}
                    value={strSendAmount}
                    onChange={THIS.props.onChangeEthereumAmount}
                  />
                </Col>
              </Row>
              <Row className="md-bottom15px">
                <Col span={7}>
                  <div className="md-accountName">
                    {t(isChangePrice ? 'Dapps.newFiatPrice' : 'amount', { arrCurrencyData: THIS.props.arrCurrencyData })}
                  </div>
                </Col>
                <Col span={17}>
                  <HBInput
                    symbol={THIS.props.arrCurrencyData}
                    value={THIS.state.strFiatAmount}
                    onChange={THIS.props.onChangeCurrencyAmount}
                  />
                </Col>
              </Row>
              <div className="sendNFT-buyer borderTop1px">{t('Dapps.Fee')}</div>
              {
                // !isChangePrice || (isChangePrice && showBuyHBtoken) 
                //   ? <Row className="md-padding9px" style={{ alignItems: 'flex-start' }}>
                //     <Col span={7}>
                //       {!isChangePrice && <div className="md-commissionFee top8px">
                //         {t('Dapps.Currency')}
                //       </div>}
                //     </Col>
                //     <Col span={17}>
                //       <div className="commission-wrapper">
                //         {!isChangePrice && <Select
                //           defaultValue={'ETH'}
                //           value={THIS.state.paymentType}
                //           onChange={THIS.props.onChangePaymentType}
                //         >
                //           {payment.map(item =>
                //             <Option value={item} key={item}>{item}</Option>)}
                //         </Select>}
                //         {showBuyHBtoken && <div className="commission-link" onClick={THIS.props.clickToHBWALLET}>{t('Dapps.buyHBtoken')}</div>}
                //       </div>
                //     </Col>
                //   </Row>
                //   : null
              }
              {
                // !isChangePrice || (isChangePrice && showBuyHBtoken) 
                //   ? <Row className="md-padding9px" style={{ alignItems: 'flex-start' }}>
                //     <Col span={7}></Col>
                //     <Col span={17}>
                //       <div className="commission-wrapper md-discount">
                //         {t('gc-discounted')}
                //       </div>
                //     </Col>
                //   </Row>
                //   : null
              }
              <Row className="md-padding9px" style={{ alignItems: 'flex-start' }}>
                <Col span={7}>
                  <div className="md-commissionFee">
                    {t('spendAble')}
                  </div>
                </Col>
                <Col span={17}>
                  <div className="commission-wrapper">
                    <div className="commission-fee">
                      <div className="commission-amount">{
                        THIS.state.isLoadingSpendable 
                          ? <Wave size={15} color={'white'} />
                          : <div>{<FormatBalance balance={selectedCoin.symbol === 'ETH' ? THIS.fWalletBalance : THIS.fTokenBalance}/>} {selectedCoin.symbol}</div>
                      }
                      </div>
                    </div>
                    {THIS.state.isSendAmountErr && <div className="commission-err">{t('Dapps.insufficientBalance')}</div> }
                  </div>
                </Col>
              </Row>
              {isActiveHighlight && 
                <Row className="md-padding9px sendNFT-editRow1" style={{ alignItems: 'flex-start' }}>
                  <Col span={7}>
                    <div className="md-commissionFee">
                      {t('Dapps.HighlightFee1')}
                    </div>
                  </Col>
                  <Col span={17}>
                    <div className="checkBoxNFT-wrapper">
                      <Radio onClick={() => THIS.props.checkBoxNFT(false)} checked={!isHighlight}>{localeData === 'jp' ? t('No1') : t('No')}</Radio>
                      <Radio onClick={() => THIS.props.checkBoxNFT(true)} checked={isHighlight}>{localeData === 'jp' ? t('Yes1') : t('Yes')}</Radio>
                    </div>
                  </Col>
                </Row>
              }
              {isActiveHighlight && 
                <Row className="md-padding9px" style={{ alignItems: 'flex-start' }}>
                  <Col span={7}>
                    <div className="md-commissionFee">
                      {t('Dapps.HighlightFee2')}
                    </div>
                  </Col>
                  <Col span={17}>
                    <div className="checkBoxNFT-wrapper">
                      <div className={'checkBoxNFT-img ' + (isHighlight ? 'activeHighlight' : '')}>
                        {
                          THIS.props.selectedItem.image && THIS.props.selectedItem.image.length > 0
                            ? <div className="dapp-asset-thumbnail"><HBImage logo={THIS.props.selectedItem.image} imgDefault={Images.ic_default_monster} addClass={'dapp-width149'}/></div>
                            : <div className="dapp-asset-thumbnail">
                              <img src={Images.ic_default_monster}/>
                              <div className="dapp-asset-no-img">{t('Dapps.thisItemHasNoImage')}</div>
                            </div>
                        }
                      </div>
                      <div className="commission-fee">
                        <div className="commission-amount"><FormatBalance balance={isHighlight ? highlightFee : 0}/> {selectedCoin.symbol}</div>
                        <div className="commission-fiat">{currency}<FormatFiat balance={isHighlight ? highlightFee * THIS.fRate : 0}/></div>
                      </div>
                    </div>
                  </Col>
                </Row>
              }
              <Row className="md-padding9px" style={{ alignItems: 'flex-start' }}>
                <Col span={7}>
                  <div className="md-commissionFee exs-color-yellow">
                    {isChangePrice ? t('Dapps.extraFee') : t('Dapps.commissionFee', {SendFee: roundingNumber(percentDiscount, 2)})}
                  </div>
                </Col>
                <Col span={17}>
                  <div className="commission-wrapper">
                    <div className="commission-fee">
                      <div className="commission-amount"><FormatBalance balance={commissionFee}/> {selectedCoin.symbol}</div>
                      <div className="commission-fiat">{currency}<FormatFiat balance={commissionFee * THIS.fRate}/></div>
                    </div>
                  </div>
                  <div className="comission-desc">{t(`Dapps.${isChangePrice ? 'changePriceNote' : 'commissionDesc'}`, { HBLimit: formatNumber(limitHBForSale, 2) })}</div>
                </Col>
              </Row>
              {!isViaSmartContract &&
                <Row className="md-padding9px" style={{ alignItems: 'flex-start' }}>
                  <Col span={7}>
                    <div className="md-commissionFee exs-color-yellow">
                      {t('Dapps.TotalPayment')}
                    </div>
                  </Col>
                  <Col span={17}>
                    <div className="commission-wrapper">
                      <div className="commission-fee">
                        <div className="commission-amount"><FormatBalance balance={totalPaymentAmount}/> {selectedCoin.symbol}
                        </div>
                        <div className="commission-fiat">{currency}<FormatFiat balance={totalPaymentUSD}/>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              }
              <div className="line1px"></div>
              {(!isViaSmartContract && !isChangePrice) && 
                <Row>
                  <Col span={7} className="editSeftTop">
                    <div className="md-receiver-account">
                      {t('Dapps.comment')}
                    </div>
                  </Col>
                  <Col span={17}>
                    <textarea value={THIS.state.strMessage} onChange={THIS.props.getTextArea} className='sendNFT-textarea' maxLength={250}/>
                  </Col>
                </Row>
              }
              <Row className="md-padding9px md-termServices">
                <Col span={7}></Col>
                <Col span={17}>
                  <div className='dapp-term-services'
                    onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/nft-term')}
                  >{t('Dapps.termOfServices')}</div>
                  {/* <Dropdown overlay={termServicesAction} trigger={['click']} placement="topLeft">
                    <div className="dapp-term-services">{THIS.props.t('Dapps.termOfServices')}</div>
                  </Dropdown> */}
                  <Checkbox onChange={THIS.props.onChangeAgreeTermsOfServices} checked={THIS.state.isAgreeTermsOfServices}>{THIS.props.t('Dapps.agreeTermOfServices')}</Checkbox>
                </Col>
              </Row>
              {!THIS.state.sufficientEtherBalance &&
              <Row style={{ paddingTop: '0' }}>
                <div className="pp-showError">
                  {t('gasFeeIsNotEnough')}
                  <br/>
                  {showBuyHBtoken 
                    ? t('howToSendSuccessfully', {fGasFee: formatNumber(THIS.state.transactionFee, 8), fWalletBalance: formatNumber(THIS.fWalletBalance, 8)})
                    : t('howToSendSuccessfully2', {fGasFee: formatNumber(THIS.state.transactionFee, 8), fCommissionFee: formatNumber(THIS.state.commissionFee, showBuyHBtoken ? 2 : 8), fWalletBalance: formatNumber(THIS.fWalletBalance, 8)})
                  }
                </div>
              </Row>
              }
              <div className="line1px"></div>
              <Row>
                <Col span={7}></Col>
                <Col span={17}>
                  <div className="sendNFT-buttons">
                    <button 
                      className="btn"
                      onClick={THIS.props.onCloseSendAssetSmartContracModal}>{t('cancel')}</button>
                    <button 
                      disabled={!THIS.state.isActiveSend}
                      className={'btn ' + (isViaSmartContract || isChangePrice ? 'btn-primary' : 'btn-warning')} 
                      onClick={THIS.props.sendViaSmartContract}>
                      {THIS.state.isSending 
                        ? <Spin size={15} color={'white'}/> 
                        : isChangePrice ? t('Dapps.changePrice') : (isViaSmartContract ? t('Send') : t('Dapps.sellOrder'))
                      }</button>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default MdSendAssetSmartContract
