import React from 'react'
import { formatPriceNumber } from 'Utils/globalFunction'

const FormatPrice = ({ price, decimals }) => {
  const firstNumber = formatPriceNumber(price, decimals).toString().split('.')[0]
  const secondNumber = formatPriceNumber(price, decimals).toString().split('.')[1]
  return (
    <div style={{display: 'inline-block'}}>
      <span className="exc-usd-first">{firstNumber}</span>
      <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
    </div>
  )
}

export default FormatPrice
