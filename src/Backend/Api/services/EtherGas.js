import DexAPI from 'Backend/Api/services/DexAPI'
import { convertBalanceToWei } from 'Utils/globalFunction'
import { GAS_PRICE_DEFAULT } from 'Utils/globalConstants'
export default class EtherGas {
  static async fromEthGasStation () {
    try {
      // GWei
      const GAS_STATION_URL = 'https://ethgasstation.info/json/ethgasAPI.json'
      let response = await fetch(GAS_STATION_URL, {
        'async': true,
        'method': 'GET',
        'headers': {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      if (response && response.fastest && typeof response === 'object') {
        // console.log('fromEthGasStation: ', re)
        response = await response.json()
        return response
      } else {
        return null
      }
    } catch (error) {
      throw error
    }
  }

  static async fromEthChain () {
    try {
      // GWei
      const GAS_STATION_URL = 'https://www.etherchain.org/api/gasPriceOracle'
      let response = await fetch(GAS_STATION_URL, {
        'async': true,
        'method': 'GET',
        'headers': {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      if (response && response.fastest && typeof response === 'object') {
        response = await response.json()
        // console.log('fromEthChain: ', re)
        response.average = response.standard
        return response
      } else {
        return null
      }
    } catch (error) {
      throw error
    }
  }

  static async getGasPriceFastest () {
    try {
      let gasPrice = await DexAPI.getGasPrice()
      if (gasPrice && !gasPrice.error && gasPrice.data && gasPrice.data.fastest && typeof gasPrice === 'object') {
        return convertBalanceToWei(gasPrice.data.fastest, 8)
      } else {
        gasPrice = await this.fromEthChain()
        if (gasPrice && gasPrice.fastest && typeof gasPrice === 'object') {
          return convertBalanceToWei(gasPrice.fastest, 8)
        } else {
          gasPrice = await this.fromEthGasStation()
          if (gasPrice && gasPrice.fastest && typeof gasPrice === 'object') {
            return convertBalanceToWei(gasPrice.fastest, 8)
          }
        }
      }
      return convertBalanceToWei(GAS_PRICE_DEFAULT.FASTEST, 8)
    } catch (error) {
      throw error
    }
  }

  static async getGasPrice () {
    try {
      let gasPrice = await DexAPI.getGasPrice()
      if (gasPrice && !gasPrice.error && gasPrice.data && typeof gasPrice === 'object') {
        return {
          slow: gasPrice.data.safeLow / 10,
          medium: gasPrice.data.average / 10,
          fast: gasPrice.data.fastest / 10
        }
      } else {
        gasPrice = await this.fromEthChain()
        if (gasPrice && gasPrice.fastest && typeof gasPrice === 'object') {
          return {
            slow: gasPrice.safeLow / 10,
            medium: gasPrice.average / 10,
            fast: gasPrice.fastest / 10
          }
        } else {
          gasPrice = await this.fromEthGasStation()
          if (gasPrice && gasPrice.fastest && typeof gasPrice === 'object') {
            return {
              slow: gasPrice.safeLow,
              medium: gasPrice.standard,
              fast: gasPrice.fastest
            }
          }
        }
      }
      return GAS_PRICE_DEFAULT
    } catch (error) {
      throw error
    }
  }
}
