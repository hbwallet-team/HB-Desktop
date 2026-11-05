import React from 'react'
import { Switch, Route } from 'react-router'

import WalletSettingScreen from './sub-view/WalletSettingScreen'
import SetupPINCodeScreen from './sub-view/SetupPINCodeScreen'
import ChangePINCodeScreen from './sub-view/ChangePINCodeScreen'
import RemovePINCodeScreen from './sub-view/RemovePINCodeScreen'
import RegionalCurrencyScreen from './sub-view/RegionalCurrencyScreen'
import ManageAccountBookScreen from './sub-view/ManageAccountBookScreen'
import DisplayPassphraseScreen from './sub-view/DisplayPassphraseScreen'
import DisplayPrivateKeyScreen from './sub-view/DisplayPrivateKeyScreen'
import WatchContractScreen from './sub-view/WatchContractScreen'
import AddTokenScreen from './sub-view/AddTokenScreen'
import AboutScreen from './sub-view/AboutScreen'
import HelpScreen from './sub-view/HelpScreen'
import DeleteDatabase from './sub-view/DeleteDatabase'
import PrivacyPolicyScreen from './sub-view/AboutScreen/sub-view/PrivacyPolicy'
import TermsOfServiceScreen from './sub-view/AboutScreen/sub-view/TermOfService'
import HowToSend from './sub-view/HowToSendScreen'
import Language from './sub-view/Language'
import Notifications from './sub-view/Notifications'
import RegisterTokenCardScreen from './sub-view/RegisterTokenCardScreen'
import AdvancedWalletScreen from './sub-view/AdvancedWalletScreen'
import ApplyForAirdropScreen from './sub-view/ApplyForAirdropScreen'
import ImportAccountScreen from './sub-view/ImportAccountScreen'
import OperationSystem from './sub-view/OperationSystem'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'

var THIS
export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}
export const AppRouter = () => {
  return (
    <Switch>
      <Route path="/mainTabbar/settingScreen/notifications" component={Notifications} />
      <Route path="/mainTabbar/settingScreen/language" component={Language} />
      <Route path="/mainTabbar/settingScreen/walletSettingScreen" component={WalletSettingScreen} />
      <Route path="/mainTabbar/settingScreen/setupPINCodeScreen" component={SetupPINCodeScreen} />
      <Route path="/mainTabbar/settingScreen/changePINCodeScreen" component={ChangePINCodeScreen} />
      <Route path="/mainTabbar/settingScreen/removePINCodeScreen" component={RemovePINCodeScreen} />
      <Route path="/mainTabbar/settingScreen/regionalCurrencyScreen" component={RegionalCurrencyScreen} />
      <Route path="/mainTabbar/settingScreen/manageAccountBookScreen" component={ManageAccountBookScreen} />
      <Route path="/mainTabbar/settingScreen/displayPassphraseScreen" component={DisplayPassphraseScreen} />
      <Route path="/mainTabbar/settingScreen/displayPrivateKeyScreen" component={DisplayPrivateKeyScreen} />
      <Route path="/mainTabbar/settingScreen/importAccountScreen" component={ImportAccountScreen} />
      <Route path="/mainTabbar/settingScreen/watchContractScreen" component={WatchContractScreen} />
      <Route path="/mainTabbar/settingScreen/addTokenScreen" component={AddTokenScreen} />
      <Route path="/mainTabbar/settingScreen/registerTokenCardScreen" component={RegisterTokenCardScreen} />
      <Route path="/mainTabbar/settingScreen/advancedWalletScreen" component={AdvancedWalletScreen} />
      <Route path="/mainTabbar/settingScreen/applyForAirdropScreen" component={ApplyForAirdropScreen} />
      <Route path="/mainTabbar/settingScreen/aboutScreen" component={AboutScreen} />
      <Route path="/mainTabbar/settingScreen/helpScreen" component={HelpScreen} />
      <Route path="/mainTabbar/settingScreen/deleteDatabase" component={DeleteDatabase} />
      {/* /mainTabbar/settingScreen/howToSend */}
      <Route path="/mainTabbar/settingScreen/howToSend" component={HowToSend} />

      <Route path="/mainTabbar/settingScreen/privacyPolicyScreen" component={PrivacyPolicyScreen} />
      <Route path="/mainTabbar/settingScreen/termsOfServiceScreen" component={TermsOfServiceScreen} />
      <Route path="/mainTabbar/settingScreen/OperationSystem" component={OperationSystem} />
    </Switch>
  )
}

export const funcChooseItemOnMenu = (iChangeView) => {
  return (dispatch, getState) => {
    THIS.setState({ iChangeView })
  }
}

export const gotoEtherTab = () => {
  return (dispatch, getState) => {
    Observer.emit(OBSERVER_KEY.SELECT_TAB_ETHER)
  }
}
