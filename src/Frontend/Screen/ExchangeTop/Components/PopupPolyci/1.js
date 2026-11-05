import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import Draggable from 'react-draggable'

const nextFunction = (parent) => {
  parent.refs.md_exs_polyci_one.hide()
  parent.refs.md_exs_polyci_two.show()
}
const prevFunction = (parent) => {
  parent.refs.md_exs_polyci_one.hide()
  parent.refs.md_exs_polyci.show()
}
const closeFunction = (parent) => {
  parent.refs.md_exs_polyci_one.hide()
  Observer.emit(OBSERVER_KEY.SELECT_TAB_ETHER)
}
const PopupPolyciOne = ({parent, t}) => {
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-wrap-amount-container pp-popup-policy'>
        <div className='pp-wrap-amount-content pp-tlr-content2'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => closeFunction(parent)}><img src={Images.close1} /></div>
            {t('polyci2_title')}
          </div>
          <div className='pp-wrap-amount-body pp-next1'>
            <div className="polyci_item">
              <p><img src={Images.check_button} alt="" height={15}/> {t('polyci2_description')}</p>
              <p><img src={Images.check_button} alt="" height={15}/> {t('polyci2_item_1')}</p>
              <p><img src={Images.check_button} alt="" height={15}/> {t('polyci2_item_2')}</p>
              <p><img src={Images.check_button} alt="" height={15}/> {t('polyci2_item_3')}</p>
            </div>
            <p className="pp-psmall pp-text-bottom exs-color-gray">{t('polyci2_ps_1')}</p>
            <p className="pp-psmall pp-text-bottom exs-color-gray">{t('polyci2_ps_2')}</p>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button
              className='exs-btn exs-pp-unwrap-btn'
              onClick={() => prevFunction(parent)}
            >
              {t('back')}
            </button>
            <button
              className='exs-btn exs-pp-unwrap-btn trf-request exs-btn-primary'
              onClick={() => nextFunction(parent)}
            >
              {t('Next')}
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupPolyciOne
