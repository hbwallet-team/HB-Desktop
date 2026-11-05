import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import Images from '../../../../../../Assets/Image'
import '../styles.css'
import { translate } from 'react-i18next'

class TermServiceScreen extends PureComponent {
  handleBackRoute = () => {
    this.props.history.goBack()
  }

 handleSubmit = () => {
   this.props.history.push('/privacyPolicyScreen')
 }

 render () {
   const { t } = this.props
   return (
     <div className="pp-src-container">
       <Button className="btn-Back policy-ml30" onClick={this.handleBackRoute}>
         <img className="img-back"
           alt='imgBack'
           src={Images.tabNaviBack} />
         {t('AboutWallet')}
       </Button>
       <div className="sub-view-containerTermService sts-container">
         <div className="headerTerm md-header">{t('termsService')}</div>
         <div className="scrContainerPrivacyPolicy" id="HBScrollBar">
           <div className="txtTermService">
             {t('content0')}
           </div>
           <div className="txtTitleTermService">
             {t('title1')}
           </div>
           <div className="txtTermService">
             <p>{t('content1')}</p>
             <p>{t('content1_1')}</p>
             <p>{t('content1_2')}</p>
           </div>
           <div className="txtTitleTermService">
             {t('title2')}
           </div>
           <div className="txtTermService">
             <p>{t('content2')}</p>
             <p>{t('content2_1')}</p>
             <p>{t('content2_2')}</p>
             <p>{t('content2_3')}</p>
           </div>
           <div className="txtTitleTermService">
             {t('title3')}
           </div>
           <div className="txtTermService">
             <p>{t('content3')}</p>
           </div>
           <div className="txtTitleTermService">
             {t('title4')}
           </div>
           <div className="txtTermService">
             <p>{t('content4')}</p>
             <p>{t('content4_1')}</p>
             <p>{t('content4_2')}</p>
           </div>
           <div className="txtTitleTermService">
             {t('title5')}
           </div>
           <div className="txtTermService">
             <p>{t('content5')}</p>
             <p>{t('content5_1')}</p>
           </div>
           <div className="txtTitleTermService">
             {t('title6')}
           </div>
           <div className="txtTermService">
             <p>{t('content6')}</p>
             <p>{t('content6_1')}</p>
             <p>{t('content6_2')}</p>
             <p>{t('content6_3')}</p>
             <p>{t('content6_4')}</p>
             <p>{t('content6_5')}</p>
             <p>{t('content6_6')}</p>
             <p>{t('content6_7')}</p>
             <p>{t('content6_8')}</p>
           </div>
           <div className="txtTitleTermService">
             {t('title7')}
           </div>
           <div className="txtTermService">
             <p>{t('content7_1')}</p>
             <p>{t('content7_2')}</p>
             <p>{t('content7_3')}</p>
             <p>{t('content7_4')}</p>
             <p>{t('content7_5')}</p>
             <p>{t('content7_6')}</p>
             <p>{t('content7_7')}</p>
             <p>{t('content7_8')}</p>
             <p>{t('content7_9')}</p>
             <p>{t('content7_10')}</p>
             <p>{t('content7_11')}</p>
           </div>
           <div className="txtTitleTermService">
             {t('title8')}
           </div>
           <div className="txtTermService">
             <p>{t('content8')}</p>
           </div>
         </div>
       </div>
     </div>
   )
 }
}

const mapStateToProps = (state) => ({
  ...state
})

export default translate('translations')(connect(mapStateToProps)(TermServiceScreen))
