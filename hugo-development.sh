#!/bin/bash
rm -Rf public
mkdir public
./hugo server -w -v --baseUrl="localhost"
