import React from 'react'
import { HBInput } from 'Frontend/Components/HBInput'
import { Row, Col } from 'antd'
import Images from 'Assets/Image'
import './styles.css'

export default class MdEditAccount extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isDisabledEdit: false,
      existAccountName: false,
      strAccountName: props.cardSelected ? props.cardSelected.cardName : ''
    }
    props.defaultThis(this)
  }
  render () {
    const { strAccountName, existAccountName, isDisabledEdit } = this.state
    const { onChangeAccountName, handleEditAccount, onCloseModal, t } = this.props
    return (
      <div className="md-body md-small">
        <div className="md-header">
          <div className="pp-close" onClick={onCloseModal}>
            <img src={Images.close} />
          </div>
          {t('EditAccount')}
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
                isError={existAccountName}
                isSpacing={true}
                messageError = {t('nameAlreadyExist')}
                value={strAccountName}
                onChange={onChangeAccountName}/>
            </Col>
          </Row>
        </div>
        <div className="md-footer">
          <div 
            id="btnHover" 
            className="md-mab-btnFooter"
            onClick={onCloseModal} 
          >{t('cancel')}</div>
          <div 
            id="btnHover" 
            className={'md-btn-add ' + (isDisabledEdit ? 'md-mab-btnFooter-disable' : 'md-mab-btnFooter')} 
            onClick={handleEditAccount}
          >{t('update')}</div>
        </div>
      </div>
    )
  }
}
