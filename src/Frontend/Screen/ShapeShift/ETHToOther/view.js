import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import { FaCaretDown, FaArrowRight } from 'react-icons/lib/fa'
import AnimateHeight from 'react-animate-height'
import { List, Tooltip } from 'antd'
import { formatNumber } from 'Utils/globalFunction'
import { HBCRYPTO, HBCURRENCY_SYMBOL } from 'Utils/globalConstants'
import { Wave, FadingCircle } from 'better-react-spinkit'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import ExchangeConfirm from './exchangeConfirm'
import Radium, { StyleRoot } from 'radium'
import { fadeIn } from 'react-animations'
import ConfirmPINCodeScreen from 'Frontend/Screen/SettingScreen/sub-view/ConfirmPINCodeScreen/view'

const coinDefault = {
  key: 0,
  image: Images.bitcoin,
  name: 'Bitcoin',
  symbol: 'BTC',
  color: 'rgb(244,148,28)'
}

const ScreenAnimationDefault = {
  animation: 'x ' + 1 + 's',
  animationName: Radium.keyframes(fadeIn, 'fadeIn')
}

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.funcDefautlThis(this)
    this.state = ({
      isActiveExchange: false,
      coinRight: coinDefault,
      coinLeft: props.arrCardData[0],
      coinColor: 'yellow',
      fRateConvert: 0,
      marketInfo: null,
      arrListCoin: [],
      cardFiatBalance: 0,
      objListCoin: null,
      heightListCoin: 0,
      heightListCard: 0,
      txtEther: '',
      txtCoinSelected: '',
      isCoinSelectedPlaceholder: true,
      txtDestination: '',
      cardBalance: 0,
      isMinErr: false,
      isNotEnoughEthErr: false,
      isDestinationError: false,
      isExchanging: false,
      rateBtn: '',
      depositAddr: '',
      iStageExchange: 0,
      amountDepo: 0,
      amountWidthdraw: 0,
      isConfirmPinCode: props.arrPinCodeData.length > 0
    })
    this.toggleListCoin = this.toggleListCoin.bind(this)
    this.renderRow1 = this.renderRow1.bind(this)
    this.renderRow2 = this.renderRow2.bind(this)
    this.renderRow4 = this.renderRow4.bind(this)
  }

  componentDidMount () {
    this.props.fetchInitData()
  }

  toggleListCoin = () => {
    const { heightListCoin } = this.state

    this.setState({
      heightListCard: 0,
      heightListCoin: heightListCoin === 0 ? 524 : 0
    })
  };
  toggleListCard = () => {
    const { heightListCard } = this.state

    this.setState({
      heightListCoin: 0,
      heightListCard: heightListCard === 0 ? (this.props.arrCardData.filter(c => c.isEnabled && c.address.length > 0).length * 60) : 0
    })
  };

  render () {
    const {
      isExchanging, heightListCard, heightListCoin, isActiveExchange,
      isConfirmPinCode
    } = this.state
    const { t, onBack } = this.props

    return (
      isConfirmPinCode
        ? <ConfirmPINCodeScreen
          t={t}
          onChangeInputPINCode={this.funcChangeInputPINCode}
          onCompleteInputPINCode={this.funcCompleteInputPINCode}
          parent={'AccountDetailScreen'}
          setIsActiveScreen={this.funcSetActiveScreen}/>

        : isActiveExchange
          ? <ExchangeConfirm THIS={this} />
          : <StyleRoot style={{ height: '100%' }}>
            <div className='touch-view' style={[ScreenAnimationDefault, {pointerEvents: (isExchanging ? 'none' : 'unset')}]}
              onClick={() => {
                if (heightListCard > 0) {
                  this.setState({
                    heightListCard: 0
                  })
                }
                if (heightListCoin > 0) {
                  this.setState({
                    heightListCoin: 0
                  })
                }
              }}>
              <Header leftAction={onBack} title={t('ShapeShiftTop')}/>
              <div className="ess-container">
                <div className='ess-top'>
                  {this.renderRow1()}
                  {this.renderRow2()}
                </div>
                {this.renderRow4()}
              </div>
            </div>
          </StyleRoot>
    )
  }

  renderRow4 () {
    const {
      txtEther, isDestinationError,
      isMinErr, isNotEnoughEthErr, txtDestination,
      isExchanging, coinRight, marketInfo
    } = this.state
    const { handleExchange, t } = this.props

    return (
      <div className='ess-row-4'>
        <div className='ess-error-container'>
          {isNotEnoughEthErr
            ? <div className='ess-error-content'>
              {t('YourDepositMustBe', {getNumber: marketInfo ? formatNumber(marketInfo.minimum, 8) : 0})}
            </div>
            : isMinErr ? <div className='ess-error-content'>
              {t('PleaseDepositAtLeast', {getNumber: marketInfo ? formatNumber(marketInfo.minimum, 8) : 0})}
            </div>
              : isDestinationError
                ? <div className='ess-error-content'>
                  {t('invalidAddress', {coinRight: coinRight.symbol})}
                </div>
                : null
          }
        </div>
        <div className='ess-row-4-btn-groub'>
          <button
            disabled={isExchanging || isMinErr || isNotEnoughEthErr || txtEther.length === 0 || txtDestination.length === 0}
            id={(isExchanging || isMinErr || isNotEnoughEthErr || txtEther.length === 0 || txtDestination.length === 0) ? 'btnDisable' : 'btnScale-active'}
            className="ess-button"
            onClick={handleExchange}
          >{isExchanging ? <FadingCircle size={25} color={'white'}/> : t('Shift')}</button>
        </div>
      </div>
    )
  }

  renderRow2 () {
    const {
      txtEther, coinRight, txtCoinSelected,
      isCoinSelectedPlaceholder, fRateConvert, marketInfo
    } = this.state
    const {
      onChangeEther, etherPrice, onClickMax, onClickMin,
      arrCurrencyData, onChangeCoinSelected, t
    } = this.props
    let currencyValue = (Number(txtCoinSelected) / fRateConvert * etherPrice.price)

    return (
      <div className='ess-row-2'>
        <div className='ess-row-2-container'>
          <div className='ess-row-2-1'>
            <div className='ess-row-2-textbox'>
              <input
                disabled={fRateConvert ? '' : 'disabled'}
                placeholder='0.00'
                className='ess-textbox-Ether'
                value={txtEther}
                onChange={event => {
                  onChangeEther(event.target.value)
                }}
              />
              <span className='ess-input-symbol'>{HBCRYPTO.ETHEREUM}</span>
            </div>
            <div className='ess-row-2-value'>
              <div className='ess-row-2-value-currency'>{formatNumber((Number(txtEther) * etherPrice.price), 2)}</div>
              <span className='ess-input-symbol'>{HBCURRENCY_SYMBOL[arrCurrencyData]}</span>
            </div>
          </div>
          <div className='ess-row-2-mid'/>
          <div className='ess-row-2-2'>
            <div className='ess-row-2-textbox' style={{borderBottom: '1px solid ' + coinRight.color}}>
              <input
                disabled={fRateConvert ? '' : 'disabled'}
                className='ess-textbox-Ether'
                style={{
                  color: coinRight.color
                }}
                value={txtCoinSelected}
                onChange={event => {
                  onChangeCoinSelected(event.target.value)
                }}
              />
              {isCoinSelectedPlaceholder ? <span className='ess-input-placeholder' style={{color: coinRight.color}}>0.00</span> : ''}
              <span className='ess-input-symbol' style={{color: coinRight.color}}>{coinRight.symbol}</span>
            </div>
            <div className='ess-row-2-value'>
              <div className='ess-row-2-value-currency'>{(currencyValue && currencyValue !== Infinity) ? formatNumber(currencyValue, 2) : '0.00'}</div>
              <span className='ess-input-symbol'>{HBCURRENCY_SYMBOL[arrCurrencyData]}</span>
            </div>
          </div>
        </div>
        <div className='ess-rate-container'>
          <div className='ess-rate-right-other'>
            <div className='ess-rate-min' id='btnScale-active' onClick={() => onClickMin()}>
              <div className='ess-rate-title'>{t('Deposit_Min')}</div>
              <div className='ess-rate-value'>{marketInfo ? formatNumber(marketInfo.minimum, 8) + ' ' + HBCRYPTO.ETHEREUM : '- -'}</div>
            </div>
            <div className='ess-rate-min ess-rate-max'>
              <div id='btnScale-active' onClick={() => onClickMax()}>
                <div className='ess-rate-title'>{t('Deposit_Max')}</div>
                <div className='ess-rate-value'>{marketInfo ? formatNumber(marketInfo.maxLimit, 8) + ' ' + HBCRYPTO.ETHEREUM : '- -'}</div>
              </div>
            </div>
            <div className='ess-rate-min'>
              <div className='ess-rate-title'>{t('Transmission_Fee')}</div>
              <div className='ess-rate-value'>{marketInfo ? formatNumber(marketInfo.minerFee, 8) + ' ' + coinRight.symbol : '- -'} {}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderRow1 () {
    const {
      coinRight, heightListCoin, heightListCard, arrListCoin,
      fRateConvert, coinLeft, txtDestination
    } = this.state
    const {
      onSelectCoin, arrCardData, etherPrice, t,
      onSelectCard, arrCurrencyData, onChangeDestination
    } = this.props

    return (
      <div className='ess-row-1' >
        <div className='ess-row-1-1' style={{color: coinLeft.color}}>
          <div className='ess-row-1-1-title' >{t('SEND')}</div>
          <div className='ess-row-1-1-btn' onClick={this.toggleListCard}>
            <div className='ess-row-1-1-img-containt'>
              <img id='etherCoinImg' alt='img' src={Images.etherCoin} className='ess-img-coin-list'/>
            </div>
            <div className='ess-row-1-content' >
              <div className='ess-font-18-color '>{t('Ethereum')}<span className='ess-font-12-color '>({coinLeft.cardName})</span></div>
              <div className='ess-font-15-color '>
                {formatNumber(coinLeft.balance)}  {' ' + HBCRYPTO.ETHEREUM} <span className='ess-font-12-color '> ({formatNumber(coinLeft.balance * etherPrice.price, 2)} {HBCURRENCY_SYMBOL[arrCurrencyData]})</span>
              </div>
            </div>
            <div className='ess-faCareDown'>
              <FaCaretDown size={20}/>
            </div>
          </div>
          <div className='ess-row-1-1-address'>{coinLeft.address}</div>
          <AnimateHeight
            duration={ 500 }
            height={ heightListCard }
            className='ess-list-coin-ani1'
            style={{
              borderBottom: '1px solid #fefefe',
              borderRight: '1px solid #fefefe',
              borderLeft: '1px solid #fefefe'
            }}
          >
            <div className='ess-list-coin1' id="ScrollBarCoin">
              <List
                split={false}
                className="ess-list-content"
                dataSource={arrCardData.filter(card => card.isEnabled && card.address.length > 0)}
                renderItem={(item, index) => (
                  <List.Item className="ess-list-item" style={{color: item.color}}
                    onClick={() => onSelectCard(item)}
                  >
                    <div className='ess-row-1-1-img-containt'>
                      <img alt='img' src={Images.etherCoin} className='ess-img-coin-list'/>
                    </div>
                    <div className='ess-row-1-content'>
                      <div className='ess-font-18'>{item.cardName === 'Main Account' ? t('mainAccount') : item.cardName}</div>
                      <div className='ess-font-12'>{formatNumber(item.balance)} {HBCRYPTO.ETHEREUM}</div>
                    </div>
                  </List.Item>
                )} />
            </div>
          </AnimateHeight>
        </div>
        <div className='ess-row-1-2'>
          <div className='ess-row-1-2-arrow1' ><FaArrowRight size={20} color={coinLeft.color} /></div>
        </div>
        <div className='ess-row-1-3' style={{color: coinRight.color}}>
          <div className='ess-row-1-3-title' style={{backgroundColor: coinRight.color}}>{t('RECEIVE')}
            <div className="npm-explain-cvc-tooltip ">
              <Tooltip placement="bottom" title={<div style={{
                textAlign: 'justify',
                padding: '5px 5px 5px 5px',
                fontFamily: 'var(--font-roboto)',
                fontSize: '14px'}}>
                {t('SSTooltip1') + coinRight.name + t('SSTooltip2') + coinRight.name + t('SSTooltip3')}</div>}>
                <img alt='img' className='ess-img-question' src={Images.imgQuestion}/>
              </Tooltip>
            </div>
          </div>
          <div onClick={ this.toggleListCoin }
            className='ess-row-1-3-btn'
            style={{border: '1px solid ' + coinRight.color}}>
            <div className='ess-row-1-1-img-containt'>
              <img alt='img' src={coinRight.image} className='ess-img-coin-list'/>
            </div>
            <div className='ess-row-1-content' style={{color: coinRight.color}}>
              <div className='ess-font-18 '>{coinRight.name}</div>
              <div className='ess-font-15 '>1 {HBCRYPTO.ETHEREUM} {fRateConvert
                ? (' = ' + formatNumber(fRateConvert) + ' ' + coinRight.symbol)
                : coinRight.symbol !== HBCRYPTO.ETHEREUM
                  ? <span className='ess-rate-loading' ><Wave size={20} color={coinRight.color}/></span>
                  : '' } </div>
            </div>
            <div className='ess-faCareDown' style={{color: coinRight.color}} >
              <FaCaretDown size={20}/>
            </div>
          </div>
          <div className='ess-destination-input'>
            <input
              placeholder={t('Destination_Account') + ' (' + coinRight.symbol + ')'}
              value={txtDestination}
              onChange={event => {
                onChangeDestination(event.target.value)
              }}
              className='ss-input-destination'
              style={{
                borderBottom: '1px solid ' + coinRight.color,
                borderRight: '1px solid ' + coinRight.color,
                borderLeft: '1px solid ' + coinRight.color
              }}
              autoFocus={true}
            />
          </div>
          <AnimateHeight
            duration={ 500 }
            height={ heightListCoin }
            className='ess-list-coin-ani'
            style={{
              borderBottom: '1px solid ' + coinRight.color,
              borderRight: '1px solid ' + coinRight.color,
              borderLeft: '1px solid ' + coinRight.color
            }}
          >
            <div className='ess-list-coin' id="ScrollBarCoin">
              <List
                split={false}
                className="ess-list-content"
                dataSource={arrListCoin}
                renderItem={(item, index) => (
                  <List.Item className="ess-list-item" style={{color: item.color}}
                    onClick={() => onSelectCoin(item)}
                  >
                    <div className='ess-row-1-1-img-containt'>
                      <img alt='img' src={item.image} className='ess-img-coin-list'/>
                    </div>
                    <div className='ess-row-1-content'>
                      <div className='ess-font-18'>{item.name}</div>
                      <div className='ess-font-12'>{item.symbol}</div>
                    </div>
                  </List.Item>
                )} />
            </div>
          </AnimateHeight>
        </div>
      </div>
    )
  }
  // MARK: Confirm Pincode
  funcSetActiveScreen = (value) => {
    this.setState({
      isConfirmPinCode: !value
    })
  }
  funcCompleteInputPINCode = (value, self) => this.props.onCompleteInputPINCode(value, self)
  funcChangeInputPINCode =(value, index) => console.log(value, index)
}
