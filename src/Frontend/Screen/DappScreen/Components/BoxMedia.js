import React from 'react'
import moment from 'moment'
import HBImage from 'Frontend/Components/HBImage'

const BoxMedia = ({ item, openLink }) => {
  return (
    <div>
      <div className="boxM-item" onClick={openLink(item.link)}>
        <div className="boxM-thumbnail">
          <HBImage logo={item.image} addClass={'hoverWithBorder'}/>
        </div>
        <div className="boxM-wrap">
          <div className="boxM-pubDate">
            {moment(item.pubDate).format('YYYY/MM/DD HH:mm')}
          </div>
          <div className="boxM-title">{item.title}</div>
          <div className="boxM-description">{item.description}</div>
        </div>
      </div>
    </div>
  )
}

export default BoxMedia
