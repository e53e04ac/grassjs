# grassjs

## 本家

- [ちょっと草植えときますね型言語 Grass](http://www.blue.sky.or.jp/grass/)

## なにこれ

- 「ちょっと草植えときますね型言語 Grass」のJavaScript実装のインタプリターです。

## いるもの

- [Node.js (v15)](https://nodejs.org/en/)

## インストールする

~~~~~ sh
npm install e53e04ac/grassjs
~~~~~

## つかってみる

~~~~~ js
const fs = require('fs');

const { Grass } = require('grassjs');

async function main() {
    const string = await fs.promises.readFile('helloworld.grass', 'utf8');
    const code = Grass.parse(string);
    await Grass.run(code);
}

main();
~~~~~
