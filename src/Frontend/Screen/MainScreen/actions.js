export const routeToCreate = (history) => {
  return (dispatch, getState) => {
    history.push(`/termsServiceScreen/${null}`)
  }
}

export const routeToRestore = (history) => {
  return (dispatch, getState) => {
    history.push('/restoreScreen')
  }
}

export const handleBackRoute = (history) => {
  return (dispatch, getState) => {
    history.push('/languageScreen')
  }
}
