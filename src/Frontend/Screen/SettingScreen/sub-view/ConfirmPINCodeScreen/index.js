import SettingScreen from './view'
import { connect } from 'react-redux'
import * as mapActionsToProps from './actions'

const mapStateToProps = (state) => ({
  ...state
})

export default (connect(mapStateToProps, mapActionsToProps)(SettingScreen))
