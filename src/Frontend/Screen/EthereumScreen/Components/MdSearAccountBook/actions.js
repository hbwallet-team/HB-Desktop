import { validateAddress, logDebugChatwork } from 'Utils/globalFunction'
import swal from 'sweetalert2'
import { setAddressBook } from 'Backend/Redux/actions/globalActions'

var THIS
export const defaultThis = (_this) => {
  return (dispatch, getState) => {
    THIS = _this
  }
}

export const searchAccountBook = (strSearch) => {
  return (dispatch, getState) => {
    THIS.setState({
      strSearchAccount: strSearch
    })
  }
}

export const showMdAddAddress = () => {
  return (dispatch, getState) => {
    THIS.setState({
      txtAccount: '',
      txtAccountName: '',
      isExistAddress: false,
      isAccountError: false,
      isAccountNameError: false
    })
    THIS.refs.md_mab_add_address.show()
  }
}

export const onChangeTxtAccount = (txtAccount) => {
  return (dispatch, getState) => {
    try {
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
    } catch (err) {
      logDebugChatwork('onChangeTxtAccount', err)
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

export const registerAccountBook = () => {
  return (dispatch, getState) => {
    try {
      const { strFilter, txtAccount, txtAccountName,
        isAccountError, txtSearch } = THIS.state
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
      THIS.refs.md_mab_add_address.hide()
    } catch (err) {
      logDebugChatwork('registerAccountBook', err)
    }
  }
}

export const onChangeDropdown = (item) => {
  return (dispatch, getState) => {
    const { txtSearch } = THIS.state
    THIS.setState({ strFilter: item.item.props.title })
    THIS.props.filter(item.item.props.title, txtSearch)
  }
}

export const filter = (strFilter, txtSearch) => {
  return (dispatch, getState) => {
    try {
      const { arrAddressBook } = THIS.props

      let arrTemp = arrAddressBook.filter(account =>
        (account.symbol === strFilter) &&
        (account.name.toLowerCase().includes(txtSearch))
      )
      THIS.setState({arrSearch: arrTemp})
    } catch (err) {
      logDebugChatwork('filter', err)
    }
  }
}
