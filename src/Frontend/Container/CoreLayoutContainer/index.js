import React, { PureComponent } from 'react'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import './styles.css'
import Header from './header'
import { translate } from 'react-i18next'
import './antd.css'
import Radium from 'radium'
import { fadeIn } from 'react-animations'
import Observer from 'Utils/HBObserver'
const appVersion = window.require('electron').remote.app.getVersion()

const ScreenAnimationDefault = {
  animation: 'x ' + 1 + 's',
  animationName: Radium.keyframes(fadeIn, 'fadeIn')
}

class CoreLayoutContainer extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isConnectedServer: true
    }
  }
  componentWillMount () {
    Observer.on(OBSERVER_KEY.SERVER_API_CRASH, () => {
      this.setState({ isConnectedServer: false }, () => this.internetShow())
    })
  }
  componentWillUnmount () {
    Observer.removeListener(OBSERVER_KEY.SERVER_API_CRASH, () => {})
  }
  internetShow = async () => {
    setTimeout(() => {
      this.setState({ isConnectedServer: true })
    }, 5000)
  }
  render () {
    const { children, leftAction, title, isFooter, t, internetData, localeData } = this.props
    const { isConnectedServer } = this.state
    return (
      <div className={'window' + (localeData === 'jp' || localeData === 'cn' ? ' locale-jp-cn' : '')}>
        {leftAction && <Header leftAction={leftAction} title={title}/>}
        {children}
        {isFooter && <div className="txt-version">{t('titleVersion')} {appVersion}</div>}
        {internetData === false && <div style={ScreenAnimationDefault} className="internetContainer">
          <div>{t('InternetError1')}</div>
          <div>{t('InternetError2')}</div>
        </div>}
        {isConnectedServer === false && <div style={ScreenAnimationDefault} className="internetContainer">
          <div>{t('serverApiCrash')}</div>
        </div>}
      </div>
    )
  }
}

export default translate('translations')(CoreLayoutContainer)
