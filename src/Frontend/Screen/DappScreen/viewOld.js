import React from 'react'
import Slider from 'react-slick'
import { Tooltip, List } from 'antd'
import { HBInput } from 'Frontend/Components/HBInput'
import { Spin } from 'Frontend/Components/HBLoader'
import BoxGame from './Components/BoxGame'
import BoxGameTop from './Components/BoxGameTop'
import BoxGameLite from './Components/BoxGameLite'
import BoxFavorite from './Components/BoxFavorite'
import BoxMedia from './Components/BoxMedia'
import BoxUnblock from './Components/BoxUnblock'
import DappGenreScreen from './sub-view/DappGenreScreen'
import DappSettingScreen from './sub-view/DappSettingScreen'
import DappAssetScreen from 'Frontend/Screen/DappAssetScreen'
import DappMarketScreen from 'Frontend/Screen/DappMarketScreen'
import BrowserScreen from './sub-view/BrowserScreen'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import Observer from 'Utils/HBObserver'
import Images from 'Assets/Image'
import './styles.css'
import ScrollAnimation from 'react-animate-on-scroll'
import 'animate.css/animate.min.css'
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
    this.props.getDappsmarket()
    this.props.getUnblock()
    this.props.fetchTotalSync()
    // listening trigger from main window
    ipc.on('add-new-account', this.props.triggerAddNewAccount)
    ipc.on('import-account', this.props.triggerImportAccount)
    ipc.on('switched-account', this.props.triggerSwitchedAccount)
    ipc.on('edit-account', this.props.triggerEditAccount)
    ipc.on('deleted-account', this.props.triggerDeletedAccount)
    ipc.on('add-favorites', this.props.triggerAddFavorites)
    ipc.on('reset-wallet', this.props.triggerResetWallet)
    // new WOW.WOW().init()
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.GET_DATA_AFTER_BUY_DAPP_ITEM, this.props.updateDataAfterBuyDappItem)
  }
  // handle click to see all
  onClickSeeAll = (item) => () => this.props.handleSeeAll(item)
  onClickSeeAllHotTop = () => () => this.props.handleSeeAllHotTop()
  // handle click a Dapp
  onClickDapp = (item) => () => this.props.openDapp(item)
  // main render
  render () {
    return (
      <div className="window dapp-wrapper">
        <div className="dapp-container">
          {
            this.state.detailToGame
              ? <BrowserScreen 
                dappLink={this.state.dappLink}
                selectedGame={this.state.itemFromDetail}
                backHome={this.props.backHome}
                detailToGame={true}
              />
              : this.state.isSwitchPlay
                ? <BrowserScreen 
                  dappLink={this.state.dappLink}
                  selectedGame={this.state.selectedGame}
                  backHome={this.props.backHome}
                />
                : this.state.openDappGenreScreen
                  ? <DappGenreScreen 
                    isRanking={this.state.isRanking}
                    selectedGenre={this.state.selectedHotTop ? this.props.t('Dapps.HotTop') : this.state.selectedGenre} 
                    arrListApp={this.state.arrListAppGenre}
                    backToTop={this.props.backToTop} 
                    openDapp={this.onClickDapp}
                  /> 
                  : this.state.openDappSettingScreen
                    ? <DappSettingScreen backToTop={this.props.backToTop} />
                    : this.state.openDappAssetScreen
                      ? <DappAssetScreen backToTop={this.props.backToTop} backToDappScreen={this.props.backToDappScreen} />
                      : this.state.openDappMarketScreen
                        ? <DappMarketScreen backToTop={this.props.backToTop} backToDappScreen={this.props.backToDappScreen} />
                        : this.renderDappScreen()
          }
        </div>
      </div>
    )
  }
  renderDappScreen () {
    const settingsMedia = {
      lazyLoad: true,
      dots: false,
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 5000,
      slidersPerRow: 1,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />
    }
    const { t } = this.props
    return (
      <div className="dapp-asset-top">
        <div className="dapp-left-side">
          { this.renderSearchBox() }
          <div className="dapp-left-body">
            { this.state.isLoading 
              ? <div className="dapp-loading"><Spin/></div>
              : this.state.strSearch.length > 0
                ? this.renderDAppSearch()
                : <div id="HBScrollBar" className="dapp-home-page">
                  {this.state.arrTopApp.length > 0 ? this.renderTopApps() : null}
                  {this.state.arrListHotTop.length > 0 ? this.renderHotTop() : null}
                  {this.state.arrListGenre.length > 0 
                    ? <ScrollAnimation animateIn='bounceInUp' animateOnce={true}>
                      <List 
                        dataSource={this.state.arrListGenre} 
                        renderItem={(item, index) => this.renderGenre(item, index)} />
                    </ScrollAnimation>
                    : null
                  }
                </div>
            }
          </div>
        </div>
        <div className="dapp-right-side">
          <div className="wrap-my-dapps">
            <div className="dapp-my-dapps">{this.props.t('Dapps.myDapps')}</div>
            <div className="dapp-right-body">
              { this.state.isLoadingMyDapps
                ? <div className="dapp-loading"><Spin/></div>
                : this.state.arrMyDapps.length > 0 ? this.renderMyDapps() : <div className="dapp-noData">{t('NoData')}</div>
              }
            </div>
          </div>
          <div className="wrap-my-media">
            <div className="dapp-my-dapps">{this.props.t('Dapps.media')}</div>
            <div className="dapp-right-body">
              { this.state.isLoadingMedia
                ? <div className="dapp-loading"><Spin/></div>
                : this.state.arrMedia.length > 0 
                  ? <Slider
                    {...settingsMedia}
                  >{this.renderMedia(this.state.arrMedia)}</Slider>
                  : <div className="dapp-noData">{t('NoData')}</div>
              }
            </div>
          </div>
          <div className="wrap-my-unblock">
            <div className="dapp-my-dapps">{this.props.t('Dapps.unblockNews')}</div>
            <div className="dapp-right-body">
              { this.state.isLoadingUnblockNews
                ? <div className="dapp-loading"><Spin/></div>
                : this.state.arrUnblock.length > 0 
                  ? <Slider {...settingsMedia}>{this.renderUnblock(this.state.arrUnblock)}</Slider>
                  : <div className="dapp-noData">{t('NoData')}</div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
  renderSearchBox () {
    return (
      <div className="dapp-search">
        <Tooltip placement="top" title={this.props.t('mainTabbar.Settings')}>
          <div className="dapp-settings">
            <img className="dapp-settings-icon" src={Images.SettingsNewActive} onClick={this.props.onClickSetting}/>
          </div>
        </Tooltip>
        {/* <Tooltip placement="top" title={this.props.t('Dapps.assets')}>
          <div className="dapp-settings">
            {Number(this.props.unReadGameItemSync) > 0 && <div className='tbBadgeNumber'>{this.props.unReadGameItemSync}</div>}
            <img className="dapp-settings-icon" src={Images.ic_assets} onClick={this.props.onClickAsset}/>
          </div>
        </Tooltip> */}
        {/* <Tooltip placement="top" title={this.props.t('Dapps.market')}>
          <div className="dapp-settings">
            <img className="dapp-settings-icon" src={Images.ic_market} onClick={this.props.onClickMarket}/>
          </div>
        </Tooltip> */}
        <HBInput
          iconLeft={Images.search1}
          placeholder={this.props.t('Dapps.searchDapps')}
          value={this.state.strSearch}
          className='dapp-input-search'
          onChange={(value) => this.props.onChangeSearchKeyword(value)}
        />
        <Tooltip placement="top" title={this.props.t('Dapps.ranking')}>
          <div className="dapp-ranking">
            <img className="dapp-ranking-icon" src={Images.ic_ranking} onClick={this.props.onClickRanking}/>
          </div>
        </Tooltip>
        <Tooltip placement="top" title={this.props.t('Dapps.openNewWindow')}>
          <div className="dapp-ranking">
            <img className="dapp-ranking-icon" src={Images.ic_open_new_window} onClick={this.props.openNewWindow}/>
          </div>
        </Tooltip>
      </div>
    )
  }
  renderTopAppItem = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i++) {
      list.push(<BoxGameTop item={arr[i]} key={i} openDapp={this.onClickDapp} />)
    }
    return list
  }
  renderTopApps () {
    let infinite = this.state.arrTopApp.length > 3
    let infinite1 = this.state.arrTopApp.length > 2
    const settings = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 5000,
      slidesToShow: 3,
      slidesToScroll: 1,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            infinite: infinite1,
            slidesToShow: 2,
            slidesToScroll: 1
          }
        }
      ]
    }
    return (
      <div className="dapp-list dapp-top-app">
        <ScrollAnimation animateIn='bounceInRight' animateOnce={true}>
          {
            <Slider 
              {...settings}
              afterChange={this.props.afterChangeTopAppItem}
            >
              {this.renderTopAppItem(this.state.arrTopApp)}
            </Slider>
          }
        </ScrollAnimation>
      </div>
    )
  }
  renderHotTopItem = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i++) {
      list.push(<BoxGameLite item={arr[i]} key={i} openDapp={this.onClickDapp} />)
    }
    return list
  }
  renderHotTop () {
    let infinite = this.state.arrListHotTop.length > 10
    let infinite1 = this.state.arrListHotTop.length > 6
    const settings = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      slidesToShow: 10,
      speed: 200,
      slidesToScroll: 9,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 6,
            infinite: infinite1,
            slidesToScroll: 5
          }
        }
      ]
    }
    return (
      <ScrollAnimation animateIn='bounceInLeft' animateOnce={true}>
        <React.Fragment>
          <div className="dapp-list">
            <div className="dapp-list-header">
              <div className="dapp-genre-name">{this.props.t('Dapps.HotTop')}</div>
              <div className="dapp-view-more" onClick={this.onClickSeeAllHotTop(this.state.arrListHotTop)}>{this.props.t('Dapps.seeAll')}</div>
            </div>
            {
              <Slider 
                {...settings}
                afterChange={this.props.afterChangeHotTop}
              >
                {this.renderHotTopItem(this.state.arrListHotTop)}
              </Slider>
            }
          </div>
        </React.Fragment>
      </ScrollAnimation>
    )
  }
  renderDappItemLite = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i++) {
      list.push(<BoxGameLite item={arr[i]} key={i} openDapp={this.onClickDapp} />)
    }
    return list
  }
  renderGenre (item, index) {
    const isLastItem = index === this.state.arrListGenre.length - 1
    const filterDapp1 = this.state.arrListApp.filter(i => (i.genre === item) && !i.top && !i.isDeleted && !i.isHot && i.iconUrl.trim() !== '').sort((a, b) => a.rank > b.rank ? 1 : -1)
    let filterDapp = filterDapp1.slice(0, 11)
    let infinite = filterDapp > 10
    let infinite1 = filterDapp > 6
    const settings = {
      lazyLoad: true,
      dots: false,
      infinite: infinite,
      slidesToShow: 10,
      speed: 200,
      slidesToScroll: 9,
      nextArrow: <CustomNextArrow />,
      prevArrow: <CustomPrevArrow />,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            infinite: infinite1,
            slidesToShow: 6,
            slidesToScroll: 5
          }
        }
      ]
    }
    return (
      <ScrollAnimation animateIn='bounceInLeft' scrollableParentSelector={'.dapp-home-page'} animateOnce={true}>
        <React.Fragment>
          <div className="dapp-list">
            <div className="dapp-list-header">
              <div className="dapp-genre-name">{item}</div>
              <div className="dapp-view-more" onClick={this.onClickSeeAll(item)}>{this.props.t('Dapps.seeAll')}</div>
            </div>
            {
              <Slider {...settings}>
                {this.renderDappItemLite(filterDapp)}
              </Slider>
            }
          </div>
          {isLastItem && <div className="dapp-footer">{this.props.t('Dapps.footer')}</div>}
        </React.Fragment>
      </ScrollAnimation>
    )
  }
  renderDappItem (item, index) {
    return (
      <BoxGame item={item} key={index} openDapp={this.onClickDapp} />
    )
  }
  renderDAppSearch () {
    return (
      <React.Fragment>
        {
          Array.isArray(this.state.arrSearch) && this.state.arrSearch.length > 0
            ? <div className="dapp-search-page">
              <div className="dapp-list-header">
                <div className="dapp-genre-name"></div>
                <div className="dapp-view-more" onClick={this.props.handleSearchOnWeb}>{this.props.t('Dapps.viewResultsOnWeb')}</div>
              </div>
              <List 
                id="HBScrollBar"
                className="dapp-search-list"
                dataSource={this.state.arrSearch} 
                renderItem={(item, index) => this.renderDappItem(item, index)}
              />
            </div>
            : <div className="dapp-search-page">
              <div className="dapp-list-header">
                <div className="dapp-genre-name"></div>
                <div className="dapp-view-more" onClick={this.props.handleSearchOnWeb}>{this.props.t('Dapps.viewResultsOnWeb')}</div>
              </div>{this.props.t('NoData')}
            </div>
        }
      </React.Fragment>
    )
  }
  renderMyDappItem (item, index) {
    return (
      <List.Item>
        <BoxFavorite item={item} key={index} openDapp={this.onClickDapp} />
      </List.Item>
    )
  }
  renderMyDappsCarousel = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i += 2) {
      list.push(<BoxFavorite item={arr[i]} itemNext={arr[i + 1] ? arr[i + 1] : null} key={i} openDapp={this.onClickDapp} />)
    }
    return list
  }
  renderMedia = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i += 1) {
      list.push(<BoxMedia item={arr[i]} key={i}/>)
    }
    return list
  }
  renderUnblock = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i += 1) {
      list.push(<BoxUnblock item={arr[i]} key={i}/>)
    }
    return list
  }
  renderMyDapps () {
    return (
      <div className="dapp-my-dapps-list" id="HBScrollBar">
        <List 
          id="HBScrollBar"  
          className="dapp-search-list"
          grid={{ gutter: 16, column: 4 }}
          dataSource={this.state.arrMyDapps} 
          renderItem={(item, index) => this.renderMyDappItem(item, index)}
        />
      </div>
    )
  }
}
