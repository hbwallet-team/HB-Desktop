import React from 'react'
import '../../styles.css'
import './styles.css'
import ConfirmPINCodeScreen from '../ConfirmPINCodeScreen/view'
import Images from 'Assets/Image'

export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isActiveScreen: props.arrPinCodeData.length > 0
    }
  }
  funcSetActiveScreen = (value) => this.setState({ isActiveScreen: !value })
  funcCompleteInputPINCode = (value, self) => this.props.onCompleteInputPINCode(value, self)
  funcChangeInputPINCode =(value, index) => console.log(value, index)
  render () {
    const {t, arrCardData} = this.props
    const { isActiveScreen } = this.state
    return (
      isActiveScreen
        ? <ConfirmPINCodeScreen
          t={t}
          onChangeInputPINCode={this.funcChangeInputPINCode}
          onCompleteInputPINCode={this.funcCompleteInputPINCode}
          parent={'DisplayPassphraseScreen'}
          setIsActiveScreen={this.funcSetActiveScreen}/>
        : <div className="sts-container">
          <div className="sts-header">
            <div className="sts-header-title">{this.props.t('DisplayPasspharase')}</div>
          </div>
          <div className="container-menu-setting-content menu-setting-sub-pp-container limit-container">
            <div className="menu-setting-sub-pp-top">
              <div className="menu-setting-sub-pp-top-icon">
                <img src={Images.ic_keywords} />
              </div>
              {arrCardData[0].mnemonic}
            </div>
            <div className="menu-setting-sub-pp-bottom">
              <div className="ph-message">{t('DisplayPasspharase.content')}</div>
              <div className="ph-message">{t('DisplayPasspharase.content1')}</div>
              <div className="ph-message">{t('DisplayPasspharase.content2')}</div>
            </div>
          </div>
        </div>
    )
  }
}
