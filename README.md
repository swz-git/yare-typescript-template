# yare-typescript-template

## Requirements

- node.js 14+
- yarn (to install, do `npm i -g yarn`)

## Setup

Setup is super easy, just run `yarn install --production=false` in console.

You can now start writing yare code in src/main.js (for typescript just rename the file to main.ts)

## Use

- To bundle your js into a single file, use `yarn build`.
- Once it's done, a bundle should have appeared at dist/bundle.js
- Use the `-s` flag while building to auto upload your bundle to yare
- Use the `-a` flag to change to a new account to sync to.
- Use the `-w` flag while building to watch the `./src` directory for changes
- Use the `-nm` flag while building to disable the minifer
- Use the `--main=src/main.js` flag while building to use a custom main file

## Additional information

- This automatically puts your code in a anonymous function `(()=>{// your code here})()`
- To update the typescript typings you can run `yarn install --production=false` again.
