import React from 'react'
import TabLayoutContainer from 'Frontend/Container/TabLayoutContainer'
import BoxAsset from 'Frontend/Screen/DappScreen/Components/BoxAsset'
import DappAssetDetail from 'Frontend/Screen/DappAssetScreen/DappAssetDetail'
import DappAssetHistory from 'Frontend/Screen/DappAssetScreen/DappAssetHistory'
import DappRequest from 'Frontend/Screen/DappAssetScreen/DappRequest'
import { HBInput } from 'Frontend/Components/HBInput'
import { Spin } from 'Frontend/Components/HBLoader'
import { formatNumber, openBrowserInNewTab } from 'Utils/globalFunction'
import { Select, List } from 'antd'
import InfiniteScroll from 'react-infinite-scroller'
import Images from 'Assets/Image'
import { debounce } from 'lodash'
import './styles.css'
const Option = Select.Option
let getHeight = '500px'
getHeight = (window.innerHeight - 88).toString() + 'px'

export default class DappMarketScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      strSearch: '',
      arrSearch: null,
      arrCategories: [{
        symbol: 'all',
        gameName: props.t('Dapps.allCategories'),
        gameNameJP: props.t('Dapps.allCategories'),
        gameNameCN: props.t('Dapps.allCategories')
      }],
      arrSort: [
        {
          key: 'new',
          name: props.t('Dapps.new')
        },
        {
          key: 'high',
          name: props.t('Dapps.high')
        },
        {
          key: 'low',
          name: props.t('Dapps.low')
        }
      ],
      selectedCategory: 'all',
      selectedSort: 'new',
      selectedItem: null,
      numberGameItem: 0,
      pageNum: 1,
      hasMore: true,
      isLoadMore: false,
      isLoading: true,
      isActiveDetail: false,
      getHeight: getHeight
    }
    props.defaultThis(this)
    this.changeSearch = debounce(this.props.onChangeSearchKeyword, 5000)
  }
  updateDimensions = () => {
    getHeight = (window.innerHeight - 88).toString() + 'px'
    this.setState({
      getHeight
    })
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions)
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchGameCategories()
    window.addEventListener('resize', this.updateDimensions)
  }
  handleChange = (e) => {
    this.setState({ strSearch: e }, () => {
      this.changeSearch(e)
    })
  }
  render () {
    const { isActiveDetail, selectedItem } = this.state
    const { backToMarket, backToDappScreen } = this.props
    return (
      isActiveDetail
        ? <TabLayoutContainer
          topRight={this.renderTopRight}
          topRightHeight={340}
          isCenterRight={true}
          centerRight={this.renderRightView}
        >
          <DappAssetDetail isStore selectedItem={selectedItem} backToTop={backToMarket} backToDappScreen={backToDappScreen} />
        </TabLayoutContainer>
        : <div className="dapp-wrapper">
          <div className="dapp-container">
            {this.renderMarket()}
          </div>
        </div>
    )
  }
  get renderTopRight () {
    return (
      <div className="dapp-right-side">
        <DappRequest />
      </div>
    )
  }
  get renderRightView () {
    return (
      <div className="dapp-right-side">
        <DappAssetHistory />
      </div>
    )
  }
  renderMarket () {
    const { arrDappMarket, t, handleInfiniteOnLoad } = this.props
    const { arrSearch, isLoading, numberGameItem, hasMore, isLoadMore } = this.state
    return (
      <div className="dapp-market">
        { this.renderSearchBox() }
        <div className="dapp-my-assets">
          {t('Dapps.buyAssets')}
          {!isLoading
            ? <div className="dapp-my-assets-right">
              <div className="dapp-number-assets">{t('Dapps.numberOfAssetsOnSale')}<span>{formatNumber(numberGameItem, 0)}</span></div>
              <div className="dapp-value-mon" onClick={() => openBrowserInNewTab('https://nagemon.com/assets/valuedMon')}><img src={Images.ic_value_mon}/></div>
            </div>
            : null
          }
        </div>
        { isLoading
          ? <div className="dapp-loading"><Spin/></div>
          : arrSearch || arrDappMarket.length > 0
            ? <div id="HBScrollBar" className="dapp-InfiniteScroll">
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={handleInfiniteOnLoad}
                hasMore={hasMore}
                useWindow={false}>
                <List 
                  id="HBScrollBar"
                  className="dapp-asset-list"
                  // grid={{gutter: 16, lg: 6, xl: 6, xxl: 8}}
                  dataSource={arrSearch || arrDappMarket} 
                  renderItem={(item, index) => this.renderAsset(item, index)} />
              </InfiniteScroll>
              {isLoadMore && <div className="dapp-Spin"><Spin/></div>}
            </div>
            : <div className="dapp-no-item">
              <img src={Images.ic_assets_grey}/>
              {t('Dapps.noAssetToShow')}
            </div>
        }
      </div>
    )
  }
  renderSearchBox () {
    const { getHeight } = this.state
    return (
      <div className="dapp-search">
        {/* <div className="dapp-back" onClick={this.props.backToTop}>
          <img className="img-back" alt="imgBack" src={Images.tabNaviBack} />
          {this.props.t('back')}
        </div> */}
        <HBInput
          iconLeft={Images.search1}
          placeholder={this.props.t('Dapps.searchAsset')}
          value={this.state.strSearch}
          className='dapp-input-search'
          onKeyPress={this.props.onKeyPressSearchKeyword}
          onChange={this.props.onChangeSearchKeyword}
          locale={{ emptyText: this.props.t('NoData') }}
        />
        <Select 
          className="dapp-category" 
          defaultValue={this.state.selectedCategory}
          onChange={this.props.onChangeCategory}
          dropdownClassName={'dapp-dropDown-category'}
          dropdownStyle={{height: getHeight}}>
          { this.renderDappCategory() }
        </Select>
        <Select 
          className="dapp-sort" 
          defaultValue={this.state.arrSort[0].key}
          onChange={this.props.onChangeSort}>
          { this.renderDappSort() }
        </Select>
      </div>
    )
  }
  renderDappCategory () {
    const { localeData } = this.props
    const { arrCategories } = this.state
    return (
      arrCategories.map((item, index) => {
        return (<Option key={index} value={item.symbol}>{item[`gameName${['jp', 'cn'].includes(localeData) ? localeData.toUpperCase() : ''}`]}</Option>)
      })
    )
  }
  renderDappSort () {
    const { arrSort } = this.state
    return (
      arrSort.map((item, index) => {
        return (<Option key={item.key} value={item.key}>{item.name}</Option>)
      })
    )
  }
  renderAsset (item, index) {
    return (
      <List.Item>
        <BoxAsset 
          item={item} 
          trackingSendTxs={this.props.trackingSendTxs}
          onClickAsset={this.props.onClickAsset}
          isStore
          screenConfig={this.props.screenConfig}
          t={this.props.t}
        />
      </List.Item>
    )
  }
}
