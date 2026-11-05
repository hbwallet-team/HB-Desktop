import React from 'react'
import '../../styles.css'
import './styles.css'
import { Row } from 'antd'
import PinInput from 'react-pin-input'
import SetupPINCodeScreen from '../SetupPINCodeScreen'
import Images from '../../../../../Assets/Image'

export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      txtTitleInput: props.t('EnterCurrentPINCode'),
      txtTitleSuccess: '',
      isSuccess: false,
      isErrorCurrentPIN: false
    }
    props.funcDefaultThis(this)
  }
  componentDidMount () {
    this.pin.focus()
  }
  render () {
    const {onCompleteInputPINCode, onChangeInputPINCode, t, onClickOutPINCode} = this.props
    const { isErrorCurrentPIN, isSuccess, txtTitleInput, txtTitleSuccess } = this.state
    return (
      <div className="container-menu-setting-content setting-pin-container" onClick={() => onClickOutPINCode()}>
        {
          isSuccess
            ? <SetupPINCodeScreen/>
            : <Row className="setting-pin-row">
              <div className='pingcode-title'>{t('RemovePincode')}</div>
              <div className={'setting-pin-title'}>{txtTitleInput}</div>
              <PinInput
                length={4}
                secret
                ref={p => (this.pin = p)}
                onChange={(value, index) => onChangeInputPINCode(value)}
                type="numeric"
                style={{ padding: 15 }}
                inputStyle={{borderColor: isErrorCurrentPIN ? 'red' : 'white', fontSize: 48}}
                onComplete={(value, index) => onCompleteInputPINCode(value)}
              />
              {isErrorCurrentPIN && <div className={'setting-pin-error'}>{t('PinCodeNotMatched')}</div>}
            </Row>
        }

      </div>
    )
  }
}
