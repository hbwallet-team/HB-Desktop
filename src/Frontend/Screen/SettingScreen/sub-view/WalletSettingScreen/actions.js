import DexAPI from 'Backend/Api/services/DexAPI'
import { setCard, setToken } from 'Backend/Redux/actions/globalActions'
import Observer from 'Utils/HBObserver'
import { OBSERVER_KEY } from 'Utils/globalConstants'
import { filterMainAccount } from 'Utils/globalFunction'
var THIS

export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const onClickCard = (card) => {
  return (dispatch, getState) => {
    if (card.isMain) return
    const { arrCardData } = THIS.props
    arrCardData.map(c => c === card && (c.isEnable = !card.isEnable))
    dispatch(setCard(arrCardData))
    THIS.forceUpdate()
  }
}

export const onClickToken = (token) => {
  return async (dispatch, getState) => {
    const { arrTokenData, arrCardData, internetData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      let res = await DexAPI.enabledToken(mainAccount.address, token.address, !token.isEnabled)
      if (res) {
        arrTokenData.map(t => t === token && (t.isEnabled = !token.isEnabled))
        dispatch(setToken(arrTokenData))
        THIS.forceUpdate()
      }
    }
  }
}

export const deleteToken = (token) => {
  return (dispatch, getState) => {
    THIS.tokenDelete = token
    THIS.refs.md_mab_confirm.show()
  }
}

export const confirmDelete = () => {
  return async (dispatch, getState) => {
    const { arrCardData, arrTokenData, internetData } = THIS.props
    const mainAccount = filterMainAccount(arrCardData)
    if (internetData) {
      let res = await DexAPI.deleteToken(mainAccount.address, THIS.tokenDelete.address, 'true')
      if (res) {
        let arrTemp = arrTokenData.filter(t => t !== THIS.tokenDelete)
        dispatch(setToken(arrTemp))
        THIS.forceUpdate()
        THIS.refs.md_mab_confirm.hide()
      }
    }
  }
}
export const hideMdConfirm = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm.hide()
  }
}

export const hideMdEdit = () => {
  return (dispatch, getState) => {
    THIS.refs.md_edit_token.hide()
  }
}

export const onClickEditToken = (token) => {
  return (dispatch, getState) => {
    THIS.setState({
      tokenEdit: token
    })
    THIS.refs.md_edit_token.show()
  }
}

export const onClickAddCustomToken = () => {
  return (dispatch, getState) => {
    Observer.emit(OBSERVER_KEY.SELECT_TAB_ADD_TOKEN)
  }
}

export const closeSwitchAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_switch_account.hide()
  }
}

export const switchAccount = (card) => {
  return (dispatch, getState) => {
    THIS.setState({
      accountSelected: card
    }, () => {
      THIS.refs.md_switch_account.show()
    })
  }
}

export const editAccount = (card) => {
  return (dispatch, getState) => {
    THIS.setState({
      accountSelected: card
    }, () => {
      THIS.refs.md_edit_account.show()
    })
  }
}

export const closeEditAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_edit_account.hide()
  }
}

export const closeDeleteAccountModal = () => {
  return (dispatch, getState) => {
    THIS.refs.md_delete_account.hide()
  }
}

export const removeAccount = (card) => {
  return (dispatch, getState) => {
    THIS.setState({
      accountSelected: card
    }, () => {
      THIS.refs.md_delete_account.show()
    })
  }
}
