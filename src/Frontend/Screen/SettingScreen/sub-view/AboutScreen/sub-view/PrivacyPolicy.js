import React from 'react'
import { connect } from 'react-redux'
import '../styles.css'
import { Button } from 'react-bootstrap'
import Images from '../../../../../../Assets/Image'
import { translate } from 'react-i18next'
export const handleBackRoute = (history) => {
  return (dispatch, getState) => {
    history.goBack()
  }
}

export const handleSubmit = (history, match) => {
  return (dispatch, getState) => {
    history.push('/mainTabbar')
  }
}

const TermServiceScreen = ({history, routeToCreate, routeToRestore, match, t}) => (
  <div className="pp-src-container">
    <Button className="btn-Back policy-ml30" onClick={handleBackRoute(history)}>
      <img className="img-back"
        alt='imgBack'
        src={Images.tabNaviBack} />
      {t('AboutWallet')}
    </Button>
    <div className="containerPrivacyPolicy sts-container">
      <div className="headerTerm md-header">{t('privacyPolicy')}</div>
      <div className="scrContainerPrivacyPolicy" id="HBScrollBar">
        <div className="txtTermService">
          <p>{t('pri_content1')}</p>
          <p>{t('pri_content1_1')}</p>
          <p>{t('pri_content1_2')}</p>
        </div>
        <div className="txtTitleTermService">
          {t('pri_title2')}
        </div>
        <div className="txtTermService">
          <p>{t('pri_content2')}</p>
          <p>{t('pri_content2_1')}</p>
          <p>{t('pri_content2_2')}</p>
          <p>{t('pri_content2_3')}</p>
          <p>{t('pri_content2_4')}</p>
        </div>
        <div className="txtTitleTermService">
          {t('pri_title3')}
        </div>
        <div className="txtTermService">
          <p>{t('pri_content3')}</p>
        </div>
        <div className="txtTitleTermService">
          {t('pri_title4')}
        </div>
        <div className="txtTermService">
          <p>{t('pri_content4')}</p>
          <p>{t('pri_content4_1')}</p>
          <p>{t('pri_content4_2')}</p>
          <p>{t('pri_content4_3')}</p>
          <p>{t('pri_content4_4')}</p>
          <p>{t('pri_content4_5')}</p>
          <p>{t('pri_content4_6')}</p>
          <p>{t('pri_content4_7')}</p>
          <p>{t('pri_content4_8')}</p>
          <p>{t('pri_content4_9')}</p>
        </div>
        <div className="txtTitleTermService">
          {t('pri_title5')}
        </div>
        <div className="txtTermService">
          <p>{t('pri_content5')}</p>
        </div>
        <div className="txtTitleTermService">
          {t('pri_title6')}
        </div>
        <div className="txtTermService">
          <p>{t('pri_content6')}</p>
          <p>{t('pri_content6_1')}</p>
          <p>{t('pri_content6_2')}</p>
          <p>{t('pri_content6_3')}</p>
          <p>{t('pri_content6_4')}</p>
        </div>
        <div className="txtTitleTermService">
          {t('pri_title7')}
        </div>
        <div className="txtTermService">
          <p>{t('pri_content7')}</p>
        </div>
        <div className="txtTitleTermService">
          {t('pri_title8')}
        </div>
        <div className="txtTermService">
          <p>{t('pri_content8')}</p>
          <p>{t('pri_content8_1')}</p>
        </div>
        <div className="txtTitleTermService">
          {t('pri_title9')}
        </div>
        <div className="txtTermService">
          <p>{t('pri_content9')}</p>
        </div>
      </div>
    </div>
  </div>
)

const mapStateToProps = (state) => ({
  ...state
})

export default translate('translations')(connect(mapStateToProps)(TermServiceScreen))
