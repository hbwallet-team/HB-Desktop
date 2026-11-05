import React from 'react'
import TabLayoutContainer from 'Frontend/Container/TabLayoutContainer'
import { HBInput } from 'Frontend/Components/HBInput'
import Lottie from 'react-lottie'
import { Select, List, Row } from 'antd'
import { Spin } from 'Frontend/Components/HBLoader'
import DappAssetDetail from './DappAssetDetail'
import DappAssetHistory from './DappAssetHistory'
import DappRequest from './DappRequest'
import BoxAsset from 'Frontend/Screen/DappScreen/Components/BoxAsset'
import { HBCURRENCY_SYMBOL, HBCURRENCY } from 'Utils/globalConstants'
import { formatNumber, filterMainAccount } from 'Utils/globalFunction'
import Images from 'Assets/Image'
import InfiniteScroll from 'react-infinite-scroller'
import QRCode from 'qrcode.react'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import MDQrCode from 'Frontend/Screen/EthereumScreen/Components/MdQrcode'
import './styles.css'
const Option = Select.Option
let getHeight = '500px'
getHeight = (window.innerHeight - 300).toString() + 'px'

export default class DappAssetScreen extends React.PureComponent {
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
      },
      {
        symbol: 'self',
        gameName: props.t('Dapps.sellingSort'),
        gameNameJP: props.t('Dapps.sellingSort'),
        gameNameCN: props.t('Dapps.sellingSort')
      }],
      selectedCategory: 'all',
      selectedItem: null,
      isLoading: true,
      isActiveDetail: false,
      isActiveHistory: false,
      numberGameItem: 0,
      isCheckSellFromOut: false,
      pageNum: 1,
      hasMore: true,
      isLoadMore: false,
      getHeight: getHeight
    }
    this.currency = props.arrCurrencyData === undefined
      ? HBCURRENCY_SYMBOL[HBCURRENCY.JPY]
      : HBCURRENCY_SYMBOL[props.arrCurrencyData]
    props.defaultThis(this)
  }
  updateDimensions = () => {
    getHeight = (window.innerHeight - 300).toString() + 'px'
    this.setState({
      getHeight
    })
  }
  componentDidMount () {
    this.props.loadingInitial()
    this.props.fetchGameCategories()
    this.props.fetchTotalSync()
    window.addEventListener('resize', this.updateDimensions)
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions)
  }
  render () {
    const { backToAssets, backToDappScreen, refreshAfterRetrieve } = this.props
    const { selectedItem, isActiveDetail, isCheckSellFromOut } = this.state
    return (
      <div className="ts-wrapContent">
        <TabLayoutContainer
          topLeft={!isActiveDetail ? this.renderTopLeft : null} 
          topLeftHeight={!isActiveDetail ? 139 : 0}
          topRight={this.renderTopRight}
          topRightHeight={340}
          isCenterRight={true}
          centerRight={this.renderRightView}
        >
          {
            isActiveDetail
              ? <DappAssetDetail 
                selectedItem={selectedItem} 
                backToTop={backToAssets} 
                isCheckSellFromOut={isCheckSellFromOut} 
                backToDappScreen={backToDappScreen}
                refreshAfterRetrieve={refreshAfterRetrieve}
              />
              : <div className="dapp-wrapper">
                <div className="dapp-asset">
                  {this.renderMyAssets()}
                </div>
              </div>
          }
        </TabLayoutContainer>
      </div>
    )
  }
  get renderTopLeft () {
    const { t, arrCardData } = this.props
    const mainAccount = filterMainAccount(arrCardData)
    return (
      <div className='tk-header-container'>
        <Row className='eth-header-padding'>
          <div className="tk-wrapToken-Overview">
            <div className="tk-text-header">
              {t('Dapps.erc721overview')}
            </div>
            <div className='tk-sub-header'>
              <div className="tk-sub-header-account">
                {t('myToken')}
              </div>
              <div className="tk-sub-header-content">
                {t('DisplayPrivateKey.noteContent2')}
              </div>
              <div className='tk-sub-header-amount'>{mainAccount.address}</div>
            </div>
            <div className="edt-qrcode" id="btnHover" onClick={this.props.openModalReceive}>
              <QRCode value={mainAccount.address} size={80} bgColor="#fff" fgColor="#172540"/>
            </div>
          </div>
          <Modal ref="modalRequestReceive" className="md-request fix-layoutQR">
            <MDQrCode {...this.props}/>
          </Modal>
        </Row>
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
  renderMyAssets () {
    const { t, handleInfiniteOnLoad, arrDappAssets } = this.props
    const { hasMore, isLoadMore, arrSearch, isLoading } = this.state
    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: Images.dappsLoader,
      resizeMode: 'contain'
    }
    const lottieStyles = {
      position: 'relative',
      bottom: '-80px' 
    }
    return (
      <React.Fragment>
        { this.renderSearchBox() }
        <div className="dapp-left-body">
          { isLoading
            ? <div className="dapp-loading">
              <Lottie
                options={defaultOptions}
                width={200}
                height={200}
                style={lottieStyles}
              />
              {t('Dapps.loadingAsset')}
            </div>
            : arrSearch || arrDappAssets.length > 0
              ? <div id="HBScrollBar" className="dapp-InfiniteScroll">
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={0}
                  loadMore={handleInfiniteOnLoad}
                  hasMore={hasMore}
                  useWindow={false}>
                  <List
                    className="dapp-asset-list"
                    dataSource={arrSearch || arrDappAssets} 
                    renderItem={(item, index) => this.renderAsset(item, index)}
                    locale={{ emptyText: t('NoData') }} />
                </InfiniteScroll>
                {isLoadMore && <div className="dapp-Spin"><Spin/></div>}
              </div>
              : <div className="dapp-no-item">
                <img src={Images.ic_assets_grey}/>
                {t('Dapps.noAssetToShow')}
              </div>
          }
        </div>
      </React.Fragment>
    )
  }
  renderSearchBox () {
    const { getHeight, numberGameItem, isLoading } = this.state
    const { t } = this.props
    return (
      <div className="dapp-search">
        <div className="dapp-search-left">
          <HBInput
            iconLeft={Images.search1}
            placeholder={this.props.t('Dapps.searchAsset')}
            value={this.state.strSearch}
            className='dapp-input-search'
            onChange={this.props.onChangeSearchKeyword}
          />
          <Select 
            className="dapp-category" 
            defaultValue={this.state.selectedCategory}
            onChange={this.props.onChangeCategory}
            // dropdownClassName={'dapp-dropDown-category'}
            // dropdownStyle={{height: getHeight}}
          >
            { this.renderDappCategory() }
          </Select>
        </div>
        {!isLoading && <div className="dapp-number-assets">{t('Dapps.numberOfAssets')}<span>{formatNumber(numberGameItem, 0)}</span></div>}
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
  renderAsset (item, index) {
    return (
      <List.Item>
        <BoxAsset 
          item={item} 
          trackingSendTxs={this.props.trackingSendTxs} 
          onClickAsset={this.props.onClickAsset}
          t={this.props.t}
          screenConfig={this.props.screenConfig}
        />
      </List.Item>
    )
  }
}
