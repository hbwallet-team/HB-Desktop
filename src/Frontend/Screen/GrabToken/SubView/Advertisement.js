import React from 'react'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'

const Advertisement = ({ THIS }) => {
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-wrap-amount-container pp-airdrop-advertisement'>
        <div className='pp-wrap-amount-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => THIS.refs.md_advertisement.hide()}>
              <img src={Images.close1} />
            </div>
            {THIS.props.t('AirdropFeature')}
          </div>
          <div className="pp-wrap-amount-body">
            <div className="airdrop-feature-container">
              <div className="airdrop-feature-txt">{THIS.props.t('AirdropFeatureDesc')}</div>
              <img src={Images.apply_airdrop}/>
            </div>
          </div>
          <div className="pp-wrap-amount-bottom">
            <button 
              className='exs-btn exs-pp-unwrap-btn exs-btn-primary' 
              onClick={() => THIS.refs.md_advertisement.hide()}
            >{THIS.props.t('ok')}</button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default Advertisement
