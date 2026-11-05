import React from 'react'

const BoxGameLite = ({ item, openDapp }) => {
  const isRating = item.totalRating >= 10 && item.avgRating > 0
  return (
    <div className="dapp-item" onClick={openDapp(item)}>
      <div className="dapp-thumbnail hoverWithBorder" style={{backgroundImage: "url('" + (item.logo || item.iconUrl) + "')"}}></div>
      <div className="dapp-name">{item.name}</div>
      { isRating ? <div className="dapp-vote">{item.avgRating}</div> : null }
    </div>
  )
}

export default BoxGameLite
