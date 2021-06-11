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
  "  --vendor=[wechat,alipay]                default is wechat dev tool",
  "  --install=version                       install mini program dev tool",
  "  --run                                   run mini programm dev tool",
  "  --version                               print version and exit",
].join("\n");



function install(options) {
  console.log('!TODO: install(%s)', options.install);
  const [ ver, arch = process.arch ] = options.install.split('_');
  const cwd = process.cwd();
  console.log('ver=%s, arch=%s', ver, arch);

  const vdir = `vendor/${options.vendor}/${ver}/${arch}`;
  const fs = require('fs');
  fs.mkdir(`${cwd}/${vdir}`, { recursive: true }, (e) => {
    if (e) {
      console.error(e);
      // process.exit(1);
    }
  });

  const vbag = `vendor/${options.vendor}/wechat_devtools_${ver}_${arch}.exe`;
  const { exec } = require('child_process');
  exec(`7z x -o${cwd}/${vdir} ${cwd}/${vbag} -y`, (e, _, __) => {
    if (e) {
      console.error(e);
      // process.exit(1);
    }
  });
  
  const fsx = require('fs-extra');
  
}

function run(options) {
  console.log('!TODO: run(%s)', options.run);

}


if ((options._ && options.length > 0)
    || (options.h || options.help)) {
  console.log(help);
  process.exit(1);
}

if (options.vendor) {
  console.log(options.vendor);
}

if (options.install) {
  install(options);
  process.exit(0);
}

if (options.run) {
  run(options);
  process.exit(0);
}

console.log(help);
process.exit(1);



/* eof */
