import React from 'react'
import Images from 'Assets/Image'
import { HBInput } from 'Frontend/Components/HBInput'
import { Row, Col } from 'antd'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import MdImport from './Components/MdImport'
import './styles.css'

export default class ImportAccountScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      strPrivateKey: '',
      strAccountName: '',
      invalidPrivateKey: false,
      existPrivateKey: false,
      existAccountName: false,
      isDisabledImport: true,
      isDisabledDone: true,
      isImporting: false,
      ethWallet: null,
      setIsMainAccount: true
    }
    props.defaultThis(this)
  }
  render () {
    const { isModal, onCloseModal, handleImportAccount, onChangePrivateKey, onChangeAccountName, onChangeNewAccountType, closeModalImport, openModalImport, clearPrivateKey, t } = this.props
    const { ethWallet, strPrivateKey, strAccountName, setIsMainAccount, invalidPrivateKey, existPrivateKey, existAccountName, isDisabledImport, isDisabledDone, isImporting } = this.state
    return (
      <React.Fragment>
        <div className={isModal ? 'md-body' : 'sts-container'}>
          <div className="md-header">
            <div className="pp-close" onClick={onCloseModal}>
              <img src={Images.close} />
            </div>
            {t('Ethereum.importAccount')}
          </div>
          <div className="md-content">
            <Row>
              <Col span={6}>
                <div className="md-accountName">
                  {t('PrivateKey')}
                </div>
              </Col>
              <Col span={18}>
                <HBInput
                  autoFocus={true}
                  isError={invalidPrivateKey || existPrivateKey}
                  isSpacing={true}
                  messageError = {existPrivateKey ? t('Ethereum.existPrivateKey') : t('Ethereum.invalidPrivateKey')}
                  value={strPrivateKey}
                  onChange={onChangePrivateKey}/>
              </Col>
            </Row>
            <Row>
              <Col span={6}></Col>
              <Col span={18}>
                <div className="import-account">
                  <div className="import-account-attention">{t('Ethereum.attention')}</div>
                  <div className="import-account-desc">{t('Ethereum.attensionDesc')}</div>
                  <div className="import-account-desc">{t('Ethereum.attensionDesc2')}</div>
                </div>
              </Col>
            </Row>
          </div>
          <div className="md-footer">
            <div 
              id="btnHover" 
              className="md-mab-btnFooter"
              onClick={() => isModal ? onCloseModal() : clearPrivateKey()} 
            >{t('cancel')}</div>
            <div 
              id="btnHover" 
              className={'md-btn-add ' + (isDisabledImport ? 'md-mab-btnFooter-disable' : 'md-mab-btnFooter')} 
              onClick={() => isDisabledImport ? {} : openModalImport()}
            >{t('Ethereum.import')}</div>
          </div>
        </div>
        {/* Modal import */}
        <Modal ref="modalImport">
          <MdImport 
            ethWallet={ethWallet}
            strAccountName={strAccountName}
            setIsMainAccount={setIsMainAccount}
            existAccountName={existAccountName}
            isDisabledDone={isDisabledDone}
            isImporting={isImporting}
            onCloseModal={closeModalImport}
            onChangeAccountName={onChangeAccountName}
            onChangeNewAccountType={onChangeNewAccountType}
            handleImportAccount={handleImportAccount}
            t={t}
          />
        </Modal>
      </React.Fragment>
    )
  }
}
