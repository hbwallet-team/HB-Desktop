import React from 'react'
import '../styles.css'
import { formatNumberOld, openBrowserInNewTab } from 'Utils/globalFunction'
import { Tooltip, List } from 'antd'
import InfiniteScroll from 'react-infinite-scroller'
import Images from 'Assets/Image'
import HBImage from 'Frontend/Components/HBImage'
import { Spin } from 'Frontend/Components/HBLoader'
import moment from 'moment'

const AirdropRight = ({t, isEnableRequest, days, hours, minutes, seconds, item, clickOpenModal, clickOpenModalGacha, requestAirDrop, smoothSlider, that, isMyAirdrop, onUpdateMyAirdrop, history721, listHistory, loadImg, itemAirdrop721, isGetting721, backTo721, isLoadingHistory721, goToNagemon, clickOpenHistoryAirdrop721, currency, etherPrice, openWinnerList, countTxs, openExternalContract, openTransactionHistory, openWinnerListSub, openTransactionFee, goToGame, gcName, gcBalance, tabClosed, hasMore, handleInfiniteOnLoad, isLoadMore, localeData}) => {
  let now = new Date()
  let compareDate = new Date()
  compareDate.setTime(item && item.expire_time)
  let isEnable = (compareDate.getTime() - now.getTime()) > 0
  let setSmoothSlider = (result) => {
    that.setState({
      smoothSlider: result
    })
  }
  let onLoadImg = (result) => {
    that.setState({
      loadImg: result
    })
  }

  const renderHistory721 = (item, index, length, clickOpenHistoryAirdrop721, t, thisItem) => {
    let prize
    let awardPrize
    let namePrize = false
    if ((item.award !== -1) && (thisItem.is721DropV1 || thisItem.is721DropV2)) {
      prize = thisItem ? thisItem.prize[item.award - 1] : {}
      if (thisItem) {
        awardPrize = thisItem.prize && thisItem.prize.find(itm => itm.id === item.award)
      }
      namePrize = !!(thisItem && awardPrize && !awardPrize.isName)
    }
    return (
      <div className='adr-721Item' onClick={() => clickOpenHistoryAirdrop721(item.award, item.awardAmount, item.awardName, item.trnx, thisItem.contractAddress, thisItem.airdropId, thisItem.is721DropV1, thisItem.is721DropV2, prize)}>
        {item.isClicked
          ? <div>
            {(thisItem.is721DropV1 || thisItem.is721DropV2)
              ? item.award !== -1 && <div className={'is721Item-status ' + (!item.status && 'is721Item-watting')}>
                {item.status
                  ? t('Received')
                  : t('waitReceive')}
              </div>
              : <div className={'is721Item-status ' + (!item.status && 'is721Item-watting')}>
                {item.status
                  ? item.awardName.toLowerCase() === 'eth'
                    ? t('Received')
                    : t('sentNagemon')
                  : t('waitReceive')}
              </div>}
            <div className="is721Item-num">
              {(thisItem.is721DropV1 || thisItem.is721DropV2)
                ? item.award === -1 
                  ? <div className={'is721Item-numSecond itemLost ' + (!item.status && 'is721Item-receving ')}>{t('lost')}</div>
                  : <div className="is721v2-wrap">
                    {namePrize && item.status && <div className={'is721Item-numFirst ' + (item.status && item.awardName.toLowerCase() === 'eth' && ' is721Item-yellow')}>{item.status && '+'}</div>}
                    {namePrize && <div className={'is721Item-numSecond ' + (!item.status && 'is721Item-receving ') + (item.status && item.awardName.toLowerCase() === 'eth' && ' is721Item-yellow')}>{item.awardAmount}</div>}
                    <div className={'is721Item-numUnit ' + (!item.status && 'is721Item-receving ') + (item.status && item.awardName.toLowerCase() === 'eth' && ' is721Item-yellow')}>{item.awardName}</div>
                  </div>
                : <div className="is721-wrap">
                  <div className={'is721Item-numFirst ' + (item.status && item.awardName.toLowerCase() === 'eth' && ' is721Item-yellow')}>{item.status && '+'}</div>
                  <div className={'is721Item-numSecond ' + (!item.status && 'is721Item-receving ') + (item.status && item.awardName.toLowerCase() === 'eth' && ' is721Item-yellow')}>{item.awardAmount}</div>
                  <div className={'is721Item-numUnit ' + (!item.status && 'is721Item-receving ') + (item.status && item.awardName.toLowerCase() === 'eth' && ' is721Item-yellow')}>{item.awardName}</div>
                </div>}
            </div>
            <div className="is721Item-content">
              <div className="is721Item-num">
                <div className="is721Item-index">{Number(length) - Number(index)}</div>
                <div className="is721Item-time">{moment(item.createdAt).format('YYYY/MM/DD hh:mma')}</div>
              </div>
            </div>
          </div>
          : <div className='adr-wrap721Item'>
            <div className={'is721Item-seeResultTitle ' + (localeData === 'jp' ? ' editFont' : '')}>{t('gc-seeResult')}</div>
            <img className="is721Item-seeResult" src={Images.seeResult}/>
            <div className="is721Item-content">
              <div className="is721Item-num">
                <div className="is721Item-index">{Number(length) - Number(index)}</div>
                <div className="is721Item-time">{moment(item.createdAt).format('YYYY/MM/DD hh:mma')}</div>
              </div>
            </div>
          </div>}
      </div>
    )
  }
  return (
    history721
      ? <div className='adr-help-tooltip'>
        <div className='wrap-adr-help-tooltipTitle'>
          <div className='adr-help-tooltipTitle'>
            <button
              className='adr-help-btnBack'
              onClick={() => backTo721(false)}
            >
              <img className="img-back"
                alt='imgBack'
                src={Images.tabNaviBack} />
            </button>
            <div className='adr-help-text'>
              {t('gachaHistory')}
            </div>
          </div>
          <div className='adr-seeContractImg'><img src={Images.etherIcon} /></div>
          <div className='adr-seeContract' onClick={() => openExternalContract(item.contractAddress)}>{t('gc-smHistory')}</div>
          <div className='adr-seeTransaction' onClick={() => openTransactionHistory()}>{t('gc-transactionHistory')}</div>
        </div>
        <div className='adr-history721'>
          {
            isLoadingHistory721
              ? <Spin size={15} color={'white'} />
              : <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={handleInfiniteOnLoad}
                hasMore={true}
                useWindow={false}>
                <List 
                  grid={{gutter: 16, column: 2}}
                  dataSource={listHistory}
                  renderItem={(e, index) => renderHistory721(e, index, listHistory.length, clickOpenHistoryAirdrop721, t, item)}
                  locale={{ emptyText: t('NoData') }}
                />
              </InfiniteScroll>
          }
          {isLoadMore && <div className="dapp-Spin"><Spin/></div>}
        </div>
      </div>
      : smoothSlider
        ? <div className={tabClosed ? 'adr-container' : (isEnable ? 'adr-container' : (isMyAirdrop ? 'adr-container' : 'adr-container-disable'))}>
          {item
            ? item.is721Drop
              ? <div className="adr-is721Drop">
                <div className="adr-image721">
                  <img onLoad={() => onLoadImg(true)} src={Images.gachaDrop}/>
                  {loadImg && item.airdrop_awards && <div>
                    <div className='adr-history' onClick={() => backTo721(true)}>{t('history')}</div>
                    <div className='adr-titlePrice1'>{t('1stPrize')}</div>
                    <div className='adr-titlePrice2'>{t('2ndPrize')}</div>
                    <div className='adr-titlePrice3'>{t('3rdPrize')}</div>
                    <div className='adr-titlePrice4'>{t('4thPrize')}</div>
                    <div className='adr-titlePrice5'>{t('5thPrize')}</div>
                    {item.airdrop_awards[0] && <div className='adr-price1'>
                      <div className='adr-priceNum'>{item.airdrop_awards[0].amount}</div>
                      <div className={'adr-priceUnitMon ' + (item.airdrop_awards[0].name.toLowerCase() === 'eth' && 'adr-priceUnit')}>{item.airdrop_awards[0].name.toLowerCase() === 'eth' ? item.airdrop_awards[0].name : t('monsterFos')}</div>
                    </div>}
                    {item.airdrop_awards[1] && <div className='adr-price2'>
                      <div className='adr-priceNum'>{item.airdrop_awards[1].amount}</div>
                      <div className={'adr-priceUnitMon ' + (item.airdrop_awards[1].name.toLowerCase() === 'eth' && 'adr-priceUnit')}>{item.airdrop_awards[1].name.toLowerCase() === 'eth' ? item.airdrop_awards[1].name : t('monsterFos')}</div>
                    </div>}
                    {item.airdrop_awards[2] && <div className='adr-price3'>
                      <div className='adr-priceNum'>{item.airdrop_awards[2].amount}</div>
                      <div className={'adr-priceUnitMon ' + (item.airdrop_awards[2].name.toLowerCase() === 'eth' && 'adr-priceUnit')}>{item.airdrop_awards[2].name.toLowerCase() === 'eth' ? item.airdrop_awards[2].name : t('monsterFos')}</div>
                    </div>}
                    {item.airdrop_awards[3] && <div className='adr-price4'>
                      <div className='adr-priceNum'>{item.airdrop_awards[3].amount}</div>
                      <div className={'adr-priceUnitMon ' + (item.airdrop_awards[3].name.toLowerCase() === 'eth' && 'adr-priceUnit')}>{item.airdrop_awards[3].name.toLowerCase() === 'eth' ? item.airdrop_awards[3].name : t('monsterFos')}</div>
                    </div>}
                    {item.airdrop_awards[4] && <div className='adr-price5'>
                      <div className='adr-priceNum'>{item.airdrop_awards[4].amount}</div>
                      <div className={'adr-priceUnitMon ' + (item.airdrop_awards[4].name.toLowerCase() === 'eth' && 'adr-priceUnit')}>{item.airdrop_awards[4].name.toLowerCase() === 'eth' ? item.airdrop_awards[4].name : t('monsterFos')}</div>
                    </div>}
                  </div>
                  }
                </div>
                <div className="adr-content-free">
                  {(item.airdrop_amountNeed === 0) && <div className='adr-freeTitle'><img src={Images.discountGacha}/></div>}
                  <div className='adr-freeContent'>{t('comeOnceDay')}</div>
                </div>
                <div className="adr-content-container">
                  {/* <div className="adr-gacha-title">{t('FreeContent1')}</div>
                  <div className="adr-gacha-title2">{t('FreeContent2')}</div> */}
                  <div className="adr-gacha-title2a"><img src={Images.NagemonGacha}/></div>
                  <div className="adr-gacha-count">{t('gc-times', {num: countTxs})}</div>
                  <div className="adr-gacha-royalCrown" onClick={() => openWinnerList()}>
                    <img src={Images.royalCrown}/>
                    <div className="adr-gacha-winList">{t('gc-list')}</div>
                  </div>
                  <div className="adr-gacha-title3">{t('FreeContent3', {num: item.airdrop_awards[0].amount.toString() + ' ' + item.airdrop_awards[0].name.toString()})}</div>
                  <div className="adr-gacha-title4">{t('FreeContent4', {num: item.airdrop_awards[0].amount.toString() + ' ' + item.airdrop_awards[0].name.toString()})}</div>
                  <div className="adr-gacha-title5">{t('FreeContent5')}</div>
                  <div className="adr-gacha-title6">{t('FreeContent6')}</div>
                  <div className='adr-btn-website'>
                    <div 
                      className="adr-newLink av2-edit1"
                      onClick={() => openTransactionFee()}
                    >{t('feeRef')}</div>
                  </div>
                  <div className="adr-gacha-title13">{t('FreeContent13')}</div>
                  <div className="adr-gacha-title14">{t('FreeContent14')}</div>
                  <div className='adr-gacha-img' onClick={() => openBrowserInNewTab('https://nagemon.com/')}><img src={Images.nagemonImg}/></div>
                  <div className="adr-gacha-title15">{t('FreeContent15')}</div>
                </div>
                <div className='adr-btn-website'>
                  {/* <button
                    id={'btnScale'}
                    onClick={() => item.website ? openBrowserInNewTab(item.website) : console.log('')}
                    className="adr-button" >{t('Website')}</button> */}
                  <div 
                    className="adr-newLink"
                    onClick={() => item.website ? openBrowserInNewTab(item.website) : console.log('')}
                  >{item.website ? (new URL(item.website)).origin : ''}</div>
                </div>
                {
                  isEnableRequest === true
                    ? <div className='adr-request721'>
                      <div className='adr-detail-title'>{t('gachaComing')}</div>

                      <div className='adr-downtime adr-center'>
                        <div className='adr-box-container'>
                          <div className='adr-box-wrapTime'>
                            <div className='adr-box-time'>{hours}</div>
                            <div className='adr-box-bgTime' style={{transform: `rotate(-${hours / 24 * 360 + 270}deg)`}}>
                              <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                            </div>
                          </div>
                          <div className='adr-box-time-label'>{t('hours')}</div>
                        </div>

                        <div className='adr-box-container'>
                          <div className='adr-box-wrapTime'>
                            <div className='adr-box-time'>{minutes}</div>
                            <div className='adr-box-bgTime' style={{transform: `rotate(-${minutes / 60 * 360 + 270}deg)`}}>
                              <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                            </div>
                          </div>
                          <div className='adr-box-time-label'>{t('minutes')}</div>
                        </div>

                        <div className='adr-box-container'>
                          <div className='adr-box-wrapTime'>
                            <div className='adr-box-time'>{seconds}</div>
                            <div className='adr-box-bgTime' style={{transform: `rotate(-${seconds / 60 * 360 + 270}deg)`}}>
                              <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                            </div>
                          </div>
                          <div className='adr-box-time-label'>{t('seconds')}</div>
                        </div>

                      </div>
                    </div>
                    : !isMyAirdrop && <div className='adr-btn-request'>
                      <div className="adr-gacha-title16">{t('textAboveButton')}</div>
                      <button
                        disabled={!item.isEnabledRequest || isGetting721}
                        id={item.isEnabledRequest ? '' : 'btnScale'}
                        onClick={() => { !tabClosed && clickOpenModalGacha(false) }}
                        className={tabClosed ? 'adr-button-request-disable' : item.isEnabledRequest ? 'adr-button-request' : 'adr-button-request-disable'} >{isGetting721 ? <Spin size={15} color={'white'}/> : t('Next')}</button>
                    </div>
                }
              </div>
              : item.is721DropV2 || item.is721DropV1
                ? <div className="adr-is721Drop adr-is721DropV2">
                  <div className="adr-image721">
                    {item.prize && <div>
                      <div className='adr-history' onClick={() => backTo721(true, item)}>{t('history')}</div>
                      <List
                        id="HBScrollBar"
                        dataSource={item.prize}
                        renderItem={(e, index) => (
                          <List.Item className={'av2-row ' + ((e.isFullView || e.id === 1) ? ' av2-fullView' : ' av2-haftView')}>
                            {e.id === 1
                              ? <div className='av2-price1'>
                                <img src={Images.gachaV2Price1}/>
                                <div className='av2-content'>
                                  <div className='av2-content-img'>
                                    <img src={e.image}/>
                                  </div>
                                  <div className='av2-content-prize'>
                                    <div className='av2-titlePrice'>{t('1stPrize')}</div>
                                    <div className='av2-totalPrize'>{e.totalPrize ? t('totalPrize', {num: e.totalPrize}) : t('unlimited')}</div>
                                    <div className='av2-name'>{e.priceCustom || e.name}</div>
                                    <div className='av2-percentName'>{e.percentName}</div>
                                  </div>
                                </div>
                              </div>
                              : e.id && <div className={'av2-price3 ' + (e.id === 2 ? ' av2-price2' : ' av2-priceOrther')}>
                                <img src={e.isFullView ? Images.gachaV2Price2a : Images.gachaV2Price2}/>
                                <div className='av2-content'>
                                  <div className='av2-content-img'>
                                    <img src={e.image}/>
                                  </div>
                                  <div className='av2-content-prize'>
                                    <div className='av2-titlePrice'>{
                                      e.id === 2 
                                        ? t('2ndPrize') 
                                        : e.id === 3 
                                          ? t('3rdPrize') 
                                          : t('orderPrize', {num: e.id})}
                                    </div>
                                    <div className='av2-totalPrize'>{e.totalPrize ? t('totalPrize', {num: e.totalPrize}) : t('unlimited')}</div>
                                    <div className='av2-name'>{e.priceCustom || e.name}</div>
                                    <div className='av2-percentName'>{e.percentName}</div>
                                  </div>
                                </div>
                              </div>}
                          </List.Item>
                        )}
                      />
                      {/* {item.prize[2] && <div className='av2-price3'>
                        <img src={Images.gachaV2Price2}/>
                        <div className='adr-priceNum'>{item.prize[2].amount}</div>
                        <div className={'adr-priceUnitMon ' + (item.prize[2].name.toLowerCase() === 'eth' && 'adr-priceUnit')}>{item.prize[2].name.toLowerCase() === 'eth' ? item.prize[2].name : t('monsterFos')}</div>
                      </div>}
                      {item.prize[3] && <div className='av2-price4'>
                        <img src={Images.gachaV2Price2}/>
                        <div className='adr-priceNum'>{item.prize[3].amount}</div>
                        <div className={'adr-priceUnitMon ' + (item.prize[3].name.toLowerCase() === 'eth' && 'adr-priceUnit')}>{item.prize[3].name.toLowerCase() === 'eth' ? item.prize[3].name : t('monsterFos')}</div>
                      </div>}
                      {item.prize[3] && <div className='av2-price4'>
                        <img src={Images.gachaV2Price2}/>
                        <div className='adr-priceNum'>{item.prize[3].amount}</div>
                        <div className={'adr-priceUnitMon ' + (item.prize[3].name.toLowerCase() === 'eth' && 'adr-priceUnit')}>{item.prize[3].name.toLowerCase() === 'eth' ? item.prize[3].name : t('monsterFos')}</div>
                      </div>} */}
                    </div>
                    }
                  </div>
                  <div className="adr-content-container">
                    <div className="adr-gacha-title3 av2-lineBottom colorF2">{item.prize_description}</div>
                  </div>
                  <div className="adr-content-free">
                    <div className='adr-freeTitle'><img src={item.amount_image}/></div>
                    <div className='adr-freeContent'>{t('comeOnceDay')}</div>
                  </div>
                  <div className="adr-content-container">
                    {/* <div className="adr-gacha-title">{item.name}</div>
                    <div className="adr-gacha-title2">{t('FreeContent2')}</div> */}
                    <div className="adr-gacha-title2a">
                      {/* {item.award_image && <img src={item.award_image}/>} */}
                      <img src={item.award_image} onError={i => i.target.style.display = 'none'}/>
                    </div>
                    <div className="adr-gacha-count">{t('gc-times', {num: countTxs})}</div>
                    <div className="adr-gacha-royalCrown" onClick={() => openWinnerListSub(item)}>
                      <img src={Images.royalCrown}/>
                      <div className="adr-gacha-winList">{t('gc-list')}</div>
                    </div>
                    <div className="adr-gacha-title3 av2-edit1 colorF2">{item.description}</div>
                    <div className="adr-gacha-title3 colorF2">{item.company_description}</div>
                    {item.company_image && <div className='adr-gacha-img' onClick={() => openBrowserInNewTab(item.company_link)}><img src={item.company_image}/></div>}
                    <div className="adr-gacha-title5">{t('FreeContent5')}</div>
                    <div className="adr-gacha-title6">{t('FreeContent6')}</div>
                  </div>
                  <div className='adr-btn-website'>
                    {/* <button
                      id={'btnScale'}
                      onClick={() => item.website ? openBrowserInNewTab(item.website) : console.log('')}
                      className="adr-button" >{t('Website')}</button> */}
                    <div 
                      className="adr-newLink av2-edit2"
                      onClick={() => openTransactionFee()}
                    >{t('feeRef')}</div>
                  </div>
                  {
                    isEnableRequest === true
                      ? <div className='adr-request721'>
                        <div className='adr-detail-title'>{t('gachaComing')}</div>

                        <div className='adr-downtime adr-center'>
                          <div className='adr-box-container'>
                            <div className='adr-box-wrapTime'>
                              <div className='adr-box-time'>{hours}</div>
                              <div className='adr-box-bgTime' style={{transform: `rotate(-${hours / 24 * 360 + 270}deg)`}}>
                                <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                              </div>
                            </div>
                            <div className='adr-box-time-label'>{t('hours')}</div>
                          </div>

                          <div className='adr-box-container'>
                            <div className='adr-box-wrapTime'>
                              <div className='adr-box-time'>{minutes}</div>
                              <div className='adr-box-bgTime' style={{transform: `rotate(-${minutes / 60 * 360 + 270}deg)`}}>
                                <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                              </div>
                            </div>
                            <div className='adr-box-time-label'>{t('minutes')}</div>
                          </div>

                          <div className='adr-box-container'>
                            <div className='adr-box-wrapTime'>
                              <div className='adr-box-time'>{seconds}</div>
                              <div className='adr-box-bgTime' style={{transform: `rotate(-${seconds / 60 * 360 + 270}deg)`}}>
                                <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                              </div>
                            </div>
                            <div className='adr-box-time-label'>{t('seconds')}</div>
                          </div>

                        </div>
                      </div>
                      : !isMyAirdrop && <div className='adr-btn-request'>
                        {gcName && gcBalance && <div className="adr-gacha-title17">{t('tokenNotEnough', {name: gcName, balance: gcBalance})}</div>}
                        <div className="adr-gacha-title16">{t('textAboveButton')}</div>
                        <button
                          disabled={!item.isEnabledRequest || isGetting721}
                          id={item.isEnabledRequest ? '' : 'btnScale'}
                          onClick={() => { !tabClosed && clickOpenModalGacha(item.gacha_code) }}
                          className={tabClosed ? 'adr-button-request-disable' : item.isEnabledRequest ? 'adr-button-request' : 'adr-button-request-disable'} >{isGetting721 ? <Spin size={15} color={'white'}/> : t('Next')}</button>
                      </div>
                  }
                </div>
                : <div>
                  <div className='adr-icon-container'>
                    <HBImage logo={item.imageLink} imgDefault={Images.ic_token_default} addClass={'adr-icon'}/>
                  </div>
                  <div className='adr-header'>
                    <div className='adr-name-container'>
                      <div className='adr-name-title'>{t('TokenName')}</div>
                      <div className='adr-name'>{item.name}</div>
                    </div>
                    <div className='adr-symbol-container'>
                      <div className='adr-name-title'>{t('Symbol')}</div>
                      <div className='adr-name'>{item.symbol}</div>
                    </div>
                  </div>
                  <div className='adr-detail-title adr-16White'>{t('ServicesDetails')}</div>
                  <div className="adr-content-container">
                    <div className='adr-content-txt'>{item.description}</div>
                  </div>
                  <div className='adr-btn-website'>
                    {/* <button
                      id={'btnScale'}
                      onClick={() => item.website ? openBrowserInNewTab(item.website) : console.log('')}
                      className="adr-button" >{t('Website')}</button> */}
                    <div 
                      className="adr-newLink"
                      onClick={() => item.website ? openBrowserInNewTab(item.website) : console.log('')}
                    >{item.website ? (new URL(item.website)).origin : ''}</div>
                  </div>
                  <div className="adr-help-container btTop-line">
                    <div className="adr-help-title">{t('TokenDetails')} </div>
                    <div className="adr-help-icon">
                      {/* <img alt='img' className='ess-img-question' src={Images.imgQuestion}/>
                      <div className="adr-help-description">{t('airdropScreen.tipHelp')}</div> */}
                      {/* <Tooltip placement="topLeft" overlayClassName='exs-airDrop-tooltip' mouseEnterDelay={1} title={
                        <div style={{
                          textAlign: 'justify',
                          padding: '5px 5px 5px 5px',
                          fontFamily: 'var(--font-roboto)',
                          fontSize: '14px'}}>
                          {t('airdropScreen.tipHelp')}</div>}>
                        <img alt='img' className='ess-img-question' src={Images.imgQuestion}/>
                      </Tooltip> */}
                    </div>
                  </div>
                  <div className='adr-total-container'>
                    <div className='adr-total-title'>
                      <div className={'adr-text-14 adr-text-title '}>{t('TotalSupplyOfTokens')}</div>
                      <div className={'adr-text-14 '}>{item.totalSupply && formatNumberOld(item.totalSupply, 8)}</div>
                    </div>
                    <div className='adr-total-title mgt10px'>
                      <div className={'adr-text-14 adr-text-title '}>{t('Decimal')}</div>
                      <div className={'adr-text-14 '}>{item.decimals && item.decimals}</div>
                    </div>
                  </div>
                  {
                    isEnableRequest === true
                      ? <div>
                        <div className='adr-detail-title'>{t('AirDropIsComingIn')}</div>

                        <div className='adr-downtime'>
                          <div className='adr-box-container'>
                            <div className='adr-box-wrapTime'>
                              <div className='adr-box-time'>{days}</div>
                              <div className='adr-box-bgTime' style={{transform: `rotate(-${days / 99 * 360 + 270}deg)`}}>
                                <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                              </div>
                            </div>
                            <div className='adr-box-time-label'>{t('days')}</div>
                          </div>

                          <div className='adr-box-container'>
                            <div className='adr-box-wrapTime'>
                              <div className='adr-box-time'>{hours}</div>
                              <div className='adr-box-bgTime' style={{transform: `rotate(-${hours / 24 * 360 + 270}deg)`}}>
                                <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                              </div>
                            </div>
                            <div className='adr-box-time-label'>{t('hours')}</div>
                          </div>

                          <div className='adr-box-container'>
                            <div className='adr-box-wrapTime'>
                              <div className='adr-box-time'>{minutes}</div>
                              <div className='adr-box-bgTime' style={{transform: `rotate(-${minutes / 60 * 360 + 270}deg)`}}>
                                <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                              </div>
                            </div>
                            <div className='adr-box-time-label'>{t('minutes')}</div>
                          </div>

                          <div className='adr-box-container'>
                            <div className='adr-box-wrapTime'>
                              <div className='adr-box-time'>{seconds}</div>
                              <div className='adr-box-bgTime' style={{transform: `rotate(-${seconds / 60 * 360 + 270}deg)`}}>
                                <img className="adr-img-bgTime" src={Images.iconBGTime}/>
                              </div>
                            </div>
                            <div className='adr-box-time-label'>{t('seconds')}</div>
                          </div>

                        </div>
                      </div>
                      : !isMyAirdrop && <div className='adr-btn-request'>
                        <button
                          disabled={!item.isEnabledRequest}
                          id={item.isEnabledRequest ? '' : 'btnScale'}
                          onClick={clickOpenModal}
                          className={tabClosed ? 'adr-button-request-disable' : item.isEnabledRequest ? 'adr-button-request' : 'adr-button-request-disable'} >{t('Request')}</button>
                      </div>
                  }
                  <div className="adr-update-container">
                    {isMyAirdrop && <button className="btn-add-sub-acount btn-update" onClick={() => onUpdateMyAirdrop(true, item)}>{t('update')}</button>}
                  </div>
                  <div className="adr-help-container">
                    <div className="adr-help-icon" onClick={() => setSmoothSlider(false)}>
                      <img alt='img' className='ess-img-question' src={Images.imgQuestion1}/>
                    </div>
                    <div className="adr-help-title">{t('Help')}</div>
                  </div>

                  {/* <div className='adr-description'>{item.description}</div> */}
                  {/* <button
                  disabled={!item.enable}
                  id={!item.enable ? 'btnDisable' : 'btnScale-active'}
                  className="adr-button-airdrop"
                  onClick={() => requestAirDrop()}
                >Air Drop</button> */}
                </div>
            : null
          }
        </div>
        : <div className='adr-help-tooltip'>
          <div className='adr-help-tooltipTitle'>
            <button
              className='adr-help-btnBack'
              onClick={() => setSmoothSlider(true)}
            >
              <img className="img-back"
                alt='imgBack'
                src={Images.tabNaviBack} />
            </button>
            <div className='adr-help-text'>
              {t('AirDropHelp')}
            </div>
          </div>
          <div className='adr-help-discription'>{t('airdropScreen.tipHelp')}</div>
        </div>
  )
}
export default AirdropRight
