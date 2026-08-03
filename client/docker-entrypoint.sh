#!/bin/sh
set -e

if [ ! -d node_modules/@angular/core ]; then
  echo "==> Installing npm dependencies..."
  npm config set legacy-peer-deps true
  npm install
else
  echo "==> npm dependencies present"
fi

echo "==> Starting Angular on :4200"
exec npx ng serve --host 0.0.0.0 --poll 2000 --proxy-config proxy.conf.docker.json
