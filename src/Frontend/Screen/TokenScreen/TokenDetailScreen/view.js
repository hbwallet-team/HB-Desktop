import React, { PureComponent } from 'react'
import './styles.css'
import TabLayoutContainer from 'Frontend/Container/TabLayoutContainer'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import Images from 'Assets/Image'
import { Wave, ThreeBounce } from 'better-react-spinkit'
import ListTransaction from 'Frontend/Components/ListTransaction'
import { Row, Col } from 'antd'
import { HBInput } from 'Frontend/Components/HBInput'
import { StyleRoot } from 'radium'
import { Button } from 'react-bootstrap'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import ConfirmSendScreen from '../ConfirmSendScreen'
import { HBCURRENCY_SYMBOL, HBCURRENCY, HBCRYPTO, ONE_TIME, ACCOUNT_DETAIL_SUB_VIEW, OBSERVER_KEY, DAI_COIN } from 'Utils/globalConstants'
import { filterListSending, formatNumberOld, filterMainAccount, formatNumberDisplay, formatFiatDisplay, copyText, openBrowserInNewTab } from 'Utils/globalFunction'
import MDQrCode from 'Frontend/Screen/EthereumScreen/Components/MdQrcode'
import MDHistoryDetail from '../Components/MdHistoryDetail'
import HBChart from 'Frontend/Components/HBChart'
import HBGasSlider from 'Frontend/Components/HBGasSlider'
import MdSearAccountBook from 'Frontend/Screen/EthereumScreen/Components/MdSearAccountBook'
import ConfirmPINCodeScreen from 'Frontend/Screen/SettingScreen/sub-view/ConfirmPINCodeScreen/view'
import WithdrawScreen from '../WithdrawScreen'
import swal from 'sweetalert2'
import OxObject from 'Backend/Lib/0x/index'
import Observer from 'Utils/HBObserver'
import Settings from 'Backend/settings'
const { shell, ipcRenderer } = window.require('electron')

