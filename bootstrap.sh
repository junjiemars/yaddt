#!/bin/sh

NODE="${NODE:-`command -v node`}"
if [ ! -x "$NODE" ]; then
  if [ ! -f "$HOME/.nvm/nvm.sh" ]; then
    echo "!panic, node no found."
    exit 1
  fi
  . "$HOME/.nvm/nvm.sh"
  if `nvm --version &>/dev/null`; then
    echo "!panic, node no found"
    exit 1
  fi
  NODE="`nvm which node`"
  if [ ! -x "$NODE" ]; then
    echo "!panic, node no found."
    exit 1
  fi
fi

npm install

$NODE boot.js $@
