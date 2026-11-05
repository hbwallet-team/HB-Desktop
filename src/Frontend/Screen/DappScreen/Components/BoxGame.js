import React from 'react'
import HBImage from 'Frontend/Components/HBImage'

const BoxGame = ({ item, rank, isRanking, openDapp }) => {
  const isRating = item.totalRating >= 10 && item.avgRating > 0
  return (
    <div className="dapp-item-full" onClick={openDapp(item)}>
      <div className="dapp-thumbnail"><HBImage logo={item.logo} iconUrl={item.iconUrl} addClass={'hoverWithBorder'}/></div>
      <div className="dapp-content">
        { isRanking ? <div className="dapp-rank">{rank + 1}</div> : null }
        <div className="dapp-name">{item.name}</div>
        <div className="dapp-description">{item.description && item.description.length > 0 ? item.description.replace(/\\n/g, '') : item.teaser}</div>
      </div>
      { isRating ? <div className="dapp-vote">{item.avgRating}</div> : null }
    </div>
  )
}

export default BoxGame
