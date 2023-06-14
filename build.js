"use strict"

const builder = require("electron-builder")
const Platform = builder.Platform

// Promise is returned
builder.build({
  targets: Platform.MAC.createTarget(),
  config: {
    "mac": {
      "target": [
        "pkg"
      ]
    }
  }
})
  .then(() => {
    // handle result
  })
  .catch((error) => {
    // handle error
  })