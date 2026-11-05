import ReduxServices from 'Utils/globalRedux'
import swal from 'sweetalert2'
import { getWalletByPrivateKey } from 'Backend/Lib/Web3/index'
import { validateSpace, triggerSendEventToAllWindow, checkKanjiCharacter } from 'Utils/globalFunction'
import { LIMIT_NUMBER } from 'Utils/globalConstants'
import { setDexTokenFavorite } from 'Backend/Redux/actions/globalActions'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const onChangePrivateKey = (newPrivateKey) => {
  return async (dispatch, getState) => {
    const { arrCardData } = THIS.props
    let existPrivateKey = false
    let invalidPrivateKey = false
    let ethWallet = null
    if (validateSpace(newPrivateKey)) {
      if (arrCardData.find(item => newPrivateKey === item.privateKey)) {
        existPrivateKey = true
      } else {
        const privateKeyFull = !newPrivateKey.includes('0x') ? '0x' + newPrivateKey : newPrivateKey
        const wallet = await getWalletByPrivateKey(privateKeyFull)
        if (wallet) {
          ethWallet = wallet
        } else {
          invalidPrivateKey = true
        }
      }
    }
    THIS.setState({
      strPrivateKey: newPrivateKey,
      ethWallet,
      existPrivateKey,
      invalidPrivateKey
    }, () => {
      THIS.props.checkOpenImport()
    })
  }
}

export const checkOpenImport = () => {
  return (dispatch, getState) => {
    const { strPrivateKey, existPrivateKey, invalidPrivateKey } = THIS.state
    if (strPrivateKey.length > 0 && !existPrivateKey && !invalidPrivateKey) {
      THIS.setState({
        isDisabledImport: false
      })
    } else {
      THIS.setState({
        isDisabledImport: true
      })
    }
  }
}

export const clearPrivateKey = () => {
  return (dispatch, getState) => {
    THIS.setState({
      strPrivateKey: ''
    })
  }
}

export const openModalImport = () => {
  return (dispatch, getState) => {
    THIS.refs.modalImport.show()
  }
}

export const closeModalImport = () => {
  return (dispatch, getState) => {
    THIS.refs.modalImport.hide()
  }
}

export const onChangeAccountName = (newAccountName) => {
  return (dispatch, getState) => {
    const { strAccountName } = THIS.state
    const { arrCardData } = THIS.props
    let accountName = ''
    let existAccountName = false
    if (validateSpace(newAccountName)) {
      accountName = newAccountName
      if (checkKanjiCharacter(newAccountName) > LIMIT_NUMBER.CARD_NAME) {
        accountName = strAccountName
      }
      let arrFilterName = []
      arrCardData.map(item => arrFilterName.push(item.cardName))
      if (arrFilterName.includes(accountName)) {
        existAccountName = true
      }
    } else {
      accountName = ''
    }
    THIS.setState({
      existAccountName, 
      strAccountName: accountName
    }, () => {
      THIS.props.checkOpenDone()
    })
  }
}

export const checkOpenDone = () => {
  return (dispatch, getState) => {
    const { strAccountName, existAccountName } = THIS.state
    if (strAccountName.length > 0 && !existAccountName) {
      THIS.setState({
        isDisabledDone: false
      })
    } else {
      THIS.setState({
        isDisabledDone: true
      })
    }
  }
}

export const onChangeNewAccountType = (e) => {
  return (dispatch, getState) => {
    THIS.setState({
      setIsMainAccount: e.target.value
    })
  }
}

export const handleImportAccount = () => {
  return (dispatch, getState) => {
    const { strAccountName, ethWallet, setIsMainAccount, isDisabledDone } = THIS.state
    const { arrCardData, isModal, onCloseModal, parent, t } = THIS.props
    if (isDisabledDone) {
      return
    }
    THIS.setState({
      isImporting: true,
      isDisabledDone: true
    }, () => {
      let newKey = arrCardData[arrCardData.length - 1].key + 1
      ReduxServices.importAccount(ethWallet, newKey, strAccountName, setIsMainAccount).then((newCardData) => {
        // trigger send event to all windows
        triggerSendEventToAllWindow('import-account', newCardData)
        // trigger send event to all windows
        const newCard = newCardData.find(e => e.address.toLowerCase() === ethWallet.address.toLowerCase())
        setIsMainAccount && triggerSendEventToAllWindow('switched-account', newCard)
        swal({
          text: t('Ethereum.importedSuccessfully'),
          width: '250px',
          type: 'success',
          timer: 5000,
          showConfirmButton: false
        })
        THIS.setState({
          strPrivateKey: '',
          strAccountName: '',
          invalidPrivateKey: false,
          existPrivateKey: false,
          existAccountName: false,
          isDisabledImport: true,
          isDisabledDone: true,
          isImporting: false,
          ethWallet: null,
          setIsMainAccount: true
        })
        THIS.refs.modalImport && THIS.refs.modalImport.hide()
        isModal && parent.refs.modalImportAccount && onCloseModal()
        setIsMainAccount && dispatch(setDexTokenFavorite({
          isLoading: true,
          datas: []
        }))
      })
    })
  }
}
