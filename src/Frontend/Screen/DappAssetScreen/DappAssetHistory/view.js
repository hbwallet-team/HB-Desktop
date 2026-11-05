import React from 'react'
import { Spin } from 'Frontend/Components/HBLoader'
import { List } from 'antd'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import { convertUtcToDateTime } from 'Utils/globalFunction'
import NFTTransactionHistory from '../Components/NFTTransactionHistory'
import InfiniteScroll from 'react-infinite-scroller'
import './styles.css'

export default class DappAssetHistory extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      objSelectNFT: [],
      isLoadingNFT: true,
      numberGameItem: 0,
      pageNum: 1,
      hasMore: true,
      isLoadMore: false
    }
    props.defaultThis(this)
  }
  componentDidMount () {
    this.props.loadingInitial()
  }
  render () {
    const { arrDappAssetHistory, handleInfiniteOnLoad, t } = this.props
    const { hasMore, isLoadMore } = this.state
    return (
      <div className="dapp-NFT">
        <div className="dapp-my-assets">{this.props.t('LatestTransactions')}</div>
        { this.state.isLoadingNFT
          ? <div className="dapp-loading"><Spin/></div>
          : arrDappAssetHistory.length > 0
            ? <div id="HBScrollBar" className="dapp-InfiniteScroll dappScroll-history">
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={handleInfiniteOnLoad}
                hasMore={hasMore}
                useWindow={false}>
                <List 
                  id="HBScrollBar"
                  className="dapp-NFT-list"
                  dataSource={arrDappAssetHistory} 
                  renderItem={(item, index) => this.renderNFTTransactionHistory(item, index)}
                  locale={{ emptyText: t('NoData') }} />
              </InfiniteScroll>
              {isLoadMore && <div className="dapp-Spin"><Spin/></div>}
            </div>
            : <div className="dapp-no-item">{this.props.t('YouHaventReceived')}</div>
        }
        <Modal ref="modalNFTTransactionHistory">
          <NFTTransactionHistory THIS={this}/>
        </Modal>
      </div>  
    )
  }
  renderNFTTransactionHistory (item, index) {
    const { t } = this.props
    return (
      <div className="dapp-NFT-item" onClick={() => this.props.clickOnCellDetail(item)}>
        <div className="dapp-NFT-token">
          <span className="dapp-NFT-tokenImg"><img src={item.icon}/></span>{item.game}
        </div>
        <div className="dapp-NFT-ID">#{item.id}</div>
        <div className="dapp-NFT-content">
          <span className={'dapp-NFT-first ' + (item.sent ? 'NFT-Sent' : 'NFT-Received')}>{item.sent ? t('Sent') : t('Received')}</span>
          <span className="dapp-NFT-mid"> {item.sent ? t('HistoryDetail.to') : t('HistoryDetail.from')} </span>
          <span className="dapp-NFT-last">{item.sent ? (item.receiver === 'Main Account' ? t('mainAccount') : item.receiver) : item.sender}</span>
        </div>
        <div className="dapp-NFT-time">{convertUtcToDateTime(item.createdAt)}</div>
      </div>
    )
  }
}
