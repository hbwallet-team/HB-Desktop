import React from 'react'
import update from 'immutability-helper'
import Card from './Card'
import { DropTarget } from 'react-dnd'

class Container extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      cards: props.list
    }
  }

  pushCard (card) {
    this.setState(
      update(this.state, {
        cards: {
          $unshift: [card]
        }
      })
    )
    // console.log('you are in pushCard card', this.state.cards)
  }

  removeCard (index) {
    this.setState(
      update(this.state, {
        cards: {
          $splice: [[index, 1]]
        }
      })
    )
    // console.log('you are in removeCard card', this.state.cards)
  }

  moveCard (dragIndex, hoverIndex) {
    const { cards } = this.state
    const dragCard = cards[dragIndex]

    this.setState(
      update(this.state, {
        cards: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]]
        }
      })
    )
    // console.log('you are in moveCard card', this.state.cards)
  }

  componentWillUpdate (nextProps) {
    if (this.state.cards !== nextProps.list) {
      this.setState({
        cards: nextProps.list
      })
    }
  }

  render () {
    const { cards } = this.state
    const { connectDropTarget } = this.props
    let arrayAddress = ''
    return connectDropTarget(
      <div className='exfd-container' >
        {cards.map((card, i) => {
          // console.log('connectDropTargetNew---card', card)
          arrayAddress = arrayAddress + card.text
          return (
            <Card
              key={card.id}
              index={i}
              listId={this.props.id}
              card={card}
              removeCard={this.removeCard.bind(this)}
              moveCard={this.moveCard.bind(this)}
              handleChangeFavorite={this.props.handleChangeFavorite}
              setChangeEditFavorite={this.props.setChangeEditFavorite}
            />
          )
        })}
      </div>
    )
  }
}

const cardTarget = {
  drop (props, monitor, component) {
    const { id } = props
    const sourceObj = monitor.getItem()
    // console.log('you are in cardTarget---id', id)
    // console.log('you are in cardTarget---sourceObj.listId', sourceObj.listId)
    // console.log('you are in cardTarget---sourceObj.card', sourceObj.card)
    if (id !== sourceObj.listId) component.pushCard(sourceObj.card)
    return {
      listId: id
    }
  }
}

export default DropTarget('CARD', cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(Container)
