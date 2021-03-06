const translatePlugin = require("@vitalets/google-translate-api");
const UserAgent = require('user-agents');

import { store } from '../store'

const tunnel = require('tunnel');

let translate = (phrase, option) => {
  const userAgent = new UserAgent({ deviceCategory: 'desktop' })
  const cookie = store.getters['translate/googleTranslateCookie']

  return translatePlugin(phrase, option,
    {
      responseType: 'json',
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "*", // this is important
        "User-Agent": userAgent.toString(),
        "cookie": cookie,
      }
    }
  )
}

Object.assign(translate, translatePlugin)

export default translate
