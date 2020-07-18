const fs = require('fs')
const os = require('os')

const CONFIG_PATH = os.homedir() + '/.i18n_config'

export function saveConfig (
  context,
  data
) {
  // console.log(data);
  let configs = loadConfigsFromFile();
  if (configs.map(c => c.localePath).includes(data.localePath)) {
    configs = configs.map(c => {
      if (c.localePath == data.localePath) {
        return data;
      } else {
        return c;
      }
    })
  } else {
    configs.push(data);
  }
  saveConfigsToFile(context, configs);
}

export function loadConfigsFromFile (context) {
  if (fs.existsSync(CONFIG_PATH)) {
    let configs = fs.readFileSync(CONFIG_PATH).toString();
    // console.log(configs);
    return JSON.parse(configs);
  } else {
    return []
  }
}

export function saveConfigsToFile (context, configs) {
  fs.writeFile(CONFIG_PATH, JSON.stringify(configs), function (err, data) {
    if (err) {
      alert(err)
    }
  })
}

export function loadConfigs (context) {
  let configs = loadConfigsFromFile(context);
  context.commit('loadConfigs', configs);
}

export function loadTranslation ({getters, commit}, selectedConfigIndex) {
  const config = getters.configs[selectedConfigIndex];
  const files = fs.readdirSync(config.localePath).filter((fileName) => fileName.endsWith('.json'));
  const rawTraslations = files.map(file => {
        return fs.readFileSync(config.localePath + '/' + file).toString();
      });
  const translationList = rawTraslations.map(data => $helpers.parseJson(data))
  let translations = {}
  files.forEach((file, index) => {
    translations[file] = translationList[index]
  })
  commit('loadTranslations', translations);
}
