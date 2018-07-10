const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { extractClasses, stripMethodBodies } = require('./extract-classes');

const DATA_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE_NAME = path.join(__dirname, '../classes.json');

const outputFile = fs.openSync('classes.json', 'w');

function processEntry(line) {
  const { id, content } = JSON.parse(line);
  for (const classSource of extractClasses(content).map(stripMethodBodies)) {
    fs.writeSync(outputFile, JSON.stringify({ id, source: classSource }) + '\n');
  }
}

async function processFile(file) {
  return new Promise((resolve, reject) => {
    const input = fs
      .createReadStream(file)
      .pipe(zlib.createGunzip({}))
      .on('error', reject);

    const lineReader = readline.createInterface(input);
    lineReader.on('line', (line) => processEntry(line)).on('close', resolve);
  });
}

async function main() {
  for (const entry of fs.readdirSync(DATA_DIR).filter((e) => e.endsWith('.json'))) {
    const file = path.join(DATA_DIR, entry);
    await processFile(file);
    console.log(file);
  }
}

main()
  .then(() => console.log('done'))
  .catch((err) => console.error('fail', err));
