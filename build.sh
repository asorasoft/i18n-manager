#!/bin/bash

re="^v([^.]+).*"

if [[ `node -v` =~ $re ]]; then
  NODE_VERSION=${BASH_REMATCH[1]}
  if [[ $NODE_VERSION == 10 || $NODE_VERSION == 12 || $NODE_VERSION == 14 ]]; then
    echo "Correct node version: $NODE_VERSION"

    if ! type "quasar" > /dev/null; then
      echo "Installing quasar cli..."
      npm install -g @quasar/cli
    fi

    echo "Running: npm install..."
    npm install

    echo "Building application..."
    quasar build -m electron

    echo "Please look inside >> ./dist/electron"
  else
    echo "Please use node version 10, 12 or 14"
  fi
else
  echo "Cannot detect node version, please install one."
fi
