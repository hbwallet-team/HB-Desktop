const storage = window.require('electron-json-storage-sync')

export const get = (KEY) => {
  const data = storage.get(KEY)
  if (data) {
    return data.data
  } else {
    return ''
  }
}

export const set = (KEY, VALUE) => {
  storage.set(KEY, VALUE)
}

export const clear = () => {
  storage.clear()
}
