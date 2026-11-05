import React, { PureComponent } from 'react'
import './styles.css'
import TabLayoutContainer from 'Frontend/Container/TabLayoutContainer'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import Images from 'Assets/Image'
import QRCode from 'qrcode.react'
import { Wave } from 'better-react-spinkit'
import ListTransaction from 'Frontend/Components/ListTransaction'
import { Row, Col } from 'antd'
import { HBInput } from 'Frontend/Components/HBInput'
import HBGasSlider from 'Frontend/Components/HBGasSlider'
import { StyleRoot } from 'radium'
import { Button } from 'react-bootstrap'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import ConfirmSendScreen from '../ConfirmSendScreen'
import { HBCURRENCY_SYMBOL, HBCURRENCY, ACCOUNT_DETAIL_SUB_VIEW, OBSERVER_KEY, HBCRYPTO } from 'Utils/globalConstants'
import MDHistoryDetail from '../Components/MdHistoryDetail'
import { formatNumber, filterListSending, copyText } from 'Utils/globalFunction'
import MDQrCode from '../Components/MdQrcode'
import MdSearAccountBook from '../Components/MdSearAccountBook'
import FundWithCreditCard from '../FundWithCreditCard'
import PaymentMethod from '../PaymentMethod'
import NewPaymentMethod from '../NewPaymentMethod'
import ConfirmPINCodeScreen from 'Frontend/Screen/SettingScreen/sub-view/ConfirmPINCodeScreen/view'
import MdEditAccount from 'Frontend/Screen/SettingScreen/sub-view/WalletSettingScreen/Components/MdEditAccount'
import Settings from 'Backend/settings'
import Observer from 'Utils/HBObserver'
import swal from 'sweetalert2'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'

