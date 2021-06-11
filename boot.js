/*
 * boot.js
 */

const process = require('process');
const argv = process.argv.slice(process.argv.indexOf('--') !== -1
                                ? process.argv.indexOf('--') + 1
                                : 1);
const getopt = require('minimist');
const options = getopt(argv);

const help = [
  "usage: yaddt.sh [options and files]",
  "options:",
  "  -h, --help                              display this help",
  "  --what=[wechat,alipay]                  default is wechat dev tool",
  "  --install                               install mini program dev tool",
  "  --run                                   run mini programm dev tool",
  "  --version                               print version and exit",
].join("\n");

if ((options._ && options.length > 0)
    || (options.h || options.help)) {
  console.log(help);
  process.exit(1);
}

if (options.what) {
  console.log(options.what);
}

if (options.install) {
  console.log('!TODO: install command');
  process.exit(0);
}

if (options.run) {
  console.log('!TODO: run command');
  process.exit(0);
}

console.log(help);
process.exit(1);



/* eof */
