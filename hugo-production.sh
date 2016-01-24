#!/bin/bash

HUGO=./hugo_snapshot_linux_amd64

if [ "$(uname)" == "Darwin" ]; then
    HUGO=./hugo_snapshot_darwin_amd64
fi

rm -Rf public
mkdir public
$HUGO -v --baseUrl="//vps.cyrillschumacher.com" --cacheDir="./cache"
cp static/piwik public/
cp static/*.asc static/schumach*.png public/
cp -R static/.well-known public/
./syncFolders-caddy-push.sh
git push
