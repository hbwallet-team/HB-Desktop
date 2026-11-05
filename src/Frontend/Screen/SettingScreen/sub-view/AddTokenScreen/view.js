import React from 'react'
import './styles.css'
import {HBInput} from '../../../../Components/HBInput'
import Images from '../../../../../Assets/Image'
import InfoTokenScreen from './sub-view/InfoTokenScreen'

import { Row, Col, Upload, Icon } from 'antd'
import { Button } from 'react-bootstrap'
import { Spin } from 'Frontend/Components/HBLoader'

const space3x = '   '
export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      imageURL: null,
      loading: false,

      // from hb wallet
      txtContractAddr: '',
      txtTokenName: '',
      txtTokenSymbol: '',
      txtDecimal: '',
      txtImgUrl: '',
      txtTokenId: '',
      txtTokenUrl: '',
      isAlreadyCreate: false,
      isAddressErr: false,
      isNameErr: false,
      isDecimalErr: false,
      isDisableSave: true,
      isDisableInformation: false,
      isCustomToken: true,
      isNotContractAddr: false,
      isLoadingTokenInfo: false,
      objTempData: [],
      isActiveInfoScreen: false,
      isPoiter: true,
      isInBlacklist: false
    }

    this.arrFilterTokenData = []
    this.arrTokenDataName = []

    props.funcDefaultThis(this)
  }

  componentWillMount () {
    var self = this
    setTimeout(() => {
      self.props.loadingInitial()
    }, 1000)
  }

  get renderAddTokenView () {
    const { onChangeDemcimal, beforeUpload, handleChange,
      onChangeAddress, t, onAddNewToken,
      onChangeTokenName, onChangeSymbol, reset } = this.props

    const { isAlreadyCreate, txtDecimal, isLoadingTokenInfo,
      isAddressErr, isDisableSave, isDecimalErr,
      isNotContractAddr, isNameErr, isDisableInformation, isInBlacklist,
      txtContractAddr, txtTokenName, txtTokenSymbol, txtImgUrl, isPoiter } = this.state
    const uploadButton = (
      <div className="ads-scr-btn-plus-btn" id="btnHover">
        {
          this.state.loading
            ? <Icon type={'loading'} />
            : <div className="ads-AddTokenScreen">
              <img src={Images.cardEmpty1} className="ads-scr-btn-plus-img"/>
              <div className="txt-normal txt-Absolute" id="nameColor">
                {t('uploadImage')}
              </div>
            </div>
        }
      </div>
    )

    return (
      <div className="ads-scr-container" style={{pointerEvents: (isPoiter ? 'none' : null)}}>
        <div className="sts-header">
          <div className="sts-header-title">{t('addCustomToken')}</div>
        </div>
        <div className="ads-wrap-scr">
          <div className="ads-scr-rowLeft">
            <Row>
              <Col lg={8} xl={5}>
                <div className="ads-scr-row-txt">{t('AddTokenScreen.TokenContractAddress')}</div>
              </Col>
              <Col lg={16} xl={19}>
                <div className='ads-first-input'>
                  <HBInput
                    className ="ads-scr-row-inp mh-input-41"
                    value={txtContractAddr}
                    isSuccess={isAlreadyCreate}
                    isErrBorderBottom={true}
                    countMax={42}
                    isError={isAlreadyCreate ? true : isAddressErr}
                    messageError={space3x + (isAlreadyCreate
                      ? t('SearchToken.alreadyToken')
                      : isInBlacklist
                        ? t('AddTokenScreen.tokenInBlacklist')
                        : isNotContractAddr  
                          ? t('SearchToken.errorContract') 
                          : t('AccountErrorMsg'))}
                    onChange={text => onChangeAddress(text.trim().toLowerCase())}/>
                  {isLoadingTokenInfo && <div className='ads-progress'><Spin size={15} color='white'/></div>}
                </div>
              </Col>
            </Row>
            <Row>
              <Col lg={8} xl={5}>
                <div className="ads-scr-row-txt">{t('AddTokenScreen.TOKENNAME')}</div>
              </Col>
              <Col lg={16} xl={19}>
                <HBInput
                  readOnly={isDisableInformation}
                  isError={isNameErr}
                  value={txtTokenName}
                  messageError={t('SearchToken.tokenNameExist')}
                  className ={'mh-input-41 ' + (!isDisableInformation ? 'ads-scr-row-inp' : 'ads-scr-row-inp-disable')}
                  onChange={text => onChangeTokenName(text)}/>
                <div className="ads-info">{t('ads-info1')}</div>
              </Col>
            </Row>
            <Row>
              <Col lg={8} xl={5}>
                <div className="ads-scr-row-txt">{t('AddTokenScreen.TOKENSYMBOL')}</div>
              </Col>
              <Col lg={16} xl={19}>
                <HBInput
                  value={txtTokenSymbol}
                  readOnly={isDisableInformation}
                  className ={'mh-input-41 ' + (!isDisableInformation ? 'ads-scr-row-inp' : 'ads-scr-row-inp-disable')}
                  onChange={text => onChangeSymbol(text.trim().toUpperCase())}/>
                <div className="ads-info">{t('ads-info2')}</div>
              </Col>
            </Row>
            <Row>
              <Col lg={8} xl={5}>
                <div className="ads-scr-row-txt">{t('AddTokenScreen.DECIMALSPLACES')}</div>
              </Col>
              <Col lg={16} xl={19}>
                <HBInput
                  className ={'mh-input-41 from1to18 ' + (!isDisableInformation ? 'ads-scr-row-inp' : 'ads-scr-row-inp-disable')}
                  placeholder={t('AddTokenScreen.from1to18')}
                  value={txtDecimal}
                  readOnly={isDisableInformation}
                  messageError={t('AddTokenScreen.ErrorDecimal')}
                  isError={isDecimalErr}
                  min={1} max={18} type="text"
                  onChange={text => onChangeDemcimal(text)}/>
                <div className="ads-info">{t('ads-info3')}</div>
              </Col>
            </Row>
            <Row>
              <Col lg={8} xl={5}>
                <div className="ads-scr-row-txt">{t('AddTokenScreen.UPLOAD')}</div>
              </Col>
              <Col lg={16} xl={19} className ="ads-scr-row-inp-area">
                <Upload
                  name="avatar"
                  className={'ads-scr-btn-plus'}
                  showUploadList={false}
                  disabled={txtImgUrl && txtImgUrl.length > 0 ? isDisableInformation : false}
                  beforeUpload={file => beforeUpload(file)}
                  onChange={info => handleChange(info)}
                >
                  {txtImgUrl ? <img src={txtImgUrl} id="btnHover" alt="" className="ads-scr-img"/> : uploadButton}
                </Upload>
              </Col>
            </Row>
          </div>
          <div className="pp-input-phone">
            <img src={Images.phoneBG} />
            {txtImgUrl && 
          <div className="pp-input-card-preview"><img src={txtImgUrl}/></div>}
          </div>
        </div>
        <Row>
          <Col lg={24} xl={24} className="ads-scr-row-Button">
            <div className="ads-scr-row-col">
              <button type="button" className="exs-btn exs-pp-unwrap-btn edt-text-capitalize" onClick={reset}>{t('cancel')}</button>
              <Button
                onClick={() => onAddNewToken()}
                disabled={isDisableSave}
                id={'btnScale-active'}
                className={isDisableSave ? 'pm-button pm-btn-add' : 'btn-init-screen pm-btn-add'}
              >{t('Add')}</Button>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
  render () {
    const { isActiveInfoScreen, objTempData } = this.state
    const { onCancel } = this.props
    return (
      isActiveInfoScreen
        ? <InfoTokenScreen onCancel={() => onCancel()} objDataPreview={objTempData}/>
        : this.renderAddTokenView
    )
  }
}
