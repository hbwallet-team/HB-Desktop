import React from 'react'
import '../styles.css'

const TokenSaleTerm = ({t, cancelTerm, gotoConfirmScreen, item}) => {
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
          <div className='tkst-text'>
            <div>{t('gts.text1')}</div>
            <div>{t('gts.text2')}</div>
            <div>{t('gts.text3')}</div>
            <div>{t('gts.text4')}</div>
            <div>{t('gts.text5')}</div>
          </div>
          <div className='tkst-button-container'>
            <button
              id={'btnScale'}
              className="tks-button-join"
              onClick={cancelTerm}
            >{t('Disagree')}</button>
            <button
              id={'btnScale'}
              className="tks-button-join tks-button-Agree"
              onClick={gotoConfirmScreen}
            >{t('Agree')}</button>
          </div>
        </div>
        : null
      }
    </div>
  )
}

export default TokenSaleTerm
