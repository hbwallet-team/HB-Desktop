import React from 'react'
import '../../styles.css'
import './styles.css'
import { Button } from 'react-bootstrap'
import ConfirmPINCodeScreen from '../ConfirmPINCodeScreen/view'
import { HBPopupConfirm } from 'Frontend/Components/HBPopup'
import Modal from 'Frontend/Components/HBModal/FadeModal'

export default class View extends React.Component {
  constructor (props) {
    super(props)
    props.defaultThis(this)
    this.state = ({
      isActiveScreen: props.arrPinCodeData.length > 0
    })
  }

  funcSetActiveScreen = (value) => this.setState({ isActiveScreen: !value })
  funcCompleteInputPINCode = (value, self) => this.props.onCompleteInputPINCode(value, self)
  funcChangeInputPINCode =(value, index) => console.log(value, index)

  render () {
    const { deleteDatabase, confirmDelete, hideMdConfirm, t } = this.props
    const { isActiveScreen } = this.state

    return (
      isActiveScreen
        ? <ConfirmPINCodeScreen
          t={t}
          onChangeInputPINCode={this.funcChangeInputPINCode}
          onCompleteInputPINCode={this.funcCompleteInputPINCode}
          parent={'deleteDatabase'}
          setIsActiveScreen={this.funcSetActiveScreen}/>
        : <div className="container-menu-setting-content menu-setting-sub-pp-container rsw-opacity  limit-container">
          <div className="wrap-WalletInitialize">
            <div className="sts-header">
              <div className="sts-header-title">{this.props.t('WalletInitialize')}</div>
            </div>
            <div className="rsw-message">{t('deleteDataMessage')}</div>
            <div className="rsw-btn-container"><Button className="btn-init-screen edt-button rsw-button" onClick={deleteDatabase}>{t('Initialize')}</Button></div>
            <Modal ref="md_mab_confirm">
              <HBPopupConfirm message={t('deleteDataConfirm')} onOk={() => confirmDelete(t('resetSuccess'))} onCancel={hideMdConfirm} removeWallet={true} t={t}/>
            </Modal>
          </div>
        </div>
    )
  }
}
