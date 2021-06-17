/*
 * boot.js
 */

const process = require('process');
const argv = process.argv.slice(process.argv.indexOf('--') !== -1
                                ? process.argv.indexOf('--') + 1
                                : 1);
const getopt = require('minimist');
const options = getopt(argv);

const option_vendor = new Map([
  [ 'wechat',  { name: 'wechat',  ver: '1.05.2105170', } ],
  [ 'alipay',  { name: 'alipay',  ver: '2.0.6', } ],
]);
const option_host = new Map([
  [ 'nw', { name: 'nw', ver: '0.54.0', } ],
]);


const help = [
  "usage: yaddt.sh [options and files]",
  "options:",
  "  -h, --help                              display this help",
  "  --vendor=[wechat,alipay]                default is wechat dev tool",
  "  --host=[nw,electron]                    default is nw.js",
  "  --install                               install mini program dev tool and host",
  "  --run                                   run mini programm dev tool",
  "  --version                               print version and exit",
  "",
  "examples:",
  '  yaddt.sh --run',
  `  yaddt.sh --vendor='${JSON.stringify(option_vendor.get("wechat"))}'  \\`,
  `           --host='${JSON.stringify(option_host.get("wechat"))}'  \\`,
  '           --install',
  `  yaddt.sh --vendor='${JSON.stringify(option_vendor.get("wechat"))}'  \\`,
  `           --host='${JSON.stringify(option_host.get("wechat"))}'  \\`,
  '           --run',
].join("\n");


function download(options, url, path, after) {
  console.log('# try to download %s via %s', url, options);
  const { exec } = require('child_process');
  exec(`curl -sqL -O${url} -o${path}`, after);
}

function install_wechat(options) {
  const fs = require('fs');
  const path = require('path');
  const { execFileSync } = require('child_process');

  console.log('# create nw@%s ...', path.relative(options.cwd, options.hostPath));
  if (fs.existsSync(options.hostPath)) {
    fs.rmdirSync(options.hostPath, { recursive: true });
  }
  fs.mkdirSync(options.hostPath);

  console.log('# create vendor@%s ...', path.relative(options.cwd, options.vendorPath));
  if (fs.existsSync(options.vendorPath)) {
    fs.rmdirSync(options.vendorPath, { recursive: true });
  }
  fs.mkdirSync(options.vendorPath);

  const nw_tgz = `${options.hostRoot}/nwjs-v${options.host.ver}-linux-${process.arch}.tar.gz`;
  if (!fs.existsSync(nw_tgz)) {
    console.log('# download %s ...', nw_tgz);
    process.exit(1);            //!TODO: remove it
  }

  console.log('# extract %s@%s ...', path.relative(options.cwd, nw_tgz), path.relative(options.cwd, options.hostPath));
  const tar_argv = ['xvfz', nw_tgz, `--directory=${options.hostPath}`, '--strip-components=1'];
  execFileSync('tar', tar_argv);

  const vendor_exe = `${options.vendorRoot}/wechat_devtools_${options.vendor.ver}_${options.arch}.exe`;
  console.log('# extract %s@%s ...', path.relative(options.cwd, vendor_exe), path.relative(options.cwd, options.vendorPath));
  const z7_argv = ['x', `-o${options.vendorPath}/`, `${vendor_exe}`, '-y'];
  execFileSync('7z', z7_argv);

  // decorate package.json
  const package_json = `${options.vendorPath}/code/package.nw/package.json`;
  const dev = 'wechat-dev';
  console.log('# decorate %s ...', package_json);
  fs.writeFileSync(package_json, fs.readFileSync(package_json, 'utf8').replace(/微信开发者工具/gim, dev), { encoding: 'utf8' });

  // rename
  const dev_exe = `${options.vendorPath}/${dev}.exe`;
  console.log('# rename to %s', path.relative(options.cwd, dev_exe));
  fs.copyFileSync(`${options.vendorPath}/微信开发者工具.exe`, dev_exe, fs.constants.COPYFILE_FICLONE);

  // decorate cli/index.js
  const dir_package_nw = `${options.vendorPath}/code/package.nw`;
  const cli_index_js = `${dir_package_nw}/js/common/cli/index.js`;
  fs.writeFileSync(cli_index_js,
                   fs.readFileSync(cli_index_js, 'utf8')
                   .replace(/USERPROFILE/gm, 'HOME')
                   .replace(/AppData\/Local\/\$\{global.userDirName\}\/User Data/gm, '.config/${global.userDirName}'),
                   { encoding: 'utf8' });

  // link package.nw

  const ln_package_nw = `${options.hostPath}/package.nw`;
  console.log('# link %s@%s ...', path.relative(options.cwd, dir_package_nw), path.relative(options.cwd, ln_package_nw));
  if (fs.existsSync(ln_package_nw)) {
    fs.unlinkSync(ln_package_nw);
  }
  fs.symlinkSync(dir_package_nw, ln_package_nw);

  // link node
  const ln_node = `${options.hostPath}/node`;
  const ln_node_exe = `${options.hostPath}/node.exe`;
  console.log('# link %s@%s ...', path.relative(options.cwd, ln_node), process.execPath);
  if (fs.existsSync(ln_node)) {
    fs.unlinkSync(ln_node);
  }
  fs.symlinkSync(process.execPath, ln_node);
  console.log('# link %s@%s ...', path.relative(options.cwd, ln_node_exe), process.execPath);
  if (fs.existsSync(ln_node_exe)) {
    fs.unlinkSync(ln_node_exe);
  }
  fs.symlinkSync(process.execPath, ln_node_exe);

  const locale_dir = `${options.hostPath}/locales/`;
  console.log('# clean unused locales@%s ...', path.relative(options.cwd, locale_dir));
  const locales = fs.readdirSync(locale_dir);
  for (const f of locales) {
    if (!f.match(/(^zh\-CN.*)|(^en\-US.*)/)) {
      fs.unlinkSync(`${locale_dir}/${f}`);
    }
  }
}

