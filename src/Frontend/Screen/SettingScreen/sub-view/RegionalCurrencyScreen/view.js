import React from 'react'
import { Radio, List } from 'antd'
import { HBCURRENCY } from '../../../../../Utils/globalConstants'
import './styles.css'

const RadioGroup = Radio.Group
export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: 1
    }
    this.data = [
      { 'selecteId': 0, 'content': HBCURRENCY.GBP, 'contentName': props.t('Initial.BritishPound') },
      { 'selecteId': 1, 'content': HBCURRENCY.JPY, 'contentName': props.t('Initial.japanYen') },
      { 'selecteId': 2, 'content': HBCURRENCY.EUR, 'contentName': props.t('Initial.Euro') },
      { 'selecteId': 3, 'content': HBCURRENCY.AUD, 'contentName': props.t('Initial.AustralianDollar') },
      { 'selecteId': 4, 'content': HBCURRENCY.BRL, 'contentName': props.t('Initial.BrazilianReal') },
      { 'selecteId': 5, 'content': HBCURRENCY.CAD, 'contentName': props.t('Initial.CanadianDollar') },
      { 'selecteId': 6, 'content': HBCURRENCY.CHF, 'contentName': props.t('Initial.SwissFranc') },
      { 'selecteId': 7, 'content': HBCURRENCY.CLP, 'contentName': props.t('Initial.ChileanPeso') },
      { 'selecteId': 8, 'content': HBCURRENCY.CZK, 'contentName': props.t('Initial.CzechRepublicKoruna') },
      { 'selecteId': 9, 'content': HBCURRENCY.DKK, 'contentName': props.t('Initial.DanishKrone') },
      { 'selecteId': 10, 'content': HBCURRENCY.HKD, 'contentName': props.t('Initial.HongKongDollar') },
      { 'selecteId': 11, 'content': HBCURRENCY.HUF, 'contentName': props.t('Initial.HungarianForint') },
      { 'selecteId': 12, 'content': HBCURRENCY.KRW, 'contentName': props.t('Initial.SouthKoreanWon') },
      { 'selecteId': 13, 'content': HBCURRENCY.IDR, 'contentName': props.t('Initial.IndonesianRupiah') },
      { 'selecteId': 14, 'content': HBCURRENCY.ILS, 'contentName': props.t('Initial.IsraeliNewSheqel') },
      { 'selecteId': 15, 'content': HBCURRENCY.INR, 'contentName': props.t('Initial.IndianRupee') },
      { 'selecteId': 16, 'content': HBCURRENCY.ISK, 'contentName': props.t('Initial.IcelandicKroner') },
      { 'selecteId': 17, 'content': HBCURRENCY.MXN, 'contentName': props.t('Initial.MexicanPeso') },
      { 'selecteId': 18, 'content': HBCURRENCY.NOK, 'contentName': props.t('Initial.NorwegianKrone') },
      { 'selecteId': 19, 'content': HBCURRENCY.NTD, 'contentName': props.t('Initial.NewTaiwanDollar') },
      { 'selecteId': 20, 'content': HBCURRENCY.NZD, 'contentName': props.t('Initial.NewZealandDollar') },
      { 'selecteId': 21, 'content': HBCURRENCY.PHP, 'contentName': props.t('Initial.PhilippinePeso') },
      { 'selecteId': 22, 'content': HBCURRENCY.PKR, 'contentName': props.t('Initial.PakistaniRupee') },
      { 'selecteId': 23, 'content': HBCURRENCY.PLN, 'contentName': props.t('Initial.PolishZloty') },
      { 'selecteId': 24, 'content': HBCURRENCY.MYR, 'contentName': props.t('Initial.MalaysianMyr') },
      { 'selecteId': 25, 'content': HBCURRENCY.RMB, 'contentName': props.t('Initial.ChineseYuan') },
      { 'selecteId': 26, 'content': HBCURRENCY.RUB, 'contentName': props.t('Initial.RussianRuble') },
      { 'selecteId': 27, 'content': HBCURRENCY.SEK, 'contentName': props.t('Initial.SwedishKrona') },
      { 'selecteId': 28, 'content': HBCURRENCY.SGD, 'contentName': props.t('Initial.SingaporeDollar') },
      { 'selecteId': 29, 'content': HBCURRENCY.THB, 'contentName': props.t('Initial.ThailandBaht') },
      { 'selecteId': 30, 'content': HBCURRENCY.TRY, 'contentName': props.t('Initial.TurkishLira') },
      { 'selecteId': 31, 'content': HBCURRENCY.USD, 'contentName': props.t('Initial.UnitedStates') },
      { 'selecteId': 32, 'content': HBCURRENCY.VND, 'contentName': props.t('Initial.VietnameseDong') },
      { 'selecteId': 33, 'content': HBCURRENCY.ZAR, 'contentName': props.t('Initial.SouthAfricanRand') }
    ]
    props.funcDefaultThis(this)
  }
  componentWillMount () {
    this.data.map(item => {
      if (this.props.arrCurrencyData === item.content) {
        this.setState({ value: item.selecteId })
      }
    })
  }
  renderItem = (item) => {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
      color: 'rgba(255, 255, 255, 0.7)'
    }
    return (
      <List.Item>
        <Radio style={radioStyle} value={item.selecteId}>{item.content + ' ' + item.contentName}
        </Radio>
      </List.Item>

    )
  }

  render () {
    return (
      <div className="sts-container">
        <div className="sts-header">
          <div className="sts-header-title">{this.props.t('RegionalCurrency')}</div>
        </div>
        <div className="rc-scr-container" id="HBScrollBar">
          <RadioGroup onChange={this.props.onChange} value={this.state.value}>
            <List
              dataSource={this.data}
              grid={{ gutter: 1, lg: 3, xl: 3 }}
              renderItem={(item) =>
                this.renderItem(item)
              }
            />
          </RadioGroup>
        </div>
      </div>
    )
  }
}
