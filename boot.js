/*
 * boot.js
 */

const process = require('process');
const argv = process.argv.slice(process.argv.indexOf('--') !== -1
                                ? process.argv.indexOf('--') + 1
                                : 1);
const getopt = require('minimist');
const options = getopt(argv);

if ((options._ && options.length > 0)
    || (options.h || options.help)) {
  const help = [
    "usage: yaddt.sh [options and files]",
    "options:",
    "  -h, --help                              display this help",
    "  --install                               install mini program dev tool",
    "  --version                               print version and exit",
  ].join("\n");
  console.log(help);
  process.exit(1);
}

if (options.install) {
  console.log('!TODO: install command');
  process.exit(0);
}



/* eof */
