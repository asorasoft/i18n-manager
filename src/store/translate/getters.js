export function configs (state) {
  return state.configs;
}

export function getTranslationFromKey(state) {
  return (keys) => {
    let result = {};
    for (const key of Object.keys(state.translations)) {
      try {
        result[key] = $helpers.getProperties(state.translations[key], keys);
      } catch (e) {
        result[key] = null;
      }
    }
    return result;
  };
}
