import React from 'react'
import '../../styles.css'
import './styles.css'
import PinInput from 'react-pin-input'
import Images from '../../../../../Assets/Image'
import ChangePINCodeScreen from '../ChangePINCodeScreen'

export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      txtTitleInput: props.t('EnterNewPINCode'),
      txtTitleSuccess: '',
      countInput: 0,
      valueTemp: '',
      isErrorConfirm: false,
      isSuccess: false,
      isErrorCurrentPIN: false,
      test: 0
    }
    props.funcDefaultThis(this)
  }
  componentDidMount () {
    this.pin.focus()
  }
  render () {
    const {onCompleteInputPINCode, onChangeInputPINCode, t, onClickOutPINCode} = this.props
    const { isErrorConfirm, isSuccess, txtTitleInput, txtTitleSuccess } = this.state
    return (
      <div className="container-menu-setting-content setting-pin-container" onClick={() => onClickOutPINCode()}>
        {
          isSuccess
            ? <ChangePINCodeScreen/>
            : <div className="setting-pin-row">
              <div className='pingcode-title'>{t('SetupPINCode')}</div>
              <div className={'setting-pin-title'}>{txtTitleInput}</div>
              <PinInput
                // ref='PinInputFocus'
                length={4}
                secret
                focus
                // ref={index}
                ref={p => (this.pin = p)}
                onChange={(value, index) => onChangeInputPINCode(value, index)}
                type="numeric"
                style={{ padding: 15 }}
                inputStyle={{fontSize: 48}}
                className={isErrorConfirm ? 'isErrorConfirm' : 'isNotErrorConfirm'}
                onComplete={(value, index) => onCompleteInputPINCode(value)}
              />
              {isErrorConfirm && <div className={'setting-pin-error'}>{t('PinCodeNotMatched')}</div>}
            </div>
        }

      </div>
    )
  }
}
