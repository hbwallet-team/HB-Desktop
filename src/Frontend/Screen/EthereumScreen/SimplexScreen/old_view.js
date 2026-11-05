import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Layout, Divider, Button, Input, Tooltip, Icon, Select, Row, Col } from 'antd'
import { Form, Field } from 'react-final-form'
// import FormInput from './components/FormInput'
import Images from 'Assets/Image'
import Header from 'Frontend/Container/CoreLayoutContainer/header'
import swal from 'sweetalert2'
import { filterMainAccount, formatNumber, closeTabBrower } from 'Utils/globalFunction'
import { HBWALLET } from 'Utils/globalConstants'
import { debounce } from 'lodash'
import { isEmpty } from 'ramda'
import useLoading from "./hooks"
// import BrowserScreen from '../../DappScreen/sub-view/BrowserScreen'
import { Wave } from 'better-react-spinkit'
import EtherLibrary from 'Backend/HBLibrary/EtherLibrary'
import SimplexForm from './components/SimplexForm'

// import Modal from 'Frontend/Components/HBModal/FadeModal'
import './style.css'
const { shell } = window.require('electron')

const SimplexView = props => {
  const {
    onBack,
    cardSelected,
    openModalReceive,
    openEditAccountModal,
    internetData,
    etherPrice,
    t,
    backToDetail,
    arrCardData, userAuth

  } = props
  const { Option } = Select;
  let resetFrom
  let MIN = 50
  let MAX = 20000
  const [loading, withLoading] = useLoading(false)
  const [formSubmiting, setSubmiting] = useState(false)
  let setRefWebView = useRef(null)
  const [choose, setChoose] = useState('eth')
  const [paymentData, setPayment] = useState({})
  const [valueForm, getValueForm] = useState(200)
  const [location, setLocation] = useState({})
  const [selectCurrency, setSelectCurrency] = useState("USD")
  const [unitCurrency, setUnitCurrency] = useState("ETH")
  const [requestPaymentData, getRequestPaymentData] = useState({})
  const [resultRequestPayment, getResultRequestPayment] = useState({})
  const [linkSimplex, setLink] = useState("https://sandbox.test-simplexcc.com")
  const [state, setState] = useState({
    bitcoin: false,
    eth: true,
    ripple: false
  })
  const currentAccount = filterMainAccount(arrCardData)
  const { btcSimplexIcon, ethSimplexIcon, rippleSimplexIcon } = Images
  const COIN_TYPE = [
    {
      id: 1,
      type: 'bitcoin',
      logo: <img src={btcSimplexIcon} alt="img" />,
      action: async () => {
        await swal({
          width: '365px',
          text: t('Simplex.BuyBitcoin', { name: 'Bitcoin' }),
          type: 'info',
          showConfirmButton: true,
          customClass: 'simplex-popup'
        })
        await setState({ bitcoin: true, eth: false, ripple: false })
      }
    },
    {
      id: 2,
      type: 'eth',
      logo: <img src={ethSimplexIcon} alt="img" />,
      action: () => setState({ bitcoin: false, eth: true, ripple: false })
    },
    {
      id: 1,
      type: 'ripple',
      logo: <img src={rippleSimplexIcon} alt="img" />,
      action: async () => {
        await swal({
          width: '365px',
          text: t('Simplex.BuyBitcoin', { name: 'Ripple' }),
          type: 'info',
          showConfirmButton: true,
          customClass: 'simplex-popup'
        })
        setState({ bitcoin: false, eth: false, ripple: true })
      }
    }
  ]
  const FIAT_UNIT = ["EUR", "USD"]
  const COIN_UNIT = state.eth ? "ETH" : state.bitcoin ? "BTC" : "XRP"
  const CURRENT_UNIT = (selectCurrency !== "USD") && (selectCurrency !== "EUR") ? "USD" : COIN_UNIT
  const fiatCurrency = selectCurrency === "EUR" ? "EUR" : "USD"
  const fiatIcon = selectCurrency === "EUR" ? "€" : "$"
  const limitValue = selectCurrency === "EUR" ? (MIN = 44) && (MAX = 17900) : (MIN = 50) && (MAX = 20000)
  const checkCurrencyUnit = FIAT_UNIT.includes(selectCurrency)
  const intitalValue = 200
  const [formData, setFormData] = useState({
    usdAmount: intitalValue,
    coinAmount: ''
  })
  const [switchToBrowser, setActiveBrowser] = useState(false)
  const fetchData = async (value = 0, isUsdAmount = true) => {
    try {
      const params = {
        digital_currency: COIN_UNIT,
        requested_amount: value,
        fiat_currency: fiatCurrency,
        end_user_id: userAuth._id,
        requested_currency: isUsdAmount ? selectCurrency : COIN_UNIT
      }
      const result = await withLoading(() => props.getPaymentQuote(params, currentAccount.address))

      const { data = {} } = result || {}
      const { digital_money = {}, fiat_money = {} } = data || {}
      setPayment(data)
      setFormData({
        usdAmount: isUsdAmount ? value : fiat_money.total_amount,
        coinAmount: isUsdAmount ? digital_money.amount : value,
        receiveForm: document.getElementById('receiveForm') ? document.getElementById('receiveForm').value : '',
        tagField: document.getElementById('tagField') ? document.getElementById('tagField').value : ''
      })

      const requestData = {
        account_details: {
          app_version_id: window.require('electron').remote.app.getVersion(),
          app_end_user_id: userAuth._id,
          app_install_date: userAuth.updatedAt,
          signup_login: {
            location: `${location.latitude},${location.longitude}`,
            uaid: "",
            cookie_session_id: ""
          }
        },
        transaction_details: {
          payment_details: {
            quote_id: data.quote_id,
            fiat_total_amount: {
              currency: fiat_money.currency,
              amount: fiat_money.total_amount,
            },
            requested_digital_amount: {
              currency: digital_money.currency,
              amount: digital_money.amount,
            },
            destination_wallet: {
              currency: digital_money.currency,
              address: currentAccount.address,
            },
            original_http_ref_url: 'https://hb-wallet.com'
          }
        }
      }
      getRequestPaymentData(requestData)
    } catch (error) {
      throw error
    }
  }
  const submitFormPayment = () => {
    setActiveBrowser(true)
  }

  const detectLocation = async () => {
    try {
      const result = await props.getLocation() || {}
      setLocation(result)
    } catch (error) {
      console.log("error", error)
    }
  }
  const fetchRequestPayment = async (value = {}) => {
    try {
      setSubmiting(true)
      closeTabBrower()
      const { transaction_details = {} } = requestPaymentData
      const { payment_details = {} } = transaction_details
      const { destination_wallet = {} } = payment_details
      const paramData = {
        ...requestPaymentData,
        transaction_details: {
          ...transaction_details,
          payment_details: {
            ...payment_details,
            destination_wallet: {
              ...destination_wallet,
              address: state.eth ? currentAccount.address : value.receiveForm,
              tag: state.ripple ? value.tagField : undefined
            }
          }
        }
      }
      const balance = await EtherLibrary.getTokenBalance(HBWALLET, currentAccount.address, 2)
      const result = await props.requestPayment(paramData, currentAccount.address, balance)
      if (result && !result.error && result.data) {
        getResultRequestPayment(result.data)
        submitFormPayment()
        setSubmiting(false)
      } else {
        setSubmiting(false)
        swal({
          width: '300px',
          text: t("RequestFail"),
          type: 'error',
          showConfirmButton: true,
          customClass: 'simplex-popup'
        })
      }
      // if (paymentResult) {
      //   setLink("https://sandbox.test-simplexcc.com/payments/new")
      //   setTimeout(setRefWebView.current.send("payment_form", "payment_form", "", paymentResult), 5000
      //   )
      // }
    } catch (error) {
      setSubmiting(false)
      swal({
        width: '300px',
        text: t("RequestFail"),
        type: 'error',
        showConfirmButton: true,
        customClass: 'simplex-popup'
      })
    }
  }

  const toggleDrawer = (side, open) => event => {
    setState({ ...state, [side]: open })
  }

  // const schema = Joi.object().keys({
  //   usdAmount: Joi.number().min(MIN).max(MAX).required().error(errors => {
  //     const detailError = errors.map(err => {

  //       const objectError = {
  //         ...err,
  //         message: err.message
  //       }
  //       const newErrorObject = {
  //         "number.min": objectError.message = `Value should have at least $${objectError.context.limit}!`,
  //         "number.max": objectError.message = `Value should have at most $${objectError.context.limit} !`
  //       }
  //       const result = {
  //         ...objectError,
  //         message: newErrorObject[objectError.type] || err.message
  //       }
  //       return result
  //     });

  //     return detailError;

  //   }).label("USD amount"),
  //   receiveForm: Joi.string().label("Receiver account").required().regex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/).error(errors => {
  //     const detailError = errors.map(err => {
  //       const objectError = {
  //         ...err,
  //         message: err.message
  //       }
  //       const newErrorObject = {
  //         "string.regex.base": objectError.message = `Address invalid`,
  //       }
  //       const result = {
  //         ...objectError,
  //         message: newErrorObject[objectError.type] || err.message
  //       }
  //       return result
  //     });
  //     return detailError;
  //   }).when("concurrency", {
  //     is: "eth",
  //     then: Joi.required(),
  //     otherwise: Joi.optional()
  //   })
  // });
  const onSubmit = (value) => {
    fetchRequestPayment(value)
  }
  const backToTop = () => {
    setActiveBrowser(false)
    fetchData(formData.usdAmount)
  }
  const Condition = ({ when, is, children }) => (
    <Field name={when} subscription={{ value: true }}>
      {({ input: { value } }) => (state.eth === is ? children : null)}
    </Field>
  )
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const required = value => (value ? undefined : t("Simplex.ValidateRequired"));
  const mustBeNumber = value => (value && isNaN(value) ? t("Simplex.ValidateNumber") : undefined);
  const minValue = min => value =>
    (value && isNaN(value)) || value >= min ? undefined : t('Simplex.LimitedValue', { unit: fiatCurrency });
  const maxValue = max => value =>
    (value && isNaN(value)) || value <= max ? undefined : t('Simplex.LimitedValue', { unit: fiatCurrency });
  const composeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);
  const mustBeBitcoinAddress = (value) => {
    // Let's not start a debate on email regex. This is just for an example app!
    if (!isEmpty(value) && !/(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,39}$/i.test(value)) {
      return t("Simplex.InvalidAddress");
    }
  }
  const mustBeRippleAddress = (value) => {
    // Let's not start a debate on email regex. This is just for an example app!
    if (!isEmpty(value) && !/^r[0-9a-zA-Z]{24,34}$/i.test(value)) {
      return t("Simplex.InvalidAddress");
    }
  }
  const maxLengthDecimal = max => (value) => {
    // Let's not start a debate on email regex. This is just for an example app!
    if (!isEmpty(value) && !/^\d+(\.\d{1,8})?$/i.test(value)) {
      return `Ensure that there are no more than 9 digits before the decimal point.`;
    }
  }
  const asyncRequestUnit = debounce(async (value) => {
    const validate = checkCurrencyUnit ? value >= MIN && value <= MAX : value >= 1 && value <= MAX
    if (isEmpty(value)) {
      setFormData({
        usdAmount: '',
        coinAmount: '',
        receiveForm: document.getElementById('receiveForm') ? document.getElementById('receiveForm').value : '',
        tagField: document.getElementById('tagField') ? document.getElementById('tagField').value : ''
      })
    }
    if (!isEmpty(value) && validate) {
      fetchData(value)
    }
  }, 1000)
  const asyncRequestAmount = debounce(async (value) => {
    if (isEmpty(value)) {
      setFormData({
        usdAmount: '',
        coinAmount: '',
        receiveForm: document.getElementById('receiveForm') ? document.getElementById('receiveForm').value : '',
        tagField: document.getElementById('tagField') ? document.getElementById('tagField').value : ''
      })
    }
    if (!isEmpty(value)) {
      fetchData(value, false)
    }
  }, 1000)
  const handleSelected = (value) => setSelectCurrency(value)
  const { digital_money = {}, fiat_money = {} } = paymentData || {}
  const checkFiatMoney = FIAT_UNIT.includes(selectCurrency) ? fiat_money.total_amount : digital_money.amount
  useEffect(() => {
    console.log(setRefWebView.current);
  }, [setRefWebView])

  useEffect(() => {
    return () => {
      closeTabBrower()
    };
  }, [state]);

  useEffect(() => {
    fetchData(intitalValue)
  }, [state, selectCurrency])

  useEffect(() => {
    detectLocation()
  }, [])

  const hiddenForm = () => {
    const { data: { account_details = {}, transaction_details = {} } = {} } = resultRequestPayment || {}
    const { payment_details = {} } = transaction_details
    const { destination_wallet = {}, fiat_total_amount = {}, requested_digital_amount = {} } = payment_details
    return (
      <div>
        <form id='payment_form' name="payment_form" action='https://checkout.simplexcc.com/payments/new' method='POST' target='_blank'>
          <div>
            <label htmlFor="pwd">version:</label>
            <input className="form-control" name='version' value="1" />
            <label htmlFor="pwd">partner:</label>
            <input className="form-control" name='partner' value={account_details.app_provider_id} />
            <label htmlFor="pwd">payment_flow_type:</label>
            <input className="form-control" name='payment_flow_type'
              value="wallet" />
            <label htmlFor="pwd">return_url:</label>
            <input className="form-control" name='return_url' id="return_url" value={payment_details.original_http_ref_url} />
            <label htmlFor="pwd">quote_id:</label>
            <input className="form-control" name='quote_id' id="payment_quote_id" value={payment_details.quote_id} />
            <label htmlFor="pwd">payment_id:</label>
            <input className="form-control" name='payment_id' id="payment_id" value={payment_details.payment_id} />
            <label htmlFor="pwd">payment_user_id:</label>
            <input className="form-control" name='user_id' id="payment_user_id" value={account_details.app_end_user_id} />
          </div>
          <div className="col-sm-6">
            <label htmlFor="pwd">address:</label>
            <input className="form-control" name='destination_wallet[address]' id="destination_wallet_address" value={destination_wallet.address} />
            <label htmlFor="pwd">currency:</label>
            <input className="form-control" name='destination_wallet[currency]' id="destination_wallet_currency" value={destination_wallet.currency} />
            <label htmlFor="pwd">amount:</label>
            <input className="form-control" name='fiat_total_amount[amount]' id="fiat_total_amount" value={fiat_total_amount.amount} />
            <label htmlFor="pwd">fiat_currency:</label>
            <input className="form-control" name='fiat_total_amount[currency]' id="fiat_total_amount_currency" value={fiat_total_amount.currency} />
            <label htmlFor="pwd">digital_total_amount:</label>
            <input className="form-control" name='digital_total_amount[amount]' id="digital_total_amount" value={requested_digital_amount.amount} />
            <label htmlFor="pwd">digital_total_amount_currency:</label>
            <input className="form-control" name='digital_total_amount[currency]' id="digital_total_amount_currency" value={requested_digital_amount.currency} />
            <button className="btn btn-primary" type="submit">Continue</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <React.Fragment>
      {
        switchToBrowser
          ? <SimplexForm postData={resultRequestPayment} backToTop={backToTop} />
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
                              coin.type === choose ? "active" : ""}`}
                            key={index}
                            onClick={() => {
                              coin.action();
                              resetFrom();
                              setChoose(coin.type);
                              setPayment(intitalValue);
                              setSelectCurrency("USD");
                            }}
                          >
                            {choose && <img
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
                      validate={() => {
                        const errors = {};
                        if (checkFiatMoney > MAX) {
                          errors.usdAmount = t('Simplex.LimitedValue', { unit: fiatCurrency });
                        }
                        return errors;
                      }}
                      initialValues={formData}
                      render={({
                        handleSubmit,
                        submitting,
                        pristine,
                        values,
                        form, validating, valid,
                        invalid,
      
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
                                              handleSelected(value);
                                              resetFrom();
                                            }}
                                            defaultValue={'USD'}
                                            value={selectCurrency}
                                          >
                                            <Option value="EUR">EUR</Option>
                                            <Option value="USD">USD</Option>
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
                                          <div className="usd-symbol">{CURRENT_UNIT}</div>
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
                                    <span className="external-link" onClick={() => shell.openExternal('https://www.hb-wallet.com/faq')}>{t('Simplex.moreDetails')}</span>
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
                                    state.bitcoin || state.ripple
                                      ? <label className="usd-label receive-label">
                                        {t('Simplex.receiverAccount')}
                                      </label>
                                      : null
                                  }
                                </Col>
                                <Col span={20}>
                                  {state.eth ? (
                                    <div className="account-group">
                                      <div className="account-receive-main">
                                        {currentAccount.cardName}
                                      </div>
                                      <label>{currentAccount.address}</label>
                                    </div>
                                  ) : (
                                    <React.Fragment>
                                      <Condition when="concurrency" is={state.eth}>
                                        <Field
                                          name="receiveForm"
                                          validate={state.ripple ?
                                            composeValidators(required, mustBeRippleAddress) : composeValidators(required, mustBeBitcoinAddress)}
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
                              state.ripple && (
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
                                        <Condition when="concurrency" is={state.eth}>
                                          <Field name="tagField"
                                            validate={composeValidators(mustBeNumber)}
                                          // active={false}
                                          >
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
                                    className={`btn-buy-simplex ${validating || submitting || formSubmiting || invalid || loading ? "disable" : ""}`} disabled={submitting || formSubmiting || validating || invalid || loading}
                                  >{formSubmiting ? <Wave size={20} color="white" /> : t('Simplex.Buy')}</button>
                                </div>
                              </Col>
                            </Row>
                          </form>
                        )
                      }}
                    />
      
                    <div className="payment-form">
                      {hiddenForm()
                      }
                    </div>
      
                    {/* <Modal ref={modalBrowser}> */}
                    {/* <WebView
                      ref={setRefWebView}
                      src={linkSimplex}
                    /> */}
                    {/* </Modal> */}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
      }
    </React.Fragment>
  )
}
export default SimplexView
