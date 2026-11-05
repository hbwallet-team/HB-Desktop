import React from 'react'
import '../styles.css'
import { List } from 'antd'
import Images from 'Assets/Image'
import { HBInput } from 'Frontend/Components/HBInput'

const selectToken = (selectedTokenItem, item, index) => () => selectedTokenItem(index, item)

const MDAddToken = ({THIS, addCustomToken}) => {
  const { objSelectItem, strSearch, arrShowItems, arrResults, isOpenCreate } = THIS.state
  const { handleCreateToken, t, handleInputSearch, closeMdAddToken, selectedTokenItem } = THIS.props

  let datas = arrResults || arrShowItems
  if (datas && datas.length > 0 && !datas[datas.length - 1].isBtn) {
    const btnAddCustomToken = ({
      isBtn: true
    })
    datas.push(btnAddCustomToken)
  }
  return (
    <div className="mdToken-body mdToken-spec01">
      <div className="mdToken-header">
        <div className={'mdToken-txtToken'}>
          <div className="pp-close" onClick={closeMdAddToken}><img src={Images.close1} /></div>{t('addTokens')}
        </div>
      </div>
      <div className="mdToken-mid">
        <div className='tk-md-add-input-contain'>
          <div className="inputSearch-Container">
            <HBInput
              iconLeft={Images.search1}
              placeholder={t('search')}
              value={strSearch}
              className='inputSearch-Token'
              onChange={handleInputSearch}
              autoFocus={true}
            />
          </div>
        </div>
      </div>
      <div className="mdToken-content" id="HBScrollBar">
        {
          ((arrResults && arrResults.length === 0) || (arrShowItems && arrShowItems.length === 0))

            ? <div className="mdToken-noInternet">
              <img alt='img' src={Images.noInternet} className={'mdToken-imgNoInternet'} />
              <div className="txtNoResult">{t('noResult')}</div>
            </div>

            : <List
              grid={{ gutter: 36, lg: 4, xl: 4 }}
              dataSource={datas}
              renderItem={(item, index) => (
                !item.isBtn
                  ? <List.Item>
                    {
                      objSelectItem && objSelectItem.index === index &&
                  <div className="md-contentImage">
                    <img alt='img' src={Images.itemSelect} className={'md-imgSelect'} />
                  </div>
                    }
                    <img alt='img' src={item.cardImage}
                      className={objSelectItem && objSelectItem.index === index ? 'md-imgActive' : 'md-img'}
                      onClick={selectToken(selectedTokenItem, item, index)} />
                    <div className="txtNameToken">{item.name}</div>
                  </List.Item>
                  : <List.Item>
                    <img alt='img' src={Images.cardEmpty2}
                      className={'md-img'}
                      onClick={addCustomToken} />
                    <div className="txt-normal txt-Absolute" id="nameColor">
                      {t('addToken')}
                    </div>
                  </List.Item>
              )} />
        }

      </div>
      <div className="md-footer">
        <div onClick={closeMdAddToken} id="btnHover" className="md-mab-btnFooter">{t('cancel')}</div>
        <div id="btnHover" className={isOpenCreate ? 'md-mab-btnFooterAdd' : 'md-mab-btnFooter-disable'}
          onClick={isOpenCreate ? handleCreateToken : null}
        >{t('addTokens')}</div>
      </div>
    </div>

  )
}
export default MDAddToken
