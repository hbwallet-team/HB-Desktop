import View from './view'
import { connect } from 'react-redux'
import * as mapActionsToProps from './actions'
import { translate } from 'react-i18next'
const mapStateToProps = (state) => ({
  ...state
})

export default translate('translations')(connect(mapStateToProps, mapActionsToProps)(View))
