import React, { PureComponent } from 'react'
import './styles.css'
import Radium, { StyleRoot } from 'radium'
import { fadeIn } from 'react-animations'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setInternet } from '../../../Backend/Redux/actions/mainActions'

class TabLayoutContainer extends PureComponent {
  checkInternet (internet) {
    console.log('internet ', internet)
    this.props.internetData !== internet && this.props.setInternet(internet)
  }

  render () {
    const {
      children, topLeft, topRight,
      centerRight, isCenterRight = true,
      ScreenAnimation,
      disableAminationScreen,
      timeAmintionScreen = 1,
      topLeftHeight,
      topRightHeight
    } = this.props

    const ScreenAnimationDefault = {
      animation: 'x ' + timeAmintionScreen + 's',
      animationName: Radium.keyframes(fadeIn, 'fadeIn')
    }

    return (
      <StyleRoot className="styleRoot-container">
        <div style={disableAminationScreen ? null : ScreenAnimation || ScreenAnimationDefault} className="styleRoot-container">
          <div className="tabContainer">
            <div className="container-left">
              {topLeft && <div className="top-left" style={{height: topLeftHeight}}>{topLeft}</div>}
              <div className="center-left" style={topLeftHeight ? {height: 'calc(100% - ' + topLeftHeight + 'px)'} : {}}>
                {children}
              </div>
            </div>
            <div className='container-right'>
              {topRight && <div className="top-right" style={{height: topRightHeight}}>{topRight}</div>}
              {isCenterRight && <div className="center-right" style={topLeftHeight ? {height: 'calc(100% - ' + topRightHeight + 'px)'} : {}}>{centerRight}</div>}
            </div>
          </div>
        </div>
      </StyleRoot>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => {
  return {
    setInternet: bindActionCreators(setInternet, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TabLayoutContainer)
