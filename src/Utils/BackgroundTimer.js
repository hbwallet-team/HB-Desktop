class BackgroundTimer {
  constructor () {
    this.uniqueId = {
      value: 0
    }
    this.callbacks = {}
  }

  setTimeout (callback, timeout) {
    const timeoutId = ++this.uniqueId.value
    let timer = setInterval(() => callback(), timeout)
    this.callbacks[timeoutId] = {
      callback: callback,
      interval: false,
      timeout: timeout,
      timer: timer
    }
    return timeoutId
  }

  clearTimeout (timeoutId) {
    if (this.callbacks[timeoutId]) {
      clearInterval(this.callbacks[timeoutId].timer)
      delete this.callbacks[timeoutId]
    }
  }

  setInterval (callback, timeout) {
    const intervalId = ++this.uniqueId.value
    let timer = setInterval(() => callback(), timeout)
    this.callbacks[intervalId] = {
      callback: callback,
      interval: true,
      timeout: timeout,
      timer: timer
    }
    return intervalId
  }

  clearInterval (intervalId) {
    if (this.callbacks[intervalId]) {
      clearInterval(this.callbacks[intervalId].timer)
      delete this.callbacks[intervalId].timer
    }
  }
}

const instance = new BackgroundTimer()
Object.freeze(instance)

export default instance
