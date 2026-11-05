import React from 'react'
import '../../styles.css'
import './styles.css'
import { Row } from 'antd'
import PinInput from 'react-pin-input'
import Images from '../../../../../Assets/Image'
import swal from 'sweetalert2'

export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      txtTitleInput: props.t('EnterCurrentPINCode'),
      txtTitleSuccess: '',
      countInput: -1,
      valueTemp: '',
      isErrorConfirm: false,
      isSuccess: false,
      isErrorCurrentPIN: false,
      txtError: props.t('PinCodeNotMatched')
    }
  }
  componentDidMount () {
    this.pin.focus()
  }
  render () {
    const {onCompleteInputPINCode, onChangeInputPINCode, t, THIS} = this.props
    const { isErrorConfirm, isSuccess, txtTitleInput, txtTitleSuccess, txtError, isErrorCurrentPIN } = this.state
    let onCompleteAll = (value, THAT) => {
      onCompleteInputPINCode(value, THAT)
      if (isSuccess) {
        THIS.refs.modalConfirmPinCode.hide()
      }
    }
    const onClickOutPINCode = () => {
      if (this.pin) {
        this.pin.clear()
        this.pin.focus()
      }
    }
    return (
      <div className="container-menu-setting-content setting-pin-container" onClick={() => onClickOutPINCode()}>
        {
          isSuccess
            ? THIS.refs.modalConfirmPinCode.hide()
            // ? swal({
            //   text: {txtTitleSuccess},
            //   showConfirmButton: false,
            //   width: '224px',
            //   height: '180px',
            //   imageUrl: Images.ic_success,
            //   imageWidth: 64,
            //   imageHeight: 64,
            //   customClass: 'edt-token-success',
            //   timer: 2000
            // })
            : <Row className="setting-pin-row">
              <div className='pingcode-title'>
                <div className="pp-close" onClick={() => THIS.refs.modalConfirmPinCode.hide()}><img src={Images.close1} /></div>
                {t('ConfirmPinCode')}
              </div>
              <div className={'setting-pin-title'}>{txtTitleInput}</div>
              <PinInput
                length={4}
                secret
                ref={p => (this.pin = p)}
                onChange={(value, index) => onChangeInputPINCode(value, this)}
                type="numeric"
                style={{ padding: 15, backround: 'unset' }}
                inputStyle={{borderColor: (isErrorConfirm || isErrorCurrentPIN) ? 'unset' : 'unset', fontSize: 8, backround: '#F2F5FC', opacity: 0.2}}
                onComplete={(value, index) => onCompleteAll(value, this)}
                className="pin-input"
              />
              {(isErrorConfirm || isErrorCurrentPIN) && <div className={'setting-pin-error'}>{txtError}</div>}
            </Row>
        }

      </div>
    )
  }
}
