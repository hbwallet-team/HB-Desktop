import React from 'react'
import ApplyForAirdropScreen from 'Frontend/Screen/SettingScreen/sub-view/ApplyForAirdropScreen'
import Images from 'Assets/Image'

const ApplyForAirdrop = ({ backToTop, t }) => {
  return (
    <div className="gt-apply-airdop">
      <button className="exs-btn-Back" onClick={backToTop}>
        <img className="img-back" alt='imgBack' src={Images.tabNaviBack} />
        {t('Airdrop')}
      </button>
      <ApplyForAirdropScreen />
    </div>
  )
}

export default ApplyForAirdrop
