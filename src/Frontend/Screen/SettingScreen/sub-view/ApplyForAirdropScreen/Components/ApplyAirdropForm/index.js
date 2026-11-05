import React from 'react'
import {connect} from 'react-redux'
import { Field, Form, reduxForm, formValueSelector } from 'redux-form'
import { Spin } from 'Frontend/Components/HBLoader'
import Ethplorer from 'Backend/Api/services/Ethplorer'
import validate from './validate'
import asyncValidate from './asyncValidate'
import Images from 'Assets/Image'
import { Select, Tooltip, Upload, message } from 'antd'
import moment from 'moment'
import { zeroPadLeft, convertWeiToBalance } from 'Utils/globalFunction'
import DatePicker from 'react-datepicker'
import DexAPI from 'Backend/Api/services/DexAPI'
import 'react-datepicker/dist/react-datepicker.css'
const Option = Select.Option
let isJPG = false
let isLt2M = false

const renderField = ({ input, label, type, className, maxLength, required, helpText, disabled, isLoading = false, t, meta: { touched, error } }) => (
  <div className={'pp-wrap-row pp-tlr-row ' + (touched && error ? ' pp-tlr-row-error' : '')}>
    <div className='pp-wrap-amount-title pp-tlr-title'>
      <span>
        {label}
        {required && <span className="pp-tlr-required">*</span>}
      </span>
      {helpText && 
      <Tooltip placement="top" title={<div style={{
        padding: '5px 5px 5px 5px',
        fontFamily: 'var(--font-helvetica-neue)',
        fontSize: '11px'}}>
        {helpText}</div>}>
        <img src={Images.ic_help} className="pp-tlr-help-icon"/>
      </Tooltip>}
    </div>
    <div className='pp-wrap-amount-value pp-tlr-input'>
      <input {...input} type={type} maxLength={maxLength} disabled={disabled} className={className + (touched && error && ' input-error')} />
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
    {isLoading && <div className='pp-tlr-circleLoad'><Spin size={15}/></div>}
  </div>
)

const renderDatePicker = ({ input, label, type, className, required, disabled, helpText, selectedDate, onSelectDate, onChangeDate, selectedHour, onChangeHour, selectedMinute, onChangeMinute, renderOptionHours, renderOptionMinutes, t, meta: { touched, error } }) => (
  <div className={'pp-wrap-row pp-tlr-row' + (touched && error ? ' pp-tlr-row-error' : '')}>
    <div className='pp-wrap-amount-title pp-tlr-title'>
      <span>
        {label}
        {required && <span className="pp-tlr-required">*</span>}
      </span>
      {helpText && 
      <Tooltip placement="top" title={<div style={{
        padding: '5px 5px 5px 5px',
        fontFamily: 'var(--font-helvetica-neue)',
        fontSize: '11px'}}>
        {helpText}</div>}>
        <img src={Images.ic_help} className="pp-tlr-help-icon"/>
      </Tooltip>}
    </div>
    <div className='pp-wrap-amount-value pp-tlr-input'>
      <Tooltip placement="top" trigger="click" overlayClassName="afa-ttdateStart" title={<div className='exs-text-expires exc-set-font'>
        <DatePicker
          inline
          selected={selectedDate}
          onSelect={onSelectDate}
          onChange={onChangeDate}
          minDate={new Date()}
          showDisabledMonthNavigation
        />
        <Select 
          className='exs-select-hour' 
          defaultValue={selectedHour} 
          onChange={onChangeHour}
        >
          {renderOptionHours}
        </Select>
        <span className='exs-select-hour-two-dot'>:</span>
        <Select 
          className='exs-select-minute' 
          defaultValue={selectedMinute} 
          onChange={onChangeMinute}
        >
          {renderOptionMinutes}
        </Select>
      </div>}>
        <input {...input} type={type} disabled={disabled} className={className + (touched && error && ' input-error')} style={{backgroundImage: `url(${Images.setDate})`, backgroundRepeat: 'no-repeat', backgroundPosition: '140px 7px', cursor: 'pointer'}} />
      </Tooltip>
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
  </div>
)