function install(options) {
  const fs = require('fs');
  const path = require('path');

  console.log('# install ...');

  console.log('# create nw@%s ...', path.relative(options.cwd, options.box));
  if (fs.existsSync(options.box)) {
    fs.rmdirSync(options.box, { recursive: true });
  }
  fs.mkdirSync(options.box);

  if ('wechat' === options.vendor.name) {
    install_wechat(options);
    return;
  }
}

function run_wechat(options) {
  const nw = `${options.hostPath}/nw`;
  const ext = `${options.hostPath}/package.nw/js/ideplugin`;
  process.env['LANG'] = 'zh_CN.UTF-8';
  process.env['APPDATA'] = options.hostPath;
  process.env['PATH'] = `${options.hostPath}:${process.env['PATH']}`;

  const argv = [ '--disable-gpu', `--load-extension=${ext}` ];
  console.log('# %s %s', nw, argv.join(' '));

  const { execFile } = require('child_process');
  execFile(nw, argv, (e) => {
    if (e) {
      console.error(e);
      process.exit(1);
    }
  });
}

function run(options) {
  console.log('# run %s@%s ...', options.vendor.name, options.host.name);

  if ('wechat' === options.vendor.name) {
    run_wechat(options);
    return;
  }
}


if ((options._ && options.length > 0)
    || (options.h || options.help)) {
  console.log(help);
  process.exit(1);
}

// boot option:
{
  options.cwd = process.cwd();
  options.arch = process.arch;
}

// vendor option:
{
  const opt = typeof(options.vendor) === 'string'
        ? JSON.parse(options.vendor)
        : options.vendor || '';
  options.vendor = {
    name: opt && opt.name || 'wechat',
    ver: opt && opt.ver || option_vendor.get('wechat').ver,
  };
  options.vendorRoot = `${options.cwd}/vendor/${options.vendor.name}`;
  options.box = `${options.cwd}/box/${options.vendor.name}`;
  options.vendorPath = `${options.box}/v`;
}

// host option:
{
  const opt = typeof(options.host) === 'string'
        ? JSON.parse(options.host)
        : options.host || '';
  const h = {
    name: opt.host && opt.host.name || 'nw',
    ver: opt.host && opt.host.ver || option_host.get('nw').ver,
  };
  options.host = h;
  options.hostRoot = `${options.cwd}/host/${options.host.name}`;
  options.hostPath = `${options.box}/h`;
}


console.log('# command line: %s', JSON.stringify(options, null, 2));

// install
if (options.install) {
  install(options);
  process.exit(0);
}

// run
if (options.run) {
  run(options);
  process.exit(0);
}

// exit
console.log(help);
process.exit(1);



/* eof */
