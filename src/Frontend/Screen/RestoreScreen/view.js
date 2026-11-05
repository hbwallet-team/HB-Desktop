/**
* NAME: RestoreScreen
* CREATOR: Khiem Created
* Display Restore Screen
*/
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import './styles.css'
import CoreLayoutContainer from '../../Container/CoreLayoutContainer'
import Image from '../../../Assets/Image'

export default class RestoreScreen extends Component {
  constructor (props) {
    super(props)
    this.state = ({
      strMnemonic: props.mnemonicData.length > 0 ? props.mnemonicData : '',
      disabledBtn: props.mnemonicData.trim().split(' ').length !== 12
    })
    props.defaultThis(this)
  }

  // |------------------------------|
  // |--- RENDER MAIN VIEW START ---|
  // |------------------------------|
  render () {
    const { strMnemonic } = this.state
    const { handleBackRoute, validateInput, handleSubmit, t } = this.props
    return (
      <div className="ls-Head">
        <CoreLayoutContainer isFooter={true} leftAction={handleBackRoute} title={t('newWallet')}>
          <div className="containerCenter">
            {/* Header and tip  */}
            <div className="header">{t('restoreWallet')}</div>
            <div className="txtTipPassphrase">{t('restoreWalletTitleInput')}</div>
            {/* Text area input mnemonic */}
            <div className="textArea">
              <img className="img-key" alt='imgKey' src={Image.icKey1} />
              <textarea className="areaContainer" id="HBScrollBar"
                placeholder={t('EnterBackupPhrase')}
                autoFocus
                value={strMnemonic}
                onChange={validateInput}
              />
            </div>
            {/* Create & cancel Button */}
            <div className="group-Buttons">
              <Button className="btn-init-screen btn-new-wallet"
                onClick={handleBackRoute}>
                {t('cancel')}
              </Button>
              <Button className="btn-init-screen btn-new-wallet btn-OK-wallet"
                onClick={handleSubmit}>
                {t('restore')}
              </Button>
            </div>
          </div>
        </CoreLayoutContainer>
      </div>
    )
  }
}
