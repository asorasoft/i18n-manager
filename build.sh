#!/bin/bash

re="^v([^.]+).*"

if [[ `node -v` =~ $re ]]; then
  NODE_VERSION=${BASH_REMATCH[1]}
  if [[ $NODE_VERSION == 16 ]]; then
    echo "Correct node version: $NODE_VERSION"

    echo "Running: npm install..."
    npm install

    if ! type "quasar" > /dev/null; then
      echo "Installing quasar cli..."
      npm install -g @quasar/cli
    fi

    echo "Building application..."
    quasar build -m electron
    # quasar build -m electron --platform=darwin --arch=arm64

    echo "Please look inside >> ./dist/electron"
  else
    echo "Please use node version 16"
  fi
else
  echo "Cannot detect node version, please install one."
fi
