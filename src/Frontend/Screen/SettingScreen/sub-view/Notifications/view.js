import React from 'react'
import { List } from 'antd'
import moment from 'moment'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import { Spin } from 'Frontend/Components/HBLoader'
import InfiniteScroll from 'react-infinite-scroller'
import './styles.css'

export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: 1,
      viewing: '',
      isLoadingMyRequests: true,
      isLoadMore: false,
      pageNum: 1,
      hasMore: true,
      numberGameItem: 0,
      notiItems: props.dexNoti,
      detailItems: props.dexNoti && props.dexNoti.notifications && props.dexNoti.notifications[0]
    }
    props.funcDefaultThis(this)
    Observer.on(OBSERVER_KEY.NEW_DEX_NOTIFICATIONS, props.onSocketNoti)
  }

  componentDidMount () {
    this.props.loadingInitialData()
  }

  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.NEW_DEX_NOTIFICATIONS, this.props.onSocketNoti)
  }

  renderNotiItems = (item) => {
    const { clickToReadNoti } = this.props
    const { viewing } = this.state
    return (
      <div className={'noti-item ' + ((viewing === item._id || item.firstHighlight) && 'noti-viewing')} onClick={() => clickToReadNoti(item)}>
        <div className='noti-title noti-active'>{item.title}</div>
        <div className='noti-title noti-detail'>{item.detail}</div>
        <div className="noti-description">{moment(item.updatedAt).format('YYYY/MM/DD HH:mm')}</div>
        {item.dotUnRead && <div className="noti-dot"></div>}
      </div>
    )
  }

  render () {
    const { t, readAll, handleInfiniteOnLoadNoti } = this.props
    const { notiItems, detailItems, hasMore, isLoadMore, isLoadingMyRequests } = this.state
    return (
      <div className="noti-container">
        <div className="sts-container">
          <div className="sts-header">
            <div className="sts-header-title">{t('notifications')}</div>
            <div className="noti-readAll" onClick={() => readAll()}>{t('MarkAllAsRead')}</div>
          </div>
          <div className="noti-borderRadius">
            <div className="noti-scroll">
              <div className="noti-wrap-content">
                { notiItems
                  ? <div id="HBScrollBar" className="dapp-InfiniteScroll">
                    <InfiniteScroll
                      initialLoad={false}
                      pageStart={0}
                      loadMore={handleInfiniteOnLoadNoti}
                      hasMore={hasMore}
                      useWindow={false}>
                      <List
                        className={'list-token'}
                        dataSource={notiItems.notifications}
                        renderItem={this.renderNotiItems}
                        locale={{ emptyText: t('NoData') }}/>
                    </InfiniteScroll>
                    {isLoadMore && <div className="dapp-Spin"><Spin/></div>}
                  </div>
                  : <div className="dapp-no-item">
                    {t('NoData')}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="noti-right">
          <div className="noti-wrapContent">
            <div className="noti-showContent">
              <div className="noti-showContent-title">{detailItems && detailItems.title}</div>
              <div className="noti-showContent-detail">{detailItems && detailItems.detail}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
