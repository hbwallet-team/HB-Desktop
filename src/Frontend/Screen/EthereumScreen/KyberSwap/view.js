import React from 'react'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import { HBInput } from 'Frontend/Components/HBInput'
import FormatBalance from 'Frontend/Components/FormatBalance'
import { HBCURRENCY_SYMBOL, HBCURRENCY, ETH_COIN, DAI_COIN, SWAP_ADDRESS, ONE_TIME } from 'Utils/globalConstants'
import { openBrowserInNewTab, formatNumber, formatNumberOld, formatFiatDisplay } from 'Utils/globalFunction'
import HBChart from 'Frontend/Components/HBChart'
import HBGasSlider from 'Frontend/Components/HBGasSlider'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import ConfirmSwap from './ConfirmSwap'
import OutputToken from './OutputToken'
import { Wave, ThreeBounce } from 'better-react-spinkit'
import Images from 'Assets/Image'
import './styles.css'

export default class KyberSwap extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      arrSearch: null,
      sourceCoin: props.selectedCoin ? props.selectedCoin : ETH_COIN,
      outputCoin: props.selectedCoin && props.selectedCoin.symbol !== 'ETH' ? ETH_COIN : props.targetCoin ? props.targetCoin : DAI_COIN,
      objSelectCoin: props.selectedCoin && props.selectedCoin.symbol !== 'ETH' ? ETH_COIN : props.targetCoin ? props.targetCoin : DAI_COIN,
      txtFrom: '',
      txtTo: '',
      txtSearchCoin: '',
      transactionFee: 0,
      gasInput: props.gasStation.slow + 5,
      gasLimit: 800000,
      gasPrice: props.gasStation,
      sufficientBalance: true,
      abiSwap: null,
      contractSwap: SWAP_ADDRESS,
      conversionRate: 0,
      fRate: 0,
      spendable: 0,
      isActiveSend: false,
      isSending: false,
      isLoadingBalance: true,
      isErrSameCoin: false,
      isSupportSwap: true,
      isSendAmountErr: false,
      chartTime: ONE_TIME.ONE_DAY,
      tokenPrice: {
        price: 0,
        percent_change_24h: 0
      },
      isLoadingTokenPrice: false
    }
    this.fWalletBalance = 0
    this.fTokenBalance = 0
    props.defaultThis(this)
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchOutputToken()
    this.props.fetchTokenPrice()
  }
  render () {
    const { t, backToTop, onChangeFrom, onChangeTo, handleChangeGasPrice, openModalConfirmSwap, openModalOutputToken, onSelectMax, onClickCancel } = this.props
    const { sourceCoin, outputCoin, txtFrom, txtTo, transactionFee, spendable, gasInput, gasLimit, gasPrice, sufficientBalance, isActiveSend, isLoadingBalance, isErrSameCoin, isSupportSwap, isSendAmountErr } = this.state
    return (
      <React.Fragment>
        <Header title={t('accountSumary')} leftAction={backToTop} />
        <div className="kyber-swap-wrapper" id="HBScrollBar">
          <div className="page-title">
            {t('KyberSwap.network')}
            <span className="kyber-swap-help" onClick={() => openBrowserInNewTab('https://kyberswap.com/faq')}>
              <img src={Images.ic_help}/>
            </span>
          </div>
          <div className="kyber-swap-body">
            <div className="kyber-swap-block">
              <div className="kyber-swap-amount">{t('KyberSwap.tokenAmount', { token: sourceCoin.name })}</div>
              <HBInput
                symbol={sourceCoin.symbol}
                iconLeft={sourceCoin.symbol === 'ETH' ? Images.ic_eth_request : sourceCoin.iconImage}
                isSpacing={true}
                placeholder=''
                isError={isSendAmountErr}
                messageError={sourceCoin.symbol === 'ETH' ? t('amountErrETH') : t('amountErrToken')}
                value={txtFrom}
                textSymbol={'exs-textSymbol'}
                onChange={(value) => onChangeFrom(value)}
              />
              <div className="kyber-swap-row">
                <div className="kyber-swap-spendable">
                  <span className="kyber-swap-spendable-txt">{t('spendAble')}</span>
                  {
                    isLoadingBalance
                      ? <Wave size={13} color="white" />
                      : <span><FormatBalance balance={spendable}/> {sourceCoin.symbol}</span>
                  }
                </div>
                <div className="kyber-swap-maximum" onClick={onSelectMax}>{t('max1')}</div>
              </div>
            </div>
            <div className="kyber-swap-arrow">
              <img src={Images.ic_arrow_left}/>
            </div>
            <div className="kyber-swap-block">
              <div className="kyber-swap-amount">{t('KyberSwap.tokenAmount', { token: outputCoin.name })}</div>
              <HBInput
                symbol={outputCoin.symbol}
                iconLeft={outputCoin.symbol === 'ETH' ? Images.ic_eth_request : outputCoin.iconImage}
                isError={isErrSameCoin}
                messageError={t('KyberSwap.errorSameCoin')}
                isSpacing={true}
                placeholder=''
                value={txtTo}
                textSymbol={'exs-textSymbol'}
                onChange={(value) => onChangeTo(value)}
              />
              <div className="kyber-swap-switch-token">
                <button className="btn btn-default" onClick={openModalOutputToken}>{t('KyberSwap.swapToAnotherToken')}</button>
              </div>
            </div>
          </div>
          {!isSupportSwap && <div className="kyber-swap-not-support">{t('KyberSwap.swapNotSupport', { from: sourceCoin.symbol, to: outputCoin.symbol })}</div>}
          <div className="kyber-swap-gas">
            <div className="kyber-swap-gas-label">{t('selectFee')}</div>
            <HBGasSlider
              transactionFee={transactionFee}
              gasInput={gasInput}
              gasLimit={gasLimit}
              gasPrice={gasPrice}
              gasDefault={50}
              handleResult={handleChangeGasPrice}
              t={t}
            />
          </div>
          {!sufficientBalance && <div className="kyber-swap-not-support">
            {t('gasFeeIsNotEnough')}
            <br/>
            {t('howToSendSuccessfully', { fGasFee: formatNumber(transactionFee, 8), fWalletBalance: formatNumber(this.fWalletBalance, 8) })}
          </div>}
          <div className="kyber-swap-footer">
            <button className="btn btn-default" onClick={onClickCancel}>{t('Cancel')}</button>
            <div className="kyber-swap-footer-right">
              <button 
                className="btn btn-success" 
                disabled={!isActiveSend}
                onClick={openModalConfirmSwap}
              >{t('KyberSwap.swap')}</button>
            </div>
          </div>
        </div>
        { this.renderChart() }
        <Modal ref="modal_confirm_swap">
          <ConfirmSwap THIS={this} />
        </Modal>
        <Modal ref="modal_output_token">
          <OutputToken THIS={this} />
        </Modal>
      </React.Fragment>
    )
  }
  renderChart () {
    const { arrChartTokenDetail, arrChartTokenDetailYear, changeChartTime, t } = this.props
    const { chartTime, isLoadingTokenPrice, tokenPrice, outputCoin } = this.state
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
      <div className="kyber-swap-chart">
        <div className="e-top-right-info">
          <div className='eth-change24-first'>
            <div className='etherPrice12'>{t('price2', {tokenName: outputCoin.symbol})}</div>
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
            ? <div className="chart-container"><HBChart widthCustom={850} heightCustom={150} datas={datas} dataKey={outputCoin.tokenId.toString().trim().length > 0 ? 'close' : 'price'}/></div>
            : <div className="e-loading-chart exc-center-chart e-empty-color">{t('ChartEmpty')}</div>
        }
      </div>
    )
  }
}
