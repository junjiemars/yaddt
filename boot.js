/*
 * boot.js
 */

const process = require('process');
const argv = process.argv.slice(process.argv.indexOf('--') !== -1
                                ? process.argv.indexOf('--') + 1
                                : 1);
const getopt = require('minimist');
const options = getopt(argv);

const option_vendor = {
  name: 'wechat',
  ver: '1.05.2105170',
};
const option_host = {
  name: 'nw.js',
  ver: '0.54.0',
};


const help = [
  "usage: yaddt.sh [options and files]",
  "options:",
  "  -h, --help                              display this help",
  "  --vendor=[wechat,alipay]                default is wechat dev tool",
  "  --host=[nw]                             default is nw.js",
  "  --install                               install mini program dev tool and host",
  "  --run                                   run mini programm dev tool",
  "  --version                               print version and exit",
  "",
  "examples:",
  `  yaddt --vendor='${JSON.stringify(option_vendor)}' --host='${JSON.stringify(option_host)}' --install`,
].join("\n");


function download(options, url, path, after) {
  console.log('# try to download %s via %s', url, options);
  const { exec } = require('child_process');
  exec(`curl -sqL -O${url} -o${path}`, after);
}


function install(options) {
  console.log('# install ...');
  const arch = process.arch;
  const cwd = process.cwd();

  const [ ver, arch = process.arch ] = options.install.split('_');
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
  console.log('# run via ', options.run);
  const cwd = process.cwd();
  const { execFile } = require('child_process');
  
  const child = execFile(`${process.cwd()}/x.sh`, (e, stdout, __) => {
    if (e) {
      console.error(e);
      // process.exit(1);
    }
    console.log(stdout);
  });
}


if ((options._ && options.length > 0)
    || (options.h || options.help)) {
  console.log(help);
  process.exit(1);
}

console.log('# command line: %s', JSON.stringify(options));

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
