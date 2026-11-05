/**
* NAME: LanguageScreen
* CREATOR: Khiem Created
* Display LanguageScreen
*/
import React from 'react'
import { Button } from 'react-bootstrap'
import Images from 'Assets/Image'
// Style
import './styles.css'
import CoreLayoutContainer from '../../Container/CoreLayoutContainer'

const loadLanguage = (props, language) => () => props.routeToMainScreen(language, props)

// |------------------------------|
// |--- RENDER MAIN VIEW START ---|
// |------------------------------|
const LanguageScreen = (props) => (
  <CoreLayoutContainer isFooter={true}>
    <div className="wrap-viewBtn-language">
      <div className="ls-title">Choose language</div>
      <div className="viewBtn-languageFirst">
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'en')}>
          <img className="viewBtn-flag" src={Images.languageEN}/>
          {'English'}
        </Button>
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'jp')}>
          <img className="viewBtn-flag" src={Images.languageJP}/>
          {'日本語'}
        </Button>
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'es')}>
          <img className="viewBtn-flag" src={Images.languageES}/>
          {'español'}
        </Button>
      </div>
      <div className="viewBtn-languageSecond pdT25">
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'cn')}>
          <img className="viewBtn-flag" src={Images.languageCN}/>
          {'中文'}
        </Button>
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'ru')}>
          <img className="viewBtn-flag" src={Images.languageRU}/>
          {'русский'}
        </Button>
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'th')}>
          <img className="viewBtn-flag" src={Images.languageTH}/>
          {'ไทย'}
        </Button>
      </div>
      <div className="viewBtn-languageSecond">
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'pt')}>
          <img className="viewBtn-flag" src={Images.languagePT}/>
          {'Português'}
        </Button>
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'vn')}>
          <img className="viewBtn-flag" src={Images.languageVN}/>
          {'Tiếng Việt'}
        </Button>
        <Button className="btn-init-screen btn-Inits-Size"
          onClick={loadLanguage(props, 'kr')}>
          <img className="viewBtn-flag" src={Images.languageKR}/>
          {'한국어'}
        </Button>
      </div>
    </div>
  </CoreLayoutContainer>
)

export default LanguageScreen
