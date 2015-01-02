#!/bin/bash
rm -Rf public
mkdir public
./hugo -v --baseUrl="http://cyrillschumacher.com//" --cacheDir="./cache"
cp -R static/piwik public/
./syncFolders-push.sh
git push
