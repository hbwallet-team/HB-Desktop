import React from 'react'
import './styles.css'
import TokenRequestForm from '../TokenRequestForm'
import Images from 'Assets/Image'
import Draggable from 'react-draggable'

const PopupTokenListingRequest = ({ that, t, handleSubmit }) => {
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <div className='pp-request-token pp-wrap-amount-container'>
        <div className='pp-wrap-amount-content pp-tlr-content'>
          <div className='pp-wrap-amount-header'>
            <div className="pp-close" onClick={() => that.refs.md_exs_token_listing_request.hide()}><img src={Images.close1} /></div>
            {t('tokenListingRequest')}
          </div>
          <TokenRequestForm onSubmit={handleSubmit} t={t}/>
        </div>
      </div>
    </Draggable>
  )
}

export default PopupTokenListingRequest