const renderUploadField = ({ input, label, type, className, maxLength, required, helpText, disabled, isLoading = false, t, meta: { touched, error }, beforeUpload, handleChange }) => (
  <div className={'pp-wrap-row pp-tlr-row ' + (touched && error ? ' pp-tlr-row-error' : '')}>
    <div className='pp-wrap-amount-title pp-tlr-title'>
      <span>
        {label}
        {required && <span className="pp-tlr-required">*</span>}
      </span>
      {helpText && 
      <Tooltip placement="top" title={<div style={{
        padding: '5px 5px 5px 5px',
        fontFamily: 'var(--font-helvetica-neue)',
        fontSize: '11px'}}>
        {helpText}</div>}>
        <img src={Images.ic_help} className="pp-tlr-help-icon"/>
      </Tooltip>}
    </div>
    <div className='pp-wrap-amount-value pp-tlr-input'>
      <input {...input} type={type} maxLength={maxLength} disabled={disabled} className={className + (touched && error && ' input-error')} />
      <Upload
        name="adwUpload"
        className={'adw-btn-upload ' + (disabled ? ' adw-disable-upload' : '')}
        listType={'text'}
        showUploadList={false}
        beforeUpload={file => beforeUpload(file)}
        onChange={info => handleChange(info)}
      >
        <img className="adw-img-help" src={Images.adwUpload} />
      </Upload>
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
    {isLoading && <div className='pp-tlr-circleLoad'><Spin size={15}/></div>}
  </div>
)

const renderSelectField = ({ label, children, handleChange, defaultValue, helpText, className, t, meta: { touched, error } }) => (
  <div className={'pp-wrap-row pp-tlr-row' + (touched && error ? ' pp-tlr-row-error' : '')}>
    <div className='pp-wrap-amount-title pp-tlr-title'>
      {label}
      {helpText && 
      <Tooltip placement="top" title={<div style={{
        padding: '5px 5px 5px 5px',
        fontFamily: 'var(--font-helvetica-neue)',
        fontSize: '11px'}}>
        {helpText}</div>}>
        <img src={Images.ic_help} className="pp-tlr-help-icon"/>
      </Tooltip>}
    </div>
    <div className='pp-wrap-amount-value pp-tlr-input'>
      <Select className={className + (touched && error && ' input-error')} defaultValue={defaultValue} onChange={handleChange}>
        {children}
      </Select>
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
  </div>
)

const renderTextArea = ({ input, label, className, required, helpText, disabled, t, meta: { touched, error } }) => (
  <div className={'pp-wrap-row pp-tlr-row pp-serviceDetail' + (touched && error ? ' pp-tlr-row-error' : '')}>
    <div className='pp-wrap-amount-title pp-tlr-title'>
      <span>
        {label}
        {required && <span className="pp-tlr-required">*</span>}
      </span>
      {helpText && 
      <Tooltip placement="top" title={<div style={{
        padding: '5px 5px 5px 5px',
        fontFamily: 'var(--font-helvetica-neue)',
        fontSize: '11px'}}>
        {helpText}</div>}>
        <img src={Images.ic_help} className="pp-tlr-help-icon"/>
      </Tooltip>}
    </div>
    <div className='pp-wrap-amount-value pp-tlr-input'>
      <textarea {...input} disabled={disabled} className={className + (touched && error && ' input-error')} />
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
  </div>
)

const payment = ['ETH', 'HBWALLET']

