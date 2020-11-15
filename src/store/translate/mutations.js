import { EventBus } from '../../utils/event_bus.js'

export function loadConfigs (state, configs) {
  this.state.translate.configs = configs;
}

export function loadTranslations (state, translations) {
  this.state.translate.translations = translations;
}

export function addTranslations (state, {file, keys, value, force, config}) {
  $helpers.setProperties(this.state.translate.translations[file], keys, value, force)
  $helpers.writeJson(`${config.localePath}/${file}`, this.state.translate.translations[file])
}

export function deleteTranslationKey (state, {file, keys, config}) {
  $helpers.setProperties(this.state.translate.translations[file], keys, null, true)
  $helpers.writeJson(`${config.localePath}/${file}`, this.state.translate.translations[file])
}

export function removeConfig(state, configToRemove) {
  this.state.translate.configs.splice(this.state.translate.configs.indexOf(configToRemove), 1);
}

export function setGoogleTranslateCookie(state, cookie) {
  this.state.translate.googleTranslateCookie = cookie;
}
