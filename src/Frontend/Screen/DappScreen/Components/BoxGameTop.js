import React from 'react'

const BoxGameTop = ({ item, openDapp }) => {
  return (
    <div className="dapp-item" onClick={openDapp(item)}>
      <div className="dapp-name">{item.name}</div>
      <div className="dapp-thumbnail hoverWithBorder" style={{backgroundImage: "url('" + item.thumbnail + "')"}}></div>
    </div>
  )
}

export default BoxGameTop
