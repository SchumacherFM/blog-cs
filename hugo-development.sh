#!/bin/bash
rm -Rf public
mkdir public
mkdir -p cache/cyrillschumacher
hugo server -w -v --baseUrl="http://localhost" --cacheDir="/Users/kiri/Sites/hugo/cyrillschumacher/cache" --destination="./public/"
