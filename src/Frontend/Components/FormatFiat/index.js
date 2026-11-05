import React from 'react'
import { formatFiatDisplay } from 'Utils/globalFunction'

const FormatFiat = ({ balance, decimals }) => {
  const { firstNumber, secondNumber } = formatFiatDisplay(balance, decimals)
  return (
    <div style={{display: 'inline-block'}}>
      <span className="exc-usd-first">{firstNumber}</span>
      <span className="exc-usd-second">{secondNumber ? '.' + secondNumber : ''}</span>
    </div>
  )
}

export default FormatFiat
