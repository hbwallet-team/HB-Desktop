import React from 'react'
import Images from 'Assets/Image'
import { HBInput } from 'Frontend/Components/HBInput'
import { Spin } from 'Frontend/Components/HBLoader'
import { Radio, List, Row, Col } from 'antd'
import '../styles.css'
const RadioGroup = Radio.Group

const MdImport = ({ ethWallet, isDisabledDone, isImporting, onCloseModal, existAccountName, strAccountName, onChangeAccountName, onChangeNewAccountType, setIsMainAccount, handleImportAccount, t }) => {
  const accountType = [
    { 'type': true, 'content': t('Ethereum.setThisAccountAsCurrentAccount') },
    { 'type': false, 'content': t('Ethereum.remainCurrentAccount') }
  ]
  return (
    <div className="md-body">
      <div className="md-content">
        <div className="md-import">
          <img className="md-import-img" src={Images.ic_success} alt="img"/>
          <div>
            {t('Ethereum.youImportedAddressBelow')}<br/>
            {ethWallet && ethWallet.address.toLowerCase()}
          </div>
          <div>{t('Ethereum.doYouWantToUseThisAccount')}</div>
        </div>
        <div className="md-import-form">
          <Row>
            <Col span={6}>
              <div className="md-accountName">
                {t('accountName')}
              </div>
            </Col>
            <Col span={18}>
              <HBInput
                autoFocus={true}
                isError={existAccountName}
                isSpacing={true}
                messageError={t('nameAlreadyExist')}
                value={strAccountName}
                onChange={onChangeAccountName}/>
            </Col>
          </Row>
          <Row>
            <Col span={6}></Col>
            <Col span={18}>
              <RadioGroup onChange={onChangeNewAccountType} value={setIsMainAccount}>
                <List
                  dataSource={accountType}
                  renderItem={(item) => 
                    <List.Item>
                      <Radio value={item.type}>{item.content}</Radio>
                    </List.Item>}
                />
              </RadioGroup>
            </Col>
          </Row>
        </div>
      </div>
      <div className="md-footer">
        <div 
          id="btnHover" 
          className="md-mab-btnFooter"
          onClick={onCloseModal}
        >{t('cancel')}</div>
        <div 
          id="btnHover" 
          className={'md-btn-add ' + (isDisabledDone ? 'md-mab-btnFooter-disable' : 'md-mab-btnFooter')}
          onClick={() => isDisabledDone ? {} : handleImportAccount()}
        >{isImporting ? <Spin color='white' size={15}/> : t('Ethereum.done')}</div>
      </div>
    </div>
  )
}

export default MdImport
