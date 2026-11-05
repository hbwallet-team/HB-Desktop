import React from 'react'
import Images from 'Assets/Image'
import { HBInput } from 'Frontend/Components/HBInput'
import { List } from 'antd'
import './styles.css'
import BoxGame from '../../Components/BoxGame'

import ReactWOW from 'react-wow'
import 'animate.css'
import WOW from 'wowjs'

import ScrollAnimation from 'react-animate-on-scroll'
import 'animate.css/animate.min.css'

export default class DappGenreScreen extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      strSearch: '',
      arrSearch: null
    }
    props.defaultThis(this)
  }
  componentDidMount () {
    new WOW.WOW({
      scrollContainer: '.dapp-genre'
    }).init()
  }
  render () {
    return (
      <div className="dapp-genre">
        <div className="dapp-genre-header">
          <div className="dapp-back" onClick={this.props.backToTop}>
            <img className="img-back" alt="imgBack" src={Images.tabNaviBack} />
            {this.props.t('back')}
          </div>
          { this.renderSearchBox() }
        </div>
        <div className="dapp-genre-body">
          <div className="dapp-genre-title">{this.props.selectedGenre}</div>
          {
            this.state.strSearch.length > 0
              ? this.renderDAppSearch()
              : this.renderDApp()
          }
        </div>
      </div>
    )
  }
  renderSearchBox () {
    return (
      <div className="dapp-search">
        <HBInput
          iconLeft={Images.search1}
          placeholder={this.props.t('Dapps.searchDapps')}
          value={this.state.strSearch}
          className='dapp-input-search'
          onChange={(value) => this.props.onChangeSearchKeyword(value)}
        />
      </div>
    )
  }
  renderDappItem = (item, index) => {
    return (
      <BoxGame 
        item={item} 
        key={index} 
        rank={index} 
        isRanking={this.props.isRanking}
        openDapp={this.props.openDapp}
      />
    )
  }
  renderDApp = () => {
    return (
      <React.Fragment>
        {
          Array.isArray(this.props.arrListApp) && this.props.arrListApp.length > 0
            ? <div className="dapp-search-genre">
              <ScrollAnimation animateIn='bounceInRight' className="dapp-searchScrollAnimation">
                <List 
                  id="HBScrollBar"
                  className="dapp-search-list"
                  dataSource={this.props.arrListApp} 
                  renderItem={this.renderDappItem}
                />
              </ScrollAnimation>
            </div>
            : <div className="dapp-search-genre">{this.props.t('NoData')}</div>
        }
      </React.Fragment>
    )
  }
  renderDAppSearch () {
    return (
      <React.Fragment>
        {
          Array.isArray(this.state.arrSearch) && this.state.arrSearch.length > 0
            ? <div className="dapp-search-genre">
              <List 
                id="HBScrollBar"
                className="dapp-search-list"
                dataSource={this.state.arrSearch} 
                renderItem={this.renderDappItem}
              />
            </div>
            : <div className="dapp-search-genre">{this.props.t('NoData')}</div>
        }
      </React.Fragment>
    )
  }
}
