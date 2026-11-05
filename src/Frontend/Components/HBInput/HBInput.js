
import React from 'react'
import './styles.css'
import Radium, { StyleRoot } from 'radium'
import { fadeInDown } from 'react-animations'

const TextErrorAnimationDown = {
  animation: 'x ' + 0.5 + 's',
  animationName: Radium.keyframes(fadeInDown, 'fadeInDown')
}

const HBInput = ({
  className, isError,
  id = 'txt', value = '',
  onChange, placeholder,
  icon, iconLeft, min, max, type,
  onClickIcon, onFocus = () => {}, onBlur = () => {},
  onKeyPress = () => {},
  symbol, isSuccess = false, isErrBorderBottom = true,
  messageError = '',
  countMax,
  readOnly,
  isSpacing,
  autoFocus,
  inputStyles,
  textSymbol, children,
  symbolGwei
}) => {
  const spacingLeft = (iconLeft ? ' spacing-left ' : ' ')
  const spacingRight = (icon && symbol ? ' spacing-right-2 '
    : icon || symbol ? ' spacing-right-1 '
      : ' ')

  const stylesContainer = 'hb-input-button-container ' + className + (isError ? ' hb-input-button-container-error' : '')
  const tylesInput = inputStyles + (isError ? (isErrBorderBottom ? (isSuccess ? ' input-success no-spinner' : ' input-error no-spinner') : ' normal-input no-spinner') : ' normal-input no-spinner') + spacingLeft + spacingRight + ' ' + symbolGwei
  //  const tylesInput = (isError ? ' input-error' : ' normal-input') + spacingRight
  const errorStyle = (isError ? ' hb-input-button-mess-In  ' : '') + ' hb-input-button-error-mess'
  const clickToImg = () => {
    onClickIcon && onClickIcon()
  }

  return (
    <div className={stylesContainer}>
      <div className="hb-input-button">
        <div className="hb-input-button-left">
          {iconLeft && <div id="btnScale-active"
            className="hb-imput-button-icon-containt">
            <img className="hb-imput-button-icon" alt="img" src={iconLeft}/>
          </div>}
        </div>
        <input
          autoFocus={autoFocus}
          placeholder={placeholder}
          id={id}
          readOnly={readOnly}
          type={ type || 'text'}
          min= {min} max={max}
          className={tylesInput}
          value={value}
          onKeyPress={event => {
            onKeyPress(event.key)
          }}
          onChange={event => {
            onChange(event.target.value)
          }}
          onFocus={event => {
            onFocus(event)
          }}
          onBlur={event => {
            onBlur(event)
          }}
        />
        <div className="hb-input-button-right">
          {symbol && <div className={'hb-input-button-symbol ' + textSymbol}>{symbol}</div>}
          {icon && <div id="btnScale-active"
            onClick={() => readOnly ? console.log('') : clickToImg()}
            className="hb-imput-button-icon-containt">
            <img className="hb-imput-button-icon" alt="img" src={icon}/>
          </div>}
        </div>
      </div>
      {((isError && messageError) || countMax || isSpacing) &&
        <div className="hb-input-button-bottom">
          <div className= {isSuccess ? 'hb-input-button-success' : 'hb-input-button-error'}>
            <StyleRoot className="styleRoot-container">
              <div style={isError ? TextErrorAnimationDown : null} className="styleRoot-container">
                <div className={errorStyle}>{isError ? messageError : ''}</div>
              </div>
            </StyleRoot>
          </div>
          <div className="hb-input-button-countMax">{countMax && (value.length + '/' + countMax)}</div>
        </div>
      }
      {children}
    </div>
  )
}

export default HBInput
