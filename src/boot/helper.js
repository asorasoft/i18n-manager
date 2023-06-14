// import something here

const fs = require('fs');
import translate from "../plugins/translate.js";
import parser from "../plugins/parser.js";
import valueLocator from "src/plugins/valueLocator.js";

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default async ({ Vue, state }) => {
  const helpers = {
    getNativeLanguage(localeCode) {
      if (translate.languages.isSupported(localeCode)) {
        return translate.languages[localeCode]
      }
      return `Language of ${localeCode}`
    },
    normalizeStringCase(text) {
      if (typeof text !== 'string') {
        return text;
      }
      return text.replace(/[A-Z]|([ \-_]+[A-Za-z])/g, function(res) {
          return ' ' + (res.replace(/[ \-_]+/g, '')).toLowerCase();
      });
    },
    getJsonFilesInFolder(path) {
      return parser.listTranslationFiles(path)
    },
    parseJson(jsonString) {
      return parser.translationDataParser(jsonString)
    },
    newFileName(path, locale) {
      return parser.newFileName(path, locale)
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

      var locator = valueLocator(obj, keys)
      if (!locator.isValidKey()) {
        return  {
          value: null,
          isAvailable: false
        }
      } else {
        var value = locator.getValue()
        return {
          value: value,
          isAvailable: value === undefined,
        }
      }
    },
    setProperties(obj, keys, value, force = false) {
      var locator = valueLocator(obj, keys)
      locator.setValue(value, force)
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
      parser.translationFileWriter(path, obj)
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
    const newKey = z.concat([key]);
    if (!exist(list, newKey)) {
      list.push(newKey);
    }
    if (typeof object[key] === 'object') {
      extract(object[key], list, newKey)
    }
  }
}
