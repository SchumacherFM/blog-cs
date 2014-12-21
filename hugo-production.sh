#!/bin/bash
rm -Rf public
mkdir public
cp static/.htaccess public/
./hugo -v --baseUrl="http://cyrillschumacher.com//"
git ca -m 'Create Production version'
./syncFolders-push.sh
git push
