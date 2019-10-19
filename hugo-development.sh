#!/bin/bash
HUGO=./hugo_snapshot_linux_amd64

if [[ "$(uname)" == "Darwin" ]]; then
    HUGO=./hugo_snapshot_darwin_amd64
fi
# Read this:
# https://blog.carlmjohnson.net/post/2017/hugo-asset-pipeline/
#
rm -Rf public
mkdir public
$HUGO server -w -v --baseUrl="http://localhost" --cacheDir="./cache" --destination="./public/"
