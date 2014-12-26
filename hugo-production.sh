#!/bin/bash
rm -Rf public
mkdir public
./hugo -v --baseUrl="http://cyrillschumacher.com//" --cacheDir="./cache"
./syncFolders-push.sh
git push
