#!/bin/bash

HUGO=hugo

rm -Rf public
mkdir public

cat static/assets/js/jquery-2.2.1.min.js \
static/assets/js/jquery.matchHeight.js \
static/assets/js/jquery.modal.js \
static/assets/js/picturefill.js \
static/assets/js/hubinfo.js \
static/wp-content/themes/hueman/js/jquery.jplayer.min.js \
static/wp-content/themes/hueman/js/scripts.js \
static/assets/highlight/highlight.pack.js \
static/wp-content/plugins/wp-youtube-lyte/lyte/lyte-min.js \
static/assets/js/myblog.js > static/assets/js/all.js

$HUGO -v --baseUrl="//cyrillschumacher.com/" --cacheDir="/Users/kiri/Sites/hugo/cyrillschumacher/cache" --destination="./public/"
cp -f static/piwik public/
cp static/*.* public/
cp -R static/.well-known public/
ln -s ../piwik public/piwik
./syncFolders-push.sh
