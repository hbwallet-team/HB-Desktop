import React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
// Splash Screen
import SplashScreen from '../Frontend/Screen/SplashScreen'
import LanguageScreen from '../Frontend/Screen/LanguageScreen'
import MainScreen from '../Frontend/Screen/MainScreen'
import RestoreScreen from '../Frontend/Screen/RestoreScreen'
import PrivacyPolicyScreen from '../Frontend/Screen/AboutHbWalletScreen/TermsPrivacy/PrivacyPolicyScreen'
import TermsOfServiceScreen from '../Frontend/Screen/AboutHbWalletScreen/TermsPrivacy/TermsOfServiceScreen'
import MainTabbar from '../Frontend/Screen/MainTabbar'
import DappScreen from '../Frontend/Screen/DappScreen'
import BrowserScreen from '../Frontend/Screen/BrowserScreen'

const Scenes = () => {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={SplashScreen}/>
        <Route path="/languageScreen" component={LanguageScreen}/>
        <Route path="/mainScreen" component={MainScreen}/>
        <Route path="/restoreScreen" component={RestoreScreen}/>
        <Route path="/termsServiceScreen/:preScreen" component={TermsOfServiceScreen}/>
        <Route path="/privacyPolicyScreen/:preScreen" component={PrivacyPolicyScreen}/>
        <Route path="/mainTabbar" component={MainTabbar}/>
        <Route path="/dappScreen" component={DappScreen}/>
        <Route path="/browser" component={BrowserScreen}/>
      </Switch>
    </HashRouter>
  )
}

export default Scenes
