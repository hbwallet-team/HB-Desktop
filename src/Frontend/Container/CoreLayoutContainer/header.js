import React from 'react'
import { Button } from 'react-bootstrap'
import './styles.css'
import Images from '../../../Assets/Image'

const btnBack = ({title, leftAction}) => {
  const leftActionHeader = (action) => action

  return (
    <Button className="btn-Back" onClick={leftActionHeader(leftAction)}>
      <img className="img-back"
        alt='imgBack'
        src={Images.tabNaviBack} />
      {title}
    </Button>
  )
}

export default btnBack
