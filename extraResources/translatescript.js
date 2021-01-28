const translate = require('@vitalets/google-translate-api')

translate(process.argv[2], { from: process.argv[3], to: process.argv[4] })
  .then(res => {
    console.log(res.text)
  })
  .catch(err => {
    console.error(err)
  })
