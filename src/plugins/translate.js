const app = require('electron').remote.app
const path = require('path')
const { spawn } = require('child_process')

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
    const scriptPath = path.join('extraResources/', 'translatescript.js');
    let electron = spawn('node', [scriptPath, phrase, option.from || 'en', option.to || 'en'])
    // let electron = spawn('node', ['-e', 'const a=require("@vitalets/google-translate-api");a(process.argv[1],{from:process.argv[2],to:process.argv[3]}).then(e=>{console.log(e.text)}).catch(e=>{console.error(e)});', phrase, option.from || 'en', option.to || 'en'])

    electron.stdout.on('data', function (data) {
      resolve({
        text: data.toString(),
      })
    })

    electron.stderr.on('data', function (data) {
      reject(data.toString())
    })
  })
}

Object.assign(translate, translatePlugin)

export default translate
