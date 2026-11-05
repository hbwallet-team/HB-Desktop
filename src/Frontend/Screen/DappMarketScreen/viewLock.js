import React from 'react'
import Images from 'Assets/Image'
import './styles.css'

export default class DappMarketScreen extends React.PureComponent {
  render () {
    return (
      <div className="dappLock">
        <div className="dl-container">
          <div className="dl-image"><img src={Images.ic_marketUnactive} /></div>
          <div className="dl-content">{this.props.t('Dapps.lockNFT')}</div>
        </div>
      </div>
    )
  }
}
