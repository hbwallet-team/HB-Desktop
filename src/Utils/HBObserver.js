var events = require('events')
var eventEmitter = new events.EventEmitter()

class HBObserver {
  constructor () {
    this.listObserver = []
  }

  on (key, func) {
    eventEmitter.on(key, func)
  }

  emit (key, object) {
    eventEmitter.emit(key, object)
  }

  removeListener (key, func) {
    eventEmitter.removeListener(key, func)
  }
}

const instance = new HBObserver()
Object.freeze(instance)

export default instance
