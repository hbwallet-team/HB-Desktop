export const routeToCreate = (history) => {
  return (dispatch, getState) => {
    history.push('/termsServiceScreen')
  }
}

export const routeToRestore = (history) => {
  return (dispatch, getState) => {
    history.push('/restoreWalletScreen')
  }
}
