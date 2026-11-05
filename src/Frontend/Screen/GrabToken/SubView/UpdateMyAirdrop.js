import React from 'react'
import Images from 'Assets/Image'
import { HBInput } from 'Frontend/Components/HBInput'
import moment from 'moment'
import { Spin } from 'Frontend/Components/HBLoader'
import { Wave } from 'better-react-spinkit'
import { Tooltip } from 'antd'
import Settings from 'Backend/settings'
import { openBrowserInNewTab } from 'Utils/globalFunction'

const UpdateMyAirdrop = ({ onClickMyAirdrop, onClickPauseAirdrop, onClickStopAirdrop, t, onCheckWithdraw, isAddressErr, txtReceiveAddr, onClickWithdrawAirdrop, item, detailMyAirdrop, loadingPause, loadingWithdraw }) => {
  return (
    <div className="gt-apply-airdop">
      <button className="exs-btn-Back" onClick={() => onClickMyAirdrop(true)}>
        <img className="img-back" alt='imgBack' src={Images.tabNaviBack} />
        {t('myAirDrop')}
      </button>
      <div className='gt-list-updateAirdrop'>
        <div className="sts-header">
          <div className="sts-header-title">{item.name}</div>
          {!item.isExpire && <button className="btn-add-sub-acount btn-Pause" onClick={onClickPauseAirdrop}>{(loadingPause || (detailMyAirdrop && detailMyAirdrop.stop === undefined)) 
            ? <div className='ua-list-loading ua-pauseSpin'><Spin/></div>
            : (detailMyAirdrop && detailMyAirdrop.stop) ? t('afa-unPause') : t('afa-Pause')}</button>}
        </div>
        <div className='ua-content'>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('afa-StartTime')}</div>
            <div className='ua-rowRight'>{moment(item.start_time).format('YYYY/MM/DD HH:mm')}</div>
          </div>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('afa-EndTime')}</div>
            <div className='ua-rowRight'>{moment(item.expire_time).format('YYYY/MM/DD HH:mm')}</div>
          </div>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('afa-smartContract')}</div>
            <div className='ua-rowRight ua-underline' onClick={() => openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}address/${item.contractAddress}`)}>{item.contractAddress}</div>
          </div>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('Token')}</div>
            <div className='ua-rowRight ua-underline' onClick={() => openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}address/${item.erc20}`)}>{item.erc20}</div>
          </div>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('afa-Owner')}</div>
            <div className='ua-rowRight ua-underline' onClick={() => openBrowserInNewTab(`${Settings.server.etherscan.orginUrl}address/${item.owner}`)}>{item.owner}</div>
          </div>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('afa-AirdropAmount')}</div>
            <div className='ua-rowRight'>{(detailMyAirdrop && detailMyAirdrop.airDropAmount !== undefined)
              ? detailMyAirdrop.airDropAmount.toString()
              : <div className='ua-list-loading'><Wave size={20} color='white' /></div>}
            </div>
          </div>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('afa-RemainingToken')}</div>
            <div className='ua-rowRight'>{(detailMyAirdrop && detailMyAirdrop.remainingToken !== undefined) 
              ? detailMyAirdrop.remainingToken.toString()
              : <div className='ua-list-loading'><Wave size={20} color='white' /></div>}
            </div>
          </div>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('afa-airdroppedAmount')}</div>
            <div className='ua-rowRight'>{(detailMyAirdrop && detailMyAirdrop.getTotalAirDroppedAmount !== undefined)
              ? detailMyAirdrop.getTotalAirDroppedAmount.toString()
              : <div className='ua-list-loading'><Wave size={20} color='white' /></div>}
            </div>
          </div>
          <div className='ua-row'>
            <div className='ua-rowLeft'>{t('afa-receivedAirdrop')}</div>
            <div className='ua-rowRight'>{(detailMyAirdrop && detailMyAirdrop.getTotalNumberOfAddressesReceivedAirDrop !== undefined) 
              ? detailMyAirdrop.getTotalNumberOfAddressesReceivedAirDrop.toString()
              : <div className='ua-list-loading'><Wave size={20} color='white' /></div>}
            </div>
          </div>
          <div className='ua-rowWithdraw'>
            <div className='ua-rowLeft'>
              {t('afa-WithdrawAddress')}
              <Tooltip placement="top" title={<div style={{
                padding: '5px 5px 5px 5px',
                fontFamily: 'var(--font-helvetica-neue)',
                fontSize: '11px'}}>
                {t('afa-withdrawDesc')}</div>}>
                <img src={Images.ic_help} className="pp-tlr-help-icon"/>
              </Tooltip>
            </div>
            <HBInput
              className={'mh-input-41 edt-special-input'}
              isError={isAddressErr}
              messageError = {t('errorAddress42')}
              value={txtReceiveAddr}
              onChange={onCheckWithdraw}/>
            <button 
              className={'btn-Withdraw uma-disable ' + 
                ((!isAddressErr && 
                txtReceiveAddr !== '' && 
                detailMyAirdrop &&
                (detailMyAirdrop.stop || (item && (Number(item.expire_time) < Date.now()))) &&
                detailMyAirdrop.remainingToken > 0
                ) && 'uma-enable')
              }
              onClick={
                (!isAddressErr && 
                txtReceiveAddr !== '' && 
                detailMyAirdrop &&
                (detailMyAirdrop.stop || (item && (Number(item.expire_time) < Date.now()))) &&
                detailMyAirdrop.remainingToken > 0
                ) ? () => onClickWithdrawAirdrop(item) : undefined}>{loadingWithdraw ? <Spin size={15}/> : t('withdraw')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateMyAirdrop
