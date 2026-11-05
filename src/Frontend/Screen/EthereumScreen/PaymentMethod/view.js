import React from 'react'
import './styles.css'
import { List } from 'antd'
import Images from '../../../../Assets/Image'
import { HBPopupConfirm } from 'Frontend/Components/HBPopup'
import Modal from 'Frontend/Components/HBModal/FadeModal'

export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    props.defaultThis(this)
    this.cardDelete = null
  }

  render () {
    const {
      arrPayment, t, backToAccountDetail, gotoNewPaymentView,
      selectCard, deleteCard, setPrimary, confirmDelete, hideMdConfirm
    } = this.props

    return (
      <div className="pm-container">
        <div className="pm-listContainer">
          {arrPayment.length === 0
            ? <div className="mab-list-no-data">{t('NoData')}</div>
            : <List
              className="mab-list-account"
              dataSource={arrPayment}
              renderItem={(item, index) => (
                <List.Item className="pm-list-item">
                  <div className='pm-cell-card'>
                    <div className='pm-cell-col1' onClick={() => selectCard(item)}>
                      <div className="pm-cell-selectedBox">
                        {item.isSelected ? <img alt='img' src={Images.btnRadio_selected}/> : <img alt='img' src={Images.btnRadio}/>}
                      </div>
                      <div >
                        {item.cardNumber.startsWith('5') ? <img className="pm-cell-card-img" alt='img' src={Images.ic_masterCard}/> : <img className="pm-cell-card-img" alt='img' src={Images.ic_visaCard}/>}
                      </div>
                      <span className='pm-cell-center'>{item.cardNumber.substring(0, 4)}</span>
                    </div>
                    <div className='pm-cell-col2'>{t('ExpiryDate') + item.expriresMonth + '-' + item.expriresYear}</div>
                    <div className='pm-cell-col3'>
                      <div className='pm-cell-primary' onClick={() => setPrimary(item)}>
                        <span style={{marginRight: '10px', fontSize: '14px'}}>{t('SetPrimary')}</span>
                        {item.isPrimary ? <img alt='img' className="pm-cell-card-img-toggle" src={Images.toggle_selected}/> : <img alt='img' className="pm-cell-card-img-toggle" src={Images.toggle}/>}
                      </div>
                    </div>
                    <div className='pm-cell-col4'>
                      <div className="pm-cell-selectedBox" id={item.isPrimary ? 'btnDisable' : 'btnScale-active'} onClick={() => deleteCard(item)}>
                        <img alt='img' src={Images.ic_trash}/>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )} />
          }
        </div>
        <div className="pm-btn-group">
          <div className="fwc-container-btn-cancle">
            <button onClick={backToAccountDetail} id={'btnScale-active'} className="btn-init-screen edt-button">{t('cancel')}</button>
          </div>
          <div className="fwc-container-btn-buy">
            <button disabled={arrPayment.length >= 5} onClick={gotoNewPaymentView} id={'btnScale-active'} className={arrPayment.length >= 5 ? 'pm-button pm-btn-add' : 'btn-init-screen pm-btn-add'}>{'Add Payment Methods'}</button>
            <button className="btn-init-screen fwc-buy" id={'btnScale-active'}>{'Charge This Card'}</button>
          </div>
        </div>
        <Modal ref="md_mab_confirm">
          <HBPopupConfirm onOk={confirmDelete} onCancel={hideMdConfirm} message={'Delete this card'} t={t}/>
        </Modal>
      </div>
    )
  }
}
