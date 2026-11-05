import React from 'react'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import HBListAccount from 'Frontend/Components/HBListAccount'
import ImportAccountScreen from 'Frontend/Screen/SettingScreen/sub-view/ImportAccountScreen'
import { filterMainAccount } from 'Utils/globalFunction' 
import Images from 'Assets/Image'
import './styles.css'

export default class DappSettingScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)
  }
  render () {
    const { arrCardData, closeImportAccountModal, closeListAccountModal, openImportAccountModal, openListAccountModal, t } = this.props
    const mainAccount = filterMainAccount(arrCardData)
    return (
      <div className="dapp-setting">
        <div className="dapp-setting-header">
          <div className="dapp-back" onClick={this.props.backToTop}>
            <img className="img-back" alt="imgBack" src={Images.tabNaviBack} />
            {t('back')}
          </div>
        </div>
        <div className="dapp-setting-body">
          <div className="dapp-setting-title">{t('Dapps.settings')}</div>
          <div className="dapp-import-account">
            <div className="dapp-import-btn" onClick={openImportAccountModal}>
              <img src={Images.ic_import} className="dapp-import-icon"/>
              {t('Ethereum.import')}
            </div>
            <div className="dapp-import-desc">{t('Dapps.importDesc')}</div>
          </div>
          <div className="dapp-current-account-title">{t('Dapps.currentAccount')}</div>
          <div className="dapp-current-account">
            <div className="dapp-account-name">{mainAccount.cardName === 'Main Account' ? t('mainAccount') : mainAccount.cardName}</div>
            <div className="dapp-account-address">{mainAccount.address}</div>
          </div>
          <div className="dapp-switch-account" onClick={openListAccountModal}>{t('Dapps.switchToAnotherAccount')}</div>
          <div className="dapp-switch-account-desc">{t('Dapps.youCanSwitchAccount')}</div>
        </div>
        {/* Modal import account */}
        <Modal ref="modalImportAccount">
          <ImportAccountScreen 
            parent={this}
            isModal={true}
            onCloseModal={closeImportAccountModal}
          />
        </Modal>
        {/* Modal switch account */}
        <Modal ref="modalListAccount">
          <HBListAccount onCloseModal={closeListAccountModal} />
        </Modal>
      </div>
    )
  }
}
