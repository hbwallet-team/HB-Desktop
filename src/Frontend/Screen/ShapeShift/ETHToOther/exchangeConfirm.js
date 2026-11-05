import React from 'react'
import './styles.css'
import Images from 'Assets/Image'
import { Row, Col, Progress, Icon } from 'antd'
import { HBCRYPTO } from 'Utils/globalConstants'
import Radium, { StyleRoot } from 'radium'
import { Button } from 'react-bootstrap'
import { slideInRight } from 'react-animations'

const ScreenAnimation = {
  animation: 'x ' + 0.5 + 's',
  animationName: Radium.keyframes(slideInRight, 'slideInRight')
}

const ExchangeConfirm = ({ THIS }) => {
  const { t, doAnotherTxs } = THIS.props
  const { txtEther, txtCoinSelected, txtDestination, fRateConvert, depositAddr, coinRight, iStageExchange } = THIS.state
  let percentWidth = 0
  let depoAnimation = ''
  let swapAnimation = ''
  let txtDepoColor = '#555555'
  let txtExchangeColor = '#555555'
  let txtCompleteColor = '#555555'
  let imgDepo = Images.imgDeposit
  let imgExchange = Images.imgExchangeInActive
  let imgCheck = Images.imgCheckInActive
  switch (iStageExchange) {
  case 0:
    depoAnimation = 'fadePulse'
    txtDepoColor = 'white'
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
  return (
    <StyleRoot style={{ height: '100%', overflowX: 'hidden', overflowY: 'auto', paddingTop: '50px', justifyContent: 'center', alignItems: 'center' }}>
      <div style={ScreenAnimation} >

        <Row type={'flex'} justify={'center'} align={'middle'}>
          <Col span={5} type={'flex'} align={'middle'} className={depoAnimation}>
            <img src={imgDepo} className='ess-imgIcon' />
            <p style={{ color: txtDepoColor }}> {t('awaitingDepo')}</p>

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

        <div>
          <Row type={'flex'} justify={'center'} align={'middle'} className='ess-infoExchange'>
            <img alt='img' src={Images.etherCoin} className='ess-imgIconLarge' />
            <Icon type="arrow-right" style={{ fontSize: 25, marginRight: 10 }} />
            <img alt='img' src={coinRight.image} className='ess-imgIconLarge' />
          </Row>
          <Row type={'flex'} justify={'center'} align={'middle'} className='ess-lineWhite'>
            <div style={{ color: 'white' }}>
              <span className='ess-txtCoinBold'>{txtEther + ' '}</span>
              <span className='ess-txtLarge'>{HBCRYPTO.ETHEREUM}</span>
            </div>
            <div style={{ color: 'white', marginLeft: 5, marginRight: 5, paddingTop: 5 }}>{t('toExchange')}</div>
            <div style={{ color: coinRight.color }}>
              <span className='ess-txtCoinBold'>{txtCoinSelected} </span>
              <span className='ess-txtLarge'>{coinRight.symbol}</span>
            </div>
          </Row>
        </div>

        <Row type={'flex'} justify={'center'} align={'middle'} className='ess-orderDetail'>
          {t('orderDetail')}
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'}>
          <Col span={15} type={'flex'} justify={'center'} >
            <img src={Images.imgDeposit} className='ess-imgIconSmall' />
            <span className='ess-txtBoldSmall'>{t('depoAddr')}</span>
            <img src={Images.etherCoin}className='ess-imgIcon' />
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
            <img src={coinRight.image} className='ess-imgIcon' />
          </Col>
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'} className='ess-spacing'>
          <Col span={14} type={'flex'} justify={'center'} >
            {txtDestination}
          </Col>
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'} className='ess-spacing ess-currentRateContainer'>
          <Col span={15} type={'flex'} justify={'center'} >
            <span className='ess-txtCurrentRate'>{t('currentRate')}</span>
            <div>
              {'1 ' + HBCRYPTO.ETHEREUM + ' = ' + fRateConvert + ' ' + coinRight.symbol}
            </div>
          </Col>
        </Row>
        <Row type={'flex'} justify={'center'} align={'middle'}>
          <Col span={15} type={'flex'} justify={'center'} className='ess-italicFont'>
            {t('privacySend')}
            <div>{t('privacySend2')}</div>
          </Col>
        </Row>
        <Row type={'flex'} style={{paddingBottom: '30px'}} justify={'center'} align={'middle'}>
          <Button
            onClick={doAnotherTxs}
            className="btn-init-screen ess-button">{t('doAnother')}</Button>
        </Row>
      </div>
    </StyleRoot>

  )
}

export default ExchangeConfirm
