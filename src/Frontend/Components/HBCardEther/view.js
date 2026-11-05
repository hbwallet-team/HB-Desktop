import React from 'react'
import { Wave } from 'better-react-spinkit'
import { formatNumberDisplay, formatFiatDisplay } from 'Utils/globalFunction'
import { HBCRYPTO } from 'Utils/globalConstants'
import Images from 'Assets/Image'
import './styles.css'

const renderWETHFormat = (amount, decimals) => {
  const balance = formatNumberDisplay(amount, decimals)
  return (
    <div style={{ display: 'inline-block' }}>
      <span className="exc-usd-first">{balance.firstNumber}</span>
      <span className="exc-usd-second">
        {balance.secondNumber ? '.' + balance.secondNumber : ''} {HBCRYPTO.ETHEREUM}
      </span>
    </div>
  )
}

const HBCardEther = ({
  item,
  isLoadingCard,
  internetData,
  currency,
  t,
  openCardDetail
}) => {
  // Click cardItem
  const onClickCard = itm => () => openCardDetail(itm)
  const fiatAmount = formatFiatDisplay(item.fiatAmount)
  return (
    <div className="card-container">
      <div className="card-content" onClick={onClickCard(item)}>
        {item.isMain && (
          <img
            alt="img"
            src={Images.itemSelect}
            className={'card-img-select'}
          />
        )}
        <div className="card-content-bottom">
          <div className="card-content-bottom-left">
            {/* <img src={Images.ic_hb} alt="hb" /> */}
          </div>
          <div className="card-content-bottom-right">
            {isLoadingCard ? (
              <div className="card-loading">
                <Wave size={20} color="white" />
              </div>
            ) : (
                <div className="card-eth-balance">
                  {renderWETHFormat(item.balance, 8)}
                </div>
              )}
            {isLoadingCard ? (
              <div className="card-loading">
                <Wave size={15} color="white" />
              </div>
            ) : (
                <div className="card-curreny-balance">
                  <div style={{ display: 'inline-block' }}>
                    <span className="exc-usd-first">
                      {currency}
                      {fiatAmount.firstNumber}
                    </span>
                    <span className="exc-usd-second">
                      .{fiatAmount.secondNumber}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
      <img
        alt="img"
        src={
          item.key >= 12
            ? Images.cardEther[(item.key + 1) % 12]
            : Images.cardEther[item.key % 12]
        }
        className={'card-img' + (item.isMain ? ' main-card-img' : '')}
      />
    </div>
  )
}

export default HBCardEther
