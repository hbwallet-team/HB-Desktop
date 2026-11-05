
import React from 'react'
import PropTypes from 'prop-types'
import './styles.css'

const Spin = ({ color, size }) => {
  const styles = {
    marginLeft: -(size / 2),
    marginTop: -(size / 2),
    borderTopColor: color,
    width: size,
    height: size
  }
  return (
    <div className="spin-container">
      <div className="spinner" style={styles}></div>
    </div>
  )
}

Spin.defaultProps = {
  color: '#07d',
  size: 30
}

Spin.propTypes = {
  /**
   * The color of the spinner.
   */
  color: PropTypes.string,
  /**
   * The size of the spinner.
   */
  size: PropTypes.number
}

export default Spin
