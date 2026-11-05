import React from 'react'
import '../../styles.css'
import './styles.css'
import { Row, Col } from 'antd'
import Images from '../../../../../Assets/Image'
import swal from 'sweetalert2'
import ConfirmPINCodeScreen from '../ConfirmPINCodeScreen/view'
import { copyText } from 'Utils/globalFunction'
export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isActiveScreen: props.arrPinCodeData.length > 0
    }
  }
  onCopy (t, privateKey) {
    // Copy to the clipboard
    copyText(privateKey)
    swal({
      width: '250px',
      text: t('Copied'),
      type: 'success',
      timer: 5000,
      showConfirmButton: false
    })
  }
  funcSetActiveScreen = (value) => this.setState({ isActiveScreen: !value })
  funcCompleteInputPINCode = (value, self) => this.props.onCompleteInputPINCode(value, self)
  funcChangeInputPINCode =(value, index) => console.log(value, index)
  renderItem (item, index, t, length) {
    return (
      <div className="menu-setting-sub-pk-row-item" key={index}>
        <Row>
          <Col lg={11} xl={12}>
            {
              index === 0
                ? <div>
                  <div className="menu-setting-sub-pk-row-item-title-main">{item.cardName === 'Main Account' ? t('mainAccount') : item.cardName}</div>
                  <div className="menu-setting-sub-pk-row-item-txtprivatekey-main">{this.props.t('DisplayPrivateKey.noteContent')}</div>
                  <div className="menu-setting-sub-pk-row-item-txtprivatekey-main-14">{item.address}</div>
                </div>

                : <div>
                  <div className="menu-setting-sub-pk-row-item-title dpk-row-padding">{item.cardName === 'Main Account' ? t('mainAccount') : item.cardName}</div>
                  <div className="menu-setting-sub-pk-row-item-txtprivatekey">{item.address}</div>
                </div>

            }

          </Col>
          <Col lg={1} xl={0}/>
          <Col lg={10} xl={10}>
            <div className="menu-setting-sub-pk-row-item-title">{this.props.t('PrivateKey')}</div>
            <div id="privateKey" className="menu-setting-sub-pk-row-item-txtprivatekey">{item.privateKey}</div>
          </Col>
          <Col lg={2} xl={2} className="menu-setting-sub-pk-row-item-col">
            <div onClick={() => this.onCopy(t, item.privateKey)}>
              <div className={'menu-setting-sub-pk-row-item-btn'}>
                <img
                  className={'menu-setting-sub-pk-row-item-img'}
                  src={Images.ic_copy} />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
  render () {
    const { arrCardData, t } = this.props
    const { isActiveScreen } = this.state
    let datas = arrCardData.filter(item => item.address.length > 0)

    return (
      isActiveScreen
        ? <ConfirmPINCodeScreen
          t={t}
          onChangeInputPINCode={this.funcChangeInputPINCode}
          onCompleteInputPINCode={this.funcCompleteInputPINCode}
          parent={'DisplayPrivateKeyScreen'}
          setIsActiveScreen={this.funcSetActiveScreen}/>
        : <div className="sts-container">
          <div className="sts-header">
            <div className="sts-header-title">{this.props.t('DisplayPrivateKey')}</div>
          </div>
          <div className="dpk-container" id="HBScrollBar">
            <div className="container-menu-setting-content menu-setting-sub-pk-container">
              {datas.map((item, index) => this.renderItem(item, index, t, datas.length))}
            </div>
          </div>
        </div>
    )
  }
}
