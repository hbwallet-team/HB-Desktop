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
      <div className="sts-container os-edit-content">
        <div className="sts-header">
          <div className="sts-header-title">{t('operationSystem')}</div>
        </div>
        <div className="os-container">
          <div className="os-item">
            <div className="os-win">{t('os.WINDOWS')}</div>
            <div className="os-win-title">
              <div className="os-win-title1">{t('os.OS')}</div>
              <div className="os-win-title2">{t('os.CPU')}</div>
              <div className="os-win-title3">{t('os.MEMORY')}</div>
              <div className="os-win-title4">{t('os.HARDDISK')}</div>
            </div>
            <div className="os-win-content">
              <div className="os-win-block1">
                <div className="os-win-block1a">
                  <div className="os-win-block1a-title">{t('os.Windows10')}</div>
                  <div className="os-win-block1a-content">{t('os.Windows10c')}</div>
                </div>
                <div className="os-win-block1a">
                  <div className="os-win-block1a-title">{t('os.Windows8')}</div>
                  <div className="os-win-block1a-content">{t('os.Windows8c')}</div>
                </div>
                <div className="os-win-block1a">
                  <div className="os-win-block1a-title">{t('os.Windows7')}</div>
                  <div className="os-win-block1a-content">{t('os.Windows7c')}</div>
                </div>
              </div>
              <div className="os-win-block2">
                <div className="os-win-block2a">
                  <div className="os-win-block2a-title">{t('os.From4GHz')}</div>
                </div>
              </div>
              <div className="os-win-block3">
                <div className="os-win-block3a">
                  <div className="os-win-block3a-title">{t('os.From2GB')}</div>
                </div>
                <div className="os-win-block3b">
                  <div className="os-win-block3a-title"><span>{t('os.32bit')}</span>{t('os.32bitc')}</div>
                  <div className="os-win-block3a-content"><span>{t('os.64bit')}</span>{t('os.64bitc')}</div>
                </div>
              </div>
              <div className="os-win-block4">
                <div className="os-win-block4a">
                  <div className="os-win-block4a-title">{t('os.ofFreeSpace')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="os-item mb-32">
            <div className="os-win">{t('os.Mac')}</div>
            <div className="os-win-title">
              <div className="os-win-title1">{t('os.OS')}</div>
              <div className="os-win-title2">{t('os.CPU')}</div>
              <div className="os-win-title3">{t('os.MEMORY')}</div>
              <div className="os-win-title4">{t('os.HARDDISK')}</div>
            </div>
            <div className="os-win-content">
              <div className="os-win-block1">
                <div className="os-win-block1a">
                  <div className="os-win-block1a-title">{t('os.macOSMojave')}</div>
                  <div className="os-win-block1a-content">{t('os.macOSMojave2')}</div>
                </div>
                <div className="os-win-block1a">
                  <div className="os-win-block1a-title">{t('os.macOSHighSierra')}</div>
                  <div className="os-win-block1a-content">{t('os.macOSHighSierra2')}</div>
                </div>
                <div className="os-win-block1a">
                  <div className="os-win-block1a-title">{t('os.macOSSierra')}</div>
                  <div className="os-win-block1a-content">{t('os.macOSSierra2')}</div>
                </div>
              </div>
              <div className="os-win-block2">
                <div className="os-win-block2a">
                  <div className="os-win-block2a-title">{t('os.IntelProcessor')}</div>
                </div>
              </div>
              <div className="os-win-block3">
                <div className="os-win-block3c">
                  <div className="os-win-block3a-title">{t('os.From4GB')}</div>
                </div>
              </div>
              <div className="os-win-block4">
                <div className="os-win-block4a">
                  <div className="os-win-block4a-title">{t('os.ofFreeSpace2')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
