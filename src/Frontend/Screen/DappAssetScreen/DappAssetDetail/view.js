import React from 'react'
import MdSearAccountBook from 'Frontend/Screen/EthereumScreen/Components/MdSearAccountBook'
import MdSendAssetDirect from '../Components/MdSendAssetDirect'
import MdSendAssetSmartContract from '../Components/MdSendAssetSmartContract'
import MdSelectCurrency from '../Components/MdSelectCurrency'
import MdBuyAsset from '../Components/MdBuyAsset'
import MdSendToAnotherUser from '../Components/MdSendToAnotherUser'
import HowToSend from '../Components/HowToSend'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import { HBPopupConfirm } from 'Frontend/Components/HBPopup'
import { Menu, List, Dropdown, Tooltip } from 'antd'
import { Wave } from 'better-react-spinkit'
import { Spin } from 'Frontend/Components/HBLoader'
import Settings from 'Backend/settings'
import { openBrowserInNewTab } from 'Utils/globalFunction'
import { HBCURRENCY_SYMBOL, HBCURRENCY, arrCryptoCurrency } from 'Utils/globalConstants'
import { DotDotDotLoader } from 'react-dotdotdotloader'
import FormatBalance from 'Frontend/Components/FormatBalance'
import FormatFiat from 'Frontend/Components/FormatFiat'
import moment from 'moment'
import Images from 'Assets/Image'
import HBImage from 'Frontend/Components/HBImage'
import './styles.css'

