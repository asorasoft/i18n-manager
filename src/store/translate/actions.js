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
    throw new Error('Path already exist in config');
  }
  configs.push(data);
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
