const fs = require('fs')

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
        fs.writeFileSync(path, JSON.stringify(obj, null, 2))
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
        fs.writeFileSync(path, `final ${varName} = ` + JSON.stringify(obj, null, 2) + ';')
    }
}

const parser = jsonParser
// const parser = dartParser

export default parser