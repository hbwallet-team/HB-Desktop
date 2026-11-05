import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import { FaArrowRight, FaCaretDown } from 'react-icons/lib/fa'
import AnimateHeight from 'react-animate-height'
import { List } from 'antd'
import { formatNumber } from 'Utils/globalFunction'
import { HBInput } from 'Frontend/Components/HBInput'
import { HBCRYPTO, HBCURRENCY_SYMBOL } from 'Utils/globalConstants'
import { Wave, FadingCircle } from 'better-react-spinkit'
import Header from 'Frontend/Container/CoreLayoutContainer/header'

const coinDefault = {
  key: 0,
  image: Images.bitcoin,
  name: 'Bitcoin',
  symbol: 'BTC',
  color: 'rgb(244,148,28)'
}

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.funcDefautlThis(this)
    this.state = ({
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
      rateBtn: ''
    })
    this.toggleListCoin = this.toggleListCoin.bind(this)
    this.renderRow1 = this.renderRow1.bind(this)
    this.renderRow2 = this.renderRow2.bind(this)
    this.renderRow4 = this.renderRow4.bind(this)
  }

  componentWillMount () {
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
      heightListCard: heightListCard === 0 ? (this.props.arrCardData.filter(c => c.isEnabled).length * 64) : 0
    })
  };

  render () {
    const { txtDestination, coinRight, isDestinationError, isExchanging, heightListCard, heightListCoin } = this.state
    const { onChangeDestination, t, onBack } = this.props

    return (
      <div className='touch-view' style={{pointerEvents: (isExchanging ? 'none' : 'unset')}}
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
            <div className='ess-destination-input'>
              <HBInput
                placeholder={t('Destination_Account') + ' (' + coinRight.symbol + ')'}
                value={txtDestination}
                onChange={value => onChangeDestination(value)}
                className='textCenter'
                isError={isDestinationError}
                messageError={t('invalidAddress', {coinRight: coinRight.symbol})}
              />
            </div>
          </div>
          {this.renderRow4()}
        </div>
      </div>
    )
  }

  renderRow4 () {
    const {
      coinRight, txtEther, txtCoinSelected, fRateConvert,
      isMinErr, isNotEnoughEthErr, txtDestination,
      isExchanging
    } = this.state
    const { etherPrice, arrCurrencyData, handleExchange, t } = this.props

    let currencyValue = (Number(txtCoinSelected) / fRateConvert * etherPrice.price)

    return (
      <div className='ess-row-4'>
        <div className='ess-error-container'>
          {isNotEnoughEthErr
            ? <div className='ess-error-content'>
              {'Not enough Ethereum to start this exchange.'}
            </div>
            : isMinErr ? <div className='ess-error-content'>
              {'Ethereum amount is out of deposit range.'}
            </div>
              : null}
        </div>
        <div className='ess-row-4-info'>
          <div className='ess-4-1'>
            <div >
              <div className='ess-4-left' style={{color: '#bfbdbd'}}>{t('EXCHANGEING')}</div>
              <div className='ess-4-left-bold'>{txtEther.length > 0 ? formatNumber(txtEther) : '0.00'} {HBCRYPTO.ETHEREUM}</div>
              <div className='ess-4-left' style={{color: '#bfbdbd'}}>{HBCURRENCY_SYMBOL[arrCurrencyData]} {formatNumber((Number(txtEther) * etherPrice.price, 2))}</div>
            </div>
            <div className='ess-img-containt-confirm'>
              <img alt='img' src={Images.etherCoin} className='ess-img-confirm'/>
            </div>
          </div>
          <div className='ess-4-2'>
            <FaArrowRight size={20}/>
          </div>
          <div className='ess-4-3'>
            <div className='ess-img-containt-confirm'>
              <img alt='img' src={coinRight.image} className='ess-img-confirm'/>
            </div>
            <div style={{color: coinRight.color}}>
              <div style={{color: '#bfbdbd'}}>{t('WILL_RECEIVE')}</div>
              <div className='ess-4-right-bold' style={{color: coinRight.color}}>{txtCoinSelected.length > 0 ? formatNumber(txtCoinSelected) : '0.00'} {coinRight.symbol}</div>
              <div style={{color: '#bfbdbd'}}>{HBCURRENCY_SYMBOL[arrCurrencyData]} {(currencyValue && currencyValue !== Infinity) ? formatNumber(currencyValue, 2) : '0.00'}</div>
            </div>
          </div>
        </div>
        <div className='ess-row-4-btn-groub'>
          <button
            disabled={isMinErr || isNotEnoughEthErr || txtEther.length === 0 || txtDestination.length === 0}
            id={(isMinErr || isNotEnoughEthErr || txtEther.length === 0 || txtDestination.length === 0) ? 'btnDisable' : 'btnScale-active'}
            className="ess-button"
            onClick={handleExchange}
          >{isExchanging ? <FadingCircle size={25} color={'white'}/> : t('Exchange')}</button>
        </div>
      </div>
    )
  }

  renderRow2 () {
    const {
      txtEther, coinRight, txtCoinSelected, rateBtn,
      isCoinSelectedPlaceholder, fRateConvert, marketInfo
    } = this.state
    const {
      onChangeEther, etherPrice,
      arrCurrencyData, onChangeCoinSelected,
      inputEther, t
    } = this.props
    let currencyValue = (Number(txtCoinSelected) / fRateConvert * etherPrice.price)

    return (
      <div className='ess-row-2'>
        <div className='ess-rate-container'>
          <div className='ess-rate-left'>
            <div className={'ess-rate-btn ' + (rateBtn === 'all' ? 'ess-rate-btn-border-selected' : 'ess-rate-btn-border')}
              id='ess-rate-btn-active'
              onClick={() => inputEther('all')}>{t('exchange_all')}</div>
            <div className={'ess-rate-btn ' + (rateBtn === 'half' ? 'ess-rate-btn-border-selected' : 'ess-rate-btn-border')}
              id='ess-rate-btn-active'
              onClick={() => inputEther('half')}>{t('exchange_half')}</div>
            <div className={'ess-rate-btn ' + (rateBtn === 'min' ? 'ess-rate-btn-border-selected' : 'ess-rate-btn-border')}
              id='ess-rate-btn-active'
              onClick={() => inputEther('min')}>{t('exchange_min')}</div>
          </div>
          <div className='ess-rate-right'>
            <div className='ess-rate-min'>
              <div className='ess-rate-title'>{t('Deposit_Min')}</div>
              <div className='ess-rate-value'>{marketInfo ? marketInfo.minimum + ' ' + HBCRYPTO.ETHEREUM : '- -'}</div>
            </div>
            <div className='ess-rate-min ess-rate-max'>
              <div className='ess-rate-title'>{t('Deposit_Max')}</div>
              <div className='ess-rate-value'>{marketInfo ? marketInfo.maxLimit + ' ' + HBCRYPTO.ETHEREUM : '- -'}</div>
            </div>
            <div className='ess-rate-min'>
              <div className='ess-rate-title'>{t('Transmission_Fee')}</div>
              <div className='ess-rate-value'>{marketInfo ? marketInfo.minerFee + ' ' + coinRight.symbol : '- -'} {}</div>
            </div>
          </div>
        </div>
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
              <div className='ess-row-2-value-currency'>{formatNumber(Number(txtEther) * etherPrice.price, 2)}</div>
              <span>{HBCURRENCY_SYMBOL[arrCurrencyData]}</span>
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
              <span>{HBCURRENCY_SYMBOL[arrCurrencyData]}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderRow1 () {
    const {
      coinRight, heightListCoin, heightListCard, arrListCoin,
      fRateConvert, coinLeft
    } = this.state
    const {
      onSelectCoin, arrCardData, etherPrice,
      onSelectCard, arrCurrencyData
    } = this.props

    return (
      <div className='ess-row-1' >
        <div className='ess-row-1-1' onClick={this.toggleListCard}>
          <div id={'btnESS-active'} className='ess-row-1-1-btn'>
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
                dataSource={arrCardData.filter(card => card.isEnabled)}
                renderItem={(item, index) => (
                  <List.Item className="ess-list-item" style={{color: item.color}}
                    onClick={() => onSelectCard(item)}
                  >
                    <div className='ess-row-1-1-img-containt'>
                      <img alt='img' src={Images.etherCoin} className='ess-img-coin-list'/>
                    </div>
                    <div className='ess-row-1-content'>
                      <div className='ess-font-18'>{item.cardName === 'Main Account' ? t('mainAccount') : item.cardName}</div>
                      <div className='ess-font-12'>{formatNumber(item.balance, 8)} {HBCRYPTO.ETHEREUM}</div>
                    </div>
                  </List.Item>
                )} />
            </div>
          </AnimateHeight>
        </div>
        <div className='ess-row-1-2'>
          <div className='ess-row-1-2-arrow1' style={{color: '#fefefe'}}><FaArrowRight size={20}/></div>
        </div>
        <div className='ess-row-1-3'>
          <div id={'btnESS-active'} onClick={ this.toggleListCoin }
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
}
