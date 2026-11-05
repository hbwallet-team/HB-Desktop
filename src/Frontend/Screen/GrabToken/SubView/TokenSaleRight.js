import React from 'react'
// import { HBInput } from 'Frontend/Components/HBInput'
import '../styles.css'
import { formatNumberOld, openBrowserInNewTab } from 'Utils/globalFunction'
import Images from 'Assets/Image'
import HBImage from 'Frontend/Components/HBImage'

const TokenSaleRight = ({t, item, isEnableJoin, days, hours, minutes, seconds, tokenAmount, ethAmount, onChangeEthereumAmount, onChangeTokenAmount, joinBuyToken, localeData}) => {
  let now = new Date()
  let compareDate = new Date()
  compareDate.setTime(item && item.expire_time)
  let isEnable = (compareDate.getTime() - now.getTime()) > 0
  return (
    <div className={isEnable ? 'adr-container' : 'adr-container-disable'}>
      {item
        ? <div>
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
          <div className='adr-detail-title adr-16White'>{t('ServiceDetails')}</div>
          <div className="adr-content-container">
            <div className='adr-content-txt'>{t('airdropScreen.tipHelp')}</div>
          </div>
          <div className='adr-btn-website'>
            <div 
              className="adr-newLink"
              onClick={() => item.website ? openBrowserInNewTab(item.website) : console.log('')}
            >{(new URL(item.website)).origin}</div>
          </div>
          <div className="adr-help-container btTop-line">
            <div>{t('TokenDetails')} </div>
          </div>
          <div className='adr-total-container'>
            <div className='adr-total-title'>
              <div className={'adr-text-14 adr-text-title '}>{t('TotalSupplyOfTokens')}</div>
              <div className={'adr-text-14 '}>{formatNumberOld(item.totalSupply, 8)}</div>
            </div>
            <div className='adr-total-title'>
              <div className={'adr-text-14 adr-text-title '}>{t('TokenSaleHardCap')}</div>
              <div className={'adr-text-14 '}>{formatNumberOld(item.hardCap, 8)}</div>
            </div>
            <div className='adr-total-title'>
              <div className={'adr-text-14 adr-text-title '}>{t('Rate')}</div>
              <div className={'adr-text-14 '}> <span style={{marginRight: '10px'}}>{'ETH/' + item.symbol}</span> {' 1/' + formatNumberOld(item.rate, 8)}</div>
            </div>
            <div className='adr-total-title'>
              <div className={'adr-text-14 adr-text-title '}>{t('IndividualMinEth')}</div>
              <div className={'adr-text-14 '}>{item.minDeposit + '/ETH'}</div>
            </div>
          </div>
          {/* <div className='adr-detail-title'>{t('Calculator')}</div>
        <div className='tks-description'>
          <span style={{marginRight: '10px'}}>{'Rate'}</span>
          <span style={{marginRight: '10px'}}>{'ETH / ' + item.symbol}</span>
          {'1ETH / ' + formatNumberOld(item.rate.toFixed(8), 8)}
        </div> */}
          {/* <div className='tks-input'>
          <HBInput
            symbol='ETH'
            value={ethAmount}
            onChange={(value) => onChangeEthereumAmount(value)}/>
        </div>
        <div className='tks-input-tk'>
          <HBInput
            symbol={item.symbol}
            value={tokenAmount}
            onChange={(value) => onChangeTokenAmount(value)}/>
        </div>
        <button
          disabled={!item.enable}
          id={!item.enable ? 'btnDisable' : 'btnScale-active'}
          className="tks-button-join"
          onClick={() => joinBuyToken()}
        >{t('Join')}</button> */}
          {
            isEnableJoin === true
              ? <div>
                <div className='adr-detail-title adr-coming-title'>{t('TokenSaleIsComing')}</div>

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
              : <div className='adr-btn-request'>
                <button
                  disabled={!item.enable}
                  id={!item.enable ? 'btnDisable' : 'btnScale'}
                  className={!item.enable ? 'tks-button-join' : 'tks-button-join-active'}
                  onClick={() => joinBuyToken()}
                >{t('Join')}</button>
              </div>
          }
        </div>
        : null
      }
    </div>
  )
}

export default TokenSaleRight
