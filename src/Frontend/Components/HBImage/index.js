import React from 'react'
import Image from 'Assets/Image'

export default class HBImage extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      checkLoadedImage: false
    }
  }
  render () {
    const { checkLoadedImage } = this.state
    let loadedImage = this.props.logo || this.props.iconUrl
    let imgDefault = this.props.imgDefault ? this.props.imgDefault : Image.ic_dappGame_default
    const addDefaultSrc = (e) => {
      e.target.src = imgDefault
    }
    const onLoadImg = () => {
      this.setState({
        checkLoadedImage: true
      })
    }
    return (
      <div>
        <img onError={(e) => addDefaultSrc(e)} src={checkLoadedImage ? loadedImage : imgDefault} onLoad={() => onLoadImg()} className={this.props.addClass} alt="hb"/>
      </div>
    )
  }
}
