#!/bin/bash
rm -Rf public
mkdir public
# cp static/.htaccess public/
./hugo -v --baseUrl="http://cyrillschumacher.com//"
./syncFolders-push.sh
git push
