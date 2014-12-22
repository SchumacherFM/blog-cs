#!/bin/bash
rm -Rf public
mkdir public
./hugo -v --baseUrl="http://cyrillschumacher.com//"
./syncFolders-push.sh
git push
