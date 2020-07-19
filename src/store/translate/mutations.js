export function loadConfigs (state, configs) {
  this.state.translate.configs = configs;
}

export function loadTranslations (state, translations) {
  this.state.translate.translations = translations;
}

export function addTranslations (state, {file, keys, value, force}) {
  $helpers.setProperties(this.state.translate.translations[file], keys, value, force);
}

export function deleteTranslationKey (state, {file, keys}) {
  $helpers.setProperties(this.state.translate.translations[file], keys, null, true);
}

export function removeConfig(state, configToRemove) {
  this.state.translate.configs.splice(this.state.translate.configs.indexOf(configToRemove), 1);
}