export default class View extends PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)

    this.state = ({
      // Field input address, sent amount, fiat amount
      txtReceiveAddr: '',
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
      fSpendable: 0,
      fGasFee: 0,
      isFeeErr: false,

      // Other state
      historyData: [],
      pageTxt: 0,
      hasMore: true,
      isLoadMore: false,
      isGotoConfirmScreen: false,
      isSlideLeft: false,

      objSelectItemHistoryDetail: null,
      SUB_VIEW: 'ACCOUNT_DETAIL',
      subTitle: '',
      sliderValue: 100,
      gasInput: props.gasStation.slow + 5,
      gasLimit: Settings.gas.externalFee,
      transactionFee: 0,
      isConfirmPinCode: false,
      feeError: false
    })

    this.fWalletBalance = 0
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    this.renderCenterView = this.renderCenterView.bind(this)
    this.gasLimit = Settings.gas.externalFee
    Observer.on(OBSERVER_KEY.REFRESH_ETH_HISTORY, props.handleUpdateHistoryDataAll)
  }

  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchEtherTxsHistory()
  }

  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.REFRESH_ETH_HISTORY, this.props.handleUpdateHistoryDataAll)
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
    const { onBack, cardSelected, openModalReceive, openEditAccountModal, etherPrice, t } = this.props
    const { isLoadingSpendable } = this.state
    return (
      <div className="edt-container">
        <Header title={t('accountSumary')} leftAction={onBack}/>
        <div className="edt-top-left">
          <div className="edt-wrapAccount">
            <div className="edt-info-22 editHeight57">
              <div className="edt-card-name">{cardSelected.cardName === 'Main Account' ? t('mainAccount') : cardSelected.cardName}</div>
              {cardSelected.key !== 0 && <div className="edt-card-edit" onClick={openEditAccountModal}><img src={Images.ic_edit_grey}/></div>}
              <div className="edt-card-addr">
                {cardSelected.address}
                <span onClick={() => this.onCopy(t, cardSelected.address)}>
                  <img src={Images.ic_copy} className="edt-copy-addr-btn"/>
                </span>
              </div>
            </div>
            <div className="edt-container-info">
              <img className="edt-img-card" alt="img" src={cardSelected.key >= 12 ? Images.cardEther[(cardSelected.key + 1) % 12] : Images.cardEther[cardSelected.key % 12]}/>
              <div className="edt-info">
                <div className="edt-balance">{<FormatBalance balance={cardSelected.balance} />} {HBCRYPTO.ETHEREUM}</div>
                <div className="edt-currency">{this.currency}{<FormatFiat balance={cardSelected.fiatAmount}/>}</div>
                <div className="edt-eth-price">1 {HBCRYPTO.ETHEREUM} = {<FormatFiat balance={etherPrice.price}/>}</div>
              </div>
              <div className="edt-qrcode" id="btnHover" onClick={!isLoadingSpendable ? openModalReceive : null}>
                <QRCode value = {cardSelected.address} size={107} bgColor="#fff" fgColor="#172540"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  get renderTopRight () {
    const { t } = this.props
    return (
      <div className="edt-top-right">
        <div className="edt-txt-header">
          <p className="edt-credit-header-text ">{t('LatestTransactions')}</p>
        </div>
      </div>
    )
  }

  get renderRightView () {
    const { etherPrice, clickOnCell, handleInfiniteOnLoad, arrAccountHistoryData, trackingSendTxs, cardSelected } = this.props
    const { historyData, hasMore } = this.state
    const arrTrackingSending = filterListSending(trackingSendTxs, null, cardSelected.address)
    return (
      <div className='etd-list-container'>
        <ListTransaction
          isLoading={typeof arrAccountHistoryData.datas === 'undefined' || arrAccountHistoryData.isLoading}
          currency={this.currency}
          handleInfiniteOnLoad={handleInfiniteOnLoad}
          hasMore={hasMore}
          tokenPrice={etherPrice.price}
          historyTxs={historyData} 
          clickOnCell={clickOnCell}
          arrTrackingSending={arrTrackingSending}
        />
      </div>
    )
  }

  render () {
    const { SUB_VIEW, txtReceiveAddr, txtSendAmount, iCountPercent, transactionFee, gasInput } = this.state
    const { t, cardSelected, etherPrice, onBack, closeEditAccountModal, selectAccountBook } = this.props
    return (
      <div className='ads-rightSide ads-edt-rightSide'>
        <TabLayoutContainer
          topLeft={this.renderTopLeft}
          topRight={this.renderTopRight}
          centerRight={this.renderRightView}
          topLeftHeight={292}
        >
          { this.renderCenterView(SUB_VIEW) }

          <Modal ref="mdEditAccount">
            <MdEditAccount cardSelected={cardSelected} onCloseModal={closeEditAccountModal}/>
          </Modal>

          <Modal ref="modalRequestReceive" className="md-request fix-layoutQR">
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
              backToAccountDetail={() => this.setState({SUB_VIEW: ACCOUNT_DETAIL_SUB_VIEW.ACCOUNT_DETAIL})}
              txtReceiveAddr={txtReceiveAddr}
              cardSelected={cardSelected}
              txtSendAmount={txtSendAmount}
              iCountPercent={iCountPercent}
              fEthConvert={etherPrice.price}
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

  renderCenterView (VIEW) {
    const {onChangeReceiverAccount, onChangeCurrencyAmount, onChangeEthereumAmount,
      openAddressBook, cancelAction, sendAction, cardSelected,
      arrCurrencyData, t, onSelectMax, pendingTx, handleChangeGasPrice, gasStation
    } = this.props
    const { txtSendAmount, fSpendable,
      isDisableSend, isLoadingSpendable,
      gasLimit, gasInput, transactionFee, feeError, subTitle
    } = this.state

    const isPending = pendingTx.isPending && pendingTx.account.address === cardSelected.address

    switch (VIEW) {
    case ACCOUNT_DETAIL_SUB_VIEW.NEW_PAYMENT:
      this.setState({subTitle: t('NewPaymentMethod')})
      return (
        <NewPaymentMethod backToAccountDetail={() => this.setState({SUB_VIEW: ACCOUNT_DETAIL_SUB_VIEW.PAYMENT_MENTHUD})}/>
      )
    case ACCOUNT_DETAIL_SUB_VIEW.PAYMENT_MENTHUD:
      this.setState({subTitle: t('PaymentMethod')})
      return (
        <PaymentMethod
          backToAccountDetail={() => this.setState({SUB_VIEW: ACCOUNT_DETAIL_SUB_VIEW.FUND_WITH_CREDIT_CARD})}
          gotoNewPaymentView={() => this.setState({SUB_VIEW: ACCOUNT_DETAIL_SUB_VIEW.NEW_PAYMENT})}
        />
      )
    case ACCOUNT_DETAIL_SUB_VIEW.FUND_WITH_CREDIT_CARD:
      this.setState({subTitle: t('funCreditCard')})

      return (
        <FundWithCreditCard
          backToAccountDetail={() => this.setState({SUB_VIEW: ACCOUNT_DETAIL_SUB_VIEW.ACCOUNT_DETAIL})}
          gotoPaymentView={() => this.setState({SUB_VIEW: ACCOUNT_DETAIL_SUB_VIEW.PAYMENT_MENTHUD})}
        />
      )
    default:
      this.setState({subTitle: t('Send')})
      return (
        <div className="edt-wrap-StyleRoot">
          <div className="edt-title">{subTitle}</div>
          <StyleRoot style={{height: 'calc(100% - 70px)', overflowY: 'scroll'}} id='HBScrollBar' className="edt-body">
            <div
              className="styleRoot-container form-padding send-form es-edit-padding">
              <div className="edt-forWrapScroll">
                <div className={isLoadingSpendable ? 'styleRoot-containerDisable' : 'styleRoot-container-width'} >
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
                      <div className="edt-label-14">{t('etherAmount')}</div>
                      <HBInput
                        className={'mh-input-41'}
                        symbol='ETH'
                        isSpacing={true}
                        isError={this.state.isSendAmountErr}
                        messageError={t('amountErrETH')}
                        value={this.state.txtSendAmount}
                        onChange={(value) => onChangeEthereumAmount(value)}/>
                    </Col>
                  </Row>
                  <Row className="edt-row-container edt-mgBottom25">
                    <Col span={17}>
                      <div className="edt-label-14">{t('amount', {arrCurrencyData: arrCurrencyData})}</div>
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
                        : <div className="edt-value-14-2">{<FormatBalance balance={fSpendable}/>} ETH</div>
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
                      {gasStation && <HBGasSlider
                        transactionFee={transactionFee}
                        gasInput={gasInput}
                        gasLimit={gasLimit}
                        gasPrice={gasStation}
                        gasDefault={gasStation.slow + 5}
                        handleResult={handleChangeGasPrice}
                        t={t}
                      />}
                      {feeError && <div className="pp-showError">
                        {t('gasFeeIsNotEnough')}
                        <br/>
                        {t('howToSendSuccessfully', {fGasFee: formatNumber(transactionFee), fWalletBalance: formatNumber(this.fWalletBalance)})}
                      </div>
                      }
                    </Col>
                  </Row>
                  <Row className="edt-row-container">
                    <Col span={3} className="input-label">
                      <div className="edt-label-14-2">{t('total')}</div>
                    </Col>
                    <Col span={14}>
                      <div className="edt-value-14-2">{<FormatBalance balance={Number(txtSendAmount) + Number(transactionFee)}/>} ETH</div>
                    </Col>
                  </Row>
                </div>
                <Row className="edt-row-container edt-bottomPage">
                  <Col span={17} className="edt-group-button edt-2btnSend">
                    <Button onClick={cancelAction} className="btn-init-screen edt-button edt-text-capitalize">{t('cancel')}</Button>
                    <div className="edt-space"/>
                    <Button disabled={isDisableSend}
                      onClick={() => sendAction(ACCOUNT_DETAIL_SUB_VIEW.CONFIRM_SEND)} id={(isDisableSend) ? 'inActiveBtn' : 'activeBtn'}
                      className="btn-init-screen edt-button-send">{t('Send')}</Button>
                  </Col>
                </Row>
              </div>
            </div>
          </StyleRoot>
        </div>
      )
    }
  }

  // MARK: Confirm Pincode
  funcSetActiveScreen = (value) => {
    this.setState({
      isConfirmPinCode: !value,
      SUB_VIEW: ACCOUNT_DETAIL_SUB_VIEW.CONFIRM_SEND,
      isSlideLeft: true
    })
  }
  funcCompleteInputPINCode = (value, self) => this.props.onCompleteInputPINCode(value, self)
  funcChangeInputPINCode =(value, index) => console.log(value, index)
}
