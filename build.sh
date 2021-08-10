#!bin/bash
# Absolute path to this script
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in
SCRIPTPATH=$(dirname "$SCRIPT")
echo $SCRIPTPATH
cd $SCRIPTPATH

rm -rf ./main
rm -rf ./dist
rm -rf ./src/ui/dist
mkdir -p ./dist/ui

mv ./src/config.json  ./dist

go build ./src/main.go
mv ./main ./dist

cd ./src/ui
npm install && npm run build
cp ./dist ../../dist/ui