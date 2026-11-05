import React from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import { Spin } from 'Frontend/Components/HBLoader'
import Ethplorer from 'Backend/Api/services/Ethplorer'
import asyncValidate from './asyncValidate'

const renderField = ({ input, label, type, className, required, disabled, isLoading = false, t, meta: { touched, error } }) => (
  <div className={'pp-wrap-row pp-tlr-row' + (touched && error ? ' pp-tlr-row-error' : '')}>
    <div className='pp-wrap-amount-title pp-tlr-title'>
      {label}
      {required && <span className="pp-tlr-required">*</span>}
    </div>
    <div className='pp-wrap-amount-value pp-tlr-input'>
      <input {...input} type={type} disabled={disabled} className={className + (touched && error && ' input-error')} />
      {touched && error && <div className="hb-input-button-error">{t(error)}</div>}
    </div>
    {isLoading && <div className='pp-tlr-circleLoad'><Spin size={15} color={'white'}/></div>}
  </div>
)

const validate = values => {
  const errors = {}
  if (!values.address) {
    errors.address = 'tklContractAddressIsRequired'
  } else if (!/^(0x)?[0-9a-f]{40}$/i.test(values.address)) {
    errors.address = 'tklMustBeACorrectAddress'
  }
  if (!values.name) {
    errors.name = 'tklTokenNameIsRequired'
  }
  if (!values.symbol) {
    errors.symbol = 'tklTokenSymbolIsRequired'
  }
  if (values.decimals === '') {
    errors.decimals = 'tklTokenDecimalsIsRequired'
  } else if (!/^[0-9]*$/gm.test(values.decimals)) {
    errors.decimals = 'tklMustBeANumber'
  }
  if (!values.email) {
    errors.email = 'tklEmailIsRequired'
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'tklInvalidEmailAddress'
  }
  return errors
}

class TokenRequestForm extends React.PureComponent {
  constructor (props) {
    super(props)
    this.setBuffer = this.setBuffer.bind(this)
  }

  async setBuffer () {
    this.props.change('disabledField', false)
    this.props.change('isLoading', true)
    let tokenInfo
    try {
      tokenInfo = await Ethplorer.getTokenInfo(this.props.address)
    } catch (error) {
      tokenInfo = null
    }
    console.log('tokenInfo : ' + JSON.stringify(tokenInfo))
    if (tokenInfo !== null) {
      this.props.change('disabledField', true)
      this.props.change('name', tokenInfo.name)
      this.props.change('symbol', tokenInfo.symbol)
      this.props.change('decimals', tokenInfo.decimals)
    } else {
      this.props.change('disabledField', true)
      this.props.change('name', '')
      this.props.change('symbol', '')
      this.props.change('decimals', '')
    }
    this.props.change('isLoading', false)
  }

  render () {
    const { error, valid, handleSubmit, disabledField, isLoading, pristine, reset, submitting, t } = this.props
    return (
      <form className="pp-token-request-form" onSubmit={handleSubmit}>
        <div className="pp-wrap-amount-body pp-tlr-body">
          <div className="pp-info-amount">
            <Field
              label={t('tklContractAddress')}
              name="address"
              component={renderField}
              className="normal-input no-spinner"
              required={true}
              onBlur={this.setBuffer}
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
              label={t('Email')}
              name="email"
              component={renderField}
              className="normal-input no-spinner"
              required={true}
              t={t}
            />
            <Field
              label={t('tklHomepage')}
              name="homePage"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklBlog')}
              name="blog"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklTwitter')}
              name="twitter"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklFacebook')}
              name="facebook"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklDiscord')}
              name="discord"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklTelegram')}
              name="telegram"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklWhitepaper')}
              name="whitepaper"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklSlack')}
              name="slack"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklGithub')}
              name="github"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklReddit')}
              name="reddit"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklYoutube')}
              name="youtube"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            <Field
              label={t('tklLinkedIn')}
              name="linkedin"
              component={renderField}
              className="normal-input no-spinner"
              t={t}
            />
            {error && <strong>{error}</strong>}
          </div>
        </div>
        <div className="pp-wrap-amount-bottom">
          <button type="button" className="exs-btn exs-pp-unwrap-btn edt-text-capitalize" disabled={pristine || submitting} onClick={reset}>{t('cancel')}</button>
          <button type="submit" className="exs-btn exs-pp-unwrap-btn trf-request exs-btn-primary" disabled={!valid || pristine || submitting}>{t('Request')}</button>
        </div>
      </form>
    )
  }
}

TokenRequestForm = reduxForm({
  form: 'tokenRequest',
  validate,
  asyncValidate,
  asyncBlurFields: ['address']
})(TokenRequestForm)

const selector = formValueSelector('tokenRequest')

const mapStateToProps = state => {
  return {
    address: selector(state, 'address'),
    disabledField: selector(state, 'disabledField'),
    isLoading: selector(state, 'isLoading')
  }
}

export default connect(mapStateToProps)(TokenRequestForm)
