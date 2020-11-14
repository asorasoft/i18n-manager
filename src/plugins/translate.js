const translatePlugin = require("@vitalets/google-translate-api");
const UserAgent = require('user-agents');

// const tunnel = require('tunnel');

let translate = (phrase, option) => {
  const userAgent = new UserAgent({ deviceCategory: 'desktop' })
  const ip = (Math.floor(Math.random() * 255) + 1)+"."+(Math.floor(Math.random() * 255))+"."+(Math.floor(Math.random() * 255))+"."+(Math.floor(Math.random() * 255))

  return translatePlugin(phrase, option,
    {
      // agent: tunnel.httpsOverHttp({
      //   proxy: {
      //     host: '162.243.108.129',
      //     port: '8080',
      //   }
      // }),
      responseType: 'json',
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "*", // this is important
        "User-Agent": userAgent.toString(),
        "referer": 'https://translate.google.com/',
        "origin": 'https://translate.google.com/',
        "X-Forwarded-For": ip,
      }
    }
  )
}

Object.assign(translate, translatePlugin)

export default translate
