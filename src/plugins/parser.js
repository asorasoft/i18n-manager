const fs = require('fs')

// To make json key sorted
const replacer = (key, value) =>
	value instanceof Object && !(value instanceof Array) ? 
		Object.keys(value)
		.sort()
		.reduce((sorted, key) => {
			sorted[key] = value[key];
			return sorted 
		}, {}) :
		value;

const jsonParser = {
    listTranslationFiles: (path) => {
        if (!fs.existsSync(path)) {
            return [];
        }
        return fs.readdirSync(path).filter((fileName) => fileName.endsWith('.json'));
    },
    translationDataParser: (fileContent) => {
        try {
            return new Function(`return ${fileContent}`)();
        } catch (e) {
            throw new Errror("Invalid file");
        }
    },
    translationFileWriter: (path, obj) => {
        fs.writeFileSync(path, JSON.stringify(obj, replacer, 2))
    },
    newFileName: (path, languageCode) => {
        return path + '/' + languageCode + '.json'
    }
}

const dartParser = {
    listTranslationFiles: (path) => {
        if (!fs.existsSync(path)) {
            return [];
        }
        return fs.readdirSync(path).filter((fileName) => fileName.endsWith('Map.dart'));
    },
    translationDataParser: (fileContent) => {
        try {
            var content = fileContent.replace(/^[^=]+=/, '').replace(/\/\/.*/g, '').replace('\n', '')
            return new Function(`return ${content}`)();
        } catch (e) {
            throw new Errror("Invalid file");
        }
    },
    translationFileWriter: (path, obj) => {
        var fileName = path.split('/').at(-1)
        var varName = fileName.split('.')[0]
        fs.writeFileSync(path, `// ignore_for_file: prefer_single_quotes\n\nfinal ${varName} = ` + JSON.stringify(obj, replacer, 2) + ';')
    },
    newFileName: (path, languageCode) => {
        return path + '/' + languageCode + 'Map.dart'
    }
}

const parser = jsonParser
// const parser = dartParser

export default parser
