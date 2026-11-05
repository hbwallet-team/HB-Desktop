import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import { Row, Col, Progress, Icon } from 'antd'
import { formatNumber, copyText } from 'Utils/globalFunction'
import { HBCRYPTO } from 'Utils/globalConstants'
import Radium, { StyleRoot } from 'radium'
import { Button } from 'react-bootstrap'
import { slideInRight } from 'react-animations'
import QRCode from 'qrcode.react'

const ScreenAnimation = {
  animation: 'x ' + 0.5 + 's',
  animationName: Radium.keyframes(slideInRight, 'slideInRight')
}

const ExchangeConfirm = ({ THIS }) => {
  const { t, handleCopyQRCode, doAnotherTxs, cancelTrackingTx } = THIS.props
  const { coinLeft, fRateConvert, depositAddr, coinRight, iStageExchange, marketInfo, amountDepo, amountWidthdraw } = THIS.state
  let percentWidth = 0
  let depoAnimation = ''
  let swapAnimation = ''
  let classDisable = 'ess-buttonDisable'
  let txtDepoColor = '#555555'
  let txtExchangeColor = '#555555'
  let txtCompleteColor = '#555555'
  let imgDepo = Images.imgDeposit
  let imgExchange = Images.imgExchangeInActive
  let imgCheck = Images.imgCheckInActive
  let disableCancelTxs = true
  switch (iStageExchange) {
  case 0:
    depoAnimation = 'fadePulse'
    txtDepoColor = 'white'
    classDisable = ''
    disableCancelTxs = false
    break
  case 1:
    swapAnimation = 'fadePulse'
    imgDepo = Images.imgDepositActive
    imgExchange = Images.imgExchange
    txtDepoColor = '#009085'
    txtExchangeColor = 'white'
    percentWidth = 33
    break
  case 2:
    swapAnimation = 'fadePulse'
    imgDepo = Images.imgDepositActive
    imgExchange = Images.imgExchangeActive
    imgCheck = Images.imgCheck
    txtDepoColor = '#009085'
    txtExchangeColor = '#009085'
    percentWidth = 66
    break
  case 3:
    imgDepo = Images.imgDepositActive
    imgExchange = Images.imgExchangeActive
    imgCheck = Images.imgCheckActive
    txtDepoColor = '#009085'
    txtExchangeColor = '#009085'
    txtCompleteColor = '#009085'
    percentWidth = 100
    break
  }
  const styleTxtDisable = { color: disableCancelTxs ? '#555555' : 'white' }
  return (
    <StyleRoot style={{ height: '100%', overflowX: 'hidden', overflowY: 'auto', paddingTop: '50px', justifyContent: 'center', alignItems: 'center' }}>
      <div style={ScreenAnimation} className='styleRoot-container'>
        <Row type={'flex'} justify={'center'} align={'middle'} className='ess-spacing'>
          <Col span={15} className='ess-qrContainer'>
            <Row type={'flex'} >
              <div onClick={() => { copyText(depositAddr); handleCopyQRCode() }}>
                <div id='btnScale'>
                  <QRCode value={depositAddr} size={120} bgColor="#fff" fgColor="#000" />
                </div>
              </div>
              <div className='ess-qrDetailInfo'>
                <div className='ess-txtQrTitle'>{t('sendToAddr')}</div>
                <div className='ess-txtQrSmall'>{depositAddr}</div>

                <div className='ess-txtQrTitle'>{t('sendUpAmount')}
                  <span className='ess-txtQrSmall'>{' ' + formatNumber(marketInfo.maxLimit) + ' ' + coinLeft.symbol}</span>
                </div>

                <div className='ess-txtQrTitle'>{t('sendAtleast')}
                  <span className='ess-txtQrSmall'>{' ' + formatNumber(marketInfo.minimum) + ' ' + coinLeft.symbol}</span>
                </div>

                <div className='ess-txtQrTitle'>{t('minerFeeProcess')}
                  <span className='ess-txtQrSmall'>{' ' + formatNumber(marketInfo.minerFee) + ' ' + HBCRYPTO.ETHEREUM}</span>
                </div>

              </div>
            </Row>
          </Col>
        </Row>

        <Row type={'flex'} justify={'center'} align={'middle'}>
          <Col span={5} type={'flex'} align={'middle'} className={depoAnimation}>
            <img src={imgDepo} className='ess-imgIcon' />
            <p style={{color: txtDepoColor}}> {t('awaitingDepo')}</p>

          </Col>
          <Col span={5} type={'flex'} align={'middle'} className={swapAnimation}>
            <img src={imgExchange} className='ess-imgIcon' />
            <p style={{ color: txtExchangeColor }}> {t('awaitExchange')}</p>
          </Col>
          <Col span={5} type={'flex'} align={'middle'}>
            <img src={imgCheck} className='ess-imgIcon' />
            <p style={{ color: txtCompleteColor }}> {t('complete')}</p>
          </Col>

        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'}>
          <Col span={15}>
            <Progress percent={percentWidth} status="active" />
          </Col>
        </Row>
        {
          iStageExchange === 3 &&
        <div>
          <Row type={'flex'} justify={'center'} align={'middle'} className='ess-infoExchange'>
            <img alt='img' src={coinLeft.image} className='ess-imgIconLarge' />
            <Icon type="arrow-right" style={{ fontSize: 25, marginLeft: 10 }} />
            <img alt='img' src={Images.etherCoin} className='ess-imgIconLarge' />
          </Row>
          <Row type={'flex'} justify={'center'} align={'middle'} className='ess-lineWhite'>
            <div style={{ color: coinLeft.color }}>
              <span className='ess-txtCoinBold'>{amountDepo + ' '}</span>
              <span className='ess-txtLarge'>{coinLeft.symbol}</span>
            </div>
            <div style={{ color: 'white', marginLeft: 5, marginRight: 5, paddingTop: 5 }}>{t('toExchange')}</div>
            <div style={{ color: 'white' }}>
              <span className='ess-txtCoinBold'>{amountWidthdraw} </span>
              <span className='ess-txtLarge'>{HBCRYPTO.ETHEREUM}</span>
            </div>
          </Row>
        </div>
        }
        <Row type={'flex'} justify={'center'} align={'middle'} className='ess-orderDetail'>
          {t('orderDetail')}
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'}>
          <Col span={15} type={'flex'} justify={'center'} >
            <img src={Images.imgDeposit} className='ess-imgIconSmall' />
            <span className='ess-txtBoldSmall'>{t('depoAddr')}</span>
            <img src={coinLeft.image} className='ess-imgIcon' />
          </Col>
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'} className='ess-spacing'>
          <Col span={14} type={'flex'} justify={'center'} >
            {depositAddr}
          </Col>
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'}>
          <Col span={15} type={'flex'} justify={'center'} >
            <img src={Images.imgWidthraw} className='ess-imgIconSmall' />
            <span className='ess-txtBoldSmall'>{t('widthdrawAddr')}</span>
            <img src={Images.etherCoin} className='ess-imgIcon' />
          </Col>
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'} className='ess-spacing'>
          <Col span={14} type={'flex'} justify={'center'} >
            {coinRight.address}
          </Col>
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'} className='ess-spacing ess-currentRateContainer'>
          <Col span={15} type={'flex'} justify={'center'} >
            <span className='ess-txtCurrentRate'>{t('currentRate')}</span>
            <div>
              {'1 ' + coinLeft.symbol + ' = ' + fRateConvert + ' ' + HBCRYPTO.ETHEREUM}
            </div>
          </Col>
        </Row>

        <Row type={'flex'} justify={'center'} align={'middle'} style={{paddingBottom: '30px'}}>
          <Col span={15} className='ess-btnContainer'>
            <Button
              disabled={disableCancelTxs}
              onClick={cancelTrackingTx}
              className={'btn-init-screen ess-button ' + classDisable} >
              <span style={styleTxtDisable}>
                {t('cancelTxs')}
              </span>
            </Button>
            <Button
              onClick={doAnotherTxs}
              className="btn-init-screen ess-button">{t('doAnother')}</Button>
          </Col>
        </Row>
      </div>
    </StyleRoot>

  )
}

export default ExchangeConfirm
