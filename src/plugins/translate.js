const translatePlugin = require("@vitalets/google-translate-api");
// const UserAgent = require('user-agents');

// import { store } from '../store'

// const tunnel = require('tunnel');

// let translate = (phrase, option) => {
//   const userAgent = new UserAgent({ deviceCategory: 'desktop' })
//   const cookie = store.getters['translate/googleTranslateCookie']

//   return translatePlugin(phrase, option,
//     {
//       responseType: 'json',
//       headers: {
//         "Accept": "application/json",
//         "Accept-Encoding": "*", // this is important
//         "User-Agent": userAgent.toString(),
//         "cookie": cookie,
//       }
//     }
//   )
// }

// Object.assign(translate, translatePlugin)

// export default translate

const exec = require('child_process').exec

function execute (command, callback) {
  exec(command, (error, stdout, stderr) => {
    callback(stdout)
  })
}

const translate = (phrase, option) => {
  return new Promise((resolve, reject) => {
    // console.log(`node 'src/scripts/translate.js' '${phrase}' '${option.from || 'en'}' '${option.to || en}'`)
    try {
      execute(`node 'src/scripts/translate.js' "${phrase}" '${option.from || 'en'}' '${option.to || en}'`, output => {
        // console.log(output)
        resolve({
          text: output,
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

Object.assign(translate, translatePlugin)

export default translate
