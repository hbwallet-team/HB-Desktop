import React from 'react'
import './styles.css'
import { Link } from 'react-router-dom'
import { openBrowserInNewTab } from 'Utils/globalFunction'

export default class View extends React.Component {
  render () {
    const { t } = this.props
    return (
      <div className="wrap-about-container">
        <div className="sts-header">
          <div className="sts-header-title">{t('AboutHBBlockchainInterface')}</div>
        </div>
        <div className="about-container">
          <div className="about-content">
            <div className="about-content-txt">{t('About.content')} {t('About.content1')}</div>
            <div className="about-content-txt mgTopAbout-30">{t('About.content2')} {t('About.content3')} {t('About.content4')}</div>
            <div className="about-content-txt mgTopAbout-30">{t('About.content5')}</div>
            <div className="about-content-txt mgTopAbout-30">{t('About.content6')} {t('About.content7')} {t('About.content8')} {t('About.content9')} {t('About.content10')}</div>
          </div>
          <div className="about-link">
            <div className="about-link-txt">
              <Link className="about-link-txt" to="/mainTabbar/settingScreen/privacyPolicyScreen">{t('PrivacyPolicy.title')}</Link>
            </div>
            <div className="about-link-txt">
              <Link className="about-link-txt" to="/mainTabbar/settingScreen/termsOfServiceScreen">{t('TermsOfService.title')}</Link>
            </div>

            <div className="about-link-txt" onClick={() => openBrowserInNewTab('https://www.hb-wallet.com/')} >{t('Website')}</div>
          </div>
        </div>
      </div>
    )
  }
}
