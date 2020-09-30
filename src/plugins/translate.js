const translatePlugin = require("@k3rn31p4nic/google-translate-api");
const tunnel = require('tunnel');

let translate = (phrase, option) => {
  // return (async () => ({
  //   text: 'Okay khayooo'
  // }))()
  return translatePlugin(phrase, option,
    // {agent: tunnel.httpsOverHttp({
    //   proxy: {
    //     host: '160.2.38.41',
    //     port: 8080
    //   }
    // })}
  )
}

Object.assign(translate, translatePlugin)

export default translate
