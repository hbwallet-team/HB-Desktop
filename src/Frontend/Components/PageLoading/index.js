import React from 'react'
import './styles.css'

const PageLoading = () => {
  return (
    <div className="page-loading-container">
      <div className="e-loadholder">
        <div className="m-loader">
          <span className="e-text">Loading</span>
        </div>
      </div>
      <div id="particleCanvas-Blue"></div>
      <div id="particleCanvas-White"></div>
    </div>
  )
}

export default PageLoading
