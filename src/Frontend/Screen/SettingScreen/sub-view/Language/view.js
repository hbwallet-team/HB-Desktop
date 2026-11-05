import React from 'react'
import { Radio, List } from 'antd'
import './styles.css'

const RadioGroup = Radio.Group
export default class View extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: 1
    }
    this.data = [
      { 'selecteId': 0, 'label': 'English', 'language': 'en' },
      { 'selecteId': 1, 'label': '日本語', 'language': 'jp' },
      { 'selecteId': 2, 'label': '中文', 'language': 'cn' },
      { 'selecteId': 3, 'label': 'русский', 'language': 'ru' },
      { 'selecteId': 4, 'label': 'español', 'language': 'es' },
      { 'selecteId': 5, 'label': 'Português', 'language': 'pt' },
      { 'selecteId': 6, 'label': 'ไทย', 'language': 'th' },
      { 'selecteId': 7, 'label': 'Tiếng Việt', 'language': 'vn' },
      { 'selecteId': 8, 'label': '한국어', 'language': 'kr' }
    ]
    props.funcDefaultThis(this)
  }
  componentWillMount () {
    this.data.map(item => {
      if (this.props.localeData === item.language) {
        this.setState({ value: item.selecteId })
      }
    })
  }
  renderItem = (item) => {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
      color: 'rgba(255, 255, 255, 0.7)',
      textTransform: 'capitalize'
    }
    return (
      <List.Item>
        <Radio style={radioStyle} value={item.selecteId}>{item.label}
        </Radio>
      </List.Item>
    )
  }

  render () {
    const { t } = this.props
    return (
      <div className="sts-container">
        <div className="sts-header">
          <div className="sts-header-title">{t('language')}</div>
        </div>
        <div className="rc-scr-container-language" id="HBScrollBar">
          <RadioGroup onChange={this.props.changeLanguage} value={this.state.value}>
            <List
              dataSource={this.data}
              grid={{ gutter: 1, lg: 1, xl: 1 }}
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
