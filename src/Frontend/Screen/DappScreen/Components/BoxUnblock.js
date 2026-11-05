import React from 'react'
import moment from 'moment'
import HBImage from 'Frontend/Components/HBImage'

const BoxUnblock = ({ item, openLink }) => {
  return (
    <div>
      <div className="boxM-item" onClick={openLink(item.url)}>
        <div className="boxM-thumbnail">
          <HBImage logo={item.meta_data.post_thumbmail_image} addClass={'hoverWithBorder'}/>
        </div>
        <div className="boxM-wrap">
          <div className="boxM-pubDate">{moment(item.post_date).format('YYYY/MM/DD HH:mm')}</div>
          <div className="boxM-title">{item.post_title}</div>
          <div className="boxM-description">{item.post_content}</div>
        </div>
      </div>
    </div>
  )
}

export default BoxUnblock
