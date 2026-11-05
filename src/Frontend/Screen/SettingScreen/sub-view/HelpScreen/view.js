import React from 'react'
import { Collapse } from 'antd'
import './styles.css'
const Panel = Collapse.Panel

const SECTIONS1 = [
  { key: 0, title: 'HelpContent.title1', content: ['HelpContent.content1-1', 'HelpContent.content1-2', 'HelpContent.content1-3', 'HelpContent.content1-4', 'HelpContent.content1-5', 'HelpContent.content1-6'] },
  { key: 1, title: 'HelpContent.title2', content: ['HelpContent.content2-1', 'HelpContent.content2-2', 'HelpContent.content2-3', 'HelpContent.content2-4'] },
  { key: 2, title: 'HelpContent.title3', content: ['HelpContent.content3-1', 'HelpContent.content3-2', 'HelpContent.content3-3', 'HelpContent.content3-4', 'HelpContent.content3-5'] },
  { key: 3, title: 'HelpContent.title4', content: ['HelpContent.content4-1', 'HelpContent.content4-2', 'HelpContent.content4-3', 'HelpContent.content4-4', 'HelpContent.content4-5'] },
  { key: 4, title: 'HelpContent.title5', content: ['HelpContent.content5-1', 'HelpContent.content5-2', 'HelpContent.content5-3'] },
  { key: 5, title: 'HelpContent.title6', content: ['HelpContent.content6-1', 'HelpContent.content6-2'] },
  { key: 6, title: 'HelpContent.title7', content: ['HelpContent.content7-1', 'HelpContent.content7-2'] },
  { key: 7, title: 'HelpContent.title8', content: ['HelpContent.content8-1', 'HelpContent.content8-2'] },
  { key: 8, title: 'HelpContent.title9', content: ['HelpContent.content9-1', 'HelpContent.content9-2'] },
  { key: 9, title: 'HelpContent.title10', content: ['HelpContent.content10-1', 'HelpContent.content10-2'] },
  { key: 10, title: 'HelpContent.title11', content: ['HelpContent.content11'] },
  { key: 11, title: 'HelpContent.title12', content: ['HelpContent.content12-1', 'HelpContent.content12-2', 'HelpContent.content12-3', 'HelpContent.content12-4', 'HelpContent.content12-5'] },
  { key: 12, title: 'HelpContent.title13', content: ['HelpContent.content13-1', 'HelpContent.content13-2'] }]
const SECTIONS2 = [
  { key: 13, title: 'HelpContent.title14', content: ['HelpContent.content14'] },
  { key: 14, title: 'HelpContent.title15', content: ['HelpContent.content15'] },
  { key: 15, title: 'HelpContent.title16', content: ['HelpContent.content16'] },
  { key: 16, title: 'HelpContent.title17', content: ['HelpContent.content17'] },
  { key: 17, title: 'HelpContent.title18', content: ['HelpContent.content18-1', 'HelpContent.content18-2'] },
  { key: 18, title: 'HelpContent.title19', content: ['HelpContent.content19'] },
  { key: 19, title: 'HelpContent.title20', content: ['HelpContent.content20-1', 'HelpContent.content20-2', 'HelpContent.content20-3'] },
  { key: 20, title: 'HelpContent.title21', content: ['HelpContent.content21'] },
  { key: 21, title: 'HelpContent.title22', content: ['HelpContent.content22'] },
  { key: 22, title: 'HelpContent.title23', content: ['HelpContent.content23'] },
  { key: 23, title: 'HelpContent.title24', content: ['HelpContent.content24'] }
]

export default class View extends React.Component {
  render () {
    const { t } = this.props

    return (
      <div className="wrap-helpScreen">
        <div className="sts-header">
          <div className="sts-header-title">{t('Help')}</div>
        </div>
        <div className="wrap-hlp-container">
          <div className="hlp-container" id="HBScrollBar">
            <div className="hlp-sub-container">
              <div className="hlp-container-left">
                <Collapse className="ws-collapse-left" bordered={false}>
                  {SECTIONS1.map(s => {
                    return (
                      <Panel className="hlp-coll-panel" header={t(s.title)} key={s.key}>
                        {s.content.map((a, index) => {
                          return (<div key={index} className="hlp-row-content">{t(a)}</div>)
                        })}
                      </Panel>
                    )
                  })}
                </Collapse>
              </div>
              <div className="hlp-container-right">
                <Collapse className="ws-collapse-left" bordered={false}>
                  {SECTIONS2.map(s => {
                    return (
                      <Panel className="hlp-coll-panel" header={t(s.title)} key={s.key}>
                        {s.content.map((a, index) => {
                          return (<div key={index} className="hlp-row-content">{t(a)}</div>)
                        })}
                      </Panel>
                    )
                  })}
                </Collapse>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
