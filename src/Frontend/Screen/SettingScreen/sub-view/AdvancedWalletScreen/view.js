import React from 'react'
import './styles.css'
import { HBInput } from 'Frontend/Components/HBInput'
import { Spin } from 'Frontend/Components/HBLoader'
import Slider from 'rc-slider'
import { formatSmallNumber } from 'Utils/globalFunction'
import OxObject from 'Backend/Lib/0x/index'
import Images from 'Assets/Image'
import { Button } from 'react-bootstrap'
import { Upload, Tooltip, List } from 'antd'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import moment from 'moment'

const space3x = '   '
export default class AdvancedWallet extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      txtContractAddr: '',
      isAlreadyCreate: false,
      isAddressErr: false,
      isLoadingTokenInfo: false,
      isNotContractAddr: false,
      valueInputGas: '',
      gasPrice: null,
      setWidthPrice: 0,
      transactionFee: 0,
      isDisableInformation: false,
      txtReceiveAddr: '',
      txtSendAmount: '',
      txtFiatAmount: '',
      isDisableSave: true,
      fileCSVName: '',
      toExchangeScreen: false,
      fallOfAll: false,
      failAboutAddress: false,
      failAboutAmount: false,
      failAboutDupAddress: false,
      failAboutTitle: false,
      amountAdvancedWallet: 0,
      checkBalance: false,
      amountToken: 0,
      wattingBalance: true,
      tokenDecimal: 0,
      isPendingTx: false,
      arrFail: [],
      arrSuccess: [],
      contractNotVerified: false,
      notSupportToken: false,
      walletAdvancedHistory: [],
      offset: 1,
      gasLimitForArr: null
    }
    props.funcDefaultThis(this)
    this.gasLimit = OxObject.getGasLimit()
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.loadingHBWIT()
    this.props.fetchGasPrice()
  }
  render () {
    const { t, onChangeAddress, dragVolume, focusInputGasPrice, unFocusInputGasPrice, clearAll,
      beforeUpload, handleChange, backToTop, helpUrl, clickToHBWIT, handleFiles, sendAll, getDetail, pendingTx, downloadSuccess, downloadFail, advancedWallet } = this.props
    const { txtContractAddr, isAlreadyCreate, isAddressErr, isLoadingTokenInfo, isNotContractAddr,
      isDisableInformation, valueInputGas, gasPrice, setWidthPrice, transactionFee, isDisableSave,
      fileCSVName, toExchangeScreen, failAboutAddress, failAboutAmount, failAboutDupAddress,
      failAboutTitle, amountAdvancedWallet, checkBalance, amountToken, wattingBalance, fallOfAll, isPendingTx, arrFail, arrSuccess, contractNotVerified, notSupportToken, walletAdvancedHistory, offset, gasLimitForArr } = this.state
    return (
      <div className="adw-wrapAll">
        <div className="sts-container">
          <div className="sts-header">
            <div className="sts-header-title">{t('AdvancedWallet')}</div>
            <div className="sts-header-sub-title">{t('AdvancedWallet.sendTokenToMultipleAddress')}</div>
          </div>
          <div className="adw-container">
            <div className="adw-checkHBwit">
              { wattingBalance
                ? <div className="adw-loadding"><Spin/></div>
                : checkBalance && <div className="adw-checkToShow">
                  <div className="adw-yellowText">
                    <img className="adw-img-infor" src={Images.Caution} />
                    <div className="adw-yellowTextContent">{t('AdvancedWallet.YouDontHave', {token: 'HBWALLET'})}</div>
                  </div>
                  <div className="adw-caution">{t('AdvancedWallet.OnlyUsersWho', {number: amountAdvancedWallet})}</div>
                  <div className="adw-btnBuyHB"><span onClick={() => clickToHBWIT()}>{t('AdvancedWallet.BuyHBWALLET')}</span></div>
                </div>
              }
              <div className="adw-wrapInfor">
                <div className="adw-row">
                  <div className="adw-title">{t('AdvancedWallet.TokenContractAddress')}</div>
                  <div className='ads-first-input'>
                    {console.log('contractNotVerifiedVIEW: ', contractNotVerified)}
                    <HBInput
                      className ="ads-scr-row-inp mh-input-41"
                      readOnly={checkBalance}
                      value={txtContractAddr}
                      isSuccess={isAlreadyCreate}
                      isErrBorderBottom={true}
                      countMax={42}
                      isError={isAlreadyCreate ? true : isAddressErr}
                      messageError={space3x + (isAlreadyCreate
                        ? t('SearchToken.alreadyToken')
                        : contractNotVerified
                          ? t('tklContractNotVerified')
                          : notSupportToken
                            ? t('tklNotSupportToken')
                            : isNotContractAddr 
                              ? t('SearchToken.errorContract')
                              : t('AccountErrorMsg'))}
                      onChange={text => onChangeAddress(text.trim().toLowerCase())}/>
                    {isLoadingTokenInfo && <div className='ads-progress'><Spin size={15} color='white'/></div>}
                  </div>
                </div>
                <div className="adw-row">
                  <div className="adw-title">{t('AdvancedWallet.CSVfile')}</div>
                  <HBInput
                    readOnly={true}
                    placeholder={fileCSVName}
                    className ={'mh-input-41 '}
                  >
                    { txtContractAddr === ''
                      ? <div className="adw-disableUpload"><img className="adw-img-help" src={Images.adwUpload} /></div>
                      : <Upload
                        name="avatar"
                        disabled={checkBalance}
                        className={'adw-btn-upload'}
                        listType={'text'}
                        showUploadList={false}
                        beforeUpload={file => beforeUpload(file)}
                        onChange={info => handleChange(info)}
                      >
                        <img className="adw-img-help" src={Images.adwUpload} />
                      </Upload>
                    }
                  </HBInput>
                  <img onClick={() => this.refs.modaladwCSV.show()} className="adw-img-help" src={Images.adwHelp} />
                </div>
                {fallOfAll &&
                  <div className="adw-row edit-withOut-mgTop">
                    <div className="adw-failAbout">
                      {failAboutAddress && <div className="adw-failAboutAddress">{t('AdvancedWallet.ThereAreInvalidAddresses')}</div>}
                      {failAboutAmount && <div className="adw-failAboutAmount">{t('AdvancedWallet.ThereAreInvalidAmounts')}</div>}
                      {failAboutDupAddress && <div className="adw-failAboutDupAddress">{t('AdvancedWallet.ThereAreDuplicatedAddresses')}</div>}
                      {failAboutTitle && <div className="adw-failAboutTitle">{t('AdvancedWallet.ThereAreInvalidColumnTitles')}{t('AdvancedWallet.PleaseChangeColumn')}</div>}
                    </div>
                  </div>
                }
                <div className="adw-row">
                  <div className='pp-wrap-row pp-mgBottom-6'>
                    <div className='pp-wrap-amount-title'>{t('GasPRICE')}</div>
                    {gasPrice === null
                      ? ''
                      : <div className="pp-price-adjust">
                        {transactionFee
                          ? <div className='pp-value-price'>
                            {this.renderWETHFormat((gasLimitForArr ? (transactionFee / this.gasLimit * gasLimitForArr * (offset + 1)) : (transactionFee * (offset + 1))), 8)} ETH
                          </div>
                          : ''
                        }
                        {console.log('ADStransactionFee: ', transactionFee)}
                        <Slider defaultValue={Number(gasPrice.slow)} value={Number(Number(setWidthPrice))} min={Number(gasPrice.slow)} max={Number(gasPrice.fast) * 1.5} step={0.1} onChange={(value) => dragVolume(value > Number(gasPrice.fast) * 1.5 ? Number(gasPrice.fast) * 1.5 : (value < Number(gasPrice.slow) ? Number(gasPrice.slow) : value))}/>
                        <div className='pp-wrap-level'>
                          <div className="pp-slow-level">{t('Slower')}</div>
                          <div className="pp-medium-level">{t('medium')}</div>
                          <div className="pp-fast-level">{t('Faster')}</div>
                        </div>
                      </div>
                    }
                    <div className="pp-recent-price">
                      <HBInput
                        className='pp-input-recent-price'
                        value={Number(Number(valueInputGas))}
                        onChange={focusInputGasPrice}
                        onBlur={unFocusInputGasPrice}
                        symbol={'Gwei'}
                      />
                    </div>
                  </div>
                </div>
                <div className="wct-row4">
                  <div className="wct-wrapBtn">
                    <Button onClick={() => clearAll()} className="btn-init-screen wct-button">{t('cancel')}</Button>
                    {/* <Button disabled={isDisableSave} onClick={() => sendAll()} className="btn-init-screen wct-button wct-button-active">{pendingTx.isPending ? <Spin size={15} color='white'/> : t('Submit')}</Button> */}
                    <Button disabled={isDisableSave} onClick={() => sendAll()} className="btn-init-screen wct-button wct-button-active">{advancedWallet.isSending ? <Spin size={15} color='white'/> : t('Submit')}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Modal ref="modaladwCSV">
            <div className="adw-CSV">
              <div className="adw-titleCSV">
              </div>
              <div className="md-header">
                <div className="pp-close" onClick={() => this.refs.modaladwCSV.hide()}><img src={Images.close} /></div>
                {t('AdvancedWallet.CSVformat')}
              </div>
              <div className="adw-CSVContent">
                <div className="adw-CSVInfor">{t('AdvancedWallet.ReceiverAddresses')}</div>
                <div className="adw-CSVTable">
                  <div className="adw-CSVTable-title">
                    <div className="adw-CSVTable-left">
                      <span>{t('AdvancedWallet.ADDRESS')}</span>
                      <Tooltip overlayClassName='adw-tooltipHelp' placement="top" title={<div className='adw-tooltip2'>
                        {t('AdvancedWallet.ReceiverAddressList')}</div>}>
                        <img src={Images.adwHelp} />
                      </Tooltip>
                    </div>
                    <div className="adw-CSVTable-right">
                      <span>{t('AdvancedWallet.TOKENAMOUNT')}</span>
                      <Tooltip overlayClassName='adw-tooltipHelp' placement="right" title={<div className='adw-tooltip2'>
                        {t('AdvancedWallet.AmountOfTokens')}</div>}>
                        <img src={Images.adwHelp} />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="adw-CSVTable-content">
                    <div className="adw-CSVTable-row">
                      <div className="adw-CSVTable-address">0x32b993db9d97afd128333ef246e67be025136039</div>
                      <div className="adw-CSVTable-number">9</div>
                    </div>
                    <div className="adw-CSVTable-row">
                      <div className="adw-CSVTable-address">0x32b993db9d97afd128333ef246e67be025136079</div>
                      <div className="adw-CSVTable-number">10000</div>
                    </div>
                    <div className="adw-CSVTable-row">
                      <div className="adw-CSVTable-address">0x32b993db9d97afd128333ef246e67be025136099</div>
                      <div className="adw-CSVTable-number">1000.123</div>
                    </div>
                  </div>
                </div>
                {/* <div className="adw-CSVBottom">{t('AdvancedWallet.TheMaximumNumber')}</div> */}
              </div>
            </div>
          </Modal>
        </div>
        <div className="adw-history">
          <div className="adwh-title">History</div>
          <div className="adwh-header">
            <div className="adwh-headerName adwh-per18">Time</div>
            <div className="adwh-headerName adwh-per30">Name</div>
            <div className="adwh-headerName adwh-per18">Symbol</div>
            <div className="adwh-headerName adwh-per20">File Name</div>
            <div className="adwh-headerName adwh-per14">Success</div>
            <div className="adwh-headerName adwh-per14">Amount</div>
            <div className="adwh-headerName adwh-per14">Fee <span>ETH</span></div>
            <div className="adwh-headerName adwh-per14">History</div>
          </div>
          <div className="adwh-content">
            { walletAdvancedHistory && walletAdvancedHistory.data && 
              <List
                id="HBScrollBar"
                dataSource={walletAdvancedHistory.data} 
                renderItem={item => (
                  <List.Item className="adwh-row">
                    <div className="adwh-partRow adw-ellipsis adwh-per18">{moment(item.timeStamp).format('MM/DD HH:mm')}</div>
                    <div className="adwh-partRow adw-ellipsis adwh-per30">{item.tokenName}</div>
                    <div className="adwh-partRow adw-ellipsis adwh-per18">{item.tokenSymbol}</div>
                    <div className="adwh-partRow adw-ellipsis adwh-per20 adwh-Blue">{item.fileName}</div>
                    <div className="adwh-partRow adwh-per14">{item.successAddress}/{item.totalAddress}</div>
                    <div className="adwh-partRow adwh-per14 adw-ellipsis">{item.totalTokenAmounts}</div>
                    <div className="adwh-partRow adwh-per14 adw-ellipsis">{item.fee}</div>
                    <div className="adwh-partRow adwh-per14 adwh-BlueUnderline" onClick={() => getDetail(item)}>{t('details')}</div>
                  </List.Item>
                )}
              />
            }
          </div>
        </div>
        <Modal ref="modaladwDetail">
          <div className="adw-CSV adw-Detail">
            <div className="adw-titleCSV">
            </div>
            <div className="md-header">
              <div className="pp-close" onClick={() => this.refs.modaladwDetail.hide()}><img src={Images.close} /></div>
              {t('AdvancedWallet.Result')}
            </div>
            <div className="adw-CSVContent">
              <div className="adw-CSVTable adw-Success">
                <div className="adw-CSVTable-header">
                  <span>{t('AdvancedWallet.Success')}</span>
                  <img className='adw-download' onClick={() => downloadSuccess()} src={Images.adwDownload} />
                </div>
                <div className="adw-CSVTable-title">
                  <div className="adw-CSVTable-left">
                    <span>{t('AdvancedWallet.ADDRESS')}</span>
                  </div>
                  <div className="adw-CSVTable-right">
                    <span>{t('AdvancedWallet.TOKENAMOUNT')}</span>
                  </div>
                </div>
                <div className="adw-CSVTable-content">
                  { arrSuccess && 
                    <List
                      id="HBScrollBar"
                      dataSource={arrSuccess} 
                      renderItem={item => (
                        <List.Item className="adw-CSVTable-row">
                          <div className="adw-CSVTable-address">{item.address}</div>
                          <div className="adw-CSVTable-number">{item.amount}</div>
                        </List.Item>
                      )}
                    />
                  }
                </div>
              </div>
              <div className="adw-CSVTable adw-Fail">
                <div className="adw-CSVTable-header">
                  <span>{t('AdvancedWallet.Fail')}</span>
                  <img className='adw-download' onClick={() => downloadFail()} src={Images.adwDownload} />
                </div>
                <div className="adw-CSVTable-title">
                  <div className="adw-CSVTable-left adwr-width60">
                    <span>{t('AdvancedWallet.ADDRESS')}</span>
                  </div>
                  <div className="adw-CSVTable-right adwr-width20">
                    <span>{t('AdvancedWallet.TOKENAMOUNT')}</span>
                  </div>
                  <div className="adw-CSVTable-reason adwr-width10">
                    <span>{t('AdvancedWallet.Reason')}</span>
                  </div>
                </div>
                <div className="adw-CSVTable-content">
                  { arrFail && 
                    <List
                      id="HBScrollBar"
                      dataSource={arrFail} 
                      renderItem={item => (
                        <List.Item className="adw-CSVTable-row">
                          <div className="adw-CSVTable-address adwr-width60">{item.address}</div>
                          <div className="adw-CSVTable-number adwr-width20">{item.amount}</div>
                          <div className="adw-CSVTable-imgReason adwr-width10">
                            <Tooltip overlayClassName='adw-tooltipHelp' placement="top" title={<div className='adw-tooltip2'>
                              <span className='adw-tooltipHeader'>First time</span>
                              <span>{item.reason[0]}</span>
                              <span className='adw-tooltipHeader2'>second time</span>
                              <span>{item.reason[item.reason.length - 1]}</span></div>}>
                              <img src={Images.adwHelp1} />
                            </Tooltip>
                          </div>
                        </List.Item>
                      )}
                    />
                  }
                </div>
              </div>
            </div>
          </div>
        </Modal>
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
