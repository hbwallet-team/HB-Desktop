import React from 'react'
import Images from 'Assets/Image'
import { Row, Col } from 'antd'
import { HBInput } from 'Frontend/Components/HBInput'
import { Spin } from 'Frontend/Components/HBLoader'

const MdSendToAnotherUser = ({ THIS }) => {
  return (
    <div className="md-body md-send-asset">
      <div className="md-header">
        <div className="pp-close" onClick={THIS.props.onCloseSendToAnotherUserModal}>
          <img src={Images.close} />
        </div>
        {THIS.props.t('Dapps.sendToAnotherUser')}
      </div>
      <div className="md-content">
        <Row>
          <Col span={5}>
            <div className="md-receiver-account">
              {THIS.props.t('ReceiveAccount')}
            </div>
          </Col>
          <Col span={17}>
            <HBInput
              className={'receiver-asset'}
              autoFocus={true}
              icon={Images.ic_contacts1}
              onClickIcon={THIS.props.openAddressBook}
              isError={THIS.state.isReceiverErr}
              isSpacing={true}
              countMax={42}
              messageError={THIS.state.isNotExistAccount ? THIS.props.t('Dapps.isNotExistAccount') : THIS.props.t('errorAddress42')}
              value={THIS.state.strReceiverAddr}
              onChange={THIS.props.onChangeReceiverAddr}/>
          </Col>
        </Row>
        <Row>
          <Col span={5}></Col>
          <Col span={17} className='receiver-note'>
            {THIS.props.t('Dapps.sendNFTNote')}
          </Col>
        </Row>
      </div>
      <div className="md-footer">
        <div 
          id="btnHover"
          className="md-mab-btnFooter"
          onClick={THIS.props.onCloseSendToAnotherUserModal}>{THIS.props.t('cancel')}</div>
        <div 
          id="btnHover" 
          disabled={!THIS.state.isActiveSend}
          className={'md-btn-add ' + (THIS.state.isActiveSend ? 'md-mab-btnFooter' : 'md-mab-btnFooter-disable')} 
          onClick={THIS.props.sendToAnotherUser}>
          {THIS.state.isLoadingSendAnother 
            ? <Spin size={15} color={'white'}/> 
            : THIS.props.t('Send')
          }</div>
      </div>
    </div>
  )
}

export default MdSendToAnotherUser
