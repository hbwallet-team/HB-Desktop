import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import '../styles.css'
import CoreLayoutContainer from '../../../Container/CoreLayoutContainer'
import { translate } from 'react-i18next'

class PrivacyPolicy extends PureComponent {
  // constructor (props) {
  //   super(props)
  //   this.state = ({
  //     activeID: 'btnTerm-InActive'
  //   })
  //   this.handleScroll = this.handleScroll.bind(this)
  // }

  handleBackRoute = () => {
    this.props.history.push(`/termsServiceScreen/${this.props.match.params.preScreen}`)
  }

  handleSubmit = () => {
    this.props.history.push('/mainTabbar')
  }

  // handleScroll (e) {
  //   var scrollTop = e.nativeEvent.path[0].scrollTop
  //   var scrollHeight = document.getElementById('HBScrollBar').scrollHeight
  //   var offsetHeight = document.getElementById('HBScrollBar').offsetHeight
  //   var contentHeight = scrollHeight - offsetHeight

  //   if ((contentHeight - 35) <= scrollTop) {
  //     this.setState({ activeID: '' })
  //   }
  // }

  render () {
    const { t } = this.props
    // const { activeID } = this.state
    return (
      <div className="ls-Head"> 
        <CoreLayoutContainer leftAction={this.handleBackRoute} title={t('termsService')}>
          <div className="containerTermService">
            <div className="headerTerm">{t('privacyPolicy')}</div>
            <div className="scrContainer" id="HBScrollBar">
              <div className="txtTitleTermService">
                {t('privacyPolicy')}
              </div>
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
            {/* Create & cancel Button */}
            <div className="group-ButtonsTerm">
              <Button className="btn-init-screen btnTermService"
                onClick={this.handleBackRoute}>
                {t('Disagree')}
              </Button>
              <Button className="btn-init-screen btnTermService btnActive"
              // id={activeID}
                onClick={this.handleSubmit}>
                {t('Agree')}
              </Button>
            </div>
          </div>
        </CoreLayoutContainer>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state
})

export default translate('translations')(connect(mapStateToProps)(PrivacyPolicy))
