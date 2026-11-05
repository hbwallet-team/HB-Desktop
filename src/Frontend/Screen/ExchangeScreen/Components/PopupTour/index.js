import React from 'react'
import Draggable from 'react-draggable'
import 'rc-slider/assets/index.css'

const PopupTour = ({ THIS }) => {
  const { settingUrls } = THIS.props
  let linkURL = ''
  if (settingUrls && settingUrls.tourUrl) {
    let linksettingUrls = settingUrls.tourUrl.toString()
    let getId = (url) => {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      var match = url.match(regExp)
      if (match && match[2].length === 11) {
        return match[2]
      } else {
        return 'error'
      }
    }
    let videoId = getId(linksettingUrls)
    let hostPath = 'https://www.youtube.com/embed/'
    linkURL = hostPath.concat(videoId)
    console.log('linkURL: ', linkURL)
  }
  return (
    <Draggable handle={'.pp-wrap-amount-header'}>
      <iframe
        width="898"
        height="505"
        src={linkURL || ''}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture">
      </iframe>
    </Draggable>
  )
}

export default PopupTour
