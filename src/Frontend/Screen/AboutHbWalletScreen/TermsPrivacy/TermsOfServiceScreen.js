import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import '../styles.css'
import CoreLayoutContainer from '../../../Container/CoreLayoutContainer'
import { translate } from 'react-i18next'

class TermServiceScreen extends PureComponent {
  // constructor (props) {
  //   super(props)
  //   this.state = ({
  //     activeID: 'btnTerm-InActive'
  //   })
  //   this.handleScroll = this.handleScroll.bind(this)
  // }

  handleBackRoute = () => {
    if (this.props.match.params.preScreen === 'RestoreScreen') {
      this.props.history.push('/restoreScreen')
    } else {
      this.props.history.push('/mainScreen')
    }
  }

 handleSubmit = () => {
   this.props.history.push(`/privacyPolicyScreen/${this.props.match.params.preScreen}`)
 }

  //  handleScroll (e) {
  //    var scrollTop = e.nativeEvent.path[0].scrollTop
  //    var scrollHeight = document.getElementById('HBScrollBar').scrollHeight
  //    var offsetHeight = document.getElementById('HBScrollBar').offsetHeight
  //    var contentHeight = scrollHeight - offsetHeight

  //    if ((contentHeight - 10) <= scrollTop) {
  //      this.setState({activeID: ''})
  //    }
  //  }

 render () {
   const { t } = this.props
   return (
     <div className="ls-Head">
       <CoreLayoutContainer
         leftAction={this.handleBackRoute}
         title={this.props.match.params.preScreen === 'RestoreScreen'
           ? t('restoreWallet')
           : t('newWallet')}
       >
         <div className="containerTermService">
           <div className="headerTerm">{t('termsService')}</div>
           <div className="scrContainer" id="HBScrollBar">
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
           {/* Create & cancel Button */}
           <div className="group-ButtonsTerm">
             <Button className="btn-init-screen btnTermService"
               onClick={this.handleBackRoute}>
               {t('Disagree')}
             </Button>
             <Button className="btn-init-screen btnTermService btnActive"
             //  id={activeID}
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

export default translate('translations')(connect(mapStateToProps)(TermServiceScreen))