export default class DappAssetDetail extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      gameItemDetail: props.selectedItem,
      gameInfo: {},
      strReceiverAddr: '',
      strSearchAccount: '',
      strSendAmount: '',
      strFiatAmount: '',
      strMessage: 'For Sale',
      isOwner: false,
      isLoading: true,
      isActiveHowToSend: false,
      isActiveSend: false,
      isActiveSendViaSmartContract: false,
      isSending: false,
      isReceiverErr: false,
      isSendAmountErr: false,
      isNotExistAccount: false,
      isSameAccount: false,
      isAgreeTermsOfServices: false,
      isSell: false,
      isChangePrice: false,
      isHighlight: false,
      sufficientEtherBalance: true,
      isOnSell: props.isCheckSellFromOut,
      priceGame: 0,
      numDai: 0,
      transactionFee: 0,
      gasInput: props.gasStation.slow + 5,
      gasPrice: props.gasStation,
      gasLimit: Settings.gas.externalFeeToken,
      arrPriceInfo: [
        { key: '1', name: props.t('Dapps.highTrading'), value: '-', fiatValue: '-' },
        { key: '2', name: props.t('Dapps.lowTrading'), value: '-', fiatValue: '-' },
        { key: '3', name: props.t('Dapps.averateTrading'), value: '-', fiatValue: '-' },
        { key: '4', name: props.t('Dapps.lastTrading'), value: '-', fiatValue: '-' }
      ],
      selectedCurrency: 'ETH*',
      selectedCoin: arrCryptoCurrency.find(e => e.value.includes('ETH*')),
      commissionRate: {
        commission_fee: 0.02,
        commission_fee_hb: 0.01
      },
      commissionFee: 0,
      sentComissionFee: 0,
      isSendDirect: false,
      isViaSmartContract: false,
      isAlreadyHighlight: false,
      isSentRequest: false,
      showBuyHBtoken: false,
      highlightFee: 0,
      PercentEthFee: 0.025,
      hbExchangeETH: 21,
      limitFeeTxs: 0.001,
      feeCommissionRate: 0,
      limitHBForSale: 0,
      percentDiscount: 0,
      totalPaymentAmount: 0,
      totalPaymentUSD: 0,
      isLoadingSpendable: false,
      isErrorAmount: false,
      isBuyAsset: false,
      isOnStore: false,
      isLoadingStore: false,
      isSendToAnotherUser: false,
      isLoadingSendAnother: false
    }
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    this.fWalletBalance = 0
    this.fHBTokenBalance = 0
    this.hbTokenPrice = 0
    this.fTokenBalance = 0
    this.trueUSDPrice = 1
    this.daiPrice = 1
    this.fRate = props.etherPrice.price
    props.defaultThis(this)
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchPriceGame()
    this.props.fetchBalance()
    this.props.fetchHBTokenBalance()
    this.props.fetchTrueUSDPrice()
    this.props.fetchDaiUSDPrice()
    this.props.fetchCommissionFee()
    this.props.fetchCdaiKachiage()
    this.props.checkIsRequestItem()
    this.props.checkInStore()
  }
  render () {
    return (
      <React.Fragment>
        { 
          this.state.isActiveHowToSend
            ? <HowToSend THIS={this} />
            : this.state.isActiveSendViaSmartContract
              ? <MdSendAssetSmartContract THIS={this}/>
              : this.renderAssetDetail() 
        }
        <Modal ref="md_send_direct_address">
          <MdSendAssetDirect THIS={this}/>
        </Modal>
        <Modal ref="md_send_smart_contract">
          <MdSendAssetSmartContract THIS={this}/>
        </Modal>
        <Modal ref="md_select_currency">
          <MdSelectCurrency THIS={this}/>
        </Modal>
        <Modal ref="md_buy_asset">
          <MdBuyAsset THIS={this}/>
        </Modal>
        <Modal ref="md_send_to_another_user">
          <MdSendToAnotherUser THIS={this}/>
        </Modal>
        <Modal ref="modalAccountBook">
          <MdSearAccountBook 
            that={this}
            selectAccountBook={this.props.selectAccountBook}
          />
        </Modal>
        <Modal ref="md_retrieve">
          <HBPopupConfirm 
            onOk={this.props.onRetrieve} 
            onCancel={this.props.onCloseRetrieveModal} 
            header={this.props.t('Dapps.retrieveAsset')} 
            titleOk={this.props.t('Dapps.retrieve')}
            titleCancel={this.props.t('cancel')}
            isExecuting={this.state.isSending}
            t={this.props.t}>
            <div className="loading"><Spin size={18}/></div>
            <p>{this.props.t('Dapps.retrieveNote')}</p>
          </HBPopupConfirm>
        </Modal>
      </React.Fragment>
    )
  }
  renderAssetDetail () {
    return (
      <div className="dapp-wrapper">
        <div className="dapp-search">
          <div className="dapp-back" onClick={this.props.backToTop}>
            <img className="img-back" alt="imgBack" src={Images.tabNaviBack} />
            {this.props.t('back')}
          </div>
        </div>
        <div className="dapp-asset">
          <div className="dapp-left-body">
            <div className="dapp-my-assets">
              {this.props.selectedItem.name}
              {this.props.isStore && <div className="dapp-start-date">
                {this.props.t('Dapps.startDate')}:
                <span>{moment(this.props.selectedItem.createdAt).format('YYYY/MM/DD')}</span>
              </div>}
            </div>
            <div className="dapp-asset-detail">
              { this.renderAssetLeft() }
              { this.renderAssetRight() }
            </div>
          </div>
        </div>
      </div>
    )
  }
  renderAssetLeft () {
    const { isOnSell, priceGame, selectedCoin, gameItemDetail, numDai } = this.state
    const { selectedItem, isStore, trackingSendTxs, t, clickToGame } = this.props
    const isLoadingSend = trackingSendTxs.find(e => e.gameItem && e.gameItem.id.toString() === selectedItem.id.toString() && e.toAddr.toLowerCase() === (selectedItem.address ? selectedItem.address.toLowerCase() : ''))
    return (
      <div className="dapp-asset-left">
        {
          selectedItem.image && selectedItem.image.length > 0
            ? <div className="dapp-asset-thumbnail"><HBImage logo={selectedItem.image} imgDefault={Images.ic_default_monster} addClass={'dapp-width149'}/></div>
            : <div className="dapp-asset-thumbnail">
              <img src={Images.ic_default_monster}/>
              <div className="dapp-asset-no-img">{t('Dapps.thisItemHasNoImage')}</div>
            </div>
        }
        {
          ((isOnSell && !isStore) || selectedItem.isPending || (isLoadingSend ? (isStore ? isLoadingSend.note === 'buying' : true) : false))
            ? <div className={`dapp-asset-${isLoadingSend && isLoadingSend.note && isLoadingSend.note.length > 0 ? isLoadingSend.note : (selectedItem.isPending ? selectedItem.isPending : 'selling')}`}>
              {t(`Dapps.${isLoadingSend && isLoadingSend.note && isLoadingSend.note.length > 0 ? isLoadingSend.note : (selectedItem.isPending ? selectedItem.isPending : 'selling')}`)}
              <DotDotDotLoader 
                show={true}
                amount={3}
                interval={300}
                repeat={true}
              />
            </div>
            : null
        }
        {
          numDai > 0
            ? <div className="dapp-value-dai">
              <div className="dapp-value-dai-txt">{t('HistoryDetail.Value')}:</div>
              <FormatBalance balance={numDai} symbol={'DAI'}/>
              <span> DAI</span>
            </div>
            : null
        }
        <div className="dapp-asset-content">
          <div className="dapp-asset-game dapp-blueText" onClick={() => openBrowserInNewTab(gameItemDetail.url)}>
            <img src={selectedItem.icon} className="dapp-game-icn"/>
            {selectedItem.game}
          </div>
          <div className="dapp-asset-name">{'#' + selectedItem.id}</div>
          {
            gameItemDetail.usdAvgPrice && gameItemDetail.usdAvgPrice !== '-'
              ? <div className="dapp-asset-see-history">
                <button className="btn btn-default" onClick={() => openBrowserInNewTab(`https://nagemon.com/assets/valuedMonDetail/${selectedItem.symbol}/${encodeURIComponent(selectedItem.name)}`)}>{t('Dapps.seeTradingHistory')}</button>
              </div>
              : null
          }
          {
            (isOnSell || isStore)
              ? <React.Fragment>
                <div className="dapp-asset-price">
                  <img src={Images.cryptoIcon[selectedCoin.symbol]} />
                  <FormatBalance balance={priceGame}/>
                  <span className="dapp-asset-symbol">{selectedCoin.symbol}</span>
                </div>
                <div className="dapp-asset-fiat">
                  {this.currency}{<FormatFiat balance={priceGame * this.fRate}/>}
                </div>
              </React.Fragment>
              : null
          }
        </div>
      </div>
    )
  }
  renderAssetRight () {
    const { arrPriceInfo, isOnSell, isOnStore, isOwner, isLoading, isSending, isLoadingStore, gameItemDetail, sufficientEtherBalance } = this.state
    const { screenConfig, trackingSendTxs, isStore, selectedItem, handleBuyAsset, handleSendDirectAddress, handleSendViaSmartContract, handleChangePrice, handleSellOrder, handleRetrieve, onResendToStore, handleSendToAnotherUser, t, localeData, onOpenNFT } = this.props
    const isLoadingSend = trackingSendTxs.find(e => e.gameItem && e.gameItem.id.toString() === selectedItem.id.toString() && e.toAddr.toLowerCase() === (selectedItem.address ? selectedItem.address.toLowerCase() : ''))
    const listCardBlockChain = screenConfig.dapp.blockchain_card_list
    const isSpecial = listCardBlockChain.includes(selectedItem.address)
    const sendAction = (
      <Menu className='tk-dropdown-container'>
        <Menu.Item key="0" onClick={handleSendDirectAddress}>{t('Dapps.directAddress')}</Menu.Item>
        {
          !selectedItem.onlyDirect
            ? <Menu.Item key="1" onClick={handleSendViaSmartContract}>{t('Dapps.viaSmartContract')}</Menu.Item>
            : null
        }
      </Menu>
    )
    return (
      <div className="dapp-asset-right">
        {isStore && <div className="dapp-start-date">
          {t('Dapps.storeID')}:
          <span>{selectedItem._id}</span>
        </div>}
        {isStore && <div className="dapp-start-date">
          {t('Dapps.seller')}:
          <span>{selectedItem.owner}</span>
        </div>}
        <div className="dapp-asset-box">
          <div className="dapp-asset-title">{t('details')}</div>
          {
            isLoading
              ? <Wave size={15} color={'white'} />
              : <List 
                grid={{gutter: 16, column: 2}}
                dataSource={gameItemDetail.itemInfo} 
                renderItem={(item) => this.renderInfoDetail(item, isLoading)}
                locale={{ emptyText: t('NoData') }}
              />
          }
        </div>
        {/* {!isStore && <List
          grid={{gutter: 16, column: 2}}
          dataSource={arrPriceInfo} 
          renderItem={(item) => this.renderPriceInfo(item, isLoading)}
        />} */}
        {isStore && selectedItem.description && selectedItem.description.length > 0 && <div className="dapp-asset-comment">
          <div className="dapp-start-date">{t('Dapps.comment')}</div>
          <div className="dapp-asset-comment-box">{selectedItem.description}</div>
          <div className="dapp-asset-comment-count">{selectedItem.description.length}/250</div>
        </div>}
        {isStore && !isOwner && !sufficientEtherBalance && <div className="dapp-error">{t('Dapps.insufficientBalance')}</div> }
        <div className="dapp-asset-action">
          {
            isSpecial
              ? <button className="btn btn-default" onClick={onOpenNFT}>{t('Dapps.manageNFT')}</button>
              : (gameItemDetail.locked)
                ? <button disabled={true} className="btn btn-disabled">{t('Dapps.lockTxs')}</button>
                : isStore
                  ? <button 
                    className="btn btn-success" 
                    disabled={isSending || isOwner || (isLoadingSend && isLoadingSend.note === 'buying') || !sufficientEtherBalance}
                    onClick={handleBuyAsset}>{localeData === 'jp' ? t('buy1') : t('buy')}</button>
                  : isOnSell
                    ? <React.Fragment>
                      <button 
                        className="btn btn-default"
                        disabled={isSending || isLoadingSend}
                        onClick={handleRetrieve}>{t('Dapps.retrieve')}</button>
                      { gameItemDetail.version === 2
                        ? <button 
                          className="btn btn-default" 
                          disabled={isSending || isLoadingSend}
                          onClick={handleChangePrice}>{t('Dapps.changePrice')}</button>
                        : null
                      }
                    </React.Fragment>
                    : <React.Fragment>
                      { gameItemDetail.version === 2
                        ? <React.Fragment>
                          {
                            !selectedItem.onlyDirect
                              ? <button 
                                disabled={isSending || isLoadingSend}
                                className="btn btn-warning"
                                onClick={handleSellOrder}>{localeData === 'jp' ? t('sell1') : t('sell')}</button>
                              : null
                          }
                          <Dropdown overlay={sendAction} trigger={['hover']} placement="bottomCenter" disabled={isSending || isLoadingSend}>
                            <button
                              className="btn btn-danger"
                              disabled={isSending || isLoadingSend}>{t('Send')}</button>
                          </Dropdown>
                        </React.Fragment>
                        : null
                      }
                    </React.Fragment>
          }
        </div>
        {
          isOnSell && !isStore && gameItemDetail.version === 2
            ? <div className="dapp-asset-resend">
              <button 
                disabled={isSending || isLoadingSend}
                className="btn btn-default"
                onClick={handleSendToAnotherUser}>{t('Dapps.sendToAnotherUser')}</button>
              {
                !isOnStore 
                  ? <React.Fragment>
                    <button 
                      disabled={isSending || isLoadingSend || isLoadingStore}
                      className="btn btn-default"
                      onClick={onResendToStore}>{isLoadingStore ? <Spin size={15} color={'white'}/> : t('Dapps.resendToStore')}</button>
                    <Tooltip placement="right" title={this.props.t('Dapps.resendNote')}>
                      <img src={Images.ic_help} className="dapp-resend-help"/>
                    </Tooltip>
                  </React.Fragment>
                  : null
              }
            </div>
            : null
        }
      </div>
    )
  }
  renderInfoDetail (item, isLoading) {
    return (
      <List.Item>
        <div className="dapp-asset-spec">
          {item.name}:
          {isLoading
            ? <Wave size={15} color={'white'} />
            : <span>{item.value ? item.value : '-'}</span>
          }
        </div>
      </List.Item>
    )
  }
  renderPriceInfo (item, isLoading) {
    return (
      <List.Item>
        <div className="dapp-asset-box">
          <div className="dapp-asset-title">{item.name}</div>
          <div className="dapp-asset-value">
            {isLoading
              ? <Wave size={15} color={'white'} />
              : item.value
            }
            <span>ETH</span>
          </div>
          <div className="dapp-asset-fiat">
            {isLoading
              ? <Wave size={15} color={'white'} />
              : item.fiatValue
            }
            <span>{this.props.arrCurrencyData}</span>
          </div>
        </div>
      </List.Item>
    )
  }
}
