import React from 'react'
import '../TokenDetailScreen/styles.css'
import { HBInput } from 'Frontend/Components/HBInput'
import QRCode from 'qrcode.react'
import Images from 'Assets/Image'
import { filterMainAccount, copyText } from 'Utils/globalFunction'

const MdQrCode = ({THIS}) => {
  const { arrCardData, closeModalQrCode, handleCopyQRCode, cardSelected, t, onChangeReceiveEthereumAmount,
    onChangeReceiveCurrencyAmount, arrCurrencyData } = THIS.props
  const { txtReceiveAmount, txtReceiveFiatAmount } = THIS.state
  const mainAccount = filterMainAccount(arrCardData)
  return (
    <div>
      <div className="edt-md-header">
        <div className="pp-close" onClick={() => THIS.refs.modalRequestReceive.hide()}><img src={Images.close1} /></div>{t('Request')}
      </div>
      <div className="edt-md-center">
        <div className="edt-md-row">
          <span className="edt-md-title">{t('amount', {arrCurrencyData: cardSelected ? cardSelected.symbol : 'ETH'})}</span>
          <HBInput autoFocus={true} value={txtReceiveAmount} onChange={onChangeReceiveEthereumAmount} className={'edt-md-input'} symbol={cardSelected ? cardSelected.symbol : 'ETH'}/>
        </div>
        <div className="edt-md-row">
          <span className="edt-md-title">{t('amount', {arrCurrencyData: arrCurrencyData})}</span>
          <HBInput value={txtReceiveFiatAmount} onChange={onChangeReceiveCurrencyAmount} className={'edt-md-input'} symbol={arrCurrencyData}/>
        </div>
        <div className="edt-md-row edt-md-rowSpecial">
          <span className="edt-md-title">Ether address</span>
          <span className="edt-md-Address">{mainAccount.address}</span>
        </div>
        <div className="edt-md-row-address">
          <div className="edt-md-qrCode">
            <QRCode size={160} value = {mainAccount.address + (txtReceiveAmount ? ';' + txtReceiveAmount : '')} bgColor="#fff" fgColor="#172540"/>
          </div>
        </div>
      </div>
      <div className="edt-md-bottom">
        <div onClick={closeModalQrCode} id="btnHover" className="edt-md-button">{t('cancel')}</div>
        <div onClick={() => copyText(mainAccount.address + (txtReceiveAmount ? ';' + txtReceiveAmount : ''))}>
          <div className="edt-md-button edt-md-buttonBlue" id="btnHover" onClick={handleCopyQRCode}>{t('copyQRCode')}</div>
        </div>
      </div>
    </div>
  )
}

export default MdQrCode
