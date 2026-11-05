import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import { Button } from 'react-bootstrap'
import { MdArrowForward } from 'react-icons/lib/md'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import {setChosenLanguage} from 'Utils/0xError'
import { openBrowserInNewTab } from 'Utils/globalFunction'

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.funcDefautlThis(this)
    this.state = ({
      isContact: false
    })
    setChosenLanguage(this.props.localeData)
  }

  render () {
    const { t, ethToOther, otherToETH, shapeShiftHistory, onBack } = this.props
    const { isContact } = this.state

    return (
      <div style={{width: '100%', height: '100%'}}>
        {isContact && <Header leftAction={onBack} title={t('ShapeShiftTop')}/>}
        <div className='ssmn-container'>

          <div className='ssmn-viewImage'>
            <img alt='img' src={Images.icShapeshift} className='ssmn-img-confirm'/>
          </div>
          {
            isContact
              ? <div>
                <div className='ssmn-groubbtn'>
                  <Button
                    onClick={() => openBrowserInNewTab('https://shapeshift.zendesk.com/hc/en-us')}
                    className="btn-init-screen ssmn-button">{t('FAQ')}</Button>
                </div>
                <div className='ssmn-groubbtn'>
                  <Button
                    onClick={() => openBrowserInNewTab('https://shapeshift.zendesk.com/hc/en-us/requests/new')}
                    className="btn-init-screen ssmn-button">{t('SendRequestToShapeShift')}</Button>
                </div>
              </div>
              : <div>
                <div className='ssmn-groubbtn'>
                  <Button
                    onClick={() => ethToOther()}
                    className="btn-init-screen ssmn-button">{t('Ethereum')} <MdArrowForward size={18}/> {t('OtherCoins')}</Button>
                  <Button
                    onClick={() => otherToETH()}
                    className="btn-init-screen ssmn-button">{t('OtherCoins')} <MdArrowForward size={18}/> {t('Ethereum')}</Button>
                </div>
                <div className='ssmn-groubbtn'>
                  <Button
                    onClick={() => shapeShiftHistory()}
                    className="btn-init-screen ssmn-button">{t('ShapeShiftHistory')}</Button>
                  <Button
                    onClick={() => this.setState({isContact: true})}
                    className="btn-init-screen ssmn-button">{t('ContactShapeShift')}</Button>
                </div>
              </div>
          }
        </div>
      </div>
    )
  }
}
