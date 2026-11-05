import React from 'react'
import { Row, Col } from 'antd'
import './styles.css'
import Images from 'Assets/Image'

class View extends React.Component {
  imgHTSReceive = (local) => {
    switch (local) {
    case 'jp':
      return Images.imgHTSReceiveJP
    case 'cn':
      return Images.imgHTSReceiveCN
    case 'ru':
      return Images.imgHTSReceiveRU
    case 'es':
      return Images.imgHTSReceiveES
    case 'pt':
      return Images.imgHTSReceivePT
    case 'th':
      return Images.imgHTSReceiveTH
    case 'vn':
      return Images.imgHTSReceiveVN
    case 'kr':
      return Images.imgHTSReceiveKR
    default:
      return Images.imgHTSReceiveEN
    }
  }
  imgHTSSend = (local) => {
    switch (local) {
    case 'jp':
      return Images.imgHTSSendJP
    case 'cn':
      return Images.imgHTSSendCN
    case 'ru':
      return Images.imgHTSSendRU
    case 'es':
      return Images.imgHTSSendES
    case 'pt':
      return Images.imgHTSSendPT
    case 'th':
      return Images.imgHTSSendTH
    case 'vn':
      return Images.imgHTSSendVN
    case 'kr':
      return Images.imgHTSSendKR
    default:
      return Images.imgHTSSendEN
    }
  }
  render () {
    const { t, localeData } = this.props
    return (
      <div className="wrap-hts-container">
        <div className="sts-header">
          <div className="sts-header-title">{t('HowtoSendReceive')}</div>
        </div>
        <div className = {'hts-container'} id='HBScrollBar'>
          <div className={'hts-container-top'}>
            <Row>
              <div className={'hts-txt-title'}>{t('HowToSend.toReceive')}</div>
            </Row>
            <Row className={'hts-txt-row'}>
              <Col lg={12} xl={12} className={'hts-custom-col'}>
                <img className={'hts-img'} src={this.imgHTSReceive(localeData)}/>
              </Col>
              <Col lg={12} xl={12}>
                <div className={'hts-txt-content'}>{t('HowToSend.contentReceive')}</div>
              </Col>
            </Row>
          </div>

          <div className={'hts-whiteline'}/>
          <div className={'hts-container-bottom'}>
            <Row> <div className={'hts-txt-title'}>{t('HowToSend.toSend')}</div></Row>
            <Row className={'hts-txt-row'}>
              <Col lg={12} xl={12} className={'hts-custom-col'}>
                <img className={'hts-img'} src={this.imgHTSSend(localeData)}/></Col>
              <Col lg={12} xl={12} >
                <div className={'hts-txt-content hts-title2 hts-mgBottom30'}>{t('HowToSend.content1')}</div>
                <div className={'hts-txt-content hts-mgBottom30'}>{t('HowToSend.content3')}</div>
                <div className={'hts-txt-content'}>{t('HowToSend.content4')}</div>
                <div className={'hts-txt-content'}>{t('HowToSend.content5')}</div>
                <div className={'hts-txt-content'} style={{marginBottom: '5%'}}>{t('HowToSend.content6')}</div>

                <div className={'hts-txt-content hts-title2 hts-mgBottom30'}>{t('HowToSend.content8')}</div>
                <div className={'hts-txt-content'}>{t('HowToSend.content9')} {t('HowToSend.content10')} {t('HowToSend.content11')}</div>

              </Col>
            </Row>
          </div>

        </div>
      </div>
    )
  }
}
export default View
