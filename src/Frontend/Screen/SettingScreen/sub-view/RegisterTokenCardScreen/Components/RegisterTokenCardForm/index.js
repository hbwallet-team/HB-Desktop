import React from 'react'
import { connect } from 'react-redux'
import { Field, Form, reduxForm, formValueSelector } from 'redux-form'
import { Spin } from 'Frontend/Components/HBLoader'
import Ethplorer from 'Backend/Api/services/Ethplorer'
import validate from './validate'
import asyncValidate from './asyncValidate'
import Images from 'Assets/Image'
import { Checkbox, Select, Tooltip, Upload, message } from 'antd'
import DexAPI from 'Backend/Api/services/DexAPI'
import './style.css'
const Option = Select.Option

const renderField = ({ input, label, type, className, required, helpText, disabled, isLoading = false, t, meta: { touched, error } }) => (
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
          fontSize: '11px'
        }}>
          {helpText}</div>}>
          <img src={Images.ic_help} className="pp-tlr-help-icon" />
        </Tooltip>}
    </div>
    <div className='pp-wrap-amount-value pp-tlr-input'>
      <input {...input} type={type} disabled={disabled} className={className + (touched && error && ' input-error')} />
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
    {isLoading && <div className='pp-tlr-circleLoad'><Spin size={15} color={'white'} /></div>}
  </div>
)

const renderCheckbox = ({ input, name, label, labelCheckbox, className, t, meta: { touched, error } }) => (
  <div className={'pp-wrap-row pp-tlr-checkbox pp-tlr-row' + (touched && error ? ' pp-tlr-row-error' : '')}>
    <div className='pp-wrap-amount-title pp-tlr-title'>{label}</div>
    <div className='pp-wrap-amount-value pp-tlr-input'>
      <Checkbox />
      <label htmlFor={name}>{labelCheckbox}</label>
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
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
          fontSize: '11px'
        }}>
          {helpText}</div>}>
          <img src={Images.ic_help} className="pp-tlr-help-icon" />
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

const renderUploadField = ({ input, label, type, className, maxLength, required, helpText, disabled, isLoading = false, t, meta: { touched, error }, beforeUpload,customRequest }) => (
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
          fontSize: '11px'
        }}>
          {helpText}</div>}>
          <img src={Images.ic_help} className="pp-tlr-help-icon" />
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
        customRequest={file => customRequest(file,input.name)}
      >
        <img className="adw-img-help" src={Images.adwUpload} />
      </Upload>
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
    {isLoading && <div className='pp-tlr-circleLoad'><Spin size={15} /></div>}
  </div>
)

