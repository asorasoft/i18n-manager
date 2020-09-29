// import something here
const fs = require('fs');

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default async ({ Vue, state }) => {
  const helpers = {
    normalizeStringCase(text) {
      if (typeof text !== 'string') {
        return text;
      }
      return text.replace(/[A-Z]|([ \-_]+[A-Za-z])/g, function(res) {
          return ' ' + (res.replace(/[ \-_]+/g, '')).toLowerCase();
      });
    },
    getJsonFilesInFolder(path) {
      if (!fs.existsSync(path)) {
        return [];
      }
      return fs.readdirSync(path).filter((fileName) => fileName.endsWith('.json'));
    },
    parseJson(jsonString) {
      try {
        return new Function(`return ${jsonString}`)();
      } catch (e) {
        throw new Errror("Invalid file");
      }
    },
    getProperties(obj, keys) {
      keys = keys.split('.');
      let pointer = obj;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (i === keys.length - 1) {
          return pointer[key];
        }
        if (!pointer.hasOwnProperty(key)) {
          throw new Error(`Key ${key} does not exist`);
        } else if (typeof pointer[key] === 'string') {
          throw new Error(`Key ${key} is a string, no more child`);
        } else {
          pointer = pointer[key]
        }
      }
    },
    getKeyStatus(obj, keys) {
      keys = keys.split('.');
      if (keys.length > 0 && keys.includes('')) {
        return  {
          value: null,
          isAvailable: false
        }
      }
      let pointer = obj;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (key === '') {
          return {
            value: null,
            isAvailable: false
          };
        }
        if (i === keys.length - 1) {
          return {
            value: pointer[key],
            isAvailable: pointer[key] === undefined,
          };
        }
        if (!pointer.hasOwnProperty(key)) {
          return {
            value: null,
            isAvailable: true,
          };
        } else if (typeof pointer[key] === 'string') {
          return {
            value: null,
            isAvailable: false,
          };
        } else {
          pointer = pointer[key];
        }
      }
    },
    setProperties(obj, keys, value, force = false) {
      keys = keys.split('.');
      let pointer = obj;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // Reach last key
        if (i === keys.length - 1) {
          if (!force) {
            if (typeof pointer[key] === "string") {
              throw new Error(`Key ${key} is already exist as a string`);
            } else if (typeof pointer[key] === "object") {
              throw new Error(`Key ${key} is already exist as an object key`)
            }
          }
          if (value === null) {
            delete pointer[key];
          } else {
            pointer[key] = value;
          }
          break;
        }

        if (!pointer.hasOwnProperty(key)) {
          pointer[key] = {};
        } else if (typeof pointer[key] === "string") {
          if (force) {
            pointer[key] = {};
          } else {
            throw new Error(`Key ${key} is existing String`)
          }
        }
        pointer = pointer[key];
      }
    },
    extractKeys(...translations) {
      // console.log(translations);
      let keys = [];
      for (const translation of translations){
        extract(translation, keys)
      }
      return keys;
    },
    writeJson(path, obj) {
      fs.writeFileSync(path, JSON.stringify(obj, null, 2))
    }
  }
  window.$helpers = helpers;
  Vue.prototype.$helpers = helpers;
}

function exist (list, key) {
  return list.map(k => k.join('.')).includes(key.join('.'))
}

function extract(object, list, parent = []) {
  for (const key of Object.keys(object)) {
    const newKey = parent.concat([key]);
    if (!exist(list, newKey)) {
      list.push(newKey);
    }
    if (typeof object[key] === 'object') {
      extract(object[key], list, newKey)
    }
  }
}
