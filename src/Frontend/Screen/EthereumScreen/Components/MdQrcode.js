import React from 'react'
import '../AccountDetailScreen/styles.css'
import { HBInput } from '../../../Components/HBInput'
import QRCode from 'qrcode.react'
import { HBCRYPTO } from 'Utils/globalConstants'
import Images from 'Assets/Image'
import { copyText, filterMainAccount, validateNumber, countDots } from 'Utils/globalFunction'
import swal from 'sweetalert2'

export default class MdQrCode extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      txtReceiveAmount: '',
      txtReceiveFiatAmount: ''
    }
  }
  calculateReceiveAmount = (newAmount, newMoneyAmount) => {
    const { etherPrice } = this.props
  
    // Check format number only
    if (!validateNumber(newAmount)) {
      // Clear data and error when no input
      if (newAmount.length === 0) {
        this.setState({ txtReceiveAmount: '', txtReceiveFiatAmount: '' })
      }
    } else {
      // Check clear first dots
      if (newAmount.toString() !== '.') {
        let dotsCount = countDots(newAmount, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let isError = false
          let decimalCount = newAmount.length - newAmount.indexOf('.') - 1

          if (dotsCount === 1 && decimalCount > 8) {
            isError = true
          }

          if (!isError) {
            // User can input if pass all previous condition
            let newAmountNum = Number(newAmount)
            // Convert to Money amount format max 2 decimal
            let txtReceiveFiatAmount = newMoneyAmount || (etherPrice.price * newAmountNum).toFixed(2)
            // Final success checking
            this.setState({
              txtReceiveAmount: newAmount,
              txtReceiveFiatAmount
            })
          }
        }
      }
    }
  }
  onChangeReceiveEthereumAmount = (newAmount) => {
    this.calculateReceiveAmount(newAmount)
  }
  onChangeReceiveCurrencyAmount = (newMoney) => {
    const { etherPrice } = this.props
  
    // Check format number only
    if (!validateNumber(newMoney)) {
      // Clear data and error when no input
      if (newMoney.length === 0) {
        this.setState({ txtReceiveAmount: '', txtReceiveFiatAmount: '' })
      }
    } else {
      // Check clear first dots
      if (newMoney.toString() !== '.') {
        let dotsCount = countDots(newMoney, '\\.')
        // Check only accept 1 dots
        if (dotsCount <= 1) {
          let isError = false
          let decimalCount = newMoney.length - newMoney.indexOf('.') - 1

          if (dotsCount === 1 && decimalCount > 2) {
            // Check if money decimal greater than 2
            isError = true
          }
          if (!isError) {
            // Convert to token amount format based on token Decimal
            let sendAmount = (Number(newMoney) / etherPrice.price).toFixed(8)

            this.calculateReceiveAmount(sendAmount, newMoney)
          }
        }
      }
    }
  }
  handleCopyQRCode = () => {
    this.props.closeModalQrCode()
    swal({
      width: '250px',
      text: this.props.t('qrCopied'),
      type: 'success',
      timer: 5000,
      showConfirmButton: false
    })
  }
  render () {
    const { arrCurrencyData, arrCardData, closeModalQrCode, t } = this.props
    const { txtReceiveAmount, txtReceiveFiatAmount } = this.state
    const mainAccount = filterMainAccount(arrCardData)
    return (
      <div>
        <div className="edt-md-header">
          <div className="pp-close" onClick={closeModalQrCode}><img src={Images.close1} /></div>{t('Request')}
        </div>
        <div className="edt-md-center">
          <div className="edt-md-row">
            <span className="edt-md-title">{t('amount', {arrCurrencyData: HBCRYPTO.ETHEREUM})}</span>
            <HBInput
              autoFocus={true}
              value={txtReceiveAmount}
              onChange={this.onChangeReceiveEthereumAmount}
              className={'edt-md-input'} symbol={'ETH'}/>
          </div>
          <div className="edt-md-row">
            <span className="edt-md-title">{t('amount', {arrCurrencyData: arrCurrencyData})}</span>
            <HBInput value={txtReceiveFiatAmount} onChange={this.onChangeReceiveCurrencyAmount} className={'edt-md-input'} symbol={arrCurrencyData}/>
          </div>
          <div className="edt-md-row edt-md-rowSpecial">
            <span className="edt-md-title">Ether address</span>
            <span className="edt-md-Address">{mainAccount.address}</span>
          </div>
          <div className="edt-md-row-address">
            <div className="edt-md-qrCode">
              <QRCode size={160} value = {mainAccount.address + (txtReceiveAmount.length > 0 ? ';' + txtReceiveAmount : '')} bgColor="#fff" fgColor="#172540"/>
            </div>
          </div>
        </div>
        <div className="edt-md-bottom">
          <div onClick={closeModalQrCode} id="btnHover" className="edt-md-button">{t('cancel')}</div>
          <div onClick={() => copyText((mainAccount.address + (txtReceiveAmount.length > 0 ? ';' + txtReceiveAmount : '')))}>
            <div className="edt-md-button edt-md-buttonBlue" id="btnHover" onClick={this.handleCopyQRCode}>{t('copyQRCode')}</div>
          </div>
        </div>
      </div>
    )
  }
}

