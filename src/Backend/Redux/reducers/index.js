import * as globalReducers from './globalReducers'
import * as mainReducers from './mainReducers'
import * as sagaReducers from './sagaReducers'
import { routerReducer } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'
import { loadingBarReducer } from 'react-redux-loading-bar'

import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  ...globalReducers,
  ...mainReducers,
  ...sagaReducers,
  form: formReducer,
  router: routerReducer,
  loadingBar: loadingBarReducer
})

export default rootReducer
