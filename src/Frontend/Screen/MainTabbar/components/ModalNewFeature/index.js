import React, { useState } from 'react'
import Slider from 'react-slick'
import Images from 'Assets/Image'
import { Checkbox } from 'antd'
import ReduxServices from 'Utils/globalRedux'

const ModalNewFeature = ({ data, id, parent }) => {
  const [isDontShowAgain, setChoose] = useState(false)
  const settings = {
    lazyLoad: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  }
  const renderFeatureItem = (arr) => {
    let list = []
    for (let i = 0; i < arr.length; i++) {
      list.push(<div className="feature-item" key={i}><img src={arr[i].imageUrl} /></div>)
    }
    return list
  }
  const onCheckDontShowAgain = (e) => {
    setChoose(e.target.checked)
    ReduxServices.saveReadNewFeature(id, e.target.checked)
  }
  return (
    <div className="feature-container">
      {
        data && data.length > 0 
          ? <Slider {...settings} >
            {renderFeatureItem(data)}
          </Slider>
          : null
      }
      <div className="feature-close" onClick={() => parent.refs.modalNewFeatures.hide()}>
        <img src={Images.ic_close} />
      </div>
      <div className="feature-dont-show">
        <Checkbox onChange={onCheckDontShowAgain} checked={isDontShowAgain}>{parent.props.t('Ethereum.dontShowAgain')}</Checkbox>
      </div>
    </div>
  )
}

export default ModalNewFeature
