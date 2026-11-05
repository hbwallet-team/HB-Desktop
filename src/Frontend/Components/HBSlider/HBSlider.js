import React from 'react'
import { Slider } from 'antd'
import './styles.css'
import Radium, { StyleRoot } from 'radium'
import { fadeInDown } from 'react-animations'

const TextErrorAnimationDown = {
  animation: 'x ' + 0.5 + 's',
  animationName: Radium.keyframes(fadeInDown, 'fadeInDown')
}

const sliderTip = (value) => {
  return `${value}%`
}
// marginLeft: '-39%',  marginLeft: '-49%'

const sliderMarks = (t) => {
  return {
    0: {
      style: {
        color: '#fff',
        marginLeft: '0%',
        textAlign: 'left',
        left: ' 0%'
      },
      label: t('Slower')
    },
    100: {
      style: {
        color: '#fff',
        width: '100%',
        paddingRight: '2px',
        textAlign: 'right',
        marginLeft: '0%',
        left: '0%'
      },
      label: t('Faster')
    }
  }
}

const HBSlider = ({t, onAfterChangeSlide, isFeeErr, messageErr, sliderValue = 100}) => {
  const errorStyle = (isFeeErr ? 'hb-input-button-mess-In' : '') + 'hb-slider-error-mess'

  return (
    <div>
      <Slider
        className={isFeeErr ? 'hb-sliderErr' : 'hb-slider'}
        tipFormatter={sliderTip}
        marks={sliderMarks(t)}
        step={10}
        max={150}
        min={50}
        defaultValue={sliderValue}
        onAfterChange={onAfterChangeSlide}
      />
      <StyleRoot className="styleRoot-container">
        <div style={isFeeErr ? TextErrorAnimationDown : null} className="styleRoot-container">
          <div id="hbslider-errMessage" className={errorStyle}>{messageErr}</div>
        </div>
      </StyleRoot>
    </div>
  )
}

export default HBSlider
