export function configs (state) {
  return state.configs;
}

export function getTranslationFromKey(state) {
  return (keys) => {
    let result = {};
    for (const key of Object.keys(state.translations)) {
      result[key] = $helpers.getProperties(state.translations[key], keys);
    }
    return result;
  };
}
