import React from 'react'
import { HBInput } from '../../../../Components/HBInput'
import { Spin } from 'Frontend/Components/HBLoader'
import { Button } from 'react-bootstrap'
import './styles.css'

const space3x = '   '
export default class View extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = ({
      txtContractAddr: '',
      txtTokenName: '',
      disabledBtn: true,

      isAlreadyCreate: false,
      isAddressErr: false,
      isNotContractAddr: false,
      isDisableSave: true,

      objDataJson: '',
      isLoadingTokenInfo: false
    })

    this.arrFilterTokenData = []
    this.arrTokenDataName = []

    props.funcDefautlThis(this)
  }
  componentWillMount () {
    var self = this
    setTimeout(() => {
      self.props.loadingInitial()
    }, 1000)
  }
  render () {
    const { txtContractAddr, objDataJson, isLoadingTokenInfo,
      txtTokenName, isAlreadyCreate, isAddressErr, isNotContractAddr, disabledBtn } = this.state
    const { onChangeContractAddress, t, clearAll } = this.props

    return (
      <div className="wct-container">
        <div className="sts-header">
          <div className="sts-header-title">{t('WatchContract')}</div>
        </div>
        <div className="wct-row1">
          <span className="wct-label">{t('contractAddress')}</span>
          <HBInput
            className={'mh-input-41'}
            autoFocus={true}
            countMax={42}
            value={txtContractAddr}

            isSuccess={isAlreadyCreate}
            isErrBorderBottom={true}
            isError={isAlreadyCreate ? true : isAddressErr}
            messageError={space3x + (isAlreadyCreate
              ? t('SearchToken.alreadyToken')
              : isNotContractAddr ? t('SearchToken.errorContract')
                : t('AccountErrorMsg'))}
            onChange={(value) => onChangeContractAddress(value.trim().toLowerCase())}/>
          {isLoadingTokenInfo && <div className='wct-progress'><Spin size={15} color='white'/></div>}
        </div>
        <div className="wct-row2">
          <span className="wct-label">{t('contractName')}</span>
          <HBInput
            className={'mh-input-41'}
            value={txtTokenName}
            readOnly={true}
          />
        </div>
        <div className="wct-row3">
          <span className="wct-label">{t('Json_interface')}</span>
          <textarea className="wct-areaContainer" id="HBScrollBar"
            placeholder={t('WatchContractScreen.jsonInterface')}
            value={objDataJson ? JSON.stringify(objDataJson) : ''}
            readOnly={true}
          ></textarea>
        </div>
        {/* <div className="wct-row4">
          <div className="wct-wrapBtn">
            <Button onClick={() => clearAll()} className="btn-init-screen wct-button">{t('cancel')}</Button>
            <Button disabled={disabledBtn} className="btn-init-screen wct-button wct-button-active">{t('ok')}</Button>
          </div>
        </div> */}
      </div>
    )
  }
}
