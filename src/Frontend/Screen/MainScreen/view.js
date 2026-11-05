/**
* NAME: MainScreen
* CREATOR: Khiem Created
* Display Main Screen
*/
import React from 'react'
import { Button } from 'react-bootstrap'
import './styles.css'
import CoreLayoutContainer from '../../Container/CoreLayoutContainer'
import Images from 'Assets/Image'

const backRoute = (handleBackRoute, history) => () => handleBackRoute(history)
const createRoute = (routeToCreate, history) => () => routeToCreate(history)
const restoreRoute = (routeToRestore, history) => () => routeToRestore(history)

// |------------------------------|
// |--- RENDER MAIN VIEW START ---|
// |------------------------------|
const MainScreen = ({history, routeToCreate, routeToRestore, handleBackRoute, t}) => (
  <div className="ls-Head">
    <CoreLayoutContainer isFooter={true}
      leftAction={backRoute(handleBackRoute, history)}
      title={t('languageSelect')}
    >
      <div className="viewBtn-language">
        <div className="ms-wrap">
          <div className="ms-Img-title"><img className="ms-Img" src={Images.languageSelection}/></div>
          <div className="ms-wrap-btn">
            <Button className="btn-init-screen ms-btn btn-Inits-Size"
              onClick={createRoute(routeToCreate, history)}>{t('createNewWallet')}</Button>
            <Button className="btn-init-screen margin-35 ms-btn btn-Inits-Size"
              onClick={restoreRoute(routeToRestore, history)}>{t('restoreWallet')}</Button>
          </div>
        </div>
      </div>
    </CoreLayoutContainer>
  </div>
)

export default MainScreen
