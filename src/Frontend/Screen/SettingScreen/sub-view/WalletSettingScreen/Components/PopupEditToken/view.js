import React from 'react'
import Draggable from 'react-draggable'
import Images from 'Assets/Image'
import { Row, Col, Upload, Icon } from 'antd'
import { HBInput } from 'Frontend/Components/HBInput'
import './styles.css'

export default class PopupEditToken extends React.Component {
  constructor (props) {
    super(props)
    props.funcDefautlThis(this)
    this.state = {
      txtImgUrl: props.token.cardImage ? props.token.cardImage : ''
    }
  }
  render () {
    const { token, onHide, beforeUpload, handleChange, editToken, t } = this.props
    const { txtImgUrl } = this.state
    return (
      <Draggable handle={'.pp-wrap-amount-header'}>
        <div className='pp-edit-token pp-wrap-amount-container'>
          <div className='pp-wrap-amount-content'>
            <div className='pp-wrap-amount-header'>
              <div className="pp-close" onClick={() => onHide()}><img src={Images.close} /></div>
              {token.name}
            </div>
            <div className='pp-wrap-amount-body pp-confirm'>
              <Row>
                <Col lg={8} xl={7}>
                  <div className="ads-scr-row-txt">{t('AddTokenScreen.TokenContractAddress')}</div>
                </Col>
                <Col lg={16} xl={17}>
                  <div className='ads-first-input'>
                    <HBInput
                      readOnly={true}
                      className ="ads-scr-row-inp-disable mh-input-41"
                      value={token.address}/>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col lg={8} xl={7}>
                  <div className="ads-scr-row-txt">{t('AddTokenScreen.TOKENNAME')}</div>
                </Col>
                <Col lg={16} xl={17}>
                  <HBInput
                    readOnly={true}
                    value={token.name}
                    className ={'mh-input-41 ads-scr-row-inp-disable'}/>
                </Col>
              </Row>
              <Row>
                <Col lg={8} xl={7}>
                  <div className="ads-scr-row-txt">{t('AddTokenScreen.TOKENSYMBOL')}</div>
                </Col>
                <Col lg={16} xl={17}>
                  <HBInput
                    readOnly={true}
                    value={token.symbol}
                    className ={'mh-input-41 ads-scr-row-inp-disable'}/>
                </Col>
              </Row>
              <Row>
                <Col lg={8} xl={7}>
                  <div className="ads-scr-row-txt">{t('AddTokenScreen.DECIMALSPLACES')}</div>
                </Col>
                <Col lg={16} xl={17}>
                  <HBInput
                    readOnly={true}
                    value={token.decimals}
                    className ={'mh-input-41 ads-scr-row-inp-disable'}/>
                </Col>
              </Row>
              <Row>
                <Col lg={8} xl={7}>
                  <div className="ads-scr-row-txt">{t('AddTokenScreen.UPLOAD')}</div>
                </Col>
                <Col lg={16} xl={17} className ="ads-scr-row-inp-area">
                  <div className="ads-scr-btn-plus">
                    {txtImgUrl && <img src={txtImgUrl} alt="" className="ads-scr-img"/>}
                    <Upload
                      name="avatar"
                      className={'ads-btn-edit-card-img'}
                      showUploadList={false}
                      beforeUpload={file => beforeUpload(file)}
                      onChange={info => handleChange(info)}
                    >
                      <Icon type="camera" /> {t('Edit')}
                    </Upload>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="pp-wrap-amount-bottom">
              <button className='exs-btn exs-pp-unwrap-btn' onClick={() => onHide()}>{t('Cancel')}</button>
              <button className='exs-btn exs-pp-unwrap-btn exs-btn-primary' onClick={() => editToken(token, txtImgUrl)}>{t('Save')}</button>
            </div>
          </div>
        </div>
      </Draggable>
    )
  }
}
