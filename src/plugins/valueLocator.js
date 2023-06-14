const nestedDot = (dict, key) => {
  return {
    isValidKey: () => {
      var keys = key.split('.')
      if (keys.length == 0 || keys.includes('')) {
        return false
      }
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (key === '') {
          return false
        }
        if (i === keys.length - 1) {
          break
        }
        if (!pointer.hasOwnProperty(key)) {
          break
        } else if (typeof pointer[key] === 'string') {
          return false
        } else {
          pointer = pointer[key]
        }
      }
      return true
    },
    getValue: () => {
      var keys = key.split('.')
      let pointer = dict
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (i === keys.length - 1) {
          return pointer[key]
        }
        if (!pointer.hasOwnProperty(key)) {
          return undefined
        } else if (typeof pointer[key] === 'string') {
          return undefined
        } else {
          pointer = pointer[key]
        }
      }
    },
    setValue: (value, force = false) => {
      var keys = key.split('.')
      let pointer = dict
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]

        // Reach last key
        if (i === keys.length - 1) {
          if (!force) {
            if (typeof pointer[key] === 'string') {
              throw new Error(`Key ${key} is already exist as a string`)
            } else if (typeof pointer[key] === 'object') {
              throw new Error(`Key ${key} is already exist as an object key`)
            }
          }
          if (value === null) {
            delete pointer[key]
          } else {
            pointer[key] = value
          }
          break
        }

        if (!pointer.hasOwnProperty(key)) {
          pointer[key] = {}
        } else if (typeof pointer[key] === 'string') {
          if (force) {
            pointer[key] = {}
          } else {
            throw new Error(`Key ${key} is existing String`)
          }
        }
        pointer = pointer[key]
      }
    }
  }
}

const valueLocator = nestedDot

export default valueLocator
