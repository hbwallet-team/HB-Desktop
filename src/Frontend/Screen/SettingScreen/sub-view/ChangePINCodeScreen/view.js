import React from 'react'
import '../../styles.css'
import './styles.css'
import { Row } from 'antd'
import PinInput from 'react-pin-input'
import ChangePINCodeScreen from '../ChangePINCodeScreen'
import Images from '../../../../../Assets/Image'

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

    props.funcDefaultThis(this)
  }
  componentDidMount () {
    this.pin.focus()
  }
  render () {
    const {onCompleteInputPINCode, onChangeInputPINCode, t, onClickOutPINCode} = this.props
    const { isErrorConfirm, isSuccess, txtTitleInput, txtTitleSuccess, txtError, isErrorCurrentPIN } = this.state
    return (
      <div className="container-menu-setting-content setting-pin-container" onClick={() => onClickOutPINCode()}>
        {
          isSuccess
            ? <ChangePINCodeScreen/>
            : <Row className="setting-pin-row">
              <div className='pingcode-title'>{t('ChangePinCode')}</div>
              <div className={'setting-pin-title'}>{txtTitleInput}</div>
              <PinInput
                length={4}
                secret
                ref={p => (this.pin = p)}
                onChange={(value, index) => onChangeInputPINCode(value)}
                type="numeric"
                style={{ padding: 15 }}
                inputStyle={{borderColor: (isErrorConfirm || isErrorCurrentPIN) ? 'red' : 'white', fontSize: 48}}
                onComplete={(value, index) => onCompleteInputPINCode(value)}
                className="pin-input"
              />
              {(isErrorConfirm || isErrorCurrentPIN) && <div className={'setting-pin-error'}>{txtError}</div>}
            </Row>
        }

      </div>
    )
  }
}
