import React from 'react'
import { Button } from 'react-bootstrap'
import './styles.css'
import CoreLayoutContainer from '../../Container/CoreLayoutContainer'
import 'antd/dist/antd.css'

const backRoute = (handleBackRoute, history) => () => handleBackRoute(history)

const MainScreen = ({history, routeToCreate, routeToRestore, handleBackRoute, t}) => (
  <CoreLayoutContainer
    leftAction={backRoute(handleBackRoute, history)}
    title={t('languageSelect')}
  >
    <div className="viewBtn-language">
      <Button className="btn-init-screen btn-Inits-Size"
        onClick={() => routeToCreate(history)}>{t('createNewWallet')}</Button>
      <Button className="btn-init-screen margin-35 btn-Inits-Size"
        onClick={() => routeToRestore(history)}>{t('restoreWallet')}</Button>
    </div>
    <div className="txt-version">{t('titleVersion')}</div>
  </CoreLayoutContainer>
)

export default MainScreen