class ApplyAirdropForm extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      startDate: moment(new Date()), // current day,
      startHour: moment(new Date()).format('HH'),
      startMinute: moment(new Date()).format('mm'),
      endDate: moment(new Date()).add(1, 'd'), // current day + a day
      endHour: moment(new Date()).add(1, 'd').format('HH'),
      endMinute: moment(new Date()).add(1, 'd').format('mm')
    }
    this.handleChange = this.handleChange.bind(this)
    this.beforeUpload = this.beforeUpload.bind(this)
    this.hours = []
    for (let index = 0; index < 24; index++) {
      this.hours.push(zeroPadLeft(index.toString(), 2))
    }
    this.minutes = []
    for (let index = 0; index < 60; index++) {
      this.minutes.push(zeroPadLeft(index.toString(), 2))
    }
  }
  handleChangeStartHour = (value) => {
    const { startDate, startMinute } = this.state
    const y = startDate.format('YYYY')
    const m = startDate.format('MM') - 1
    const d = startDate.format('DD')
    this.setState({
      startHour: value,
      startDate: moment(new Date(y, m, d, value, startMinute, 0, 0))
    })
    this.props.change('startDate', moment(new Date(y, m, d, value, startMinute, 0, 0)).format('YYYY/MM/DD HH:mm'))
  }
  handleChangeStartMinute = (value) => {
    const { startDate, startHour } = this.state
    const y = startDate.format('YYYY')
    const m = startDate.format('MM') - 1
    const d = startDate.format('DD')
    this.setState({
      startMinute: value,
      startDate: moment(new Date(y, m, d, startHour, value, 0, 0))
    })
    this.props.change('startDate', moment(new Date(y, m, d, startHour, value, 0, 0)).format('YYYY/MM/DD HH:mm'))
  }
  handleSelectStartDate = (date) => {
    const { startHour, startMinute } = this.state
    const y = date.format('YYYY')
    const m = date.format('MM') - 1
    const d = date.format('DD')
    this.setState({
      startDate: date
    })
    this.props.change('startDate', moment(new Date(y, m, d, startHour, startMinute, 0, 0)).format('YYYY/MM/DD HH:mm'))
  }
  handleChangeStartDate = (date) => {
    const { startHour, startMinute } = this.state
    const y = date.format('YYYY')
    const m = date.format('MM') - 1
    const d = date.format('DD')
    this.setState({
      startDate: date
    })
    this.props.change('startDate', moment(new Date(y, m, d, startHour, startMinute, 0, 0)).format('YYYY/MM/DD HH:mm'))
  }
  handleChangeEndHour = (value) => {
    const { endDate, endMinute } = this.state
    const y = endDate.format('YYYY')
    const m = endDate.format('MM') - 1
    const d = endDate.format('DD')
    this.setState({
      endHour: value,
      endDate: moment(new Date(y, m, d, value, endMinute, 0, 0))
    })
    this.props.change('endDate', moment(new Date(y, m, d, value, endMinute, 0, 0)).format('YYYY/MM/DD HH:mm'))
  }
  handleChangeEndMinute = (value) => {
    const { endDate, endHour } = this.state
    const y = endDate.format('YYYY')
    const m = endDate.format('MM') - 1
    const d = endDate.format('DD')
    this.setState({
      endMinute: value,
      endDate: moment(new Date(y, m, d, endHour, value, 0, 0))
    })
    this.props.change('endDate', moment(new Date(y, m, d, endHour, value, 0, 0)).format('YYYY/MM/DD HH:mm'))
  }
  handleSelectEndDate = (date) => {
    const { endHour, endMinute } = this.state
    const y = date.format('YYYY')
    const m = date.format('MM') - 1
    const d = date.format('DD')
    this.setState({
      endDate: date
    })
    this.props.change('endDate', moment(new Date(y, m, d, endHour, endMinute, 0, 0)).format('YYYY/MM/DD HH:mm'))
  }
  handleChangeEndState = (date) => {
    const { endHour, endMinute } = this.state
    const y = date.format('YYYY')
    const m = date.format('MM') - 1
    const d = date.format('DD')
    this.setState({
      endDate: date
    })
    this.props.change('endDate', moment(new Date(y, m, d, endHour, endMinute, 0, 0)).format('YYYY/MM/DD HH:mm'))
  }
  renderOptionHours () {
    return (
      this.hours.map(item => {
        return (<Option key={item} value={item}>{item}</Option>)
      })
    )
  }
  renderOptionMinutes () {
    return (
      this.minutes.map(item => {
        return (<Option key={item} value={item}>{item}</Option>)
      })
    )
  }
  beforeUpload = (file) => {
    const listImageTypes = 'SVG+XML, SVG, ANI, BMP, CAL, FAX, GIF, IMG, JBG, JPE, JPEG, JPG, MAC, PBM, PCD, PCX, PCT, PGM, PNG, PPM, PSD, RAS, TGA, TIFF, WMF'
    const { t } = this.props
    let fileType = file.type.split('/')[1] ? file.type.split('/')[1].toUpperCase() : 'NOT_EXIST_FILE_TYPE'
    isJPG = listImageTypes.includes(fileType)

    if (!isJPG) {
      message.error(t('notSupport'))
    }
    isLt2M = file.size / 1024 / 1024 < 2
    if (isJPG && !isLt2M) {
      message.error(t('smallerThan2MB'))
    }
    return isJPG & isLt2M
  }
  async getBase64 (img, callback) {
    const reader = new FileReader()
    try {
      reader.addEventListener('load', () => callback(reader.result))
      if (isJPG & isLt2M) reader.readAsDataURL(img)
    } catch (error) {
      console.log('error upload', error)
    }
  }

  handleChange = (info) => {
    try {
      this.getBase64(info.file.originFileObj, async (imageUrl) => {
        let str = imageUrl.toString().split(';base64,')
        let imageBase64 = str[1]
        let imgUPload = await DexAPI.imageUpload(info.file.originFileObj.name, imageBase64)
        this.props.change('imageLink', imgUPload.imageUrl)
      })
    } catch (error) {
      console.log('getBase64 error', error)
    }
  }
  checkContractAddress = async () => {
    const { arrHBTokens } = this.props
    this.props.change('name', '')
    this.props.change('symbol', '')
    this.props.change('decimals', '')
    this.props.change('totalSupply', '')
    this.props.change('website', '')
    this.props.change('imageLink', '')
    this.props.change('disabledIconField', false)
    this.props.change('disabledHomeField', false)
    this.props.change('disabledField', false)
    this.props.change('isLoading', true)
    if (this.props.address && this.props.address.trim() !== '') {
      let tokenInfo
      tokenInfo = await Ethplorer.getTokenInfo(this.props.address)
      if (!tokenInfo || tokenInfo.error) {
        this.props.change('disabledField', false)
        this.props.change('name', '')
        this.props.change('symbol', '')
        this.props.change('decimals', '')
        this.props.change('totalSupply', '')
        this.props.change('website', '')
        this.props.change('imageLink', '')
        this.setState({
          cardPreview: '',
          tokenInfoName: ''
        })
      } else {
        this.props.change('disabledField', true)
        this.props.change('name', tokenInfo.name)
        this.props.change('symbol', tokenInfo.symbol)
        this.props.change('decimals', tokenInfo.decimals)
        this.props.change('totalSupply', String(convertWeiToBalance(tokenInfo.totalSupply, tokenInfo.decimals)))
        let existHBToken = arrHBTokens.find(e => e.tokenAddress.toLowerCase() === this.props.address.toLowerCase())
        if (existHBToken) {
          if (existHBToken.url.trim() !== '') {
            this.props.change('website', existHBToken.url)
            this.props.change('disabledHomeField', true)
          }
          if (existHBToken.iconImage.trim() !== '') {
            this.props.change('imageLink', existHBToken.iconImage)
            this.props.change('disabledIconField', true)
          }
        }
      }
    }
    this.props.change('isLoading', false)
  }
  render () {
    const { valid, handleChangePaymentType, handleSubmit, registrationFeeUsd, disabledField, disabledIconField, disabledHomeField, isLoadingExcute, pendingAirdrop, isLoading, pristine, reset, submitting, t } = this.props
    const { startDate, startHour, startMinute, endDate, endHour, endMinute } = this.state
    return (
      <Form className="apply-airdrop-form" onSubmit={handleSubmit}>
        <div className="pp-wrap-amount-body">
          <div className="pp-input-amount">
            <Field
              label={t('tklContractAddress')}
              name="address"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              onBlur={this.checkContractAddress}
              isLoading={isLoading}
              maxLength={42}
              t={t}
            />
            <Field
              label={t('tklTokenName')}
              name="name"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              disabled={disabledField}
              maxLength={25}
              t={t}
            />
            <div className="afa-tokenName">{t('ads-info1')}</div>
            <Field
              label={t('tklTokenSymbol')}
              name="symbol"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              disabled={disabledField}
              maxLength={10}
              t={t}
            />
            <div className="afa-tokenSymbol">{t('ads-info2')}</div>
            <Field
              label={t('tklTokenDecimals')}
              name="decimals"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              disabled={disabledField}
              maxLength={2}
              t={t}
            />
            <div className="afa-tokenDecimals">{t('ads-info3')}</div>
            <Field
              label={t('afa-TotalSupply')}
              name="totalSupply"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              disabled={disabledField}
              t={t}
            />
            <Field
              label={t('afa-TokenAmount')}
              name="amount"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              t={t}
            />
            <Field
              label={t('afa-startDate')}
              name="startDate"
              required={true}
              component={renderDatePicker}
              selectedDate={startDate}
              selectedHour={startHour}
              selectedMinute={startMinute}
              onSelectDate={this.handleSelectStartDate}
              onChangeDate={this.handleChangeStartDate}
              onChangeHour={this.handleChangeStartHour}
              onChangeMinute={this.handleChangeStartMinute}
              renderOptionHours={this.renderOptionHours()}
              renderOptionMinutes={this.renderOptionMinutes()}
              className="normal-input no-spinner afa-startDate "
              t={t}
            />
            <Field
              label={t('afa-endDate')}
              name="endDate"
              required={true}
              component={renderDatePicker}
              selectedDate={endDate}
              selectedHour={endHour}
              selectedMinute={endMinute}
              onSelectDate={this.handleSelectEndDate}
              onChangeDate={this.handleChangeEndDate}
              onChangeHour={this.handleChangeEndHour}
              onChangeMinute={this.handleChangeEndMinute}
              renderOptionHours={this.renderOptionHours()}
              renderOptionMinutes={this.renderOptionMinutes()}
              className="normal-input no-spinner afa-endDate "
              t={t}
            />
            <Field
              label={t('afa-urlHomepage')}
              name="website"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              disabled={disabledHomeField}
              t={t}
            />
            <Field
              label={t('afa-urlIcon')}
              name="imageLink"
              component={renderUploadField}
              beforeUpload={this.beforeUpload}
              handleChange={this.handleChange}
              className="normal-input no-spinner imageLink "
              t={t}
              disabled={disabledIconField}
            />
            <Field
              label={t('afa-title')}
              name="title"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              t={t}
            />
            <Field
              label={t('afa-serviceDetails')}
              name="description"
              required={true}
              component={renderTextArea}
              textArea={true}
              className="normal-input no-spinner afa-textArea "
              t={t}
            />
            <Field
              label={t('tklEmail')}
              name="email"
              required={true}
              component={renderField}
              className="normal-input no-spinner "
              t={t}
            />
            <Field
              label={t('tklRegistrationFee')}
              name="paymentType"
              component={renderSelectField}
              className="no-spinner"
              defaultValue={payment[0]}
              helpText={t('ApplyAirdrop.registrationFeeHelpText', { number: registrationFeeUsd })}
              handleChange={handleChangePaymentType}
              t={t}
            >
              {payment.map(item =>
                <Option value={item} key={item}>{item}</Option>)}
            </Field>
          </div>
          <div className="pp-input-phone">
            <img src={Images.phoneGrap} />
            {this.props.address 
              ? <div className="afa-AddAirDrop">
                <div className="afa-AirDropNew">
                  <img className="afa-AirDropImg" src={(this.props.imageLink) ? this.props.imageLink : Images.airDropNone} />
                  <div className="afa-AirDropInfo">
                    <div className="afa-AirDropName">{this.props.name || 'Token name'}</div>
                    <div className="afa-AirDropDate">{this.props.startDate ? moment(new Date(this.props.startDate)).format('YYYY/MM/DD') : 'YYYY/MM/DD'}</div>
                    <div className="afa-AirDropContent">{this.props.title}</div>
                    <div className="afa-AirDropNote"></div>
                  </div>
                </div>
                <img className="afa-AirDrop" src={Images.airDropTokens} />
              </div>
              : <img className="afa-AirDropFix" src={Images.airDropTokens} />}
          </div>
        </div>
        <div className="pp-wrap-amount-bottom">
          <div className="pp-wrap-amount-btn">
            <button type="button" className="exs-btn exs-pp-unwrap-btn edt-text-capitalize" disabled={pristine || submitting} onClick={reset}>{t('cancel')}</button>
            <button type="submit" className="exs-btn exs-pp-unwrap-btn trf-request exs-btn-primary" disabled={!valid || pristine || submitting || isLoadingExcute}> 
              {isLoadingExcute
                ? <Spin size={15} color={'white'}/>
                : t('Apply')
              }
            </button>
          </div>
        </div>
      </Form>
    )
  }
}

ApplyAirdropForm = reduxForm({
  form: 'applyAirdrop',
  validate,
  asyncValidate,
  asyncBlurFields: ['address']
})(ApplyAirdropForm)

const selector = formValueSelector('applyAirdrop')

const mapStateToProps = state => {
  return {
    address: selector(state, 'address'),
    name: selector(state, 'name'),
    imageLink: selector(state, 'imageLink'),
    title: selector(state, 'title'),
    startDate: selector(state, 'startDate'),
    disabledField: selector(state, 'disabledField'),
    disabledIconField: selector(state, 'disabledIconField'),
    disabledHomeField: selector(state, 'disabledHomeField'),
    isLoading: selector(state, 'isLoading')
  }
}

export default connect(mapStateToProps)(ApplyAirdropForm)
