import React from 'react'
import './styles.css'
import { List } from 'antd'
import { FadingCircle } from 'better-react-spinkit'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import { FaArrowRight } from 'react-icons/lib/fa'
import { formatNumber, openBrowserInNewTab } from 'Utils/globalFunction'
import Modal from 'Frontend/Components/HBModal/FadeModal'
import Images from 'Assets/Image'
import { Button } from 'react-bootstrap'

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.funcDefautlThis(this)
    this.state = ({
      arrTXHistory: [],
      isLoading: true,
      itemSelected: {}
    })
  }

  componentWillMount () {
    this.props.fetchInitData()
  }

  render () {
    const { t, onBack, clickCell, funcClickAnother, fetchInitData } = this.props
    const { arrTXHistory, isLoading, itemSelected } = this.state
    return (
      <div className='ssh-touch-view'>
        <Header leftAction={onBack} title={t('ShapeShiftTop')}/>
        <div className="ssh-container">
          {/* <div className='title-ss-history'>{t('ShapeShiftHistory')}</div> */}
          <div className='ss-history-list-container' id="ScrollBarCoin">
            {isLoading
              ? <FadingCircle size={20} color={'white'}/>
              : arrTXHistory.length === 0
                ? <div>
                  <div className='md-ssh-groub-btns2'>{t('noResult')}</div>
                  <div className='md-ssh-groub-btns2'>
                    <Button
                      onClick={() =>
                        fetchInitData()
                      }
                      className="btn-init-screen md-ssh-button">{t('Refresh')}</Button>
                  </div>
                </div>
                : <List
                  split={false}
                  className="ssh-list-content"
                  dataSource={arrTXHistory}
                  renderItem={(item, index) => (
                    <List.Item className="ess-list-item"
                      onClick={() => clickCell(item)}
                    >
                      <div className='ssh-4-6'>
                        <div className='ess-4-1' style={{color: item.inputColor}}>
                          <div className='ssh-img-containt-confirm'>
                            <img alt='img' src={item.inputImage} className='ssh-img-confirm'/>
                          </div>
                          <div >
                            <div className='ssh-4-right-bold'>{formatNumber(item.inputAmount)} {item.inputCurrency}</div>
                          </div>
                        </div>
                        <div className='ssh-4-2' style={{color: item.inputColor}}>
                          <FaArrowRight size={20}/>
                        </div>
                        <div className='ssh-4-3'>
                          <div className='ssh-img-containt-confirm'>
                            <img alt='img' src={item.outputImage} className='ssh-img-confirm'/>
                          </div>
                          <div className='ssh-4-right-bold'>
                            <div style={{color: item.outputColor}}>{item.outputAmount} {item.outputCurrency}</div>
                          </div>
                        </div>
                      </div>
                      <div className='ssh-4-4'>
                        <div className='' style={{color: '#bfbdbd'}}>{item.timestamp}</div>
                      </div>
                      <div className='ssh-4-5'>
                        <div className='ssh-status' style={{backgroundColor: item.statusColor}}>{t(item.status)}</div>
                      </div>
                    </List.Item>
                  )} />
            }
          </div>
        </div>

        <Modal ref="md_shapeshiftHistory">
          <div className="md-ssh">
            {/* <div className="md-ssh-header">{t('ShapeShiftHistory')}</div> */}
            <div className="edt-md-header">{t('ShapeShiftHistory')}</div>
            <div className='md-ssh-line'/>
            <div className="md-ssh-content">
              <div className='md-ssh-icons'>
                <div className='ess-4-1' style={{color: itemSelected.inputColor}}>
                  <div className='ssh-img-containt-confirm'>
                    <img alt='img' src={itemSelected.inputImage} className='ssh-img-confirm'/>
                  </div>
                </div>
                <div className='ssh-4-2' style={{color: itemSelected.inputColor}}>
                  <FaArrowRight size={20}/>
                </div>
                <div className='ssh-4-3'>
                  <div className='ssh-img-containt-confirm'>
                    <img alt='img' src={itemSelected.outputImage} className='ssh-img-confirm'/>
                  </div>
                </div>
              </div>
              <div className='md-ssh-ground-balance'>
                {/* <div className='md-ssh-text-balance-left' style={{color: itemSelected.inputColor}}>{formatNumber(Number(itemSelected.inputAmount).toFixed(8))} {itemSelected.inputCurrency}</div>
                <div className='md-ssh-to'>{t('ssTo')}</div>
                <div className='md-ssh-text-balance-right' style={{color: itemSelected.outputColor}}>{itemSelected.outputAmount} {itemSelected.outputCurrency}</div> */}
                <div className='md-ssh-text-balance-center'>
                  <p className='md-ssh-transaction-text'><span className='md-ssh-text-balance-left' style={{color: itemSelected.inputColor}}>{formatNumber(itemSelected.inputAmount)} {itemSelected.inputCurrency}</span>
                    <span className='md-ssh-to'>{t('ssTo')}</span>
                    <span className='md-ssh-text-balance-right' style={{color: itemSelected.outputColor}}>{itemSelected.outputAmount} {itemSelected.outputCurrency}</span>
                  </p>
                </div>
              </div>
              <div className='md-ssh-text-completedOn' style={{color: '#bfbdbd'}}>{t('CompletedOn')}<span className='md-ssh-datetime' style={{color: 'white'}}>{itemSelected.timestamp}</span></div>
              <div className='md-ssh-line'/>
              <div className='md-ssh-bottom-content'>
                <div className='md-ssh-bottom-row'>
                  <div className='md-ssh-text-img'>
                    <img alt='img' src={Images.icReceived} className='ssh-img-sr'/>
                    <div className='md-ssh-text-title'> {t('DepositAddress')} </div>
                    <img alt='img' src={itemSelected.inputImage} className='ssh-img-src'/>
                  </div>
                  <div className='md-ssh-text' style={{marginTop: '3px'}}>{itemSelected.inputAddress}</div>
                </div>
                <div className='md-ssh-bottom-row'>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div className='md-ssh-text-img'>
                      <img alt='img' src={Images.icSend} className='ssh-img-sr'/>
                      <div className='md-ssh-text-title'> {t('WithdrawAddress')} </div>
                      <img alt='img' src={itemSelected.outputImage} className='ssh-img-src'/>
                    </div>
                    <div className='md-ssh-status' style={{backgroundColor: itemSelected.statusColor}}>{t(itemSelected.status)}</div>
                  </div>
                  <div className='md-ssh-text' style={{marginTop: '3px'}}>{itemSelected.outputAddress}</div>
                </div>
                <div className='md-ssh-groub-btns'>
                  <Button
                    onClick={() =>
                      openBrowserInNewTab(
                        itemSelected.inputCurrency === 'ETH'
                          ? 'https://etherscan.io/tx/' + itemSelected.inputTXID
                          : 'https://etherscan.io/tx/' + itemSelected.outputTXID)
                    }
                    className="btn-init-screen md-ssh-button">{t('SeeOnShapeShift')}</Button>
                </div>
                <div className='md-ssh-groub-btns1'>
                  <Button
                    onClick={() => funcClickAnother(itemSelected)}
                    className="btn-init-screen md-ssh-button">{t('DoAnotherExchange')}</Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
