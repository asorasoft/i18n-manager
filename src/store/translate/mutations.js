export function loadConfigs (state, configs) {
  this.state.translate.configs = configs;
}

export function loadTranslations (state, translations) {
  this.state.translate.translations = translations;
}

export function updateTranslations (state, {file, keys, value, force}) {
  this._vm.$helpers.setProperties(this.state.translate.translations[file], keys, value, force);
}
