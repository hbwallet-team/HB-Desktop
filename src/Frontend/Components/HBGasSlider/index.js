import React from 'react'
import Slider from 'rc-slider'
import { HBInput } from 'Frontend/Components/HBInput'
import { convertWeiToBalance, convertBalanceToWei, validateNumber, countDots } from 'Utils/globalFunction'
import FormatBalance from 'Frontend/Components/FormatBalance'
import './styles.css'

export default class HBGasSlider extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
  }
  onDragVolume = (value) => {
    const { gasLimit, handleResult } = this.props
    handleResult({
      gasInput: value,
      transactionFee: convertWeiToBalance(convertBalanceToWei(value, 9) * gasLimit)
    })
  }
  onDragVolumeGacha = (value) => {
    const { gasLimit, handleResult } = this.props
    let perValue = value
    if (value === 0) {
      value = this.props.gasPrice.slowest
    }
    if (value === 25) {
      value = this.props.gasPrice.slow
    }
    if (value === 50) {
      value = this.props.gasPrice.medium
    }
    if (value === 75) {
      value = this.props.gasPrice.fast
    }
    if (value === 100) {
      value = this.props.gasPrice.fastest
    }
    handleResult({
      gasInput: value,
      perValue,
      transactionFee: convertWeiToBalance(convertBalanceToWei(value, 9) * gasLimit)
    })
  }
  convertValueToPer = (value) => {
    let perValue = 50
    if (Number(value) === Number(this.props.gasPrice.slowest)) {
      perValue = 0
    }
    if (Number(value) === Number(this.props.gasPrice.slow)) {
      perValue = 25
    }
    if (Number(value) === Number(this.props.gasPrice.medium)) {
      perValue = 50
    }
    if (Number(value) === Number(this.props.gasPrice.fast)) {
      perValue = 75
    }
    if (Number(value) === Number(this.props.gasPrice.fastest)) {
      perValue = 100
    }
    return perValue
  }
  onChangeGasInput = (value) => {
    const { gasLimit, handleResult } = this.props
    if (validateNumber(value)) {
      if (value.toString() !== '.') {
        let dotsCount = countDots(value, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let decimalCount = value.length - value.indexOf('.') - 1
          if ((dotsCount !== 1 && decimalCount <= 3) || (dotsCount === 1 && decimalCount <= 1)) {
            handleResult({
              gasInput: value,
              transactionFee: convertWeiToBalance(convertBalanceToWei(value, 9) * gasLimit)
            })
          }
        }
      }
    } else if (value.length === 0) {
      handleResult({
        gasInput: '',
        transactionFee: 0
      })
    }
  }
  onBlurGasInput = () => {
    const { gasInput, gasPrice, gasLimit, handleResult } = this.props
    let value = 0
    if (gasInput === '' || gasInput === 0 || Number(gasInput) < Number(gasPrice.slow)) {
      value = gasPrice.slow
    } else if (gasInput > Number(gasPrice.fast)) {
      value = gasPrice.fast
    } else {
      value = gasInput
    }
    handleResult({
      gasInput: value,
      transactionFee: convertWeiToBalance(convertBalanceToWei(value, 9) * gasLimit)
    })
  }
  render () {
    const { t, transactionFee, gasInput, gasDefault, gasPrice, editStep, slideGacha } = this.props
    let perValue = this.convertValueToPer(gasInput)
    return (
      <div className="gas-slider-container">
        <div className="gas-slider">
          <div className="gas-fee">{<FormatBalance balance={transactionFee}/>} ETH</div>
          {slideGacha
            ? <Slider 
              defaultValue={perValue}
              min={0}
              max={100} 
              marks={{ 
                0: Number(gasPrice.slowest), 
                25: Number(gasPrice.slow), 
                50: Number(gasPrice.medium), 
                75: Number(gasPrice.fast),
                100: Number(gasPrice.fastest) }}
              step={null}
              onChange={this.onDragVolumeGacha}
            />
            : <Slider 
              defaultValue={Number(gasDefault) > Number(gasPrice.fast) ? Number(gasPrice.fast) : (Number(gasDefault) < Number(gasPrice.slow) ? Number(gasPrice.slow) : Number(gasDefault))} 
              value={Number(gasInput)} 
              min={Number(gasPrice.slow)}
              max={editStep ? Number(gasPrice.fast) : Number(gasPrice.fast) * 1.5} 
              step={editStep || 0.1} 
              onChange={this.onDragVolume}
            />
          }
          <div className='gas-level'>
            <div className="gas-slow">{t('FreeContent7')}</div>
            <div className="gas-medium">{t('FreeContent8')}</div>
            <div className="gas-fast">{t('FreeContent9')}</div>
          </div>
        </div>
        <div className="gas-input">
          <HBInput
            className='gas-input-value'
            value={slideGacha ? Math.ceil(gasInput) : gasInput}
            onChange={this.onChangeGasInput}
            onBlur={this.onBlurGasInput}
            symbol={'Gwei'}
          />
        </div>
      </div>
    )
  }
}
