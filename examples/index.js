/*!
 * grassjs/examples/index.js
 * e53e04ac <e53e04ac@gmail.com>
 * MIT License
 */

const fs = require('fs');

const { Grass } = require('../');

async function main() {
    const filename = process.argv[2];
    const string = await fs.promises.readFile(filename, 'utf8');
    const code = Grass.parse(string);
    await Grass.run(code);
}

main();
