import { setAddressBook } from 'Backend/Redux/actions/globalActions'
import swal from 'sweetalert2'
import { validateAddress } from 'Utils/globalFunction'
var THIS

export const funcDefautlThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const filter = (strFilter, txtSearch) => {
  return (dispatch, getState) => {
    const { arrAddressBook } = THIS.props

    let arrTemp = arrAddressBook.filter(account =>
      (account.symbol === strFilter) &&
      (account.name.toLowerCase().includes(txtSearch))
    )
    THIS.setState({arrSearch: arrTemp})
  }
}

export const onChangeDropdown = (item) => {
  return (dispatch, getState) => {
    const { txtSearch } = THIS.state
    console.log('onChangeDropdown: ', item, item.key)
    THIS.setState({ strFilter: item.item.props.title })
    THIS.props.filter(item.item.props.title, txtSearch)
  }
}

export const onChangeTxt = (value) => {
  return (dispatch, getState) => {
    const { strFilter } = THIS.state

    THIS.setState({ txtSearch: value })
    THIS.props.filter(strFilter, value)
  }
}

export const showMdAddAddress = () => {
  return (dispatch, getState) => {
    THIS.setState({txtAccount: '',
      txtAccountName: '',
      isExistAddress: false,
      isAccountError: false,
      isAccountNameError: false,
      isEditAccount: false
    })
    THIS.refs.md_mab_add_address.show()
  }
}

export const registerAccountBook = () => {
  return (dispatch, getState) => {
    const { strFilter, txtAccount, txtAccountName,
      isAccountError, txtSearch, isEditAccount,
      AccountSelected } = THIS.state
    const { arrAddressBook, t } = THIS.props

    let error = false

    if (txtAccountName.trim().length === 0) {
      error = true
      THIS.setState({isAccountNameError: true})
    }

    if (txtAccount.length === 0 || isAccountError || error) {
      return
    }
    let newAccount = {
      name: txtAccountName,
      address: txtAccount,
      symbol: strFilter
    }

    if (isEditAccount) {
      THIS.setState({isEditAccount: false})
      let arrTemp = arrAddressBook.filter(item => item !== AccountSelected)
      arrTemp.push(newAccount)
      dispatch(setAddressBook(arrTemp))
      arrTemp = arrTemp.filter(account =>
        (account.symbol === strFilter) &&
        (account.name.toLowerCase().includes(txtSearch))
      )
      THIS.setState({arrSearch: arrTemp})
      swal({
        width: '250px',
        text: t('EditAddressBook'),
        type: 'success',
        timer: 5000,
        showConfirmButton: false
      })
    } else {
      arrAddressBook.push(newAccount)
      dispatch(setAddressBook(arrAddressBook))
      THIS.props.filter(strFilter, txtSearch)
      swal({
        width: '250px',
        text: t('AddAddressBook'),
        type: 'success',
        timer: 5000,
        showConfirmButton: false
      })
    }

    THIS.refs.md_mab_add_address.hide()
  }
}

export const onChangeTxtAccount = (txtAccount) => {
  return (dispatch, getState) => {
    const { arrAddressBook, t } = THIS.props
    // Check valid format address ethereum
    if (!validateAddress(txtAccount)) {
      // Clear data and error when no input
      if (txtAccount.length === 0) {
        THIS.setState({
          isAccountError: false,
          txtAccount: ''
        })
      } else {
      // remove input when error
        THIS.setState({ 
          txtAccount,
          isAccountError: true,
          accountErrorMsg: t('AccountErrorMsg')
        })
      }
    } else {
      if (!(txtAccount.startsWith('0x') && txtAccount.length === 42)) {
        THIS.setState({ 
          txtAccount, 
          isAccountError: true,
          accountErrorMsg: t('AccountErrorMsg')
        })
      } else if (isExistAccount(txtAccount, arrAddressBook)) {
        THIS.setState({ 
          txtAccount, 
          isAccountError: true,
          accountErrorMsg: t('AccountExist')
        })
      } else {
      // Final fail checking
        THIS.setState({
          txtAccount,
          isAccountError: false
        })
      }
    }
  }
}

const isExistAccount = (address, arrAddressBook) => {
  for (let i = 0; i < arrAddressBook.length; i++) {
    if (arrAddressBook[i].address === address) {
      return true
    }
  }
  return false
}

export const onClickAccount = (item) => {
  return (dispatch, getState) => {
    THIS.setState({
      AccountSelected: item,
      activeCopied: false
    })
    // THIS.refs.md_mab_account_actions.show()
  }
}

export const removeAccount = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm.show()
  }
}

export const deleteAccount = () => {
  return (dispatch, getState) => {
    const { arrAddressBook } = THIS.props
    const { AccountSelected, strFilter, txtSearch } = THIS.state

    let arrTemp = arrAddressBook.filter(item => item !== AccountSelected)
    dispatch(setAddressBook(arrTemp))

    arrTemp = arrTemp.filter(account =>
      (account.symbol === strFilter) &&
      (account.name.toLowerCase().includes(txtSearch))
    )
    THIS.setState({arrSearch: arrTemp})

    THIS.refs.md_mab_confirm.hide()
    // THIS.refs.md_mab_account_actions.hide()
  }
}

export const hideMdConfirm = () => {
  return (dispatch, getState) => {
    THIS.refs.md_mab_confirm.hide()
  }
}

export const showQRCodeAccount = () => {
  return (dispatch, getState) => {
    // THIS.refs.md_mab_account_actions.hide()
    THIS.refs.modalTokenRequestReceive.show()
  }
}

export const copyAccount = () => {
  return (dispatch, getState) => {
    // THIS.refs.md_mab_account_actions.hide()
    THIS.setState({
      activeCopied: true
    })
  }
}

export const activeEditAccount = () => {
  return (dispatch, getState) => {
    const { AccountSelected } = THIS.state
    THIS.setState({
      txtAccount: AccountSelected.address,
      txtAccountName: AccountSelected.name,
      isEditAccount: true,
      isExistAddress: false,
      isAccountError: false,
      isAccountNameError: false
    })
    // THIS.refs.md_mab_account_actions.hide()
    THIS.refs.md_mab_add_address.show()
  }
}
