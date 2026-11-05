import React from 'react'
import Slider from 'react-slick'
import { Spin } from 'Frontend/Components/HBLoader'
import BoxGame from './Components/BoxGame'
import BoxGameLite from './Components/BoxGameLite'
import BoxFavorite from './Components/BoxFavorite'
import BoxMedia from './Components/BoxMedia'
import BoxUnblock from './Components/BoxUnblock'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import { HBPopupConfirm } from 'Frontend/Components/HBPopup'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import { openBrowserInSameTab } from 'Utils/globalFunction'
import Observer from 'Utils/HBObserver'
import { List } from 'antd'
import Images from 'Assets/Image'
import './styles.css'
const ipc = window.require('electron').ipcRenderer

const CustomNextArrow = (props) => {
  const { className, onClick } = props
  return (
    <div
      className={className}
      onClick={onClick}
    >
      <img src={Images.tabNaviNext} />
    </div>
  )
}

const CustomPrevArrow = (props) => {
  const { className, onClick } = props
  return (
    <div
      className={className}
      onClick={onClick}
    >
      <img src={Images.tabNaviBack} />
    </div>
  )
}

export default class DappScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { 
      dappLink: '',
      strSearch: '',
      arrSearch: null,
      arrListApp: [],
      arrTopApp: [],
      arrListGenre: [],
      arrMyDapps: [],
      arrAdvertising: [],
      arrDefi: [],
      arrMedia: props.arrDappMediaNews,
      arrUnblock: props.arrDappUnblock,
      selectedGame: null,
      isRanking: false,
      isSwitchPlay: false,
      isLoading: true,
      isLoadingMyDapps: true,
      isLoadingMedia: false,
      isLoadingUnblockNews: false,
      openDappGenreScreen: false,
      openDappSettingScreen: false,
      openDappAssetScreen: false,
      openDappMarketScreen: false,
      selectedGenre: null,
      arrListAppGenre: [],
      arrListHotTop: [],
      selectedHotTop: false,
      itemFromDetail: null,
      detailToGame: false
    }
    props.defaultThis(this)
    Observer.on(OBSERVER_KEY.GET_DATA_AFTER_BUY_DAPP_ITEM, props.updateDataAfterBuyDappItem)
    Observer.on(OBSERVER_KEY.SELECT_TAB_DAPP_TO_GACHA, props.openDappGacha)
    Observer.on(OBSERVER_KEY.GO_TO_MARKET, props.onClickMarket)
  }
  componentDidMount () {
    this.props.loadingInitial()
    // this.props.getDappsmarket()
    // this.props.getUnblock()
    this.props.fetchTotalSync()
    // listening trigger from main window
    ipc.on('add-new-account', this.props.triggerAddNewAccount)
    ipc.on('import-account', this.props.triggerImportAccount)
    ipc.on('switched-account', this.props.triggerSwitchedAccount)
    ipc.on('edit-account', this.props.triggerEditAccount)
    ipc.on('deleted-account', this.props.triggerDeletedAccount)
    ipc.on('add-favorites', this.props.triggerAddFavorites)
    ipc.on('reset-wallet', this.props.triggerResetWallet)
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.GET_DATA_AFTER_BUY_DAPP_ITEM, this.props.updateDataAfterBuyDappItem)
  }
  // handle click to see all
  onClickSeeAll = (item) => () => this.props.handleSeeAll(item)
  onClickSeeAllHotTop = () => () => this.props.handleSeeAllHotTop()
  // handle click a Dapp
  onClickDapp = (item) => () => openBrowserInSameTab(item.homepage, item)
  // handle click remove from favorites
  onRemoveFavorites = (item) => () => this.props.handleRemoveFavorites(item)
  // handle click a Media
  onClickMedia = (url) => () => openBrowserInSameTab(url)
  // main render
  render () {
    return (
      <div className="dapp-wrapper">
        <div className="dapp-container">
          <div id="HBScrollBar" className="dapp-home-page">
            { this.renderFavorites() }
            <div className="dapp-block">
              <div className="dapp-block-header">{this.props.t('Dapps.recommended')}</div>
              {/* { this.renderMediaList() } */}
              {/* { this.renderMarket() } */}
              {this.state.arrListGenre.length > 0 
                ? <List 
                  dataSource={this.state.arrListGenre} 
                  renderItem={(item, index) => this.renderGenre(item, index)} />
                : null
              }
            </div>
          </div>
        </div>
        <Modal ref="md_remove_favorites">
          <HBPopupConfirm 
            onOk={this.props.onRemoveFavorites} 
            onCancel={this.props.onCloseRemoveFavoriteModal} 
            header={this.props.t('Dapps.removeFromFavorites')} 
            titleOk={this.props.t('Remove')}
            titleCancel={this.props.t('cancel')}
            t={this.props.t}
            isDelete={true}>
            <p>{this.props.t('Dapps.areYouSureRemoveFavorites')}</p>
          </HBPopupConfirm>
        </Modal>
      </div>
    )
  }
  renderFavorites () {
    return (
      <React.Fragment>
        {
          this.state.arrMyDapps.length > 0
            ? <div className="dapp-block">
              <div className="dapp-block-header">{this.props.t('Dapps.favorites')}</div>
              <div className="dapp-block-body">
                { 
                  this.state.isLoadingMyDapps
                    ? <div className="dapp-loading"><Spin/></div>
                    : <div className="dapp-my-dapps-list dapp-list">
                      <List 
                        grid={{ gutter: 16, column: 8 }}
                        dataSource={this.state.arrMyDapps} 
                        renderItem={(item, index) => this.renderMyDappItem(item, index)}
                      />
                      {/* {this.renderMyDappsCarousel(this.state.arrMyDapps)} */}
                    </div>
                }
              </div>
            </div>
            : null
        }
      </React.Fragment>
    )
  }
  renderMyDappItem (item, index) {
    return (
      <List.Item>
        <BoxFavorite item={item} key={index} openDapp={this.onClickDapp} removeFavorites={this.onRemoveFavorites}/>
      </List.Item>
    )
  }
  renderMediaList () {
    let infinite = this.state.arrMedia.length > 5
    let infinite1 = this.state.arrMedia.length > 3
    const settingsMedia = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      slidesToShow: 5,
      speed: 200,
      slidesToScroll: 4,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 3,
            infinite: infinite1,
            slidesToScroll: 2
          }
        }
      ]
    }
    return (
      <React.Fragment>
        {
          this.state.arrMedia.length > 0 
            ? <div className="dapp-block-body">
              <div className="dapp-block-title">{this.props.t('Dapps.media')}</div>
              { this.state.isLoadingMedia
                ? <div className="dapp-loading"><Spin/></div>
                : <div className="dapp-list">
                  <Slider {...settingsMedia}>{this.renderMedia(this.state.arrMedia)}</Slider>
                </div>
              }
            </div>
            : null
        }
      </React.Fragment>
    )
  }
  renderMarket () {
    let infinite = this.state.arrUnblock.length > 5
    let infinite1 = this.state.arrUnblock.length > 3
    const settingsMarket = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      slidesToShow: 5,
      speed: 200,
      slidesToScroll: 4,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 3,
            infinite: infinite1,
            slidesToScroll: 2
          }
        }
      ]
    }
    return (
      <React.Fragment>
        {
          this.state.arrUnblock.length > 0 
            ? <div className="dapp-block-body">
              <div className="dapp-block-title">{this.props.t('Dapps.unblockNews')}</div>
              { this.state.isLoadingUnblockNews
                ? <div className="dapp-loading"><Spin/></div>
                : <div className="dapp-list">
                  <Slider {...settingsMarket}>{this.renderUnblock(this.state.arrUnblock)}</Slider>
                </div>
              }
            </div>
            : null
        }
      </React.Fragment>
    )
  }
  renderAdvertising () {
    let infinite = this.state.arrAdvertising.length > 5
    let infinite1 = this.state.arrAdvertising.length > 3
    const settingsMedia = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      slidesToShow: 5,
      speed: 200,
      slidesToScroll: 4,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 3,
            infinite: infinite1,
            slidesToScroll: 2
          }
        }
      ]
    }
    return (
      <React.Fragment>
        {
          this.state.arrAdvertising.length > 0 
            ? <div className="dapp-block-body">
              <div className="dapp-block-title">{this.props.t('Dapps.advertising')}</div>
              { this.state.isLoadingMedia
                ? <div className="dapp-loading"><Spin/></div>
                : <div className="dapp-list">
                  <Slider {...settingsMedia}>{this.renderGameItem(this.state.arrAdvertising)}</Slider>
                </div>
              }
            </div>
            : null
        }
      </React.Fragment>
    )
  }
  renderDefi () {
    let infinite = this.state.arrDefi.length > 5
    let infinite1 = this.state.arrDefi.length > 3
    const settingsMarket = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      slidesToShow: 5,
      speed: 200,
      slidesToScroll: 4,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 3,
            infinite: infinite1,
            slidesToScroll: 2
          }
        }
      ]
    }
    return (
      <React.Fragment>
        {
          this.state.arrDefi.length > 0 
            ? <div className="dapp-block-body">
              <div className="dapp-block-title">{this.props.t('Dapps.defi')}</div>
              { this.state.isLoadingUnblockNews
                ? <div className="dapp-loading"><Spin/></div>
                : <div className="dapp-list">
                  <Slider {...settingsMarket}>{this.renderGameItem(this.state.arrDefi)}</Slider>
                </div>
              }
            </div>
            : null
        }
      </React.Fragment>
    )
  }
  renderGame () {
    let infinite = this.state.arrListApp.length > 5
    let infinite1 = this.state.arrListApp.length > 3
    const settingsGame = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      slidesToShow: 5,
      speed: 200,
      slidesToScroll: 4,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 3,
            infinite: infinite1,
            slidesToScroll: 2
          }
        }
      ]
    }
    return (
      <React.Fragment>
        {
          this.state.arrListApp.length > 0 
            ? <div className="dapp-block-body">
              <div className="dapp-block-title">{this.props.t('Dapps.games')}</div>
              { this.state.isLoading
                ? <div className="dapp-loading"><Spin/></div>
                : <div className="dapp-list">
                  <Slider {...settingsGame}>{this.renderGameItem(this.state.arrListApp)}</Slider>
                </div>
              }
            </div>
            : null
        }
      </React.Fragment>
    )
  }
  renderGenre (item, index) {
    const filterDapp = this.state.arrListApp.filter(i => (i.genre === item) && !i.isDeleted && i.iconUrl.trim() !== '').sort((a, b) => a.rank > b.rank ? 1 : -1)
    let infinite = filterDapp.length > 5
    let infinite1 = filterDapp.length > 3
    const settings = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      slidesToShow: 5,
      speed: 200,
      slidesToScroll: 4,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 3,
            infinite: infinite1,
            slidesToScroll: 2
          }
        }
      ]
    }
    return (
      <React.Fragment>
        <div className="dapp-block-body">
          <div className="dapp-block-title">{item}</div>
          <div className="dapp-list">
            {
              <Slider {...settings}>
                {this.renderGameItem(filterDapp)}
              </Slider>
            }
          </div>
        </div>
      </React.Fragment>
    )
  }
  renderGameItem = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i++) {
      list.push(<BoxGame item={arr[i]} key={i} openDapp={this.onClickDapp} />)
    }
    return list
  }
  renderMyDappsCarousel = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i += 1) {
      list.push(<BoxFavorite item={arr[i]} key={i} openDapp={this.onClickDapp} removeFavorites={this.onRemoveFavorites}/>)
    }
    return list
  }
  renderMedia = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i += 1) {
      list.push(<BoxMedia item={arr[i]} key={i} openLink={this.onClickMedia}/>)
    }
    return list
  }
  renderUnblock = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i += 1) {
      list.push(<BoxUnblock item={arr[i]} key={i} openLink={this.onClickMedia}/>)
    }
    return list
  }
}
