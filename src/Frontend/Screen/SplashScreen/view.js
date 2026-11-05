/**
* NAME: SplashScreen
* CREATOR: Khiem Created
* Display Splash Screen
*/
import React, { PureComponent } from 'react'
// Style
import './styles.css'
import Images from 'Assets/Image'

export default class SplashScreen extends PureComponent {
  constructor (props) {
    super(props)
    props.checkInternet(this)
    this.isON = true
  }

  componentDidMount () {
    this.props.loadingInitial(this)
  }

  // |------------------------------|
  // |--- RENDER MAIN VIEW START ---|
  // |------------------------------|
  render () {
    return (
      <div className="window">
        <video autoPlay muted className="splashIntro">
          <source src={Images.splashScreen} type="video/mp4" />
        </video>
      </div>
      // <div className="window">
      //   <div className="window-content">
      //     <div className='splashText'>BLOCKCHAIN INTERFACE</div>
      //     <img className="img-Background"
      //       src={Images.imgGB} alt="img"/>
      //   </div>
      // </div>
    )
  }
}
