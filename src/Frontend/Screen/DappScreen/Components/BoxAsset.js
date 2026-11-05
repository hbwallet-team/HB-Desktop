import React from 'react'
import { getPriceGameItem, getCdaiKachiage } from 'Backend/Lib/Web3/index'
import { convertWeiToBalance } from 'Utils/globalFunction'
import { arrCryptoCurrency } from 'Utils/globalConstants'
import Images from 'Assets/Image'
import { DotDotDotLoader } from 'react-dotdotdotloader'
import HBImage from 'Frontend/Components/HBImage'
import Modals from 'Frontend/Components/HBModal/FadeModal'
import ShareModal from './MdShare'
import FormatBalance from 'Frontend/Components/FormatBalance'

export default class BoxAsset extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isOnSell: false,
      priceGame: 0,
      numDai: 0,
      isHightLight: false,
      visible: false,
      crypto: 'ETH',
      selectedCoin: arrCryptoCurrency.find(e => e.value.includes('ETH*'))
    }
  }

  handleOk = e => {
    console.log(e)
    e.stopPropagation()
    this.setState({
      visible: false
    })
  }

  handleCancel = e => {
    console.log(e)
    e.stopPropagation()
    this.setState({
      visible: false
    })
  }
  showModal = e => {
    e.stopPropagation()
    this.setState({
      visible: true
    })
  }
  async componentDidMount () {
    const { screenConfig } = this.props
    const priceGame = await getPriceGameItem(
      this.props.item.address,
      this.props.item.id,
      this.props.item.businessAddress,
      this.props.item.version
    )
    const isOnSell = Number(priceGame._Price) > 0
    if (isOnSell) {
      this.setState({
        isOnSell,
        priceGame:
          Number(priceGame._Price)
            ? convertWeiToBalance(priceGame._Price)
            : 0,
        isHightLight: priceGame._isHightlight === '1',
        crypto: priceGame._crypto,
        selectedCoin: arrCryptoCurrency.find(e => e.value.includes(priceGame._crypto))
      })
    }
    if (screenConfig.dapp && screenConfig.dapp.kachiage_card_list && screenConfig.dapp.kachiage_card_list.includes(this.props.item.address)) {
      const numDai = await getCdaiKachiage(screenConfig.dapp.kachiage_address, this.props.item.address, this.props.item.id, true)
      this.setState({
        numDai
      })
    }
  }
  render () {
    const { isOnSell, isHightLight, priceGame, selectedCoin, numDai } = this.state
    const {
      trackingSendTxs,
      onClickAsset,
      item,
      isStore,
      t
    } = this.props
    const isLoadingSend = trackingSendTxs.find(
      e =>
        e.gameItem &&
        e.gameItem.id.toString() === item.id.toString() &&
        e.toAddr.toLowerCase() ===
          (item.address ? item.address.toLowerCase() : '')
    )
    return (
      <React.Fragment>
        <div>
          <Modals ref="modalShare">
            <ShareModal
              onCloseModal={e => {
                e.stopPropagation()
                this.refs.modalShare.hide()
              }}
              {...this.props}
              {...item}
            />
          </Modals>
        </div>
        <div
          className={
            'dapp-asset-item' + (isHightLight ? ' dapp-asset-hightlight' : '')
          }
          onClick={e => {
            e.stopPropagation()

            onClickAsset(item)
          }}
        >
          {isStore && (
            <div className="share-icon">
              <img
                src={Images.share_icon}
                onClick={e => {
                  e.stopPropagation()
                  this.refs.modalShare.show()
                }}
              />
            </div>
          )}
          {/* <img className="dapp-asset-more" src={Images.ic_dots_vertical}></img> */}
          {item.isSync === false && <div className="dapp-asset-sync"></div>}
          {(isOnSell && !isStore) ||
          item.isPending ||
          (isLoadingSend
            ? isStore
              ? isLoadingSend.note === 'buying'
              : true
            : false) ? (
              <div
                className={`dapp-asset-${
                  isLoadingSend &&
                isLoadingSend.note &&
                isLoadingSend.note.length > 0
                    ? isLoadingSend.note
                    : item.isPending
                      ? item.isPending
                      : 'selling'
                }`}
              >
                {t(
                  `Dapps.${
                    isLoadingSend &&
                  isLoadingSend.note &&
                  isLoadingSend.note.length > 0
                      ? isLoadingSend.note
                      : item.isPending
                        ? item.isPending
                        : 'selling'
                  }`
                )}
                <DotDotDotLoader
                  show={true}
                  amount={3}
                  interval={300}
                  repeat={true}
                />
              </div>
            ) : null}
          {item.image && item.image.length > 0 ? (
            <div className="dapp-asset-thumbnail">
              <HBImage
                logo={item.image}
                imgDefault={Images.ic_default_monster}
                addClass={'dapp-width149'}
              />
            </div>
          ) : (
            <div className="dapp-asset-thumbnail">
              <img src={Images.ic_default_monster} />
              <div className="dapp-asset-no-img">
                {t('Dapps.thisItemHasNoImage')}
              </div>
            </div>
          )}
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
            <div className="dapp-asset-game">
              <img src={item.icon} className="dapp-game-icn" />
              {item.game}
            </div>
            <div className="dapp-asset-name">{item.name}</div>
            <div className="dapp-asset-name">{'#' + item.id}</div>
            {isStore && (
              <div className="dapp-asset-price">
                <img src={Images.cryptoIcon[selectedCoin.symbol]} />
                <FormatBalance balance={priceGame}/>
                <span className="dapp-asset-symbol">{selectedCoin.symbol}</span>
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    )
  }
}
