// import something here

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default async ({ Vue }) => {
  Vue.prototype.$helpers = {
    parseJson(jsonString) {
      try {
        return new Function(`return ${jsonString}`)();
      } catch (e) {
        throw new Errror("Invalid file");
      }
    },
    setProperties(obj, keys, value, force = false) {
      keys = keys.split('.');
      let pointer = obj;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // Reach last key
        if (i === keys.length - 1) {
          if (!force) {
            if (typeof pointer[key] === "string") {
              throw new Error(`Key ${key} is already exist as a string`);
            } else if (typeof pointer[key] === "object") {
              throw new Error(`Key ${key} is already exist as an object key`)
            }
          }
          pointer[key] = value;
          break;
        }

        if (!pointer.hasOwnProperty(key)) {
          pointer[key] = {};
        } else if (typeof pointer[key] === "string") {
          if (force) {
            pointer[key] = {};
          } else {
            throw new Error(`Key ${key} is existing String`)
          }
        }
        pointer = pointer[key];
      }
    }
  }
}
