import React from 'react'
import Images from 'Assets/Image'
import { Form, Field } from 'react-final-form'
import { Divider, Input, Select, Row, Col } from 'antd'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import { Wave } from 'better-react-spinkit'
import SimplexForm from './components/SimplexForm'
import swal from 'sweetalert2'
import { isEmpty } from 'ramda'
import { formatNumber, filterMainAccount, openBrowserInNewTab } from 'Utils/globalFunction'
import { debounce } from 'lodash'
import './style.css'
const { remote, shell } = window.require('electron')
const { Option } = Select
let resetFrom

export default class SimplexScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      formData: {
        usdAmount: 200,
        coinAmount: ''
      },
      postData: {
        account_details: {
          app_version_id: remote.app.getVersion(),
          app_end_user_id: props.userAuth._id,
          app_install_date: new Date(),
          signup_login: {
            location: '',
            uaid: '',
            cookie_session_id: ''
          }
        },
        transaction_details: {
          payment_details: {
            quote_id: '',
            fiat_total_amount: {
              currency: '',
              amount: 0
            },
            requested_digital_amount: {
              currency: '',
              amount: 0
            },
            destination_wallet: {
              currency: '',
              address: '',
              tag: ''
            },
            original_http_ref_url: 'https://hb-wallet.com'
          }
        }
      },
      postPaymentData: {},
      switchToBrowser: false,
      selectedCoin: 'ETH',
      fiatCurrency: 'USD',
      loading: true,
      formSubmiting: false,
      location: {},
      hbTokenBalance: 0
    }
    props.defaultThis(this)
  }
  componentDidMount () {
    this.props.getPaymentQuote()
    this.props.getLocation()
    this.props.getHBTokenBalance()
  }
  render () {
    const { switchToBrowser, postPaymentData, selectedCoin, fiatCurrency, formData, loading, formSubmiting } = this.state
    const { arrCardData, backToTop, backToDetail, onSubmit, localeData, t } = this.props
    const mainAccount = filterMainAccount(arrCardData)
    const fiatIcon = fiatCurrency === 'EUR' ? '€' : '$'
    let MIN = fiatCurrency === 'EUR' ? 44 : 50
    let MAX = fiatCurrency === 'EUR' ? 17900 : 20000
    const FIAT_UNIT = ['EUR', 'USD']
    const COIN_TYPE = [
      {
        id: 1,
        type: 'BTC',
        logo: <img src={Images.btcSimplexIcon} alt="img" />,
        action: () => {
          swal({
            width: '365px',
            text: t('Simplex.BuyBitcoin', { name: 'Bitcoin' }),
            type: 'info',
            showConfirmButton: true,
            customClass: 'simplex-popup'
          })
          this.setState({ selectedCoin: 'BTC' })
        }
      },
      {
        id: 2,
        type: 'ETH',
        logo: <img src={Images.ethSimplexIcon} alt="img" />,
        action: () => this.setState({ selectedCoin: 'ETH' })
      },
      {
        id: 3,
        type: 'XRP',
        logo: <img src={Images.rippleSimplexIcon} alt="img" />,
        action: () => {
          swal({
            width: '365px',
            text: t('Simplex.BuyBitcoin', { name: 'Ripple' }),
            type: 'info',
            showConfirmButton: true,
            customClass: 'simplex-popup'
          })
          this.setState({ selectedCoin: 'XRP' })
        }
      },
      {
        id: 4,
        type: 'TRX',
        logo: <img src={Images.tronSimplexIcon} alt="img" />,
        action: () => {
          swal({
            width: '365px',
            text: t('Simplex.BuyBitcoin', { name: 'Tron' }),
            type: 'info',
            showConfirmButton: true,
            customClass: 'simplex-popup'
          })
          this.setState({ selectedCoin: 'TRX' })
        }
      }
    ]
    const required = value => (value ? undefined : t('Simplex.ValidateRequired'))
    const mustBeNumber = value => (value && isNaN(value) ? t('Simplex.ValidateNumber') : undefined)
    const minValue = min => value =>
      (value && isNaN(value)) || value >= min ? undefined : t('Simplex.LimitedValue', { unit: fiatCurrency })
    const maxValue = max => value =>
      (value && isNaN(value)) || value <= max ? undefined : t('Simplex.LimitedValue', { unit: fiatCurrency })
    const composeValidators = (...validators) => value =>
      validators.reduce((error, validator) => error || validator(value), undefined)
    const mustBeBitcoinAddress = (value) => {
      // Let's not start a debate on email regex. This is just for an example app!
      if (!isEmpty(value) && !/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,39}$/i.test(value)) {
        return t('Simplex.InvalidAddress')
      }
    }
    const mustBeRippleAddress = (value) => {
      // Let's not start a debate on email regex. This is just for an example app!
      if (!isEmpty(value) && !/^r[0-9a-zA-Z]{24,34}$/i.test(value)) {
        return t('Simplex.InvalidAddress')
      }
    }
    const mustBeTronAddress = (value) => {
      // Let's not start a debate on email regex. This is just for an example app!
      if (!isEmpty(value) && !/^T[0-9a-zA-Z]{24,34}$/i.test(value)) {
        return t('Simplex.InvalidAddress')
      }
    }
    // const maxLengthDecimal = max => (value) => {
    //   // Let's not start a debate on email regex. This is just for an example app!
    //   if (!isEmpty(value) && !/^\d+(\.\d{1,8})?$/i.test(value)) {
    //     return `Ensure that there are no more than 9 digits before the decimal point.`
    //   }
    // }
    const Condition = ({ when, is, children }) => (
      <Field name={when} subscription={{ value: true }}>
        {({ input: { value } }) => (is ? children : null)}
      </Field>
    )
    const asyncRequestUnit = debounce(async (value) => {
      const validate = value >= MIN && value <= MAX
      if (isEmpty(value)) {
        this.setState({
          formData: {
            usdAmount: '',
            coinAmount: '',
            receiveForm: document.getElementById('receiveForm') ? document.getElementById('receiveForm').value : '',
            tagField: document.getElementById('tagField') ? document.getElementById('tagField').value : ''
          }
        })
      }
      if (!isEmpty(value) && validate) {
        this.props.getPaymentQuote(value)
      }
    }, 1000)
    const asyncRequestAmount = debounce(async (value) => {
      if (isEmpty(value)) {
        this.setState({
          formData: {
            usdAmount: '',
            coinAmount: '',
            receiveForm: document.getElementById('receiveForm') ? document.getElementById('receiveForm').value : '',
            tagField: document.getElementById('tagField') ? document.getElementById('tagField').value : ''
          }
        })
      }
      if (!isEmpty(value)) {
        this.props.getPaymentQuote(value, false)
      }
    }, 1000)
    const handleSelected = (value) => this.setState({ fiatCurrency: value }, () => this.props.getPaymentQuote(formData.usdAmount))
    const openMoreDetails = () => {
      let locale = this.props.localeData
      if (locale === 'jp') {
        locale = 'ja'
      } else if (locale === 'cn') {
        locale = 'zh'
      } else if (locale === 'vn') {
        locale = 'vi'
      }
      openBrowserInNewTab('https://www.hb-wallet.com/faq?lang=' + locale)
    }
    return (
      <React.Fragment>
        {
          switchToBrowser
            ? <SimplexForm postData={postPaymentData} backToTop={backToTop} />
            : <React.Fragment>
              <Header title={t('accountSumary')} leftAction={backToDetail} />
              <div className="simplex-content" id="HBScrollBar"
              >
                <div className="page-title">{t('Simplex.Title')} </div>
                <Divider />
                <div className="wrap-content" >
                  <div className="coin-card">
                    <div>{t('Simplex.CoinChoose')}</div>
                    <Row>
                      <Col span={4}></Col>
                      <Col span={20}>
                        <div className="cryptocurrencyList">
                          {COIN_TYPE.map((coin, index) => (
                            <div
                              className={`CryptocurrencyList-item ${
                                coin.type === selectedCoin ? 'active' : ''}`}
                              key={index}
                              onClick={async () => {
                                await coin.action()
                                resetFrom()
                                this.props.getPaymentQuote(formData.usdAmount)
                              }}
                            >
                              {selectedCoin && <img
                                alt="img"
                                src={Images.itemSelect}
                                className={'card-img-select'}
                              />}
                              <div>{coin.logo}</div>
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <Divider className="divider-second" />
                  <div className="amount">
                    <div className="simplex-title">{t('Simplex.SelectAmount')}</div>
                    <div className="form-amount">
                      <Form
                        onSubmit={onSubmit}
                        initialValues={formData}
                        render={({
                          handleSubmit,
                          submitting,
                          pristine,
                          values,
                          form, validating, valid,
                          invalid
                        }) => {
                          resetFrom = form.reset
                          return (
                            <form
                              onSubmit={handleSubmit}
                              className="add-user-form"
                              id="simplexform"
                            >
                              <Row>
                                <Col span={4}>
                                  <label className="usd-label">
                                    {t('Simplex.youPay')}
                                  </label>
                                </Col>
                                <Col span={20}>
                                  <Field 
                                    name="usdAmount"
                                    validate={composeValidators(required, mustBeNumber, minValue(MIN), maxValue(MAX))}
                                  >
                                    {({ input, meta }) => (
                                      <React.Fragment>
                                        <div className="usd-form">
                                          <div className="usd-input">
                                            <Input
                                              {...input}
                                              onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault() }}
                                              onChange={(e) => {
                                                input.onChange(e)
                                                asyncRequestUnit(e.target.value)
                                              }}
                                            />
                                          </div>
                                          <div className="simplex-selected-currency">
                                            <Select 
                                              style={{ width: 120 }} 
                                              onChange={(value) => {
                                                handleSelected(value)
                                                resetFrom()
                                              }}
                                              defaultValue={'USD'}
                                              value={fiatCurrency}
                                            >
                                              {
                                                FIAT_UNIT.map((item, i) => {
                                                  return <Option value={item} key={i}>{item}</Option>
                                                })
                                              }
                                            </Select>
                                          </div>
                                        </div>
                                        {meta.error && (
                                          <div className="simplex-error-message">{meta.error}</div>
                                        )}
                                      </React.Fragment>
                                    )}
                                  </Field>
                                </Col>
                              </Row>
                              <Row>
                                <Col span={4}></Col>
                                <Col span={20}>
                                  <div className="value-limit">
                                    <div className="min-max">
                                      <div>
                                        {t('Simplex.Min')}: {`${fiatIcon}`}{formatNumber(MIN)}
                                      </div>
                                      <div>
                                        {t('Simplex.Max')}: {`${fiatIcon}`}{formatNumber(MAX)}
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col span={4}>
                                  <label className="usd-label">
                                    {t('Simplex.youWillGet')}
                                  </label>
                                </Col>
                                <Col span={20}>
                                  <Field 
                                    name="coinAmount"
                                    validate={composeValidators(mustBeNumber)}
                                  >
                                    {({ input, meta }) => (
                                      <React.Fragment>
                                        <div className="usd-form">
                                          <div className="usd-input">
                                            <Input
                                              {...input}
                                              onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault() }}
                                              onChange={(e) => {
                                                input.onChange(e)
                                                asyncRequestAmount(e.target.value)
                                              }}
                                            />
                                            <div className="usd-symbol">{selectedCoin}</div>
                                          </div>
                                          <div className="usd-loading">{loading ? <Wave size={20} color="white" /> : null}</div>
                                        </div>
                                        {meta.error && (
                                          <div className="simplex-error-message">{meta.error}</div>
                                        )}
                                      </React.Fragment>
                                    )}
                                  </Field>
                                </Col>
                              </Row>
                              <Row>
                                <Col span={4}></Col>
                                <Col span={20}>
                                  <div className="sub-info-value">
                                    <div>{t('Simplex.SelectAmountText1')}</div>
                                    <div>
                                      {t('Simplex.SelectAmountText2')}
                                      <span className="external-link" onClick={() => openMoreDetails()}>{t('Simplex.moreDetails')}</span>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                              <Divider />
                              <div className="account-receive">
                                <div className="account-receive-title">
                                  {t('Simplex.AccountReceive')}
                                </div>
                                <Row>
                                  <Col span={4}>
                                    {
                                      selectedCoin === 'BTC' || selectedCoin === 'XRP'
                                        ? <label className="usd-label receive-label">
                                          {t('Simplex.receiverAccount')}
                                        </label>
                                        : null
                                    }
                                  </Col>
                                  <Col span={20}>
                                    {selectedCoin === 'ETH' ? (
                                      <div className="account-group">
                                        <div className="account-receive-main">
                                          {mainAccount.cardName}
                                        </div>
                                        <label>{mainAccount.address}</label>
                                      </div>
                                    ) : (
                                      <React.Fragment>
                                        <Condition when="concurrency" is={selectedCoin !== 'ETH'}>
                                          <Field
                                            name="receiveForm"
                                            validate={selectedCoin === 'BTC' ? composeValidators(required, mustBeBitcoinAddress) : (selectedCoin === 'XRP' ? composeValidators(required, mustBeRippleAddress) : composeValidators(required, mustBeTronAddress))}
                                          >
                                            {({ input, meta }) => (
                                              <React.Fragment>
                                                <div className="usd-form receive-form">
                                                  <div className="usd-input receive-input">
                                                    <Input {...input} id="receiveForm" />
                                                  </div>
                                                </div>
                                                {meta.error && meta.touched && (
                                                  <div className="simplex-error-message">{meta.error}</div>
                                                )}
                                              </React.Fragment>
                                            )}
                                          </Field>
                                        </Condition>
                                      </React.Fragment>
                                    )}
                                  </Col>
                                </Row>
                              </div>
                              <Divider />
                              {
                                selectedCoin === 'XRP' && (
                                  <React.Fragment>
                                    <div className="account-receive">
                                      <div className="account-tag-title">
                                        {t('Simplex.Tag')}
                                      </div>
                                      <Row>
                                        <Col span={4}>
                                          <label className="usd-label tag-label">
                                            {t('Simplex.Tag')}
                                          </label>
                                        </Col>
                                        <Col span={20}>
                                          <Condition when="concurrency" is={selectedCoin === 'XRP'}>
                                            <Field name="tagField" validate={composeValidators(mustBeNumber)} >
                                              {({ input, meta }) => (
                                                <React.Fragment>
                                                  <div className="usd-form receive-form">
                                                    <div className="usd-input receive-input">
                                                      <Input {...input} id="tagField"/>
                                                    </div>
                                                  </div>
                                                  {meta.error && meta.touched && (
                                                    <div className="simplex-error-message">{meta.error}</div>
                                                  )}
                                                </React.Fragment>
                                              )}
                                            </Field>
                                          </Condition>
                                        </Col>
                                      </Row>
                                    </div>
                                    <Divider />
                                  </React.Fragment>
                                )
                              }
                              <Row>
                                <Col span={4}></Col>
                                <Col span={20}>
                                  <div className="button-group">
                                    <button type="button" className="btn-cancel-simplex" onClick={() => backToDetail()}>
                                      {t('cancel')}
                                    </button>
                                    <button type="submit"
                                      className={`btn-buy-simplex ${validating || submitting || formSubmiting || invalid || loading ? 'disable' : ''}`} disabled={submitting || formSubmiting || validating || invalid || loading}
                                    >{formSubmiting ? <Wave size={20} color="white" /> : t('Simplex.Buy')}</button>
                                  </div>
                                </Col>
                              </Row>
                            </form>
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
        }
      </React.Fragment>
    )
  }
}
