const fs = require('fs')
const os = require('os')

const CONFIG_PATH = os.homedir() + '/.i18n_config'
const COOKIE_PATH = os.homedir() + '/.i18n_cookie'

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
    configs.unshift(data);
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

export function loadCookieFromFile (context) {
  if (fs.existsSync(COOKIE_PATH)) {
    return fs.readFileSync(COOKIE_PATH).toString();
  }
  return null;
}

export function saveConfigsToFile (context, configs) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(configs));
  context.dispatch('loadConfigs');
}

export function loadConfigs (context) {
  let configs = loadConfigsFromFile(context);
  context.commit('loadConfigs', configs);
}

export function loadGoogleTranslateCookie (context) {
  let cookie = loadCookieFromFile(context);
  updateGoogleTranslateCookie(context, cookie)
}

export function loadTranslation ({getters, commit}, selectedConfigIndex) {
  const config = getters.configs[selectedConfigIndex];
  const files = $helpers.getJsonFilesInFolder(config.localePath);
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

export function updateGoogleTranslateCookie({commit}, cookie) {
  fs.writeFileSync(COOKIE_PATH, cookie);
  commit('setGoogleTranslateCookie', cookie)
}
