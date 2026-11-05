import React from 'react'
import './styles.css'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'

const closeFunction = (parent) => {
  parent.refs.md_exs_polyci_two.hide()
  Observer.emit(OBSERVER_KEY.SELECT_TAB_ETHER)
}
const openExchange = async (parent, setUserAuthentication) => {
  await setUserAuthentication()
  parent.refs.md_exs_polyci_two.hide()
}
const PopupPolyciTwo = ({parent, t, setUserAuthentication = () => {}}) => {
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-popup-policy pp-wrap-amount-container'>
        <div className='pp-wrap-amount-content pp-tlr-content2'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => closeFunction(parent)}><img src={Images.close1} /></div>
            {t('polyci3_title')}
          </div>
          <div className='pp-wrap-amount-body pp-next2'>
            <div className="polyci_content">
              <p className="pp-psmall">{t('polyci3_description')}</p>
              <p className="pp-psmall">{t('polyci3_item_1')}</p>
              <p className="pp-psmall">{t('polyci3_item_2')}</p>
              <p className="pp-psmall">{t('polyci3_item_3')}</p>
              <p className="pp-psmall">{t('polyci3_item_4')}</p>
              <p className="pp-psmall">{t('polyci3_item_5')}</p>
              <p className="pp-psmall">{t('polyci3_item_6')}</p>
              <p className="pp-psmall">{t('polyci3_item_7')}</p>
              <p className="pp-psmall">{t('polyci3_item_8')}</p>
              <p className="pp-psmall">{t('polyci3_item_9')}</p>
              <p className="pp-psmall">{t('polyci3_item_10')}</p>
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button
              className='exs-btn exs-pp-unwrap-btn'
              onClick={() => closeFunction(parent)}
            >
              {t('Disagree')}
            </button>
            <button
              className='exs-btn exs-pp-unwrap-btn trf-request exs-btn-primary'
              onClick={() => openExchange(parent, setUserAuthentication)}
            >
              {t('Agree')}
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupPolyciTwo
