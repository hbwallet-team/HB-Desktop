import Images from 'Assets/Image'
import '../styles.css'
import { HBInput } from 'Frontend/Components/HBInput'
import React from 'react'
import { List, Row, Col } from 'antd'

const MdAddAcount = ({THIS}) => {
  const { objSelectItem, strCardName, isNameErr, arrCardImage, isOpenCreate } = THIS.state
  const { t, handleCreateAccount, handleInputName, handleSelectImage, hideAddModal } = THIS.props
  return (
    <div className="md-body">
      <div className="md-header">
        <div className="pp-close" onClick={() => THIS.refs.modalAddAccount.hide()}><img src={Images.close} /></div>
        {t('AddSubAccount')}
      </div>
      <div className="md-content">
        <Row>
          <Col span={8} >
            <div className="md-accountName">
              {t('accountName')}
            </div>
          </Col>
          <Col span={16}>
            <HBInput
              className={'mh-input-41'}
              autoFocus={true}
              isError={isNameErr}
              isSpacing={true}
              messageError = {t('nameAlreadyExist')}
              value={strCardName}
              onChange={handleInputName}/>
          </Col>
        </Row>
        {/* <List
          className='md-add-list-card'
          split={false}
          dataSource={arrCardImage}
          renderItem={(item, index) => (
            <List.Item className='md-add-card-item'>
              {
                objSelectItem && objSelectItem.index === index &&
                <div className="md-contentImage">
                  <img alt='img' src={Images.itemSelect} className={'md-imgSelect'} />
                </div>
              }
              <img alt='img' src={item}
                className={objSelectItem && objSelectItem.index === index ? 'md-imgActive' : 'md-img'}
                onClick={() => handleSelectImage(index, item)} />
            </List.Item>
          )} /> */}
      </div>
      <div className="md-footer">
        <div onClick={hideAddModal} id="btnHover" className="md-mab-btnFooter">{t('cancel')}</div>
        <div id="btnHover" className={'md-btn-add ' + (isOpenCreate ? 'md-mab-btnFooter' : 'md-mab-btnFooter-disable')} onClick={handleCreateAccount}>{t('AddSubAccount')}</div>
      </div>
    </div>
  )
}

export default MdAddAcount