const payment = ['ETH', 'HBWALLET']
let isJPG = false
let isLt2M = false
class RegisterTokenCardForm extends React.PureComponent {
  constructor(props) {
    super(props)
    this.checkContractAddress = this.checkContractAddress.bind(this)
    this.checkImage = this.checkImage.bind(this)
    this.beforeUpload = this.beforeUpload.bind(this)
    this.customRequest = this.customRequest.bind(this)
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
  async getBase64(img, callback) {
    const reader = new FileReader()
    try {
      reader.addEventListener('load', () => callback(reader.result))
      if (isJPG & isLt2M) reader.readAsDataURL(img)
    } catch (error) {
      console.log('error upload', error)
    }
  }

  customRequest(info,name){
    try {
      this.getBase64(info.file, async (imageUrl) => {
        let str = imageUrl.toString().split(';base64,')
        let imageBase64 = str[1]
        let width=0, height=0;
        if (name == "cardImage") {
          width = 850;
          height = 529;
        } else {
          width = 28;
          height = 28;
        }
        // let imgUPload = await DexAPI.imageUpload(info.file.originFileObj.name, imageBase64)
        // var imgUPload = {imageUrl:''};
        let imgUPload = await DexAPI.imageUploadResize(info.file.name, imageBase64, width, height);
        this.props.change(name, imgUPload.imageUrl);
        console.log(imgUPload);
        if (name == "cardImage") {
          this.checkImage();
        }
      })
    } catch (error) {
      console.log('getBase64 error', error)
    }
  }

  async checkContractAddress() {
    const { arrHBTokens } = this.props
    this.props.change('disabledField', false)
    this.props.change('isLoading', true)
    this.props.change('cardImage', '')
    this.props.change('cardPreview', '')
    
    if (this.props.address && this.props.address.length > 0) {
      let tokenInfo
      // Check exist token data
      arrHBTokens.map(item => {
        if (item.tokenAddress.toLowerCase() === this.props.address.toLowerCase()) tokenInfo = item
      })
      if (tokenInfo) {
        // console.log('tokenInfo HBtokens', tokenInfo)
        this.props.change('disabledField', true)
        this.props.change('name', tokenInfo.name)
        this.props.change('symbol', tokenInfo.symbol)
        this.props.change('decimals', tokenInfo.decimals)
        this.props.change('cardPreview',tokenInfo.cardImage);
      } else {
        tokenInfo = await Ethplorer.getTokenInfo(this.props.address)
        // console.log('tokenInfo Ethplorer', tokenInfo)
        if (!tokenInfo || tokenInfo.error) {
          this.props.change('disabledField', false)
          this.props.change('name', '')
          this.props.change('symbol', '')
          this.props.change('decimals', '')
          this.props.change('cardImage', '')
          this.props.change('cardPreview',this.props.cardImage);
        } else {
          this.props.change('disabledField', true)
          this.props.change('name', tokenInfo.name)
          this.props.change('symbol', tokenInfo.symbol)
          this.props.change('decimals', tokenInfo.decimals)
          this.props.change('cardPreview',this.props.cardImage);
        }
      }
    }
    this.props.change('isLoading', false)
  }
  checkImage() {
    this.props.change('cardPreview',this.props.cardImage);
  }
  render() {
    const { error, valid, handleChangePaymentType, handleSubmit, registrationFeeUsd, holdingTokenUsd, disabledField, isLoading, pristine, reset, submitting, t } = this.props
    return (
      <Form className="register-token-card-form" onSubmit={handleSubmit}>
        <div className="pp-wrap-amount-body">
          <div className="pp-input-amount">
            <Field
              label={t('tklContractAddress')}
              name="address"
              component={renderField}
              className="normal-input no-spinner"
              required={true}
              onBlur={this.checkContractAddress}
              isLoading={isLoading}
              t={t}
            />
            <Field
              label={t('tklTokenName')}
              name="name"
              component={renderField}
              className="normal-input no-spinner"
              required={true}
              disabled={disabledField}
              t={t}
            />
            <Field
              label={t('tklTokenSymbol')}
              name="symbol"
              component={renderField}
              className="normal-input no-spinner"
              required={true}
              disabled={disabledField}
              t={t}
            />
            <Field
              label={t('tklTokenDecimals')}
              name="decimals"
              component={renderField}
              className="normal-input no-spinner"
              required={true}
              disabled={disabledField}
              t={t}
            />
            <Field
              label={t('tklLogoFilePath')}
              name="iconImage"
              component={renderUploadField}
              beforeUpload={this.beforeUpload}
              customRequest={this.customRequest}
              className="normal-input no-spinner iconImage "
              helpText={t('tklLogoImageHelpText')}
              t={t}
            />
            <Field
              label={t('tklCardFilePath')}
              name="cardImage"
              component={renderUploadField}
              beforeUpload={this.beforeUpload}
              customRequest={this.customRequest}
              className="normal-input no-spinner cardImage "
              required={true}
              helpText={t('tklCardImageHelpText')}
              onBlur={this.checkImage}
              t={t}
            />
            {/* disabled={disabledIconField} */}
            <Field
              label={t('tklEmail')}
              name="email"
              component={renderField}
              className="normal-input no-spinner"
              required={true}
              t={t}
            />
            <Field
              label={t('tklRegistrationFee')}
              name="payment_type"
              component={renderSelectField}
              className="no-spinner"
              defaultValue={payment[0]}
              helpText={t('tklRegistrationFeeHelpText', { number: registrationFeeUsd, hold: holdingTokenUsd })}
              handleChange={handleChangePaymentType}
              t={t}
            >
              {payment.map(item =>
                <Option value={item} key={item}>{item}</Option>)}
            </Field>
          </div>
          <div className="pp-input-phone">
            <img src={Images.phoneBG} />
            {this.props.cardPreview &&
              <div className="pp-input-card-preview" style={{ backgroundImage: "url('" + this.props.cardPreview + "')" }}></div>}
          </div>
        </div>
        <div className="pp-wrap-amount-bottom">
          <div className="pp-wrap-amount-btn">
            <button type="button" className="exs-btn exs-pp-unwrap-btn edt-text-capitalize" disabled={pristine || submitting} onClick={reset}>{t('cancel')}</button>
            <button type="submit" className="exs-btn exs-pp-unwrap-btn trf-request exs-btn-primary" disabled={!valid || pristine || submitting}>{t('Register')}</button>
          </div>
        </div>
      </Form>
    )
  }
}

RegisterTokenCardForm = reduxForm({
  form: 'registerTokenCard',
  validate,
  asyncValidate,
  asyncBlurFields: ['address', 'cardImage', 'iconImage']
})(RegisterTokenCardForm)

const selector = formValueSelector('registerTokenCard')

const mapStateToProps = state => {
  return {
    address: selector(state, 'address'),
    cardImage: selector(state, 'cardImage'),
    cardPreview: selector(state, 'cardPreview'),
    iconImage: selector(state, 'iconImage'),
    disabledField: selector(state, 'disabledField'),
    isLoading: selector(state, 'isLoading')
  }
}

export default connect(mapStateToProps)(RegisterTokenCardForm)
