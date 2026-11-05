import React from 'react'
import HBImage from 'Frontend/Components/HBImage'
import Images from 'Assets/Image'

const BoxFavorite = ({ item, openDapp, removeFavorites }) => {
  const isRating = item.totalRating >= 10 && item.avgRating > 0
  return (
    <div className="dapp-favorite">
      <div className="dapp-remove" onClick={removeFavorites(item)}><img src={Images.ic_stop} alt=""/></div>
      <div className="dapp-item" onClick={openDapp(item)}>
        <div className="dapp-thumbnail"><HBImage logo={item.logo} iconUrl={item.iconUrl} addClass={'dapp-imgFavorite hoverWithBorder'}/></div>
        <div className="dapp-name">{item.name}</div>
        { isRating ? <div className="dapp-vote">{item.avgRating}</div> : null }
      </div>
    </div>
  )
}

export default BoxFavorite
