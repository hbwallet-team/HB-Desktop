import React from 'react'
import '../styles.css'
import { HBInput } from 'Frontend/Components/HBInput'
import Images from 'Assets/Image'
import { Wave } from 'better-react-spinkit'

const TokenSaleConfirm = ({t, item, receiverAccount, onChangeReceiverAccount, ethConfirmAmount, calculateSendAmount, arrCurrencyData, currencyConfirmAmount, onChangeCurrency, onClickMax, sendEth, cancelConfirm, isSendAmountErr, isDisableSend, fSpendable, isErrorMindeposit, tokenConfirmAmount, onChangeTokenConfirm, isLoadingSpendable, isLoadingExcute}) => {
  return (
    <div className='adr-container'>
      {item
        ? <div>
          <div className='adr-icon-container'>
            <img className='adr-icon' alt='img' src={item.imageLink}/>
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
          <div className='tksc-input-container tksc-disable'>
            <HBInput
              // icon={Images.ic_contacts}
              countMax={42}
              readOnly={true}
              value={item.contractAddress}
              onChange={(value) => onChangeReceiverAccount(value)}/>
          </div>
          <div className='tksc-input-container'>
            <HBInput
              placeholder={'YouSend'}
              symbol='ETH'
              readOnly={isLoadingSpendable}
              isSpacing={true}
              isError={isSendAmountErr || isErrorMindeposit}
              messageError={isErrorMindeposit ? t('PleaseDepositAtLeast', { getNumber: item.minDeposit }) : t('amountErrETH')}
              value={ethConfirmAmount}
              onChange={(value) => calculateSendAmount(value)}/>
          </div>
          <div className='tksc-input-container'>
            <HBInput
              readOnly={isLoadingSpendable}
              placeholder={'YouSend'}
              symbol={arrCurrencyData}
              value={currencyConfirmAmount}
              onChange={(value) => onChangeCurrency(value)}/>
          </div>
          <div className='tksc-input-container'>
            <HBInput
              readOnly={isLoadingSpendable}
              placeholder={'YouWillGet'}
              symbol={item.symbol}
              value={tokenConfirmAmount}
              onChange={(value) => onChangeTokenConfirm(value)}/>
          </div>
          <div className='tksc-spendable-group'>
            <div className='tksc-spendable'><span>{t('spendAble')}</span>
              <div className="tksc-wrap-max">
                <div className="tksc-Spendable-number">
                  {isLoadingSpendable
                    ? <div className="tksc-Spendable-Wave"><Wave size={15} color='#F2F5FC'/></div>
                    : fSpendable
                  } ETH
                </div>
                <button
                  className="tksc-button-max"
                  onClick={() => onClickMax()}
                >{t('max1')}</button>
              </div>
            </div>
          </div>
          <div className='tkstc-group-btn'>
            <button
              id={'btnScale'}
              className="tksc-button-join"
              onClick={() => cancelConfirm()}
            >{t('cancel')}</button>
            <button
              disabled={!item.enable || isDisableSend || isLoadingExcute}
              id={!item.enable || isDisableSend || isLoadingExcute ? 'btnDisable' : 'btnScale'}
              className="tksc-button-join tksc-button-active"
              onClick={() => sendEth()}
            >{isLoadingExcute ? <Wave size={30} color='white'/> : t('Exchange')}</button>
          </div>
          <div className="tksc-warning">{t('youCannotCancelJoinTokenSale')}</div>
        </div>
        : null
      }
    </div>
  )
}

export default TokenSaleConfirm