export default class View extends PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)

    this.state = ({
      // Field input address, sent amount, fiat amount
      txtReceiveAddr: props.receiverAddr ? props.receiverAddr : '',
      txtSendAmount: '',
      txtFiatAmount: '',
      txtReceiveAmount: '',
      txtReceiveFiatAmount: '',
      // Field input error address, sent amount
      isAddressErr: false,
      isSendAmountErr: false,
      // Disable and loading while calculate fee
      isDisableSend: true,
      isLoadingSpendable: true,
      // Fee percent and total amount
      iCountPercent: 1,
      fSpendable: props.cardSelected.balance,
      fGasFee: 0,
      isFeeErr: false,
      // Other state
      arrHistoryTxs: [],
      pageTxt: 0,
      hasMore: true,
      isLoadMore: false,
      isGotoConfirmScreen: false,
      isSlideLeft: false,
      isLoadingTxs: false,
      objSelectItemHistoryDetail: null,
      isLoadingCellTxt: true,
      tokenTxtInfo: {
        method: 'send',
        symbol: ''
      },
      tokenPrice: {
        price: 0,
        percent_change_24h: 0
      },
      sliderValue: 100,
      isConfirmPinCode: false,
      isLoadingTokenPrice: true,
      isGotoWithdrawScreen: false, // go to withdraw screen
      showView: '',
      chartTime: ONE_TIME.ONE_DAY,
      waitTokenDetails: false,
      firstNumberToken: '0',
      lastNumberToken: '00',
      gasInput: props.gasStation.slow + 5,
      gasPrice: props.gasStation,
      gasLimit: Settings.gas.externalFeeToken,
      transactionFee: 0,
      tokenPerChange24h: '0',
      feeError: false,
      txtAccount: '',
      isAccountError: false,
      accountErrorMsg: '',
      txtAccountName: '',
      isAccountNameError: false,
      getSpendableAmount: 0,
      getOrderedAmount: 0,
      getTokenTrading: 0,
      loadingGetOrderedAmount: true
    })

    this.fTokenConvert = props.cardSelected.fiatAmount || 0
    this.fWalletBalance = 0
    this.fBalanceCoinSelected = 0
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    this.gasLimit = Settings.gas.externalFeeToken
    Observer.on(OBSERVER_KEY.REFRESH_TOKEN_HISTORY, props.handleUpdateHistoryDataAll)
  }

  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchTokenTxsHistory()
    this.props.fetchTokenPrice()
    // listening trigger from main window
    ipcRenderer.on('switched-account', this.props.triggerSwitchedAccount)
  }

  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.REFRESH_TOKEN_HISTORY, this.props.handleUpdateHistoryDataAll)
  }

  componentWillUpdate (nextProps, nextState) {
    if (this.props.tokenDetailPrice !== nextProps.tokenDetailPrice) {
      this.setState({
        tokenPrice: nextProps.tokenDetailPrice
      })
    }
  }

  onCopy (t, address) {
    copyText(address)
    swal({
      width: '250px',
      text: t('qrCopied'),
      type: 'success',
      timer: 5000,
      showConfirmButton: false
    })
  }

  get renderTopLeft () {
    const { onBack, cardSelected, t, arrCurrencyData, arrCardData, arrKyberSwapToken, arrCompoundRate } = this.props
    const {fSpendable, getTokenTrading, getOrderedAmount, loadingGetOrderedAmount, tokenPrice, unlocked} = this.state
    const mainAccount = filterMainAccount(arrCardData)
    const etherBalance = formatNumberDisplay(mainAccount.balance, 8)
    const tokenBalance = formatNumberDisplay(fSpendable, cardSelected.decimals)
    let getTokenTradingFormat 
    if (getTokenTrading) {
      getTokenTradingFormat = formatNumberDisplay(getTokenTrading, cardSelected.decimals)
    }
    let getOrderedAmountFormat = formatNumberDisplay(getOrderedAmount, cardSelected.decimals)
    let tokenFiatAmount = formatFiatDisplay(fSpendable * tokenPrice.price)
    const isSupportSwap = arrKyberSwapToken.findIndex(e => e.address.toLowerCase() === cardSelected.address.toLowerCase())
    const compoundToken = arrCompoundRate.length > 0 ? arrCompoundRate.find(e => e.address === cardSelected.address) : null
    if (compoundToken) {
      tokenFiatAmount = formatNumberDisplay(fSpendable * compoundToken.rate, compoundToken.decimals)
    }
    return (
      <div className="edt-container edt-wrapERC20">
        <Header title={t('Dapps.erc20overview')} leftAction={onBack}/>
        <div className="edt-top-left">
          <div className="edt-info-tkWrap">
            <div className="edt-info-head">
              {/* <div className="tk-tokenName">
                {t('Token')}
              </div> */}
              <div className="edt-info-22">{cardSelected.name}</div>
            </div>
            {
              isSupportSwap !== -1
                ? <div className="kyber-swap">
                  <div className="kyber-swrap-title">Kyber Network</div>
                  <div className="kyber-swap-item" onClick={() => this.props.onSwitchKyberSwap(cardSelected)}><img src={cardSelected.iconImage}/> {cardSelected.symbol} &#8594; <img src={Images.ic_eth_request}/> ETH</div>
                </div>  
                : null
            }
            {/* <div className='tk-sub-header'>
              <div className='tk-sub-header-address'>
                {t('Account_sub')}: {mainAccount.address}
                <span onClick={() => this.onCopy(t, mainAccount.address)}>
                  <img src={Images.ic_copy} className="edt-copy-addr-btn"/>
                </span>
              </div>
              <div className='tk-sub-header-amount'>
                {<div style={{display: 'inline-block'}}>
                  <span className="exc-usd-first">{etherBalance.firstNumber}</span>
                  <span className="exc-usd-second">.{etherBalance.secondNumber} {HBCRYPTO.ETHEREUM}</span>
                </div>}
              </div>
            </div> */}
          </div>
          <div className="edt-container-info">
            {cardSelected.cardImage
              ? <img className="edt-img-card" alt="img" src={cardSelected.cardImage}/>
              : <div className="txt-noImage txt-noTransform">
                <div className="txt-noImageContent">
                  <div className="txt-noImageTitle">Token ERC-20</div>
                  <div className="txt-noImageName">{cardSelected.name}</div>
                </div>
              </div>
            }
            <div className="edt-info">
              <div className="edt-balance edt-editNumber3">
                {<div style={{display: 'inline-block'}}>
                  <span className="exc-usd-first">{tokenBalance.firstNumber}</span>
                  <span className="exc-usd-second">{tokenBalance.secondNumber ? '.' + tokenBalance.secondNumber : ''} {cardSelected.symbol}</span>
                </div>}
              </div>
              <div className="edt-info-14 edt-editNumber">
                {!cardSelected 
                  ? <Wave size={25} color='white' /> 
                  : compoundToken
                    ? <div style={{display: 'inline-block'}}>
                      <span className="exc-usd-first">{tokenFiatAmount.firstNumber}</span>
                      <span className="exc-usd-second">.{tokenFiatAmount.secondNumber} {compoundToken.rateCoin}</span>
                    </div>
                    : cardSelected.currencyBalance > 0
                      ? <div style={{display: 'inline-block'}}>
                        <span className="exc-usd-first">{HBCURRENCY_SYMBOL[arrCurrencyData]}{tokenFiatAmount.firstNumber}</span>
                        <span className="exc-usd-second">.{tokenFiatAmount.secondNumber}</span>
                      </div>
                      : '-'
                }
              </div>
              {unlocked && getTokenTrading > 0 && <div>
                {getTokenTrading 
                  ? <div className="edt-tradingTop">
                    <div className="edt-tradingTop-title">{t('tradingTop')}</div>
                    <div className="edt-tradingTop-num">
                      <span className="exc-usd-first">{getTokenTradingFormat.firstNumber}</span>
                      <span className="exc-usd-second">{getTokenTradingFormat.secondNumber ? '.' + getTokenTradingFormat.secondNumber : ''} {cardSelected.symbol}</span>
                    </div>
                  </div>
                  : <div className="edt-tradingTop">
                    <div className="edt-tradingTop-title">{t('tradingTop')}</div>
                    <div className="edt-tradingTop-num">
                      <span className="exc-usd-first">0</span>
                      <span className="exc-usd-second"> {cardSelected.symbol}</span>
                    </div>
                  </div>}
              </div>}
              {unlocked && getTokenTrading > 0 && <div className="edt-spendableTop">
                <div className="edt-spendableTop-title">{t('spendAble')}:</div>
                {loadingGetOrderedAmount
                  ? <div><Wave size={15} color='white' /></div>
                  : getOrderedAmount < 0 
                    ? <div className="edt-spendableTop-num">
                      <div className="edt-value-14-2 edt-editNumber2">
                        <div style={{display: 'inline-block'}}>
                          <span className="exc-usd-first">0</span>
                          <span className="exc-usd-second">.00 {cardSelected.symbol}</span>
                        </div>
                      </div>
                    </div>
                    : <div className="edt-spendableTop-num">
                      <div className="edt-value-14-2 edt-editNumber2">
                        <div style={{display: 'inline-block'}}>
                          <span className="exc-usd-first">{getOrderedAmountFormat.firstNumber}</span>
                          <span className="exc-usd-second">{getOrderedAmountFormat.secondNumber ? '.' + getOrderedAmountFormat.secondNumber : ''} {cardSelected.symbol}</span>
                        </div>
                      </div>
                    </div>
                }
              </div>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  get renderTopRight () {
    const {
      arrChartTokenDetail, arrChartTokenDetailYear, cardSelected, t,
      changeChartTime
    } = this.props
    const { chartTime, tokenPrice, isLoadingTokenPrice } = this.state
    const colorExchange = Number(tokenPrice.percent_change_24h) >= 0 ? 'green' : 'red'
    const price = formatFiatDisplay(tokenPrice.price)
    let datas = []
    let count = 0
      
    switch (chartTime) {
    case ONE_TIME.ONE_DAY:
      if (arrChartTokenDetail.datas.day) {
        datas = arrChartTokenDetail.datas.day
        if (datas.length === 1) {
          let recordTemp = {
            price: 0,
            time: new Date((Number(datas[0].time) - 3600)).getTime()
          }
          datas.unshift(recordTemp)
        }
      } else {
        for (let i = arrChartTokenDetail.datas.length; i > 0 && count <= 24; i--, count++) {
          datas.unshift(arrChartTokenDetail.datas[i])
        }
      }
      break
    case ONE_TIME.ONE_WEEK:
      if (arrChartTokenDetail.datas.week) {
        datas = arrChartTokenDetail.datas.week
        if (datas.length === 1) {
          let recordTemp = {
            price: 0,
            time: new Date((Number(datas[0].time) - 3600)).getTime()
          }
          datas.unshift(recordTemp)
        }
      } else {
        for (let i = arrChartTokenDetail.datas.length; i > 0 && count <= 170; i--, count++) { // 24 * 7 + 2 = 170
          datas.unshift(arrChartTokenDetail.datas[i])
        }
      }
      break
    case ONE_TIME.ONE_MONTH:
      if (arrChartTokenDetail.datas.month) {
        datas = arrChartTokenDetail.datas.month
        if (datas.length === 1) {
          let recordTemp = {
            price: 0,
            time: new Date((Number(datas[0].time) - 10800)).getTime()
          }
          datas.unshift(recordTemp)
        }
      } else {
        for (let i = arrChartTokenDetail.datas.length; i > 0 && count <= 720; i--, count++) { // 24 * 30 = 720
          datas.unshift(arrChartTokenDetail.datas[i])
        }
      }
      break
    default:
      if (arrChartTokenDetail.datas.all) {
        datas = arrChartTokenDetail.datas.all
        if (datas.length === 1) {
          let recordTemp = {
            price: 0,
            time: new Date((Number(datas[0].time) - 86400)).getTime()
          }
          datas.unshift(recordTemp)
        }
      } else {
        datas = arrChartTokenDetailYear.datas
      }
      break
    }

    return (
      <div className="e-top-right">
        <div className="e-top-right-info">
          <div className='eth-change24-first'>
            <div className='etherPrice12'>{t('price2', {tokenName: cardSelected.symbol})}</div>
            <div className='eth-text14-right upPerCase'>{t('Change(24)')}</div>
          </div>
          <div className='eth-change24-right'>
            <div className='text20-yellow'>
              {isLoadingTokenPrice
                ? <div><Wave size={25} color='white' /></div>
                : tokenPrice.price > 0 
                  ? <div style={{display: 'inline-block'}}>
                    <span className="exc-usd-first">{this.currency}{price.firstNumber}</span>
                    <span className="exc-usd-second">.{price.secondNumber}</span>
                  </div>
                  : '-'
              }
            </div>
            <div className={'eth-text14-right ' + colorExchange}> 
              {(tokenPrice.percent_change_24h > 0 ? '+' : '') + formatNumberOld(tokenPrice.percent_change_24h, 2) + '%'}
            </div>
          </div>
        </div>
        <div className="e-top-right-graph">
          <div id='btnScale-active' className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_DAY ? 'eth-switch-active' : 'eth-switch-unActive')} onClick={() => changeChartTime(ONE_TIME.ONE_DAY)}>{t('1day')}</div>
          <div id='btnScale-active' className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_WEEK ? 'eth-switch-active' : 'eth-switch-unActive')} onClick={() => changeChartTime(ONE_TIME.ONE_WEEK)}>{t('1week')}</div>
          <div id='btnScale-active' className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_MONTH ? 'eth-switch-active' : 'eth-switch-unActive')} onClick={() => changeChartTime(ONE_TIME.ONE_MONTH)}>{t('1month')}</div>
          <div id='btnScale-active' className={'eth-switch-chart-label ' + (chartTime === ONE_TIME.ONE_YEAR ? 'eth-switch-active' : 'eth-switch-unActive')} onClick={() => changeChartTime(ONE_TIME.ONE_YEAR)}>{t('1year')}</div>
        </div>
        {arrChartTokenDetail.isLoading
          ? <div className="e-loading-chart"><ThreeBounce color={'#07d'} size={15}/> </div>
          : datas.length > 0
            ? <div className="tk-chart-container"><HBChart datas={datas} dataKey={cardSelected.tokenId.toString().trim().length > 0 ? 'close' : 'price'}/></div>
            : <div className="e-loading-chart exc-center-chart e-empty-color">{t('ChartEmpty')}</div>
        }
        <div className="e-top-right-chart-title">{t('LatestTransactions')}</div>
      </div>
    )
  }

  get renderRightView () {
    const { arrCardData, clickOnCell, handleInfiniteOnLoad, trackingSendTxs, cardSelected } = this.props
    const { arrHistoryTxs, hasMore, isLoadingTxs } = this.state
    const mainAccount = filterMainAccount(arrCardData)
    const arrTrackingSending = filterListSending(trackingSendTxs, cardSelected, mainAccount.address)
    return (
      <div className='tkdt-list-view'>
        <ListTransaction
          tokenSelected={cardSelected}
          isToken={true}
          isLoading={isLoadingTxs}
          tokenPrice={this.fTokenConvert}
          currency={this.currency}
          handleInfiniteOnLoad={handleInfiniteOnLoad}
          hasMore={hasMore}
          historyTxs={arrHistoryTxs} 
          clickOnCell={clickOnCell}
          arrTrackingSending={arrTrackingSending}
        />
      </div>
    )
  }

  render () {
    const {onChangeReceiverAccount, onChangeCurrencyAmount, onChangeEthereumAmount,
      openAddressBook, onWithdrawAction, onAfterChangeSlide, cancelAction, sendAction, cardSelected,
      arrCurrencyData, t, onSelectMax, onBack, pendingTx, arrCardData, localeData, focusInputGasPrice, unFocusInputGasPrice, dragVolume, etherPrice, onClickOutPINCode, handleChangeGasPrice, onChangeTxtAccount, registerAccountBook, selectAccountBook, GAAddressList } = this.props
    const { isGotoWithdrawScreen, isGotoConfirmScreen, txtReceiveAddr, txtSendAmount, fGasFee, isFeeErr,
      isSlideLeft, fSpendable, isSendAmountErr, sliderValue, isConfirmPinCode,
      isDisableSend, iCountPercent, isLoadingSpendable, valueInputGas, gasPrice, gasInput, gasLimit, setWidthPrice, transactionFee, feeError, isAccountError, txtAccount, accountErrorMsg, isAccountNameError, txtAccountName } = this.state
    const mainAccount = filterMainAccount(arrCardData)
    const isSendPending = pendingTx.isPending && pendingTx.account.address === mainAccount.address
    const spendable = formatNumberDisplay(fSpendable, cardSelected.decimals)
    return (
      <div className='ads-rightSide tds-rightSide'>
        <TabLayoutContainer
          topLeft={this.renderTopLeft}
          topRight={this.renderTopRight}
          centerRight={this.renderRightView}
          // ScreenAnimation={ScreenAnimation}
          topLeftHeight={292}
          topRightHeight={300}
        >
          {isGotoWithdrawScreen
            ? <WithdrawScreen
              backToAccountDetail={() => this.setState({isGotoWithdrawScreen: false})}
            />
            : <div className="edt-wrap-StyleRoot edt-wrap-erc20">
              <div className="edt-title mgTop20">
                <div className="edt-title-send">{t('Send')}</div>
                { cardSelected && cardSelected.symbol === 'BST' &&
                  <div className='edt-withdraw-container'>
                    <div className='edt-col-container'>
                      <span className='edt-label-16' onClick={() => openBrowserInNewTab(cardSelected.url)}> {cardSelected.url}
                      </span>
                    </div>
                    <button
                      onClick={onWithdrawAction}
                      className="btn-init-screen edt-col-btn-withdraw" >{t('withdraw')}</button>
                  </div>
                }
              </div>
              <StyleRoot style={{height: 'calc(100% - 50px)', overflowY: 'auto'}} id='HBScrollBar' className="edt-body">
                <div 
                  // style={isSlideLeft ? BackConfirmAnimation : null}
                  className="styleRoot-container form-padding send-form">
                  <div className={isLoadingSpendable ? 'styleRoot-containerDisable' : 'styleRoot-container-width'}>
                    <div className="edt-forPaddingTop"></div>
                    <Row className="edt-row-container">
                      <Col span={3} className="input-label">
                        <div className="edt-label-14-2 edt-receiver">{t('ReceiveAccount')}</div>
                      </Col>
                      <Col span={17}>
                        <HBInput
                          className={'mh-input-41 edt-special-input'}
                          icon={Images.ic_contacts1}
                          onClickIcon={openAddressBook}
                          isError={this.state.isAddressErr}
                          countMax={42}
                          messageError = {t('errorAddress42')}
                          value={this.state.txtReceiveAddr}
                          onChange={onChangeReceiverAccount}/>
                        <div className="edt-desc">{t('pasteUsingKeyboardShortcut')}</div>
                      </Col>
                    </Row>
                    <Row className="edt-row-container">
                      <Col span={17}>
                        <div className="edt-label-14">{cardSelected.symbol + ' ' + t('amount')}</div>
                        <HBInput
                          className={'mh-input-41'}
                          symbol={cardSelected.symbol}
                          isSpacing={true}
                          isError={isSendAmountErr}
                          messageError={cardSelected.symbol + ' ' + t('amountErrToken')}
                          value={txtSendAmount}
                          onChange={(value) => onChangeEthereumAmount(value)}/>
                      </Col>
                    </Row>
                    <Row className="edt-row-container">
                      <Col span={17}>
                        <div className="edt-label-14">{arrCurrencyData + ' ' + t('amount')}</div>
                        <HBInput
                          className={'mh-input-41'}
                          symbol={arrCurrencyData}
                          value={this.state.txtFiatAmount}
                          onChange={(value) => onChangeCurrencyAmount(value)}/>
                      </Col>
                    </Row>
                    <Row className="edt-row-container">
                      <Col span={3} className="input-label">
                        <div className="edt-label-14-2">{t('spendAble')}</div>
                      </Col>
                      <Col span={10}>
                        {isLoadingSpendable
                          ? <div className="edt-value-14-2"><Wave size={19} color='white' /></div>
                          : <div className="edt-value-14-2">
                            <div style={{display: 'inline-block'}}>
                              <span className="exc-usd-first">{spendable.firstNumber}</span>
                              <span className="exc-usd-second">{spendable.secondNumber ? '.' + spendable.secondNumber : ''} {cardSelected.symbol}</span>
                            </div>
                          </div>
                        }
                        <div className="select-item-max">
                          <span onClick={onSelectMax}>{t('max1')}</span>
                        </div>
                      </Col>
                    </Row>
                    <Row className="edt-row-container edt-mb-13">
                      <Col span={3} className="input-label">
                        <div className="edt-label-14-2">{t('GasPRICE')}</div>
                      </Col>
                      <Col span={18}>
                        {gasPrice && <HBGasSlider
                          transactionFee={transactionFee}
                          gasInput={gasInput}
                          gasLimit={gasLimit}
                          gasPrice={gasPrice}
                          gasDefault={gasPrice.slow + 5}
                          handleResult={handleChangeGasPrice}
                          t={t}
                        />}
                        {feeError && <div className="pp-showError">
                          {t('gasFeeIsNotEnough')}
                          <br/>
                          {t('howToSendSuccessfully', {fGasFee: formatNumberOld(transactionFee), fWalletBalance: formatNumberOld(this.fWalletBalance)})}
                        </div>
                        }
                      </Col>
                    </Row>
                    <Row className="edt-row-container">
                      <Col span={3} className="input-label">
                        <div className="edt-label-14-2">{t('total')}</div>
                      </Col>
                      <Col span={14}>
                        <div className="edt-value-14-2">{this.renderWETHFormat(Number(txtSendAmount), cardSelected.decimals)}{' ' + cardSelected.symbol}</div>
                      </Col>
                    </Row>
                  </div>
                  <Row className="edt-row-container edt-bottomPage">
                    <Col span={17} className="edt-group-button edt-2btnSend">
                      <Button onClick={cancelAction} className="btn-init-screen edt-button edt-text-capitalize">{t('cancel')}</Button>
                      <div className="edt-space"/>
                      <Button disabled={isDisableSend || isLoadingSpendable}
                        onClick={() => sendAction(ACCOUNT_DETAIL_SUB_VIEW.CONFIRM_SEND)} id={(isDisableSend) ? 'inActiveBtn' : 'activeBtn'}
                        className="btn-init-screen edt-button-send">{t('Send')}</Button>
                    </Col>
                  </Row>
                </div>
              </StyleRoot>
            </div>}

          <Modal ref="modalRequestReceive" className="md-request">
            <MDQrCode {...this.props}/>
          </Modal>

          <Modal ref="modalHistoryDetail">
            <MDHistoryDetail THIS={this}/>
          </Modal>

          <Modal ref="modalAccountBook">
            <MdSearAccountBook 
              that={this}
              selectAccountBook={selectAccountBook}
            />
          </Modal>

          <Modal ref="modalConfirmSendScreen">
            <ConfirmSendScreen
              backToAccountDetail={() => this.setState({SUB_VIEW: ACCOUNT_DETAIL_SUB_VIEW.CONFIRM_SEND})}
              txtReceiveAddr={txtReceiveAddr}
              cardSelected={cardSelected}
              txtSendAmount={txtSendAmount}
              iCountPercent={iCountPercent}
              fEthConvert={etherPrice.price}
              fTokenConvert={this.fTokenConvert}
              transactionFee={transactionFee}
              onBack={onBack}
              THIS={this}
              gasInput={gasInput}
            />
          </Modal>
        </TabLayoutContainer>
        <Modal ref="modalConfirmPinCode">
          <ConfirmPINCodeScreen
            t={t}
            THIS={this}
            that={this}
            onChangeInputPINCode={this.funcChangeInputPINCode}
            onCompleteInputPINCode={this.funcCompleteInputPINCode}
            parent={'AccountDetailScreen'}
            showView={this.state.showView}
            setIsActiveScreen={this.funcSetActiveScreen}
            setIsActiveWithdrawScreen = {this.funcSetActiveWithdrawScreen}
            modalConfirmSendScreen = {this.refs.modalConfirmSendScreen}/>
        </Modal>
      </div>
    )
  }

  renderWETHFormat = (balance, decimals) => {
    const { firstNumber, secondNumber } = formatNumberDisplay(balance, decimals)
    return (
      <div style={{display: 'inline-block'}}>
        <span className="exc-usd-first">{firstNumber}</span>
        <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
      </div>
    )
  }
  // MARK: Confirm Pincode
  funcSetActiveWithdrawScreen = (value) => {
    this.setState({
      isConfirmPinCode: !value,
      isGotoWithdrawScreen: true,
      isSlideLeft: true
    })
  }
  // MARK: Confirm Pincode
  funcSetActiveScreen = (value) => {
    this.setState({
      isConfirmPinCode: !value,
      isGotoConfirmScreen: true,
      isSlideLeft: true
    })
  }
  funcCompleteInputPINCode = (value, self) => this.props.onCompleteInputPINCode(value, self)
  funcChangeInputPINCode =(value, index) => console.log(value, index)
}
