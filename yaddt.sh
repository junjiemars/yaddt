#!/bin/sh

NODE="${NODE:-`command -v node`}"
if [ ! -x "$NODE" ]; then
  if [ ! -f "$HOME/.nvm/nvm.sh" ]; then
    echo "!panic, node no found."
    exit 1
  fi
  . "$HOME/.nvm/nvm.sh"
  if [ 0 -ne `nvm --version 2>&1 >/dev/null; echo $?` ]; then
    echo "!panic1, node no found"
    exit 1
  fi
  NODE="`nvm which node`"
  if [ ! -x "$NODE" ]; then
    echo "!panic2, node no found."
    exit 1
  fi
fi

if [ 0 -ne `wine --version 2>&1 >/dev/null; echo $?` ]; then
  sudo apt install wine-binfmt || exit 1
fi

if [ 0 -ne `7z --version 2>&1 >/dev/null` ]; then
  sudo apt install p7zip || exit 1
fi

if [ 0 -eq `npm install --quiet 2>&1 >/dev/null; echo $?` ]; then
  $NODE boot.js $@
else
  echo "!panic, missing requirements."
  exit 1
fi

# eof
