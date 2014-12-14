#!/bin/bash
rm -Rf public
mkdir public
./hugo -v --baseUrl="http://cyrillschumacher.com//"
git ca -m 'Create Production version'
./syncFolders-push.sh
git push && git push production master
